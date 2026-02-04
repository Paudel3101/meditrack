const mysql = require('mysql2/promise');
const config = require('../config/database');
const dbConfig = config.dbConfig || config;

class Database {
  constructor() {
    this.pool = null;
  }

  async initialize() {
    if (!this.pool) {
      try {
        this.pool = await mysql.createPool(dbConfig);
        console.log('Database connection pool created successfully');
      } catch (error) {
        console.error('Failed to create database connection pool:', error);
        throw error;
      }
    }
    return this.pool;
  }

  async query(sql, values = []) {
    if (!this.pool) {
      await this.initialize();
    }
    
    const connection = await this.pool.getConnection();
    try {
      const [results] = await connection.execute(sql, values);
      return results;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async queryOne(sql, values = []) {
    const results = await this.query(sql, values);
    return results.length > 0 ? results[0] : null;
  }

  async insert(sql, values = []) {
    if (!this.pool) {
      await this.initialize();
    }
    
    const connection = await this.pool.getConnection();
    try {
      const [result] = await connection.execute(sql, values);
      return {
        insertId: result.insertId,
        affectedRows: result.affectedRows
      };
    } catch (error) {
      console.error('Database insert error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async update(sql, values = []) {
    if (!this.pool) {
      await this.initialize();
    }
    
    const connection = await this.pool.getConnection();
    try {
      const [result] = await connection.execute(sql, values);
      return {
        affectedRows: result.affectedRows,
        changedRows: result.changedRows
      };
    } catch (error) {
      console.error('Database update error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async delete(sql, values = []) {
    if (!this.pool) {
      await this.initialize();
    }
    
    const connection = await this.pool.getConnection();
    try {
      const [result] = await connection.execute(sql, values);
      return {
        affectedRows: result.affectedRows
      };
    } catch (error) {
      console.error('Database delete error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async transaction(callback) {
    if (!this.pool) {
      await this.initialize();
    }
    
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      console.error('Transaction error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('Database connection pool closed');
    }
  }

  getPool() {
    return this.pool;
  }
}

module.exports = new Database();

module.exports = new Database();
