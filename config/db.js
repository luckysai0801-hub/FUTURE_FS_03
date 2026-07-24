// =============================================
// config/db.js - MySQL Database Connection
// Skyline Residency – Smart Apartment Complaint & Maintenance Portal
// =============================================

const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool (better than single connection)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'complaint_management',
    waitForConnections: true,
    connectionLimit: 10,       // max 10 simultaneous connections
    queueLimit: 0
});

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
