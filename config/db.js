// =============================================
// config/db.js - MySQL Database Connection
// Skyline Residency – Smart Apartment Complaint & Maintenance Portal
// =============================================

const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool supporting environment configs and cloud DBs
const poolConfig = (process.env.MYSQL_URL || process.env.DATABASE_URL) 
    ? (process.env.MYSQL_URL || process.env.DATABASE_URL)
    : {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'complaint_management',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    };

const pool = mysql.createPool(poolConfig);

// Get promise-based pool (allows async/await)
const promisePool = pool.promise();

// Test the connection on startup
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('   Make sure MySQL is running and credentials in .env are correct');
    } else {
        console.log('✅ Skyline Residency DB connected successfully!');
        connection.release(); // release back to pool
    }
});

module.exports = promisePool;
