const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true // Don't throw on any status code
});

// Test data
let authToken = '';
let createdStaffId = '';
let createdPatientId = '';
let createdAppointmentId = '';

// Generate unique values for each test run
const timestamp = Date.now();
const uniqueEmail = `dr.test.${timestamp}@meditrack.com`;
const uniqueMRN = `MRN${timestamp}`;
const uniquePhone = `555${Math.floor(Math.random() * 9000000 + 1000000)}`;

// Helper function to print test results
const printTest = (testName, passed, details = '') => {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${testName}`);
  if (details) console.log(`   ${details}`);
};

// Authentication Tests
async function testAuthentication() {
  console.log('\n========== AUTHENTICATION TESTS ==========\n');

  try {
    // Test 1: Login
    const loginRes = await api.post('/auth/login', {
      email: 'admin@meditrack.com',
      password: 'Password123!'
    });

    const loginPassed = loginRes.status === 200 && loginRes.data.success;
    printTest('Login', loginPassed, `Status: ${loginRes.status}`);

    if (loginPassed) {
      authToken = loginRes.data.data.token;
      console.log(`   Token: ${authToken.substring(0, 20)}...`);
    } else {
      console.log(`   Error: ${loginRes.data.message}`);
      return;
    }

    // Test 2: Get Profile
    const profileRes = await api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const profilePassed = profileRes.status === 200 && profileRes.data.success;
    printTest('Get Profile', profilePassed, `Status: ${profileRes.status}`);

  } catch (error) {
    console.error('Authentication test error:', error.message);
  }
}

// Staff CRUD Tests
async function testStaffOperations() {
  console.log('\n========== STAFF CRUD TESTS ==========\n');

  try {
    // Test 1: Get All Staff
    const getAllRes = await api.get('/staff', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const getAllPassed = getAllRes.status === 200 && getAllRes.data.success;
    printTest('Get All Staff', getAllPassed, `Found: ${getAllRes.data.data?.length} staff members`);

    // Test 2: Get Staff by ID
    const getByIdRes = await api.get('/staff/1', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const getByIdPassed = getByIdRes.status === 200 && getByIdRes.data.success;
    printTest('Get Staff by ID', getByIdPassed, `Staff: ${getByIdRes.data.data?.first_name} ${getByIdRes.data.data?.last_name}`);

    // Test 3: Create Staff
    const createRes = await api.post('/staff', {
      email: uniqueEmail,
      password: 'TestPass123!',
      first_name: 'Test',
      last_name: 'Doctor',
      phone: uniquePhone,
      role: 'Doctor'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const createPassed = createRes.status === 201 && createRes.data.success;
    printTest('Create Staff', createPassed, `Status: ${createRes.status}`);

    if (createPassed) {
      createdStaffId = createRes.data.data.id;
      console.log(`   Created Staff ID: ${createdStaffId}`);
    } else {
      console.log(`   Error: ${createRes.data.message}`);
    }

    // Test 4: Update Staff
    const updateRes = await api.put(`/staff/${createdStaffId || 1}`, {
      phone: '5559999999',
      specialization: 'Cardiology'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const updatePassed = updateRes.status === 200 && updateRes.data.success;
    printTest('Update Staff', updatePassed, `Status: ${updateRes.status}`);

    // Test 5: Deactivate Staff
    const deactivateRes = await api.put(`/staff/${createdStaffId || 1}/deactivate`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const deactivatePassed = deactivateRes.status === 200 && deactivateRes.data.success;
    printTest('Deactivate Staff', deactivatePassed, `Status: ${deactivateRes.status}`);

    // Test 6: Reactivate Staff
    const reactivateRes = await api.put(`/staff/${createdStaffId || 1}/reactivate`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const reactivatePassed = reactivateRes.status === 200 && reactivateRes.data.success;
    printTest('Reactivate Staff', reactivatePassed, `Status: ${reactivateRes.status}`);

  } catch (error) {
    console.error('Staff test error:', error.message);
  }
}

// Patient CRUD Tests
async function testPatientOperations() {
  console.log('\n========== PATIENT CRUD TESTS ==========\n');

  try {
    // Test 1: Get All Patients
    const getAllRes = await api.get('/patients', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const getAllPassed = getAllRes.status === 200 && getAllRes.data.success;
    printTest('Get All Patients', getAllPassed, `Found: ${getAllRes.data.data?.length} patients`);

    // Test 2: Get Patient by ID
    const getByIdRes = await api.get('/patients/1', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const getByIdPassed = getByIdRes.status === 200 && getByIdRes.data.success;
    printTest('Get Patient by ID', getByIdPassed, `Patient: ${getByIdRes.data.data?.first_name} ${getByIdRes.data.data?.last_name}`);

    // Test 3: Create Patient
    const createRes = await api.post('/patients', {
      medical_record_number: uniqueMRN,
      first_name: 'John',
      last_name: 'TestPatient',
      date_of_birth: '1990-05-15',
      gender: 'Male',
      phone: uniquePhone,
      email: `patient.${timestamp}@example.com`,
      address: '123 Test St',
      city: 'Springfield',
      state: 'IL',
      zip_code: '62701',
      allergies: 'Penicillin',
      blood_type: 'O+'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const createPassed = createRes.status === 201 && createRes.data.success;
    printTest('Create Patient', createPassed, `Status: ${createRes.status}`);

    if (createPassed) {
      createdPatientId = createRes.data.data.id;
      console.log(`   Created Patient ID: ${createdPatientId}`);
    } else {
      console.log(`   Error: ${createRes.data.message}`);
    }

    // Test 4: Update Patient
    const updateRes = await api.put(`/patients/${createdPatientId || 1}`, {
      phone: '5552222222',
      address: '456 New St',
      city: 'Chicago'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const updatePassed = updateRes.status === 200 && updateRes.data.success;
    printTest('Update Patient', updatePassed, `Status: ${updateRes.status}`);

    // Test 5: Archive Patient
    const archiveRes = await api.put(`/patients/${createdPatientId || 2}/archive`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const archivePassed = archiveRes.status === 200 && archiveRes.data.success;
    printTest('Archive Patient', archivePassed, `Status: ${archiveRes.status}`);
    if (!archivePassed) {
      console.log(`   Error: ${archiveRes.data.message}`);
    }

  } catch (error) {
    console.error('Patient test error:', error.message);
  }
}

// Appointment CRUD Tests
async function testAppointmentOperations() {
  console.log('\n========== APPOINTMENT CRUD TESTS ==========\n');

  try {
    // Test 1: Get All Appointments
    const getAllRes = await api.get('/appointments', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const getAllPassed = getAllRes.status === 200 && getAllRes.data.success;
    printTest('Get All Appointments', getAllPassed, `Found: ${getAllRes.data.data?.length} appointments`);

    // Test 2: Get Appointment by ID
    const getByIdRes = await api.get('/appointments/1', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const getByIdPassed = getByIdRes.status === 200 && getByIdRes.data.success;
    printTest('Get Appointment by ID', getByIdPassed, `Status: ${getByIdRes.status}`);

    // Test 3: Create Appointment
    const createRes = await api.post('/appointments', {
      patient_id: 5,
      doctor_id: 3,
      appointment_date: '2026-04-15',
      appointment_time: '15:30',
      notes: 'Regular checkup'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const createPassed = createRes.status === 201 && createRes.data.success;
    printTest('Create Appointment', createPassed, `Status: ${createRes.status}`);

    if (createPassed) {
      createdAppointmentId = createRes.data.data.id;
      console.log(`   Created Appointment ID: ${createdAppointmentId}`);
    } else {
      console.log(`   Error: ${createRes.data.message}`);
    }

    // Test 4: Update Appointment
    const updateRes = await api.put(`/appointments/${createdAppointmentId || 1}`, {
      notes: 'Updated notes'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const updatePassed = updateRes.status === 200 && updateRes.data.success;
    printTest('Update Appointment', updatePassed, `Status: ${updateRes.status}`);

    // Test 5: Update Appointment Status
    const statusRes = await api.put(`/appointments/${createdAppointmentId || 1}/status`, {
      status: 'Completed'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const statusPassed = statusRes.status === 200 && statusRes.data.success;
    printTest('Update Appointment Status', statusPassed, `Status: ${statusRes.status}`);

    // Test 6: Delete Appointment (will fail for completed, so test with another)
    const deleteCreateRes = await api.post('/appointments', {
      patient_id: 6,
      doctor_id: 4,
      appointment_date: '2026-05-20',
      appointment_time: '11:00',
      notes: 'To be deleted'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (deleteCreateRes.status === 201) {
      const appointmentToDelete = deleteCreateRes.data.data.id;
      const deleteRes = await api.delete(`/appointments/${appointmentToDelete}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      const deletePassed = deleteRes.status === 200 && deleteRes.data.success;
      printTest('Delete Appointment', deletePassed, `Status: ${deleteRes.status}`);
    } else {
      printTest('Delete Appointment', false, 'Could not create test appointment');
    }

  } catch (error) {
    console.error('Appointment test error:', error.message);
  }
}

