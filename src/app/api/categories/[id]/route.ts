import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

// Define Category schema (same as in categories/route.ts)
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

// Get or create the Category model
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    console.log('Fetching category with ID:', params.id);
    
    const category = await Category.findById(params.id).lean();
    
    if (!category) {
      console.log('Category not found');
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    // Transform for frontend
    const transformedCategory = {
      id: category._id.toString(),
      groupTitle: category.groupTitle,
      groupBorderColor: category.groupBorderColor,
      items: category.items || []
    };
    
    console.log('Returning category:', transformedCategory);
    return NextResponse.json(transformedCategory);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch category',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    await connectToDatabase();
    
    const category = await Category.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).lean();
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    const category = await Category.findByIdAndDelete(params.id);
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
} 