const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../utils/db');
const { validateEmail, validatePassword } = require('../utils/validators');

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check if staff exists
    const query = 'SELECT * FROM staff WHERE email = ? AND is_active = 1';
    const staff = await db.queryOne(query, [email]);

    if (!staff) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, staff.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: staff.id,
        email: staff.email,
        role: staff.role,
        first_name: staff.first_name,
        last_name: staff.last_name
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        staff: {
          id: staff.id,
          email: staff.email,
          first_name: staff.first_name,
          last_name: staff.last_name,
          role: staff.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Register (Admin only)
const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, role } = req.body;

    // Validate inputs
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters with uppercase, number, and special character'
      });
    }

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

    // Insert new staff
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
      message: 'Staff registered successfully',
      data: {
        id: result.insertId,
        email,
        first_name,
        last_name,
        role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const staffId = req.user.id;

    const query = `
      SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at
      FROM staff
      WHERE id = ?
    `;

    const staff = await db.queryOne(query, [staffId]);

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
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};

// Update password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const staffId = req.user.id;

    // Get current password hash
    const query = 'SELECT password_hash FROM staff WHERE id = ?';
    const staff = await db.queryOne(query, [staffId]);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, staff.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters with uppercase, number, and special character'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const updateQuery = 'UPDATE staff SET password_hash = ? WHERE id = ?';
    await db.update(updateQuery, [hashedPassword, staffId]);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating password'
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    // In a real scenario, you might want to blacklist the token
    // For now, just return success response
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  updatePassword,
  logout
};
