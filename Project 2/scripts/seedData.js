const { connectToDatabase, closeConnection } = require('../src/database');

// Sample data for vehicles (10 records)
const vehicles = [
  {
    _id: 'V001',
    make: 'Mercedes-Benz',
    model: 'Actros',
    year: 2020,
    load_capacity: 25, // tons
    fuel_type: 'diesel',
    status: 'active',
    maintenance_history: [
      { date: new Date('2023-01-15'), description: 'Oil change' },
      { date: new Date('2023-06-20'), description: 'Tire replacement' }
    ]
  },
  {
    _id: 'V002',
    make: 'Volvo',
    model: 'FH',
    year: 2019,
    load_capacity: 20,
    fuel_type: 'diesel',
    status: 'active',
    maintenance_history: [
      { date: new Date('2023-03-10'), description: 'Brake inspection' }
    ]
  },
  {
    _id: 'V003',
    make: 'Scania',
    model: 'R500',
    year: 2021,
    load_capacity: 30,
    fuel_type: 'diesel',
    status: 'maintenance',
    maintenance_history: [
      { date: new Date('2023-08-05'), description: 'Engine repair' }
    ]
  },
  {
    _id: 'V004',
    make: 'MAN',
    model: 'TGX',
    year: 2018,
    load_capacity: 28,
    fuel_type: 'diesel',
    status: 'active',
    maintenance_history: []
  },
  {
    _id: 'V005',
    make: 'Iveco',
    model: 'Stralis',
    year: 2022,
    load_capacity: 22,
    fuel_type: 'electric',
    status: 'active',
    maintenance_history: [
      { date: new Date('2023-05-12'), description: 'Battery check' }
    ]
  },
  {
    _id: 'V006',
    make: 'DAF',
    model: 'XF',
    year: 2017,
    load_capacity: 24,
    fuel_type: 'diesel',
    status: 'retired',
    maintenance_history: []
  },
  {
    _id: 'V007',
    make: 'Mercedes-Benz',
    model: 'Actros',
    year: 2021,
    load_capacity: 26,
    fuel_type: 'diesel',
    status: 'active',
    maintenance_history: []
  },
  {
    _id: 'V008',
    make: 'Volvo',
    model: 'FM',
    year: 2020,
    load_capacity: 18,
    fuel_type: 'diesel',
    status: 'active',
    maintenance_history: [
      { date: new Date('2023-07-18'), description: 'Transmission service' }
    ]
  },
  {
    _id: 'V009',
    make: 'Scania',
    model: 'S500',
    year: 2019,
    load_capacity: 32,
    fuel_type: 'diesel',
    status: 'active',
    maintenance_history: []
  },
  {
    _id: 'V010',
    make: 'MAN',
    model: 'TGS',
    year: 2022,
    load_capacity: 27,
    fuel_type: 'electric',
    status: 'maintenance',
    maintenance_history: [
      { date: new Date('2023-09-01'), description: 'Software update' }
    ]
  }
];

