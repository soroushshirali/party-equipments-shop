import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Get the Category model dynamically to avoid issues with Next.js
const getCategoryModel = async () => {
  await connectToDatabase();
  
  // Define the schema if it doesn't exist
  if (!mongoose.models.Category) {
    const categorySchema = new mongoose.Schema({
      groupTitle: String,
      groupBorderColor: String,
      items: [{
        categoryId: String,
        title: String,
        image: String
      }]
    }, { timestamps: true });
    
    return mongoose.model('Category', categorySchema);
  }
  
  return mongoose.models.Category;
};

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = params.id;
    const { title, image } = await request.json();
    
    // Validate input
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    // Connect to database and get model
    const Category = await getCategoryModel();
    
    // Find the category
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Create new item
    const newItem = {
      categoryId: uuidv4(),
      title,
      image: image || ''
    };
    
    // Add item to category
    category.items.push(newItem);
    await category.save();
    
    return NextResponse.json(newItem);
  } catch (error) {
    console.error('Error adding category item:', error);
    return NextResponse.json(
      { error: 'Error adding category item' },
      { status: 500 }
    );
  }
} 