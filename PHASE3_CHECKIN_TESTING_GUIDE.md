# Phase 3 & 4: Public Check-In System - Testing Guide

## ✅ Implementation Complete

### Backend Features
1. **Public Check-In API** (`/api/public/exam/*`)
   - ✅ POST `/validate-qr` - Validates QR token format and returns exam details
   - ✅ POST `/check-in` - Processes student check-in with validation
   - ✅ GET `/session/:sessionId` - Public session details
   - ✅ GET `/session/:sessionId/stats` - Real-time check-in statistics
   - ✅ Rate limiting: 30 validations/min, 10 check-ins per 15min

2. **QR Token System** (`utils/examTokens.ts`)
   - ✅ Format: `EXAM-{COURSECODE}-S{studentId}-E{examEntryId}-R{registrationId}-{timestamp}-{hash}`
   - ✅ Token validation with hash verification
   - ✅ 24-hour expiry support (optional)

3. **WebSocket Real-time Events**
   - ✅ `STUDENT_CHECKED_IN` - Emitted when student checks in
   - ✅ `CHECKIN_STATS_UPDATED` - Emitted with updated attendance stats
   - ✅ Events broadcast to institution room
   - ✅ Includes student info, exam details, seat number, timestamp

### Frontend Features
1. **Public Check-In Page** (`/exam/check-in`)
   - ✅ QR scanner using `html5-qrcode` library
   - ✅ Camera control (start/stop)
   - ✅ Real-time validation display
   - ✅ Check-in confirmation screen
   - ✅ Mobile-responsive design
   - ✅ Instructions for users

2. **Dashboard Live Updates** (Exams Officer)
   - ✅ `CheckInActivityFeed` component
   - ✅ Real-time check-in notifications
   - ✅ Student avatars and info
   - ✅ Attendance statistics per exam
   - ✅ Auto-scrolling feed (max 50 events)
   - ✅ Live connection indicator

## 🧪 Testing Checklist

### 1. Database Setup
```bash
cd backend
npm run seed  # Ensure test data exists
```

**Verify:**
- [ ] Active exam timetable exists
- [ ] Exam sessions with registrations
- [ ] QR codes generated for students

### 2. Backend Testing

#### Start Backend Server
```bash
cd backend
npm run dev
```

**Expected Output:**
```
✅ Real-time service initialized
✅ Server running on port 3000
✅ WebSocket server ready
```

#### Test Endpoints (using Postman/curl)

**A. Validate QR Code**
```bash
POST http://localhost:3000/api/public/exam/validate-qr
Content-Type: application/json

{
  "qrCode": "EXAM-CS101-S1-E5-R12-1732377600000-a1b2c3"
}
```

**Expected Response:**
```json
{
  "valid": true,
  "data": {
    "examRegistrationId": 12,
    "studentId": 1,
    "examEntryId": 5,
    "student": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe"
    },
    "exam": {
      "courseCode": "CS101",
      "courseName": "Introduction to Programming",
      "examDate": "2024-11-23T00:00:00.000Z",
      "startTime": "09:00",
      "endTime": "11:00",
      "venue": "Room A101"
    },
    "canCheckIn": true,
    "alreadyCheckedIn": false,
    "checkInWindow": {
      "opens": "2024-11-23T08:30:00.000Z",
      "closes": "2024-11-23T11:00:00.000Z",
      "isOpen": true
    }
  }
}
```

**B. Check In Student**
```bash
POST http://localhost:3000/api/public/exam/check-in
Content-Type: application/json

{
  "qrCode": "EXAM-CS101-S1-E5-R12-1732377600000-a1b2c3"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "verificationId": 1,
    "timestamp": "2024-11-23T09:15:00.000Z",
    "student": {
      "studentNumber": "2024001",
      "name": "John Doe"
    },
    "exam": {
      "courseCode": "CS101",
      "courseName": "Introduction to Programming",
      "venue": "Room A101"
    }
  }
}
```

**C. Get Session Stats**
```bash
GET http://localhost:3000/api/public/exam/session/5/stats
```

**Expected Response:**
```json
{
  "expected": 30,
  "checkedIn": 1,
  "pending": 29,
  "attendanceRate": 3.3,
  "invigilators": 2
}
```

#### Test Rate Limiting

**Validation Rate Limit (30/min):**
```bash
# Run 31 validation requests within 1 minute
# Expected: 31st request returns 429 Too Many Requests
```

**Check-In Rate Limit (10 per 15min):**
```bash
# Run 11 check-in requests within 15 minutes
# Expected: 11th request returns 429 Too Many Requests
```

### 3. Frontend Testing

#### Start Frontend Server
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v7.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

#### A. Public Check-In Page

1. **Navigate to:** `http://localhost:5173/exam/check-in`

2. **Test Camera Access:**
   - [ ] Click "Start Camera"
   - [ ] Verify camera activates
   - [ ] Check camera permission prompt appears
   - [ ] Camera feed displays in scanner area

3. **Test QR Scanning:**
   - [ ] Generate test QR code (from database seed)
   - [ ] Position QR code in camera view
   - [ ] Verify automatic detection
   - [ ] Check validation info displays
   - [ ] Confirm auto check-in proceeds

4. **Test Check-In Success:**
   - [ ] Success card displays with green checkmark
   - [ ] Student name shows correctly
   - [ ] Course and venue info accurate
   - [ ] Timestamp displays correctly
   - [ ] Instructions shown for next steps

5. **Test Error States:**
   - [ ] Invalid QR code shows error
   - [ ] Duplicate check-in prevented
   - [ ] Outside check-in window shows message
   - [ ] Camera permission denied handled

