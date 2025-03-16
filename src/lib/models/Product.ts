import mongoose from 'mongoose';

export interface ProductDocument extends mongoose.Document {
  name: string;
  description: string;
  price: number;
  image: string;
  originalImage: string;
  categoryId: string;
  category: {
    id: string;
    title: string;
  };
  quantity: number;
  specs: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
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
    originalImage: {
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
    specs: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
      weight: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model<ProductDocument>('Product', productSchema); 