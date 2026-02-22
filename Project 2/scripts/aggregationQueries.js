const { connectToDatabase, closeConnection } = require('../src/database');

/**
 * Aggregation Queries Demonstration
 * This script demonstrates advanced aggregation operations for the IoT Fleet Tracking system
 */

// Calculate average fuel consumption per vehicle
async function averageFuelConsumption(db) {
  console.log('\n=== Average Fuel Consumption per Vehicle ===');

  const pipeline = [
    {
      $group: {
        _id: '$vehicle_id',
        avgFuelLevel: { $avg: '$metrics.fuel_level' },
        count: { $sum: 1 },
        minFuel: { $min: '$metrics.fuel_level' },
        maxFuel: { $max: '$metrics.fuel_level' }
      }
    },
    {
      $sort: { avgFuelLevel: -1 }
    }
  ];

  const results = await db.collection('telemetry').aggregate(pipeline).toArray();

  results.forEach(result => {
    console.log(`Vehicle ${result._id}: Avg fuel ${result.avgFuelLevel.toFixed(2)}%, Count: ${result.count}, Range: ${result.minFuel}% - ${result.maxFuel}%`);
  });
}

// Calculate total weight of shipments by status
async function shipmentWeightByStatus(db) {
  console.log('\n=== Total Shipment Weight by Status ===');

  const pipeline = [
    {
      $group: {
        _id: '$status',
        totalWeight: { $sum: '$weight' },
        count: { $sum: 1 },
        avgWeight: { $avg: '$weight' }
      }
    },
    {
      $sort: { totalWeight: -1 }
    }
  ];

  const results = await db.collection('shipments').aggregate(pipeline).toArray();

  results.forEach(result => {
    console.log(`${result._id}: Total ${result.totalWeight}t, Count: ${result.count}, Avg: ${result.avgWeight.toFixed(2)}t`);
  });
}

// Find vehicles with maintenance history using $unwind
async function vehiclesWithMaintenance(db) {
  console.log('\n=== Vehicles with Maintenance History (using $unwind) ===');

  const pipeline = [
    {
      $unwind: '$maintenance_history'
    },
    {
      $group: {
        _id: '$_id',
        make: { $first: '$make' },
        model: { $first: '$model' },
        maintenanceCount: { $sum: 1 },
        lastMaintenance: { $max: '$maintenance_history.date' }
      }
    },
    {
      $sort: { maintenanceCount: -1 }
    }
  ];

  const results = await db.collection('vehicles').aggregate(pipeline).toArray();

  results.forEach(result => {
    console.log(`${result._id} (${result.make} ${result.model}): ${result.maintenanceCount} maintenance records, Last: ${result.lastMaintenance}`);
  });
}

// Combine shipments with vehicle details using $lookup
async function shipmentsWithVehicleDetails(db) {
  console.log('\n=== Shipments with Vehicle Details (using $lookup) ===');

  const pipeline = [
    {
      $lookup: {
        from: 'vehicles',
        localField: 'assigned_vehicle_id',
        foreignField: '_id',
        as: 'vehicle_details'
      }
    },
    {
      $unwind: '$vehicle_details'
    },
    {
      $match: {
        status: 'in-transit'
      }
    },
    {
      $project: {
        _id: 1,
        origin: 1,
        destination: 1,
        weight: 1,
        priority: 1,
        status: 1,
        vehicle_make: '$vehicle_details.make',
        vehicle_model: '$vehicle_details.model',
        vehicle_capacity: '$vehicle_details.load_capacity'
      }
    },
    {
      $sort: { weight: -1 }
    }
  ];

  const results = await db.collection('shipments').aggregate(pipeline).toArray();

  results.forEach(result => {
    console.log(`${result._id}: ${result.origin} -> ${result.destination} (${result.weight}t) - Vehicle: ${result.vehicle_make} ${result.vehicle_model} (${result.vehicle_capacity}t capacity)`);
  });
}

// Complex aggregation: Average speed and fuel efficiency by vehicle type
async function vehiclePerformanceAnalysis(db) {
  console.log('\n=== Vehicle Performance Analysis ===');

  const pipeline = [
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicle_id',
        foreignField: '_id',
        as: 'vehicle'
      }
    },
    {
      $unwind: '$vehicle'
    },
    {
      $group: {
        _id: {
          vehicle_id: '$vehicle_id',
          make: '$vehicle.make',
          model: '$vehicle.model'
        },
        avgSpeed: { $avg: '$metrics.speed' },
        avgFuelLevel: { $avg: '$metrics.fuel_level' },
        avgEngineTemp: { $avg: '$metrics.engine_temp' },
        dataPoints: { $sum: 1 }
      }
    },
    {
      $match: {
        dataPoints: { $gte: 2 } // Only vehicles with multiple data points
      }
    },
    {
      $sort: { avgSpeed: -1 }
    }
  ];

  const results = await db.collection('telemetry').aggregate(pipeline).toArray();

  results.forEach(result => {
    console.log(`${result._id.vehicle_id} (${result._id.make} ${result._id.model}): Avg speed ${result.avgSpeed.toFixed(2)} km/h, Avg fuel ${result.avgFuelLevel.toFixed(2)}%, Avg temp ${result.avgEngineTemp.toFixed(2)}°C (${result.dataPoints} data points)`);
  });
}

// Match and group: High priority shipments by destination
async function highPriorityShipmentsByDestination(db) {
  console.log('\n=== High Priority Shipments by Destination ===');

  const pipeline = [
    {
      $match: {
        priority: 'high',
        status: { $ne: 'delivered' }
      }
    },
    {
      $group: {
        _id: '$destination',
        count: { $sum: 1 },
        totalWeight: { $sum: '$weight' },
        avgWeight: { $avg: '$weight' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ];

  const results = await db.collection('shipments').aggregate(pipeline).toArray();

  results.forEach(result => {
    console.log(`${result._id}: ${result.count} high priority shipments, Total weight: ${result.totalWeight}t, Avg weight: ${result.avgWeight.toFixed(2)}t`);
  });
}

async function runAggregationQueries() {
  try {
    const db = await connectToDatabase();

    await averageFuelConsumption(db);
    await shipmentWeightByStatus(db);
    await vehiclesWithMaintenance(db);
    await shipmentsWithVehicleDetails(db);
    await vehiclePerformanceAnalysis(db);
    await highPriorityShipmentsByDestination(db);

    console.log('\nAggregation queries completed successfully!');
  } catch (error) {
    console.error('Error running aggregation queries:', error);
  } finally {
    await closeConnection();
  }
}

// Run the aggregation queries
if (require.main === module) {
  runAggregationQueries();
}

module.exports = {
  averageFuelConsumption,
  shipmentWeightByStatus,
  vehiclesWithMaintenance,
  shipmentsWithVehicleDetails,
  vehiclePerformanceAnalysis,
  highPriorityShipmentsByDestination,
  runAggregationQueries
};
