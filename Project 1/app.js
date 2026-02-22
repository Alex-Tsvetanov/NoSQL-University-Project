const express = require('express');
const { connectToDatabase, getDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Connect to database on startup
connectToDatabase().then(() => {
    console.log('Database connected. Starting server...');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(error => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'EdTech Analytics API is running' });
});

/**
 * USERS CRUD Operations
 */

/**
 * CREATE - Add new user
 * POST /users
 */
app.post('/users', async (req, res) => {
    try {
        const db = getDatabase();
        const result = await db.collection('users').insertOne(req.body);
        res.status(201).json({
            message: 'User created successfully',
            userId: result.insertedId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * READ - Get users with optional filters
 * GET /users
 * Query parameters: role, is_active, interests (comma-separated)
 */
app.get('/users', async (req, res) => {
    try {
        const db = getDatabase();
        let query = {};

        // Build query from parameters
        if (req.query.role) {
            query.role = req.query.role;
        }

        if (req.query.is_active !== undefined) {
            query.is_active = req.query.is_active === 'true';
        }

        if (req.query.interests) {
            const interests = req.query.interests.split(',');
            query.interests = { $in: interests };
        }

        // Use regex for name search
        if (req.query.name) {
            query.name = { $regex: req.query.name, $options: 'i' };
        }

        const users = await db.collection('users').find(query).toArray();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * UPDATE - Update user by ID
 * PUT /users/:id
 */
app.put('/users/:id', async (req, res) => {
    try {
        const db = getDatabase();
        const { ObjectId } = require('mongodb');
        const userId = new ObjectId(req.params.id);

        const result = await db.collection('users').updateOne(
            { _id: userId },
            { $set: req.body }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE - Delete user by ID
 * DELETE /users/:id
 */
app.delete('/users/:id', async (req, res) => {
    try {
        const db = getDatabase();
        const { ObjectId } = require('mongodb');
        const userId = new ObjectId(req.params.id);

        const result = await db.collection('users').deleteOne({ _id: userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * COURSES CRUD Operations
 */

/**
 * CREATE - Add new course
 * POST /courses
 */
app.post('/courses', async (req, res) => {
    try {
        const db = getDatabase();
        const result = await db.collection('courses').insertOne(req.body);
        res.status(201).json({
            message: 'Course created successfully',
            courseId: result.insertedId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * READ - Get courses with filters
 * GET /courses
 * Query parameters: category, price_lte, price_gte, lecturer
 */
app.get('/courses', async (req, res) => {
    try {
        const db = getDatabase();
        let query = {};

        if (req.query.category) {
            query.category = { $regex: req.query.category, $options: 'i' };
        }

        if (req.query.price_lte) {
            query.price = { ...query.price, $lte: parseFloat(req.query.price_lte) };
        }

        if (req.query.price_gte) {
            query.price = { ...query.price, $gte: parseFloat(req.query.price_gte) };
        }

        if (req.query.lecturer) {
            query.lecturer = { $regex: req.query.lecturer, $options: 'i' };
        }

        const courses = await db.collection('courses').find(query).toArray();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * UPDATE - Update course by ID
 * PUT /courses/:id
 */
app.put('/courses/:id', async (req, res) => {
    try {
        const db = getDatabase();
        const { ObjectId } = require('mongodb');
        const courseId = new ObjectId(req.params.id);

        const result = await db.collection('courses').updateOne(
            { _id: courseId },
            { $set: req.body }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json({ message: 'Course updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE - Delete course by ID
 * DELETE /courses/:id
 */
app.delete('/courses/:id', async (req, res) => {
    try {
        const db = getDatabase();
        const { ObjectId } = require('mongodb');
        const courseId = new ObjectId(req.params.id);

        const result = await db.collection('courses').deleteOne({ _id: courseId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PROGRESS CRUD Operations
 */

/**
 * CREATE - Add new progress record
 * POST /progress
 */
app.post('/progress', async (req, res) => {
    try {
        const db = getDatabase();
        const result = await db.collection('progress').insertOne(req.body);
        res.status(201).json({
            message: 'Progress record created successfully',
            progressId: result.insertedId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * READ - Get progress records with filters
 * GET /progress
 * Query parameters: status, student_id, course_id
 */
app.get('/progress', async (req, res) => {
    try {
        const db = getDatabase();
        const { ObjectId } = require('mongodb');
        let query = {};

        if (req.query.status) {
            query.status = req.query.status;
        }

        if (req.query.student_id) {
            query.student_id = new ObjectId(req.query.student_id);
        }

        if (req.query.course_id) {
            query.course_id = new ObjectId(req.query.course_id);
        }

        const progress = await db.collection('progress').find(query).toArray();
        res.json(progress);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * UPDATE - Update progress by ID
 * PUT /progress/:id
 */
app.put('/progress/:id', async (req, res) => {
    try {
        const db = getDatabase();
        const { ObjectId } = require('mongodb');
        const progressId = new ObjectId(req.params.id);

        const result = await db.collection('progress').updateOne(
            { _id: progressId },
            { $set: req.body }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Progress record not found' });
        }

        res.json({ message: 'Progress record updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE - Delete progress by ID
 * DELETE /progress/:id
 */
app.delete('/progress/:id', async (req, res) => {
    try {
        const db = getDatabase();
        const { ObjectId } = require('mongodb');
        const progressId = new ObjectId(req.params.id);

        const result = await db.collection('progress').deleteOne({ _id: progressId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Progress record not found' });
        }

        res.json({ message: 'Progress record deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * AGGREGATION QUERIES
 */

/**
 * GET /analytics/top-active-students
 * Returns top 5 most active students based on completed courses and test scores
 */
app.get('/analytics/top-active-students', async (req, res) => {
    try {
        const db = getDatabase();

        const pipeline = [
            // Match completed courses
            {
                $match: { status: 'completed' }
            },
            // Group by student to calculate total score and course count
            {
                $group: {
                    _id: '$student_id',
                    completedCourses: { $sum: 1 },
                    totalScore: { $sum: { $avg: '$test_results.score' } },
                    lastActivity: { $max: '$last_activity' }
                }
            },
            // Sort by completed courses desc, then by total score desc
            {
                $sort: { completedCourses: -1, totalScore: -1 }
            },
            // Limit to top 5
            {
                $limit: 5
            },
            // Lookup student details
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            // Unwind the student array
            {
                $unwind: '$student'
            },
            // Project final result
            {
                $project: {
                    _id: 0,
                    studentName: '$student.name',
                    email: '$student.email',
                    completedCourses: 1,
                    averageScore: { $round: ['$totalScore', 1] },
                    lastActivity: 1
                }
            }
        ];

        const result = await db.collection('progress').aggregate(pipeline).toArray();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /analytics/students-completed-by-alternative
 * Returns students who completed courses only through alternative completion methods
 */
app.get('/analytics/students-completed-by-alternative', async (req, res) => {
    try {
        const db = getDatabase();

        const students = await db.collection('progress').find({
            status: 'completed',
            alternative_completion: { $exists: true },
            test_results: { $size: 0 } // No regular test results
        }).toArray();

        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /analytics/course-enrollment-stats
 * Returns enrollment statistics for each course
 */
app.get('/analytics/course-enrollment-stats', async (req, res) => {
    try {
        const db = getDatabase();

        const pipeline = [
            // Lookup course details
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course_id',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            {
                $unwind: '$course'
            },
            // Group by course
            {
                $group: {
                    _id: '$course_id',
                    courseTitle: { $first: '$course.title' },
                    totalEnrollments: { $sum: 1 },
                    completedCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    inProgressCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
                    },
                    droppedCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'dropped'] }, 1, 0] }
                    }
                }
            },
            // Project final result
            {
                $project: {
                    _id: 0,
                    courseTitle: 1,
                    totalEnrollments: 1,
                    completedCount: 1,
                    inProgressCount: 1,
                    droppedCount: 1,
                    completionRate: {
                        $round: [
                            { $multiply: [{ $divide: ['$completedCount', '$totalEnrollments'] }, 100] },
                            1
                        ]
                    }
                }
            },
            {
                $sort: { totalEnrollments: -1 }
            }
        ];

        const result = await db.collection('progress').aggregate(pipeline).toArray();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
