'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuthSession } from '@/lib/authStore';
import { 
  ShieldCheck, 
  Building2, 
  Bed, 
  Users, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  X, 
  RotateCw, 
  Send, 
  Download, 
  FileCheck, 
  BarChart3, 
  Sliders, 
  Filter,
  Layers,
  ChevronRight,
  Sparkles,
  Plus,
  ArrowUpRight,
  Ban
} from 'lucide-react';
import { 
  INITIAL_HOSTELS, 
  INITIAL_ROOMS, 
  INITIAL_ALLOCATIONS, 
  INITIAL_ROOM_CHANGES 
} from '@/lib/mockData';
import { REGISTERED_STUDENTS } from '@/lib/studentsData';
import { 
  Hostel, 
  Room, 
  StudentApplication, 
  AllocationResult, 
  RoomChangeRequest,
  RoomOccupancy,
  ApartmentPreference
} from '@/lib/types';
import { runAllocationEngine, AllocationRunSummary } from '@/lib/allocationEngine';

// Build initial 101 registered student applications
const INITIAL_DEMO_APPS: StudentApplication[] = REGISTERED_STUDENTS.map((std) => ({
  id: `app-${std.regNo}`,
  studentId: std.id,
  studentName: std.name,
  regNo: std.regNo,
  email: std.email,
  phone: std.phone,
  gender: std.gender,
  program: std.program,
  year: Math.max(1, 2026 - std.batch),
  cgpa: std.cgpa,
  feeCleared: std.feeCleared,
  medicalAccessibilityNeeded: std.medicalAccessibilityNeeded,
  accessibilityRemarks: std.accessibilityRemarks,
  status: std.feeCleared ? 'verified' : 'submitted',
  submittedAt: '2026-11-12 10:00 AM',
  preferredOccupancy: std.preferredOccupancy || 2,
  apartmentPreference: std.apartmentPreference || 'with_apartment',
  preferredFacilities: std.preferredFacilities || ['laundry', 'gym', 'wifi'],
  allocationMode: std.allocationMode || 'manual',
  preferences: std.preferences || [
    { rank: 1, seater: std.preferredOccupancy || 2, isAc: true, hostelId: std.gender === 'Male' ? 'bh-4' : 'gh-1' }
  ],
  lifestyle: std.lifestyle
}));

