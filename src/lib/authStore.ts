'use client';

import { PRIMARY_STUDENT, REGISTERED_STUDENTS, RegisteredStudent } from './studentsData';

const AUTH_STORAGE_KEY = 'lpu_hostel_auth_session';

export type UserRole = 'student' | 'admin' | null;

export interface AuthSession {
  isLoggedIn: boolean;
  role: UserRole;
  student?: RegisteredStudent | null;
  adminUsername?: string | null;
  adminName?: string | null;
  loginTime?: string;
}

const DEFAULT_SESSION: AuthSession = {
  isLoggedIn: false,
  role: null,
  student: null,
  adminUsername: null,
  adminName: null
};

export function getAuthSession(): AuthSession {
  if (typeof window === 'undefined') return DEFAULT_SESSION;
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      const parsed: AuthSession = JSON.parse(saved);
      // Validate student reference if student role
      if (parsed.role === 'student' && parsed.student?.regNo) {
        const fresh = REGISTERED_STUDENTS.find(s => s.regNo === parsed.student?.regNo);
        if (fresh) {
          parsed.student = fresh;
        }
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error reading auth store', e);
  }
  return DEFAULT_SESSION;
}

export function saveAuthSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event('lpu_auth_changed'));
  } catch (e) {
    console.error('Error saving auth store', e);
  }
}

export function loginStudent(student: RegisteredStudent): AuthSession {
  const session: AuthSession = {
    isLoggedIn: true,
    role: 'student',
    student,
    adminUsername: null,
    adminName: null,
    loginTime: new Date().toISOString()
  };
  saveAuthSession(session);
  return session;
}

export function loginAdmin(username: string = 'warden_chief', displayName: string = 'Chief Warden Office'): AuthSession {
  const session: AuthSession = {
    isLoggedIn: true,
    role: 'admin',
    student: null,
    adminUsername: username,
    adminName: displayName,
    loginTime: new Date().toISOString()
  };
  saveAuthSession(session);
  return session;
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new Event('lpu_auth_changed'));
  } catch (e) {
    console.error('Error logging out', e);
  }
}

export function getCurrentStudent(): RegisteredStudent {
  const session = getAuthSession();
  if (session.isLoggedIn && session.role === 'student' && session.student) {
    return session.student;
  }
  // Fallback to primary student for initial hydration
  return PRIMARY_STUDENT;
}

export function setCurrentStudent(student: RegisteredStudent): void {
  loginStudent(student);
}
