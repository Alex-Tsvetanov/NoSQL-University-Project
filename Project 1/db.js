const { MongoClient } = require('mongodb');

// Connection URI
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

// Database Name
const dbName = 'edtech_analytics';

// Create a new MongoClient
const client = new MongoClient(uri);

let db;

/**
 * Connects to MongoDB and returns the database instance.
 * This function establishes a connection to the MongoDB database.
 * It uses the native MongoDB driver without any ODM like Mongoose.
 * 
 * @returns {Promise<Db>} The MongoDB database instance
 * @throws {Error} If connection fails
 */
async function connectToDatabase() {
    try {
        // Connect the client to the server
        await client.connect();
        console.log('Connected successfully to MongoDB');

        // Get the database
        db = client.db(dbName);
        return db;
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}

/**
 * Returns the database instance. Must be called after connectToDatabase.
 * 
 * @returns {Db} The MongoDB database instance
 */
function getDatabase() {
    if (!db) {
        throw new Error('Database not connected. Call connectToDatabase first.');
    }
    return db;
}

/**
 * Closes the MongoDB connection.
 * Should be called when the application shuts down.
 */
async function closeConnection() {
    await client.close();
    console.log('MongoDB connection closed');
}

module.exports = {
    connectToDatabase,
    getDatabase,
    closeConnection
};
