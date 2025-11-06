-- Migration 003: Users Table
-- Description: Create users table to extend Supabase auth.users with profile information
-- Created: 2025-11-06

-- Create users table that extends auth.users
CREATE TABLE IF NOT EXISTS users (
    -- Primary key that references Supabase auth.users
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Profile information
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,

    -- Subscription tier
    tier user_tier DEFAULT 'free',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT users_email_not_empty CHECK (char_length(trim(email)) > 0),
    CONSTRAINT users_email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_display_name_length CHECK (char_length(display_name) <= 100),
    CONSTRAINT users_bio_length CHECK (char_length(bio) <= 1000)
);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();

-- Create function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, tier)
    VALUES (NEW.id, NEW.email, 'free');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- Add table comments for documentation
COMMENT ON TABLE users IS 'User profiles extending Supabase auth.users with additional metadata';
COMMENT ON COLUMN users.id IS 'User ID from auth.users';
COMMENT ON COLUMN users.email IS 'User email address';
COMMENT ON COLUMN users.display_name IS 'Public display name for the user';
COMMENT ON COLUMN users.bio IS 'User biography or description';
COMMENT ON COLUMN users.tier IS 'Subscription tier: free or premium (for future use)';
COMMENT ON COLUMN users.created_at IS 'When the user profile was created';
COMMENT ON COLUMN users.updated_at IS 'When the user profile was last updated';
