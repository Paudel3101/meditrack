class Staff {
  static async findById(id) {
    const db = require('../utils/db');
    const [staff] = await db.query(
      'SELECT * FROM staff WHERE id = ?',
      [id]
    );
    return staff;
  }

  static async findByEmail(email) {
    const db = require('../utils/db');
    const [staff] = await db.query(
      'SELECT * FROM staff WHERE email = ?',
      [email]
    );
    return staff;
  }

  static async create(staffData) {
    const db = require('../utils/db');
    const { 
      email, password_hash, first_name, last_name, 
      role, license_number, specialization 
    } = staffData;
    
    const result = await db.query(
      `INSERT INTO staff (email, password_hash, first_name, last_name, 
                         role, license_number, specialization)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, password_hash, first_name, last_name, 
       role, license_number, specialization]
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
      `UPDATE staff SET ${setClause} WHERE id = ?`,
      values
    );
    
    return result.affectedRows;
  }

  static async deactivate(id) {
    const db = require('../utils/db');
    const result = await db.query(
      'UPDATE staff SET is_active = FALSE WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = Staff;
