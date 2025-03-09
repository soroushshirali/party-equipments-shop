import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Image } from '@/lib/models/Image';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Connect to database
    await connectToDatabase();

    // Find the image by ID
    const image = await Image.findById(id);

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Create a response with the image data
    const response = new NextResponse(image.data);
    
    // Set appropriate headers
    response.headers.set('Content-Type', image.contentType);
    response.headers.set('Content-Disposition', `inline; filename="${image.filename}"`);
    response.headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    return response;
  } catch (error) {
    console.error('Error retrieving image:', error);
    return NextResponse.json(
      { error: 'Error retrieving image' },
      { status: 500 }
    );
  }
} 