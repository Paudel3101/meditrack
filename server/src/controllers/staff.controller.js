const bcrypt = require('bcrypt');
const db = require('../utils/db');

// Get all staff
const getStaff = async (req, res) => {
  try {
    const { role, is_active } = req.query;

    let query = 'SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at FROM staff WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active);
    }

    query += ' ORDER BY created_at DESC';

    const staff = await db.query(query, params);

    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching staff'
    });
  }
};

// Get staff by ID
const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at
      FROM staff
      WHERE id = ?
    `;

    const staff = await db.queryOne(query, [id]);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Get staff by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching staff'
    });
  }
};

// Create staff
const createStaff = async (req, res) => {
  try {
    const { email, password, first_name, last_name, role } = req.body;

    // Check if email already exists
    const checkQuery = 'SELECT id FROM staff WHERE email = ?';
    const existingStaff = await db.queryOne(checkQuery, [email]);

    if (existingStaff) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert staff
    const insertQuery = `
      INSERT INTO staff (email, password_hash, first_name, last_name, role, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, 1, NOW())
    `;

    const result = await db.insert(insertQuery, [
      email,
      hashedPassword,
      first_name,
      last_name,
      role
    ]);

    res.status(201).json({
      success: true,
      message: 'Staff created successfully',
      data: {
        id: result.insertId,
        email,
        first_name,
        last_name,
        role
      }
    });
  } catch (error) {
    console.error('Create staff error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error creating staff'
    });
  }
};

// Update staff
const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, role, specialization } = req.body;

    // Check if staff exists
    const checkQuery = 'SELECT id FROM staff WHERE id = ?';
    const staff = await db.queryOne(checkQuery, [id]);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    // Build dynamic update query
    const updates = [];
    const params = [];

    if (first_name) {
      updates.push('first_name = ?');
      params.push(first_name);
    }

    if (last_name) {
      updates.push('last_name = ?');
      params.push(last_name);
    }

    if (phone) {
      updates.push('phone = ?');
      params.push(phone);
    }

    if (role) {
      updates.push('role = ?');
      params.push(role);
    }

    if (specialization) {
      updates.push('specialization = ?');
      params.push(specialization);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update. Provide at least one of: first_name, last_name, phone, role, specialization'
      });
    }

    params.push(id);

    const updateQuery = `UPDATE staff SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await db.update(updateQuery, params);

    res.status(200).json({
      success: true,
      message: 'Staff updated successfully'
    });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating staff'
    });
  }
};

// Deactivate staff
const deactivateStaff = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if staff exists
    const checkQuery = 'SELECT id FROM staff WHERE id = ?';
    const staff = await db.queryOne(checkQuery, [id]);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    // Deactivate staff
    const updateQuery = 'UPDATE staff SET is_active = 0 WHERE id = ?';
    await db.update(updateQuery, [id]);

    res.status(200).json({
      success: true,
      message: 'Staff deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deactivating staff'
    });
  }
};

// Reactivate staff
const reactivateStaff = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if staff exists
    const checkQuery = 'SELECT id FROM staff WHERE id = ?';
    const staff = await db.queryOne(checkQuery, [id]);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    // Reactivate staff
    const updateQuery = 'UPDATE staff SET is_active = 1 WHERE id = ?';
    await db.update(updateQuery, [id]);

    res.status(200).json({
      success: true,
      message: 'Staff reactivated successfully'
    });
  } catch (error) {
    console.error('Reactivate staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reactivating staff'
    });
  }
};

module.exports = {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deactivateStaff,
  reactivateStaff
};
