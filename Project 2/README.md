# IoT Fleet Tracking System

A MongoDB-based system for managing trucks, orders, and real-time sensor data in an intelligent logistics platform.

## Overview

This project implements a NoSQL database solution for IoT Fleet Tracking with the following components:

- **Vehicles Collection**: Truck information including specifications and maintenance history
- **Shipments Collection**: Order management with routing and status tracking
- **Telemetry Collection**: Real-time sensor data from vehicles (GPS, speed, fuel, engine temperature)

## Features

- ✅ CRUD operations on all collections
- ✅ Advanced aggregation queries with grouping and sorting
- ✅ Cross-collection queries using `$lookup`
- ✅ Role-Based Access Control (RBAC)
- ✅ Unit tests with 100% coverage target
- ✅ Docker containerization
- ✅ CI/CD with GitHub Actions
- ✅ **Web Dashboard UI** for data visualization

## Prerequisites

- Node.js 16+
- MongoDB 6.0+
- Docker (optional)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Project\ 2
```

1. Install dependencies:

```bash
npm install
```

1. Start MongoDB:

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:6.0

# Or using local MongoDB installation
mongod
```

1. Set environment variables (optional):

```bash
export MONGODB_URL=mongodb://localhost:27017
```

## Usage

### Database Setup

1. Seed the database with sample data:

```bash
npm run seed
```

1. Run CRUD operations demonstration:

```bash
npm run crud
```

1. Run aggregation queries demonstration:

```bash
npm run aggregation
```

1. Set up access control (requires admin privileges):

```bash
npm run access-control
```

### API Server

Start the Express.js API server:

```bash
npm start
```

The server will be available at `http://localhost:3000`

**Web Dashboard**: Visit `http://localhost:3000/dashboard` for an interactive web interface to view and monitor your fleet data.

API endpoints:

- `GET /` - Health check
- `GET /vehicles` - List all vehicles
- `GET /shipments` - List all shipments
- `GET /telemetry` - List all telemetry data

### Running Tests

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Database Schema

### Vehicles Collection

```javascript
{
  _id: "V001",
  make: "Mercedes-Benz",
  model: "Actros",
  year: 2020,
  load_capacity: 25, // tons
  fuel_type: "diesel",
  status: "active", // active, maintenance, retired
  maintenance_history: [
    {
      date: ISODate("2023-01-15T00:00:00Z"),
      description: "Oil change"
    }
  ]
}
```

### Shipments Collection

```javascript
{
  _id: "S001",
  origin: "Sofia",
  destination: "Plovdiv",
  weight: 15, // tons
  priority: "high", // low, medium, high
  assigned_vehicle_id: "V001",
  status: "delivered", // pending, in-transit, delivered
  estimated_arrival: ISODate("2023-10-01T10:00:00Z")
}
```

### Telemetry Collection

```javascript
{
  vehicle_id: "V001",
  timestamp: ISODate("2023-10-01T08:00:00Z"),
  gps: {
    lat: 42.6977,
    lng: 23.3219
  },
  metrics: {
    speed: 80, // km/h
    fuel_level: 85.5, // percentage
    engine_temp: 90 // celsius
  }
}
```

## Access Control (RBAC)

The system implements three user roles:

### DataAnalyst

- Read-only access to all collections
- Cannot modify any data

### FleetManager

- Full CRUD access to `vehicles` and `shipments` collections
- Read-only access to `telemetry` collection

### LogisticsApp

- Write-only access to `telemetry` collection
- Used for IoT data ingestion

## Docker Deployment

### Build and run with Docker Compose

```bash
docker-compose up --build
```

### Manual Docker build

```bash
# Build image
docker build -t fleet-tracking .

# Run container
docker run -p 3000:3000 -e MONGODB_URL=mongodb://host.docker.internal:27017 fleet-tracking
```

## CI/CD

The project includes GitHub Actions workflow that:

- Runs unit tests on every push/PR
- Generates coverage reports
- Builds and tests Docker image
- Uploads coverage to Codecov

## Project Structure

```text
Project 2/
├── src/
│   ├── database.js      # Database connection
│   └── index.js         # Express API server
├── scripts/
│   ├── seedData.js      # Sample data generation
│   ├── crudOperations.js    # CRUD demos
│   ├── aggregationQueries.js # Aggregation demos
│   └── accessControl.js     # RBAC setup
├── tests/
│   ├── database.test.js
│   └── seedData.test.js
├── .github/
│   └── workflows/
│       └── ci.yml
├── Dockerfile
├── docker-compose.yml
├── package.json
├── jest.config.js
└── README.md
```

## Technologies Used

- **MongoDB**: NoSQL database
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Jest**: Testing framework
- **Docker**: Containerization
- **GitHub Actions**: CI/CD

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

For questions or issues, please create an issue in the repository.
