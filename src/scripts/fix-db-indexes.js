// This script will fix the MongoDB collection by dropping the problematic email index
// Run this script with: node -r dotenv/config src/scripts/fix-db-indexes.js

const mongoose = require('mongoose');

async function fixDatabaseIndexes() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/party-equipment-shop';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // List all indexes
    console.log('Current indexes:');
    const indexes = await usersCollection.indexes();
    console.log(indexes);
    
    // Drop the email index if it exists
    const emailIndex = indexes.find(index => 
      index.key && index.key.email !== undefined
    );
    
    if (emailIndex) {
      console.log('Found email index, dropping it...');
      await usersCollection.dropIndex(emailIndex.name);
      console.log('Email index dropped successfully');
    } else {
      console.log('No email index found');
    }
    
    // Create the phoneNumber index
    console.log('Creating phoneNumber index...');
    await usersCollection.createIndex({ phoneNumber: 1 }, { unique: true });
    console.log('PhoneNumber index created successfully');
    
    // List indexes again to confirm changes
    console.log('Updated indexes:');
    const updatedIndexes = await usersCollection.indexes();
    console.log(updatedIndexes);
    
    console.log('Database indexes fixed successfully');
  } catch (error) {
    console.error('Error fixing database indexes:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
fixDatabaseIndexes(); 