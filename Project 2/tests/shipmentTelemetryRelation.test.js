const { shipments, telemetry } = require('../scripts/seedData');

describe('Shipment and Telemetry Relationship', () => {
    // Query abstraction representing: "every telemetry for assigned_vehicle_id between start_time and end_time is related to the given shipment"
    const getTelemetryForShipment = (shipment) => {
        // 1. Validate required fields
        if (!shipment.start_time || !shipment.end_time) {
            console.error(`[Error Logged] Invalid request: Shipment ${shipment._id} missing start or end time`);
            throw new Error(`Invalid request: Shipment ${shipment._id} missing start or end time`);
        }

        // 2. Validate valid timeframe
        if (shipment.start_time > shipment.end_time) {
            console.error(`[Error Logged] Invalid request: start_time cannot be after end_time for Shipment ${shipment._id}`);
            throw new Error(`Invalid request: start_time cannot be after end_time`);
        }

        // 3. Perform query logic
        return telemetry.filter(t =>
            t.vehicle_id === shipment.assigned_vehicle_id &&
            t.timestamp >= shipment.start_time &&
            t.timestamp <= shipment.end_time
        );
    };

    test('Positive Case: Should find related telemetry for a shipment within timeframe', () => {
        const s001 = shipments.find(s => s._id === 'S001');
        const related = getTelemetryForShipment(s001);

        expect(related.length).toBeGreaterThan(0);
        related.forEach(t => {
            // Validate correct vehicle
            expect(t.vehicle_id).toBe(s001.assigned_vehicle_id);
            // Validate correct timeframe
            expect(t.timestamp.getTime()).toBeGreaterThanOrEqual(s001.start_time.getTime());
            expect(t.timestamp.getTime()).toBeLessThanOrEqual(s001.end_time.getTime());
        });
    });

    test('Negative Case: Telemetry records for the same vehicle outside the timeframe are excluded', () => {
        const s001 = shipments.find(s => s._id === 'S001');

        // Telemetry has V001 at 2023-10-09T22:00, which is outside S001 timeframe (starts 10-01)
        const specificTelemetry = telemetry.find(t => t.vehicle_id === 'V001' && t.timestamp.getTime() === new Date('2023-10-09T22:00:00Z').getTime());

        // Assert it exists in telemetry db entirely
        expect(specificTelemetry).toBeDefined();

        // Assert it is scoped out of the query results
        const related = getTelemetryForShipment(s001);
        expect(related).not.toContainEqual(specificTelemetry);
    });

    test('Negative Case: Telemetry records for a different vehicle within the timeframe are excluded', () => {
        const s001 = shipments.find(s => s._id === 'S001');
        const related = getTelemetryForShipment(s001);

        // Validate we solely have V001 records and no V002 records even if their times overlapped
        related.forEach(t => {
            expect(t.vehicle_id).not.toBe('V002');
        });
    });

    test('Invalid request: Missing start/end time boundary results in query error', () => {
        const invalidShipment = {
            _id: 'S999',
            assigned_vehicle_id: 'V001',
            // Start time missing
            end_time: new Date('2023-10-01T10:00:00Z')
        };

        expect(() => {
            getTelemetryForShipment(invalidShipment);
        }).toThrow('Invalid request: Shipment S999 missing start or end time');
    });

    test('Invalid request: start_time chronologically after end_time results in query error', () => {
        const invalidShipment = {
            _id: 'S999',
            assigned_vehicle_id: 'V001',
            start_time: new Date('2023-10-02T10:00:00Z'),
            end_time: new Date('2023-10-01T10:00:00Z')
        };

        expect(() => {
            getTelemetryForShipment(invalidShipment);
        }).toThrow('Invalid request: start_time cannot be after end_time');
    });
});
