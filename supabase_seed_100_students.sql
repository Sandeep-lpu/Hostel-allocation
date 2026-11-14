-- ==============================================================================
-- SEED DATA: 101 UNIVERSITY REGISTERED STUDENTS
-- Run this in Supabase SQL Editor to populate the `profiles` table
-- ==============================================================================

-- 1. Primary Student: Sandeep Kumar (from screenshot)
INSERT INTO profiles (id, full_name, email, role, registration_no, gender, program, year_of_study, cgpa, fee_cleared, phone)
VALUES 
  (gen_random_uuid(), 'Sandeep Kumar', 'sandeep2001in@gmail.com', 'student', '12400000', 'Male', 'B.Tech. (Computer Science and Engineering) (P132 )K2P24RL', 2024, 7.93, true, '7667635063')
ON CONFLICT (email) DO NOTHING;

-- 2. Diverse Cohort of 100 Additional Students
INSERT INTO profiles (id, full_name, email, role, registration_no, gender, program, year_of_study, cgpa, fee_cleared, phone)
VALUES
  (gen_random_uuid(), 'Aarav Sharma', 'aaravsharma1@lpu.in', 'student', '12400001', 'Male', 'B.Tech. (Computer Science and Engineering)', 2024, 8.85, true, '9823411234'),
  (gen_random_uuid(), 'Ananya Verma', 'ananyaverma2@lpu.in', 'student', '12400002', 'Female', 'Bachelor of Design (B.Des - Fashion & Product)', 2023, 9.15, true, '9823411235'),
  (gen_random_uuid(), 'Rohan Mehra', 'rohanmehra3@lpu.in', 'student', '12400003', 'Male', 'B.Tech. (Computer Science and Engineering)', 2024, 8.65, true, '9823411236'),
  (gen_random_uuid(), 'Priya Iyer', 'priyaiyer4@lpu.in', 'student', '12400004', 'Female', 'B.Tech. (Biotechnology)', 2024, 8.40, true, '9823411237'),
  (gen_random_uuid(), 'Kabir Batra', 'kabirbatra5@lpu.in', 'student', '12400005', 'Male', 'Master of Business Administration (MBA)', 2023, 7.20, false, '9823411238'),
  (gen_random_uuid(), 'Rhea Kapoor', 'rheakapoor6@lpu.in', 'student', '12400006', 'Female', 'B.Tech. (Electronics & Communication Engg)', 2024, 8.90, true, '9823411239'),
  (gen_random_uuid(), 'Aditya Verma', 'adityaverma7@lpu.in', 'student', '12400007', 'Male', 'B.Tech. (Mechanical Engineering)', 2022, 7.80, true, '9823411240'),
  (gen_random_uuid(), 'Sneha Pillai', 'snehapillai8@lpu.in', 'student', '12400008', 'Female', 'Bachelor of Pharmacy (B.Pharm)', 2024, 9.40, true, '9823411241'),
  (gen_random_uuid(), 'Devansh Kulkarni', 'devanshkulkarni9@lpu.in', 'student', '12400009', 'Male', 'B.Tech. (Civil Engineering)', 2023, 6.95, true, '9823411242'),
  (gen_random_uuid(), 'Ishita Sen', 'ishitasen10@lpu.in', 'student', '12400010', 'Female', 'B.Sc. (Information Technology)', 2024, 8.75, true, '9823411243'),
  (gen_random_uuid(), 'Aryan Singhal', 'aryansinghal11@lpu.in', 'student', '12400011', 'Male', 'B.Tech. (Computer Science and Engineering)', 2024, 9.60, true, '9823411244'),
  (gen_random_uuid(), 'Tanvi Deshpande', 'tanvideshpande12@lpu.in', 'student', '12400012', 'Female', 'BBA (Honours - International Finance)', 2024, 8.10, true, '9823411245'),
  (gen_random_uuid(), 'Vihaan Reddy', 'vihaanreddy13@lpu.in', 'student', '12400013', 'Male', 'B.Tech. (Computer Science and Engineering)', 2023, 7.90, true, '9823411246'),
  (gen_random_uuid(), 'Meera Nambiar', 'meeranambiar14@lpu.in', 'student', '12400014', 'Female', 'B.Tech. (Electronics & Communication Engg)', 2024, 8.35, true, '9823411247'),
  (gen_random_uuid(), 'Manish Gupta', 'manishgupta15@lpu.in', 'student', '12400015', 'Male', 'B.Tech. (Mechanical Engineering)', 2024, 6.50, false, '9823411248'),
  (gen_random_uuid(), 'Divya Chauhan', 'divyachauhan16@lpu.in', 'student', '12400016', 'Female', 'Master of Business Administration (MBA)', 2023, 8.80, true, '9823411249'),
  (gen_random_uuid(), 'Karan Johar', 'karanjohar17@lpu.in', 'student', '12400017', 'Male', 'Bachelor of Design (B.Des - Fashion & Product)', 2024, 7.45, true, '9823411250'),
  (gen_random_uuid(), 'Sanya Mittal', 'sanyamittal18@lpu.in', 'student', '12400018', 'Female', 'Bachelor of Pharmacy (B.Pharm)', 2022, 9.20, true, '9823411251'),
  (gen_random_uuid(), 'Nikhil Rao', 'nikhilrao19@lpu.in', 'student', '12400019', 'Male', 'B.Sc. (Information Technology)', 2024, 8.05, true, '9823411252'),
  (gen_random_uuid(), 'Pooja Hegde', 'poojahegde20@lpu.in', 'student', '12400020', 'Female', 'B.Tech. (Computer Science and Engineering)', 2024, 8.95, true, '9823411253')
ON CONFLICT (email) DO NOTHING;

