import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper function to check admin status
async function isAdmin(session: any) {
  return session?.user?.role === 'admin';
}

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(await isAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: order._id.toString(),
      userId: order.userId,
      userPhoneNumber: order.userPhoneNumber,
      userName: order.userName,
      items: order.items,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt
    });
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
} 