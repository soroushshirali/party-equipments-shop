import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface OrderDocument extends mongoose.Document {
  userId: string;
  userPhoneNumber: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: Date;
}

const OrderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  userPhoneNumber: {
    type: String,
    required: [true, 'User phone number is required']
  },
  items: [{
    productId: {
      type: String,
      required: [true, 'Product ID is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    }
  }],
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Delete any existing model to prevent schema mismatch
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

// Create the model
const Order = mongoose.model<OrderDocument>('Order', OrderSchema);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    await connectToDatabase();
    
    const query = userId ? { userId } : {};
    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    const transformedOrders = orders.map(order => ({
      id: order._id.toString(),
      userId: order.userId,
      userPhoneNumber: order.userPhoneNumber,
      items: order.items,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt
    }));

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Get session data
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const data = await request.json();

    // Validate products data
    if (!data.products || !Array.isArray(data.products) || data.products.length === 0) {
      return NextResponse.json({
        error: 'Validation failed',
        details: 'Products data is required'
      }, { status: 400 });
    }

    // Calculate total
    const total = data.products.reduce((sum: number, item: any) => {
      return sum + (Number(item.price) * Number(item.quantity || 1));
    }, 0);

    // Create order data
    const orderData = {
      userId: session.user.id,
      userPhoneNumber: session.user.phoneNumber,
      items: data.products,
      total,
      status: 'pending'
    };

    // Create new order
    const order = new Order(orderData);
    const savedOrder = await order.save();

    // Transform for frontend
    const transformedOrder = {
      id: savedOrder._id.toString(),
      userId: savedOrder.userId,
      userPhoneNumber: savedOrder.userPhoneNumber,
      items: savedOrder.items,
      total: savedOrder.total,
      status: savedOrder.status,
      createdAt: savedOrder.createdAt
    };

    return NextResponse.json(transformedOrder);
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({
      error: 'Failed to create order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 