const db = require('../utils/db');

const patientController = {
  // Get all patients with search and filters
  getPatients: async (req, res) => {
    try {
      const { search, is_archived, gender } = req.query;
      
      let sql = `
        SELECT id, medical_record_number, first_name, last_name, 
               date_of_birth, gender, phone, email, 
               allergies, blood_type, is_archived, created_at
        FROM patients 
        WHERE 1=1
      `;
      const params = [];
      
      // Filter by archive status (default: active patients only)
      if (is_archived !== undefined) {
        sql += ' AND is_archived = ?';
        params.push(is_archived === 'true');
      } else {
        sql += ' AND is_archived = FALSE';
      }
      
      // Filter by gender if provided
      if (gender) {
        sql += ' AND gender = ?';
        params.push(gender);
      }
      
      // Search functionality
      if (search) {
        sql += ` AND (first_name LIKE ? OR last_name LIKE ? 
               OR medical_record_number LIKE ? OR phone LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      // Order by newest first
      sql += ' ORDER BY created_at DESC';
      
      const patients = await db.query(sql, params);
      
      res.status(200).json({
        success: true,
        count: patients.length,
        data: patients
      });

    } catch (error) {
      console.error('Get all patients error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching patients'
      });
    }
  },

  // Get patient by ID
  getPatientById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const [patient] = await db.query(
        `SELECT id, medical_record_number, first_name, last_name, 
                date_of_birth, gender, phone, email, 
                allergies, blood_type, is_archived, created_at
         FROM patients WHERE id = ?`,
        [id]
      );
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }
      
      // Get patient's appointments if needed
      if (req.query.include === 'appointments') {
        const appointments = await db.query(
          `SELECT a.id, a.appointment_date, a.appointment_time, 
                  a.status, a.notes,
                  s.first_name as staff_first_name, 
                  s.last_name as staff_last_name,
                  s.role as staff_role
           FROM appointments a
           JOIN staff s ON a.doctor_id = s.id
           WHERE a.patient_id = ?
           ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
          [id]
        );
        patient.appointments = appointments;
      }
      
      res.status(200).json({
        success: true,
        data: patient
      });

    } catch (error) {
      console.error('Get patient by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching patient details'
      });
    }
  },

  // Create new patient
  createPatient: async (req, res) => {
    try {
      const {
        medical_record_number,
        first_name,
        last_name,
        date_of_birth,
        gender,
        phone,
        email,
        allergies,
        blood_type
      } = req.body;
      
      // Check if medical record number already exists
      const [existing] = await db.query(
        'SELECT id FROM patients WHERE medical_record_number = ?',
        [medical_record_number]
      );
      
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Medical Record Number already exists'
        });
      }
      
      // Insert new patient
      const result = await db.query(
        `INSERT INTO patients (
          medical_record_number, first_name, last_name, 
          date_of_birth, gender, phone, email, 
          allergies, blood_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          medical_record_number, first_name, last_name,
          date_of_birth, gender, phone || null, email || null,
          allergies || null, blood_type || null
        ]
      );
      
      // Get the created patient
      const [newPatient] = await db.query(
        `SELECT id, medical_record_number, first_name, last_name, 
                date_of_birth, gender, phone, email, 
                allergies, blood_type, is_archived
         FROM patients WHERE id = ?`,
        [result.insertId]
      );
      
      res.status(201).json({
        success: true,
        message: 'Patient created successfully',
        data: newPatient
      });

    } catch (error) {
      console.error('Create patient error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating patient'
      });
    }
  },

  // Update patient information
  updatePatient: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        first_name,
        last_name,
        date_of_birth,
        gender,
        phone,
        email,
        address,
        city,
        state,
        zip_code,
        allergies,
        blood_type,
        emergency_contact_name,
        emergency_contact_phone
      } = req.body;
      
      // Check if patient exists
      const [existing] = await db.query(
        'SELECT id FROM patients WHERE id = ?',
        [id]
      );
      
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }
      
      // Build update fields
      const updateFields = [];
      const updateValues = [];
      
      if (first_name) {
        updateFields.push('first_name = ?');
        updateValues.push(first_name);
      }
      
      if (last_name) {
        updateFields.push('last_name = ?');
        updateValues.push(last_name);
      }
      
      if (date_of_birth) {
        updateFields.push('date_of_birth = ?');
        updateValues.push(date_of_birth);
      }
      
      if (gender) {
        updateFields.push('gender = ?');
        updateValues.push(gender);
      }
      
      if (phone !== undefined) {
        updateFields.push('phone = ?');
        updateValues.push(phone);
      }
      
      if (email !== undefined) {
        updateFields.push('email = ?');
        updateValues.push(email);
      }

      if (address !== undefined) {
        updateFields.push('address = ?');
        updateValues.push(address);
      }

      if (city !== undefined) {
        updateFields.push('city = ?');
        updateValues.push(city);
      }

      if (state !== undefined) {
        updateFields.push('state = ?');
        updateValues.push(state);
      }

      if (zip_code !== undefined) {
        updateFields.push('zip_code = ?');
        updateValues.push(zip_code);
      }
      
      if (allergies !== undefined) {
        updateFields.push('allergies = ?');
        updateValues.push(allergies);
      }
      
      if (blood_type !== undefined) {
        updateFields.push('blood_type = ?');
        updateValues.push(blood_type);
      }

      if (emergency_contact_name !== undefined) {
        updateFields.push('emergency_contact_name = ?');
        updateValues.push(emergency_contact_name);
      }

      if (emergency_contact_phone !== undefined) {
        updateFields.push('emergency_contact_phone = ?');
        updateValues.push(emergency_contact_phone);
      }
      
      // Only update if there are fields to update
      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update. Provide at least one of: first_name, last_name, date_of_birth, gender, phone, email, address, city, state, zip_code, allergies, blood_type, emergency_contact_name, emergency_contact_phone'
        });
      }
      
      updateValues.push(id);
      
      const sql = `UPDATE patients SET ${updateFields.join(', ')} WHERE id = ?`;
      await db.query(sql, updateValues);
      
      // Get updated patient
      const [updatedPatient] = await db.query(
        `SELECT id, medical_record_number, first_name, last_name, 
                date_of_birth, gender, phone, email, address, city, state, zip_code,
                allergies, blood_type, emergency_contact_name, emergency_contact_phone, is_archived
         FROM patients WHERE id = ?`,
        [id]
      );
      
      res.status(200).json({
        success: true,
        message: 'Patient updated successfully',
        data: updatedPatient
      });

    } catch (error) {
      console.error('Update patient error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating patient'
      });
    }
  },

  // Archive patient (soft delete)
  archivePatient: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if patient exists and is not already archived
      const [patient] = await db.query(
        'SELECT id, is_archived FROM patients WHERE id = ?',
        [id]
      );
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }
      
      if (patient.is_archived) {
        return res.status(400).json({
          success: false,
          message: 'Patient is already archived'
        });
      }
      
      // Archive patient
      await db.query(
        'UPDATE patients SET is_archived = TRUE WHERE id = ?',
        [id]
      );
      
      res.status(200).json({
        success: true,
        message: 'Patient archived successfully'
      });

    } catch (error) {
      console.error('Archive patient error:', error);
      res.status(500).json({
        success: false,
        message: 'Error archiving patient'
      });
    }
  },

  // Unarchive patient
  unarchivePatient: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if patient exists and is archived
      const [patient] = await db.query(
        'SELECT id, is_archived FROM patients WHERE id = ?',
        [id]
      );
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }
      
      if (!patient.is_archived) {
        return res.status(400).json({
          success: false,
          message: 'Patient is not archived'
        });
      }
      
      // Unarchive patient
      await db.query(
        'UPDATE patients SET is_archived = FALSE WHERE id = ?',
        [id]
      );
      
      res.status(200).json({
        success: true,
        message: 'Patient unarchived successfully'
      });

    } catch (error) {
      console.error('Unarchive patient error:', error);
      res.status(500).json({
        success: false,
        message: 'Error unarchiving patient'
      });
    }
  },

  // Search patients
  searchPatients: async (req, res) => {
    try {
      const { q, field } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }
      
      let sql = `
        SELECT id, medical_record_number, first_name, last_name, 
               date_of_birth, gender, phone, email
        FROM patients 
        WHERE is_archived = FALSE AND (
      `;
      const params = [];
      const searchTerm = `%${q}%`;
      
      if (field === 'name') {
        sql += 'first_name LIKE ? OR last_name LIKE ?';
        params.push(searchTerm, searchTerm);
      } else if (field === 'mrn') {
        sql += 'medical_record_number LIKE ?';
        params.push(searchTerm);
      } else if (field === 'phone') {
        sql += 'phone LIKE ?';
        params.push(searchTerm);
      } else {
        // Search all fields
        sql += 'first_name LIKE ? OR last_name LIKE ? OR medical_record_number LIKE ? OR phone LIKE ?';
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      sql += ') ORDER BY last_name, first_name LIMIT 20';
      
      const patients = await db.query(sql, params);
      
      res.status(200).json({
        success: true,
        count: patients.length,
        data: patients
      });

    } catch (error) {
      console.error('Search patients error:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching patients'
      });
    }
  }
};

module.exports = patientController;
