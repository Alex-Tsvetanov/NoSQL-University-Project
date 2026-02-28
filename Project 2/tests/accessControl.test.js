describe('Role-Based Access Control Restrictions', () => {
    // A helper function to simulate the RBAC enforcement present in MongoDB
    const checkPermission = (role, collection, action) => {
        const roles = {
            DataAnalyst: { privileges: { vehicles: ['find'], shipments: ['find'], telemetry: ['find'] } },
            FleetManager: { privileges: { vehicles: ['find', 'insert', 'update', 'remove'], shipments: ['find', 'insert', 'update', 'remove'], telemetry: ['find'] } },
            LogisticsApp: { privileges: { vehicles: [], shipments: [], telemetry: ['insert'] } }
        };

        if (!roles[role] || !roles[role].privileges[collection] || !roles[role].privileges[collection].includes(action)) {
            const errorMsg = `MongoServerError: not authorized on fleetTracking to execute command { ${action}: "${collection}" }`;
            console.error(`[AccessControl Error] User with role '${role}' denied ${action} on ${collection}.\n  -> ${errorMsg}`);
            throw new Error(errorMsg);
        }
        return true;
    };

    test('Invalid request: DataAnalyst denied insert on vehicles', () => {
        expect(() => {
            checkPermission('DataAnalyst', 'vehicles', 'insert');
        }).toThrow(/not authorized/);
    });

    test('Invalid request: FleetManager denied insert on telemetry', () => {
        expect(() => {
            checkPermission('FleetManager', 'telemetry', 'insert');
        }).toThrow(/not authorized/);
    });

    test('Invalid request: LogisticsApp denied find on vehicles', () => {
        expect(() => {
            checkPermission('LogisticsApp', 'vehicles', 'find');
        }).toThrow(/not authorized/);
    });
});
