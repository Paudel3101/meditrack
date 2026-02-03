class Patient {
  static async findById(id) {
    const db = require('../utils/db');
    const [patient] = await db.query(
      'SELECT * FROM patients WHERE id = ?',
      [id]
    );
    return patient;
  }

  static async findByMRN(mrn) {
    const db = require('../utils/db');
    const [patient] = await db.query(
      'SELECT * FROM patients WHERE medical_record_number = ?',
      [mrn]
    );
    return patient;
  }

  static async findAll(filters = {}) {
    const db = require('../utils/db');
    let sql = 'SELECT * FROM patients WHERE 1=1';
    const params = [];
    
    if (filters.is_archived !== undefined) {
      sql += ' AND is_archived = ?';
      params.push(filters.is_archived);
    }
    
    if (filters.search) {
      sql += ` AND (first_name LIKE ? OR last_name LIKE ? 
                   OR medical_record_number LIKE ? OR phone LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    return await db.query(sql, params);
  }

  static async create(patientData) {
    const db = require('../utils/db');
    const {
      medical_record_number, first_name, last_name, date_of_birth,
      gender, phone, email, allergies, blood_type
    } = patientData;
    
    const result = await db.query(
      `INSERT INTO patients (
        medical_record_number, first_name, last_name, date_of_birth,
        gender, phone, email, allergies, blood_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        medical_record_number, first_name, last_name, date_of_birth,
        gender, phone, email, allergies, blood_type
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
      `UPDATE patients SET ${setClause} WHERE id = ?`,
      values
    );
    
    return result.affectedRows;
  }

  static async archive(id) {
    const db = require('../utils/db');
    const result = await db.query(
      'UPDATE patients SET is_archived = TRUE WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = Patient;
