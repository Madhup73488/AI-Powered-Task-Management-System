import { NextResponse } from 'next/server';
import { sendRegistrationConfirmationEmail } from '@/lib/brevo/emailService';

export async function GET() {
  try {
    // Replace with a real email address for testing
    const testEmail = 'madhup73488@gmail.com'; // Ensure this is a valid email for testing
    const testName = 'Test User';
    const testVerificationLink = 'http://localhost:3000/auth/verify?token=testtoken123';

    console.log('Test Email:', testEmail); // Log the email before sending

    const result = await sendRegistrationConfirmationEmail(
      testEmail,
      testName,
      testVerificationLink
    );

    if (result.success) {
      return NextResponse.json({ message: 'Test email sent successfully!', data: result.data }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Failed to send test email.', error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in test-email API route:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.', error: error }, { status: 500 });
  }
}
