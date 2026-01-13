-- Seed data for development and testing

-- Insert default plans
INSERT INTO plans (id, name, max_jobs, max_candidates) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Free', 5, 50),
  ('00000000-0000-0000-0000-000000000002', 'Starter', 20, 200),
  ('00000000-0000-0000-0000-000000000003', 'Pro', 100, 1000);

-- Note: To create a test company and user, you'll need to:
-- 1. Sign up through the application to create a user in auth.users
-- 2. The application will automatically create a company and assign the user as admin

