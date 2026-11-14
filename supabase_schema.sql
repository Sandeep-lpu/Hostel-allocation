-- ==============================================================================
-- UNIVERSITY HOSTEL ALLOCATION SYSTEM - SUPABASE DATABASE SCHEMA
-- Follows the complete workflow: Registration -> Eligibility -> Preference &
-- Lifestyle Matching -> Automated Multi-Constraint Engine -> Warden Review ->
-- Published Letter & Room Change Management.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ROLES
CREATE TYPE user_role AS ENUM ('student', 'admin', 'warden');
CREATE TYPE gender_type AS ENUM ('Male', 'Female');

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'student',
  registration_no TEXT UNIQUE,
  gender gender_type NOT NULL,
  program TEXT,
  year_of_study INTEGER DEFAULT 1,
  cgpa NUMERIC(3, 2) DEFAULT 8.00,
  fee_cleared BOOLEAN DEFAULT true,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HOSTEL INVENTORY
CREATE TABLE IF NOT EXISTS hostels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- e.g. BH-1, GH-2
  gender_allowed gender_type NOT NULL,
  floors_count INTEGER NOT NULL DEFAULT 6,
  facilities TEXT[] DEFAULT ARRAY['Wi-Fi', 'Mess', 'Gym', 'Power Backup'],
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  floor INTEGER NOT NULL,
  seater_type INTEGER NOT NULL CHECK (seater_type IN (1, 2, 3, 4)),
  is_ac BOOLEAN DEFAULT false,
  has_attached_washroom BOOLEAN DEFAULT false,
  is_accessible BOOLEAN DEFAULT false, -- For physically challenged / medical priority
  fee_per_year NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hostel_id, room_number)
);

CREATE TYPE bed_status AS ENUM ('available', 'allocated', 'maintenance');

CREATE TABLE IF NOT EXISTS beds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  bed_code TEXT NOT NULL, -- e.g. BH4-204-B1
  status bed_status DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, bed_code)
);

-- 3. ALLOCATION CYCLES & POLICIES
CREATE TYPE cycle_status AS ENUM ('upcoming', 'open', 'processing', 'published', 'closed');

CREATE TABLE IF NOT EXISTS allocation_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- e.g. "Academic Session 2026-27 Autumn"
  academic_year TEXT NOT NULL,
  status cycle_status DEFAULT 'open',
  application_start TIMESTAMPTZ NOT NULL,
  application_end TIMESTAMPTZ NOT NULL,
  min_cgpa_cutoff NUMERIC(3, 2) DEFAULT 6.00,
  require_fee_clearance BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STUDENT APPLICATIONS
CREATE TYPE application_status AS ENUM ('submitted', 'verified', 'rejected', 'allocated', 'waitlisted');

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id UUID REFERENCES allocation_cycles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status application_status DEFAULT 'submitted',
  medical_accessibility_needed BOOLEAN DEFAULT false,
  accessibility_remarks TEXT,
  documents_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cycle_id, student_id)
);

-- 5. RANKED PREFERENCES
CREATE TABLE IF NOT EXISTS student_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL CHECK (rank BETWEEN 1 AND 5),
  seater_preference INTEGER CHECK (seater_preference IN (1, 2, 3, 4)),
  ac_preference BOOLEAN DEFAULT true,
  hostel_id UUID REFERENCES hostels(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(application_id, rank)
);

-- 6. LIFESTYLE & COMPATIBILITY SURVEY
CREATE TABLE IF NOT EXISTS lifestyle_surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  sleep_habit TEXT CHECK (sleep_habit IN ('early_bird', 'night_owl', 'flexible')),
  study_habit TEXT CHECK (study_habit IN ('silent', 'music_background', 'group_study')),
  cleanliness TEXT CHECK (cleanliness IN ('meticulous', 'moderate', 'relaxed')),
  ac_preference TEXT CHECK (ac_preference IN ('chilled_20c', 'ambient_24c', 'natural_air')),
  room_activity TEXT CHECK (room_activity IN ('quiet_sanctuary', 'social_hub')),
  consent_matching BOOLEAN DEFAULT true,
  preferred_roommate_reg_no TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ALLOCATION RESULTS & WARDEN APPROVAL
CREATE TABLE IF NOT EXISTS allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id UUID REFERENCES allocation_cycles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bed_id UUID REFERENCES beds(id) ON DELETE RESTRICT,
  match_score NUMERIC(5, 2) DEFAULT 0.00,
  match_explanation TEXT,
  is_draft BOOLEAN DEFAULT true,
  warden_approved BOOLEAN DEFAULT false,
  warden_override_reason TEXT,
  warden_approved_by UUID REFERENCES profiles(id),
  is_published BOOLEAN DEFAULT false,
  allocated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cycle_id, student_id),
  UNIQUE(bed_id)
);

-- 8. POST-ALLOCATION ROOM CHANGE REQUESTS
CREATE TYPE room_change_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS room_change_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  current_bed_id UUID REFERENCES beds(id),
  reason_category TEXT NOT NULL,
  description TEXT NOT NULL,
  status room_change_status DEFAULT 'pending',
  warden_remarks TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. RANKED WAITING LIST
CREATE TABLE IF NOT EXISTS waiting_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id UUID REFERENCES allocation_cycles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  waiting_rank INTEGER NOT NULL,
  preferred_seater INTEGER,
  preferred_ac BOOLEAN,
  status TEXT DEFAULT 'active', -- active / promoted / expired
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifestyle_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_change_requests ENABLE ROW LEVEL SECURITY;

-- Base read policies
CREATE POLICY "Public read hostels" ON hostels FOR SELECT USING (true);
CREATE POLICY "Public read rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Public read beds" ON beds FOR SELECT USING (true);
CREATE POLICY "Public read allocation_cycles" ON allocation_cycles FOR SELECT USING (true);

-- Student policies
CREATE POLICY "Students can read their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Students can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Students can manage their application" ON applications
  FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Students can view published allocations" ON allocations
  FOR SELECT USING (is_published = true OR auth.uid() = student_id);

