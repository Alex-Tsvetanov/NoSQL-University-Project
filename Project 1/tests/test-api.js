const request = require('supertest');
const { MongoClient } = require('mongodb');
const app = require('../app');
const { connectToDatabase, getDatabase, closeConnection } = require('../db');

const testDbName = 'edtech_analytics_test';

// Test data
const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    interests: ['Testing', 'Quality Assurance'],
    role: 'student',
    enrollment_date: new Date(),
    is_active: true
};

const testCourse = {
    title: 'Test Course',
    lecturer: 'Test Lecturer',
    category: 'Testing',
    price: 100,
    modules: [
        {
            title: 'Test Module',
            lectures: [
                {
                    title: 'Test Lecture',
                    duration: 60,
                    video_url: 'https://example.com/test.mp4'
                }
            ]
        }
    ],
    created_at: new Date(),
    is_active: true
};

const testProgress = {
    status: 'enrolled',
    enrollment_date: new Date(),
    completion_date: null,
    current_module: 1,
    current_lecture: 1,
    test_results: [],
    last_activity: new Date()
};

let server;
let testUserId;
let testCourseId;
let testProgressId;

beforeAll(async () => {
    // Connect to test database
    process.env.MONGODB_URI = `mongodb://localhost:27017/${testDbName}`;

    try {
        await connectToDatabase();
        const db = getDatabase();

        // Clear test database
        await db.collection('users').deleteMany({});
        await db.collection('courses').deleteMany({});
        await db.collection('progress').deleteMany({});

        // Insert test data
        const userResult = await db.collection('users').insertOne(testUser);
        testUserId = userResult.insertedId;

        const courseResult = await db.collection('courses').insertOne(testCourse);
        testCourseId = courseResult.insertedId;

        // Update test progress with IDs
        testProgress.student_id = testUserId;
        testProgress.course_id = testCourseId;

        const progressResult = await db.collection('progress').insertOne(testProgress);
        testProgressId = progressResult.insertedId;

        // Start server
        server = app.listen(3001); // Use different port for tests

    } catch (error) {
        console.error('Test setup failed:', error);
        throw error;
    }
}, 30000);

afterAll(async () => {
    // Close server and connection
    if (server) {
        server.close();
    }

    try {
        const db = getDatabase();
        await db.collection('users').deleteMany({});
        await db.collection('courses').deleteMany({});
        await db.collection('progress').deleteMany({});
        await closeConnection();
    } catch (error) {
        console.error('Test cleanup failed:', error);
    }
}, 30000);

