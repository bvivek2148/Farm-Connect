import twilio from 'twilio';
import { Request, Response } from 'express';
import { storage } from './storage';
import { generateToken, hashPassword, comparePassword } from './auth';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_MESSAGE_SERVICE_SID = process.env.TWILIO_MESSAGE_SERVICE_SID;

let twilioClient: any = null;

/**
 * Initialize Twilio client
 */
export function initializeTwilio() {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.warn('⚠️  Twilio credentials not configured. Skipping Twilio services.');
    return;
  }

  try {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    console.log('✅ Twilio client initialized');
  } catch (error) {
    console.error('❌ Twilio initialization error:', error);
  }
}

/**
 * Generate a random 6-digit OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store OTP temporarily (in production, use Redis or database)
 */
const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

/**
 * Send OTP via SMS to phone number
 * @param phoneNumber - Phone number in E.164 format (+1234567890)
 */
export async function sendPhoneOTP(req: Request, res: Response) {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    if (!twilioClient) {
      return res.status(503).json({
        success: false,
        message: 'Twilio service is not available',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(phoneNumber, {
      code: otp,
      expiresAt,
      attempts: 0,
    });

    // Send SMS via Twilio
    try {
      await twilioClient.messages.create({
        body: `Your Farm Connect OTP is: ${otp}. Valid for 10 minutes.`,
        from: TWILIO_MESSAGE_SERVICE_SID, // Using Messaging Service SID
        to: phoneNumber,
      });

      console.log(`✅ OTP sent to ${phoneNumber}`);

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully to your phone',
        phoneNumber: phoneNumber.replace(/(.{2})(.*)(.{2})/, '$1****$3'), // Masked phone
      });
    } catch (twilioError: any) {
      console.error('❌ Twilio SMS error:', twilioError.message);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
        error: twilioError.message,
      });
    }
  } catch (error: any) {
    console.error('❌ OTP send error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message,
    });
  }
}

/**
 * Verify OTP and authenticate user
 * @param phoneNumber - Phone number in E.164 format
 * @param otp - OTP code to verify
 */
export async function verifyPhoneOTP(req: Request, res: Response) {
  try {
    const { phoneNumber, otp, username, email, firstName, lastName } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required',
      });
    }

    // Check if OTP exists and is valid
    const storedOTP = otpStore.get(phoneNumber);
    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Please request a new OTP.',
      });
    }

    // Check if OTP is expired
    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(phoneNumber);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
      });
    }

    // Check OTP attempts
    if (storedOTP.attempts >= 3) {
      otpStore.delete(phoneNumber);
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please request a new OTP.',
      });
    }

    // Verify OTP
    if (storedOTP.code !== otp) {
      storedOTP.attempts++;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - storedOTP.attempts} attempts remaining.`,
      });
    }

    // OTP verified - remove from store
    otpStore.delete(phoneNumber);

    // Find or create user
    let user = await storage.getUserByEmail(email);

    if (!user) {
      // Create new user
      const hashedPassword = await hashPassword(Math.random().toString(36).substring(2, 15));
      user = await storage.createUser({
        username: username || phoneNumber.substring(1), // Remove + from phone
        email: email || `phone_${phoneNumber}@farmconnect.local`,
        password: hashedPassword,
        firstName: firstName || '',
        lastName: lastName || '',
        role: username?.toLowerCase().includes('farmer') ? 'farmer' : 'customer',
        isVerified: true, // Phone verified
      });
      console.log('✅ Created new user via phone:', user.username);
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified,
    });

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'Phone authentication successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error: any) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message,
    });
  }
}

/**
 * Send SMS notification (for orders, etc.)
 * @param phoneNumber - Recipient phone number
 * @param message - SMS message content
 */
export async function sendSMSNotification(phoneNumber: string, message: string) {
  try {
    if (!twilioClient) {
      console.warn('⚠️  Twilio not available for SMS');
      return false;
    }

    await twilioClient.messages.create({
      body: message,
      from: TWILIO_MESSAGE_SERVICE_SID,
      to: phoneNumber,
    });

    console.log(`✅ SMS sent to ${phoneNumber}`);
    return true;
  } catch (error: any) {
    console.error('❌ SMS notification error:', error);
    return false;
  }
}

/**
 * Send order confirmation SMS
 * @param phoneNumber - Customer phone number
 * @param orderId - Order ID
 * @param total - Order total
 */
export async function sendOrderConfirmationSMS(phoneNumber: string, orderId: string, total: string) {
  const message = `Farm Connect: Your order #${orderId} is confirmed. Total: ${total}. Track: farmconnect.local/orders/${orderId}`;
  return sendSMSNotification(phoneNumber, message);
}

/**
 * Send delivery notification SMS
 * @param phoneNumber - Customer phone number
 * @param orderId - Order ID
 * @param trackingInfo - Tracking information
 */
export async function sendDeliveryNotificationSMS(phoneNumber: string, orderId: string, trackingInfo: string) {
  const message = `Farm Connect: Your order #${orderId} is on its way! Tracking: ${trackingInfo}`;
  return sendSMSNotification(phoneNumber, message);
}

/**
 * Get OTP status (for testing)
 */
export function getOTPStatus(phoneNumber: string) {
  const otp = otpStore.get(phoneNumber);
  if (!otp) {
    return null;
  }
  return {
    expiresAt: new Date(otp.expiresAt),
    attempts: otp.attempts,
    isExpired: Date.now() > otp.expiresAt,
  };
}

// Initialize Twilio on startup
initializeTwilio();

console.log('✅ Twilio service loaded');
