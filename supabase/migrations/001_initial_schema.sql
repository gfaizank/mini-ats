-- Initial Schema for Multi-tenant ATS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create plans table
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  max_jobs INTEGER NOT NULL,
  max_candidates INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  plan_id UUID NOT NULL REFERENCES plans(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enum for company member roles
CREATE TYPE member_role AS ENUM ('admin', 'member');

-- Create company_members junction table
CREATE TABLE company_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Create enum for job status
CREATE TYPE job_status AS ENUM ('open', 'closed', 'archived');

-- Create jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  department VARCHAR(255),
  status job_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Create candidates table
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  resume_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, email)
);

-- Create enum for application stages
CREATE TYPE application_stage AS ENUM (
  'applied',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected'
);

-- Create applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  stage application_stage NOT NULL DEFAULT 'applied',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(candidate_id, job_id)
);

-- Create indexes for better performance
CREATE INDEX idx_company_members_user_id ON company_members(user_id);
CREATE INDEX idx_company_members_company_id ON company_members(company_id);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_candidates_company_id ON candidates(company_id);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_stage ON applications(stage);

-- Enable Row Level Security on all tables
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plans table
-- Plans are public read-only
CREATE POLICY "Plans are viewable by everyone"
  ON plans FOR SELECT
  USING (true);

-- RLS Policies for companies table
CREATE POLICY "Users can view companies they belong to"
  ON companies FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert companies"
  ON companies FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update their companies"
  ON companies FOR UPDATE
  USING (
    id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for company_members table
CREATE POLICY "Users can view members of their companies"
  ON company_members FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert themselves as members"
  ON company_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can insert new members"
  ON company_members FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update member roles"
  ON company_members FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete members"
  ON company_members FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for jobs table
CREATE POLICY "Users can view jobs from their companies"
  ON jobs FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create jobs for their companies"
  ON jobs FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update jobs from their companies"
  ON jobs FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete jobs from their companies"
  ON jobs FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for candidates table
CREATE POLICY "Users can view candidates from their companies"
  ON candidates FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create candidates for their companies"
  ON candidates FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update candidates from their companies"
  ON candidates FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete candidates from their companies"
  ON candidates FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for applications table
CREATE POLICY "Users can view applications from their companies"
  ON applications FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM jobs
      WHERE company_id IN (
        SELECT company_id FROM company_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create applications for their companies"
  ON applications FOR INSERT
  WITH CHECK (
    job_id IN (
      SELECT id FROM jobs
      WHERE company_id IN (
        SELECT company_id FROM company_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update applications from their companies"
  ON applications FOR UPDATE
  USING (
    job_id IN (
      SELECT id FROM jobs
      WHERE company_id IN (
        SELECT company_id FROM company_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can delete applications from their companies"
  ON applications FOR DELETE
  USING (
    job_id IN (
      SELECT id FROM jobs
      WHERE company_id IN (
        SELECT company_id FROM company_members
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Create helper functions
-- Function to get active jobs count for a company
CREATE OR REPLACE FUNCTION get_active_jobs_count(company_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM jobs
  WHERE company_id = company_uuid AND status = 'open';
$$ LANGUAGE SQL STABLE;

-- Function to get candidates count for a company
CREATE OR REPLACE FUNCTION get_candidates_count(company_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM candidates
  WHERE company_id = company_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to check if user is admin of a company
CREATE OR REPLACE FUNCTION is_company_admin(company_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1
    FROM company_members
    WHERE company_id = company_uuid
      AND user_id = user_uuid
      AND role = 'admin'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

