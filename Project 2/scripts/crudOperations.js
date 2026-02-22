const { connectToDatabase, closeConnection } = require('../src/database');

/**
 * CRUD Operations Demonstration
 * This script demonstrates all required CRUD operations for the IoT Fleet Tracking system
 */

// CREATE Operations
async function createOperations(db) {
  console.log('\n=== CREATE OPERATIONS ===');

  // Create a new vehicle
  const newVehicle = {
    _id: 'V011',
    make: 'Tesla',
    model: 'Semi',
    year: 2023,
    load_capacity: 36,
    fuel_type: 'electric',
    status: 'active',
    maintenance_history: []
  };

  const vehicleResult = await db.collection('vehicles').insertOne(newVehicle);
  console.log('Created new vehicle:', vehicleResult.insertedId);

  // Create a new shipment
  const newShipment = {
    _id: 'S016',
    origin: 'Sofia',
    destination: 'Varna',
    weight: 25,
    priority: 'high',
    assigned_vehicle_id: 'V011',
    status: 'pending',
    estimated_arrival: new Date('2023-10-16T12:00:00Z')
  };

  const shipmentResult = await db.collection('shipments').insertOne(newShipment);
  console.log('Created new shipment:', shipmentResult.insertedId);

  // Create telemetry data
  const newTelemetry = {
    vehicle_id: 'V011',
    timestamp: new Date('2023-10-15T08:00:00Z'),
    gps: { lat: 42.6977, lng: 23.3219 },
    metrics: { speed: 0, fuel_level: 100.0, engine_temp: 25 }
  };

  const telemetryResult = await db.collection('telemetry').insertOne(newTelemetry);
  console.log('Created new telemetry:', telemetryResult.insertedId);
}

// READ Operations
async function readOperations(db) {
  console.log('\n=== READ OPERATIONS ===');

  // Find all vehicles with capacity > 20 tons
  console.log('Vehicles with capacity > 20 tons:');
  const largeVehicles = await db.collection('vehicles')
    .find({ load_capacity: { $gt: 20 } })
    .toArray();
  console.log(largeVehicles.map(v => `${v._id}: ${v.make} ${v.model} - ${v.load_capacity}t`));

  // Find shipments that are "in-transit" AND weight > 10 tons
  console.log('\nShipments in-transit with weight > 10 tons:');
  const heavyInTransit = await db.collection('shipments')
    .find({
      $and: [
        { status: 'in-transit' },
        { weight: { $gt: 10 } }
      ]
    })
    .toArray();
  console.log(heavyInTransit.map(s => `${s._id}: ${s.origin} -> ${s.destination} (${s.weight}t)`));

  // Find using regex - vehicles with "Mercedes" in make
  console.log('\nVehicles from Mercedes-Benz:');
  const mercedesVehicles = await db.collection('vehicles')
    .find({ make: { $regex: 'Mercedes' } })
    .toArray();
  console.log(mercedesVehicles.map(v => `${v._id}: ${v.make} ${v.model}`));

  // Find using $in - shipments with priority high or medium
  console.log('\nHigh or medium priority shipments:');
  const priorityShipments = await db.collection('shipments')
    .find({ priority: { $in: ['high', 'medium'] } })
    .toArray();
  console.log(priorityShipments.map(s => `${s._id}: Priority ${s.priority} - ${s.weight}t`));

  // Find using $gte/$lte - telemetry with fuel level between 80-90
  console.log('\nTelemetry with fuel level 80-90%:');
  const goodFuelTelemetry = await db.collection('telemetry')
    .find({
      'metrics.fuel_level': {
        $gte: 80,
        $lte: 90
      }
    })
    .toArray();
  console.log(goodFuelTelemetry.map(t => `Vehicle ${t.vehicle_id}: ${t.metrics.fuel_level}% fuel`));
}

// UPDATE Operations
async function updateOperations(db) {
  console.log('\n=== UPDATE OPERATIONS ===');

  // Update one - change status of a shipment
  const updateResult1 = await db.collection('shipments')
    .updateOne(
      { _id: 'S016' },
      { $set: { status: 'in-transit' } }
    );
  console.log('Updated shipment S016 status:', updateResult1.modifiedCount);

  // Update many - change status of all pending shipments in Sofia region
  const updateResult2 = await db.collection('shipments')
    .updateMany(
      {
        $and: [
          { status: 'pending' },
          { origin: 'Sofia' }
        ]
      },
      { $set: { status: 'in-transit' } }
    );
  console.log('Updated pending Sofia shipments:', updateResult2.modifiedCount);

  // Use $inc - increase engine temperature in telemetry
  const updateResult3 = await db.collection('telemetry')
    .updateOne(
      { vehicle_id: 'V011', timestamp: new Date('2023-10-15T08:00:00Z') },
      { $inc: { 'metrics.engine_temp': 10 } }
    );
  console.log('Increased engine temp for V011:', updateResult3.modifiedCount);

  // Use $push - add maintenance record to vehicle
  const updateResult4 = await db.collection('vehicles')
    .updateOne(
      { _id: 'V011' },
      {
        $push: {
          maintenance_history: {
            date: new Date(),
            description: 'Initial inspection'
          }
        }
      }
    );
  console.log('Added maintenance record to V011:', updateResult4.modifiedCount);

  // Use $pull - remove old driver (simulated by removing from array if existed)
  // Since we don't have driver arrays, let's demonstrate with maintenance_history
  const updateResult5 = await db.collection('vehicles')
    .updateOne(
      { _id: 'V001' },
      {
        $pull: {
          maintenance_history: { description: 'Oil change' }
        }
      }
    );
  console.log('Removed oil change record from V001:', updateResult5.modifiedCount);
}

// DELETE Operations
async function deleteOperations(db) {
  console.log('\n=== DELETE OPERATIONS ===');

  // Delete one - remove the newly created telemetry record
  const deleteResult1 = await db.collection('telemetry')
    .deleteOne({
      vehicle_id: 'V011',
      timestamp: new Date('2023-10-15T08:00:00Z')
    });
  console.log('Deleted telemetry record:', deleteResult1.deletedCount);

  // Delete many - remove old telemetry data (older than a certain date)
  const oldDate = new Date('2023-10-05T00:00:00Z');
  const deleteResult2 = await db.collection('telemetry')
    .deleteMany({
      timestamp: { $lt: oldDate }
    });
  console.log('Deleted old telemetry records:', deleteResult2.deletedCount);

  // Clean up - remove the test vehicle and shipment we created
  const deleteResult3 = await db.collection('vehicles')
    .deleteOne({ _id: 'V011' });
  console.log('Deleted test vehicle:', deleteResult3.deletedCount);

  const deleteResult4 = await db.collection('shipments')
    .deleteOne({ _id: 'S016' });
  console.log('Deleted test shipment:', deleteResult4.deletedCount);
}

async function runCrudOperations() {
  try {
    const db = await connectToDatabase();

    await createOperations(db);
    await readOperations(db);
    await updateOperations(db);
    await deleteOperations(db);

    console.log('\nCRUD operations completed successfully!');
  } catch (error) {
    console.error('Error running CRUD operations:', error);
  } finally {
    await closeConnection();
  }
}

// Run the CRUD operations
if (require.main === module) {
  runCrudOperations();
}

module.exports = {
  createOperations,
  readOperations,
  updateOperations,
  deleteOperations,
  runCrudOperations
};
