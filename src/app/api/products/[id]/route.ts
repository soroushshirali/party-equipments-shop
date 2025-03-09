import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

// Get the Product model from the main route file
const Product = mongoose.models.Product;

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.price || !data.categoryId || !data.categoryTitle) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: 'Name, price, categoryId, and categoryTitle are required'
      }, { status: 400 });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      {
        name: data.name,
        price: data.price,
        image: data.image,
        originalImage: data.originalImage,
        categoryId: data.categoryId,
        categoryTitle: data.categoryTitle,
        description: data.description,
        specs: data.specs || {},
        quantity: data.quantity || 0
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const transformedProduct = {
      id: updatedProduct._id.toString(),
      name: updatedProduct.name,
      price: updatedProduct.price,
      image: updatedProduct.image,
      originalImage: updatedProduct.originalImage,
      categoryId: updatedProduct.categoryId,
      categoryTitle: updatedProduct.categoryTitle,
      description: updatedProduct.description,
      specs: updatedProduct.specs,
      quantity: updatedProduct.quantity
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ 
      error: 'Failed to update product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const deletedProduct = await Product.findByIdAndDelete(params.id);
    
    if (!deletedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ 
      error: 'Failed to delete product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 