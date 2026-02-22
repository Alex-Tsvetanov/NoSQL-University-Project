const { MongoClient } = require('mongodb');

/**
 * RBAC Setup Script for EdTech Analytics Platform
 *
 * This script demonstrates Role-Based Access Control (RBAC) in MongoDB.
 * It creates custom roles and users with different access levels.
 *
 * Roles defined:
 * - DataAnalyst: Read-only access to all collections for analytics
 * - Instructor: Full CRUD access to courses and progress, read access to users
 * - Student: Read access to own progress and courses, limited write access
 */

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'edtech_analytics';

async function setupRBAC() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB for RBAC setup');

        const db = client.db(dbName);
        const adminDb = client.db('admin'); // Roles are created in admin database

        // Create custom roles
        console.log('Creating custom roles...');

        // DataAnalyst role - read-only access to all collections
        await adminDb.command({
            createRole: 'DataAnalyst',
            privileges: [
                {
                    resource: { db: dbName, collection: 'users' },
                    actions: ['find']
                },
                {
                    resource: { db: dbName, collection: 'courses' },
                    actions: ['find']
                },
                {
                    resource: { db: dbName, collection: 'progress' },
                    actions: ['find']
                }
            ],
            roles: []
        });

        // Instructor role - full access to courses and progress, read access to users
        await adminDb.command({
            createRole: 'Instructor',
            privileges: [
                {
                    resource: { db: dbName, collection: 'users' },
                    actions: ['find']
                },
                {
                    resource: { db: dbName, collection: 'courses' },
                    actions: ['find', 'insert', 'update', 'remove']
                },
                {
                    resource: { db: dbName, collection: 'progress' },
                    actions: ['find', 'insert', 'update', 'remove']
                }
            ],
            roles: []
        });

        // Student role - read access to courses and own progress, limited write access
        await adminDb.command({
            createRole: 'Student',
            privileges: [
                {
                    resource: { db: dbName, collection: 'courses' },
                    actions: ['find']
                },
                {
                    resource: { db: dbName, collection: 'progress' },
                    actions: ['find', 'insert', 'update'] // Can view and update own progress
                },
                // Note: In a real implementation, you would use document-level security
                // or application-level filtering to ensure students only access their own data
                {
                    resource: { db: dbName, collection: 'users' },
                    actions: ['find'] // Can view user profiles (for instructors, etc.)
                }
            ],
            roles: []
        });

        console.log('Custom roles created successfully');

        // Create users with different roles
        console.log('Creating users with assigned roles...');

        // Create DataAnalyst user
        await db.command({
            createUser: 'data_analyst',
            pwd: 'analyst_pass123',
            roles: [
                { role: 'DataAnalyst', db: 'admin' }
            ]
        });

        // Create Instructor user
        await db.command({
            createUser: 'instructor_user',
            pwd: 'instructor_pass123',
            roles: [
                { role: 'Instructor', db: 'admin' }
            ]
        });

        // Create Student user
        await db.command({
            createUser: 'student_user',
            pwd: 'student_pass123',
            roles: [
                { role: 'Student', db: 'admin' }
            ]
        });

        console.log('Users created successfully');

        // Display created roles and users
        console.log('\n=== RBAC Setup Complete ===');
        console.log('Created Roles:');
        console.log('- DataAnalyst: Read-only access to all collections');
        console.log('- Instructor: Full CRUD on courses and progress, read on users');
        console.log('- Student: Read courses, limited access to progress');

        console.log('\nCreated Users:');
        console.log('- data_analyst / analyst_pass123 (DataAnalyst role)');
        console.log('- instructor_user / instructor_pass123 (Instructor role)');
        console.log('- student_user / student_pass123 (Student role)');

        console.log('\nTo test RBAC:');
        console.log('1. Connect with data_analyst - should only be able to read data');
        console.log('2. Connect with instructor_user - can modify courses and progress');
        console.log('3. Connect with student_user - limited permissions');

    } catch (error) {
        console.error('Error setting up RBAC:', error);
        // If roles/users already exist, that's okay
        if (error.code === 31 || error.codeName === 'RoleAlreadyExists') {
            console.log('Roles already exist, skipping creation');
        } else if (error.code === 11000 || error.codeName === 'UserAlreadyExists') {
            console.log('Users already exist, skipping creation');
        } else {
            throw error;
        }
    } finally {
        await client.close();
        console.log('RBAC setup connection closed');
    }
}

// Demonstration script to test RBAC
async function testRBAC() {
    console.log('\n=== Testing RBAC ===');

    // Test DataAnalyst access
    const analystClient = new MongoClient(uri.replace('mongodb://', 'mongodb://data_analyst:analyst_pass123@'));
    try {
        await analystClient.connect();
        const db = analystClient.db(dbName);

        console.log('DataAnalyst can read users:', (await db.collection('users').find().limit(1).toArray()).length > 0);

        // Try to insert (should fail)
        try {
            await db.collection('users').insertOne({ test: 'data' });
            console.log('ERROR: DataAnalyst should not be able to insert!');
        } catch (error) {
            console.log('DataAnalyst correctly blocked from inserting:', error.codeName);
        }

    } catch (error) {
        console.error('DataAnalyst test failed:', error.message);
    } finally {
        await analystClient.close();
    }

    // Test Instructor access
    const instructorClient = new MongoClient(uri.replace('mongodb://', 'mongodb://instructor_user:instructor_pass123@'));
    try {
        await instructorClient.connect();
        const db = instructorClient.db(dbName);

        console.log('Instructor can read courses:', (await db.collection('courses').find().limit(1).toArray()).length > 0);

        // Try to insert course (should succeed)
        const testCourse = {
            title: 'Test Course for RBAC',
            lecturer: 'Test Lecturer',
            category: 'Test',
            price: 0,
            modules: [],
            created_at: new Date(),
            is_active: false
        };

        const insertResult = await db.collection('courses').insertOne(testCourse);
        console.log('Instructor can insert course:', !!insertResult.insertedId);

        // Clean up test data
        await db.collection('courses').deleteOne({ _id: insertResult.insertedId });

    } catch (error) {
        console.error('Instructor test failed:', error.message);
    } finally {
        await instructorClient.close();
    }
}

// Run setup if executed directly
if (require.main === module) {
    setupRBAC().then(() => {
        return testRBAC();
    }).catch(error => {
        console.error('RBAC setup/test failed:', error);
        process.exit(1);
    });
}

module.exports = { setupRBAC, testRBAC };