export default function AdminPortal() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<'engine' | 'warden' | 'applications' | 'inventory' | 'services'>('engine');

  useEffect(() => {
    const session = getAuthSession();
    if (!session.isLoggedIn || session.role !== 'admin') {
      router.replace('/login?role=admin&redirect=/portal/admin');
      return;
    }
    setAuthChecked(true);
  }, [router]);

  // Working state
  const [hostels, setHostels] = useState<Hostel[]>(INITIAL_HOSTELS);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [applications, setApplications] = useState<StudentApplication[]>(INITIAL_DEMO_APPS);
  const [allocations, setAllocations] = useState<AllocationResult[]>(INITIAL_ALLOCATIONS);
  const [roomChanges, setRoomChanges] = useState<RoomChangeRequest[]>(INITIAL_ROOM_CHANGES);
  
  // Engine execution state
  const [runSummary, setRunSummary] = useState<AllocationRunSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [published, setPublished] = useState(true);
  const [allocationFilter, setAllocationFilter] = useState<'all' | 'random' | 'manual' | 'friend'>('all');

  // Warden override modal state
  const [overrideModal, setOverrideModal] = useState<AllocationResult | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('');

  // Add Room Modal State
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomHostel, setNewRoomHostel] = useState('bh-4');
  const [newRoomNumberInput, setNewRoomNumberInput] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState(1);
  const [newRoomSeater, setNewRoomSeater] = useState<RoomOccupancy>(2);
  const [newRoomIsAc, setNewRoomIsAc] = useState(true);
  const [newRoomIsApartment, setNewRoomIsApartment] = useState(true);
  const [newRoomHasLaundry, setNewRoomHasLaundry] = useState(true);
  const [newRoomHasGym, setNewRoomHasGym] = useState(true);
  const [newRoomFee, setNewRoomFee] = useState(115000);

  // 1. Run Allocation Engine
  const handleRunEngine = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const summary = runAllocationEngine(applications, hostels, rooms);
      setRunSummary(summary);
      setAllocations(summary.allocations);
      setPublished(false);
      setIsProcessing(false);
    }, 700);
  };

  // 2. Warden Approve Draft
  const handleWardenApproveAll = () => {
    const updated = allocations.map(a => ({
      ...a,
      wardenApproved: true,
      isDraft: false
    }));
    setAllocations(updated);
  };

  // 3. Warden Manual Override
  const handleSaveOverride = () => {
    if (!overrideModal || !overrideReason) {
      alert('Mandatory override reason is required by University Audit Policy.');
      return;
    }
    const updated = allocations.map(a => {
      if (a.id === overrideModal.id) {
        return {
          ...a,
          roomNumber: newRoomNumber || a.roomNumber,
          wardenOverrideReason: overrideReason,
          wardenApproved: true,
          matchExplanation: `Warden Override Applied: ${overrideReason}`
        };
      }
      return a;
    });
    setAllocations(updated);
    setOverrideModal(null);
    setOverrideReason('');
  };

  // 4. Authorized Publication
  const handlePublishAllocations = () => {
    const updated = allocations.map(a => ({
      ...a,
      isPublished: true,
      isDraft: false,
      wardenApproved: true
    }));
    setAllocations(updated);
    setPublished(true);
    alert('Authorized Allocations Published! Instant notifications sent to students.');
  };

  // 5. Application verification handler
  const handleVerifyApplication = (appId: string, verified: boolean) => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          status: verified ? 'verified' : 'rejected',
          rejectionReason: verified ? undefined : 'Documentation incomplete / fee pending'
        };
      }
      return app;
    }));
  };

  // 6. Room change decision handler
  const handleRoomChangeDecision = (rcId: string, status: 'approved' | 'rejected') => {
    setRoomChanges(prev => prev.map(rc => {
      if (rc.id === rcId) {
        return {
          ...rc,
          status,
          wardenRemarks: status === 'approved' 
            ? 'Approved: Bed reassigned to requested block & updated in master occupancy records.' 
            : 'Declined due to zero vacancy in requested block.'
        };
      }
      return rc;
    }));
  };

  // 7. Add New Room handler
  const handleAddNewRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumberInput) return;
    const hostelObj = hostels.find(h => h.id === newRoomHostel);
    const newR: Room = {
      id: `r-${newRoomHostel}-${newRoomNumberInput}`,
      hostelId: newRoomHostel,
      hostelName: hostelObj ? hostelObj.name : 'Hostel Tower',
      roomNumber: newRoomNumberInput,
      floor: Number(newRoomFloor),
      seater: newRoomSeater,
      isAc: newRoomIsAc,
      hasAttachedWashroom: true,
      isAccessible: Number(newRoomFloor) === 1,
      isApartment: newRoomIsApartment,
      hasLaundry: newRoomHasLaundry,
      hasGymAccess: newRoomHasGym,
      feePerYear: Number(newRoomFee),
      totalBeds: newRoomSeater,
      availableBeds: newRoomSeater
    };
    setRooms([newR, ...rooms]);
    setShowAddRoomModal(false);
    setNewRoomNumberInput('');
  };

  const totalBeds = hostels.reduce((sum, h) => sum + h.totalBeds, 0);
  const allocatedBeds = hostels.reduce((sum, h) => sum + h.allocatedBeds, 0);
  const totalOccupancy = Math.round((allocatedBeds / totalBeds) * 100);

  const filteredAllocations = allocations.filter(a => {
    if (allocationFilter === 'all') return true;
    return a.allocationMode === allocationFilter;
  });

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-5 h-5 rounded-full border-2 border-[#0f1f38] border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-700">Verifying Chief Warden Credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="bg-[#0f1f38] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-[#f37021]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#f37021] flex items-center justify-center text-white shadow-md shadow-orange-500/30 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black">Chief Warden &amp; Admin Management Portal</h1>
                <span className="text-xs bg-white/20 text-orange-200 font-bold px-2.5 py-0.5 rounded-full">
                  Academic Year 2026-27
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Centralized Allocation Engine · Multi-Constraint Solver · Inventory Control · Audit Records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/portal/friend-demo"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Real-Time Friend OTP Demo</span>
            </Link>
            <div className="bg-white/10 px-4 py-2 rounded-xl text-center border border-white/10">
              <div className="text-[10px] text-slate-300 font-bold uppercase">Campus Occupancy</div>
              <div className="text-lg font-black text-[#f37021]">{totalOccupancy}% ({allocatedBeds}/{totalBeds})</div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          {[
            { id: 'engine', label: 'Central Allocation Engine', icon: Zap },
            { id: 'warden', label: 'Warden Review & Overrides', icon: ShieldCheck },
            { id: 'applications', label: 'Student Applications & Eligibility', icon: Users },
            { id: 'inventory', label: 'Hostel Inventory & Rooms', icon: Building2 },
            { id: 'services', label: 'Room Changes & Waiting List', icon: Sliders }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#0f1f38] text-white shadow'
                    : 'text-slate-600 hover:text-black hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#f37021]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: ALLOCATION ENGINE & CONFLICT PREVENTION */}
        {/* ========================================================================= */}
        {activeTab === 'engine' && (
          <div className="space-y-6">
            {/* Control Bar */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase bg-orange-100 text-[#f37021] px-2.5 py-0.5 rounded">
                    Workflow Core
                  </span>
                  <h2 className="text-xl font-black text-[#0f1f38]">Automated Multi-Constraint Allocation Engine</h2>
                </div>
                <p className="text-xs text-slate-500 max-w-xl">
                  Executes the complete workflow rules: Gender segregation, 1/2/3-seater occupancy matching, apartment preference, laundry/gym availability, manual room booking, mutual friend pairing, and 8-dimension lifestyle harmony scores.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRunEngine}
                  disabled={isProcessing}
                  className="flex items-center gap-2 bg-[#f37021] hover:bg-[#d65a0e] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md shadow-orange-500/20 disabled:opacity-50 hover:scale-105 transition-all"
                >
                  <Zap className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>{isProcessing ? 'Processing Algorithm...' : 'Run Allocation Engine'}</span>
                </button>
              </div>
            </div>

            {/* Run Stats */}
            {runSummary && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold uppercase">Processed Applications</div>
                  <div className="text-2xl font-black text-[#0f1f38] mt-1">{runSummary.totalProcessed}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold uppercase">Allocated Bed Slots</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{runSummary.allocatedCount}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold uppercase">Friend Pairs Linked</div>
                  <div className="text-2xl font-black text-indigo-600 mt-1">{runSummary.friendPairsAllocated} Pairs</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold uppercase">Placed on Waitlist</div>
                  <div className="text-2xl font-black text-amber-600 mt-1">{runSummary.waitlistedCount}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold uppercase">Satisfaction Rate</div>
                  <div className="text-2xl font-black text-[#f37021] mt-1">{runSummary.satisfactionRate}%</div>
                </div>
              </div>
            )}

            {/* Current Allocations Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[#0f1f38]">
                    Master Allocation Records ({filteredAllocations.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Conflict Prevention Active: Zero overbooking &amp; strictly 1 bed slot per student.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mode Filters */}
                  <div className="bg-slate-100 p-1 rounded-xl flex text-[11px] font-bold">
                    <button
                      onClick={() => setAllocationFilter('all')}
                      className={`px-2.5 py-1 rounded-lg ${allocationFilter === 'all' ? 'bg-[#0f1f38] text-white' : 'text-slate-600'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setAllocationFilter('friend')}
                      className={`px-2.5 py-1 rounded-lg ${allocationFilter === 'friend' ? 'bg-[#0f1f38] text-white' : 'text-slate-600'}`}
                    >
                      Friend Pairs
                    </button>
                    <button
                      onClick={() => setAllocationFilter('manual')}
                      className={`px-2.5 py-1 rounded-lg ${allocationFilter === 'manual' ? 'bg-[#0f1f38] text-white' : 'text-slate-600'}`}
                    >
                      Manual
                    </button>
                    <button
                      onClick={() => setAllocationFilter('random')}
                      className={`px-2.5 py-1 rounded-lg ${allocationFilter === 'random' ? 'bg-[#0f1f38] text-white' : 'text-slate-600'}`}
                    >
                      Random
                    </button>
                  </div>

                  {!published ? (
                    <button
                      onClick={handlePublishAllocations}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Authorize &amp; Publish</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Published
                    </span>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Student &amp; Reg No</th>
                      <th className="py-3 px-4">Hostel &amp; Room</th>
                      <th className="py-3 px-4">Bed Code</th>
                      <th className="py-3 px-4">Occupancy &amp; Apt</th>
                      <th className="py-3 px-4">Allocation Mode</th>
                      <th className="py-3 px-4">Roommate &amp; Compatibility</th>
                      <th className="py-3 px-4">Match Explanation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAllocations.map((alloc) => (
                      <tr key={alloc.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div>{alloc.studentName}</div>
                          <div className="text-[11px] font-normal text-slate-500 font-mono">Reg: {alloc.regNo}</div>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#0f1f38]">
                          {alloc.hostelName} <br />
                          <span className="text-[11px] text-slate-500">Room {alloc.roomNumber} (Fl {alloc.floor})</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#f37021]">
                          {alloc.bedCode}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-800">
                            {alloc.seater}-Seater {alloc.isApartment ? 'Apartment' : 'Standard'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                            alloc.allocationMode === 'friend'
                              ? 'bg-indigo-100 text-indigo-800'
                              : alloc.allocationMode === 'manual'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-orange-100 text-[#f37021]'
                          }`}>
                            {alloc.allocationMode}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {alloc.assignedRoommates.length > 0 ? (
                            <div>
                              <div className="font-bold text-slate-800">{alloc.assignedRoommates[0].name}</div>
                              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                {alloc.matchScore}% Match
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">Single Bed</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={alloc.matchExplanation}>
                          {alloc.matchExplanation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: WARDEN REVIEW & OVERRIDES */}
        {/* ========================================================================= */}
        {activeTab === 'warden' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-black text-[#0f1f38]">Chief Warden Review &amp; Discretionary Overrides</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Review bed assignments, verify mutual friend pairings, and reassign with mandatory documented audit reasons.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleWardenApproveAll}
                    className="bg-[#0f1f38] hover:bg-[#1a3258] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#f37021]" />
                    <span>Authorize All Draft Allocations</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {allocations.map((alloc) => (
                  <div key={alloc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{alloc.studentName}</span>
                        <span className="text-xs text-slate-500 font-mono">({alloc.regNo})</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          alloc.wardenApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {alloc.wardenApproved ? 'Warden Approved' : 'Awaiting Approval'}
                        </span>
                        {alloc.friendLinkedRegNo && (
                          <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                            Linked Friend: {alloc.friendLinkedRegNo}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600">
                        Assigned: <strong>{alloc.hostelName}</strong> · Room <strong>{alloc.roomNumber}</strong> · Bed <strong>{alloc.bedCode}</strong> ({alloc.seater}-Seater)
                      </div>
                      {alloc.wardenOverrideReason && (
                        <div className="text-xs text-orange-700 bg-orange-100/50 p-2 rounded border border-orange-200 font-medium">
                          Override Note: {alloc.wardenOverrideReason}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setOverrideModal(alloc);
                        setNewRoomNumber(alloc.roomNumber);
                      }}
                      className="bg-white border border-slate-300 hover:border-[#f37021] text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm shrink-0"
                    >
                      Override / Reassign
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Override Modal */}
            {overrideModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-black text-[#0f1f38] text-base">Warden Discretionary Bed Override</h3>
                    <button onClick={() => setOverrideModal(null)} className="text-slate-400 hover:text-black">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-600">
                    Reassigning bed for: <strong>{overrideModal.studentName}</strong> (Reg: {overrideModal.regNo})
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">New Room Number</label>
                    <input
                      type="text"
                      value={newRoomNumber}
                      onChange={(e) => setNewRoomNumber(e.target.value)}
                      placeholder="e.g. 205"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#f37021]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Mandatory Override Reason (Required by Audit Policy)
                    </label>
                    <textarea
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="Specify medical accommodation, sports quota, or administrative justification..."
                      rows={3}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#f37021]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setOverrideModal(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveOverride}
                      className="px-5 py-2 text-xs font-bold bg-[#f37021] hover:bg-[#d65a0e] text-white rounded-lg shadow"
                    >
                      Save Override &amp; Update
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: STUDENT APPLICATIONS & ELIGIBILITY */}
        {/* ========================================================================= */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-[#0f1f38]">Student Application Roster &amp; Profile Preferences</h2>
              <p className="text-xs text-slate-500 mt-1">
                Inspect occupancy choices (1/2/3-seater), apartment preference, requested facilities, and 8-category lifestyle profiles.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Program &amp; CGPA</th>
                    <th className="py-3 px-4">Occupancy &amp; Apt</th>
                    <th className="py-3 px-4">Facilities Requested</th>
                    <th className="py-3 px-4">Lifestyle Profile</th>
                    <th className="py-3 px-4">Fee Clearance</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {app.studentName}
                        <div className="text-[11px] text-slate-500 font-mono">Reg: {app.regNo}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-semibold">{app.program.slice(0, 24)}...</div>
                        <div className="text-[11px] text-emerald-600 font-bold">CGPA: {app.cgpa}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">
                          {app.preferredOccupancy}-Seater
                        </span>
                        <div className="text-[10px] text-slate-500">
                          {app.apartmentPreference === 'with_apartment' ? 'With Apartment' : 'Standard'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {app.preferredFacilities.map(f => (
                            <span key={f} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="text-[11px]">
                          <strong>{app.lifestyle.sleepSchedule.replace('_', ' ')}</strong> · {app.lifestyle.cleanliness}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {app.lifestyle.foodHabits} · {app.lifestyle.socialBehaviour}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {app.feeCleared ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[11px]">
                            Cleared
                          </span>
                        ) : (
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold text-[11px]">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleVerifyApplication(app.id, true)}
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 p-1.5 rounded-lg text-xs font-bold"
                            title="Verify Application"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleVerifyApplication(app.id, false)}
                            className="bg-rose-50 text-rose-700 hover:bg-rose-100 p-1.5 rounded-lg text-xs font-bold"
                            title="Reject Application"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: HOSTEL INVENTORY & ROOMS MANAGER */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-black text-[#0f1f38]">Hostel Inventory, Floors &amp; Rooms</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage buildings, configure 1/2/3-seater capacities, apartment structures, and amenities (laundry, gym).
                  </p>
                </div>

                <button
                  onClick={() => setShowAddRoomModal(true)}
                  className="bg-[#f37021] hover:bg-[#d65a0e] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Room</span>
                </button>
              </div>

              {/* Hostels Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {hostels.map((h) => (
                  <div key={h.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black bg-[#0f1f38] text-white px-2 py-0.5 rounded">
                        {h.code}
                      </span>
                      <span className="text-xs font-bold text-slate-600">{h.gender} Wing</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">{h.name}</h3>

                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Total Rooms:</span>
                        <span className="font-bold">{h.totalRooms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Bed Slots:</span>
                        <span className="font-bold">{h.totalBeds}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available Beds:</span>
                        <span className="font-bold text-emerald-600">{h.totalBeds - h.allocatedBeds}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rooms Roster */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
                  All Configured Rooms ({rooms.length})
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                      <tr>
                        <th className="py-2.5 px-4">Hostel &amp; Room</th>
                        <th className="py-2.5 px-4">Floor</th>
                        <th className="py-2.5 px-4">Occupancy</th>
                        <th className="py-2.5 px-4">Structure</th>
                        <th className="py-2.5 px-4">Facilities</th>
                        <th className="py-2.5 px-4">Beds (Vacant / Total)</th>
                        <th className="py-2.5 px-4">Annual Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rooms.slice(0, 20).map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-bold text-slate-900">
                            {r.hostelName} - Room {r.roomNumber}
                          </td>
                          <td className="py-2.5 px-4">Floor {r.floor}</td>
                          <td className="py-2.5 px-4 font-bold text-[#0f1f38]">{r.seater}-Seater</td>
                          <td className="py-2.5 px-4">{r.isApartment ? 'With Apartment' : 'Standard'}</td>
                          <td className="py-2.5 px-4">
                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                              {r.hasLaundry ? 'Laundry' : ''} {r.hasGymAccess ? '· Gym' : ''}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-bold">
                            <span className={r.availableBeds > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                              {r.availableBeds} / {r.totalBeds} Vacant
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-bold">₹{r.feePerYear.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Add Room Modal */}
            {showAddRoomModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <form onSubmit={handleAddNewRoom} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-black text-[#0f1f38] text-base">Add New Room to Inventory</h3>
                    <button type="button" onClick={() => setShowAddRoomModal(false)} className="text-slate-400 hover:text-black">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Hostel Tower</label>
                      <select
                        value={newRoomHostel}
                        onChange={(e) => setNewRoomHostel(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-white"
                      >
                        {hostels.map(h => (
                          <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Room Number</label>
                      <input
                        type="text"
                        value={newRoomNumberInput}
                        onChange={(e) => setNewRoomNumberInput(e.target.value)}
                        placeholder="e.g. 401"
                        className="w-full p-2 border rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Floor</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={newRoomFloor}
                        onChange={(e) => setNewRoomFloor(Number(e.target.value))}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Occupancy</label>
                      <select
                        value={newRoomSeater}
                        onChange={(e) => setNewRoomSeater(Number(e.target.value) as RoomOccupancy)}
                        className="w-full p-2 border rounded-lg bg-white"
                      >
                        <option value={1}>1-Seater</option>
                        <option value={2}>2-Seater</option>
                        <option value={3}>3-Seater</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Annual Fee (₹)</label>
                      <input
                        type="number"
                        value={newRoomFee}
                        onChange={(e) => setNewRoomFee(Number(e.target.value))}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newRoomIsApartment}
                          onChange={(e) => setNewRoomIsApartment(e.target.checked)}
                          className="rounded text-[#f37021]"
                        />
                        <span>Apartment</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newRoomIsAc}
                          onChange={(e) => setNewRoomIsAc(e.target.checked)}
                          className="rounded text-[#f37021]"
                        />
                        <span>AC</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setShowAddRoomModal(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold bg-[#f37021] hover:bg-[#d65a0e] text-white rounded-lg shadow"
                    >
                      Save Room to Inventory
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: ROOM CHANGES & WAITING LIST MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            
            {/* Room Change Requests */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-[#0f1f38]">Post-Allocation Room Change Management</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Inspect student reasons, verify room availability in target blocks, and update master allocation records.
                </p>
              </div>

              <div className="space-y-4">
                {roomChanges.map((rc) => (
                  <div key={rc.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{rc.studentName}</span>
                        <span className="text-xs text-slate-500 font-mono">({rc.regNo})</span>
                        <span className="text-xs bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded">
                          Current: {rc.currentRoom}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700"><strong>Reason:</strong> {rc.description}</p>
                      {rc.wardenRemarks && (
                        <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200">
                          Warden Note: {rc.wardenRemarks}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {rc.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleRoomChangeDecision(rc.id, 'approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow"
                          >
                            Approve &amp; Reassign
                          </button>
                          <button
                            onClick={() => handleRoomChangeDecision(rc.id, 'rejected')}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow"
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <span className={`text-xs font-black px-3 py-1 rounded-full ${
                          rc.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {rc.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Waiting List Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0f1f38]">Priority-Based Waiting List Queue</h3>
                  <p className="text-xs text-slate-500">
                    Students awaiting allocations. Automatically prioritized when vacancies or cancellations occur.
                  </p>
                </div>

                <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full">
                  {runSummary ? runSummary.waitlistedCount : 2} Students in Queue
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase">
                    <tr>
                      <th className="py-2.5 px-4">Priority Rank</th>
                      <th className="py-2.5 px-4">Student Name</th>
                      <th className="py-2.5 px-4">Reg No</th>
                      <th className="py-2.5 px-4">Reason / Target Preference</th>
                      <th className="py-2.5 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#f37021]">#1</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">Kabir Batra</td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">12400005</td>
                      <td className="py-2.5 px-4 text-slate-600">Pending fee clearance resolution / target 3-seater</td>
                      <td className="py-2.5 px-4">
                        <button className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold px-3 py-1 rounded-lg">
                          Promote when Bed Vacant
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#f37021]">#2</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">Manish Gupta</td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">12400015</td>
                      <td className="py-2.5 px-4 text-slate-600">1-Seater Deluxe currently at full capacity</td>
                      <td className="py-2.5 px-4">
                        <button className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold px-3 py-1 rounded-lg">
                          Promote when Bed Vacant
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
