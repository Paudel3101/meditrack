const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MediTrack API - Clinic Management System',
      version: '1.0.0',
      description: 'A comprehensive RESTful API for managing clinic operations including staff authentication, patient records, and appointment scheduling.',
      contact: {
        name: 'MediTrack Support',
        email: 'support@meditrack.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'API Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from the login endpoint'
        }
      },
      schemas: {
        Staff: {
          type: 'object',
          required: ['email', 'password', 'first_name', 'last_name', 'role'],
          properties: {
            id: {
              type: 'integer',
              description: 'Staff unique identifier'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Staff email address'
            },
            first_name: {
              type: 'string',
              description: 'Staff first name'
            },
            last_name: {
              type: 'string',
              description: 'Staff last name'
            },
            phone: {
              type: 'string',
              description: 'Staff phone number'
            },
            role: {
              type: 'string',
              enum: ['Admin', 'Doctor', 'Nurse', 'Receptionist'],
              description: 'Staff role/position'
            },
            specialization: {
              type: 'string',
              description: 'Medical specialization (for doctors)'
            },
            is_active: {
              type: 'boolean',
              description: 'Whether staff is active'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Patient: {
          type: 'object',
          required: ['medical_record_number', 'first_name', 'last_name', 'date_of_birth', 'gender'],
          properties: {
            id: {
              type: 'integer',
              description: 'Patient unique identifier'
            },
            medical_record_number: {
              type: 'string',
              description: 'Unique medical record number'
            },
            first_name: {
              type: 'string'
            },
            last_name: {
              type: 'string'
            },
            date_of_birth: {
              type: 'string',
              format: 'date'
            },
            gender: {
              type: 'string',
              enum: ['Male', 'Female', 'Other']
            },
            phone: {
              type: 'string'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            allergies: {
              type: 'string',
              description: 'Known allergies'
            },
            blood_type: {
              type: 'string'
            },
            is_archived: {
              type: 'boolean'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Appointment: {
          type: 'object',
          required: ['patient_id', 'staff_id', 'appointment_date', 'appointment_time'],
          properties: {
            id: {
              type: 'integer',
              description: 'Appointment unique identifier'
            },
            patient_id: {
              type: 'integer',
              description: 'ID of the patient'
            },
            staff_id: {
              type: 'integer',
              description: 'ID of the staff member'
            },
            appointment_date: {
              type: 'string',
              format: 'date'
            },
            appointment_time: {
              type: 'string',
              description: 'Time in HH:MM format'
            },
            type: {
              type: 'string',
              enum: ['checkup', 'followup', 'procedure', 'consultation']
            },
            reason: {
              type: 'string'
            },
            notes: {
              type: 'string'
            },
            status: {
              type: 'string',
              enum: ['scheduled', 'completed', 'cancelled', 'no-show']
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email'
            },
            password: {
              type: 'string',
              minLength: 6
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'first_name', 'last_name', 'role'],
          properties: {
            email: {
              type: 'string',
              format: 'email'
            },
            password: {
              type: 'string',
              minLength: 6
            },
            first_name: {
              type: 'string'
            },
            last_name: {
              type: 'string'
            },
            role: {
              type: 'string',
              enum: ['Admin', 'Doctor', 'Nurse', 'Receptionist']
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            message: {
              type: 'string'
            },
            errors: {
              type: 'object'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/auth.routes.js',
    './src/routes/patient.routes.js',
    './src/routes/appointment.routes.js',
    './src/routes/staff.routes.js',
    './src/routes/dashboard.routes.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
