-- ELMS Database Setup Script
-- Run this script as PostgreSQL superuser (postgres) to create the database and user

-- Create database
CREATE DATABASE elms_dev;

-- Create user with password
CREATE USER elms_user WITH PASSWORD 'elms_password@123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE elms_dev TO elms_user;

-- Connect to the database
\c elms_dev;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO elms_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO elms_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO elms_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO elms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO elms_user;

-- Verify the setup
\dt
\du
