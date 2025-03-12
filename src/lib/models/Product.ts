import mongoose from 'mongoose';

export interface ProductDocument extends mongoose.Document {
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  category: {
    id: string;
    title: string;
  };
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

// Delete the existing Product model if it exists
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

const productSchema = new mongoose.Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'نام محصول الزامی است'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'توضیحات محصول الزامی است'],
    },
    price: {
      type: Number,
      required: [true, 'قیمت محصول الزامی است'],
      min: [0, 'قیمت نمی‌تواند منفی باشد'],
    },
    image: {
      type: String,
    },
    categoryId: {
      type: String,
      required: [true, 'دسته‌بندی محصول الزامی است'],
    },
    category: {
      id: String,
      title: String,
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'موجودی نمی‌تواند منفی باشد'],
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model<ProductDocument>('Product', productSchema); 