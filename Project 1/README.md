# EdTech Analytics Platform

A MongoDB-based system for tracking student progress, courses, and activity metadata in a personalized learning platform. This project demonstrates proper data structuring, CRUD operations, aggregation queries, and Role-Based Access Control (RBAC) in MongoDB.

## Features

- **Three Collections**: Users (students/instructors), Courses (with embedded modules), Progress (linking users to courses)
- **CRUD Operations**: Full Create, Read (with filtering using $regex, $gte, $lte, $or, $in), Update ($set, $inc, $push), and Delete operations
- **Aggregation Queries**: Top 5 active students report using $match, $group, $sort, $lookup; alternative completion tracking; course enrollment statistics
- **RBAC**: Custom roles (DataAnalyst, Instructor, Student) with specific permissions
- **REST API**: Express.js API for all operations
- **Unit Tests**: Comprehensive test coverage with Jest and Supertest
- **Docker Support**: Containerized deployment
- **CI/CD**: GitHub Actions workflow

## Technologies Used

- **MongoDB**: NoSQL database with native driver (no Mongoose)
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web framework for API
- **Jest**: Testing framework
- **Supertest**: API testing
- **Docker**: Containerization
- **GitHub Actions**: CI/CD pipeline

## Prerequisites

- Node.js 18+
- MongoDB 7.0+
- npm or yarn

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd NoSQL-University-Project/Project\ 1
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Ensure MongoDB is running locally on default port (27017), or set `MONGODB_URI` environment variable.

## Setup

### 1. Start MongoDB

For local MongoDB:

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Or install MongoDB locally
mongod
```

### 2. Seed Database

Populate the database with sample data:

```bash
npm run seed
```

This creates:

- 10 users (8 students, 2 instructors)
- 5 courses with embedded modules
- 15 progress records

### 3. Setup RBAC

Create custom roles and users:

```bash
npm run setup-rbac
```

This creates:

- **DataAnalyst** role: Read-only access to all collections
- **Instructor** role: Full CRUD on courses and progress, read on users
- **Student** role: Limited access to progress and courses

Users created:

- `data_analyst` / `analyst_pass123`
- `instructor_user` / `instructor_pass123`
- `student_user` / `student_pass123`

## Running the Application

Start the server:

```bash
npm start
```

The API will be available at `http://localhost:3000`

Health check: `GET /health`

## Web Interface

The application includes a web-based user interface for demonstrating API functionality.

**Access the UI at:** `http://localhost:3000`

The interface provides:

- Interactive forms for all CRUD operations
- Real-time API request/response display
- Analytics dashboard for aggregation queries
- Tab-based navigation between different data types

Use the UI to:

1. Seed initial data using the scripts
2. Create, read, update, and delete records
3. View analytics reports
4. Test different query parameters and filters

The UI showcases the full capabilities of the EdTech Analytics API without requiring external API testing tools.

## API Documentation

### Users

#### Create User

```http
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "interests": ["Data Science", "AI"],
  "role": "student",
  "enrollment_date": "2023-09-01T00:00:00Z",
  "is_active": true
}
```

#### Get Users

```http
GET /users
GET /users?role=student
GET /users?name=john&interests=Data Science
```

#### Update User

```http
PUT /users/{userId}
Content-Type: application/json

{
  "name": "Updated Name"
}
```

#### Delete User

```http
DELETE /users/{userId}
```

### Courses

#### Create Course

```http
POST /courses
Content-Type: application/json

{
  "title": "New Course",
  "lecturer": "Dr. Smith",
  "category": "Science",
  "price": 299.99,
  "modules": [...],
  "created_at": "2023-01-01T00:00:00Z",
  "is_active": true
}
```

#### Get Courses

```http
GET /courses
GET /courses?category=Data Science&price_lte=300
```

#### Update Course

```http
PUT /courses/{courseId}
```

#### Delete Course

```http
DELETE /courses/{courseId}
```

### Progress

#### Create Progress Record

```http
POST /progress
Content-Type: application/json

{
  "student_id": "...",
  "course_id": "...",
  "status": "enrolled",
  "enrollment_date": "2023-09-01T00:00:00Z",
  "current_module": 1,
  "current_lecture": 1,
  "test_results": [],
  "last_activity": "2023-09-01T00:00:00Z"
}
```

#### Get Progress

```http
GET /progress
GET /progress?status=completed&student_id={userId}
```

#### Update Progress

```http
PUT /progress/{progressId}
```

#### Delete Progress

```http
DELETE /progress/{progressId}
```

### Analytics

#### Top Active Students

```http
GET /analytics/top-active-students
```

Returns top 5 students by completed courses and average scores.

#### Students Completed by Alternative Methods

```http
GET /analytics/students-completed-by-alternative
```

Returns students who completed courses without taking regular tests.

#### Course Enrollment Statistics

```http
GET /analytics/course-enrollment-stats
```

Returns enrollment and completion statistics for each course.

## Testing

Run unit tests:

```bash
npm test
```

Tests cover:

- CRUD operations for all collections
- Filtering and querying
- Aggregation endpoints
- Error handling
- API responses

## Docker

Build the Docker image:

```bash
docker build -t edtech-analytics .
```

Run the container:

```bash
docker run -p 3000:3000 edtech-analytics
```

For development with MongoDB:

```bash
# Start MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:7.0

# Run the app
docker run -p 3000:3000 --link mongodb:mongodb -e MONGODB_URI=mongodb://mongodb:27017/edtech_analytics edtech-analytics
```

## CI/CD

The project includes GitHub Actions workflow (`.github/workflows/ci.yml`) that:

- Runs on push and pull requests
- Installs dependencies
- Runs tests against MongoDB service
- Seeds database and sets up RBAC
- Builds and tests Docker image

## Data Structure

See `dataStructures.md` for detailed document schemas.

## RBAC Demonstration

To test RBAC:

1. Connect with DataAnalyst credentials - can only read
2. Connect with Instructor credentials - can modify courses and progress
3. Connect with Student credentials - limited permissions

## Project Structure

```
Project 1/
├── app.js                 # Main Express application
├── db.js                  # MongoDB connection
├── dataStructures.md      # Data schema documentation
├── Dockerfile             # Docker configuration
├── package.json           # Dependencies and scripts
├── README.md              # This file
├── public/
│   ├── index.html         # Web UI
│   ├── styles.css         # UI styling
│   └── script.js          # UI JavaScript
├── scripts/
│   ├── seed.js           # Database seeding script
│   └── setup-rbac.js     # RBAC setup script
└── tests/
    └── test-api.js       # Unit tests
```

## License

This project is part of a university assignment and is not licensed for external use.
