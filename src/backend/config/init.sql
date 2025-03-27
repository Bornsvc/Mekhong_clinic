-- Drop database if exists (be careful with this in production!)
DROP DATABASE IF EXISTS mekong_clinic;

-- Create database
CREATE DATABASE mekong_clinic;

-- Connect to the database
\c mekong_clinic;

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    age INTEGER,
    registered TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    phone_number VARCHAR(20),
    gender VARCHAR(10),
    medication TEXT,
    balance DECIMAL(10,2) DEFAULT 0,
    diagnosis TEXT,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patient_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();