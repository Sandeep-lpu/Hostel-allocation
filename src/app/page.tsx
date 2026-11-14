'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Bed, 
  Users, 
  Zap, 
  Compass, 
  FileText, 
  Clock, 
  SlidersHorizontal,
  ChevronDown,
  Wifi,
  UtensilsCrossed,
  Dumbbell,
  HeartPulse,
  Award,
  Layers,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { INITIAL_HOSTELS, INITIAL_ROOMS } from '@/lib/mockData';

export default function HomePage() {
  const [selectedSeater, setSelectedSeater] = useState<number | 'all'>('all');
  const [acFilter, setAcFilter] = useState<'all' | 'ac' | 'non-ac'>('all');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const filteredRooms = INITIAL_ROOMS.filter(r => {
    if (selectedSeater !== 'all' && r.seater !== selectedSeater) return false;
    if (acFilter === 'ac' && !r.isAc) return false;
    if (acFilter === 'non-ac' && r.isAc) return false;
    return true;
  });

  const faqs = [
    {
      q: 'How does the automated multi-constraint allocation engine work?',
      a: 'The engine evaluates verified student applications in priority sequence (medical/accessibility first, followed by CGPA merit). It applies Hard Constraints (Gender segregation, bed capacity, accessibility floor level) and Soft Constraints (Ranked room preferences and Lifestyle compatibility scores between potential roommates).'
    },
    {
      q: 'Can I choose my preferred roommate?',
      a: 'Yes! In Step 3 of the application, students can complete the Lifestyle Questionnaire and provide their desired roommate\'s university registration number. If both students provide mutual consent and share identical room category preferences, the engine pairs them with highest priority.'
    },
    {
      q: 'What happens if all beds in my preferred category are full?',
      a: 'If your top ranked preferences are filled, the engine checks your subsequent choices. If all eligible preferences are exhausted, you are placed on the Ranked Waiting List with real-time queue position tracking. When a vacancy arises, the engine auto-promotes the next eligible candidate.'
    },
    {
      q: 'Can I apply for a room change after allotment?',
      a: 'Yes. Once the final allocation list is officially published, students can submit a Post-Allocation Room Change Request via their Student Dashboard stating medical, academic routine, or personal reasons for the Chief Warden\'s review.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative bg-[#0f1f38] text-white overflow-hidden py-20 lg:py-28">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f37021_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-[#f37021] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#f37021]" />
                <span className="text-white">Smart Campus Housing · Academic Year 2026-27</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                World-Class Living, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f37021] to-amber-400">
                  Fair &amp; Automated
                </span> Allotment.
              </h1>

              <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                Welcome to Lovely Professional University Residential Services. Experience high-tech hostel living powered by an automated multi-constraint allocation engine that balances gender, merit, accessibility, and lifestyle compatibility.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <Link
                  href="/portal/student"
                  className="flex items-center gap-3 bg-[#f37021] hover:bg-[#d65a0e] text-white px-7 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Start Student Application</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/portal/admin"
                  className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white px-6 py-3.5 rounded-xl font-semibold backdrop-blur-sm transition-all"
                >
                  <ShieldCheck className="w-5 h-5 text-[#f37021]" />
                  <span>Warden Allocation Engine</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-slate-300">
                <div>
                  <div className="text-2xl font-black text-white">25,000+</div>
                  <div className="text-xs text-slate-400">Resident Students</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#f37021]">18+</div>
                  <div className="text-xs text-slate-400">Residential Towers</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">99.4%</div>
                  <div className="text-xs text-slate-400">Preference Match Rate</div>
                </div>
              </div>
            </div>

            {/* Right Card / Interactive Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-8 rounded-3xl shadow-2xl relative">
                <div className="absolute -top-3 -right-3 bg-[#f37021] text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow">
                  Cycle 2026-27 Active
                </div>

                <div className="flex items-center gap-3 pb-5 border-b border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-[#f37021]/20 border border-[#f37021]/30 flex items-center justify-center text-[#f37021]">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Allocation Workflow Status</h3>
                    <p className="text-xs text-slate-300">Phase 1: Applications &amp; Automated Verification</p>
                  </div>
                </div>

                <div className="space-y-4 py-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">1. Student Application &amp; Eligibility</div>
                      <div className="text-xs text-slate-400">CGPA cutoff check, fee clearance &amp; disability priority</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">2. Ranked Preferences &amp; Lifestyle Survey</div>
                      <div className="text-xs text-slate-400">Room categories (1/2/3/4 Seater) &amp; sleep/study habits</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#f37021]/20 text-[#f37021] flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">3. Engine Optimization &amp; Draft Generation</div>
                      <div className="text-xs text-slate-300">Hard constraints check + Compatibility scoring</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-300">4. Warden Approval &amp; Official Publication</div>
                      <div className="text-xs text-slate-400">PDF Allotment letter with instant bed &amp; roommate info</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-300">Need immediate hostel desk support?</span>
                  <Link href="/portal/student" className="text-xs font-bold text-[#f37021] hover:underline flex items-center gap-1">
                    Enter Portal <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* WORKFLOW PIPELINE EXPLAINER (Diagram Implementation) */}
      <section id="workflow" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black tracking-widest text-[#f37021] uppercase bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              System Architecture &amp; Lifecycle
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0f1f38] mt-3">
              The End-to-End Hostel Allocation Workflow
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              Designed as per the university residence guidelines: every student is guaranteed a transparent, bias-free, and merit-honoring room allocation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#f37021]/50 hover:shadow-xl transition-all duration-300 relative group">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#f37021] flex items-center justify-center font-black text-lg mb-5 group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="text-xl font-bold text-[#0f1f38] mb-2">Student Application &amp; Registration</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Students log in with their university ID, submit basic personal details, upload identity cards, and declare any physical or medical accessibility requirements.
              </p>
              <div className="text-xs font-semibold text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
                Key Check: Academic verification &amp; medical accommodations.
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#f37021]/50 hover:shadow-xl transition-all duration-300 relative group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#0f1f38] flex items-center justify-center font-black text-lg mb-5 group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="text-xl font-bold text-[#0f1f38] mb-2">Automated Eligibility Validation</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                The automated system queries university records to confirm fee clearance status, CGPA merit criteria, and quota eligibility before advancing.
              </p>
              <div className="text-xs font-semibold text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
                Gate: Ineligible candidates notified with resolution instructions.
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#f37021]/50 hover:shadow-xl transition-all duration-300 relative group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg mb-5 group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="text-xl font-bold text-[#0f1f38] mb-2">Ranked Preferences &amp; Lifestyle Survey</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Students order their preferred room seater (1/2/3/4), AC/Non-AC, and specific hostel tower, plus complete the sleep, study, and cleanliness survey.
              </p>
              <div className="text-xs font-semibold text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
                Roommate Matching: Optional mutual consent registration pairing.
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#f37021]/50 hover:shadow-xl transition-all duration-300 relative group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-lg mb-5 group-hover:scale-110 transition-transform">
                04
              </div>
              <h3 className="text-xl font-bold text-[#0f1f38] mb-2">Multi-Constraint Allocation Engine</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Admin executes the allocation algorithm. Hard constraints (Gender, capacity, accessibility) and Soft constraints (ranked preferences &amp; compatibility score) run.
              </p>
              <div className="text-xs font-semibold text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
                Output: Draft bed assignments with transparent match reasons.
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#f37021]/50 hover:shadow-xl transition-all duration-300 relative group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg mb-5 group-hover:scale-110 transition-transform">
                05
              </div>
              <h3 className="text-xl font-bold text-[#0f1f38] mb-2">Warden Review &amp; Official Publication</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                The Chief Warden reviews draft allocations, may execute reassignments with documented reasons, and officially authorizes publication.
              </p>
              <div className="text-xs font-semibold text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
                Delivery: Instant Allotment Slip PDF &amp; bed occupancy updates.
              </div>
            </div>

            {/* Step 6 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#f37021]/50 hover:shadow-xl transition-all duration-300 relative group">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black text-lg mb-5 group-hover:scale-110 transition-transform">
                06
              </div>
              <h3 className="text-xl font-bold text-[#0f1f38] mb-2">Post-Allocation &amp; Waiting List Queue</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Students without instant allocation enter the ranked waiting list with real-time queue tracking. Allotted students can submit room change requests.
              </p>
              <div className="text-xs font-semibold text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
                Continuous: Auto-promotion when cancellations or vacancies occur.
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ROOM CATEGORIES & FEES (LPU Style Showcase) */}
      <section id="rooms" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-black tracking-widest text-[#f37021] uppercase bg-orange-100/60 px-3 py-1 rounded-full border border-orange-200">
                Residence Packages
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0f1f38] mt-2">
                Room Types &amp; Annual Fee Structure
              </h2>
              <p className="text-slate-600 mt-1 text-sm">
                Transparent fees covering accommodation, standard electricity, 24/7 security, high-speed Wi-Fi, and housekeeping.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-white p-1 rounded-xl border border-slate-200 flex text-xs font-bold">
                <button
                  onClick={() => setSelectedSeater('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${selectedSeater === 'all' ? 'bg-[#0f1f38] text-white' : 'text-slate-600 hover:text-black'}`}
                >
                  All Beds
                </button>
                <button
                  onClick={() => setSelectedSeater(1)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${selectedSeater === 1 ? 'bg-[#0f1f38] text-white' : 'text-slate-600 hover:text-black'}`}
                >
                  1-Seater
                </button>
                <button
                  onClick={() => setSelectedSeater(2)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${selectedSeater === 2 ? 'bg-[#0f1f38] text-white' : 'text-slate-600 hover:text-black'}`}
                >
                  2-Seater
                </button>
                <button
                  onClick={() => setSelectedSeater(3)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${selectedSeater === 3 ? 'bg-[#0f1f38] text-white' : 'text-slate-600 hover:text-black'}`}
                >
                  3-Seater
                </button>
                <button
                  onClick={() => setSelectedSeater(4)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${selectedSeater === 4 ? 'bg-[#0f1f38] text-white' : 'text-slate-600 hover:text-black'}`}
                >
                  4-Seater
                </button>
              </div>

              <div className="bg-white p-1 rounded-xl border border-slate-200 flex text-xs font-bold">
                <button
                  onClick={() => setAcFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${acFilter === 'all' ? 'bg-[#f37021] text-white' : 'text-slate-600 hover:text-black'}`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setAcFilter('ac')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${acFilter === 'ac' ? 'bg-[#f37021] text-white' : 'text-slate-600 hover:text-black'}`}
                >
                  Air Conditioned
                </button>
                <button
                  onClick={() => setAcFilter('non-ac')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${acFilter === 'non-ac' ? 'bg-[#f37021] text-white' : 'text-slate-600 hover:text-black'}`}
                >
                  Non-AC Standard
                </button>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div 
                key={room.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-[#f37021] shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-800">
                      {room.hostelName} Tower · Floor {room.floor}
                    </span>
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${room.isAc ? 'bg-orange-100 text-[#f37021]' : 'bg-slate-200 text-slate-700'}`}>
                      {room.isAc ? 'AC Room' : 'Standard Non-AC'}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-[#0f1f38] mb-1">
                    {room.seater}-Seater {room.isAc ? 'Air Conditioned' : 'Comfort'}
                  </h3>
                  <p className="text-xs text-slate-500 mb-5">
                    Room No: {room.roomNumber} · {room.hasAttachedWashroom ? 'Attached Washroom' : 'Common Washroom Block'}
                  </p>

                  <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Bed className="w-3.5 h-3.5 text-[#f37021]" /> Total Capacity
                      </span>
                      <span className="font-bold text-slate-900">{room.totalBeds} Beds</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-[#f37021]" /> Available Slots
                      </span>
                      <span className="font-bold text-emerald-600">{room.availableBeds} Vacant Bed(s)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#f37021]" /> Accessibility
                      </span>
                      <span className="font-bold text-slate-900">{room.isAccessible ? 'Medical/Physically Friendly' : 'Standard Floor'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-500 font-semibold uppercase">Annual Fee</div>
                    <div className="text-xl font-black text-[#0f1f38]">
                      ₹{room.feePerYear.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-slate-500"> /year</span>
                    </div>
                  </div>

                  <Link
                    href="/portal/student"
                    className="bg-[#f37021] hover:bg-[#d65a0e] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
                  >
                    Select in Portal
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOSTEL COMPLEXES (TOWERS) */}
      <section id="towers" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black tracking-widest text-[#f37021] uppercase bg-orange-100/60 px-3 py-1 rounded-full border border-orange-200">
              Campus Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0f1f38] mt-2">
              Featured Residential Complexes
            </h2>
            <p className="text-slate-600 mt-2 text-sm">
              Equipped with 24/7 power backup, central dining facilities, high-speed campus LAN, and biometric turnstiles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {INITIAL_HOSTELS.map((hostel) => (
              <div 
                key={hostel.id}
                className="rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-52 w-full overflow-hidden">
                  <img
                    src={hostel.image}
                    alt={hostel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#0f1f38]/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
                    {hostel.gender} Residence
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md text-[#0f1f38] text-xs font-extrabold px-3 py-1 rounded-full shadow">
                    {hostel.floors} Floors · {hostel.totalRooms} Rooms
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#0f1f38] mb-2">{hostel.name}</h3>
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed">{hostel.description}</p>
                    
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {hostel.facilities.map((fac, idx) => (
                        <span key={idx} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Occupancy: {Math.round((hostel.allocatedBeds / hostel.totalBeds) * 100)}%</span>
                    <span className="text-[#f37021] font-bold">{hostel.totalBeds - hostel.allocatedBeds} Beds Open</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AMENITIES */}
      <section id="amenities" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black tracking-widest text-[#f37021] uppercase bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Campus Amenities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">
              A Complete City Within A Campus
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              LPU hostels provide holistic residential care so you can focus on academic and personal excellence.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#f37021]/20 text-[#f37021] flex items-center justify-center mx-auto mb-3">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-base">Hygienic Multi-Cuisine Mess</h4>
              <p className="text-xs text-slate-400 mt-1">North, South, Continental &amp; Jain dietary options.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
                <Wifi className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-base">High-Speed Campus LAN</h4>
              <p className="text-xs text-slate-400 mt-1">Up to 1 Gbps optical fiber link with uninterrupted access.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-base">24/7 Uni-Hospital</h4>
              <p className="text-xs text-slate-400 mt-1">Resident medical officers, resident nurses &amp; ambulance.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-3">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-base">Modern Fitness Centers</h4>
              <p className="text-xs text-slate-400 mt-1">Gymnasiums, yoga halls, squash &amp; basketball courts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQS & POLICIES */}
      <section id="faqs" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-black tracking-widest text-[#f37021] uppercase bg-orange-100/60 px-3 py-1 rounded-full border border-orange-200">
              Clear Guidelines
            </span>
            <h2 className="text-3xl font-black text-[#0f1f38] mt-2">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Everything you need to know about allocation rules, waiting lists, and fees.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                  className="w-full text-left p-5 flex items-center justify-between font-bold text-slate-900 hover:text-[#f37021] bg-white transition-colors"
                >
                  <span className="text-base">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${faqOpen === index ? 'rotate-180 text-[#f37021]' : ''}`} />
                </button>
                {faqOpen === index && (
                  <div className="p-5 pt-0 text-sm text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Support Banner */}
          <div className="mt-12 bg-orange-50 border border-orange-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f37021] text-white flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-[#0f1f38] text-sm">Have specific accommodation queries?</h4>
                <p className="text-xs text-slate-600">The Chief Warden Desk &amp; Hostel Counseling office is available 24x7.</p>
              </div>
            </div>
            <Link
              href="/portal/student"
              className="bg-[#0f1f38] hover:bg-[#1a3258] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shrink-0"
            >
              Contact Hostel Desk
            </Link>
          </div>
        </div>
      </section>

      {/* CTA FOOTER BANNER */}
      <section className="bg-gradient-to-r from-[#f37021] to-[#d65a0e] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black">
            Ready to Secure Your Campus Accommodation?
          </h2>
          <p className="text-orange-100 max-w-xl mx-auto text-sm">
            Log in to the Student Portal, check your eligibility, order your room preferences, and get your AI-assisted allotment letter.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/portal/student"
              className="bg-white text-[#f37021] hover:bg-orange-50 px-8 py-3.5 rounded-xl font-bold shadow-lg hover:scale-105 transition-all text-sm"
            >
              Open Student Portal
            </Link>
            <Link
              href="/portal/admin"
              className="bg-[#0f1f38] hover:bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:scale-105 transition-all text-sm"
            >
              Warden Portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

