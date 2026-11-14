'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  CheckCircle2, 
  Bed, 
  Users, 
  Download, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Building,
  Heart,
  Send,
  HelpCircle,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  TrendingUp,
  Clock,
  UserCheck,
  Search,
  ChevronDown,
  Dices,
  Check,
  Ban,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  QrCode,
  Printer,
  Sliders,
  Sparkle,
  CreditCard,
  Wallet,
  Receipt,
  RotateCcw,
  Lock
} from 'lucide-react';
import { RegisteredStudent, REGISTERED_STUDENTS, PRIMARY_STUDENT } from '@/lib/studentsData';
import { getCurrentStudent, setCurrentStudent, getAuthSession } from '@/lib/authStore';
import { INITIAL_ALLOCATIONS, INITIAL_ROOM_CHANGES, INITIAL_HOSTELS, INITIAL_ROOMS } from '@/lib/mockData';
import { 
  AllocationResult, 
  RoomChangeRequest, 
  LifestylePreferences, 
  Room, 
  StudentPreference, 
  RoomOccupancy, 
  ApartmentPreference, 
  AllocationMode, 
  FriendAllocationRequest 
} from '@/lib/types';
import { 
  sendFriendOtpRequest, 
  verifyFriendOtp, 
  subscribeToFriendEvents,
  getStoredFriendRequests 
} from '@/lib/socketClient';

