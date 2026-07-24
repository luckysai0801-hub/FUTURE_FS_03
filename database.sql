-- =============================================
-- database.sql
-- Skyline Residency – Smart Apartment Complaint & Maintenance Portal
-- Schema & Seed Data
-- =============================================

CREATE DATABASE IF NOT EXISTS complaint_management;
USE complaint_management;

-- =============================================
-- TABLE 1: users (Stores Admin / Society Manager Accounts)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    full_name    VARCHAR(100)  NOT NULL,
    email        VARCHAR(100)  UNIQUE NOT NULL,
    phone        VARCHAR(15),
    password     VARCHAR(255)  NOT NULL,
    role         ENUM('user','admin') DEFAULT 'admin',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE 2: complaints (Stores Public Resident Complaints)
-- =============================================
CREATE TABLE IF NOT EXISTS complaints (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id    VARCHAR(30)   UNIQUE NOT NULL,
    resident_name   VARCHAR(100)  NOT NULL,
    flat_number     VARCHAR(50)   NOT NULL,
    mobile_number   VARCHAR(15)   NOT NULL,
    email           VARCHAR(100),
    block_wing      VARCHAR(50)   NOT NULL,
    title           VARCHAR(150)  NOT NULL,
    category        VARCHAR(100)  NOT NULL,
    department      VARCHAR(100)  NOT NULL,
    priority        ENUM('Low','Medium','High') DEFAULT 'Medium',
    description     TEXT          NOT NULL,
    image_path      VARCHAR(255),
    status          ENUM('Pending','In Progress','Resolved','Rejected') DEFAULT 'Pending',
    admin_remarks   TEXT,
    assigned_to     VARCHAR(100),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE 3: complaint_updates (Admin Audit Log)
-- =============================================
CREATE TABLE IF NOT EXISTS complaint_updates (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT           NOT NULL,
    updated_by   INT           NOT NULL,
    old_status   VARCHAR(50),
    new_status   VARCHAR(50),
    remarks      TEXT,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by)   REFERENCES users(id)      ON DELETE CASCADE
);

-- =============================================
-- TABLE 4: announcements (Society Notice Board)
-- =============================================
CREATE TABLE IF NOT EXISTS announcements (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    content      TEXT         NOT NULL,
    category     VARCHAR(50)  DEFAULT 'General Notice',
    priority     ENUM('Low','Medium','High') DEFAULT 'Medium',
    created_by   INT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- SAMPLE DATA: Society Manager Admin User
-- Password: admin123 (bcrypt hashed)
-- =============================================
INSERT INTO users (full_name, email, phone, password, role)
VALUES (
    'Society Manager Admin',
    'admin@skylineresidency.com',
    '9876543210',
    '$2b$10$i1wQZ4Lt7jNBLzOLalqvR.axpZYdb6Ene9/NRAlnNsmfWh/9IS1E.',
    'admin'
) ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- =============================================
-- SAMPLE DATA: Test Public Complaints
-- =============================================
INSERT INTO complaints (complaint_id, resident_name, flat_number, mobile_number, email, block_wing, title, category, department, priority, description, status, assigned_to) VALUES
('CMP-2026-000101', 'Rahul Sharma', 'Flat 402', '9876500001', 'rahul.sharma@gmail.com', 'Tower A',
 'Main Bathroom Pipe Seepage in Master Bedroom', 'Water Leakage', 'Tower A - Flat 402', 'High',
 'Water is leaking continuously from the upper apartment ceiling into our master bathroom. Urgent plumbing inspection required.',
 'Pending', NULL),

('CMP-2026-000102', 'Priya Singh', 'Flat 105', '9876500002', 'priya.singh@gmail.com', 'Tower B',
 'Elevator 2 Making Sudden Jerking Noises', 'Lift Problem', 'Tower B - Elevator Bay', 'High',
 'Elevator 2 in Tower B jerks violently when stopping at the 5th floor. Needs immediate technician check for resident safety.',
 'In Progress', 'Senior Lift Technician - Otis Maintenance'),

('CMP-2026-000103', 'Arun Kumar', 'Flat 704', '9876500003', 'arun.kumar@gmail.com', 'Tower C',
 'Basement B1 Parking Spot 14 Blocked by Unregistered Vehicle', 'Parking Issue', 'Basement B1 - Spot 14', 'Medium',
 'An unauthorized vehicle (MH02-XX-9999) has been parked in my reserved spot for 2 days. Security needs to notify owner.',
 'Resolved', 'Chief Security Officer')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- =============================================
-- SAMPLE DATA: Audit Updates
-- =============================================
INSERT INTO complaint_updates (complaint_id, updated_by, old_status, new_status, remarks) VALUES
(2, 1, 'Pending', 'In Progress', 'Assigned Otis Certified Technician. Work order generated.'),
(3, 1, 'Pending', 'In Progress', 'Security dispatched to check vehicle registration registry.'),
(3, 1, 'In Progress', 'Resolved', 'Vehicle owner relocated car to visitor parking. Spot cleared.');

-- =============================================
-- SAMPLE DATA: Announcements
-- =============================================
INSERT INTO announcements (title, content, category, priority, created_by) VALUES
('Scheduled Overhead Water Tank Cleaning', 'Water supply will be suspended on Saturday, July 26th from 10:00 AM to 2:00 PM across all towers for annual water tank sanitization.', 'Maintenance Alert', 'High', 1),
('Quarterly Resident Society General Body Meeting', 'The Q3 General Body Meeting is scheduled for Sunday at 5:00 PM in the Clubhouse Auditorium. All flat owners are invited.', 'General Notice', 'Medium', 1),
('Monsoon Pest Control Drive in Common Corridors', 'Pest control spraying will take place in basement B1/B2 and all tower elevator lobbies on Friday evening.', 'Sanitation', 'Low', 1);

