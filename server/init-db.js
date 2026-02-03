const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  connectTimeout: 10000
};

const dbName = process.env.DB_NAME || 'meditrack_db';

async function initializeDatabase() {
  let connection;
  try {
    console.log('🔄 Connecting to MySQL...');
    
    // Connect without database selection first
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL');

    // Create database if not exists
    console.log(`🔄 Creating database '${dbName}' if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' ready`);

    // Switch to the database
    await connection.query(`USE \`${dbName}\``);
    console.log(`✅ Switched to database '${dbName}'`);

    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'database.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('🔄 Creating tables...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // Remove SQL comments and split by semicolon
      const cleanSql = schemaSql
        .split('\n')
        .map(line => {
          // Remove line comments
          const commentIndex = line.indexOf('--');
          return commentIndex === -1 ? line : line.substring(0, commentIndex);
        })
        .join('\n');
      
      const rawStatements = cleanSql.split(';');
      let statementCount = 0;

      for (let i = 0; i < rawStatements.length; i++) {
        let statement = rawStatements[i].trim();
        
        // Skip empty statements
        if (!statement) {
          continue;
        }
        
        // Skip USE statements
        if (statement.toUpperCase().startsWith('USE ')) {
          continue;
        }

        try {
          console.log(`   Executing statement ${++statementCount}...`);
          await connection.query(statement);
        } catch (error) {
          console.error(`   ❌ Error in statement ${statementCount}: ${error.message}`);
          console.error(`   Statement: ${statement.substring(0, 100)}...`);
          throw error;
        }
      }
      console.log(`✅ Tables created successfully (${statementCount} statements executed)`);
    } else {
      console.warn('⚠️  database.sql not found at', schemaPath);
    }

    // Read and execute data insertion file
    const dataPath = path.join(__dirname, 'insert_data.sql');
    if (fs.existsSync(dataPath)) {
      console.log('🔄 Inserting sample data...');
      const dataSql = fs.readFileSync(dataPath, 'utf8');
      
      // Remove SQL comments and split by semicolon
      const cleanSql = dataSql
        .split('\n')
        .map(line => {
          // Remove line comments
          const commentIndex = line.indexOf('--');
          return commentIndex === -1 ? line : line.substring(0, commentIndex);
        })
        .join('\n');
      
      const rawStatements = cleanSql.split(';');
      let insertCount = 0;

      for (let i = 0; i < rawStatements.length; i++) {
        let statement = rawStatements[i].trim();
        
        // Skip empty statements
        if (!statement) {
          continue;
        }
        
        // Skip USE statements
        if (statement.toUpperCase().startsWith('USE ')) {
          continue;
        }

        try {
          await connection.query(statement);
          insertCount++;
        } catch (error) {
          // Might have duplicate entries, log but continue
          if (error.message.includes('Duplicate')) {
            console.warn(`   ⚠️  Duplicate entry skipped`);
          } else {
            console.warn(`   ⚠️  Warning: ${error.message}`);
          }
        }
      }
      console.log(`✅ Sample data inserted successfully (${insertCount} statements executed)`);
    } else {
      console.warn('⚠️  insert_data.sql not found at', dataPath);
    }

    console.log('\n✨ Database initialization completed successfully!');
    console.log('\n📋 Default Admin Credentials:');
    console.log('   Email: admin@meditrack.com');
    console.log('   Password: Password123!');
    console.log('\n⚠️  Please change these credentials after first login!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run initialization
initializeDatabase();
