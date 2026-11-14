import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isBuilt = fs.existsSync(path.join(__dirname, '.next', 'BUILD_ID'));
if (isBuilt && process.env.NODE_ENV !== 'development') {
  process.env.NODE_ENV = 'production';
}
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev, hostname, port, dir: __dirname });
const handle = app.getRequestHandler();

await app.prepare();

const server = createServer(async (req, res) => {
  try {
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  } catch (err) {
    console.error('Error handling request:', req.url, err);
    res.statusCode = 500;
    res.end('internal server error');
  }
});

const io = new Server(server, {
  cors: { origin: '*' }
});

// In-memory active friend OTP requests store
const activeFriendRequests = new Map();

io.on('connection', (socket) => {
  // Join student's private user channel: student_<regNo>
  socket.on('join_student', (regNo) => {
    if (regNo) {
      socket.join(`student_${regNo}`);
      // Push any active pending OTP request for this student
      for (const req of activeFriendRequests.values()) {
        if (req.targetRegNo === regNo && req.status === 'pending_otp' && req.otpExpiresAt > Date.now()) {
          socket.emit('receive_friend_otp', req);
        }
      }
    }
  });

  // Student A sends OTP request to Student B
  socket.on('request_friend_otp', (payload) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const requestId = `FR-REQ-${Date.now().toString().slice(-6)}`;
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    const reqData = {
      requestId,
      senderRegNo: payload.senderRegNo,
      senderName: payload.senderName,
      targetRegNo: payload.targetRegNo,
      targetName: payload.targetName,
      targetHostelId: payload.targetHostelId || 'bh-4',
      targetRoomNumber: payload.targetRoomNumber || '204',
      otp,
      otpExpiresAt: expiresAt,
      attemptsLeft: 3,
      status: 'pending_otp',
      createdAt: new Date().toLocaleTimeString()
    };

    activeFriendRequests.set(requestId, reqData);

    // Private delivery to target student room only
    io.to(`student_${payload.targetRegNo}`).emit('receive_friend_otp', reqData);

    // Confirmation back to sender with demo preview
    socket.emit('friend_otp_sent', {
      requestId,
      targetRegNo: payload.targetRegNo,
      targetName: payload.targetName,
      expiresAt,
      demoOtpPreview: otp
    });
  });

  // Student B verifies OTP
  socket.on('verify_friend_otp', ({ requestId, enteredOtp }) => {
    const req = activeFriendRequests.get(requestId);
    if (!req) {
      socket.emit('otp_verification_result', { success: false, message: 'Friend request not found or expired.' });
      return;
    }

    if (Date.now() > req.otpExpiresAt) {
      req.status = 'rejected';
      socket.emit('otp_verification_result', { success: false, message: 'OTP has expired. Please request a new one.' });
      return;
    }

    if (req.attemptsLeft <= 0) {
      req.status = 'rejected';
      socket.emit('otp_verification_result', { success: false, message: 'Too many incorrect attempts. Request rejected.' });
      return;
    }

    if (enteredOtp && enteredOtp.trim() === req.otp.trim()) {
      req.status = 'both_approved';
      activeFriendRequests.set(requestId, req);

      const successPayload = {
        success: true,
        requestId,
        senderRegNo: req.senderRegNo,
        senderName: req.senderName,
        targetRegNo: req.targetRegNo,
        targetName: req.targetName,
        status: 'both_approved',
        message: 'Mutual Friend Room Verification Successful!'
      };

      // Real-time update delivered to both Student A and Student B private rooms
      io.to(`student_${req.senderRegNo}`).emit('friend_verification_success', successPayload);
      io.to(`student_${req.targetRegNo}`).emit('friend_verification_success', successPayload);
    } else {
      req.attemptsLeft -= 1;
      socket.emit('otp_verification_result', {
        success: false,
        message: `Incorrect OTP. ${req.attemptsLeft} attempt(s) remaining.`
      });
    }
  });
});

function startServer(p) {
  server.listen(p, '127.0.0.1', () => {
    console.log(`> Hostel Allocation server with Socket.IO running on http://localhost:${p}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${p} is in use, trying port ${p + 1}...`);
      startServer(p + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(port);

