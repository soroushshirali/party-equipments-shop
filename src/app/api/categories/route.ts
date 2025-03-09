import { NextResponse } from 'next/server';
import mongoose, { HydratedDocument } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

interface CategoryDocument extends mongoose.Document {
  groupTitle: string;
  groupBorderColor: string;
  items: Array<{
    title: string;
    categoryId: string;
    image: string;
  }>;
  createdAt: Date;
}

// Define Category schema
const CategorySchema = new mongoose.Schema({
  groupTitle: {
    type: String,
    required: [true, 'Group title is required']
  },
  groupBorderColor: {
    type: String,
    required: [true, 'Group border color is required']
  },
  items: [{
    title: String,
    categoryId: String,
    image: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Delete any existing model to prevent schema mismatch
if (mongoose.models.Category) {
  delete mongoose.models.Category;
}

// Create the model
const Category = mongoose.model<CategoryDocument>('Category', CategorySchema);

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find({}).lean();
    
    // Transform MongoDB _id to id for frontend compatibility
    const transformedCategories = categories.map(cat => ({
      id: (cat as any)._id.toString(),
      groupTitle: cat.groupTitle,
      groupBorderColor: cat.groupBorderColor,
      items: cat.items || []
    }));
    
    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('Starting POST request to /api/categories');
    
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
    if (!data.groupTitle) {
      console.log('Validation failed: groupTitle is required');
      return NextResponse.json({ 
        error: 'Validation failed',
        details: 'Group title is required'
      }, { status: 400 });
    }

    try {
      // Create new category
      const categoryData = {
        groupTitle: data.groupTitle,
        groupBorderColor: data.groupBorderColor || '#000000',
        items: Array.isArray(data.items) ? data.items : []
      };
      
      console.log('Creating new category with data:', categoryData);
      const category = new Category(categoryData);

      const savedCategory = await category.save();
      console.log('Category saved successfully:', savedCategory);
      
      // Transform for frontend
      const transformedCategory = {
        id: (savedCategory as any)._id.toString(),
        groupTitle: savedCategory.groupTitle,
        groupBorderColor: savedCategory.groupBorderColor,
        items: savedCategory.items || []
      };

      console.log('Returning transformed category:', transformedCategory);
      return NextResponse.json(transformedCategory);
    } catch (saveError) {
      console.error('Error saving category:', saveError);
      return NextResponse.json({ 
        error: 'Database operation failed',
        details: saveError instanceof Error ? saveError.message : 'Failed to save category'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error in POST /api/categories:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
} 