// Sample data for shipments (15 records)
const shipments = [
  {
    _id: 'S001',
    origin: 'Sofia',
    destination: 'Plovdiv',
    weight: 15, // tons
    priority: 'high',
    assigned_vehicle_id: 'V001',
    status: 'delivered',
    estimated_arrival: new Date('2023-10-01T10:00:00Z')
  },
  {
    _id: 'S002',
    origin: 'Varna',
    destination: 'Burgas',
    weight: 8,
    priority: 'medium',
    assigned_vehicle_id: 'V002',
    status: 'in-transit',
    estimated_arrival: new Date('2023-10-02T14:00:00Z')
  },
  {
    _id: 'S003',
    origin: 'Plovdiv',
    destination: 'Sofia',
    weight: 12,
    priority: 'low',
    assigned_vehicle_id: 'V003',
    status: 'pending',
    estimated_arrival: new Date('2023-10-03T16:00:00Z')
  },
  {
    _id: 'S004',
    origin: 'Ruse',
    destination: 'Stara Zagora',
    weight: 20,
    priority: 'high',
    assigned_vehicle_id: 'V004',
    status: 'delivered',
    estimated_arrival: new Date('2023-10-04T12:00:00Z')
  },
  {
    _id: 'S005',
    origin: 'Burgas',
    destination: 'Varna',
    weight: 5,
    priority: 'medium',
    assigned_vehicle_id: 'V005',
    status: 'in-transit',
    estimated_arrival: new Date('2023-10-05T18:00:00Z')
  },
  {
    _id: 'S006',
    origin: 'Sofia',
    destination: 'Pleven',
    weight: 18,
    priority: 'high',
    assigned_vehicle_id: 'V007',
    status: 'pending',
    estimated_arrival: new Date('2023-10-06T20:00:00Z')
  },
  {
    _id: 'S007',
    origin: 'Veliko Tarnovo',
    destination: 'Gabrovo',
    weight: 10,
    priority: 'low',
    assigned_vehicle_id: 'V008',
    status: 'delivered',
    estimated_arrival: new Date('2023-10-07T08:00:00Z')
  },
  {
    _id: 'S008',
    origin: 'Blagoevgrad',
    destination: 'Kyustendil',
    weight: 22,
    priority: 'medium',
    assigned_vehicle_id: 'V009',
    status: 'in-transit',
    estimated_arrival: new Date('2023-10-08T22:00:00Z')
  },
  {
    _id: 'S009',
    origin: 'Pazardzhik',
    destination: 'Smolyan',
    weight: 7,
    priority: 'low',
    assigned_vehicle_id: 'V001',
    status: 'pending',
    estimated_arrival: new Date('2023-10-09T11:00:00Z')
  },
  {
    _id: 'S010',
    origin: 'Dobrich',
    destination: 'Shumen',
    weight: 14,
    priority: 'high',
    assigned_vehicle_id: 'V002',
    status: 'delivered',
    estimated_arrival: new Date('2023-10-10T13:00:00Z')
  },
  {
    _id: 'S011',
    origin: 'Sliven',
    destination: 'Yambol',
    weight: 9,
    priority: 'medium',
    assigned_vehicle_id: 'V004',
    status: 'in-transit',
    estimated_arrival: new Date('2023-10-11T15:00:00Z')
  },
  {
    _id: 'S012',
    origin: 'Haskovo',
    destination: 'Kardzhali',
    weight: 16,
    priority: 'high',
    assigned_vehicle_id: 'V007',
    status: 'pending',
    estimated_arrival: new Date('2023-10-12T17:00:00Z')
  },
  {
    _id: 'S013',
    origin: 'Montana',
    destination: 'Vratsa',
    weight: 11,
    priority: 'low',
    assigned_vehicle_id: 'V008',
    status: 'delivered',
    estimated_arrival: new Date('2023-10-13T09:00:00Z')
  },
  {
    _id: 'S014',
    origin: 'Pernik',
    destination: 'Kyustendil',
    weight: 13,
    priority: 'medium',
    assigned_vehicle_id: 'V009',
    status: 'in-transit',
    estimated_arrival: new Date('2023-10-14T21:00:00Z')
  },
  {
    _id: 'S015',
    origin: 'Lovech',
    destination: 'Targovishte',
    weight: 6,
    priority: 'low',
    assigned_vehicle_id: 'V001',
    status: 'pending',
    estimated_arrival: new Date('2023-10-15T19:00:00Z')
  }
];

