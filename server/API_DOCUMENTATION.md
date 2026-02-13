# MediTrack - Clinic Management System API

A comprehensive RESTful API for managing clinic operations including staff authentication, patient records, and appointment scheduling.

## Project Overview

MediTrack is a **headless backend** system designed to power clinic management applications. It provides secure authentication, patient data management, and appointment scheduling functionality with role-based access control.

### Key Features

- **User Authentication**: Secure staff login/registration with JWT tokens
- **Patient Management**: CRUD operations for patient records with medical history tracking
- **Appointment Scheduling**: Schedule, manage, and track appointments with conflict detection
- **Staff Management**: Manage clinic staff members with role-based permissions
- **Dashboard Analytics**: Real-time statistics and insights for clinic operations
- **Role-Based Access Control**: Different permission levels for Admin, Doctor, Nurse, and Receptionist roles
- **API Documentation**: Interactive Swagger UI documentation at `/api-docs`

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL/MariaDB (with mysql2 driver)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Security**: Helmet.js for HTTP headers
- **Logger**: Morgan for request logging
- **Documentation**: Swagger/OpenAPI 3.0 with swagger-ui-express

## Project Structure

```
server/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── config/
│   │   ├── database.js        # Database configuration
│   │   └── swagger.js         # Swagger/OpenAPI configuration
│   ├── controllers/           # Business logic for each endpoint
│   │   ├── auth.controller.js
│   │   ├── patient.controller.js
│   │   ├── appointment.controller.js
│   │   ├── staff.controller.js
│   │   └── dashboard.controller.js
│   ├── middleware/            # Custom middleware functions
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   ├── models/               # Database models
│   │   ├── patient.model.js
│   │   ├── appointment.model.js
│   │   └── staff.model.js
│   ├── routes/               # API route definitions
│   │   ├── auth.routes.js
│   │   ├── patient.routes.js
│   │   ├── appointment.routes.js
│   │   ├── staff.routes.js
│   │   └── dashboard.routes.js
│   └── utils/                # Utility functions
│       ├── db.js             # Database connection manager
│       └── validators.js     # Input validation functions
├── database.sql              # Database schema
├── init-db.js               # Database initialization script
├── server.js                # Entry point
└── package.json             # Dependencies

```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL/MariaDB database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd meditrack/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the server directory:
   ```env
   # Server
   PORT=5000
   NODE_ENV=development
   API_URL=http://localhost:5000

   # Database
   DB_HOST=your_db_host
   DB_PORT=3306
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=meditrack_db

   # JWT
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=24h

   # CORS
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Initialize Database**
   ```bash
   npm run db:init
   ```
   This will create all necessary tables and relationships.

5. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## API Documentation

### Interactive API Documentation

Access the interactive Swagger UI documentation at:
```
http://localhost:5000/api-docs
```

The documentation includes:
- All available endpoints
- Request/response examples
- Parameter descriptions
- Authentication requirements
- Error code descriptions

### API Base URL

```
http://localhost:5000/api
```

### Authentication

The API uses **JWT (JSON Web Token)** for authentication. 

1. **Get a Token**: Use the `/api/auth/login` endpoint
2. **Include in Requests**: Add the token to the Authorization header:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

## Data Models

### The Three Core Entities

#### 1. **Staff (Users)**
Clinic staff members with authentication and role-based access.

**Key Fields**:
- `id`: Unique integer identifier
- `email`: Unique email address
- `password_hash`: Bcrypt hashed password (never stored in plain text)
- `first_name`, `last_name`: Staff name
- `role`: Admin, Doctor, Nurse, or Receptionist
- `is_active`: Boolean status

**Table Relationships**: 
- One-to-Many with Appointments (staff_id as foreign key)

#### 2. **Patients (Resource A)**
Patient records with medical history and contact information.

**Key Fields**:
- `id`: Unique integer identifier
- `medical_record_number`: Unique MRN for identification
- `first_name`, `last_name`: Patient name
- `date_of_birth`: Date of birth
- `gender`: Male, Female, or Other
- `phone`, `email`: Contact information
- `allergies`: Known allergies
- `blood_type`: Blood type information
- `is_archived`: Boolean status for soft deletion

**Table Relationships**:
- One-to-Many with Appointments (patient_id as foreign key)

#### 3. **Appointments (Resource B)**
Appointment records linking patients and staff.

**Key Fields**:
- `id`: Unique integer identifier
- `patient_id`: Foreign key to Patient
- `staff_id`: Foreign key to Staff
- `appointment_date`: Date of appointment
- `appointment_time`: Time of appointment
- `type`: checkup, followup, procedure, or consultation
- `status`: scheduled, completed, cancelled, or no-show
- `reason`, `notes`: Appointment details

**Table Relationships**:
- Many-to-One with Patient (patient_id)
- Many-to-One with Staff (staff_id)

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/api/auth/login` | Staff member login | No |
| POST | `/api/auth/register` | Register new staff member | No |
| GET | `/api/auth/profile` | Get current user profile | Yes |
| PUT | `/api/auth/password` | Update password | Yes |
| POST | `/api/auth/logout` | User logout | Yes |