describe('EdTech Analytics API Tests', () => {
    describe('Health Check', () => {
        test('GET /health should return OK status', async () => {
            const response = await request(server)
                .get('/health')
                .expect(200);

            expect(response.body.status).toBe('OK');
            expect(response.body.message).toContain('EdTech Analytics API is running');
        });
    });

    describe('Users CRUD', () => {
        test('POST /users should create a new user', async () => {
            const newUser = {
                name: 'New Test User',
                email: 'newtest@example.com',
                interests: ['JavaScript'],
                role: 'student',
                enrollment_date: new Date(),
                is_active: true
            };

            const response = await request(server)
                .post('/users')
                .send(newUser)
                .expect(201);

            expect(response.body.message).toBe('User created successfully');
            expect(response.body.userId).toBeDefined();
        });

        test('GET /users should return users', async () => {
            const response = await request(server)
                .get('/users')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        test('GET /users with filters should work', async () => {
            const response = await request(server)
                .get('/users?role=student')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(user => {
                expect(user.role).toBe('student');
            });
        });

        test('PUT /users/:id should update a user', async () => {
            const updateData = { name: 'Updated Test User' };

            const response = await request(server)
                .put(`/users/${testUserId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.message).toBe('User updated successfully');
        });

        test('DELETE /users/:id should delete a user', async () => {
            const response = await request(server)
                .delete(`/users/${testUserId}`)
                .expect(200);

            expect(response.body.message).toBe('User deleted successfully');
        });
    });

    describe('Courses CRUD', () => {
        test('POST /courses should create a new course', async () => {
            const newCourse = {
                title: 'New Test Course',
                lecturer: 'New Lecturer',
                category: 'Development',
                price: 200,
                modules: [],
                created_at: new Date(),
                is_active: true
            };

            const response = await request(server)
                .post('/courses')
                .send(newCourse)
                .expect(201);

            expect(response.body.message).toBe('Course created successfully');
            expect(response.body.courseId).toBeDefined();
        });

        test('GET /courses should return courses', async () => {
            const response = await request(server)
                .get('/courses')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        test('GET /courses with price filter should work', async () => {
            const response = await request(server)
                .get('/courses?price_lte=150')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(course => {
                expect(course.price).toBeLessThanOrEqual(150);
            });
        });

        test('PUT /courses/:id should update a course', async () => {
            const updateData = { title: 'Updated Test Course' };

            const response = await request(server)
                .put(`/courses/${testCourseId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.message).toBe('Course updated successfully');
        });

        test('DELETE /courses/:id should delete a course', async () => {
            const response = await request(server)
                .delete(`/courses/${testCourseId}`)
                .expect(200);

            expect(response.body.message).toBe('Course deleted successfully');
        });
    });

    describe('Progress CRUD', () => {
        test('POST /progress should create a new progress record', async () => {
            const newProgress = {
                student_id: testUserId,
                course_id: testCourseId,
                status: 'in_progress',
                enrollment_date: new Date(),
                current_module: 1,
                current_lecture: 1,
                test_results: [],
                last_activity: new Date()
            };

            const response = await request(server)
                .post('/progress')
                .send(newProgress)
                .expect(201);

            expect(response.body.message).toBe('Progress record created successfully');
            expect(response.body.progressId).toBeDefined();
        });

        test('GET /progress should return progress records', async () => {
            const response = await request(server)
                .get('/progress')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        test('GET /progress with status filter should work', async () => {
            const response = await request(server)
                .get('/progress?status=enrolled')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(progress => {
                expect(progress.status).toBe('enrolled');
            });
        });

        test('PUT /progress/:id should update a progress record', async () => {
            const updateData = { status: 'completed' };

            const response = await request(server)
                .put(`/progress/${testProgressId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.message).toBe('Progress record updated successfully');
        });

        test('DELETE /progress/:id should delete a progress record', async () => {
            const response = await request(server)
                .delete(`/progress/${testProgressId}`)
                .expect(200);

            expect(response.body.message).toBe('Progress record deleted successfully');
        });
    });

    describe('Analytics Endpoints', () => {
        test('GET /analytics/top-active-students should return analytics data', async () => {
            const response = await request(server)
                .get('/analytics/top-active-students')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            // May be empty if no completed courses in test data
        });

        test('GET /analytics/students-completed-by-alternative should return data', async () => {
            const response = await request(server)
                .get('/analytics/students-completed-by-alternative')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        test('GET /analytics/course-enrollment-stats should return enrollment statistics', async () => {
            const response = await request(server)
                .get('/analytics/course-enrollment-stats')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            if (response.body.length > 0) {
                expect(response.body[0]).toHaveProperty('courseTitle');
                expect(response.body[0]).toHaveProperty('totalEnrollments');
                expect(response.body[0]).toHaveProperty('completionRate');
            }
        });
    });

    describe('Error Handling', () => {
        test('GET /nonexistent should return 404', async () => {
            await request(server)
                .get('/nonexistent')
                .expect(404);
        });

        test('PUT /users/invalid-id should return 500 (invalid ObjectId)', async () => {
            await request(server)
                .put('/users/invalid-id')
                .send({ name: 'Test' })
                .expect(500);
        });

        test('DELETE /users/nonexistent-id should return 404', async () => {
            await request(server)
                .delete('/users/507f1f77bcf86cd799439011') // Valid ObjectId format but doesn't exist
                .expect(404);
        });
    });
});