// Sample data for telemetry (20 records)
const telemetry = [
  {
    vehicle_id: 'V001',
    timestamp: new Date('2023-10-01T08:00:00Z'),
    gps: { lat: 42.6977, lng: 23.3219 }, // Sofia
    metrics: { speed: 80, fuel_level: 85.5, engine_temp: 90 }
  },
  {
    vehicle_id: 'V001',
    timestamp: new Date('2023-10-01T09:00:00Z'),
    gps: { lat: 42.1354, lng: 24.7453 }, // Plovdiv
    metrics: { speed: 85, fuel_level: 75.2, engine_temp: 92 }
  },
  {
    vehicle_id: 'V002',
    timestamp: new Date('2023-10-02T10:00:00Z'),
    gps: { lat: 43.2141, lng: 27.9147 }, // Varna
    metrics: { speed: 70, fuel_level: 90.1, engine_temp: 88 }
  },
  {
    vehicle_id: 'V002',
    timestamp: new Date('2023-10-02T11:00:00Z'),
    gps: { lat: 42.5048, lng: 27.4626 }, // Burgas
    metrics: { speed: 75, fuel_level: 80.3, engine_temp: 91 }
  },
  {
    vehicle_id: 'V003',
    timestamp: new Date('2023-10-03T12:00:00Z'),
    gps: { lat: 42.1354, lng: 24.7453 }, // Plovdiv
    metrics: { speed: 0, fuel_level: 60.0, engine_temp: 85 } // stopped for maintenance
  },
  {
    vehicle_id: 'V004',
    timestamp: new Date('2023-10-04T13:00:00Z'),
    gps: { lat: 43.8486, lng: 25.9543 }, // Ruse
    metrics: { speed: 82, fuel_level: 88.7, engine_temp: 93 }
  },
  {
    vehicle_id: 'V004',
    timestamp: new Date('2023-10-04T14:00:00Z'),
    gps: { lat: 42.4258, lng: 25.6345 }, // Stara Zagora
    metrics: { speed: 78, fuel_level: 78.9, engine_temp: 90 }
  },
  {
    vehicle_id: 'V005',
    timestamp: new Date('2023-10-05T15:00:00Z'),
    gps: { lat: 42.5048, lng: 27.4626 }, // Burgas
    metrics: { speed: 65, fuel_level: 95.2, engine_temp: 87 }
  },
  {
    vehicle_id: 'V005',
    timestamp: new Date('2023-10-05T16:00:00Z'),
    gps: { lat: 43.2141, lng: 27.9147 }, // Varna
    metrics: { speed: 68, fuel_level: 92.1, engine_temp: 89 }
  },
  {
    vehicle_id: 'V007',
    timestamp: new Date('2023-10-06T17:00:00Z'),
    gps: { lat: 42.6977, lng: 23.3219 }, // Sofia
    metrics: { speed: 83, fuel_level: 82.4, engine_temp: 91 }
  },
  {
    vehicle_id: 'V008',
    timestamp: new Date('2023-10-07T18:00:00Z'),
    gps: { lat: 43.0757, lng: 25.6172 }, // Veliko Tarnovo
    metrics: { speed: 72, fuel_level: 87.6, engine_temp: 88 }
  },
  {
    vehicle_id: 'V008',
    timestamp: new Date('2023-10-07T19:00:00Z'),
    gps: { lat: 42.8742, lng: 25.3341 }, // Gabrovo
    metrics: { speed: 74, fuel_level: 80.8, engine_temp: 90 }
  },
  {
    vehicle_id: 'V009',
    timestamp: new Date('2023-10-08T20:00:00Z'),
    gps: { lat: 42.0140, lng: 23.0943 }, // Blagoevgrad
    metrics: { speed: 79, fuel_level: 76.3, engine_temp: 92 }
  },
  {
    vehicle_id: 'V009',
    timestamp: new Date('2023-10-08T21:00:00Z'),
    gps: { lat: 42.2839, lng: 22.6891 }, // Kyustendil
    metrics: { speed: 81, fuel_level: 73.5, engine_temp: 93 }
  },
  {
    vehicle_id: 'V001',
    timestamp: new Date('2023-10-09T22:00:00Z'),
    gps: { lat: 42.1928, lng: 24.3336 }, // Pazardzhik
    metrics: { speed: 77, fuel_level: 79.1, engine_temp: 89 }
  },
  {
    vehicle_id: 'V002',
    timestamp: new Date('2023-10-10T23:00:00Z'),
    gps: { lat: 43.4167, lng: 28.1667 }, // Dobrich
    metrics: { speed: 69, fuel_level: 84.7, engine_temp: 87 }
  },
  {
    vehicle_id: 'V002',
    timestamp: new Date('2023-10-11T00:00:00Z'),
    gps: { lat: 43.2706, lng: 26.9361 }, // Shumen
    metrics: { speed: 71, fuel_level: 81.2, engine_temp: 88 }
  },
  {
    vehicle_id: 'V004',
    timestamp: new Date('2023-10-11T01:00:00Z'),
    gps: { lat: 42.6858, lng: 26.3292 }, // Sliven
    metrics: { speed: 76, fuel_level: 85.9, engine_temp: 91 }
  },
  {
    vehicle_id: 'V007',
    timestamp: new Date('2023-10-12T02:00:00Z'),
    gps: { lat: 41.9333, lng: 25.5667 }, // Haskovo
    metrics: { speed: 84, fuel_level: 77.4, engine_temp: 92 }
  },
  {
    vehicle_id: 'V008',
    timestamp: new Date('2023-10-13T03:00:00Z'),
    gps: { lat: 43.4067, lng: 23.2250 }, // Montana
    metrics: { speed: 73, fuel_level: 83.6, engine_temp: 89 }
  }
];

async function seedDatabase() {
  try {
    const db = await connectToDatabase();

    // Insert vehicles
    console.log('Seeding vehicles...');
    await db.collection('vehicles').insertMany(vehicles);
    console.log('Vehicles seeded successfully');

    // Insert shipments
    console.log('Seeding shipments...');
    await db.collection('shipments').insertMany(shipments);
    console.log('Shipments seeded successfully');

    // Insert telemetry
    console.log('Seeding telemetry...');
    await db.collection('telemetry').insertMany(telemetry);
    console.log('Telemetry seeded successfully');

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await closeConnection();
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, vehicles, shipments, telemetry };
