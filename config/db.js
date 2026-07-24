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

// Auto-create database tables and seed data if they do not exist
async function initDatabase() {
    try {
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(15),
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS complaints (
                id INT AUTO_INCREMENT PRIMARY KEY,
                complaint_id VARCHAR(30) UNIQUE NOT NULL,
                resident_name VARCHAR(100) NOT NULL,
                flat_number VARCHAR(50) NOT NULL,
                mobile_number VARCHAR(15) NOT NULL,
                email VARCHAR(100),
                block_wing VARCHAR(50) NOT NULL,
                title VARCHAR(150) NOT NULL,
                category VARCHAR(100) NOT NULL,
                department VARCHAR(100) NOT NULL,
                priority VARCHAR(20) DEFAULT 'Medium',
                description TEXT NOT NULL,
                image_path VARCHAR(255),
                status VARCHAR(30) DEFAULT 'Pending',
                admin_remarks TEXT,
                assigned_to VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `);

        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS complaint_updates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                complaint_id INT NOT NULL,
                updated_by INT NOT NULL,
                old_status VARCHAR(50),
                new_status VARCHAR(50),
                remarks TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS announcements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                content TEXT NOT NULL,
                category VARCHAR(50) DEFAULT 'General Notice',
                priority VARCHAR(20) DEFAULT 'Medium',
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Insert default admin if no users exist
        const [users] = await promisePool.query('SELECT id FROM users LIMIT 1');
        if (users.length === 0) {
            await promisePool.query(`
                INSERT INTO users (full_name, email, phone, password, role)
                VALUES ('Society Manager Admin', 'admin@skylineresidency.com', '9876543210', '$2b$10$i1wQZ4Lt7jNBLzOLalqvR.axpZYdb6Ene9/NRAlnNsmfWh/9IS1E.', 'admin');
            `);
            console.log('🌱 Default Admin Created: admin@skylineresidency.com / admin123');
        }
    } catch (err) {
        console.error('⚠️ DB Auto-Init warning:', err.message);
    }
}

// Test the connection on startup
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error(`   Attempted target: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`);
        console.error('   Make sure DB credentials and DB_PORT are set, and Aiven IP Filter allows 0.0.0.0/0');
    } else {
        console.log('✅ Skyline Residency DB connected successfully!');
        connection.release(); // release back to pool
        initDatabase();
    }
});

module.exports = promisePool;
