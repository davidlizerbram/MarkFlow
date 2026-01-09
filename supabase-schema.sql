-- MarkFlow Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to create the tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matters table (trademark applications/registrations)
CREATE TABLE IF NOT EXISTS matters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  serial_num TEXT NOT NULL UNIQUE,
  reg_num TEXT,
  mark_text TEXT NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  status_code INTEGER NOT NULL,
  filing_date DATE NOT NULL,
  reg_date DATE,
  filing_basis TEXT NOT NULL, -- '1(a)', '1(b)', '44(d)', '44(e)', '66(a)'
  image_url TEXT,
  goods_services TEXT,
  trademark_class TEXT,
  attorney_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deadlines table
CREATE TABLE IF NOT EXISTS deadlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matter_id UUID REFERENCES matters(id) ON DELETE CASCADE NOT NULL,
  deadline_type TEXT NOT NULL, -- 'office_action', 'statement_of_use', 'section_8', 'section_9', 'opposition', 'ttab_deadline'
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'completed')),
  is_extended BOOLEAN DEFAULT FALSE,
  notes TEXT,
  issue_date DATE, -- For office actions, the mailing date
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TTAB Proceedings table
CREATE TABLE IF NOT EXISTS ttab_proceedings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matter_id UUID REFERENCES matters(id) ON DELETE CASCADE NOT NULL,
  proceeding_num TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('opposition', 'cancellation')),
  current_phase TEXT NOT NULL, -- 'Pleadings', 'Discovery', 'Trial', 'Appeal', 'Suspended'
  opposer TEXT,
  filing_date DATE NOT NULL,
  last_sync TIMESTAMPTZ DEFAULT NOW(),
  events JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_matters_client ON matters(client_id);
CREATE INDEX IF NOT EXISTS idx_matters_status ON matters(status_code);
CREATE INDEX IF NOT EXISTS idx_matters_serial ON matters(serial_num);
CREATE INDEX IF NOT EXISTS idx_deadlines_matter ON deadlines(matter_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_due_date ON deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_status ON deadlines(status);
CREATE INDEX IF NOT EXISTS idx_ttab_matter ON ttab_proceedings(matter_id);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE ttab_proceedings ENABLE ROW LEVEL SECURITY;

-- For development/demo: Allow all authenticated users full access
-- In production, you would want more restrictive policies based on user roles

-- Clients policies
CREATE POLICY "Allow authenticated users to read clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (true);

-- Matters policies
CREATE POLICY "Allow authenticated users to read matters"
  ON matters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert matters"
  ON matters FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update matters"
  ON matters FOR UPDATE
  TO authenticated
  USING (true);

-- Deadlines policies
CREATE POLICY "Allow authenticated users to read deadlines"
  ON deadlines FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert deadlines"
  ON deadlines FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update deadlines"
  ON deadlines FOR UPDATE
  TO authenticated
  USING (true);

-- TTAB proceedings policies
CREATE POLICY "Allow authenticated users to read ttab"
  ON ttab_proceedings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert ttab"
  ON ttab_proceedings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update ttab"
  ON ttab_proceedings FOR UPDATE
  TO authenticated
  USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matters_updated_at
  BEFORE UPDATE ON matters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deadlines_updated_at
  BEFORE UPDATE ON deadlines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ttab_updated_at
  BEFORE UPDATE ON ttab_proceedings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
