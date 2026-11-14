'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Mail, Phone, MapPin, Heart, Shield } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  if (pathname === '/login') {
    return null;
  }

  return (
    <footer className="bg-[#0f1f38] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#f37021] flex items-center justify-center text-white">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                LPU <span className="text-[#f37021]">RESIDENCES</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Lovely Professional University residential infrastructure houses over 25,000+ students from 50+ countries with world-class facilities and safety.
            </p>
            <div className="pt-2 text-xs text-slate-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#f37021]" />
              <span>ISO 9001:2015 Certified Campus Housing</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="text-white text-base font-bold tracking-wide uppercase">Quick Portals</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/portal/student" className="hover:text-[#f37021] transition-colors">
                  Student Room Booking &amp; Status
                </Link>
              </li>
              <li>
                <Link href="/portal/admin" className="hover:text-[#f37021] transition-colors">
                  Warden &amp; Admin Allocation Engine
                </Link>
              </li>
              <li>
                <Link href="/#workflow" className="hover:text-[#f37021] transition-colors">
                  Allocation Rules &amp; Policies
                </Link>
              </li>
              <li>
                <Link href="/#rooms" className="hover:text-[#f37021] transition-colors">
                  Fee Schedule &amp; Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/#amenities" className="hover:text-[#f37021] transition-colors">
                  Mess &amp; Dining Hall Menus
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-white text-base font-bold tracking-wide uppercase">Hostel Complexes</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Boys Hostel Towers: BH-1, BH-2, BH-3, BH-4, BH-5, BH-6, BH-7, BH-8</li>
              <li>Girls Hostel Towers: GH-1, GH-2, GH-3, GH-4, GH-5, GH-6</li>
              <li>Executive International Scholar Suites</li>
              <li>Day Care &amp; Guest Suites</li>
              <li>24/7 Uni-Hospital &amp; Ambulance Link</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="text-white text-base font-bold tracking-wide uppercase">Contact &amp; Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2.5 text-slate-400">
                <MapPin className="w-4 h-4 text-[#f37021] shrink-0 mt-0.5" />
                <span>Jalandhar - Delhi G.T. Road, Phagwara, Punjab (India) - 144411</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400">
                <Phone className="w-4 h-4 text-[#f37021] shrink-0" />
                <span>+91-1824-517000 / 404404</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400">
                <Mail className="w-4 h-4 text-[#f37021] shrink-0" />
                <span>hostelallocation@lpu.co.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Lovely Professional University. All Rights Reserved.</p>
          <p className="flex items-center gap-1">
            Built for Automated &amp; Transparent Hostel Management
          </p>
        </div>
      </div>
    </footer>
  );
}