#### B. Dashboard Live Updates

1. **Login as Exams Officer**
   - Navigate to: `http://localhost:5173/login`
   - Use exams officer credentials

2. **Open Dashboard**
   - Navigate to: `http://localhost:5173/exams-officer`
   - Check connection status shows "Live" badge

3. **Open Live Check-Ins Tab**
   - [ ] Click "Live Check-Ins" tab
   - [ ] Verify feed component renders
   - [ ] Check "Live" indicator with green pulse

4. **Test Real-Time Updates**
   - [ ] Open `/exam/check-in` in another tab/device
   - [ ] Scan QR code to check in
   - [ ] Verify notification appears in feed within 1 second
   - [ ] Check student avatar displays
   - [ ] Verify all info accurate (name, course, venue, seat)
   - [ ] Confirm attendance stats update

5. **Test Feed Behavior**
   - [ ] Check multiple check-ins appear
   - [ ] Verify chronological order (newest first)
   - [ ] Check scroll functionality
   - [ ] Verify max 50 events retained
   - [ ] Check timestamps with "X minutes ago" format

### 4. WebSocket Testing

#### Using Browser DevTools

1. **Open Network Tab**
   - Filter: WS (WebSocket)
   - Verify connection established
   - Check authentication message

2. **Monitor Messages**
   - Perform check-in
   - Watch for messages:
     - `exam:checkin` with event `student:checked-in`
     - `exam:checkin` with event `checkin:stats:updated`

3. **Verify Payload**
```json
{
  "channel": "exam:checkin",
  "event": "student:checked-in",
  "payload": {
    "verificationId": 1,
    "examEntryId": 5,
    "studentId": 1,
    "student": {
      "studentNumber": "2024001",
      "firstName": "John",
      "lastName": "Doe"
    },
    "exam": {
      "courseCode": "CS101",
      "courseName": "Introduction to Programming",
      "examDate": "2024-11-23T00:00:00.000Z",
      "startTime": "09:00",
      "venue": "Room A101"
    },
    "seatNumber": "A-15",
    "checkedInAt": "2024-11-23T09:15:00.000Z",
    "method": "QR_CODE"
  },
  "timestamp": "2024-11-23T09:15:00.000Z",
  "institutionId": 1
}
```

### 5. Security Testing

#### A. Authentication
- [ ] Public endpoints accessible without token
- [ ] Dashboard requires authentication
- [ ] WebSocket connection requires valid token

#### B. Rate Limiting
- [ ] Validation endpoint limited to 30/min
- [ ] Check-in endpoint limited to 10 per 15min
- [ ] Different IPs have independent limits

#### C. Check-In Window
- [ ] Cannot check in >30 min before start
- [ ] Cannot check in after exam end
- [ ] Error messages clear and helpful

#### D. Duplicate Prevention
- [ ] Second check-in attempt fails
- [ ] Clear error message provided
- [ ] Database prevents duplicate verifications

### 6. Performance Testing

#### A. Database Queries
- [ ] Check-in completes in <500ms
- [ ] Transaction rollback on error
- [ ] Concurrent check-ins handled

#### B. WebSocket Broadcasting
- [ ] Events reach dashboard <1 second
- [ ] Multiple connections supported
- [ ] No memory leaks with long sessions

#### C. QR Scanner
- [ ] Camera frame rate acceptable (10 FPS)
- [ ] QR detection within 2 seconds
- [ ] Mobile performance acceptable

### 7. Integration Testing

#### End-to-End Flow
1. [ ] Admin seeds exam data
2. [ ] Students receive QR codes
3. [ ] Students navigate to check-in page
4. [ ] Students scan QR codes
5. [ ] Check-ins recorded in database
6. [ ] Dashboard shows live updates
7. [ ] Statistics update correctly
8. [ ] Audit logs created

#### Cross-Device Testing
- [ ] Desktop browser (Chrome, Firefox, Edge)
- [ ] Mobile browser (iOS Safari, Android Chrome)
- [ ] Tablet browser
- [ ] Different network conditions

## 🐛 Known Issues & Limitations

1. **QR Code Format:** Uses simple hash (production should use HMAC-SHA256)
2. **Camera Permissions:** Requires HTTPS in production
3. **Browser Support:** Requires modern browser with WebRTC
4. **Rate Limiting:** IP-based (can be bypassed with VPN)

## 📊 Success Criteria

✅ All endpoints return correct responses
✅ QR scanning works on mobile and desktop
✅ Real-time updates appear within 1 second
✅ Rate limiting prevents abuse
✅ Check-in window enforced correctly
✅ Duplicate check-ins prevented
✅ All transactions atomic (rollback on error)
✅ WebSocket reconnection handled gracefully
✅ UI responsive and user-friendly
✅ Error messages clear and helpful

## 🚀 Next Steps

After successful testing:
1. Deploy to staging environment
2. Load testing with multiple concurrent users
3. Security audit
4. User acceptance testing
5. Production deployment

## 📝 Test Results Template

```
Test Date: ___________
Tester: ___________

Backend Tests:
- [ ] API endpoints working
- [ ] Rate limiting functional
- [ ] WebSocket events emitted
- [ ] Database transactions correct

Frontend Tests:
- [ ] QR scanner working
- [ ] Check-in flow complete
- [ ] Dashboard updates live
- [ ] Mobile responsive

Integration Tests:
- [ ] End-to-end flow successful
- [ ] Cross-device compatible
- [ ] Performance acceptable

Issues Found:
1. _______________________
2. _______________________
3. _______________________

Notes:
_______________________
_______________________
```
