'use client';

import { io, Socket } from 'socket.io-client';
import { FriendAllocationRequest } from './types';

let socket: Socket | null = null;
let broadcastChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined') {
  try {
    broadcastChannel = new BroadcastChannel('lpu_friend_otp_channel');
  } catch (e) {
    console.warn('BroadcastChannel not supported', e);
  }
}

export function getSocket(): Socket | null {
  if (typeof window === 'undefined') return null;
  if (!socket) {
    try {
      socket = io({
        autoConnect: true,
        reconnectionAttempts: 5,
        timeout: 3000
      });
    } catch (e) {
      console.warn('Socket.IO connection notice:', e);
    }
  }
  return socket;
}

// In-browser mock storage for active friend request demo
const FRIEND_REQ_STORAGE_KEY = 'lpu_active_friend_requests';

export function getStoredFriendRequests(): FriendAllocationRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FRIEND_REQ_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredFriendRequest(req: FriendAllocationRequest): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getStoredFriendRequests().filter(r => r.requestId !== req.requestId);
    list.unshift(req);
    localStorage.setItem(FRIEND_REQ_STORAGE_KEY, JSON.stringify(list));
    // Broadcast cross-tab
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'SYNC_FRIEND_REQUESTS', request: req });
    }
    window.dispatchEvent(new Event('lpu_friend_requests_updated'));
  } catch (e) {
    console.error(e);
  }
}

export function subscribeToFriendEvents(
  regNo: string,
  callbacks: {
    onReceiveOtp?: (req: FriendAllocationRequest) => void;
    onVerificationSuccess?: (payload: any) => void;
  }
) {
  const sock = getSocket();

  if (sock) {
    sock.emit('join_student', regNo);

    if (callbacks.onReceiveOtp) {
      sock.on('receive_friend_otp', callbacks.onReceiveOtp);
    }
    if (callbacks.onVerificationSuccess) {
      sock.on('friend_verification_success', callbacks.onVerificationSuccess);
    }
  }

  // Cross-tab broadcast listener for robust dual-window simulation
  const handleBroadcast = (event: MessageEvent) => {
    if (!event.data) return;
    if (event.data.type === 'NEW_OTP_REQUEST' && event.data.request.targetRegNo === regNo) {
      callbacks.onReceiveOtp?.(event.data.request);
    }
    if (event.data.type === 'OTP_VERIFIED' && 
       (event.data.payload.senderRegNo === regNo || event.data.payload.targetRegNo === regNo)) {
      callbacks.onVerificationSuccess?.(event.data.payload);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    if (sock) {
      if (callbacks.onReceiveOtp) sock.off('receive_friend_otp', callbacks.onReceiveOtp);
      if (callbacks.onVerificationSuccess) sock.off('friend_verification_success', callbacks.onVerificationSuccess);
    }
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
  };
}

// Trigger friend OTP request
export function sendFriendOtpRequest(payload: {
  senderRegNo: string;
  senderName: string;
  targetRegNo: string;
  targetName: string;
  targetHostelId?: string;
  targetRoomNumber?: string;
  targetSeater?: 1 | 2 | 3;
}): FriendAllocationRequest {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const requestId = `FR-REQ-${Date.now().toString().slice(-6)}`;
  const expiresAt = Date.now() + 5 * 60 * 1000;

  const req: FriendAllocationRequest = {
    requestId,
    senderRegNo: payload.senderRegNo,
    senderName: payload.senderName,
    targetRegNo: payload.targetRegNo,
    targetName: payload.targetName,
    targetHostelId: payload.targetHostelId || 'bh-4',
    targetRoomNumber: payload.targetRoomNumber || '204',
    targetSeater: payload.targetSeater || 2,
    otp,
    otpExpiresAt: expiresAt,
    attemptsLeft: 3,
    status: 'pending_otp',
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  saveStoredFriendRequest(req);

  const sock = getSocket();
  if (sock && sock.connected) {
    sock.emit('request_friend_otp', payload);
  }

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'NEW_OTP_REQUEST', request: req });
  }

  return req;
}

// Verify entered OTP
export function verifyFriendOtp(requestId: string, enteredOtp: string): { success: boolean; message: string } {
  const requests = getStoredFriendRequests();
  const req = requests.find(r => r.requestId === requestId);

  if (!req) {
    return { success: false, message: 'Friend allocation request expired or not found.' };
  }

  if (Date.now() > req.otpExpiresAt) {
    req.status = 'rejected';
    saveStoredFriendRequest(req);
    return { success: false, message: 'OTP has expired. Please initiate a new request.' };
  }

  if (enteredOtp.trim() === req.otp.trim()) {
    req.status = 'both_approved';
    saveStoredFriendRequest(req);

    const sock = getSocket();
    if (sock && sock.connected) {
      sock.emit('verify_friend_otp', { requestId, enteredOtp });
    }

    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'OTP_VERIFIED',
        payload: {
          success: true,
          requestId,
          senderRegNo: req.senderRegNo,
          targetRegNo: req.targetRegNo,
          status: 'both_approved'
        }
      });
    }

    return { success: true, message: 'Mutual friend request approved & linked!' };
  } else {
    req.attemptsLeft -= 1;
    saveStoredFriendRequest(req);
    return {
      success: false,
      message: `Incorrect OTP. ${Math.max(0, req.attemptsLeft)} attempt(s) remaining.`
    };
  }
}

