# 🎓 ELMS Script Management System - Refined Design

## 📋 Executive Summary

The ELMS Script Management System implements a sophisticated two-tier script tracking architecture designed for educational institutions. The system manages individual student scripts within logical and physical batch groupings, utilizing QR code technology for efficient tracking and status management.

## 🏗️ System Architecture

### Core Components

#### 1. **Student ID System**

- **QR Code Content**: Student index number only
- **Format**: `{ProgramPrefix}/{ProgramInitials}/{Year}/{SequentialNumber}`
- **Example**: `BT/ITN/24/001`
- **Purpose**: Student identification and script submission trigger

#### 2. **Script Types**

##### **Single Scripts** (Individual Student Level)

- **Purpose**: Track individual student participation
- **Status Flow**: `GENERATED → DISTRIBUTED → SUBMITTED | NOT_PRESENT`
- **Physical Form**: Individual student answer sheets
- **Tracking**: Within batch context

##### **Batch Scripts** (Exam/Course Level)

- **Purpose**: Physical movement tracking and logistics
- **Status Flow**: `GENERATED → DISTRIBUTED → COMPLETED`
- **Physical Form**: Brown envelopes containing multiple scripts
- **QR Code**: Contains course code for batch identification
- **Movement**: Primary unit for physical transport

#### 3. **Automatic Status Management**

- **Time-Based Updates**: System automatically updates statuses based on exam timing
- **Distribution**: 30 minutes after exam start time
- **Completion**: At exam end time
- **Absence Handling**: Scripts not submitted marked as `NOT_PRESENT`

## 🔄 Complete System Flow

### Phase 1: Pre-Exam Setup

```
Admin → Creates Timetable
    ↓
Timetable Contains:
├── Course Details
├── Program Information
├── Venue & Room Assignments
├── Exam Timing (Start/End)
└── Student Lists (from registrations)

System → Auto-Generates Scripts
    ↓
Single Scripts: One per registered student
Batch Scripts: One per course/exam session
```

### Phase 2: Exam Day Automation

```
Exam Start Time (e.g., 7:30 AM)
    ↓
System Waits 30 Minutes
    ↓
Automatic Status Update:
├── Batch Status: DISTRIBUTED
└── Single Scripts: DISTRIBUTED
```

### Phase 3: Script Submission Process

```
Student → Brings Script + Student ID Card
    ↓
Invigilator → Opens Mobile App
    ↓
Scans Student ID QR Code
    ↓
Mobile App → Extracts Index Number
    ↓
Sends to Backend: { indexNumber, timestamp, invigilatorId }
    ↓
Backend Processing:
├── Identifies Student → Exam → Script
├── Updates Single Script Status: SUBMITTED
├── Records Submission Timestamp
└── Student Can Leave
```

### Phase 4: Exam Completion

```
Exam End Time Elapses
    ↓
System Automatic Actions:
├── Updates Batch Status: COMPLETED
├── Identifies Submitted Scripts
├── Marks Unsubmitted as: NOT_PRESENT
└── Batch Ready for Movement
```

### Phase 5: Post-Exam Processing

```
Batch Scripts Move Physically:
├── Exam Center → Processing Point A
├── Processing Point A → Processing Point B
└── Processing Point B → Grading Center

Movement Tracking:
├── Handler Scans Batch QR Code
├── Records Movement: From → To
├── Updates Location History
└── Maintains Chain of Custody
```

## 📊 Data Models

### Student Index Number Format

```typescript
interface StudentIndexNumber {
  programPrefix: string; // "BT" for BTech
  programInitials: string; // "ITN" for Information Technology Networking
  year: string; // "24" for 2024
  sequence: string; // "001", "002", etc.
  format: "{prefix}/{initials}/{year}/{sequence}";
}
```

### Script Status Enums

#### Single Script Status

```typescript
enum SingleScriptStatus {
  GENERATED = "generated", // Script created
  DISTRIBUTED = "distributed", // Available for exam
  SUBMITTED = "submitted", // Student submitted script
  NOT_PRESENT = "not_present", // Student absent/didn't submit
}
```

#### Batch Script Status

```typescript
enum BatchScriptStatus {
  GENERATED = "generated", // Batch created
  DISTRIBUTED = "distributed", // Distributed to exam venues
  COMPLETED = "completed", // Exam finished, ready for movement
}
```

### QR Code Specifications

#### Student ID QR Code

- **Content**: Student index number only
- **Format**: `BT/ITN/24/001`
- **Purpose**: Trigger script submission
- **Location**: Student ID cards

#### Batch QR Code

- **Content**: Course code + batch identifier
- **Format**: `{CourseCode}-{BatchId}`
- **Example**: `MATH101-BATCH001`
- **Purpose**: Track batch movements
- **Location**: Brown envelope labels

