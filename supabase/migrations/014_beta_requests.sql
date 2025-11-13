-- Migration: Create beta_requests table
-- Description: Stores beta access requests from users who want to join the closed beta
-- Created: 2025-11-13

-- Drop table if exists (for development only)
-- DROP TABLE IF EXISTS beta_requests CASCADE;

-- Create beta_requests table
CREATE TABLE IF NOT EXISTS beta_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  referral_source TEXT NOT NULL, -- How they heard about the project
  message TEXT, -- Optional message from the user
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  notes TEXT -- Admin notes
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_beta_requests_email ON beta_requests(email);
CREATE INDEX IF NOT EXISTS idx_beta_requests_status ON beta_requests(status);
CREATE INDEX IF NOT EXISTS idx_beta_requests_created_at ON beta_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE beta_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can submit a beta request (no auth required)
CREATE POLICY "Anyone can submit beta requests"
  ON beta_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated users can view their own requests
CREATE POLICY "Users can view their own requests"
  ON beta_requests
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Only admins can view all requests (you'll need to implement admin role)
-- For now, we'll allow service role to manage all requests via backend

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_beta_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_beta_requests_updated_at ON beta_requests;
CREATE TRIGGER set_beta_requests_updated_at
  BEFORE UPDATE ON beta_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_beta_requests_updated_at();

-- Add comment to table
COMMENT ON TABLE beta_requests IS 'Stores beta access requests from potential users during closed beta period';
COMMENT ON COLUMN beta_requests.email IS 'Email address of the person requesting beta access';
COMMENT ON COLUMN beta_requests.referral_source IS 'How they heard about the project (e.g., Twitter, Friend, etc.)';
COMMENT ON COLUMN beta_requests.status IS 'Request status: pending (default), approved, or rejected';
