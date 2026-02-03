# MediTrack - Clinic Management System

## Project Structure

```
meditrack/
│
├── server/
│   ├── src/
│   │   ├── app.js                          # Express app configuration
│   │   ├── config/
│   │   │   └── database.js                 # Database connection configuration
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js          # Authentication & login logic
│   │   │   ├── appointment.controller.js   # Appointment CRUD operations
│   │   │   ├── dashboard.controller.js     # Dashboard statistics
│   │   │   ├── patient.controller.js       # Patient CRUD operations
│   │   │   └── staff.controller.js         # Staff CRUD operations
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js          # JWT authentication middleware
│   │   │   ├── error.middleware.js         # Global error handling
│   │   │   └── validate.middleware.js      # Input validation rules
│   │   │
│   │   ├── models/
│   │   │   ├── appointment.model.js        # Appointment data model
│   │   │   ├── patient.model.js            # Patient data model
│   │   │   └── staff.model.js              # Staff data model
│   │   │
│   │   ├── routes/
│   │   │   ├── appointment.routes.js       # Appointment endpoints
│   │   │   ├── auth.routes.js              # Authentication endpoints
│   │   │   ├── dashboard.routes.js         # Dashboard endpoints
│   │   │   ├── patient.routes.js           # Patient endpoints
│   │   │   └── staff.routes.js             # Staff endpoints
│   │   │
│   │   └── utils/
│   │       ├── db.js                       # Database utility functions
│   │       └── validators.js               # Custom validation functions
│   │
│   ├── database.sql                        # Database schema & tables
│   ├── insert_data.sql                     # Sample/test data
│   ├── init-db.js                          # Database initialization script
│   ├── update-passwords.js                 # Password hashing utility
│   ├── test-all-apis.js                    # Comprehensive API test suite
│   ├── server.js                           # Main server entry point
│   ├── package.json                        # Dependencies & scripts
│   ├── .env                                # Environment variables
│   └── .env.example                        # Example environment file
│
├── postman-collection.json                 # Postman API testing collection
├── README.md                               # Project documentation
└── PROJECT_STRUCTURE.md                    # This file

```

## Database Schema

### Tables:
- **staff** - Staff members (Doctors, Nurses, Receptionists, Admin)
- **patients** - Patient records with medical information
- **appointments** - Appointment scheduling
- **medical_records** - Patient medical history
- **sessions** - User session management

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/register` - Register new staff (Admin only)
- `PUT /api/auth/password` - Update password
- `POST /api/auth/logout` - Logout

### Staff Management
- `GET /api/staff` - Get all staff
- `GET /api/staff/:id` - Get staff by ID
- `POST /api/staff` - Create staff member
- `PUT /api/staff/:id` - Update staff information
- `PUT /api/staff/:id/deactivate` - Deactivate staff
- `PUT /api/staff/:id/reactivate` - Reactivate staff

### Patient Management
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient information
- `PUT /api/patients/:id/archive` - Archive patient

### Appointment Management
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `PUT /api/appointments/:id/status` - Update appointment status
- `DELETE /api/appointments/:id` - Delete appointment

### Dashboard
- `GET /api/dashboard/stats` - Get clinic statistics
- `GET /api/dashboard/recent-appointments` - Get recent appointments
- `GET /api/dashboard/patient-count` - Get patient count breakdown

## Scripts

```bash
# Start development server
npm run dev

# Start production server
npm start

# Initialize/seed database
npm run db:init

# Run comprehensive API tests
npm run test
npm run test:api
```

## Environment Setup

### Required Environment Variables
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=meditrack_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=24h
NODE_ENV=development
```

## Default Test Credentials

```
Email: admin@meditrack.com
Password: Password123!
```

## Technologies

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Bcrypt password hashing
- **Validation**: Express Validator
- **Testing**: Custom Node.js test suite
- **API Documentation**: Postman Collection

## Testing

All endpoints have been tested and verified working:
- ✅ 31/31 API tests passing
- ✅ Authentication & Authorization
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Error handling
- ✅ Input validation
- ✅ Database constraints

Run tests with: `npm run test`

## Features

✅ User Authentication with JWT
✅ Role-based Access Control (RBAC)
✅ Staff Management
✅ Patient Records Management
✅ Appointment Scheduling with Conflict Detection
✅ Medical Records Tracking
✅ Dashboard with Analytics
✅ Session Management
✅ Comprehensive Error Handling
✅ Input Validation

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

## Development Workflow

1. Start the server: `npm run dev`
2. Initialize database: `npm run db:init`
3. Run API tests: `npm run test`
4. Use Postman collection for manual testing
5. Check database with MySQL client

## Status: ✅ Production Ready

All APIs are tested, documented, and working correctly.
