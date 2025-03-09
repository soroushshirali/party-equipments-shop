import mongoose from 'mongoose';

// Ensure MONGODB_URI is always treated as a string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/party-equipment-shop';

if (!MONGODB_URI) {
  throw new Error('The MONGODB_URI environment variable must be defined');
}

// TypeScript declaration for global mongoose cache
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

// Initialize global mongoose cache
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

let cached = global.mongoose;

async function connectToDatabase() {
  try {
    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4, skip trying IPv6
      };

      mongoose.set('strictQuery', true);

      console.log('Initializing new database connection');
      cached.promise = mongoose
        .connect(MONGODB_URI, opts)
        .then((mongoose) => {
          console.log('Connected to MongoDB');
          mongoose.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
          });
          mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            cached.conn = null;
            cached.promise = null;
          });
          return mongoose;
        })
        .catch((error) => {
          console.error('Failed to connect to MongoDB:', error);
          cached.promise = null;
          throw error;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('Connection error:', error);
    cached.promise = null;
    throw error;
  }
}

export { connectToDatabase }; 