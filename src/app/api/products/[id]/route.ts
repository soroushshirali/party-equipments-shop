import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/lib/models/Product';
import { Image } from '@/lib/models/Image';
import mongoose from 'mongoose';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const product = await Product.findById(new mongoose.Types.ObjectId(params.id)).lean();
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Transform for frontend
    const transformedProduct = {
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      categoryId: product.categoryId,
      category: product.category,
      quantity: product.quantity
    };
    
    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const data = await request.json();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    // Validate required fields
    if (!data.name || !data.price || !data.categoryId) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: 'Name, price, and categoryId are required'
      }, { status: 400 });
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      new mongoose.Types.ObjectId(params.id),
      {
        name: data.name,
        price: data.price,
        image: data.image,
        description: data.description,
        categoryId: data.categoryId,
        category: {
          id: data.categoryId,
          title: data.category?.title || ''
        },
        quantity: data.quantity || 0
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const transformedProduct = {
      id: updatedProduct._id.toString(),
      name: updatedProduct.name,
      price: updatedProduct.price,
      image: updatedProduct.image,
      description: updatedProduct.description,
      categoryId: updatedProduct.categoryId,
      category: updatedProduct.category,
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

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const deletedProduct = await Product.findByIdAndDelete(new mongoose.Types.ObjectId(params.id));
    
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