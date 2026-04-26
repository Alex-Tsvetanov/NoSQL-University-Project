const { connectToDatabase, closeConnection } = require('../db');
const { ObjectId } = require('mongodb');

async function seedDatabase() {
    let db;
    try {
        db = await connectToDatabase();
        console.log('Starting comprehensive database seeding...');

        // Clear existing collections
        await db.collection('users').deleteMany({});
        await db.collection('courses').deleteMany({});
        await db.collection('progress').deleteMany({});
        console.log('Cleared existing data.');

        // 1. Seed Users (22 Students, 3 Instructors)
        const usersData = [
            { name: "Алекс Цветанов", email: "alex.t@university.bg", interests: ["NoSQL", "Database Design", "Full-Stack"], role: "student", enrollment_date: new Date("2023-09-01"), is_active: true },
            { name: "Мария Иванова", email: "m.ivanova@university.bg", interests: ["Data Science", "AI", "Python"], role: "student", enrollment_date: new Date("2023-09-05"), is_active: true },
            { name: "Георги Петров", email: "g.petrov@university.bg", interests: ["Cybersecurity", "Networking", "C++"], role: "student", enrollment_date: new Date("2023-10-10"), is_active: true },
            { name: "Елена Стоянова", email: "e.stoyanova@university.bg", interests: ["UX/UI Design", "Figma", "Digital Marketing"], role: "student", enrollment_date: new Date("2023-11-20"), is_active: true },
            { name: "Иван Димитров", email: "i.dimitrov@university.bg", interests: ["Mobile Development", "Flutter", "Dart"], role: "student", enrollment_date: new Date("2024-01-15"), is_active: true },
            { name: "София Николова", email: "s.nikolova@university.bg", interests: ["Data Science", "Statistics", "Machine Learning"], role: "student", enrollment_date: new Date("2024-02-10"), is_active: true },
            { name: "Димитър Ангелов", email: "d.angelov@university.bg", interests: ["Cloud Computing", "AWS", "DevOps"], role: "student", enrollment_date: new Date("2024-03-05"), is_active: true },
            { name: "Кристина Михайлова", email: "k.mihailova@university.bg", interests: ["Blockchain", "Fintech", "Solidity"], role: "student", enrollment_date: new Date("2024-03-20"), is_active: true },
            { name: "Стефан Борисов", email: "s.borisov@university.bg", interests: ["Game Development", "Unity", "C#"], role: "student", enrollment_date: new Date("2024-01-05"), is_active: false },
            { name: "Виктория Генова", email: "v.genova@university.bg", interests: ["Bioinformatics", "Genomics", "R"], role: "student", enrollment_date: new Date("2023-08-22"), is_active: true },
            { name: "Мартин Тодоров", email: "m.todorov@university.bg", interests: ["Embedded Systems", "Arduino", "IoT"], role: "student", enrollment_date: new Date("2023-12-10"), is_active: true },
            { name: "Йоана Павлова", email: "y.pavlova@university.bg", interests: ["Human-Computer Interaction", "Cognitive Psychology"], role: "student", enrollment_date: new Date("2024-03-12"), is_active: true },
            // Adding 10 more students as requested
            { name: "Никола Василев", email: "n.vasilev@university.bg", interests: ["Algorithms", "Data Structures"], role: "student", enrollment_date: new Date("2023-09-12"), is_active: true },
            { name: "Габриела Кирова", email: "g.kirova@university.bg", interests: ["Deep Learning", "Convolutional Neural Networks"], role: "student", enrollment_date: new Date("2023-09-18"), is_active: true },
            { name: "Павел Костов", email: "p.kostov@university.bg", interests: ["System Administration", "Linux"], role: "student", enrollment_date: new Date("2023-10-05"), is_active: true },
            { name: "Лилия Семова", email: "l.semova@university.bg", interests: ["Animation", "3D Modeling"], role: "student", enrollment_date: new Date("2023-11-28"), is_active: true },
            { name: "Радослав Динев", email: "r.dinev@university.bg", interests: ["Financial Engineering", "Risk Management"], role: "student", enrollment_date: new Date("2024-01-20"), is_active: true },
            { name: "Теодора Маринчева", email: "t.marincheva@university.bg", interests: ["Mobile UX", "Material Design"], role: "student", enrollment_date: new Date("2024-02-14"), is_active: true },
            { name: "Кирил Вълев", email: "k.valev@university.bg", interests: ["Robotics", "Control Systems"], role: "student", enrollment_date: new Date("2024-03-08"), is_active: true },
            { name: "Силвия Радоева", email: "s.radoeva@university.bg", interests: ["Marketing Analytics", "Consumer Behavior"], role: "student", enrollment_date: new Date("2024-03-22"), is_active: true },
            { name: "Емил Недялков", email: "e.nedyalkov@university.bg", interests: ["Software Testing", "QA Automation"], role: "student", enrollment_date: new Date("2024-01-10"), is_active: true },
            { name: "Десислава Кунева", email: "d.kuneva@university.bg", interests: ["E-commerce", "Sales Platforms"], role: "student", enrollment_date: new Date("2023-12-15"), is_active: true },
            
            { name: "доц. д-р Анна Кръстева", email: "a.krasteva@university.bg", interests: ["Advanced Mathematics", "Big Data Analytics"], role: "instructor", enrollment_date: new Date("2015-02-01"), is_active: true },
            { name: "проф. Владимир Георгиев", email: "v.georgiev@university.bg", interests: ["Software Architecture", "Security Systems"], role: "instructor", enrollment_date: new Date("2010-09-15"), is_active: true },
            { name: "д-р Калина Савова", email: "k.savova@university.bg", interests: ["Frontend Frameworks", "Modern CSS"], role: "instructor", enrollment_date: new Date("2019-06-20"), is_active: true }
        ];

        const usersResult = await db.collection('users').insertMany(usersData);
        const userIds = Object.values(usersResult.insertedIds);
        console.log(`Inserted ${userIds.length} users.`);

        // 2. Seed Courses (10 Courses)
        const coursesData = [
            {
                title: "Въведение в Data Science",
                lecturer: "доц. д-р Анна Кръстева",
                category: "Data Science",
                price: 299.99,
                modules: [
                    { title: "Модул 1: Основи на данните", lectures: [{ title: "Какво са данните?", duration: 45, video_url: "https://example.com/ds1.mp4" }, { title: "Типове данни", duration: 30, video_url: "https://example.com/ds2.mp4" }] },
                    { title: "Модул 2: Статистика за начинаещи", lectures: [{ title: "Разпределения", duration: 60, video_url: "https://example.com/ds3.mp4" }] }
                ],
                created_at: new Date("2023-01-15"), is_active: true
            },
            {
                title: "Проектиране на NoSQL бази данни",
                lecturer: "доц. д-р Анна Кръстева",
                category: "Database Design",
                price: 199.99,
                modules: [
                    { title: "Модул 1: Въведение в NoSQL", lectures: [{ title: "Сравнение с SQL", duration: 50, video_url: "https://example.com/nosql1.mp4" }] },
                    { title: "Модул 2: Работа с MongoDB", lectures: [{ title: "CRUD операции", duration: 70, video_url: "https://example.com/nosql2.mp4" }] }
                ],
                created_at: new Date("2023-06-10"), is_active: true
            },
            {
                title: "Full-Stack уеб разработка",
                lecturer: "д-р Калина Савова",
                category: "Web Development",
                price: 499.99,
                modules: [
                    { title: "Модул 1: React.js", lectures: [{ title: "Компоненти и Hooks", duration: 120, video_url: "https://example.com/web1.mp4" }] },
                    { title: "Модул 2: Node.js и Express", lectures: [{ title: "Създаване на REST API", duration: 90, video_url: "https://example.com/web2.mp4" }] }
                ],
                created_at: new Date("2023-08-01"), is_active: true
            },
            {
                title: "Киберсигурност за напреднали",
                lecturer: "проф. Владимир Георгиев",
                category: "Cybersecurity",
                price: 350.00,
                modules: [
                    { title: "Модул 1: Защита на мрежи", lectures: [{ title: "Firewalls и Intrusion Detection", duration: 100, video_url: "https://example.com/sec1.mp4" }] }
                ],
                created_at: new Date("2023-11-15"), is_active: true
            },
            {
                title: "Мобилни приложения с Flutter",
                lecturer: "д-р Калина Савова",
                category: "Web Development",
                price: 249.99,
                modules: [
                    { title: "Модул 1: Запознаване с Flutter", lectures: [{ title: "Widgets и State Management", duration: 150, video_url: "https://example.com/flutter1.mp4" }] }
                ],
                created_at: new Date("2024-01-05"), is_active: true
            },
            {
                title: "UX/UI Дизайн и Прототипиране",
                lecturer: "д-р Калина Савова",
                category: "Design",
                price: 180.00,
                modules: [
                    { title: "Модул 1: Основи на дизайна", lectures: [{ title: "Цветознание и типография", duration: 60, video_url: "https://example.com/ui1.mp4" }] }
                ],
                created_at: new Date("2023-09-20"), is_active: true
            },
            {
                title: "Облачни технологии с AWS",
                lecturer: "проф. Владимир Георгиев",
                category: "Cloud Computing",
                price: 420.00,
                modules: [
                    { title: "Модул 1: AWS услуги", lectures: [{ title: "EC2 и S3", duration: 80, video_url: "https://example.com/cloud1.mp4" }] }
                ],
                created_at: new Date("2024-02-01"), is_active: true
            },
            {
                title: "Разработка на игри с Unity",
                lecturer: "проф. Владимир Георгиев",
                category: "Game Design",
                price: 300.00,
                modules: [
                    { title: "Модул 1: Unity Engine", lectures: [{ title: "3D обекти и физика", duration: 110, video_url: "https://example.com/game1.mp4" }] }
                ],
                created_at: new Date("2023-10-15"), is_active: true
            },
            {
                title: "Blockchain и Смарт Контракти",
                lecturer: "доц. д-р Анна Кръстева",
                category: "Fintech",
                price: 550.00,
                modules: [
                    { title: "Модул 1: Ethereum", lectures: [{ title: "Solidity основи", duration: 140, video_url: "https://example.com/bc1.mp4" }] }
                ],
                created_at: new Date("2024-03-01"), is_active: true
            },
            {
                title: "Интернет на нещата (IoT)",
                lecturer: "проф. Владимир Георгиев",
                category: "Hardware",
                price: 220.00,
                modules: [
                    { title: "Модул 1: Сензори и микроконтролери", lectures: [{ title: "Arduino програмиране", duration: 90, video_url: "https://example.com/iot1.mp4" }] }
                ],
                created_at: new Date("2023-05-12"), is_active: true
            }
        ];

        const coursesResult = await db.collection('courses').insertMany(coursesData);
        const courseIds = Object.values(coursesResult.insertedIds);
        console.log(`Inserted ${courseIds.length} courses.`);

        // 3. Seed Progress (50 records linking users to courses)
        const progressData = [];
        
        // Helper to get random status
        const statuses = ["enrolled", "in_progress", "completed", "dropped"];
        
        // Generate 50 progress documents (covering all 22 students)
        for (let i = 0; i < 50; i++) {
            const studentIdx = i % 22; // Use all 22 students
            const courseIdx = i % 10;   // Use all 10 courses
            const status = statuses[i % 4];
            const enrollmentDate = new Date(2023, 8 + (i % 4), 1 + (i % 28));
            
            const progress = {
                student_id: userIds[studentIdx],
                course_id: courseIds[courseIdx],
                status: status,
                enrollment_date: enrollmentDate,
                completion_date: status === "completed" ? new Date(enrollmentDate.getTime() + 60*24*60*60*1000) : null,
                current_module: status === "completed" ? 2 : 1,
                current_lecture: status === "completed" ? 2 : 1,
                test_results: [],
                last_activity: new Date()
            };

            // Add some test results to randomized records
            if (i % 3 === 0) {
                progress.test_results.push({
                    module: 1,
                    score: 75 + (i % 25),
                    attempts: 1,
                    date_taken: new Date(enrollmentDate.getTime() + 15*24*60*60*1000)
                });
            }
            
            // Add alternative completion for some completed courses
            if (status === "completed" && i % 5 === 0) {
                progress.alternative_completion = {
                    type: i % 2 === 0 ? "project" : "exam",
                    description: "Забележително представяне при финалния проект",
                    grade: "6.00"
                };
            }

            progressData.push(progress);
        }

        const progressResult = await db.collection('progress').insertMany(progressData);
        console.log(`Inserted ${progressResult.insertedCount} progress records.`);

        console.log('\n=== Database Seeding Completed ===');
        console.log(`Total Records: ${userIds.length + courseIds.length + progressResult.insertedCount}`);
        console.log(`- Users: ${userIds.length}`);
        console.log(`- Courses: ${courseIds.length}`);
        console.log(`- Progress Records: ${progressResult.insertedCount}`);
        
    } catch (error) {
        console.error('Error during database seeding:', error);
    } finally {
        await closeConnection();
    }
}

seedDatabase();

