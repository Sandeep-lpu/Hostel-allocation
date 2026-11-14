export type Gender = 'Male' | 'Female' | 'Any';

export type RoomOccupancy = 1 | 2 | 3;
export type ApartmentPreference = 'with_apartment' | 'without_apartment';

export interface Hostel {
  id: string;
  name: string;
  code: string;
  gender: Gender;
  totalRooms: number;
  totalBeds: number;
  allocatedBeds: number;
  floors: number;
  facilities: string[];
  image: string;
  description: string;
}

export interface Room {
  id: string;
  hostelId: string;
  hostelName: string;
  roomNumber: string;
  floor: number;
  seater: RoomOccupancy;
  isAc: boolean;
  hasAttachedWashroom: boolean;
  isAccessible: boolean;
  isApartment: boolean; // With Apartment vs Without Apartment
  hasLaundry: boolean;  // Laundry Facility
  hasGymAccess: boolean; // Gym Facility
  feePerYear: number;
  totalBeds: number;
  availableBeds: number;
}

export interface Bed {
  id: string;
  roomId: string;
  roomNumber: string;
  hostelName: string;
  bedCode: string; // e.g. "BH4-204-B1"
  status: 'available' | 'allocated' | 'maintenance';
}

// Comprehensive 8-category lifestyle preferences
export interface LifestylePreferences {
  sleepSchedule: 'early_bird' | 'night_owl' | 'flexible';
  musicPreference: 'music_lover' | 'prefer_silence' | 'soft_music' | 'loud_music';
  cleanliness: 'very_clean' | 'moderately_clean' | 'flexible';
  socialBehaviour: 'introvert' | 'extrovert' | 'ambivert';
  studyHabits: 'silent' | 'group_study' | 'flexible';
  dailyRoutine: 'early_morning' | 'late_night' | 'flexible';
  foodHabits: 'vegetarian' | 'non_vegetarian' | 'eggetarian' | 'no_preference';
  culturalPersonal: {
    culturalInterests?: string;
    languagePreferences?: string;
    festivalParticipation?: boolean;
  };
  consentMatching?: boolean;
}

// Backward-compatibility alias
export type LifestyleSurvey = LifestylePreferences & {
  sleepHabit?: 'early_bird' | 'night_owl' | 'flexible';
  studyHabit?: 'silent' | 'music_background' | 'group_study';
  acPreference?: 'chilled_20c' | 'ambient_24c' | 'natural_air';
  roomActivity?: 'quiet_sanctuary' | 'social_hub';
  preferredRoommateRegNo?: string;
};

export type AllocationMode = 'random' | 'manual' | 'friend';

export interface StudentPreference {
  rank: number;
  seater: RoomOccupancy;
  isAc: boolean;
  hostelId?: string;
  hostelName?: string;
  roomId?: string;
  roomNumber?: string;
  floor?: number;
  allocationMode?: AllocationMode;
  isRandomAllotment?: boolean;
  isApartment?: boolean;
  requestedFacilities?: string[];
  friendRequestId?: string;
}

export interface FriendAllocationRequest {
  requestId: string;
  senderRegNo: string;
  senderName: string;
  targetRegNo: string;
  targetName: string;
  targetHostelId?: string;
  targetRoomNumber?: string;
  targetSeater?: RoomOccupancy;
  targetIsAc?: boolean;
  otp: string;
  otpExpiresAt: number;
  attemptsLeft: number;
  status: 'pending_otp' | 'otp_verified' | 'both_approved' | 'allocated' | 'rejected';
  createdAt: string;
}

export interface StudentApplication {
  id: string;
  studentId: string;
  studentName: string;
  regNo: string;
  email: string;
  phone?: string;
  gender: 'Male' | 'Female';
  program: string;
  year: number;
  cgpa: number;
  feeCleared: boolean;
  medicalAccessibilityNeeded: boolean;
  accessibilityRemarks?: string;
  status: 'submitted' | 'verified' | 'rejected' | 'allocated' | 'waitlisted';
  rejectionReason?: string;
  submittedAt: string;
  
  // Enhanced Profile & Eligibility Fields
  preferredOccupancy: RoomOccupancy;
  apartmentPreference: ApartmentPreference;
  preferredFacilities: string[]; // 'laundry', 'gym', 'wifi', 'sports', 'library'

  // Preferences & Mode
  allocationMode: AllocationMode;
  preferences: StudentPreference[];
  lifestyle: LifestylePreferences;
  friendRequest?: FriendAllocationRequest;
}

export interface AllocationResult {
  id: string;
  studentId: string;
  studentName: string;
  regNo: string;
  gender: 'Male' | 'Female';
  hostelName: string;
  roomNumber: string;
  floor: number;
  bedCode: string;
  seater: RoomOccupancy;
  isAc: boolean;
  isApartment: boolean;
  hasLaundry: boolean;
  hasGymAccess: boolean;
  allocationMode: AllocationMode;
  assignedRoommates: {
    name: string;
    regNo: string;
    program: string;
    matchScore: number;
    isFriendMatched?: boolean;
  }[];
  matchScore: number;
  matchExplanation: string;
  isDraft: boolean;
  wardenApproved: boolean;
  isPublished: boolean;
  wardenOverrideReason?: string;
  allocatedAt: string;
  friendLinkedRegNo?: string;
}

export interface RoomChangeRequest {
  id: string;
  studentId: string;
  studentName: string;
  regNo: string;
  currentRoom: string;
  currentHostel: string;
  reasonCategory: 'health_medical' | 'roommate_conflict' | 'study_routine' | 'fee_bracket';
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  wardenRemarks?: string;
  createdAt: string;
}