// Dashboard Tests
async function testDashboard() {
  console.log('\n========== DASHBOARD TESTS ==========\n');

  try {
    // Test 1: Get Statistics
    const statsRes = await api.get('/dashboard/stats', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const statsPassed = statsRes.status === 200 && statsRes.data.success;
    printTest('Get Dashboard Stats', statsPassed, `Status: ${statsRes.status}`);
    if (statsPassed) {
      console.log(`   Total Patients: ${statsRes.data.data.total_patients}`);
      console.log(`   Total Staff: ${statsRes.data.data.total_staff}`);
      console.log(`   Today's Appointments: ${statsRes.data.data.today_appointments}`);
    }

    // Test 2: Get Recent Appointments
    const recentRes = await api.get('/dashboard/recent-appointments', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const recentPassed = recentRes.status === 200 && recentRes.data.success;
    printTest('Get Recent Appointments', recentPassed, `Found: ${recentRes.data.data?.length} appointments`);

    // Test 3: Get Patient Count
    const countRes = await api.get('/dashboard/patient-count', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const countPassed = countRes.status === 200 && countRes.data.success;
    printTest('Get Patient Count', countPassed, `Status: ${countRes.status}`);
    if (countPassed) {
      console.log(`   Active Patients: ${countRes.data.data.active_patients}`);
      console.log(`   Archived Patients: ${countRes.data.data.archived_patients}`);
    }

  } catch (error) {
    console.error('Dashboard test error:', error.message);
  }
}

// Error Handling Tests
async function testErrorHandling() {
  console.log('\n========== ERROR HANDLING TESTS ==========\n');

  try {
    // Test 1: Invalid Login
    const invalidLoginRes = await api.post('/auth/login', {
      email: 'invalid@meditrack.com',
      password: 'WrongPassword'
    });

    const invalidLoginPassed = invalidLoginRes.status === 401;
    printTest('Invalid Login Rejection', invalidLoginPassed, `Status: ${invalidLoginRes.status}`);

    // Test 2: Missing Required Field
    const missingFieldRes = await api.post('/patients', {
      first_name: 'John',
      last_name: 'Doe'
      // Missing required fields
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const missingFieldPassed = missingFieldRes.status === 400 || missingFieldRes.status === 500;
    printTest('Missing Required Field Rejection', missingFieldPassed, `Status: ${missingFieldRes.status}`);

    // Test 3: Non-existent Resource
    const notFoundRes = await api.get('/patients/99999', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const notFoundPassed = notFoundRes.status === 404;
    printTest('Non-existent Resource Error', notFoundPassed, `Status: ${notFoundRes.status}`);

    // Test 4: Invalid Time Format
    const invalidTimeRes = await api.post('/appointments', {
      patient_id: 1,
      doctor_id: 2,
      appointment_date: '2026-04-15',
      appointment_time: 'invalid-time', // Invalid time format
      notes: 'Test'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const invalidTimePassed = invalidTimeRes.status === 400;
    printTest('Invalid Time Format Rejection', invalidTimePassed, `Status: ${invalidTimeRes.status}`);

  } catch (error) {
    console.error('Error handling test error:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║        MEDITRACK API COMPREHENSIVE TEST SUITE          ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  await testAuthentication();
  await testStaffOperations();
  await testPatientOperations();
  await testAppointmentOperations();
  await testDashboard();
  await testErrorHandling();

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║              ALL TESTS COMPLETED                       ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
}

// Run tests
runAllTests().catch(console.error);
