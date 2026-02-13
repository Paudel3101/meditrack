class Appointment {
  static async findById(id) {
    const db = require('../utils/db');
    const [appointment] = await db.query(
      'SELECT * FROM appointments WHERE id = ?',
      [id]
    );
    return appointment;
  }

  static async findAll(filters = {}) {
    const db = require('../utils/db');
    let sql = `
      SELECT a.*, 
             p.first_name as patient_first_name, 
             p.last_name as patient_last_name,
             s.first_name as staff_first_name, 
             s.last_name as staff_last_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN staff s ON a.staff_id = s.id
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.date) {
      sql += ' AND a.appointment_date = ?';
      params.push(filters.date);
    }
    
    if (filters.status) {
      sql += ' AND a.status = ?';
      params.push(filters.status);
    }
    
    sql += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';
    
    return await db.query(sql, params);
  }

  static async create(appointmentData) {
    const db = require('../utils/db');
    const {
      patient_id, staff_id, appointment_date,
      appointment_time, type, reason, notes
    } = appointmentData;
    
    const result = await db.query(
      `INSERT INTO appointments (
        patient_id, staff_id, appointment_date,
        appointment_time, type, reason, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        patient_id, staff_id, appointment_date,
        appointment_time, type, reason, notes
      ]
    );
    
    return result.insertId;
  }

  static async update(id, updateData) {
    const db = require('../utils/db');
    const fields = Object.keys(updateData);
    
    if (fields.length === 0) {
      return 0;
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updateData[field]);
    values.push(id);
    
    const result = await db.query(
      `UPDATE appointments SET ${setClause} WHERE id = ?`,
      values
    );
    
    return result.affectedRows;
  }

  static async cancel(id, reason) {
    const db = require('../utils/db');
    const result = await db.query(
      'UPDATE appointments SET status = "cancelled", cancellation_reason = ? WHERE id = ?',
      [reason, id]
    );
    return result.affectedRows;
  }
}

module.exports = Appointment;