## 🎯 Key System Behaviors

### 1. **Multiple Exams Per Day**

```
Student has Morning + Afternoon Exams:
├── Morning Exam: 7:30 AM - 10:30 AM
├── Afternoon Exam: 1:00 PM - 4:00 PM
└── System differentiates by:
    ├── Exam start/end times
    ├── Submission timestamps
    └── Course associations
```

### 2. **Venue & Room Assignment**

```
Timetable-Driven Assignment:
├── Admin specifies venue/room per course
├── System accepts assignment as-is
├── No automatic room optimization
└── Human logistics handle conflicts
```

### 3. **Batch Movement Handshake**

```
Handler A → Handler B Transfer:
├── Handler A: Prepares batch envelope
├── Handler B: Scans batch QR code
├── System: Records movement
│   ├── From: Handler A location
│   ├── To: Handler B location
│   ├── Timestamp
│   └── Handler IDs
└── Chain of custody maintained
```

### 4. **Missing Batch Recovery**

```
Batch Reported Missing:
├── System scans batch QR code history
├── Identifies last known location
├── Traces movement path
└── Returns to appropriate handler
```

## 🔌 API Design

### Mobile App Integration

#### Student Submission API

```typescript
POST /api/scripts/submit
{
  indexNumber: "BT/ITN/24/001",
  timestamp: "2025-09-21T09:45:00Z",
  invigilatorId: "uuid",
  location: "Main Hall - Room 101"
}
```

#### Batch Movement API

```typescript
POST /api/batches/{batchId}/move
{
  fromHandlerId: "uuid",
  toHandlerId: "uuid",
  fromLocation: "Exam Center",
  toLocation: "Processing Point A",
  timestamp: "2025-09-21T11:00:00Z"
}
```

### Automatic Status Updates

#### Time-Based Triggers

```typescript
// Exam start + 30 minutes
System → Update Batch Status: DISTRIBUTED

// Exam end time
System → Update Batch Status: COMPLETED
System → Mark unsubmitted scripts: NOT_PRESENT
```

## 📱 Mobile App Requirements

### Core Features

1. **QR Code Scanning**: Student ID cards
2. **Offline Capability**: Store submissions, sync when online
3. **Real-time Sync**: Immediate backend updates
4. **Location Awareness**: GPS for venue verification
5. **Batch Scanning**: For movement tracking

### User Roles in Mobile App

- **Invigilators**: Scan student submissions
- **Script Handlers**: Scan batch movements
- **Supervisors**: Monitor real-time status

## 🔄 System Integration Points

### With Existing ELMS Components

- **Timetable System**: Source of exam schedules and assignments
- **Student Registration**: Source of enrolled students
- **Venue Management**: Room capacity and availability
- **User Management**: Roles and permissions
- **Incident Management**: Handle missing scripts/batches

### External Integrations

- **SMS Notifications**: Alert handlers of batch movements
- **Email System**: Status reports and alerts
- **Audit System**: Complete chain of custody logs

## 🎯 Implementation Priorities

### Phase 1: Core Script Management

1. Student index number system
2. Single script generation and tracking
3. Batch script creation and grouping
4. Basic status management

### Phase 2: Mobile Integration

1. Student submission API
2. QR code scanning endpoints
3. Offline data synchronization
4. Real-time status updates

### Phase 3: Automation & Movement

1. Time-based automatic updates
2. Batch movement tracking
3. Handler-to-handler handoffs
4. Missing item recovery

### Phase 4: Advanced Features

1. Analytics and reporting
2. Incident integration
3. Performance optimization
4. Mobile app full implementation

## 📋 Success Metrics

### Operational Efficiency

- **Submission Time**: < 5 seconds per student
- **Batch Movement**: < 10 seconds per transfer
- **Status Accuracy**: 100% automated updates
- **Error Rate**: < 0.1% submission errors

### System Reliability

- **Uptime**: 99.9% availability
- **Data Integrity**: 100% audit trail
- **Recovery Time**: < 5 minutes for issues
- **Concurrent Users**: Support 1000+ simultaneous submissions

---

## 🚀 Next Steps

1. **Delete Current Implementation**: Remove existing script management code
2. **Implement Core Data Models**: Student index numbers, script types
3. **Build Single Script System**: Basic CRUD and status management
4. **Implement Batch System**: Grouping and QR code generation
5. **Add Time-Based Automation**: Automatic status updates
6. **Mobile API Development**: Submission and scanning endpoints
7. **Testing & Validation**: End-to-end flow testing

---

_This document serves as the blueprint for the ELMS Script Management System implementation. All development should align with these specifications._</content>
<parameter name="filePath">SCRIPT_MANAGEMENT_README.md
