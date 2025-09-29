-- Production database initialization
-- This script runs when the prod container starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- You can add any additional prod-specific setup here