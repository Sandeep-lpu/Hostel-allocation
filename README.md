# 🏨 LPU Smart Hostel Allocation & Management System

> **Lovely Professional University (LPU) - Residential Housing & Bed Allocation Portal**  
> A full-stack, AI-assisted, and multi-constraint hostel management and bed allocation system built with Next.js 15, TypeScript, Tailwind CSS, Supabase backend support, and Socket.IO real-time verification.

---

## 🌟 Key Features

### 1. 🎓 Student Profile & Eligibility (Official LPU UMS Replica)
- **Authentic Campus Branding:** Red-brick campus panorama banner, student identification, section, and program details.
- **Academic & Attendance Gauges:** Donut circular progress gauges for **CGPA (7.93)** and **Attendance (82%)** with cutoff validations.
- **Accommodation & Facility Preferences:** 
  - Room Occupancy: One Seater, Two Seater, Three Seater.
  - Accommodation Structure: With Apartment vs. Without Apartment.
  - Facility Add-ons: Laundry Facility, Gym Access, Wi-Fi, Mess Catering, Air Conditioning.

### 2. 🛏️ Three Room Allocation Modes
- **Option 1: Random Room Allocation:** Multi-constraint engine automatically matches students based on room availability, gender wings, room capacity, and **8-Dimension Lifestyle Compatibility** (0–100% harmony score).
- **Option 2: Manual Room Selection:** Interactive visual tower selector (**BH-1** to **BH-4**, **GH-1**, **GH-2**), floor selector, and vacant/occupied room grid allowing students to pick specific available rooms and beds.
- **Option 3: Friend-Based Room Allocation (Real-Time Socket.IO OTP):** Mutual friend allocation workflow with instant demo OTP delivery via private Socket.IO channels (`student_<regNo>`) and instant approval locking.

### 3. 💳 Fake Payment Gateway & Official Slip Gating
- **Fee Calculation:** Dynamic fee breakdown based on occupancy tier, apartment surcharge, and security deposit.
- **Payment Gateway Simulation:** Interactive payment desk with UPI/QR scanning, Debit/Credit Card, and Net Banking options.
- **Official Allotment Slip:** Gated behind fee clearance. Upon payment, the slip updates from *Provisional (Unpaid)* to *Confirmed & Fully Paid*, unlocking clean printable PDF downloads.

### 4. 🔄 Post-Allocation Room Change Requests
- Formal room change submission with categorized reasons (Medical, Roommate Conflict, Academic Routine, Fee Bracket) tracked in real-time.

### 5. 🛡️ Chief Warden & Admin Console (`/portal/admin`)
- **Central Allocation Engine:** 1-click batch multi-constraint allocation algorithm across all 101 registered university students.
- **Warden Review & Overrides:** Audit-backed manual room reassignment and review.
- **Hostel Inventory Manager:** Floor-wise room management with "Add Room" modal, bed capacity, and real-time vacancy stats.
- **Room Change Desk & Prioritized Waitlist:** Review student transfer petitions and manage unallocated waitlist priorities.

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/Sandeep-lpu/Hostel-allocation.git
cd Hostel-allocation

# Install dependencies
npm install

# Start development server with Socket.IO support
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demo Accounts

| Role | Username / Reg No | Password | Description |
| :--- | :--- | :--- | :--- |
| **Student** | `12400000` | Any (e.g. `123456`) | Sandeep Kumar (B.Tech CSE, 7.93 CGPA) |
| **Student** | `12400003` | Any (e.g. `123456`) | Rohan Mehra (Friend OTP target) |
| **Admin** | `warden_chief` | `admin@123` | Chief Warden & Residential Housing Desk |

*(100 additional pre-registered student accounts `12400001`–`12400100` are available in the 1-click account selector on the login screen).*

---

## 📦 Deployment

### Deploying to Vercel
1. Push this repository to your GitHub account.
2. Import the project into [Vercel](https://vercel.com).
3. Set the environment variables from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**.

### Self-Hosted / Docker / VPS
```bash
npm run build
npm run start
```
*Runs the HTTP server with Socket.IO enabled on port 3000.*

---

## 🗄️ Database Setup (Supabase)
Execute `supabase_schema.sql` and `supabase_seed_100_students.sql` in your Supabase SQL Editor to mirror all 101 student profiles and hostel towers in live Postgres tables.

---

## 📄 License
MIT © Lovely Professional University Student Housing Project.
