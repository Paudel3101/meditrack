const db = require('../utils/db');

const appointmentController = {
  // Get all appointments with filters
  getAppointments: async (req, res) => {
    try {
      const { 
        date, 
        doctor_id, 
        patient_id, 
        status,
        start_date,
        end_date 
      } = req.query;
      
      let sql = `
        SELECT a.id, a.appointment_date, a.appointment_time, 
               a.status, a.notes,
               p.id as patient_id, p.first_name as patient_first_name, 
               p.last_name as patient_last_name,
               p.medical_record_number,
               s.id as doctor_id, s.first_name as doctor_first_name, 
               s.last_name as doctor_last_name, s.role as staff_role
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN staff s ON a.doctor_id = s.id
        WHERE 1=1
      `;
      const params = [];
      
      // Filter by specific date
      if (date) {
        sql += ' AND a.appointment_date = ?';
        params.push(date);
      }
      
      // Filter by date range
      if (start_date && end_date) {
        sql += ' AND a.appointment_date BETWEEN ? AND ?';
        params.push(start_date, end_date);
      }
      
      // Filter by doctor
      if (doctor_id) {
        sql += ' AND a.doctor_id = ?';
        params.push(doctor_id);
      }
      
      // Filter by patient
      if (patient_id) {
        sql += ' AND a.patient_id = ?';
        params.push(patient_id);
      }
      
      // Filter by status
      if (status) {
        sql += ' AND a.status = ?';
        params.push(status);
      }
      
      // Order by date and time
      sql += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';
      
      const appointments = await db.query(sql, params);
      
      res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments
      });

    } catch (error) {
      console.error('Get all appointments error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching appointments'
      });
    }
  },

  // Get appointment by ID
  getAppointmentById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const [appointment] = await db.query(
        `SELECT a.*, 
                p.first_name as patient_first_name, 
                p.last_name as patient_last_name,
                p.medical_record_number, p.phone as patient_phone,
                s.first_name as doctor_first_name, 
                s.last_name as doctor_last_name,
                s.role as staff_role, s.specialization
         FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         JOIN staff s ON a.doctor_id = s.id
         WHERE a.id = ?`,
        [id]
      );
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: appointment
      });

    } catch (error) {
      console.error('Get appointment by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching appointment details'
      });
    }
  },

  // Create new appointment
  createAppointment: async (req, res) => {
    try {
      const {
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        notes
      } = req.body;
      
      // Check if patient exists
      const [patient] = await db.query(
        'SELECT id FROM patients WHERE id = ? AND is_archived = FALSE',
        [patient_id]
      );
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found or is archived'
        });
      }
      
      // Check if doctor exists and is active
      const [doctor] = await db.query(
        'SELECT id FROM staff WHERE id = ? AND is_active = TRUE',
        [doctor_id]
      );
      
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found or is inactive'
        });
      }
      
      // Check for scheduling conflicts
      const conflicts = await db.query(
        `SELECT id FROM appointments 
         WHERE doctor_id = ? 
         AND appointment_date = ? 
         AND appointment_time = ?
         AND status NOT IN ('Cancelled')`,
        [doctor_id, appointment_date, appointment_time]
      );
      
      if (conflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Time slot already booked for this doctor'
        });
      }
      
      // Insert new appointment
      const result = await db.query(
        `INSERT INTO appointments (
          patient_id, doctor_id, appointment_date, 
          appointment_time, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          patient_id, doctor_id, appointment_date, 
          appointment_time, 'Scheduled', notes || null
        ]
      );
      
      // Get the created appointment
      const [newAppointment] = await db.query(
        `SELECT a.*, 
                p.first_name as patient_first_name, 
                p.last_name as patient_last_name,
                s.first_name as doctor_first_name, 
                s.last_name as doctor_last_name
         FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         JOIN staff s ON a.doctor_id = s.id
         WHERE a.id = ?`,
        [result.insertId]
      );
      
      res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: newAppointment
      });

    } catch (error) {
      console.error('Create appointment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating appointment'
      });
    }
  },

  // Update appointment
  updateAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        appointment_date,
        appointment_time,
        notes
      } = req.body;
      
      // Check if appointment exists
      const [existing] = await db.query(
        'SELECT id, status FROM appointments WHERE id = ?',
        [id]
      );
      
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }
      
      // Don't allow updates to cancelled appointments
      if (existing.status === 'Cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Cannot update a cancelled appointment'
        });
      }
      
      // Build update fields
      const updateFields = [];
      const updateValues = [];
      
      if (appointment_date) {
        updateFields.push('appointment_date = ?');
        updateValues.push(appointment_date);
      }
      
      if (appointment_time) {
        updateFields.push('appointment_time = ?');
        updateValues.push(appointment_time);
      }
      
      if (notes !== undefined) {
        updateFields.push('notes = ?');
        updateValues.push(notes);
      }
      
      // Only update if there are fields to update
      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }
      
      updateValues.push(id);
      
      const sql = `UPDATE appointments SET ${updateFields.join(', ')} WHERE id = ?`;
      await db.query(sql, updateValues);
      
      // Get updated appointment
      const [updatedAppointment] = await db.query(
        `SELECT a.*, 
                p.first_name as patient_first_name, 
                p.last_name as patient_last_name,
                s.first_name as doctor_first_name, 
                s.last_name as doctor_last_name
         FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         JOIN staff s ON a.doctor_id = s.id
         WHERE a.id = ?`,
        [id]
      );
      
      res.status(200).json({
        success: true,
        message: 'Appointment updated successfully',
        data: updatedAppointment
      });

    } catch (error) {
      console.error('Update appointment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating appointment'
      });
    }
  },

  // Update appointment status only
  updateAppointmentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }
      
      // Check if appointment exists
      const [existing] = await db.query(
        'SELECT id, status FROM appointments WHERE id = ?',
        [id]
      );
      
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }
      
      // Update status
      await db.query(
        'UPDATE appointments SET status = ? WHERE id = ?',
        [status, id]
      );
      
      res.status(200).json({
        success: true,
        message: `Appointment status updated to ${status}`
      });

    } catch (error) {
      console.error('Update appointment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating appointment status'
      });
    }
  },

  // Delete appointment
  deleteAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if appointment exists
      const [existing] = await db.query(
        'SELECT id, status FROM appointments WHERE id = ?',
        [id]
      );
      
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      // Don't allow deletion of completed or already cancelled appointments
      if (existing.status === 'Completed' || existing.status === 'No-show') {
        return res.status(400).json({
          success: false,
          message: `Cannot delete a ${existing.status} appointment. Use status update instead.`
        });
      }
      
      // Delete the appointment
      await db.query(
        'DELETE FROM appointments WHERE id = ?',
        [id]
      );
      
      res.status(200).json({
        success: true,
        message: 'Appointment deleted successfully'
      });

    } catch (error) {
      console.error('Delete appointment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting appointment'
      });
    }
  }
};

module.exports = appointmentController;
