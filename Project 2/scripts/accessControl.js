const { MongoClient } = require('mongodb');

// Connection URL - connect to admin database for user management
const url = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const dbName = 'fleetTracking';

/**
 * Access Control Demonstration
 * This script demonstrates Role-Based Access Control (RBAC) setup for the IoT Fleet Tracking system
 */

// Create roles
async function createRoles(client) {
  console.log('\n=== Creating Roles ===');

  const adminDb = client.db('admin');

  // DataAnalyst role - read-only access to all collections
  const dataAnalystRole = {
    role: 'DataAnalyst',
    privileges: [
      {
        resource: { db: dbName, collection: 'vehicles' },
        actions: ['find']
      },
      {
        resource: { db: dbName, collection: 'shipments' },
        actions: ['find']
      },
      {
        resource: { db: dbName, collection: 'telemetry' },
        actions: ['find']
      }
    ],
    roles: []
  };

  // FleetManager role - full CRUD on shipments and vehicles, read-only on telemetry
  const fleetManagerRole = {
    role: 'FleetManager',
    privileges: [
      {
        resource: { db: dbName, collection: 'vehicles' },
        actions: ['find', 'insert', 'update', 'remove']
      },
      {
        resource: { db: dbName, collection: 'shipments' },
        actions: ['find', 'insert', 'update', 'remove']
      },
      {
        resource: { db: dbName, collection: 'telemetry' },
        actions: ['find']
      }
    ],
    roles: []
  };

  try {
    await adminDb.command({ createRole: dataAnalystRole.role, privileges: dataAnalystRole.privileges, roles: dataAnalystRole.roles });
    console.log('Created DataAnalyst role');

    await adminDb.command({ createRole: fleetManagerRole.role, privileges: fleetManagerRole.privileges, roles: fleetManagerRole.roles });
    console.log('Created FleetManager role');
  } catch (error) {
    if (error.code === 31) { // Role already exists
      console.log('Roles already exist, skipping creation');
    } else {
      throw error;
    }
  }
}

// Create users with roles
async function createUsers(client) {
  console.log('\n=== Creating Users ===');

  const adminDb = client.db('admin');

  // Create DataAnalyst user
  try {
    await adminDb.command({
      createUser: 'data_analyst',
      pwd: 'analyst123',
      roles: [
        { role: 'DataAnalyst', db: dbName }
      ]
    });
    console.log('Created data_analyst user');
  } catch (error) {
    if (error.code === 11000) { // User already exists
      console.log('data_analyst user already exists');
    } else {
      console.log('Error creating data_analyst:', error.message);
    }
  }

  // Create FleetManager user
  try {
    await adminDb.command({
      createUser: 'fleet_manager',
      pwd: 'manager123',
      roles: [
        { role: 'FleetManager', db: dbName }
      ]
    });
    console.log('Created fleet_manager user');
  } catch (error) {
    if (error.code === 11000) { // User already exists
      console.log('fleet_manager user already exists');
    } else {
      console.log('Error creating fleet_manager:', error.message);
    }
  }

  // Create LogisticsApp user (for IoT telemetry ingestion)
  try {
    await adminDb.command({
      createUser: 'logistics_app',
      pwd: 'app123',
      roles: [
        {
          role: 'readWrite',
          db: dbName,
          collection: 'telemetry'
        }
      ]
    });
    console.log('Created logistics_app user (telemetry only)');
  } catch (error) {
    if (error.code === 11000) { // User already exists
      console.log('logistics_app user already exists');
    } else {
      console.log('Error creating logistics_app:', error.message);
    }
  }
}

