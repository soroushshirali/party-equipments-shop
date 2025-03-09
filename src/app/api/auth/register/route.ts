import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';

// Function to normalize phone numbers
function normalizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/\s+/g, '').replace(/-/g, '').trim();
}

export async function POST(req: Request) {
  try {
    console.log('Starting registration process...');
    const { firstName, lastName, phoneNumber: rawPhoneNumber, password } = await req.json();
    
    // Normalize the phone number
    const phoneNumber = normalizePhoneNumber(rawPhoneNumber);
    
    console.log('Received data:', { 
      firstName, 
      lastName, 
      rawPhoneNumber,
      normalizedPhoneNumber: phoneNumber, 
      passwordLength: password?.length 
    });

    // Validate input
    if (!firstName || !lastName || !phoneNumber || !password) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'لطفاً تمام فیلدها را پر کنید' },
        { status: 400 }
      );
    }

    // Connect to database
    console.log('Connecting to database...');
    const db = await connectToDatabase();
    console.log('Database connection successful');

    // Check if user already exists
    console.log('Checking for existing user with phone number:', phoneNumber);
    const existingUser = await User.findOne({ phoneNumber });
    console.log('Existing user check result:', existingUser ? 'Found user' : 'No user found');
    
    if (existingUser) {
      console.log('User already exists with phone number:', phoneNumber);
      console.log('Existing user details:', {
        id: existingUser._id,
        phoneNumber: existingUser.phoneNumber,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName
      });
      return NextResponse.json(
        { error: 'این شماره تلفن قبلاً ثبت شده است' },
        { status: 400 }
      );
    }

    // Create new user
    console.log('Creating new user...');
    const user = await User.create({
      firstName,
      lastName,
      phoneNumber,
      password,
      role: 'user' // Default role
    });
    console.log('User created successfully:', user._id);

    // Remove password from response
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      role: user.role
    };

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyValue);
      return NextResponse.json(
        { error: 'این شماره تلفن قبلاً ثبت شده است' },
        { status: 400 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'خطا در ثبت نام. لطفاً دوباره تلاش کنید' },
      { status: 500 }
    );
  }
} 