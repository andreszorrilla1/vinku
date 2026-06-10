-- Test seed: creates demo accounts for all 3 roles so full flows can be tested
-- NOTE: These are for development only. Supabase Auth users must be created manually via dashboard.
-- This seed adds the profile data assuming these UUIDs already exist in auth.users.

-- Demo university admin profile (link to Universidad de los Andes)
-- You will need to create the actual auth user in Supabase dashboard with email: universidad@demo.vinkupass.com
-- Then replace the UUID below with the actual user UUID
-- For now, seed enrollments and wallet data for testing without auth

-- 1. Add wallet balance to all existing profiles (for testing)
-- (Profiles are created by the trigger, this updates wallet)

-- 2. Insert demo enrollments using existing seed courses and a placeholder student UUID
-- These will only work once a real student account exists

-- Instead, create safe insertable test data:

-- Give all universities some activity indicators
UPDATE universities SET total_earnings = 2850000, liquid_balance = 2280000 WHERE name = 'Universidad de los Andes';
UPDATE universities SET total_earnings = 1950000, liquid_balance = 1560000 WHERE name = 'EAFIT';
UPDATE universities SET total_earnings = 1200000, liquid_balance = 960000 WHERE name = 'Universidad Pontificia Bolivariana';

-- Ensure all seed courses have realistic credits
UPDATE courses SET cost_credits = 450000 WHERE title ILIKE '%inteligencia artificial%';
UPDATE courses SET cost_credits = 380000 WHERE title ILIKE '%análisis de datos%';
UPDATE courses SET cost_credits = 320000 WHERE title ILIKE '%marketing%';
UPDATE courses SET cost_credits = 290000 WHERE title ILIKE '%derecho%';
UPDATE courses SET cost_credits = 410000 WHERE title ILIKE '%emprendimiento%';

-- Fallback: update any course that still has 0 cost
UPDATE courses SET cost_credits = 350000 WHERE cost_credits = 0 OR cost_credits IS NULL;
