const { connectToDatabase, closeConnection } = require('./db');

async function runPlayground() {
    let db;
    try {
        db = await connectToDatabase();
        console.log('--- MongoDB Playground Started ---');
        const stefanAlternative = await db.collection('users').aggregate([
            { $match: { name: 'Стефан Борисов' } },
            {
                $lookup: {
                    from: 'progress',
                    localField: '_id',
                    foreignField: 'student_id',
                    as: 'progress_records'
                }
            },
            { $unwind: '$progress_records' },
            { $match: { 'progress_records.alternative_completion': { $exists: true, $ne: null } } },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'progress_records.course_id',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            { $unwind: '$course' },
            {
                $project: {
                    _id: 0,
                    student_name: '$name',
                    course_title: '$course.title',
                    completion_type: '$progress_records.alternative_completion.type',
                    description: '$progress_records.alternative_completion.description',
                    grade: '$progress_records.alternative_completion.grade'
                }
            }
        ]).toArray();
        console.table(stefanAlternative);
    } catch (error) {
        console.error('Playground Error:', error);
    } finally {
        await closeConnection();
        console.log('\n--- MongoDB Playground Closed ---');
    }
}

// Start the playground
runPlayground();
