import mongoose from 'mongoose';

export interface ImageDocument extends mongoose.Document {
  filename: string;
  contentType: string;
  data: Buffer;
  createdAt: Date;
}

// Delete the existing Image model if it exists
if (mongoose.models.Image) {
  delete mongoose.models.Image;
}

const imageSchema = new mongoose.Schema<ImageDocument>(
  {
    filename: {
      type: String,
      required: true
    },
    contentType: {
      type: String,
      required: true
    },
    data: {
      type: Buffer,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const Image = mongoose.model<ImageDocument>('Image', imageSchema); 