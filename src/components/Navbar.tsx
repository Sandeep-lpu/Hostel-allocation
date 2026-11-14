'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  Menu, 
  X, 
  Users,
  LogIn,
  LogOut
} from 'lucide-react';
import { getAuthSession, logout, AuthSession } from '@/lib/authStore';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<AuthSession>({ isLoggedIn: false, role: null });

  useEffect(() => {
    setSession(getAuthSession());
    const handleAuthChange = () => setSession(getAuthSession());
    window.addEventListener('lpu_auth_changed', handleAuthChange);
    return () => window.removeEventListener('lpu_auth_changed', handleAuthChange);
  }, [pathname]);

  // Hide Navbar completely on the official LPU UMS Login screen for a 1:1 authentic experience
  if (pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isStudentPortal = pathname?.startsWith('/portal/student');
  const isAdminPortal = pathname?.startsWith('/portal/admin');
  const isFriendDemo = pathname === '/portal/friend-demo';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#e88734] to-[#f37021] flex items-center justify-center text-white shadow-md shadow-orange-500/15 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xl font-black tracking-tight text-[#0f1f38]">LPU</span>
                <span className="text-base font-bold text-[#e88734]">HOSTELS</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-1">
                Lovely Professional University
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-semibold text-slate-600">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-lg transition-colors ${
                pathname === '/' 
                  ? 'text-[#e88734] bg-orange-50/80 font-bold' 
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/#towers" 
              className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Hostel Blocks
            </Link>
            <Link 
              href="/#rooms" 
              className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Room Types &amp; Pricing
            </Link>
            <Link 
              href={session.isLoggedIn ? "/portal/friend-demo" : "/login?redirect=/portal/friend-demo"} 
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                isFriendDemo 
                  ? 'text-indigo-600 bg-indigo-50 font-bold' 
                  : 'hover:text-indigo-600 hover:bg-indigo-50/60 text-slate-600'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Real-Time Friend OTP</span>
            </Link>
          </nav>

          {/* Right Action Portals */}
          <div className="hidden sm:flex items-center gap-2.5">
            
            {/* If Logged In as Student */}
            {session.isLoggedIn && session.role === 'student' && session.student && (
              <div className="flex items-center gap-2.5 bg-orange-50/80 border border-orange-200/80 px-3 py-1.5 rounded-xl">
                <Link href="/portal/student" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-white border border-orange-300">
                    <img 
                      src={session.student.avatar} 
                      alt={session.student.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="text-left leading-tight">
                    <span className="text-[11px] font-bold text-slate-900 block truncate max-w-[110px]">
                      {session.student.name}
                    </span>
                    <span className="text-[9px] text-[#e88734] font-medium block">
                      Reg: {session.student.regNo}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Log Out of Student Account"
                  className="ml-1 text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* If Logged In as Admin */}
            {session.isLoggedIn && session.role === 'admin' && (
              <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl">
                <Link href="/portal/admin" className="flex items-center gap-2 text-xs font-bold hover:text-orange-300">
                  <ShieldCheck className="w-4 h-4 text-[#e88734]" />
                  <span>Chief Warden</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Log Out Admin"
                  className="ml-2 text-slate-400 hover:text-white p-1 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* If NOT Logged In */}
            {!session.isLoggedIn && (
              <div className="flex items-center gap-2">
                <Link
                  href="/login?role=admin&redirect=/portal/admin"
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#e88734]" />
                  <span>Admin</span>
                </Link>

                <Link
                  href="/login?role=student&redirect=/portal/student"
                  className="flex items-center gap-1.5 bg-[#e88734] hover:bg-[#d97726] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm shadow-orange-500/20 hover:shadow transition-all"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Portal</span>
                </Link>

                <Link
                  href="/login"
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#e88734] px-2 py-2 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>UMS Login</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/90 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Home Overview
          </Link>
          <Link
            href="/#towers"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Hostel Blocks (BH-1 to BH-8 &amp; GH)
          </Link>
          <Link
            href="/#rooms"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Room Types &amp; Fees
          </Link>
          <Link
            href={session.isLoggedIn ? "/portal/friend-demo" : "/login?redirect=/portal/friend-demo"}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg"
          >
            Real-Time Friend OTP Demonstration
          </Link>
          
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {session.isLoggedIn ? (
              <>
                {session.role === 'student' && (
                  <Link
                    href="/portal/student"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 bg-[#e88734] text-white py-2.5 rounded-xl font-bold text-xs"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>My Student Portal</span>
                  </Link>
                )}
                {session.role === 'admin' && (
                  <Link
                    href="/portal/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 bg-[#0f1f38] text-white py-2.5 rounded-xl font-semibold text-xs"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#e88734]" />
                    <span>Admin / Warden Console</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 border border-rose-200 text-rose-600 py-2 rounded-xl font-bold text-xs hover:bg-rose-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login?role=student&redirect=/portal/student"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-[#e88734] text-white py-2.5 rounded-xl font-bold text-xs"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student Portal Login</span>
                </Link>
                <Link
                  href="/login?role=admin&redirect=/portal/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-[#0f1f38] text-white py-2.5 rounded-xl font-semibold text-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-[#e88734]" />
                  <span>Admin / Chief Warden Login</span>
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-700 py-2 rounded-xl font-semibold text-xs"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#e88734]" />
                  <span>LPU UMS Login</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
