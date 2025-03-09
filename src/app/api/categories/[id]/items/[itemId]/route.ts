import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

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

export async function PUT(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const categoryId = params.id;
    const itemId = params.itemId;
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
    
    // Find the item index
    const itemIndex = category.items.findIndex(item => item.categoryId === itemId);
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    // Update the item
    category.items[itemIndex].title = title;
    if (image) {
      category.items[itemIndex].image = image;
    }
    
    await category.save();
    
    return NextResponse.json(category.items[itemIndex]);
  } catch (error) {
    console.error('Error updating category item:', error);
    return NextResponse.json(
      { error: 'Error updating category item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const categoryId = params.id;
    const itemId = params.itemId;
    
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
    
    // Filter out the item
    const originalLength = category.items.length;
    category.items = category.items.filter(item => item.categoryId !== itemId);
    
    // Check if item was found
    if (category.items.length === originalLength) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    await category.save();
    
    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting category item:', error);
    return NextResponse.json(
      { error: 'Error deleting category item' },
      { status: 500 }
    );
  }
} 