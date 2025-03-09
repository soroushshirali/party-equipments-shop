import { NextResponse } from 'next/server';
import mongoose, { HydratedDocument } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

interface ProductDocument extends mongoose.Document {
  name: string;
  price: number;
  image: string;
  originalImage: string;
  categoryId: string;
  categoryTitle: string;
  description?: string;
  specs: {
    [key: string]: string | number;
  };
  quantity?: number;
  createdAt: Date;
}

// Define Product schema
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

// Delete any existing model to prevent schema mismatch
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

// Create the model
const Product = mongoose.model<ProductDocument>('Product', ProductSchema);

export async function GET() {
  try {
    await connectToDatabase();
    const products = await Product.find({}).lean();
    
    // Transform MongoDB _id to id for frontend compatibility
    const transformedProducts = products.map(product => ({
      id: (product as any)._id.toString(),
      name: product.name,
      price: product.price,
      image: product.image,
      originalImage: product.originalImage,
      categoryId: product.categoryId,
      categoryTitle: product.categoryTitle,
      description: product.description,
      specs: product.specs,
      quantity: product.quantity
    }));
    
    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('Starting POST request to /api/products');
    
    let connection;
    try {
      connection = await connectToDatabase();
      console.log('Database connection established');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown connection error'
      }, { status: 500 });
    }

    let data;
    try {
      data = await request.json();
      console.log('Request data parsed:', data);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: 'Failed to parse request body as JSON'
      }, { status: 400 });
    }

    // Validate required fields
    if (!data.name || !data.price || !data.categoryId || !data.categoryTitle) {
      console.log('Validation failed: Missing required fields');
      return NextResponse.json({ 
        error: 'Validation failed',
        details: 'Name, price, categoryId, and categoryTitle are required'
      }, { status: 400 });
    }

    try {
      // Create new product
      const productData = {
        name: data.name,
        price: data.price,
        image: data.image || '',
        originalImage: data.originalImage || '',
        categoryId: data.categoryId,
        categoryTitle: data.categoryTitle,
        description: data.description,
        specs: data.specs || {},
        quantity: data.quantity || 0
      };
      
      console.log('Creating new product with data:', productData);
      const product = new Product(productData);

      const savedProduct = await product.save();
      console.log('Product saved successfully:', savedProduct);
      
      // Transform for frontend
      const transformedProduct = {
        id: (savedProduct as any)._id.toString(),
        ...productData
      };

      console.log('Returning transformed product:', transformedProduct);
      return NextResponse.json(transformedProduct);
    } catch (saveError) {
      console.error('Error saving product:', saveError);
      return NextResponse.json({ 
        error: 'Database operation failed',
        details: saveError instanceof Error ? saveError.message : 'Failed to save product'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error in POST /api/products:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
} 