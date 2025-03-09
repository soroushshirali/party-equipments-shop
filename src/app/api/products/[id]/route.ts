import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

// Define Product schema (same as in products/route.ts)
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  image: {
    type: String,
    required: [true, 'Image URL is required']
  },
  originalImage: {
    type: String,
    required: [true, 'Original image URL is required']
  },
  categoryId: {
    type: String,
    required: [true, 'Category ID is required']
  },
  categoryTitle: {
    type: String,
    required: [true, 'Category title is required']
  },
  description: String,
  specs: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  quantity: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Get or create the Product model
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    const product = await Product.findById(params.id).lean();
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Transform for frontend
    const transformedProduct = {
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      image: product.image,
      originalImage: product.originalImage,
      categoryId: product.categoryId,
      categoryTitle: product.categoryTitle,
      description: product.description,
      specs: product.specs,
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