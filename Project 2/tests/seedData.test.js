const { vehicles, shipments, telemetry } = require('../scripts/seedData');

describe('Seed Data', () => {
  test('should have 10 vehicles', () => {
    expect(vehicles).toHaveLength(10);
  });

  test('should have 15 shipments', () => {
    expect(shipments).toHaveLength(15);
  });

  test('should have 20 telemetry records', () => {
    expect(telemetry).toHaveLength(20);
  });

  test('vehicles should have required fields', () => {
    vehicles.forEach(vehicle => {
      expect(vehicle).toHaveProperty('_id');
      expect(vehicle).toHaveProperty('make');
      expect(vehicle).toHaveProperty('model');
      expect(vehicle).toHaveProperty('year');
      expect(vehicle).toHaveProperty('load_capacity');
      expect(vehicle).toHaveProperty('fuel_type');
      expect(vehicle).toHaveProperty('status');
      expect(vehicle).toHaveProperty('maintenance_history');
    });
  });

  test('shipments should have required fields', () => {
    shipments.forEach(shipment => {
      expect(shipment).toHaveProperty('_id');
      expect(shipment).toHaveProperty('origin');
      expect(shipment).toHaveProperty('destination');
      expect(shipment).toHaveProperty('weight');
      expect(shipment).toHaveProperty('priority');
      expect(shipment).toHaveProperty('assigned_vehicle_id');
      expect(shipment).toHaveProperty('status');
      expect(shipment).toHaveProperty('estimated_arrival');
    });
  });

  test('telemetry should have required fields', () => {
    telemetry.forEach(record => {
      expect(record).toHaveProperty('vehicle_id');
      expect(record).toHaveProperty('timestamp');
      expect(record).toHaveProperty('gps');
      expect(record).toHaveProperty('metrics');
      expect(record.metrics).toHaveProperty('speed');
      expect(record.metrics).toHaveProperty('fuel_level');
      expect(record.metrics).toHaveProperty('engine_temp');
    });
  });

  test('should have realistic data ranges', () => {
    // Check vehicle capacities
    vehicles.forEach(vehicle => {
      expect(vehicle.load_capacity).toBeGreaterThan(0);
      expect(vehicle.load_capacity).toBeLessThanOrEqual(40);
    });

    // Check shipment weights
    shipments.forEach(shipment => {
      expect(shipment.weight).toBeGreaterThan(0);
      expect(shipment.weight).toBeLessThanOrEqual(35);
    });

    // Check telemetry metrics
    telemetry.forEach(record => {
      expect(record.metrics.speed).toBeGreaterThanOrEqual(0);
      expect(record.metrics.speed).toBeLessThanOrEqual(100);
      expect(record.metrics.fuel_level).toBeGreaterThanOrEqual(0);
      expect(record.metrics.fuel_level).toBeLessThanOrEqual(100);
      expect(record.metrics.engine_temp).toBeGreaterThanOrEqual(20);
      expect(record.metrics.engine_temp).toBeLessThanOrEqual(100);
    });
  });
});
