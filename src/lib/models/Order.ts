import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: [true, 'Product ID is required']
  },
  productName: {
    type: String,
    required: [true, 'Product name is required']
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
});

const OrderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  userPhoneNumber: {
    type: String,
    required: [true, 'شماره تلفن کاربر الزامی است'],
    validate: {
      validator: function(v: string) {
        return /^09[0-9]{9}$/.test(v);
      },
      message: props => `${props.value} یک شماره تلفن معتبر نیست`
    }
  },
  userName: {
    type: String,
    required: [true, 'نام کاربر الزامی است']
  },
  items: {
    type: [OrderItemSchema],
    required: [true, 'اقلام سفارش الزامی است'],
    validate: {
      validator: function(items: any[]) {
        return items.length > 0;
      },
      message: 'سفارش باید حداقل یک قلم داشته باشد'
    }
  },
  total: {
    type: Number,
    required: [true, 'مبلغ کل الزامی است'],
    min: [0, 'مبلغ کل نمی‌تواند منفی باشد']
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

export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema); 