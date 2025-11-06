-- Migration 001: Initial Schema Setup
-- Description: Enable UUID extension and set up basic database configuration
-- Created: 2025-11-06

-- Enable UUID extension for generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing (if needed)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone to UTC for consistency
SET timezone = 'UTC';

-- Create a custom type for difficulty levels (used in ideas table)
DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('Beginner', 'Intermediate', 'Advanced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create a custom type for user tiers
DO $$ BEGIN
    CREATE TYPE user_tier AS ENUM ('free', 'premium');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add comment for documentation
COMMENT ON EXTENSION "uuid-ossp" IS 'Extension for generating UUIDs';
COMMENT ON TYPE difficulty_level IS 'Enum type for idea difficulty levels';
COMMENT ON TYPE user_tier IS 'Enum type for user subscription tiers';