### Patient Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/api/patients` | Get all patients | Yes |
| GET | `/api/patients/:id` | Get patient by ID | Yes |
| GET | `/api/patients/search` | Search patients | Yes |
| POST | `/api/patients` | Create new patient | Yes |
| PUT | `/api/patients/:id` | Update patient | Yes |
| PUT | `/api/patients/:id/archive` | Archive patient | Yes |
| PUT | `/api/patients/:id/unarchive` | Restore archived patient | Yes |

### Appointment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/api/appointments` | Get all appointments | Yes |
| GET | `/api/appointments/:id` | Get appointment by ID | Yes |
| POST | `/api/appointments` | Create appointment | Yes |
| PUT | `/api/appointments/:id` | Update appointment | Yes |
| PUT | `/api/appointments/:id/status` | Update status | Yes |
| DELETE | `/api/appointments/:id` | Delete appointment | Yes |

### Staff Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/api/staff` | Get all staff | Yes |
| GET | `/api/staff/:id` | Get staff by ID | Yes |
| POST | `/api/staff` | Create new staff | Yes |
| PUT | `/api/staff/:id` | Update staff | Yes |
| PUT | `/api/staff/:id/deactivate` | Deactivate staff | Yes |
| PUT | `/api/staff/:id/reactivate` | Reactivate staff | Yes |

### Dashboard Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/api/dashboard/stats` | Get clinic statistics | Yes |
| GET | `/api/dashboard/recent-appointments` | Get recent appointments | Yes |
| GET | `/api/dashboard/patient-count` | Get patient count | Yes |

### System Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health status |
| GET | `/api-docs` | Swagger UI documentation |

## HTTP Status Codes

The API returns standard HTTP status codes:

- **200 OK**: Successful GET, PUT request
- **201 Created**: Successful POST request (resource created)
- **400 Bad Request**: Invalid input or validation error
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Authenticated but insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists or scheduling conflict
- **500 Server Error**: Internal server error

## Security Features

### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication with configurable expiration
- **Password Hashing**: All passwords hashed using bcrypt (never stored plain text)
- **Role-Based Access Control**: Different endpoints require different roles
- **Token Expiration**: Tokens expire after 24 hours (configurable)

### Data Protection

- **SQL Injection Prevention**: Using parameterized queries (mysql2)
- **CORS Protection**: Configurable CORS origins
- **Helmet.js**: Sets security HTTP headers
- **Input Validation**: Comprehensive validation on all endpoints
- **Soft Deletes**: Patients can be archived instead of deleted

## Testing

### Using Postman

1. Import the Postman collection from the repository
2. Configure environment variables (API_URL, JWT_TOKEN)
3. Test each endpoint with provided examples

### Using curl

**Login Example**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@clinic.com",
    "password": "SecurePassword123!"
  }'
```

**Get Patients (with JWT)**:
```bash
curl -X GET http://localhost:5000/api/patients \
  -H "Authorization: Bearer your_jwt_token_here"
```

## Database Schema Notes

- **Foreign Key Relationships**: All foreign keys are properly defined for data integrity
- **Indexes**: Optimized indexes on frequently queried columns (email, MRN, status)
- **Timestamps**: All tables include `created_at` and `updated_at` fields
- **Auto-increment IDs**: All primary keys use auto-increment for unique identification

## Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your_strong_secret_key
JWT_EXPIRE=24h
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=meditrack_prod
CORS_ORIGIN=https://your-frontend-domain.com
```

### Recommended Hosting Platforms

- **Render** (with managed MySQL)
- **Heroku** (with JawsDB MySQL)
- **PlanetScale** (MySQL-compatible database)
- **AWS** (EC2 + RDS)
- **DigitalOcean** (App Platform + Managed Database)

## Code Quality Standards

- **Modular Architecture**: Clear separation of concerns (routes, controllers, models, middleware)
- **Error Handling**: Comprehensive error handling throughout the application
- **Input Validation**: All user inputs validated before processing
- **Code Comments**: Well-documented code for maintainability
- **Naming Conventions**: Clear, descriptive names for functions and variables
- **DRY Principle**: Reusable utility functions to avoid code duplication

## Scripts

```bash
# Development
npm run dev              # Start with nodemon auto-reload

# Production
npm start               # Standard start command

# Database
npm run db:init        # Initialize database with schema
npm run db:create      # Same as db:init

# Testing
npm test               # Run API tests
npm run test:api       # Test all endpoints
```

## Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For issues or questions:
- Check the API documentation at `/api-docs`
- Review the Postman collection for endpoint examples
- Check database.sql for schema details

---

**Version**: 1.0.0  
**Last Updated**: February 2026
