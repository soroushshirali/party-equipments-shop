import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import axios from 'axios';

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
    
    // If a new image is provided and the item already has an image, delete the old image
    if (image && category.items[itemIndex].image && category.items[itemIndex].image !== image) {
      const oldImageUrl = category.items[itemIndex].image;
      if (oldImageUrl && oldImageUrl.startsWith('/api/images/')) {
        try {
          const imageId = oldImageUrl.split('/').pop();
          console.log(`Deleting old image with ID: ${imageId}`);
          await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/images/${imageId}`);
        } catch (imageError) {
          console.error('Error deleting old image:', imageError);
          // Continue with update even if image deletion fails
        }
      }
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
    
    // Find the item to get its image URL before removing it
    const item = category.items.find(item => item.categoryId === itemId);
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    // Check if there are any products using this category item
    try {
      // Dynamically import the Product model to avoid the import error
      const { Product } = await import('@/lib/models/Product');
      
      if (Product) {
        const productsWithCategory = await Product.find({ 
          $or: [
            { categoryId: itemId },
            { 'category.id': itemId }
          ]
        });
        
        if (productsWithCategory.length > 0) {
          return NextResponse.json({ 
            error: 'این دسته‌بندی دارای محصولات مرتبط است. ابتدا باید محصولات مرتبط را حذف کنید.' 
          }, { status: 400 });
        }
      }
    } catch (importError) {
      console.error('Error importing Product model:', importError);
      // Continue with deletion even if Product model is not available
    }
    
    // If the item has an image, delete it from the database
    if (item.image && item.image.startsWith('/api/images/')) {
      try {
        const imageId = item.image.split('/').pop();
        console.log(`Deleting image with ID: ${imageId}`);
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/images/${imageId}`);
      } catch (imageError) {
        console.error('Error deleting image:', imageError);
        // Continue with item deletion even if image deletion fails
      }
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