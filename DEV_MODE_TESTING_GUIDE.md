# Development Mode Testing Guide

## Overview
This guide explains how to test real-time exam logistics features without being constrained by actual dates.

## Why This Was Needed
Previously, the logistics dashboard only showed exams happening **today**. Your seed data has exams from December 2024, which wouldn't appear on a November 2025 dashboard. This made testing real-time features impossible without constantly updating test data.

## What Changed

### 1. **Development Mode Flag** (`DEV_IGNORE_EXAM_DATES=true`)
- **Location**: `backend/.env`
- **Purpose**: Disables date filtering for exam logistics queries
- **Behavior**:
  - When `true`: Shows **all** published exam entries regardless of date
  - When `false` (production): Only shows exams for the specified date

### 2. **Timetable-Based Filtering**
Instead of filtering by date, you can now select a specific timetable to view its logistics data.

**Backend Changes:**
- `examLogisticsService.getInstitutionLogisticsDashboard()` now accepts:
  ```typescript
  options?: {
    date?: Date;        // For production date filtering
    timetableId?: number; // For timetable-specific view
  }
  ```
- Logic:
  1. If `timetableId` provided → filter by timetable (ignores date)
  2. If no `timetableId` and `DEV_IGNORE_EXAM_DATES=false` → filter by date
  3. If no `timetableId` and `DEV_IGNORE_EXAM_DATES=true` → show all published exams

**Frontend Changes:**
- Added **timetable selector dropdown** to logistics dashboard
- Fetches all published timetables on load
- Auto-selects most recent timetable
- Updates dashboard when selection changes

### 3. **Real-Time Events**
- WebSocket events already broadcast at institution level
- Works automatically with any timetable/date filter
- No changes needed - events are received regardless of frontend filtering

## How to Test Real-Time Features

### Step 1: Enable Development Mode
Ensure `backend/.env` has:
```env
DEV_IGNORE_EXAM_DATES=true
```

### Step 2: Start Both Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 3: Access Logistics Dashboard
1. Login as institution admin (admin@tughana.edu.gh)
2. Navigate to **Exam Logistics Dashboard**
3. Use the timetable selector to choose your test timetable
4. You'll now see logistics data for that timetable's exams

### Step 4: Trigger Real-Time Events
Open multiple browser tabs/windows and perform actions:

**Student Check-In:**
```bash
# API call to mark student attendance
POST /api/exam-logistics/check-in
{
  "examEntryId": 1,
  "studentId": 1,
  "verificationMethod": "ID_CARD"
}
```

**Invigilator Assignment:**
```bash
POST /api/exam-logistics/assign-invigilator
{
  "examEntryId": 1,
  "staffId": 1,
  "role": "CHIEF"
}
```

**Script Submission:**
```bash
POST /api/exam-logistics/submit-script
{
  "examEntryId": 1,
  "studentId": 1,
  "submittedBy": 1
}
```

All connected dashboards will update in real-time!

## Testing Scenarios

### Scenario 1: Past Timetables
- Select an **archived** timetable (December 2024)
- View historical logistics data
- Metrics show final counts (no active sessions)

### Scenario 2: Current Timetables
- Select a **published** timetable
- Simulate real-time operations:
  - Student check-ins
  - Script submissions
  - Incident reports
- Watch metrics update across all connected dashboards

### Scenario 3: Future Timetables
- Select a newly created timetable with no exams yet
- Dashboard shows zeros (expected - no data)
- Add exam entries → see metrics populate

## Production Behavior

When `DEV_IGNORE_EXAM_DATES=false` or not set:
- Dashboard filters by **date only** (default: today)
- Only shows exams scheduled for that specific date
- Timetable selector still works if provided
- Normal production behavior for day-of-exam monitoring

## API Endpoints

### Get Dashboard with Timetable Filter
```bash
GET /api/exam-logistics/institution-dashboard?timetableId=1
```

### Get Dashboard with Date Filter
```bash
GET /api/exam-logistics/institution-dashboard?date=2024-12-10
```

### Get Dashboard (All Exams in Dev Mode)
```bash
GET /api/exam-logistics/institution-dashboard
# Returns all published exams when DEV_IGNORE_EXAM_DATES=true
```

## Troubleshooting

### Dashboard Shows Zeros
1. Check if timetable has published entries
2. Verify ExamLogistics records exist (run backfill script if needed)
3. Ensure `DEV_IGNORE_EXAM_DATES=true` in backend/.env
4. Check backend logs for query errors

### Real-Time Updates Not Working
1. Verify WebSocket connection (check browser console)
2. Ensure backend server is running
3. Check that operations emit events (look for `examLogisticsRealtimeService.broadcast...`)
4. Verify user is in correct institution room

### Timetable Selector Empty
1. Ensure you have published timetables
2. Check API endpoint: `GET /api/exam-timetables?status=PUBLISHED`
3. Login as correct institution admin

## Seed Data Reference

**TU-GH Institution:**
- Timetable ID: 1 (December 2024 - First Semester Finals)
- 6 exam entries with dates: 2024-12-10, 2024-12-11, 2024-12-12
- ExamLogistics records backfilled with test data

**Test Users:**
- Admin: `admin@tughana.edu.gh` / `Password123!`
- Lecturer: `k.asante@tughana.edu.gh` / `Password123!`
- Student: `20240001@tughana.edu.gh` / `Password123!`

## Summary

With these changes, you can now:
✅ Test real-time features without date constraints
✅ View logistics for any timetable (past, present, future)
✅ Simulate exam day operations with old test data
✅ Develop and debug without constantly updating dates
✅ Switch between timetables to compare metrics

**Remember**: Set `DEV_IGNORE_EXAM_DATES=false` for production deployments!
