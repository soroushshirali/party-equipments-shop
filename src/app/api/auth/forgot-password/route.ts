import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import bcrypt from 'bcryptjs';

// Function to normalize phone numbers
function normalizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/\s+/g, '').replace(/-/g, '').trim();
}

export async function POST(req: Request) {
  try {
    const { phoneNumber: rawPhoneNumber, newPassword, verificationCode } = await req.json();
    
    // Normalize the phone number
    const phoneNumber = normalizePhoneNumber(rawPhoneNumber);
    
    console.log('Forgot password request:', { 
      rawPhoneNumber, 
      normalizedPhoneNumber: phoneNumber 
    });

    // Validate input
    if (!phoneNumber || !newPassword || !verificationCode) {
      return NextResponse.json(
        { error: 'لطفاً تمام فیلدها را پر کنید' },
        { status: 400 }
      );
    }

    // Validate password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find user
    const user = await User.findOne({ phoneNumber });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return NextResponse.json(
        { error: 'کاربری با این شماره تلفن یافت نشد' },
        { status: 404 }
      );
    }

    // TODO: Verify the verification code
    // This is where you would verify the SMS code
    // For now, we'll use a dummy verification (1234)
    if (verificationCode !== '1234') {
      return NextResponse.json(
        { error: 'کد تایید نامعتبر است' },
        { status: 400 }
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json(
      { message: 'رمز عبور با موفقیت تغییر کرد' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'خطا در تغییر رمز عبور. لطفاً دوباره تلاش کنید' },
      { status: 500 }
    );
  }
} 