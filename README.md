# Skyline Residency – Smart Apartment Complaint & Maintenance Portal

A modern, commercial-grade web application for apartment communities to streamline maintenance requests, complaint management, staff assignment, and status tracking. Built with **Node.js**, **Express.js**, **MySQL**, and **EJS templates** featuring a premium SaaS responsive interface.

---

## 🎨 Design Theme & Brand Guidelines
- **Primary Color**: `#1E3A8A` (Deep Royal Navy)
- **Secondary Color**: `#10B981` (Emerald Green)
- **Background**: `#F8FAFC` (Slate Soft Light)
- **Status Colors**:
  - `Pending`: Orange (`#F59E0B`)
  - `In Progress`: Blue (`#3B82F6`)
  - `Resolved`: Green (`#10B981`)
  - `Rejected`: Red (`#EF4444`)

---

## 🛠️ Tech Stack
| Layer | Technology |
|---|---|
| **Frontend** | HTML5, Modern CSS3 (Vanilla + Custom HSL System), JavaScript (ES6+), FontAwesome Icons |
| **Backend** | Node.js + Express.js |
| **Database** | MySQL2 (Connection Pool) |
| **Authentication** | express-session + bcrypt |
| **File Uploads** | Multer |
| **Templating Engine** | EJS (Embedded JavaScript) |

---

## 🏢 12 Apartment Maintenance Categories
1. **Water Leakage**
2. **Electrical Issue**
3. **Lift Problem**
4. **Parking Issue**
5. **Security Complaint**
6. **Housekeeping**
7. **Garbage Collection**
8. **Water Supply**
9. **Plumbing**
10. **Garden Maintenance**
11. **Street Lighting**
12. **Other**

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16 or above)
- [MySQL Server](https://dev.mysql.com/downloads/) (running locally)

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create or update your `.env` file:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=complaint_management
SESSION_SECRET=skyline_residency_secret_key_2026_smart_apartment
UPLOAD_DIR=public/uploads
```

### 4. Setup MySQL Database
Open your MySQL terminal or workbench and execute:
```sql
SOURCE path/to/database.sql;
```

### 5. Run the Application
```bash
# Start server in production mode
npm start

# Or development mode with auto-reload
npm run dev
```

Visit the application at: **`http://localhost:3000`**

---

## 🔑 Default Login Credentials

| Role | Email | Password | Flat / Unit |
|---|---|---|---|
| **Society Manager (Admin)** | `admin@skylineresidency.com` | `admin123` | Management Office |
| **Resident** | `rahul.sharma@skylineresidency.com` | `admin123` | Flat A-402 |
| **Resident** | `priya.singh@skylineresidency.com` | `admin123` | Flat B-105 |
| **Resident** | `arun.kumar@skylineresidency.com` | `admin123` | Flat C-704 |

---

## 🗄️ Database Tables & Architecture

| Table | Description |
|---|---|
| `users` | Stores resident profiles and society management admins |
| `complaints` | Maintenance ticket records, category, location/flat, priority, status, assigned staff |
| `complaint_updates` | Audit trail logging every status update, timestamp, and manager remarks |

---

## 📁 Project Structure

```
skyline-residency-portal/
├── public/
│   ├── css/          (style.css, auth.css, dashboard.css, admin.css, complaints.css)
│   ├── js/           (main.js, auth.js, complaints.js, admin.js)
│   └── uploads/      (maintenance images saved here)
├── routes/           (authRoutes, complaintRoutes, adminRoutes)
├── controllers/      (authController, complaintController, adminController)
├── middleware/       (authMiddleware, roleMiddleware, uploadMiddleware)
├── config/           (db.js - MySQL connection pool)
├── views/            (EJS views)
│   ├── auth/         (login.ejs, register.ejs, admin-login.ejs)
│   ├── user/         (dashboard, new-complaint, my-complaints, complaint-detail, profile)
│   ├── admin/        (dashboard, complaints, users, reports, export-pdf)
│   └── partials/     (navbar, footer, sidebar, admin-sidebar)
├── .env              (Environment variables)
├── server.js         (Express application entry point)
├── database.sql      (MySQL schema and seed data)
└── README.md
```
