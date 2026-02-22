const { MongoClient } = require('mongodb');

// Connection URL
const url = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const dbName = 'fleetTracking';

// Create a new MongoClient
const client = new MongoClient(url);

async function connectToDatabase() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log('Connected successfully to MongoDB');

    const db = client.db(dbName);
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

async function closeConnection() {
  await client.close();
  console.log('Connection closed');
}

module.exports = {
  connectToDatabase,
  closeConnection
};