// Demonstrate access control
async function demonstrateAccessControl() {
  console.log('\n=== Demonstrating Access Control ===');

  // Connect as DataAnalyst
  const dataAnalystClient = new MongoClient(url, {
    auth: {
      username: 'data_analyst',
      password: 'analyst123'
    }
  });

  try {
    await dataAnalystClient.connect();
    const db = dataAnalystClient.db(dbName);

    console.log('Connected as DataAnalyst');

    // Can read vehicles
    const vehicles = await db.collection('vehicles').find({}).limit(2).toArray();
    console.log('DataAnalyst can read vehicles:', vehicles.length, 'records');

    // Can read shipments
    const shipments = await db.collection('shipments').find({}).limit(2).toArray();
    console.log('DataAnalyst can read shipments:', shipments.length, 'records');

    // Can read telemetry
    const telemetry = await db.collection('telemetry').find({}).limit(2).toArray();
    console.log('DataAnalyst can read telemetry:', telemetry.length, 'records');

    // Try to insert (should fail)
    try {
      await db.collection('vehicles').insertOne({ test: 'data' });
      console.log('ERROR: DataAnalyst should not be able to insert!');
    } catch (error) {
      console.log('DataAnalyst correctly denied insert permission:', error.message);
    }

  } catch (error) {
    console.log('Error with DataAnalyst connection:', error.message);
  } finally {
    await dataAnalystClient.close();
  }

  // Connect as FleetManager
  const fleetManagerClient = new MongoClient(url, {
    auth: {
      username: 'fleet_manager',
      password: 'manager123'
    }
  });

  try {
    await fleetManagerClient.connect();
    const db = fleetManagerClient.db(dbName);

    console.log('\nConnected as FleetManager');

    // Can read vehicles
    const vehicles = await db.collection('vehicles').find({}).limit(2).toArray();
    console.log('FleetManager can read vehicles:', vehicles.length, 'records');

    // Can insert into vehicles
    const insertResult = await db.collection('vehicles').insertOne({
      _id: 'TEST_VEHICLE',
      make: 'Test',
      model: 'Vehicle',
      year: 2023,
      load_capacity: 10,
      fuel_type: 'diesel',
      status: 'active',
      maintenance_history: []
    });
    console.log('FleetManager inserted vehicle:', insertResult.insertedId);

    // Can update shipments
    const updateResult = await db.collection('shipments').updateOne(
      { _id: 'S001' },
      { $set: { status: 'completed' } }
    );
    console.log('FleetManager updated shipment:', updateResult.modifiedCount);

    // Try to insert into telemetry (should fail)
    try {
      await db.collection('telemetry').insertOne({ test: 'data' });
      console.log('ERROR: FleetManager should not be able to insert into telemetry!');
    } catch (error) {
      console.log('FleetManager correctly denied telemetry insert permission:', error.message);
    }

    // Clean up test data
    await db.collection('vehicles').deleteOne({ _id: 'TEST_VEHICLE' });
    await db.collection('shipments').updateOne(
      { _id: 'S001' },
      { $set: { status: 'delivered' } }
    );

  } catch (error) {
    console.log('Error with FleetManager connection:', error.message);
  } finally {
    await fleetManagerClient.close();
  }

  // Connect as LogisticsApp
  const logisticsClient = new MongoClient(url, {
    auth: {
      username: 'logistics_app',
      password: 'app123'
    }
  });

  try {
    await logisticsClient.connect();
    const db = logisticsClient.db(dbName);

    console.log('\nConnected as LogisticsApp');

    // Can insert into telemetry
    const telemetryResult = await db.collection('telemetry').insertOne({
      vehicle_id: 'TEST_VEHICLE',
      timestamp: new Date(),
      gps: { lat: 0, lng: 0 },
      metrics: { speed: 0, fuel_level: 100, engine_temp: 25 }
    });
    console.log('LogisticsApp inserted telemetry:', telemetryResult.insertedId);

    // Try to read vehicles (should fail)
    try {
      const vehicles = await db.collection('vehicles').find({}).limit(1).toArray();
      console.log('ERROR: LogisticsApp should not be able to read vehicles!');
    } catch (error) {
      console.log('LogisticsApp correctly denied vehicles read permission:', error.message);
    }

    // Clean up
    await db.collection('telemetry').deleteOne({ vehicle_id: 'TEST_VEHICLE' });

  } catch (error) {
    console.log('Error with LogisticsApp connection:', error.message);
  } finally {
    await logisticsClient.close();
  }
}

// List current users and roles
async function listUsersAndRoles(client) {
  console.log('\n=== Current Users and Roles ===');

  const adminDb = client.db('admin');

  try {
    const users = await adminDb.command({ usersInfo: 1 });
    console.log('Users:');
    users.users.forEach(user => {
      if (user.db === dbName || user.db === 'admin') {
        console.log(`- ${user.user} (${user.db}): ${user.roles.map(r => r.role).join(', ')}`);
      }
    });

    const roles = await adminDb.command({ rolesInfo: 1 });
    console.log('\nRoles:');
    roles.roles.forEach(role => {
      if (role.db === dbName) {
        console.log(`- ${role.role}: ${role.privileges.length} privileges`);
      }
    });
  } catch (error) {
    console.log('Error listing users/roles:', error.message);
  }
}

async function setupAccessControl() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log('Connected to MongoDB for access control setup');

    await createRoles(client);
    await createUsers(client);
    await listUsersAndRoles(client);
    await demonstrateAccessControl();

    console.log('\nAccess control setup completed successfully!');
    console.log('\nNote: In production, use stronger passwords and consider additional security measures.');
  } catch (error) {
    console.error('Error setting up access control:', error);
  } finally {
    await client.close();
  }
}

// Run the access control setup
if (require.main === module) {
  setupAccessControl();
}

module.exports = {
  createRoles,
  createUsers,
  demonstrateAccessControl,
  listUsersAndRoles,
  setupAccessControl
};
