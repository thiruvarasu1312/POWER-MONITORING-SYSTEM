# ⚡ PowerEye - Industrial Power Monitoring System

PowerEye is a comprehensive industrial power monitoring dashboard designed for real-time tracking of machine metrics, alerts, and historical data. It features role-based access control (Admin/Operator) and a modern, responsive UI.

## 🚀 Features

*   **Real-time Monitoring**: Live dashboard showing voltage, current, and power consumption.
*   **Role-Based Access**:
    *   **Admins**: Full access to manage users, machines, and system settings.
    *   **Operators**: Read-only access to dashboards and alerts.
*   **Machine Management**: detailed inventory and status tracking.
*   **Alert System**: Critical, Warning, and Info alerts with acknowledgement workflows.
*   **Historical Data**: Interactive charts for trend analysis.
*   **Modern UI**: Built with React, Tailwind CSS, and Lucide icons (supports Dark Mode).

## 🛠️ Tech Stack

### Frontend
*   **React 18** (Vite)
*   **Tailwind CSS**
*   **Recharts** (Data Visualization)
*   **Lucide React** (Icons)
*   **React Router v6**

### Backend
*   **Node.js** & **Express**
*   **MySQL** (Database)
*   **JWT** (Authentication)
*   **Bcrypt** (Security)

## 📋 Prerequisites

*   Node.js (v16+)
*   MySQL Server (v8.0+)

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/NandhiniP07/Power-Monitoring-System.git
    cd Power-Monitoring-System
    ```

2.  **Database Setup**
    *   Create a MySQL database named `powereye`.
    *   Import the schema from `Backend/database-setup.sql` or `Backend/initialize_db.js`.
    *   Configure your `.env` file in the `Backend` directory:
        ```env
        DB_HOST=localhost
        DB_USER=root
        DB_PASSWORD=yourpassword
        DB_NAME=powereye
        JWT_SECRET=your_jwt_secret_key
        PORT=5000
        ```

3.  **Install Dependencies**

    **Backend:**
    ```bash
    cd Backend
    npm install
    ```

    **Frontend:**
    ```bash
    cd ../frontend
    npm install
    ```

## 🏃‍♂️ Running the Application

You need to run both the backend and frontend servers.

**Terminal 1: Backend**
```bash
cd Backend
npm start
```
*Server runs on: http://localhost:5000*

**Terminal 2: Frontend**
```bash
cd frontend
npm start
```
*App runs on: http://localhost:3000*


