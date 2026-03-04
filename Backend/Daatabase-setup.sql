-- Create Database
CREATE DATABASE IF NOT EXISTS powereye;
USE powereye;

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'operator',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Machines Table
CREATE TABLE IF NOT EXISTS machines (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  model VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  machine_id INT NOT NULL,
  alert_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) DEFAULT 'medium',
  message TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
);

-- Insert Demo User
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@powereye.com', '$2a$10$7I8.O1GKjgFMLKh/QJ3UeuN8bVn.YvPvNzFqKn1EiLO8p1UeZeNI6', 'Admin User', 'admin');
-- Password: admin123

-- Insert Demo Machines
INSERT INTO machines (name, model, status, user_id) VALUES 
('Furnace Unit 1', 'Industrial Furnace X-2000', 'active', 1),
('Compressor A', 'Pneumatic Compressor PRO-500', 'active', 1),
('Pump System', 'Centrifugal Pump CP-300', 'idle', 1),
('Generator G1', 'Diesel Generator DG-750', 'active', 1);

-- Insert Demo Alerts
INSERT INTO alerts (machine_id, alert_type, severity, message, resolved) VALUES 
(1, 'temperature', 'high', 'Temperature exceeds threshold', 0),
(2, 'pressure', 'medium', 'Pressure deviation detected', 0),
(3, 'vibration', 'low', 'Slight vibration detected', 1);

-- Create Indexes for Performance
CREATE INDEX idx_user_id ON machines(user_id);
CREATE INDEX idx_machine_id ON alerts(machine_id);
CREATE INDEX idx_user_email ON users(email);