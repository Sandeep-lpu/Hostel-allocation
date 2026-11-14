'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuthSession } from '@/lib/authStore';
import { 
  Users, 
  Sparkles, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  RotateCw,
  Copy,
  ExternalLink
} from 'lucide-react';
import { PRIMARY_STUDENT, REGISTERED_STUDENTS } from '@/lib/studentsData';
import { 
  sendFriendOtpRequest, 
  verifyFriendOtp, 
  subscribeToFriendEvents,
  getStoredFriendRequests 
} from '@/lib/socketClient';
import { FriendAllocationRequest } from '@/lib/types';

export default function FriendDemoPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  // Student A (Sender - Sandeep Kumar)
  const studentA = PRIMARY_STUDENT; // 12400000
  // Student B (Target - Rohan Mehra)
  const studentB = REGISTERED_STUDENTS.find(s => s.regNo === '12400003') || REGISTERED_STUDENTS[3];

  // Student A state
  const [targetIdInput, setTargetIdInput] = useState(studentB.regNo);
  const [sentRequest, setSentRequest] = useState<FriendAllocationRequest | null>(null);
  const [studentAStatus, setStudentAStatus] = useState<string>('idle');

  // Student B state
  const [receivedOtpReq, setReceivedOtpReq] = useState<FriendAllocationRequest | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [verifyMessage, setVerifyMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [studentBStatus, setStudentBStatus] = useState<string>('waiting');

  useEffect(() => {
    const session = getAuthSession();
    if (!session.isLoggedIn) {
      router.replace('/login?redirect=/portal/friend-demo');
      return;
    }
    setAuthChecked(true);

    // Check initial stored requests
    const stored = getStoredFriendRequests();
    const existing = stored.find(r => 
      (r.senderRegNo === studentA.regNo && r.targetRegNo === studentB.regNo) ||
      (r.senderRegNo === studentB.regNo && r.targetRegNo === studentA.regNo)
    );
    if (existing) {
      setSentRequest(existing);
      setReceivedOtpReq(existing);
      if (existing.status === 'both_approved') {
        setStudentAStatus('verified');
        setStudentBStatus('verified');
      }
    }

    // Subscribe Student A to Socket.IO events
    const unsubA = subscribeToFriendEvents(studentA.regNo, {
      onVerificationSuccess: (payload) => {
        setStudentAStatus('verified');
        setSentRequest(prev => prev ? { ...prev, status: 'both_approved' } : null);
      }
    });

    // Subscribe Student B to Socket.IO events
    const unsubB = subscribeToFriendEvents(studentB.regNo, {
      onReceiveOtp: (req) => {
        setReceivedOtpReq(req);
        setStudentBStatus('otp_received');
      },
      onVerificationSuccess: (payload) => {
        setStudentBStatus('verified');
        setReceivedOtpReq(prev => prev ? { ...prev, status: 'both_approved' } : null);
      }
    });

    return () => {
      unsubA();
      unsubB();
    };
  }, [studentA.regNo, studentB.regNo]);

  // Student A: Send Friend Room Allocation OTP Request
  const handleSendOtp = () => {
    setStudentAStatus('sending');
    const req = sendFriendOtpRequest({
      senderRegNo: studentA.regNo,
      senderName: studentA.name,
      targetRegNo: studentB.regNo,
      targetName: studentB.name,
      targetHostelId: 'bh-4',
      targetRoomNumber: '204',
      targetSeater: 2
    });

    setSentRequest(req);
    setReceivedOtpReq(req); // Real-time delivery
    setStudentAStatus('awaiting_otp');
    setStudentBStatus('otp_received');
    setEnteredOtp('');
    setVerifyMessage(null);
  };

  // Student B: Verify OTP
  const handleVerify = () => {
    if (!receivedOtpReq) return;
    const result = verifyFriendOtp(receivedOtpReq.requestId, enteredOtp);
    setVerifyMessage({ success: result.success, text: result.message });

    if (result.success) {
      setStudentAStatus('verified');
      setStudentBStatus('verified');
      setSentRequest(prev => prev ? { ...prev, status: 'both_approved' } : null);
      setReceivedOtpReq(prev => prev ? { ...prev, status: 'both_approved' } : null);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 bg-slate-800 text-white p-5 rounded-2xl shadow-sm border border-slate-700">
          <div className="w-5 h-5 rounded-full border-2 border-[#f37021] border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-300">Checking authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#f37021] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                Socket.IO Private Channel
              </span>
              <h1 className="text-xl sm:text-2xl font-black">
                Real-Time Friend Room Allocation &amp; OTP Demonstration
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Simulates two separate concurrent browser sessions: <strong>Student A</strong> initiates request → <strong>Student B</strong> receives real-time OTP → Verification locks both into shared allocation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/portal/student"
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
            >
              <span>Back to Student Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Real-time Indicator banner */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-center justify-between text-xs text-orange-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>
              <strong>Socket.IO Gateway Active:</strong> Private room channels listening for <code>student_{studentA.regNo}</code> &amp; <code>student_{studentB.regNo}</code>.
            </span>
          </div>
          <span className="text-[11px] font-bold text-orange-400 hidden sm:inline">
            Notice: Demo OTP delivery simulation
          </span>
        </div>

        {/* DUAL SESSION SIDE-BY-SIDE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ========================================================================= */}
          {/* PANE 1: STUDENT A (INITIATOR - SANDEEP KUMAR) */}
          {/* ========================================================================= */}
          <div className="bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Profile Card Header */}
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#f37021] text-white flex items-center justify-center font-bold text-base shadow">
                    SA
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-orange-400">Student A (Initiator)</span>
                    <h2 className="text-base font-bold text-white">{studentA.name}</h2>
                    <p className="text-[11px] text-slate-400 font-mono">Reg No: {studentA.regNo} · B.Tech CSE</p>
                  </div>
                </div>

                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                  studentAStatus === 'verified'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : studentAStatus === 'awaiting_otp'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {studentAStatus === 'verified' ? '✓ Linked with Friend' : studentAStatus === 'awaiting_otp' ? 'Awaiting Friend OTP' : 'Ready'}
                </span>
              </div>

              {/* Step 1: Input Friend Reg No */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 block">
                  1. Enter Friend&apos;s University Registration Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={targetIdInput}
                    onChange={(e) => setTargetIdInput(e.target.value)}
                    placeholder="Enter friend ID (e.g. 12400003)"
                    disabled={studentAStatus === 'verified'}
                    className="flex-1 text-xs p-3 bg-slate-900 border border-slate-700 rounded-xl font-mono text-white focus:outline-none focus:border-[#f37021]"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={studentAStatus === 'verified'}
                    className="bg-[#f37021] hover:bg-[#d65a0e] disabled:opacity-50 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow shrink-0 flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Send Friend OTP</span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-400">
                  Target Student: <strong>{studentB.name}</strong> ({studentB.program})
                </div>
              </div>

              {/* Status Box */}
              {sentRequest && (
                <div className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                  sentRequest.status === 'both_approved'
                    ? 'bg-emerald-900/20 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-900/60 border-slate-700 text-slate-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[10px]">
                      Shared Request ID: <span className="font-mono text-white">{sentRequest.requestId}</span>
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      sentRequest.status === 'both_approved' ? 'bg-emerald-500 text-white' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {sentRequest.status === 'both_approved' ? 'VERIFIED' : 'PENDING FRIEND OTP'}
                    </span>
                  </div>

                  <p className="text-[11px] leading-relaxed">
                    {sentRequest.status === 'both_approved' ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        Mutual friend verification successful! You and {studentB.name} are locked into the same room allocation.
                      </span>
                    ) : (
                      <span>
                        An OTP verification request was generated for <strong>{studentB.name}</strong>. Waiting for Student B to enter OTP in their session...
                      </span>
                    )}
                  </p>

                  {/* Demo OTP Preview Note */}
                  {sentRequest.status !== 'both_approved' && (
                    <div className="bg-orange-500/10 p-2.5 rounded-xl border border-orange-500/20 text-[11px] text-orange-300 flex items-center justify-between">
                      <span>Generated Demo OTP for demonstration:</span>
                      <span className="font-mono font-black text-sm bg-orange-500/20 px-2 py-0.5 rounded text-white tracking-widest">
                        {sentRequest.otp}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-500 pt-3 border-t border-slate-700 flex items-center justify-between">
              <span>Session: Student A (Active)</span>
              <span>Hostel: BH-4 Room 204</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PANE 2: STUDENT B (RECIPIENT - ROHAN MEHRA) */}
          {/* ========================================================================= */}
          <div className="bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Profile Card Header */}
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow">
                    SB
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-indigo-400">Student B (Friend Recipient)</span>
                    <h2 className="text-base font-bold text-white">{studentB.name}</h2>
                    <p className="text-[11px] text-slate-400 font-mono">Reg No: {studentB.regNo} · B.Tech CSE</p>
                  </div>
                </div>

                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                  studentBStatus === 'verified'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : studentBStatus === 'otp_received'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-bounce'
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {studentBStatus === 'verified' ? '✓ Linked' : studentBStatus === 'otp_received' ? 'OTP Received' : 'Listening'}
                </span>
              </div>

              {/* Real-time Incoming OTP Notification Box */}
              {receivedOtpReq && receivedOtpReq.status !== 'both_approved' ? (
                <div className="bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-500/40 rounded-2xl p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                      <span className="font-bold text-xs text-white">Incoming Friend Room Request</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">{receivedOtpReq.createdAt}</span>
                  </div>

                  <p className="text-xs text-slate-300">
                    <strong>{receivedOtpReq.senderName}</strong> ({receivedOtpReq.senderRegNo}) has requested to share a 2-Seater room with you in <strong>BH-4 (Room 204)</strong>.
                  </p>

                  {/* Real-time OTP Notification alert */}
                  <div className="bg-indigo-900/50 p-3 rounded-xl border border-indigo-400/30 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Real-Time Delivered OTP:</span>
                      <span className="text-xl font-mono font-black text-amber-300 tracking-widest bg-black/40 px-3 py-1 rounded-lg border border-amber-500/30">
                        {receivedOtpReq.otp}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      * Delivered instantly to Student B&apos;s private session via Socket.IO.
                    </div>
                  </div>

                  {/* OTP Input Form */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold text-slate-300 block">
                      Enter the 6-Digit OTP to Confirm Mutual Consent:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        placeholder="e.g. 482910"
                        className="flex-1 text-sm font-mono tracking-widest p-3 bg-slate-900 border border-slate-700 rounded-xl text-center text-white focus:outline-none focus:border-indigo-400 font-bold"
                      />
                      <button
                        type="button"
                        onClick={handleVerify}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow flex items-center gap-1.5 shrink-0"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm &amp; Link</span>
                      </button>
                    </div>
                  </div>

                  {verifyMessage && (
                    <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                      verifyMessage.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{verifyMessage.text}</span>
                    </div>
                  )}
                </div>
              ) : receivedOtpReq && receivedOtpReq.status === 'both_approved' ? (
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white text-sm">Mutual Room Request Approved &amp; Linked!</h3>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto">
                    Both you and <strong>{studentA.name}</strong> are linked through Allocation Request ID <code className="text-emerald-400 font-mono">{receivedOtpReq.requestId}</code>. The allocation engine will assign you adjacent bed slots in Room 204.
                  </p>
                </div>
              ) : (
                <div className="border border-dashed border-slate-700 rounded-2xl p-8 text-center text-slate-500 space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                  <div className="text-xs font-bold text-slate-400">Waiting for Friend Request</div>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    When Student A submits a room request with Student B&apos;s ID ({studentB.regNo}), the OTP will arrive in real time right here.
                  </p>
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-500 pt-3 border-t border-slate-700 flex items-center justify-between">
              <span>Session: Student B (Listening)</span>
              <span>Channel: student_{studentB.regNo}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

