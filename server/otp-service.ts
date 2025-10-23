import { neonDb as db } from '../src/lib/neon';
import { otpVerifications } from '../shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import twilio from 'twilio';

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP in database
export async function createOTP(phone: string): Promise<string> {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  await db.insert(otpVerifications).values({
    phone,
    otp,
    expiresAt,
    verified: false,
    attempts: 0,
  });

  return otp;
}

// Verify OTP
export async function verifyOTP(phone: string, otp: string): Promise<boolean> {
  const now = new Date();
  
  // Find valid OTP
  const [record] = await db
    .select()
    .from(otpVerifications)
    .where(
      and(
        eq(otpVerifications.phone, phone),
        eq(otpVerifications.otp, otp),
        gt(otpVerifications.expiresAt, now),
        eq(otpVerifications.verified, false)
      )
    )
    .limit(1);

  if (!record) {
    return false;
  }

  // Mark as verified
  await db
    .update(otpVerifications)
    .set({ verified: true })
    .where(eq(otpVerifications.id, record.id));

  return true;
}

// Initialize Twilio client
let twilioClient: twilio.Twilio | null = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_MESSAGE_SERVICE_SID) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  console.log('✅ Twilio SMS service initialized');
} else {
  console.warn('⚠️ Twilio credentials not found. SMS sending will be simulated.');
}

// Send OTP via SMS
export async function sendOTP(phone: string, otp: string): Promise<boolean> {
  try {
    // If Twilio is configured, send real SMS
    if (twilioClient && process.env.TWILIO_MESSAGE_SERVICE_SID) {
      const message = await twilioClient.messages.create({
        body: `Your Farm Connect verification code is: ${otp}. Valid for 10 minutes.`,
        to: phone,
        messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE_SID
      });
      
      console.log(`✅ SMS sent to ${phone} (SID: ${message.sid})`);
      return true;
    } else {
      // Development mode - just log the OTP
      console.log(`📱 [DEV MODE] OTP for ${phone}: ${otp}`);
      console.log(`⚠️ To enable real SMS, configure Twilio credentials in .env:`);
      console.log(`   TWILIO_ACCOUNT_SID=your_account_sid`);
      console.log(`   TWILIO_AUTH_TOKEN=your_auth_token`);
      console.log(`   TWILIO_MESSAGE_SERVICE_SID=your_messaging_service_sid`);
      return true;
    }
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return false;
  }
}

// Clean up expired OTPs (run periodically)
export async function cleanupExpiredOTPs(): Promise<void> {
  const now = new Date();
  await db
    .delete(otpVerifications)
    .where(gt(now, otpVerifications.expiresAt));
}
