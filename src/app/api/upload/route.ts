import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '@/lib/mongodb';
import { Image } from '@/lib/models/Image';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Generate a unique filename
    const fileExtension = image.name.split('.').pop() || 'jpg';
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    // Convert the file to a Buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Store the image in MongoDB
    const newImage = new Image({
      filename: fileName,
      contentType: image.type,
      data: buffer
    });

    await newImage.save();

    // Return the URL to access the image
    const url = `/api/images/${newImage._id}`;
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
} 