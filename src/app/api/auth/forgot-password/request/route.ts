import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();

    // Validate input
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'شماره تلفن الزامی است' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find user
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return NextResponse.json(
        { error: 'کاربری با این شماره تلفن یافت نشد' },
        { status: 404 }
      );
    }

    // In a real application, you would send an SMS with a verification code
    // For now, we'll just return success and use a fixed code (1234) for testing
    
    return NextResponse.json(
      { message: 'کد تایید ارسال شد' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Forgot password request error:', error);
    return NextResponse.json(
      { error: 'خطا در ارسال کد تایید. لطفاً دوباره تلاش کنید' },
      { status: 500 }
    );
  }
} 