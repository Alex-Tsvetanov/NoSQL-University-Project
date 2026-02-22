const { MongoClient } = require('mongodb');
const { connectToDatabase, closeConnection } = require('../src/database');

describe('Database Connection', () => {
  let client;

  beforeAll(async () => {
    client = new MongoClient(process.env.MONGODB_URL || 'mongodb://localhost:27017');
    await client.connect();
  });

  afterAll(async () => {
    await client.close();
  });

  test('should connect to database successfully', async () => {
    const db = await connectToDatabase();
    expect(db).toBeDefined();
    expect(db.databaseName).toBe('fleetTracking');
  });

  test('should close connection successfully', async () => {
    await closeConnection();
    // Connection should be closed
  });
});