export default function StudentPortal() {
  const router = useRouter();
  const [student, setStudent] = useState<RegisteredStudent>(PRIMARY_STUDENT);
  const [activeTab, setActiveTab] = useState<'profile' | 'allocation'>('profile');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [searchPicker, setSearchPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [authChecked, setAuthChecked] = useState(false);

  // 1. Profile & Eligibility Preferences State
  const [preferredOccupancy, setPreferredOccupancy] = useState<RoomOccupancy>(student.preferredOccupancy || 2);
  const [apartmentPreference, setApartmentPreference] = useState<ApartmentPreference>(student.apartmentPreference || 'with_apartment');
  const [preferredFacilities, setPreferredFacilities] = useState<string[]>(student.preferredFacilities || ['laundry', 'gym', 'wifi']);
  const [profileSavedMsg, setProfileSavedMsg] = useState<string | null>(null);

  // Medical State
  const [medicalNeeded, setMedicalNeeded] = useState(student.medicalAccessibilityNeeded);
  const [medicalRemarks, setMedicalRemarks] = useState(student.accessibilityRemarks || '');

  // 2. Room Allocation Mode & Preferences State
  const [allocationMode, setAllocationMode] = useState<AllocationMode>(student.allocationMode || 'manual');
  const [selectedHostelId, setSelectedHostelId] = useState<string>(
    student.gender === 'Female' ? 'gh-1' : 'bh-4'
  );
  const [selectedFloor, setSelectedFloor] = useState<number>(2);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(() => {
    return INITIAL_ROOMS.find(r => r.hostelId === 'bh-4' && r.roomNumber === '204') || null;
  });

  // Friend Allocation State (Option 3)
  const [friendRegNoInput, setFriendRegNoInput] = useState('');
  const [friendSearchResult, setFriendSearchResult] = useState<RegisteredStudent | null>(null);
  const [friendError, setFriendError] = useState<string | null>(null);
  const [activeFriendReq, setActiveFriendReq] = useState<FriendAllocationRequest | null>(null);
  const [incomingFriendOtp, setIncomingFriendOtp] = useState<string | null>(null);
  const [otpVerifyInput, setOtpVerifyInput] = useState('');
  const [otpStatusMsg, setOtpStatusMsg] = useState<{ success: boolean; text: string } | null>(null);

  // 3. Lifestyle Preferences (8 Detailed Categories)
  const [lifestyle, setLifestyle] = useState<LifestylePreferences>(
    student.lifestyle || {
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
    }
  );

  // 4. Allocation Result & Allotment Slip State
  const [allocation, setAllocation] = useState<AllocationResult | null>(INITIAL_ALLOCATIONS[0]);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  // Fake Payment & Fee Clearance State (Demo Presentation)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'paid'>('pending');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paidTimestamp, setPaidTimestamp] = useState<string | null>(null);

  const baseFee = preferredOccupancy === 1 ? 165000 : preferredOccupancy === 2 ? 120000 : 95000;
  const apartmentFee = apartmentPreference === 'with_apartment' ? 15000 : 0;
  const securityDeposit = 5000;
  const totalHostelFee = baseFee + apartmentFee + securityDeposit;

  const handleSimulatePayment = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      const txn = `TXN-LPU-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const time = new Date().toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      setTransactionId(txn);
      setPaidTimestamp(time);
      setPaymentStatus('paid');
      setShowPaymentModal(false);
    }, 1200);
  };

  const handleResetPayment = () => {
    setPaymentStatus('pending');
    setTransactionId(null);
    setPaidTimestamp(null);
  };

  // 5. Room Change State
  const [roomChanges, setRoomChanges] = useState<RoomChangeRequest[]>(INITIAL_ROOM_CHANGES);
  const [rcCategory, setRcCategory] = useState<'health_medical' | 'roommate_conflict' | 'study_routine' | 'fee_bracket'>('health_medical');
  const [rcDescription, setRcDescription] = useState('');
  const [rcSubmitted, setRcSubmitted] = useState(false);

  // Load active student and listen for events
  useEffect(() => {
    const session = getAuthSession();
    if (!session.isLoggedIn) {
      router.replace('/login?role=student&redirect=/portal/student');
      return;
    }
    setAuthChecked(true);

    const cur = getCurrentStudent();
    setStudent(cur);
    setPreferredOccupancy(cur.preferredOccupancy || 2);
    setApartmentPreference(cur.apartmentPreference || 'with_apartment');
    setPreferredFacilities(cur.preferredFacilities || ['laundry', 'gym', 'wifi']);
    setMedicalNeeded(cur.medicalAccessibilityNeeded);
    setMedicalRemarks(cur.accessibilityRemarks || '');
    if (cur.lifestyle) setLifestyle(cur.lifestyle);
    if (cur.allocationMode) setAllocationMode(cur.allocationMode);

    // Check stored friend requests
    const storedReqs = getStoredFriendRequests();
    const req = storedReqs.find(r => r.senderRegNo === cur.regNo || r.targetRegNo === cur.regNo);
    if (req) {
      setActiveFriendReq(req);
      if (req.targetRegNo === cur.regNo && req.status === 'pending_otp') {
        setIncomingFriendOtp(req.otp);
      }
    }

    // Subscribe to Socket.IO real-time friend events
    const unsubscribe = subscribeToFriendEvents(cur.regNo, {
      onReceiveOtp: (newReq) => {
        setActiveFriendReq(newReq);
        setIncomingFriendOtp(newReq.otp);
      },
      onVerificationSuccess: (payload) => {
        setActiveFriendReq(prev => prev ? { ...prev, status: 'both_approved' } : null);
        setOtpStatusMsg({ success: true, text: 'Mutual Friend Room Verification Confirmed in Real-Time!' });
      }
    });

    const onAuthChanged = () => {
      const updated = getCurrentStudent();
      setStudent(updated);
      setPreferredOccupancy(updated.preferredOccupancy || 2);
      setApartmentPreference(updated.apartmentPreference || 'with_apartment');
      setPreferredFacilities(updated.preferredFacilities || ['laundry', 'gym', 'wifi']);
      setMedicalNeeded(updated.medicalAccessibilityNeeded);
      setMedicalRemarks(updated.accessibilityRemarks || '');
      if (updated.lifestyle) setLifestyle(updated.lifestyle);
    };

    window.addEventListener('lpu_auth_changed', onAuthChanged);
    return () => {
      window.removeEventListener('lpu_auth_changed', onAuthChanged);
      unsubscribe();
    };
  }, [router]);

  const switchStudent = (s: RegisteredStudent) => {
    setCurrentStudent(s);
    setStudent(s);
    setPreferredOccupancy(s.preferredOccupancy || 2);
    setApartmentPreference(s.apartmentPreference || 'with_apartment');
    setPreferredFacilities(s.preferredFacilities || ['laundry', 'gym', 'wifi']);
    setMedicalNeeded(s.medicalAccessibilityNeeded);
    setMedicalRemarks(s.accessibilityRemarks || '');
    if (s.lifestyle) setLifestyle(s.lifestyle);
    setSearchPicker(false);
  };

  // Facility toggle helper
  const toggleFacility = (facility: string) => {
    if (preferredFacilities.includes(facility)) {
      setPreferredFacilities(preferredFacilities.filter(f => f !== facility));
    } else {
      setPreferredFacilities([...preferredFacilities, facility]);
    }
  };

  // Step 1: Save profile & eligibility preferences
  const handleSaveProfilePreferences = () => {
    const updated = {
      ...student,
      preferredOccupancy,
      apartmentPreference,
      preferredFacilities,
      medicalAccessibilityNeeded: medicalNeeded,
      accessibilityRemarks: medicalRemarks
    };
    setCurrentStudent(updated);
    setStudent(updated);
    setProfileSavedMsg('Room Occupancy, Apartment & Facilities preferences saved successfully!');
    setTimeout(() => setProfileSavedMsg(null), 3500);
    setActiveStep(2);
  };

  // Friend search validator
  const handleSearchFriend = () => {
    setFriendError(null);
    setFriendSearchResult(null);
    const trimmed = friendRegNoInput.trim();

    if (!trimmed) {
      setFriendError('Please enter a university registration number.');
      return;
    }
    if (trimmed === student.regNo) {
      setFriendError('You cannot enter your own registration number.');
      return;
    }

    const friend = REGISTERED_STUDENTS.find(s => s.regNo === trimmed);
    if (!friend) {
      setFriendError(`No registered student found with ID "${trimmed}".`);
      return;
    }
    if (friend.gender !== student.gender) {
      setFriendError(`Friend must be enrolled in the ${student.gender} residential wing (${friend.name} is ${friend.gender}).`);
      return;
    }
    if (!friend.feeCleared) {
      setFriendError(`Student ${friend.name} has pending fee clearance and cannot be allocated currently.`);
      return;
    }

    setFriendSearchResult(friend);
  };

  // Step 2 Option 3: Send Friend OTP Request
  const handleSendFriendOtp = () => {
    if (!friendSearchResult) return;

    const req = sendFriendOtpRequest({
      senderRegNo: student.regNo,
      senderName: student.name,
      targetRegNo: friendSearchResult.regNo,
      targetName: friendSearchResult.name,
      targetHostelId: selectedHostelId,
      targetRoomNumber: selectedRoom?.roomNumber || '204',
      targetSeater: preferredOccupancy
    });

    setActiveFriendReq(req);
    setOtpStatusMsg({
      success: true,
      text: `OTP sent in real-time to ${friendSearchResult.name}'s portal via Socket.IO.`
    });
  };

  // Step 2 Option 3: Verify Friend OTP
  const handleVerifyOtp = () => {
    if (!activeFriendReq) return;
    const res = verifyFriendOtp(activeFriendReq.requestId, otpVerifyInput);
    setOtpStatusMsg({ success: res.success, text: res.message });
    if (res.success) {
      setActiveFriendReq({ ...activeFriendReq, status: 'both_approved' });
      setIncomingFriendOtp(null);
    }
  };

  // Step 2: Save Room Preference
  const handleSaveStep2 = () => {
    setActiveStep(3);
  };

  // Step 3: Save Lifestyle & Submit Application
  const handleSaveStep3 = () => {
    setSubmittedMessage('Hostel Application & 8-Dimension Lifestyle Preferences submitted! Application is queued for Admin Review & Multi-Constraint Allocation.');
    setActiveStep(4);
  };

  // Step 5: Submit Room Change
  const handleSubmitRoomChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rcDescription) return;
    const newReq: RoomChangeRequest = {
      id: `rc-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      regNo: student.regNo,
      currentRoom: allocation ? `${allocation.roomNumber} (${allocation.hostelName})` : student.currentHostel,
      currentHostel: allocation ? allocation.hostelName : student.currentHostel,
      reasonCategory: rcCategory,
      description: rcDescription,
      status: 'pending',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    setRoomChanges([newReq, ...roomChanges]);
    setRcDescription('');
    setRcSubmitted(true);
  };

  const cgpaPercentage = (student.cgpa / 10) * 100;
  const attendancePercentage = student.attendance;

  const filteredStudents = REGISTERED_STUDENTS.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.regNo.includes(searchQuery) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-5 h-5 rounded-full border-2 border-[#e88734] border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-700">Verifying session credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen py-5 sm:py-7 font-sans">
      <div className="w-full max-w-[1360px] mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* TOP DEMO TOOLBAR: Switch between 101 registered students */}
        <div className="mb-4 bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-800">
              Active Demo Session: <span className="text-[#f37021]">{student.name}</span> ({student.regNo})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/portal/friend-demo"
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Real-Time Friend OTP Demo (Dual Sessions)</span>
            </Link>
            <button
              onClick={() => setSearchPicker(!searchPicker)}
              className="bg-orange-50 hover:bg-orange-100 text-[#f37021] border border-orange-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Switch Student (101 Active)</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <Link
              href="/login"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-bold transition-all"
            >
              UMS Login
            </Link>
          </div>
        </div>

        {/* POPUP: 101 Students Picker */}
        {searchPicker && (
          <div className="mb-6 bg-white border border-slate-300 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#0f1f38]">Select Any Registered University Student</h3>
              <button onClick={() => setSearchPicker(false)} className="text-xs text-slate-500 hover:text-black">
                ✕ Close
              </button>
            </div>
            <input
              type="text"
              placeholder="Search by name, registration no (e.g. 12400000), or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl mb-3 focus:outline-none focus:border-[#f37021]"
            />
            <div className="max-h-64 overflow-y-auto space-y-1 divide-y divide-slate-100">
              {filteredStudents.map((std) => (
                <button
                  key={std.id}
                  onClick={() => switchStudent(std)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    std.regNo === student.regNo ? 'bg-orange-100/70 text-[#f37021]' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-bold">{std.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Reg: {std.regNo} · {std.program}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                      {std.cgpa} CGPA
                    </span>
                    <div className="text-[10px] text-slate-400">{std.currentHostel}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MAIN NAVIGATION TABS */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
              activeTab === 'profile'
                ? 'bg-[#0f1f38] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#f37021]" />
            <span>My Profile &amp; Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab('allocation')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
              activeTab === 'allocation'
                ? 'bg-[#f37021] text-white shadow-md shadow-orange-500/20'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Bed className="w-4 h-4" />
            <span>Hostel Allocation Wizard (Random / Manual / Friend OTP)</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: MY PROFILE (ENHANCED WITH ROOM OCCUPANCY, APARTMENT & FACILITIES) */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
              
              {/* Header Bar */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <UserCheck className="w-4 h-4 text-slate-700" />
                  <span>My Profile</span>
                </div>
                <div className="text-slate-500 flex items-center gap-1 font-medium">
                  <Link href="/" className="hover:text-black">Home</Link>
                  <span>•</span>
                  <span className="text-slate-800 font-bold">Profile</span>
                </div>
              </div>

              {/* Panoramic Campus Banner with Central Avatar */}
              <div className="relative">
                <div className="h-44 sm:h-52 w-full overflow-hidden bg-slate-800 relative">
                  <img
                    src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80"
                    alt="University Campus Panoramic View"
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Summary Stats Row */}
              <div className="pt-12 pb-6 px-6 sm:px-10 border-b border-slate-100">
                <div className="grid grid-cols-3 items-center">
                  <div className="text-left pl-2 sm:pl-6">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">
                      {student.cgpa.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                      CGPA
                    </div>
                  </div>

                  <div className="text-center px-2">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      {student.name}
                    </h2>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {student.program} {student.section}
                    </p>
                  </div>

                  <div className="text-right pr-2 sm:pr-6">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">
                      {student.attendance} %
                    </div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                      Attendance
                    </div>
                  </div>
                </div>

                {/* Exact LPU Tabs from Screenshot */}
                <div className="flex justify-end gap-6 pt-4 border-t border-slate-100 mt-4 text-xs font-semibold">
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="flex items-center gap-1.5 text-[#e88734] pb-1 border-b-2 border-[#e88734] transition-all"
                  >
                    <svg className="w-3.5 h-3.5 text-[#e88734]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>Profile</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('allocation')} 
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 pb-1 transition-all"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    </svg>
                    <span>Update Profile</span>
                  </button>
                </div>
              </div>

              {/* THREE PROFILE CARDS: Personal Info, CGPA Donut, Attendance Donut (Exact Replica) */}
              <div className="p-6 sm:p-8 bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Card 1: Personal Information */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
                    <h3 className="font-bold text-slate-900 text-sm text-center border-b border-slate-100 pb-2.5 mb-4">
                      Personal Information
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center gap-3 text-slate-800">
                        <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800">{student.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-800">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-600 truncate">{student.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-800">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-600">{student.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-800">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-600 truncate">{student.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-800">
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-600">Hostel: {student.currentHostel}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-800">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-600">Batch: {student.batch}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: CGPA Gauge Chart */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                        <TrendingUp className="w-4 h-4 text-slate-700" />
                        <span>CGPA</span>
                      </div>
                      <span className="text-xs font-bold text-[#285a96]">{student.cgpa.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-center my-4">
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="38" stroke="#faeee5" strokeWidth="8" fill="transparent" />
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            stroke="#e59b58"
                            strokeWidth="8"
                            strokeDasharray={2 * Math.PI * 38}
                            strokeDashoffset={(2 * Math.PI * 38) * (1 - cgpaPercentage / 100)}
                            strokeLinecap="round"
                            fill="transparent"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-xl font-bold text-slate-800">{student.cgpa.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-[10px] font-medium text-slate-400 border-t border-slate-100 pt-2">
                      Minimum Cutoff: 6.00 CGPA (Eligible)
                    </div>
                  </div>

                  {/* Card 3: Attendance Gauge Chart */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                        <Clock className="w-4 h-4 text-slate-700" />
                        <span>Attendance</span>
                      </div>
                      <span className="text-xs font-bold text-[#285a96]">{student.attendance}%</span>
                    </div>

                    <div className="flex items-center justify-center my-4">
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="38" stroke="#faeee5" strokeWidth="8" fill="transparent" />
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            stroke="#61b882"
                            strokeWidth="8"
                            strokeDasharray={2 * Math.PI * 38}
                            strokeDashoffset={(2 * Math.PI * 38) * (1 - attendancePercentage / 100)}
                            strokeLinecap="round"
                            fill="transparent"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-xl font-bold text-slate-800">{student.attendance}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-[10px] font-medium text-slate-400 border-t border-slate-100 pt-2">
                      University Threshold: 75% Mandatory
                    </div>
                  </div>

                </div>

                {/* =============================================================== */}
                {/* ENHANCED SECTION: ROOM OCCUPANCY, APARTMENT & FACILITIES CONFIG */}
                {/* =============================================================== */}
                <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#f37021] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        Profile Configuration
                      </span>
                      <h3 className="text-base font-black text-[#0f1f38] mt-1">
                        Room Occupancy, Apartment &amp; Facilities Preferences
                      </h3>
                      <p className="text-xs text-slate-500">
                        Set your preferred living conditions. These preferences guide both manual and automated allocation.
                      </p>
                    </div>

                    {profileSavedMsg && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-pulse">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {profileSavedMsg}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 1. Room Occupancy Preferences */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-800 block">
                        Room Occupancy Preference
                      </label>
                      <div className="space-y-2">
                        {[
                          { val: 1 as RoomOccupancy, label: 'One Seater (Single)', desc: 'Complete privacy & dedicated study desk' },
                          { val: 2 as RoomOccupancy, label: 'Two Seater (Double)', desc: 'Balanced social living with one roommate' },
                          { val: 3 as RoomOccupancy, label: 'Three Seater (Triple)', desc: 'Affordable collaborative student room' }
                        ].map((opt) => (
                          <label
                            key={opt.val}
                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              preferredOccupancy === opt.val
                                ? 'border-[#f37021] bg-orange-50/50 shadow-sm ring-1 ring-[#f37021]'
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="occupancy"
                              checked={preferredOccupancy === opt.val}
                              onChange={() => setPreferredOccupancy(opt.val)}
                              className="mt-0.5 text-[#f37021] focus:ring-[#f37021]"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                              <div className="text-[11px] text-slate-500">{opt.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 2. Accommodation Preferences */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-800 block">
                        Accommodation Structure
                      </label>
                      <div className="space-y-2">
                        {[
                          { val: 'with_apartment' as ApartmentPreference, label: 'With Apartment', desc: 'Suite style with private lounge & attached washroom' },
                          { val: 'without_apartment' as ApartmentPreference, label: 'Without Apartment (Standard)', desc: 'Traditional hostel room layout' }
                        ].map((opt) => (
                          <label
                            key={opt.val}
                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              apartmentPreference === opt.val
                                ? 'border-[#f37021] bg-orange-50/50 shadow-sm ring-1 ring-[#f37021]'
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="apartment"
                              checked={apartmentPreference === opt.val}
                              onChange={() => setApartmentPreference(opt.val)}
                              className="mt-0.5 text-[#f37021] focus:ring-[#f37021]"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                              <div className="text-[11px] text-slate-500">{opt.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 3. Facilities Preferences */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-800 block">
                        Hostel Facilities Desired
                      </label>
                      <div className="space-y-2">
                        {[
                          { id: 'laundry', label: 'Laundry Facility', desc: 'In-house automated washing & dry cleaning' },
                          { id: 'gym', label: 'Gym Facility', desc: 'Fitness center, cardio & yoga equipment' },
                          { id: 'wifi', label: 'High-Speed Wi-Fi 6', desc: '1 Gbps dedicated campus network LAN' },
                          { id: 'mess', label: 'Attached Dietary Mess', desc: 'Nutritious meal plans included' }
                        ].map((fac) => (
                          <label
                            key={fac.id}
                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              preferredFacilities.includes(fac.id)
                                ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={preferredFacilities.includes(fac.id)}
                              onChange={() => toggleFacility(fac.id)}
                              className="mt-0.5 text-emerald-600 rounded focus:ring-emerald-500"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900">{fac.label}</div>
                              <div className="text-[11px] text-slate-500">{fac.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleSaveProfilePreferences}
                      className="bg-[#0f1f38] hover:bg-[#1a3258] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow transition-all flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 text-[#f37021]" />
                      <span>Update &amp; Save Preferences</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: HOSTEL ALLOCATION WIZARD (THE WORKFLOW SYSTEM) */}
        {/* ========================================================================= */}
        {activeTab === 'allocation' && (
          <div className="space-y-6">
            
            {/* Stepper Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm overflow-x-auto">
              <div className="flex items-center justify-between min-w-[620px] gap-2">
                {[
                  { num: 1, label: 'Profile & Eligibility' },
                  { num: 2, label: 'Room Preferences & Friend OTP' },
                  { num: 3, label: 'Lifestyle Matching (8 Dims)' },
                  { num: 4, label: 'Official Allotment Slip (PDF)' },
                  { num: 5, label: 'Room Change Request' }
                ].map(step => (
                  <button
                    key={step.num}
                    onClick={() => setActiveStep(step.num)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      activeStep === step.num
                        ? 'bg-[#0f1f38] text-white shadow'
                        : activeStep > step.num
                        ? 'bg-orange-50 text-[#f37021]'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                      activeStep === step.num
                        ? 'bg-[#f37021] text-white'
                        : activeStep > step.num
                        ? 'bg-[#f37021]/20 text-[#f37021]'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {step.num}
                    </span>
                    <span>{step.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {submittedMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{submittedMessage}</span>
                </div>
                <button onClick={() => setSubmittedMessage(null)} className="text-xs font-bold text-emerald-700 underline">
                  Dismiss
                </button>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 1: ELIGIBILITY & PREFERENCE CONFIRMATION */}
            {/* ========================================================================= */}
            {activeStep === 1 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-black text-[#0f1f38]">Step 1: Student Verification &amp; Eligibility</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Verifying academic record and room preferences for {student.name} ({student.regNo}).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500 font-semibold">Academic CGPA</div>
                    <div className="text-2xl font-black text-[#0f1f38] mt-1">{student.cgpa.toFixed(2)}</div>
                    <div className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Above 6.00 cutoff (Eligible)
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500 font-semibold">Semester Fee Status</div>
                    <div className="text-2xl font-black text-[#0f1f38] mt-1">
                      {student.feeCleared ? 'Cleared' : 'Pending'}
                    </div>
                    <div className={`text-xs font-bold mt-1 flex items-center gap-1 ${student.feeCleared ? 'text-emerald-600' : 'text-rose-600'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {student.feeCleared ? 'No pending balances' : 'Dues pending at fee office'}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500 font-semibold">Configured Preferences</div>
                    <div className="text-base font-black text-[#0f1f38] mt-1">
                      {preferredOccupancy}-Seater · {apartmentPreference === 'with_apartment' ? 'Apartment' : 'Standard'}
                    </div>
                    <div className="text-xs text-[#f37021] font-semibold mt-1">
                      Facilities: {preferredFacilities.join(', ').toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-5 bg-orange-50/40">
                  <h3 className="font-bold text-[#0f1f38] text-sm mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#f37021]" />
                    Special Medical &amp; Accessibility Accommodations
                  </h3>
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={medicalNeeded}
                      onChange={(e) => setMedicalNeeded(e.target.checked)}
                      className="w-4 h-4 text-[#f37021] rounded"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      I require priority ground/elevator-accessible room allocation due to medical reasons
                    </span>
                  </label>
                  {medicalNeeded && (
                    <textarea
                      value={medicalRemarks}
                      onChange={(e) => setMedicalRemarks(e.target.value)}
                      placeholder="Specify medical condition or mobility requirement..."
                      rows={2}
                      className="w-full text-xs p-3 border border-slate-300 rounded-lg bg-white"
                    />
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveProfilePreferences}
                    className="flex items-center gap-2 bg-[#f37021] hover:bg-[#d65a0e] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-orange-500/20"
                  >
                    <span>Save &amp; Continue to Room Preferences</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 2: ROOM PREFERENCES (3 OPTIONS: RANDOM, MANUAL, FRIEND-BASED OTP) */}
            {/* ========================================================================= */}
            {activeStep === 2 && (() => {
              const allowedHostels = INITIAL_HOSTELS.filter(
                h => h.gender === student.gender || h.gender === 'Any'
              );
              const currentHostel = allowedHostels.find(h => h.id === selectedHostelId) || allowedHostels[0];
              const hostelRooms = INITIAL_ROOMS.filter(r => r.hostelId === currentHostel.id);
              const floors = Array.from(new Set(hostelRooms.map(r => r.floor))).sort((a, b) => a - b);
              const activeFloor = floors.includes(selectedFloor) ? selectedFloor : floors[0] || 1;
              const floorRooms = hostelRooms.filter(r => r.floor === activeFloor);
              const floorVacantBeds = floorRooms.reduce((sum, r) => sum + r.availableBeds, 0);

              if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-5 h-5 rounded-full border-2 border-[#e88734] border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-700">Verifying session credentials...</span>
        </div>
      </div>
    );
  }

  return (
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
                  {/* Step Header */}
                  <div className="border-b border-slate-100 pb-4">
                    <span className="bg-orange-100 text-[#f37021] text-[10px] font-black uppercase px-2 py-0.5 rounded">
                      Allocation Options
                    </span>
                    <h2 className="text-xl font-black text-[#0f1f38] mt-1">
                      Step 2: Room Preferences &amp; Allocation Method
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Choose how you would like to be allocated: Random automated matching, Manual room selection, or Friend-based mutual OTP allocation.
                    </p>
                  </div>

                  {/* 3 ALLOCATION OPTION SELECTOR TABS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* OPTION 1: RANDOM ROOM ALLOCATION */}
                    <div
                      onClick={() => setAllocationMode('random')}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        allocationMode === 'random'
                          ? 'border-[#f37021] bg-orange-50/50 shadow-md ring-2 ring-[#f37021]'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            allocationMode === 'random' ? 'bg-[#f37021] text-white shadow' : 'bg-slate-200 text-slate-700'
                          }`}>
                            <Dices className="w-5 h-5" />
                          </div>
                          {allocationMode === 'random' && (
                            <span className="text-[10px] font-black uppercase bg-[#f37021] text-white px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm text-[#0f1f38]">Option 1: Random Allocation</h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          The system automatically allocates a vacant room based on availability, eligibility, and <strong>8-dimension lifestyle harmony</strong>.
                        </p>
                      </div>
                      <div className="pt-3 text-[11px] font-bold text-[#f37021]">
                        {allocationMode === 'random' ? '✓ Selected Method' : 'Click to Select'}
                      </div>
                    </div>

                    {/* OPTION 2: MANUAL ROOM SELECTION */}
                    <div
                      onClick={() => setAllocationMode('manual')}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        allocationMode === 'manual'
                          ? 'border-[#0f1f38] bg-slate-50 shadow-md ring-2 ring-[#0f1f38]'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            allocationMode === 'manual' ? 'bg-[#0f1f38] text-white shadow' : 'bg-slate-200 text-slate-700'
                          }`}>
                            <Building2 className="w-5 h-5" />
                          </div>
                          {allocationMode === 'manual' && (
                            <span className="text-[10px] font-black uppercase bg-[#0f1f38] text-white px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm text-[#0f1f38]">Option 2: Manual Room Selection</h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Browse hostels, floors, room numbers, and live vacant bed slots. Directly choose your exact room.
                        </p>
                      </div>
                      <div className="pt-3 text-[11px] font-bold text-[#0f1f38]">
                        {allocationMode === 'manual' ? '✓ Selected Method' : 'Click to Select'}
                      </div>
                    </div>

                    {/* OPTION 3: ROOM WITH A FRIEND */}
                    <div
                      onClick={() => setAllocationMode('friend')}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        allocationMode === 'friend'
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-600'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            allocationMode === 'friend' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-200 text-slate-700'
                          }`}>
                            <Users className="w-5 h-5" />
                          </div>
                          {allocationMode === 'friend' && (
                            <span className="text-[10px] font-black uppercase bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm text-[#0f1f38]">Option 3: Room With a Friend</h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Pair with a friend using real-time Socket.IO OTP verification. Both are locked into the same room upon approval.
                        </p>
                      </div>
                      <div className="pt-3 text-[11px] font-bold text-indigo-600">
                        {allocationMode === 'friend' ? '✓ Selected Method' : 'Click to Select'}
                      </div>
                    </div>

                  </div>

                  {/* ================================================================= */}
                  {/* OPTION 1 CONTENT: RANDOM ALLOCATION EXPLAINER */}
                  {/* ================================================================= */}
                  {allocationMode === 'random' && (
                    <div className="p-6 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#f37021] text-white flex items-center justify-center shrink-0">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-[#0f1f38]">Random Room Allocation Mode Configured</h4>
                          <p className="text-xs text-slate-600 mt-1">
                            The allocation engine will automatically assign you the best available vacant bed in your eligible hostel wing ({student.gender} Residences) respecting your preferred occupancy ({preferredOccupancy}-Seater) and maximizing lifestyle compatibility.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                        <div className="bg-white p-3 rounded-xl border border-orange-100">
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Target Wing</div>
                          <div className="font-bold text-slate-900 mt-0.5">{student.gender} Hostels</div>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-orange-100">
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Target Occupancy</div>
                          <div className="font-bold text-slate-900 mt-0.5">{preferredOccupancy}-Seater Room</div>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-orange-100">
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Matching Metric</div>
                          <div className="font-bold text-emerald-600 mt-0.5">Lifestyle Harmony Score</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================================================================= */}
                  {/* OPTION 2 CONTENT: MANUAL ROOM SELECTION (FLOOR & VACANT ROOMS) */}
                  {/* ================================================================= */}
                  {allocationMode === 'manual' && (
                    <div className="space-y-6">
                      {/* 1. Hostels */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-2">
                          1. Select Hostel Tower ({allowedHostels.length} available for {student.gender})
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {allowedHostels.map((h) => {
                            const vacantInHostel = INITIAL_ROOMS.filter(r => r.hostelId === h.id).reduce((s, r) => s + r.availableBeds, 0);
                            const isSelected = currentHostel.id === h.id;
                            if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-5 h-5 rounded-full border-2 border-[#e88734] border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-700">Verifying session credentials...</span>
        </div>
      </div>
    );
  }

  return (
                              <button
                                key={h.id}
                                type="button"
                                onClick={() => {
                                  setSelectedHostelId(h.id);
                                  const firstFl = INITIAL_ROOMS.find(r => r.hostelId === h.id)?.floor || 1;
                                  setSelectedFloor(firstFl);
                                }}
                                className={`p-4 rounded-xl border text-left transition-all ${
                                  isSelected
                                    ? 'border-[#f37021] bg-orange-50/50 shadow-sm ring-1 ring-[#f37021]'
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-mono text-xs font-black bg-[#0f1f38] text-white px-2 py-0.5 rounded">
                                    {h.code}
                                  </span>
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    {vacantInHostel} Vacant Beds
                                  </span>
                                </div>
                                <div className="font-bold text-xs text-slate-900 mt-2 truncate">{h.name}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">{h.floors} Floors · Attached Mess</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. Floors */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-slate-700 block">
                            2. Select Floor in {currentHostel.code}
                          </label>
                          <span className="text-[11px] text-slate-500 font-semibold">
                            Floor {activeFloor} ({floorVacantBeds} Vacant Bed{floorVacantBeds !== 1 ? 's' : ''})
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {floors.map((fl) => {
                            const vacantOnFl = hostelRooms.filter(r => r.floor === fl).reduce((s, r) => s + r.availableBeds, 0);
                            const isFlActive = activeFloor === fl;
                            if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-5 h-5 rounded-full border-2 border-[#e88734] border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-700">Verifying session credentials...</span>
        </div>
      </div>
    );
  }

  return (
                              <button
                                key={fl}
                                type="button"
                                onClick={() => setSelectedFloor(fl)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                                  isFlActive
                                    ? 'bg-[#0f1f38] text-white shadow'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                <span>Floor {fl}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                  vacantOnFl > 0
                                    ? isFlActive ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-700'
                                }`}>
                                  {vacantOnFl > 0 ? `${vacantOnFl} Vacant` : 'Full'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3. Room Grid */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-2">
                          3. Select an Eligible Vacant Room on Floor {activeFloor}
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {floorRooms.map((room) => {
                            const isVacant = room.availableBeds > 0;
                            const isChosen = selectedRoom?.id === room.id;

                            if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-5 h-5 rounded-full border-2 border-[#e88734] border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-700">Verifying session credentials...</span>
        </div>
      </div>
    );
  }

  return (
                              <div
                                key={room.id}
                                className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                                  isChosen
                                    ? 'border-emerald-500 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500'
                                    : isVacant
                                    ? 'border-slate-200 bg-white hover:border-[#f37021] hover:shadow-md'
                                    : 'border-slate-200 bg-slate-100/70 opacity-75'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-black text-sm text-[#0f1f38]">
                                        Room {room.roomNumber}
                                      </span>
                                      <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                                        Fl {room.floor}
                                      </span>
                                    </div>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                      room.isAc ? 'bg-orange-100 text-[#f37021]' : 'bg-slate-200 text-slate-700'
                                    }`}>
                                      {room.isAc ? 'AC' : 'Non-AC'}
                                    </span>
                                  </div>

                                  <div className="text-xs text-slate-700 font-semibold mb-2">
                                    {room.seater}-Seater {room.isApartment ? 'Apartment' : 'Standard'}
                                  </div>

                                  <div className="space-y-1 text-[11px] text-slate-500 mb-3">
                                    <div className="flex justify-between">
                                      <span>Laundry &amp; Gym:</span>
                                      <span className="font-medium text-slate-800">
                                        {room.hasLaundry && room.hasGymAccess ? 'Both Available' : room.hasLaundry ? 'Laundry' : 'Standard'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Annual Fee:</span>
                                      <span className="font-bold text-slate-900">
                                        ₹{room.feePerYear.toLocaleString('en-IN')}/yr
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="border-t border-slate-100 pt-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Availability</span>
                                    {isVacant ? (
                                      <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        {room.availableBeds} of {room.totalBeds} Beds Vacant
                                      </span>
                                    ) : (
                                      <span className="text-[11px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-rose-200">
                                        <Ban className="w-3 h-3 text-rose-500" />
                                        Full (0 Vacant)
                                      </span>
                                    )}
                                  </div>

                                  {isVacant ? (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedRoom(room)}
                                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                                        isChosen
                                          ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                                          : 'bg-[#0f1f38] text-white hover:bg-[#1a3258]'
                                      }`}
                                    >
                                      {isChosen ? (
                                        <>
                                          <CheckCircle2 className="w-4 h-4" />
                                          <span>Room {room.roomNumber} Selected</span>
                                        </>
                                      ) : (
                                        <span>Select Room {room.roomNumber}</span>
                                      )}
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled
                                      className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-slate-200 text-slate-500 cursor-not-allowed"
                                    >
                                      Room Full / Occupied
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================================================================= */}
                  {/* OPTION 3 CONTENT: SELECT ROOM WITH A FRIEND (SOCKET.IO OTP DEMO) */}
                  {/* ================================================================= */}
                  {allocationMode === 'friend' && (
                    <div className="space-y-6">
                      <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="bg-indigo-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                              Real-Time Socket.IO OTP
                            </span>
                            <h4 className="font-black text-sm text-[#0f1f38]">
                              Friend-Based Room Allocation Workflow
                            </h4>
                          </div>

                          <Link
                            href="/portal/friend-demo"
                            target="_blank"
                            className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1"
                          >
                            <span>Open Dual-Screen Socket Demo Page</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          Enter your friend&apos;s Student ID. An instant OTP verification request will be delivered to their session in real-time. Once your friend confirms the OTP, you will both be locked into the same room allocation.
                        </p>

                        {/* Search friend */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                          <div className="sm:col-span-8">
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              Friend&apos;s Student ID / Registration Number
                            </label>
                            <input
                              type="text"
                              value={friendRegNoInput}
                              onChange={(e) => setFriendRegNoInput(e.target.value)}
                              placeholder="e.g. 12400003 (Rohan Mehra)"
                              className="w-full text-xs font-mono font-bold p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="sm:col-span-4 flex items-end">
                            <button
                              type="button"
                              onClick={handleSearchFriend}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 px-4 rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                            >
                              <Search className="w-4 h-4" />
                              <span>Validate Friend ID</span>
                            </button>
                          </div>
                        </div>

                        {friendError && (
                          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{friendError}</span>
                          </div>
                        )}

                        {/* Validated Friend Found */}
                        {friendSearchResult && (
                          <div className="p-4 bg-white rounded-xl border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-xs">{friendSearchResult.name}</span>
                                <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold">
                                  {friendSearchResult.regNo}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {friendSearchResult.program} · CGPA: {friendSearchResult.cgpa} · Fee Status: Cleared
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleSendFriendOtp}
                              className="bg-[#f37021] hover:bg-[#d65a0e] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
                            >
                              <KeyRound className="w-4 h-4" />
                              <span>Generate &amp; Deliver Demo OTP</span>
                            </button>
                          </div>
                        )}

                        {/* Status Message */}
                        {otpStatusMsg && (
                          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                            otpStatusMsg.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                            <span>{otpStatusMsg.text}</span>
                          </div>
                        )}

                        {/* Active Request Details & OTP verification box */}
                        {activeFriendReq && (
                          <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-700 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-orange-400">
                                Request ID: {activeFriendReq.requestId}
                              </span>
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                activeFriendReq.status === 'both_approved' ? 'bg-emerald-500 text-white' : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {activeFriendReq.status === 'both_approved' ? '✓ MUTUAL APPROVAL COMPLETE' : 'AWAITING FRIEND OTP'}
                              </span>
                            </div>

                            {activeFriendReq.status === 'both_approved' ? (
                              <p className="text-xs text-emerald-300">
                                ✓ Both students have verified mutual consent! The allocation engine will link you and <strong>{activeFriendReq.targetName}</strong> into adjacent beds in Room 204.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                <div className="text-xs text-slate-300 flex items-center justify-between">
                                  <span>Simulated Demo OTP for {activeFriendReq.targetName}:</span>
                                  <span className="font-mono font-black text-amber-300 text-base bg-white/10 px-2 py-0.5 rounded">
                                    {activeFriendReq.otp}
                                  </span>
                                </div>

                                <div className="flex gap-2 pt-1">
                                  <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="Enter 6-digit OTP to confirm"
                                    value={otpVerifyInput}
                                    onChange={(e) => setOtpVerifyInput(e.target.value)}
                                    className="flex-1 text-xs font-mono p-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleVerifyOtp}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg"
                                  >
                                    Verify OTP
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ACTIVE PREFERENCE CONFIRMATION */}
                  <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Active Allocation Method &amp; Preference
                      </div>
                      <div className="font-black text-sm text-[#0f1f38] mt-0.5">
                        {allocationMode === 'random' ? (
                          <span className="text-amber-700 flex items-center gap-1.5">
                            <Dices className="w-4 h-4" />
                            Option 1: Random Allocation (Optimized by Lifestyle Score)
                          </span>
                        ) : allocationMode === 'manual' ? (
                          <span className="text-emerald-700 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Option 2: Manual Selection · {selectedRoom ? `Room ${selectedRoom.roomNumber} (${selectedRoom.hostelName})` : 'Select a room above'}
                          </span>
                        ) : (
                          <span className="text-indigo-700 flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-indigo-600" />
                            Option 3: Room With Friend ({activeFriendReq?.targetName || 'Friend Pair'})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* NAVIGATION */}
                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setActiveStep(1)}
                      className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-xs font-bold"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to Step 1
                    </button>
                    <button
                      onClick={handleSaveStep2}
                      className="flex items-center gap-2 bg-[#f37021] hover:bg-[#d65a0e] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-orange-500/20"
                    >
                      <span>Continue to Lifestyle Matching (8 Dimensions)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* ========================================================================= */}
            {/* STEP 3: LIFESTYLE MATCHING SYSTEM (8 DETAILED DIMENSIONS) */}
            {/* ========================================================================= */}
            {activeStep === 3 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-100 text-purple-700 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                      Multi-Dimensional Compatibility
                    </span>
                    <h2 className="text-xl font-black text-[#0f1f38]">
                      Step 3: Lifestyle Survey (8 Categories)
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Integrated directly with the Random Allocation Engine to pair students with compatible routines and avoid conflicts.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  
                  {/* 1. Sleep Schedule */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">1. Sleep Schedule</label>
                    <select
                      value={lifestyle.sleepSchedule}
                      onChange={(e) => setLifestyle({ ...lifestyle, sleepSchedule: e.target.value as any })}
                      className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:border-[#f37021]"
                    >
                      <option value="early_bird">Early Bird (Sleeps before 10:30 PM)</option>
                      <option value="night_owl">Night Owl (Sleeps after 1:00 AM)</option>
                      <option value="flexible">Flexible Sleep Schedule</option>
                    </select>
                  </div>

                  {/* 2. Music Preferences */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">2. Music Preferences</label>
                    <select
                      value={lifestyle.musicPreference}
                      onChange={(e) => setLifestyle({ ...lifestyle, musicPreference: e.target.value as any })}
                      className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:border-[#f37021]"
                    >
                      <option value="music_lover">Music Lover (Enjoys music frequently)</option>
                      <option value="prefer_silence">Prefer Silence (No room audio)</option>
                      <option value="soft_music">Soft / Ambient Music Only</option>
                      <option value="loud_music">Loud Music (Gaming &amp; Bass OK)</option>
                    </select>
                  </div>

                  {/* 3. Cleanliness */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">3. Cleanliness</label>
                    <select
                      value={lifestyle.cleanliness}
                      onChange={(e) => setLifestyle({ ...lifestyle, cleanliness: e.target.value as any })}
                      className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:border-[#f37021]"
                    >
                      <option value="very_clean">Very Clean (Daily neat bed &amp; desk)</option>
                      <option value="moderately_clean">Moderately Clean (Weekly tidy-up)</option>
                      <option value="flexible">Flexible / Casual</option>
                    </select>
                  </div>

                  {/* 4. Social Behaviour */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">4. Social Behaviour</label>
                    <select
                      value={lifestyle.socialBehaviour}
                      onChange={(e) => setLifestyle({ ...lifestyle, socialBehaviour: e.target.value as any })}
                      className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:border-[#f37021]"
                    >
                      <option value="introvert">Introvert (Quiet personal space)</option>
                      <option value="extrovert">Extrovert (Enjoys visitors &amp; interaction)</option>
                      <option value="ambivert">Ambivert (Balanced)</option>
                    </select>
                  </div>

                  {/* 5. Study Habits */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">5. Study Habits</label>
                    <select
                      value={lifestyle.studyHabits}
                      onChange={(e) => setLifestyle({ ...lifestyle, studyHabits: e.target.value as any })}
                      className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:border-[#f37021]"
                    >
                      <option value="silent">Silent Study Environment Preferred</option>
                      <option value="group_study">Group Study / Discussions Friendly</option>
                      <option value="flexible">Flexible Study Routine</option>
                    </select>
                  </div>

                  {/* 6. Daily Routine */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">6. Daily Routine</label>
                    <select
                      value={lifestyle.dailyRoutine}
                      onChange={(e) => setLifestyle({ ...lifestyle, dailyRoutine: e.target.value as any })}
                      className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:border-[#f37021]"
                    >
                      <option value="early_morning">Early Morning Routine (Gym/Run by 6 AM)</option>
                      <option value="late_night">Late Night Routine (Projects until 2 AM)</option>
                      <option value="flexible">Flexible Routine</option>
                    </select>
                  </div>

                  {/* 7. Food Habits */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">7. Food Habits</label>
                    <select
                      value={lifestyle.foodHabits}
                      onChange={(e) => setLifestyle({ ...lifestyle, foodHabits: e.target.value as any })}
                      className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:border-[#f37021]"
                    >
                      <option value="vegetarian">Vegetarian</option>
                      <option value="non_vegetarian">Non-Vegetarian</option>
                      <option value="eggetarian">Eggetarian</option>
                      <option value="no_preference">No Specific Preference</option>
                    </select>
                  </div>

                  {/* 8. Cultural & Personal Preferences */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">8. Cultural &amp; Language Preference</label>
                    <input
                      type="text"
                      value={lifestyle.culturalPersonal?.languagePreferences || ''}
                      onChange={(e) => setLifestyle({
                        ...lifestyle,
                        culturalPersonal: {
                          ...lifestyle.culturalPersonal,
                          languagePreferences: e.target.value
                        }
                      })}
                      placeholder="e.g. English, Hindi, Punjabi"
                      className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium text-slate-800 focus:outline-none focus:border-[#f37021]"
                    />
                  </div>

                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-xs font-bold"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Room Preferences
                  </button>
                  <button
                    onClick={handleSaveStep3}
                    className="flex items-center gap-2 bg-[#f37021] hover:bg-[#d65a0e] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-orange-500/20"
                  >
                    <span>Submit Application &amp; View Allotment Slip</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 4: PROFESSIONAL ALLOCATION SLIP & CLEAN PDF DOWNLOAD (WITH FAKE PAYMENT) */}
            {/* ========================================================================= */}
            {activeStep === 4 && (
              <div className="space-y-6">
                
                {/* 1. FEE PAYMENT STATUS BANNER */}
                {paymentStatus === 'pending' ? (
                  <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-amber-300 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded">
                            Action Required
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm">
                            Hostel Fee Clearance Pending (Provisional Allotment)
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                          Your bed in <strong className="text-slate-800">Room {allocation?.roomNumber || '204'} ({allocation ? allocation.hostelName : student.currentHostel})</strong> is provisionally held. Complete the fee clearance of <strong className="text-[#0f1f38] font-bold">₹{totalHostelFee.toLocaleString('en-IN')}</strong> to finalize your official university registration and unlock the downloadable PDF allotment slip.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(true)}
                      className="bg-gradient-to-r from-[#e88734] to-[#f37021] hover:from-[#d97726] hover:to-[#e05e10] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md shadow-orange-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 animate-pulse"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pay Hostel Fee (₹{totalHostelFee.toLocaleString('en-IN')})</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded">
                            Fee Cleared
                          </span>
                          <h3 className="font-bold text-emerald-950 text-sm">
                            Payment Verified &amp; Official Allotment Slip Finalized!
                          </h3>
                        </div>
                        <p className="text-xs text-emerald-800 mt-1">
                          Transaction ID: <span className="font-mono font-bold text-emerald-900">{transactionId}</span> · Paid on {paidTimestamp} · Receipt No: <span className="font-mono font-bold">RCP-2026-BH4-0982</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleResetPayment}
                        title="Reset for Demo Presentation"
                        className="text-[11px] text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white transition-all flex items-center gap-1 font-semibold"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Re-test Demo Payment</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. OFFICIAL ALLOCATION SLIP CARD */}
                <div id="allocation-slip-container" className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden relative print:border-none print:shadow-none">
                  
                  {/* Slip Header with University Crest & Branding */}
                  <div className="bg-[#0f1f38] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-[#e88734]">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#e88734] flex items-center justify-center font-black text-white text-lg shadow-md shrink-0">
                        LPU
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                          Lovely Professional University · Residential Services
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                          HOSTEL ALLOTMENT SLIP (OFFICIAL)
                        </h2>
                        <p className="text-xs text-slate-300">
                          Academic Session 2026-27 · Jalandhar - Delhi G.T. Road, Phagwara, Punjab
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0">
                      <span className="text-[10px] font-mono font-bold bg-white/10 px-2.5 py-1 rounded text-orange-300">
                        SLIP NO: LPU-RES-2026-901
                      </span>
                      <span className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded ${
                        paymentStatus === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-400/40 animate-pulse'
                      }`}>
                        Status: {paymentStatus === 'paid' ? 'Confirmed & Fully Paid' : 'Provisional (Fee Pending)'}
                      </span>
                    </div>
                  </div>

                  {/* Watermark in background */}
                  <div className="p-6 sm:p-8 space-y-6 relative">
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none select-none text-8xl font-black text-slate-900 text-center uppercase leading-none">
                      {paymentStatus === 'paid' ? 'LPU ALLOTTED\n& PAID' : 'PROVISIONAL\nUNPAID'}
                    </div>

                    {/* Student & Allotment Particulars */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#fbfaf8] border border-slate-200">
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Student Name</div>
                        <div className="text-base font-black text-[#0f1f38]">{student.name}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Registration ID</div>
                        <div className="text-base font-mono font-black text-[#0f1f38]">{student.regNo}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Programme / Section</div>
                        <div className="text-xs font-bold text-slate-800">{student.program.slice(0, 24)}...</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Gender / Batch</div>
                        <div className="text-xs font-bold text-slate-800">{student.gender} · Batch {student.batch}</div>
                      </div>
                    </div>

                    {/* Allocated Room & Bed Slot Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-orange-50/60 border border-orange-200">
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Hostel Complex</div>
                        <div className="text-base font-black text-[#0f1f38]">
                          {allocation ? allocation.hostelName : student.currentHostel}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Room &amp; Floor</div>
                        <div className="text-base font-black text-[#0f1f38]">
                          Room {allocation?.roomNumber || '204'} (Floor {allocation?.floor || 2})
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Bed Slot Code</div>
                        <div className="text-base font-mono font-black text-[#e88734]">
                          {allocation?.bedCode || 'BH4-204-B1'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Room Category</div>
                        <div className="text-xs font-bold text-slate-800">
                          {preferredOccupancy}-Seater {apartmentPreference === 'with_apartment' ? 'Apartment' : 'Standard'} (AC)
                        </div>
                      </div>
                    </div>

                    {/* Assigned Roommate & Compatibility */}
                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#e88734]" />
                          <h4 className="text-xs font-bold text-[#0f1f38] uppercase tracking-wider">
                            Assigned Roommate Particulars
                          </h4>
                        </div>
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          94% Lifestyle Harmony Match
                        </span>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">Rohan Mehra</div>
                          <div className="text-xs text-slate-500 font-mono">Reg ID: 12400003 · B.Tech Computer Science</div>
                        </div>
                        <div className="text-right text-xs">
                          <span className="font-semibold text-slate-700">Bed Slot: BH4-204-B2</span>
                        </div>
                      </div>
                    </div>

                    {/* OFFICIAL FEE RECEIPT RECORD (UPDATED DYNAMICALLY AFTER PAYMENT) */}
                    <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-[#e88734]" />
                          <h4 className="text-xs font-bold text-[#0f1f38] uppercase tracking-wider">
                            Official Accounts &amp; Fee Clearance Record
                          </h4>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          paymentStatus === 'paid' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {paymentStatus === 'paid' ? 'Fee Cleared (Verified)' : 'Fee Due'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Annual Fee</span>
                          <span className="font-bold text-slate-900 text-sm">₹{totalHostelFee.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Payment Mode</span>
                          <span className="font-medium text-slate-700">
                            {paymentStatus === 'paid' ? 'Online Gateway (UPI/NetBanking)' : 'Pending Clearance'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Transaction Ref</span>
                          <span className="font-mono font-bold text-slate-800">
                            {paymentStatus === 'paid' ? transactionId : 'UNPAID-PROVISIONAL'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Receipt Number</span>
                          <span className="font-mono font-bold text-slate-800">
                            {paymentStatus === 'paid' ? 'RCP-2026-BH4-0982' : 'Pending Receipt'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Official Signatures & Barcode */}
                    <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono text-slate-400">Security Verification:</div>
                        <div className="font-mono text-xs font-bold tracking-widest text-slate-700 bg-slate-100 p-2 rounded inline-block">
                          {paymentStatus === 'paid' ? '*LPU-RES-PAID-VERIFIED*' : '*LPU-RES-PROVISIONAL*'}
                        </div>
                      </div>

                      <div className="text-center text-[10px] text-slate-500 space-y-1">
                        <div>Issued on: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div>Valid for Semester Academic Term 2026-27</div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="font-serif italic font-bold text-sm text-[#0f1f38]">Prof. R. K. Singhal</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Chief Warden (Boys Hostels)</div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 3. PDF ACTION BUTTONS (GATED BEHIND PAYMENT) */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-xs text-slate-600">
                    {paymentStatus === 'paid' ? (
                      <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Allotment verified and fee cleared. Download is unlocked.</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
                        <Lock className="w-4 h-4 text-amber-500" />
                        <span>Download PDF is locked until hostel fee is cleared.</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {paymentStatus === 'paid' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="flex items-center justify-center gap-2 bg-[#0f1f38] hover:bg-[#1a3258] text-white text-xs font-bold px-5 py-3 rounded-xl shadow transition-all"
                        >
                          <Printer className="w-4 h-4 text-[#e88734]" />
                          <span>Print Slip</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="flex items-center justify-center gap-2 bg-[#e88734] hover:bg-[#d97726] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg transition-all"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Final Official PDF Slip</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled
                          className="flex items-center justify-center gap-2 bg-slate-200 text-slate-400 text-xs font-bold px-5 py-3 rounded-xl cursor-not-allowed"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Download Locked</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowPaymentModal(true)}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#e88734] hover:bg-[#d97726] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition-all animate-bounce"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Pay ₹{totalHostelFee.toLocaleString('en-IN')} to Unlock Slip</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 4. FAKE UNIVERSITY PAYMENT GATEWAY MODAL */}
                {showPaymentModal && (
                  <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      
                      {/* Modal Header */}
                      <div className="bg-[#0f1f38] text-white p-5 flex items-center justify-between border-b-2 border-[#e88734]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#e88734] text-white font-black text-xs flex items-center justify-center shadow">
                            LPU
                          </div>
                          <div>
                            <div className="text-[10px] text-orange-400 font-black uppercase tracking-wider">
                              University Payment Gateway Desk
                            </div>
                            <div className="font-bold text-sm">Hostel Accommodation Fee Collection</div>
                          </div>
                        </div>

                        <button
                          onClick={() => setShowPaymentModal(false)}
                          disabled={paymentStatus === 'processing'}
                          className="text-slate-400 hover:text-white p-1 rounded-lg text-xs"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="p-6 space-y-5">
                        
                        {/* Student and Room Bill Summary */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-slate-800">{student.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Reg: {student.regNo} · Room 204 (BH-4)
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Payable</div>
                            <div className="text-lg font-black text-[#0f1f38]">
                              ₹{totalHostelFee.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        {/* Breakdown */}
                        <div className="space-y-1.5 text-xs border-b border-slate-100 pb-3">
                          <div className="flex justify-between text-slate-600">
                            <span>{preferredOccupancy}-Seater Standard/Apartment Room Fee:</span>
                            <span className="font-semibold text-slate-800">₹{baseFee.toLocaleString('en-IN')}</span>
                          </div>
                          {apartmentFee > 0 && (
                            <div className="flex justify-between text-slate-600">
                              <span>Apartment Suite Surcharge:</span>
                              <span className="font-semibold text-slate-800">₹{apartmentFee.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-slate-600">
                            <span>Hostel Security Deposit (Refundable):</span>
                            <span className="font-semibold text-slate-800">₹{securityDeposit.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Payment Mode Selector Tabs */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-2">
                            Select Payment Method (Simulation)
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setPaymentMode('upi')}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                                paymentMode === 'upi'
                                  ? 'border-[#e88734] bg-orange-50 text-[#e88734]'
                                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <QrCode className="w-4 h-4" />
                              <span>UPI / QR</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPaymentMode('card')}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                                paymentMode === 'card'
                                  ? 'border-[#e88734] bg-orange-50 text-[#e88734]'
                                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <CreditCard className="w-4 h-4" />
                              <span>Card</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPaymentMode('netbanking')}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                                paymentMode === 'netbanking'
                                  ? 'border-[#e88734] bg-orange-50 text-[#e88734]'
                                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <Building2 className="w-4 h-4" />
                              <span>Net Banking</span>
                            </button>
                          </div>
                        </div>

                        {/* Tab Content */}
                        {paymentMode === 'upi' && (
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
                            <div className="w-24 h-24 bg-white p-2 border border-slate-300 rounded-xl flex items-center justify-center shrink-0">
                              <QrCode className="w-20 h-20 text-slate-800" />
                            </div>
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Instant Verification
                              </span>
                              <div className="text-xs font-bold text-slate-800">Scan via GPay, PhonePe or Paytm</div>
                              <div className="text-[11px] text-slate-500">UPI ID: lpu.hostels@icici</div>
                            </div>
                          </div>
                        )}

                        {paymentMode === 'card' && (
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Demo Card Number</label>
                              <input 
                                type="text" 
                                readOnly 
                                value="4242 •••• •••• 4242" 
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-700" 
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Expiry</label>
                                <input type="text" readOnly value="08 / 28" className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-700" />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">CVV</label>
                                <input type="text" readOnly value="•••" className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-700" />
                              </div>
                            </div>
                          </div>
                        )}

                        {paymentMode === 'netbanking' && (
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block">Selected Bank</label>
                            <select className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800">
                              <option>HDFC Bank - University Partner Bank</option>
                              <option>State Bank of India (SBI)</option>
                              <option>ICICI Bank</option>
                              <option>Punjab National Bank (PNB)</option>
                            </select>
                          </div>
                        )}

                        {/* Pay Button */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleSimulatePayment}
                            disabled={paymentStatus === 'processing'}
                            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            {paymentStatus === 'processing' ? (
                              <>
                                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                <span>Authorizing with Bank Gateway...</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-4 h-4" />
                                <span>Simulate Payment of ₹{totalHostelFee.toLocaleString('en-IN')}</span>
                              </>
                            )}
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ========================================================================= */}

            {/* ========================================================================= */}
            {/* STEP 5: ROOM CHANGE REQUEST SERVICE */}
            {/* ========================================================================= */}
            {activeStep === 5 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-black text-[#0f1f38]">Step 5: Post-Allocation Room Change Request</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Submit formal requests for room adjustments based on medical conditions, academic routines, or fee tiers.
                  </p>
                </div>

                {rcSubmitted && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Your room change request has been submitted to the Chief Warden desk for review.</span>
                  </div>
                )}

                <form onSubmit={handleSubmitRoomChange} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Reason Category</label>
                      <select
                        value={rcCategory}
                        onChange={(e) => setRcCategory(e.target.value as any)}
                        className="w-full text-xs p-2.5 border rounded-lg bg-white"
                      >
                        <option value="health_medical">Medical Condition / Mobility Difficulty</option>
                        <option value="study_routine">Academic Study Routine Adjustment</option>
                        <option value="roommate_conflict">Roommate Routine Incompatibility</option>
                        <option value="fee_bracket">Fee Bracket / Budget Adjustment</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Current Assigned Room</label>
                      <input
                        type="text"
                        readOnly
                        value={allocation ? `${allocation.roomNumber} (${allocation.hostelName})` : student.currentHostel}
                        className="w-full text-xs p-2.5 border rounded-lg bg-slate-100 text-slate-600 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Detailed Explanation &amp; Target Block</label>
                    <textarea
                      value={rcDescription}
                      onChange={(e) => setRcDescription(e.target.value)}
                      placeholder="Specify why you are requesting a change and any preferred block/floor..."
                      rows={3}
                      className="w-full text-xs p-3 border rounded-lg bg-white"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-[#f37021] hover:bg-[#d65a0e] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit to Chief Warden</span>
                  </button>
                </form>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h3 className="text-sm font-bold text-[#0f1f38]">Your Request History</h3>
                  {roomChanges.map((rc) => (
                    <div key={rc.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 uppercase">
                          {rc.reasonCategory.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          rc.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {rc.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{rc.description}</p>
                      <div className="text-[10px] text-slate-400">Date: {rc.createdAt}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
