import { StudentPreference, LifestylePreferences, RoomOccupancy, ApartmentPreference, AllocationMode, FriendAllocationRequest } from './types';

export interface RegisteredStudent {
  id: string;
  name: string;
  regNo: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female';
  program: string;
  section: string;
  batch: number;
  cgpa: number;
  attendance: number;
  location: string;
  currentHostel: string;
  feeCleared: boolean;
  medicalAccessibilityNeeded: boolean;
  accessibilityRemarks?: string;
  avatar: string;
  
  // Enhanced Profile & Eligibility Fields
  preferredOccupancy: RoomOccupancy;
  apartmentPreference: ApartmentPreference;
  preferredFacilities: string[]; // e.g. ['laundry', 'gym']

  // Allocation status
  allocationStatus: 'unallocated' | 'verified' | 'draft' | 'allocated' | 'waitlisted';
  allocationMode: AllocationMode;
  
  lifestyle: LifestylePreferences;
  preferences?: StudentPreference[];
  friendRequest?: FriendAllocationRequest;
}

// Student 1: Sandeep Kumar (Exact from User Screenshot)
export const PRIMARY_STUDENT: RegisteredStudent = {
  id: 'std-12400000',
  name: 'Sandeep Kumar',
  regNo: '12400000',
  email: 'sandeep2001in@gmail.com',
  phone: '7667635063',
  gender: 'Male',
  program: 'B.Tech. (Computer Science and Engineering)',
  section: '(P132 )K2P24RL',
  batch: 2024,
  cgpa: 7.93,
  attendance: 82,
  location: 'Darbhanga,Darbhanga,India',
  currentHostel: 'Boys Hostel-01',
  feeCleared: true,
  medicalAccessibilityNeeded: false,
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  preferredOccupancy: 2,
  apartmentPreference: 'with_apartment',
  preferredFacilities: ['laundry', 'gym', 'wifi'],
  allocationStatus: 'allocated',
  allocationMode: 'manual',
  lifestyle: {
    sleepSchedule: 'night_owl',
    musicPreference: 'music_lover',
    cleanliness: 'very_clean',
    socialBehaviour: 'ambivert',
    studyHabits: 'silent',
    dailyRoutine: 'late_night',
    foodHabits: 'vegetarian',
    culturalPersonal: {
      culturalInterests: 'Tech Hackathons, Coding Clubs & Tech Fests',
      languagePreferences: 'English & Hindi',
      festivalParticipation: true
    },
    consentMatching: true
  },
  preferences: [
    { rank: 1, seater: 2, isAc: true, hostelId: 'bh-4', hostelName: 'BH-4 (Aravalli Executive)', roomNumber: '204', floor: 2, isApartment: true, isRandomAllotment: false }
  ]
};

