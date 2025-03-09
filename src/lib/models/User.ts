import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface UserDocument extends mongoose.Document {
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Delete the existing User model if it exists
// This is necessary because we're changing the schema
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    phoneNumber: {
      type: String,
      required: [true, 'شماره تلفن الزامی است'],
      unique: true,
      trim: true,
      set: (value: string) => {
        // Normalize phone number by removing spaces, dashes, etc.
        return value.replace(/\s+/g, '').replace(/-/g, '').trim();
      }
    },
    password: {
      type: String,
      required: [true, 'رمز عبور الزامی است'],
      minlength: [6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'],
    },
    firstName: {
      type: String,
      required: [true, 'نام الزامی است'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'نام خانوادگی الزامی است'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Create the model
export const User = mongoose.model<UserDocument>('User', userSchema);

// This will help ensure we drop any existing indexes that might cause problems
// We need to do this in a try/catch because it might fail if the collection doesn't exist yet
try {
  // This is an async operation but we're not awaiting it because we just want to trigger it
  User.collection.dropIndexes().then(() => {
    console.log('Dropped all indexes from User collection');
  }).catch(err => {
    console.log('Error dropping indexes (this is normal if collection is new):', err.message);
  });
} catch (error) {
  console.log('Error accessing User collection (this is normal if DB is not connected yet)');
} 