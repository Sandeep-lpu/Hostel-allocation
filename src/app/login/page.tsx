'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Award, 
  Trophy, 
  Star, 
  ShieldCheck,
  ChevronDown,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Lock,
  Building2
} from 'lucide-react';
import { REGISTERED_STUDENTS, PRIMARY_STUDENT, RegisteredStudent } from '@/lib/studentsData';
import { loginStudent, loginAdmin, getAuthSession } from '@/lib/authStore';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get('role');
  const redirectParam = searchParams.get('redirect');

  // Role: 'student' | 'admin'
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>(
    initialRoleParam === 'admin' || redirectParam?.includes('admin') ? 'admin' : 'student'
  );

  const [roleSelect, setRoleSelect] = useState<string>(
    initialRoleParam === 'admin' ? 'Chief Warden' : 'HeadOffice'
  );
  
  // Credentials
  const [userId, setUserId] = useState('12400000');
  const [password, setPassword] = useState('••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<RegisteredStudent>(PRIMARY_STUDENT);
  const [searchStudent, setSearchStudent] = useState('');
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state when tab changes
  useEffect(() => {
    if (activeTab === 'admin') {
      setRoleSelect('Chief Warden');
      setUserId('warden_chief');
      setPassword('admin@123');
    } else {
      setRoleSelect('HeadOffice');
      setUserId(selectedStudent.regNo);
      setPassword('••••••••••');
    }
    setErrorMessage(null);
  }, [activeTab]);

  const handleStudentSelect = (student: RegisteredStudent) => {
    setSelectedStudent(student);
    setUserId(student.regNo);
    setShowStudentPicker(false);
    setErrorMessage(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (activeTab === 'admin' || roleSelect === 'Chief Warden' || roleSelect === 'Admin') {
      // Admin Login
      loginAdmin(userId.trim() || 'warden_chief', 'Chief Warden & Housing Director');
      router.push(redirectParam || '/portal/admin');
      return;
    }

    // Student Login: match by regNo, email or selected student
    const trimmed = userId.trim();
    const matched = REGISTERED_STUDENTS.find(
      s => s.regNo === trimmed || s.email.toLowerCase() === trimmed.toLowerCase()
    ) || (selectedStudent.regNo === trimmed ? selectedStudent : null);

    if (!matched) {
      setErrorMessage(`No student account found matching "${trimmed}". You can select from the 101 demo accounts below.`);
      return;
    }

    loginStudent(matched);
    router.push(redirectParam || '/portal/student');
  };

  const filteredStudents = REGISTERED_STUDENTS.filter(s => 
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.regNo.includes(searchStudent) ||
    s.email.toLowerCase().includes(searchStudent.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f7f2ed] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
        
        {/* LEFT COLUMN: THE WORLD RANKINGS 1ST IN INDIA BANNER (Exact Replica) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-[#fffbf5] via-[#fff7ee] to-[#fdeedc] p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-orange-100 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />

          {/* Top Rankings Header */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="border border-slate-300 bg-white/90 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-rose-600 text-white font-black text-[9px] flex items-center justify-center">
                  THE
                </div>
                <div className="text-[10px] font-bold text-slate-800 leading-tight">
                  World<br />University<br />Rankings 2027
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-bold text-[#e88734] bg-orange-100/70 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Times Higher Education</span>
              </div>
            </div>

            <div className="text-center my-4">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                RANKS <span className="text-[#e88734]">LPU</span>
              </h2>

              {/* 3D 1st Badge */}
              <div className="my-6 relative inline-block">
                <div className="text-7xl sm:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 drop-shadow-md">
                  1<span className="text-4xl sm:text-5xl align-super">st</span>
                </div>
                
                <div className="mt-2 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white font-black text-sm uppercase px-8 py-1 rounded-md shadow-md tracking-wider">
                  IN INDIA
                </div>

                <div className="text-xs font-black text-slate-800 uppercase tracking-wide mt-2">
                  For Research Environment
                </div>
                <div className="text-[11px] text-slate-600 font-semibold">
                  Amongst All Private Universities in India <br />
                  <span className="text-slate-500">(World Wide - 714 Rank)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 3 Laurel Cards */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-orange-200/70">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-orange-100 shadow-sm">
              <div className="text-2xl font-black text-amber-600">
                4<span className="text-sm align-super">th</span>
              </div>
              <div className="text-[10px] font-black text-slate-800 uppercase leading-tight mt-0.5">
                IN INDIA
              </div>
              <div className="text-[9px] text-slate-500 mt-1 line-clamp-2">
                Amongst all Govt (even IITs/NITs) &amp; Private
              </div>
              <div className="text-[8px] text-slate-400 mt-0.5">(World Wide 501-550)</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-orange-100 shadow-sm">
              <div className="text-2xl font-black text-amber-600">
                4<span className="text-sm align-super">th</span>
              </div>
              <div className="text-[10px] font-black text-slate-800 uppercase leading-tight mt-0.5">
                IN INDIA
              </div>
              <div className="text-[10px] font-black text-[#0f1f38] mt-1">
                Research Quality
              </div>
              <div className="text-[8px] text-slate-400 mt-0.5">(World Wide - 161 Rank)</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-orange-100 shadow-sm">
              <div className="text-2xl font-black text-amber-600">
                9<span className="text-sm align-super">th</span>
              </div>
              <div className="text-[10px] font-black text-slate-800 uppercase leading-tight mt-0.5">
                IN INDIA
              </div>
              <div className="text-[10px] font-black text-[#0f1f38] mt-1">
                International Outlook
              </div>
              <div className="text-[8px] text-slate-400 mt-0.5">(World Wide - 802 Rank)</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LPU UMS LOGIN FORM (Supports Both Student & Admin Login) */}
        <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* LPU & UMS Header Logos */}
            <div className="flex items-center justify-between pb-4 mb-4">
              <div className="flex items-center gap-3.5">
                {/* LPU Sunburst Crest */}
                <div className="w-11 h-11 rounded-full border-2 border-slate-700/80 p-0.5 flex items-center justify-center bg-white shadow-sm shrink-0">
                  <div className="w-full h-full rounded-full border border-dashed border-slate-600 flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-slate-900 via-amber-700 to-orange-500">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full border border-white/40 flex items-center justify-center">
                        <span className="text-[7px] font-black tracking-tighter text-white">LPU</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* UMS Logo */}
                <div>
                  <div className="flex items-center gap-1.5 font-black text-xl text-slate-900 tracking-tight leading-none">
                    <span className="text-orange-500 text-base rotate-45 transform inline-block">◆</span>
                    <span className="text-[#0f1f38] tracking-tight">UMS</span>
                  </div>
                  <div className="text-[7px] font-bold text-slate-500 tracking-[0.2em] uppercase mt-0.5">
                    University Management System
                  </div>
                </div>
              </div>

              <Link href="/" className="text-xs text-[#e88734] font-semibold hover:underline">
                Portal Home
              </Link>
            </div>

            {/* ROLE TABS: STUDENT vs CHIEF WARDEN / ADMIN */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-4 border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('student')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'student'
                    ? 'bg-white text-[#e88734] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student Login</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-[#0f1f38] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#e88734]" />
                <span>Admin / Warden</span>
              </button>
            </div>

            {errorMessage && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-3.5">
              {/* Role Dropdown */}
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs font-semibold text-slate-700">
                  {activeTab === 'admin' ? 'Administrative Role' : 'Log in Office'}
                </label>
                <div className="relative min-w-[150px]">
                  <select
                    value={roleSelect}
                    onChange={(e) => {
                      setRoleSelect(e.target.value);
                      if (e.target.value === 'Chief Warden' || e.target.value === 'Admin') {
                        setActiveTab('admin');
                      }
                    }}
                    className="w-full text-xs font-medium py-1.5 px-3 pr-8 bg-slate-100 hover:bg-slate-200/80 border border-transparent rounded-lg appearance-none text-slate-700 focus:outline-none cursor-pointer transition-colors"
                  >
                    {activeTab === 'admin' ? (
                      <>
                        <option value="Chief Warden">Chief Warden</option>
                        <option value="Hostel Admin">Hostel Admin</option>
                        <option value="HeadOffice">HeadOffice</option>
                      </>
                    ) : (
                      <>
                        <option value="HeadOffice">HeadOffice</option>
                        <option value="Student">Student Portal</option>
                        <option value="Faculty">Faculty &amp; Staff</option>
                      </>
                    )}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* User ID Field */}
              <div className="relative">
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={activeTab === 'admin' ? 'Admin Username (e.g. warden_chief)' : 'User ID / Reg No (e.g. 12400000)'}
                  className="w-full text-xs font-normal p-3 pr-10 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-lg focus:outline-none focus:border-[#e88734] focus:bg-white text-slate-800 transition-all placeholder:text-slate-400"
                  required
                />
                {activeTab === 'admin' ? (
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                ) : (
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                )}
              </div>

              {/* Password Field */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full text-xs font-normal p-3 pr-10 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-lg focus:outline-none focus:border-[#e88734] focus:bg-white text-slate-800 transition-all placeholder:text-slate-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 absolute right-3.5 top-3 p-0.5 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Cloudflare Turnstile Box */}
              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/90 flex items-center justify-between text-xs shadow-inner">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 border-t-[#e88734] animate-spin" />
                  <span className="text-slate-600 text-[11px] font-normal">Verifying...</span>
                </div>
                <div className="flex flex-col items-end leading-none">
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-amber-500 inline-block fill-current" viewBox="0 0 24 24">
                      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
                    </svg>
                    <span className="text-[9px] font-black text-slate-900 tracking-wider">CLOUDFLARE</span>
                  </div>
                  <span className="text-[7.5px] text-slate-400 font-medium mt-0.5">Privacy • Terms</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-3 px-4 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${
                  activeTab === 'admin'
                    ? 'bg-[#0f1f38] hover:bg-[#1a3258]'
                    : 'bg-[#e88734] hover:bg-[#d97726]'
                }`}
              >
                <span>{activeTab === 'admin' ? 'Login as Chief Warden' : 'Login to Student Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-0.5">
                <a href="#forgot" className="text-xs font-medium text-slate-700 hover:text-[#e88734] transition-colors">
                  Forgot your password?
                </a>
              </div>
            </form>
          </div>

          {/* QUICK DEMO CREDENTIAL CHIPS */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            {activeTab === 'student' ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Demo Student Accounts (101 Active)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowStudentPicker(!showStudentPicker)}
                    className="text-[10px] font-bold text-[#e88734] hover:underline"
                  >
                    {showStudentPicker ? 'Close' : 'Browse All'}
                  </button>
                </div>

                <div className="bg-orange-50/60 border border-orange-200 rounded-xl p-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{selectedStudent.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Reg: {selectedStudent.regNo} · CGPA: {selectedStudent.cgpa}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserId(selectedStudent.regNo);
                      loginStudent(selectedStudent);
                      router.push(redirectParam || '/portal/student');
                    }}
                    className="bg-[#e88734] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#d97726] shadow-sm"
                  >
                    Log In Now
                  </button>
                </div>

                {/* Expanded 100 students picker */}
                {showStudentPicker && (
                  <div className="mt-2 bg-white border border-slate-200 rounded-xl p-2.5 shadow-xl max-h-52 overflow-y-auto space-y-1.5">
                    <input
                      type="text"
                      placeholder="Search students by name, reg no, or email..."
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg sticky top-0 bg-white"
                    />
                    <div className="space-y-1">
                      {filteredStudents.map((std) => (
                        <button
                          key={std.id}
                          type="button"
                          onClick={() => handleStudentSelect(std)}
                          className="w-full text-left p-1.5 rounded-lg hover:bg-orange-50 text-xs flex items-center justify-between border-b border-slate-50"
                        >
                          <div>
                            <div className="font-bold text-slate-800">{std.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{std.regNo} · {std.program.slice(0, 20)}...</div>
                          </div>
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            {std.cgpa} CGPA
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#e88734]" />
                    <span>Chief Warden / Allocation Admin</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    User: warden_chief · Pass: admin@123
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    loginAdmin('warden_chief', 'Chief Warden & Housing Director');
                    router.push(redirectParam || '/portal/admin');
                  }}
                  className="bg-[#0f1f38] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#1a3258] shadow-sm"
                >
                  Log In Now
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f2ed] flex items-center justify-center">Loading Login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