// Generates 100 diverse, realistic university students
function generateStudents(): RegisteredStudent[] {
  const maleNames = [
    'Aarav Sharma', 'Rohan Mehra', 'Kabir Batra', 'Aditya Verma', 'Devansh Kulkarni', 
    'Aryan Singhal', 'Vihaan Reddy', 'Manish Gupta', 'Karan Johar', 'Nikhil Rao', 
    'Ritvik Nair', 'Harshvardhan Joshi', 'Tanmay Dixit', 'Rishi Banerjee', 'Yashwant Chawla',
    'Ayush Tiwari', 'Pranav Mishra', 'Siddharth Oberoi', 'Gaurav Bhatia', 'Deepak Saini',
    'Kunal Deshmukh', 'Sumit Pandey', 'Akshay Saxena', 'Varun Kapoor', 'Tushar Malani',
    'Abhinav Anand', 'Chaitanya Das', 'Aniket Choudhary', 'Hemanth Kumar', 'Rahul Grover',
    'Tarun Nambiar', 'Mayank Aggarwal', 'Omkar Patil', 'Samarjeet Singh', 'Mohit Rawat'
  ];

  const femaleNames = [
    'Ananya Verma', 'Priya Iyer', 'Rhea Kapoor', 'Sneha Pillai', 'Ishita Sen',
    'Tanvi Deshpande', 'Meera Nambiar', 'Divya Chauhan', 'Sanya Mittal', 'Pooja Hegde',
    'Aishwarya Nair', 'Shreya Ghoshal', 'Natasha Menon', 'Kritika Sharma', 'Aditi Rao',
    'Bhavna Bajaj', 'Simran Kaur', 'Lavanya Sundaram', 'Neha Aggarwal', 'Srishti Jain',
    'Anushka Mathur', 'Ritika Bhattacharya', 'Garima Singh', 'Swati Dubey', 'Mansi Sethi',
    'Pallavi Joshi', 'Prachi Goyal', 'Radhika Apte', 'Nikita Roy', 'Juhi Chawla'
  ];

  const programs = [
    'B.Tech. (Computer Science and Engineering)',
    'B.Tech. (Electronics & Communication Engg)',
    'B.Tech. (Mechanical Engineering)',
    'B.Tech. (Civil Engineering)',
    'B.Tech. (Biotechnology)',
    'Master of Business Administration (MBA)',
    'Bachelor of Design (B.Des - Fashion & Product)',
    'Bachelor of Pharmacy (B.Pharm)',
    'B.Sc. (Information Technology)',
    'BBA (Honours - International Finance)'
  ];

  const cities = [
    'Darbhanga, Bihar, India', 'New Delhi, Delhi, India', 'Chandigarh, Punjab, India',
    'Jaipur, Rajasthan, India', 'Lucknow, Uttar Pradesh, India', 'Patna, Bihar, India',
    'Bengaluru, Karnataka, India', 'Hyderabad, Telangana, India', 'Mumbai, Maharashtra, India',
    'Dehradun, Uttarakhand, India', 'Kolkata, West Bengal, India', 'Bhopal, Madhya Pradesh, India',
    'Ranchi, Jharkhand, India', 'Guwahati, Assam, India', 'Amritsar, Punjab, India'
  ];

  const list: RegisteredStudent[] = [PRIMARY_STUDENT];

  for (let i = 1; i <= 100; i++) {
    const isMale = i % 2 !== 0;
    const namePool = isMale ? maleNames : femaleNames;
    const name = namePool[(i - 1) % namePool.length] + (i > namePool.length ? ` ${Math.floor(i / namePool.length) + 1}` : '');
    const regNo = (12400000 + i).toString();
    const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
    const email = `${cleanName}${i}@lpu.in`;
    const program = programs[i % programs.length];
    const city = cities[i % cities.length];
    
    const cgpa = Number((6.30 + ((i * 3.7) % 3.55)).toFixed(2));
    const attendance = 72 + ((i * 7) % 27);
    const feeCleared = i % 15 !== 0;
    const medicalNeeded = i % 18 === 0;
    const currentHostel = isMale ? `Boys Hostel-0${(i % 5) + 1}` : `Girls Hostel-0${(i % 4) + 1}`;

    const preferredOccupancy: RoomOccupancy = (i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : 3) as RoomOccupancy;
    const apartmentPreference: ApartmentPreference = i % 2 === 0 ? 'with_apartment' : 'without_apartment';
    const preferredFacilities: string[] = ['wifi'];
    if (i % 2 === 0) preferredFacilities.push('laundry');
    if (i % 3 === 0) preferredFacilities.push('gym');

    const allocationMode: AllocationMode = i % 5 === 0 ? 'friend' : i % 2 === 0 ? 'random' : 'manual';

    const lifestyle: LifestylePreferences = {
      sleepSchedule: i % 3 === 0 ? 'night_owl' : i % 3 === 1 ? 'early_bird' : 'flexible',
      musicPreference: i % 4 === 0 ? 'music_lover' : i % 4 === 1 ? 'prefer_silence' : i % 4 === 2 ? 'soft_music' : 'loud_music',
      cleanliness: i % 3 === 0 ? 'very_clean' : i % 3 === 1 ? 'moderately_clean' : 'flexible',
      socialBehaviour: i % 3 === 0 ? 'introvert' : i % 3 === 1 ? 'extrovert' : 'ambivert',
      studyHabits: i % 3 === 0 ? 'silent' : i % 3 === 1 ? 'group_study' : 'flexible',
      dailyRoutine: i % 3 === 0 ? 'late_night' : i % 3 === 1 ? 'early_morning' : 'flexible',
      foodHabits: i % 4 === 0 ? 'vegetarian' : i % 4 === 1 ? 'non_vegetarian' : i % 4 === 2 ? 'eggetarian' : 'no_preference',
      culturalPersonal: {
        culturalInterests: i % 2 === 0 ? 'Music, Arts & Campus Drama Club' : 'Sports, Robotics & Tech Hackathons',
        languagePreferences: i % 3 === 0 ? 'English, Hindi & Punjabi' : 'English & Regional Dialect',
        festivalParticipation: i % 2 === 0
      },
      consentMatching: true
    };

    list.push({
      id: `std-${regNo}`,
      name,
      regNo,
      email,
      phone: `98${Math.floor(10000000 + Math.random() * 89999999)}`,
      gender: isMale ? 'Male' : 'Female',
      program,
      section: `(P${100 + (i % 40)})K2P${24 - (i % 3)}RL`,
      batch: 2024 - (i % 4),
      cgpa,
      attendance,
      location: city,
      currentHostel,
      feeCleared,
      medicalAccessibilityNeeded: medicalNeeded,
      accessibilityRemarks: medicalNeeded ? 'Ground floor requested for medical accommodation' : undefined,
      avatar: isMale 
        ? `https://images.unsplash.com/photo-${1500000000000 + (i * 123456) % 1000000000}?auto=format&fit=crop&w=400&q=80` 
        : `https://images.unsplash.com/photo-${1530000000000 + (i * 234567) % 1000000000}?auto=format&fit=crop&w=400&q=80`,
      preferredOccupancy,
      apartmentPreference,
      preferredFacilities,
      allocationStatus: feeCleared ? (i % 3 === 0 ? 'allocated' : 'verified') : 'unallocated',
      allocationMode,
      lifestyle,
      preferences: [
        { 
          rank: 1, 
          seater: preferredOccupancy, 
          isAc: i % 2 === 0, 
          hostelId: isMale ? 'bh-4' : 'gh-1',
          hostelName: isMale ? 'BH-4 (Aravalli Executive)' : 'GH-1 (Nilgiri Heights)',
          isApartment: apartmentPreference === 'with_apartment',
          allocationMode
        }
      ]
    });
  }

  return list;
}

export const REGISTERED_STUDENTS: RegisteredStudent[] = generateStudents();
