import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/models/user';

export async function POST(request) {
  try {
    console.log('Starting user registration...');
    await connectDB();
    console.log('Database connection established');
    
    const { name, email, password } = await request.json();
    console.log('Received registration data:', { name, email });

    // Validate input
    if (!name || !email || !password) {
      console.warn('Missing registration fields');
      return NextResponse.json(
        { success: false, error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    const lowercaseEmail = email.toLowerCase();

    // Check if user exists
    const existingUser = await User.findOne({ email: lowercaseEmail });
    if (existingUser) {
      console.warn('User already exists:', lowercaseEmail);
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email: lowercaseEmail,
      password: hashedPassword,
      role: 'user'
    });
    console.log('User created successfully:', user._id);

    // Create token
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    // Create the response
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error creating user', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
