import { db } from './db';
import { otpVerifications } from '../shared/schema';
import { eq, and, gt } from 'drizzle-orm';

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

// Send OTP via SMS (mock implementation - integrate with Twilio, SNS, etc.)
export async function sendOTP(phone: string, otp: string): Promise<boolean> {
  try {
    // TODO: Integrate with SMS service like Twilio
    console.log(`📱 Sending OTP to ${phone}: ${otp}`);
    
    // For development, just log it
    // In production, use:
    // await twilioClient.messages.create({
    //   body: `Your Farm Connect verification code is: ${otp}`,
    //   to: phone,
    //   from: process.env.TWILIO_PHONE_NUMBER
    // });
    
    return true;
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
