# Testing the Student Registration System

## Quick Start Guide

### Prerequisites

1. **Backend server running**: `cd backend && npm run dev`
2. **Frontend server running**: `cd frontend && npm run dev`
3. **Database setup**: Institutions, programs, and academic years configured

---

## Testing Flow

### Step 1: Configure Student ID Generation (Admin)

**As an Institution Admin:**

1. Login to the admin dashboard
2. Navigate to: Student ID Configuration (add route to sidebar if needed)
3. Configure ID generation:
   - **Format**: Choose Sequential, Academic Year, or Custom
   - **Prefix**: e.g., "0721" for HND IT or "BT" for Degree
   - **Separator**: "/" for formatted IDs
   - **Padding**: Number of digits (e.g., 6)
   - **Academic Year**: Toggle ON for year-based IDs
   - **Start Number**: Initial sequence (default: 1)
4. Preview the ID format
5. Save configuration

**Example Configurations:**

```json
// HND IT - Sequential Format
{
  "format": "SEQUENTIAL",
  "prefix": "0721",
  "paddingLength": 6,
  "startNumber": 1
}
// Generates: 0721000001, 0721000002, etc.

// Degree - Academic Year Format
{
  "format": "ACADEMIC_YEAR",
  "prefix": "BT",
  "separator": "/",
  "useAcademicYear": true,
  "academicYearPosition": "MIDDLE",
  "paddingLength": 3,
  "startNumber": 1
}
// Generates: BT/ITS/24/001, BT/ITS/24/002, etc.
```

---

### Step 2: Access Public Registration Page

**URL Pattern:**
```
http://localhost:5173/register/:institutionId
```

**Example URLs:**
```bash
# If your institution ID is 1
http://localhost:5173/register/1

# If your institution ID is 2
http://localhost:5173/register/2
```

**To find your institution ID:**
- Check the institutions table in your database
- Or use the Super Admin dashboard to view institutions
- The ID is typically 1 for the first institution

---

### Step 3: Register a New Student

**Fill out the registration form:**

**Personal Information:**
- First Name: John
- Middle Name: Michael (optional)
- Last Name: Doe
- Email: john.doe@personal.com
- Phone: +233123456789 (optional)
- Date of Birth: 2000-01-15 (optional)
- Gender: Male

**Academic Information:**
- Program: Select from dropdown (e.g., "HND Information Technology")
- Academic Year: Select current year (e.g., "2024/2025")
- Entry Level: 100 (default)

**Submit Registration**

---

### Step 4: Save Generated Credentials

After successful registration, a modal will display:

```
✅ Registration Successful! 🎉

Student ID: 0721000001
Email: 0721000001@institution.edu
Password: AbC12dEf
```

**Actions:**
- Copy credentials using the "Copy All Credentials" button
- Toggle password visibility with the eye icon
- Choose "Continue to Dashboard" to auto-login
- Or choose "I'll Login Later" to manually login later

---

### Step 5: Access Student Dashboard

After auto-login, you'll be redirected to:
```
http://localhost:5173/student
```

---

## API Endpoints Reference

### Public Endpoints (No Authentication)

**Register Student:**
```http
POST http://localhost:3000/api/public/students/register
Content-Type: application/json

{
  "institutionId": 1,
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Michael",
  "email": "john.doe@personal.com",
  "phone": "+233123456789",
  "dateOfBirth": "2000-01-15",
  "gender": "MALE",
  "programId": 1,
  "academicYearId": 1,
  "entryLevel": 100
}
```

**Get Available Programs:**
```http
GET http://localhost:3000/api/public/institutions/1/programs
```

**Get Academic Years:**
```http
GET http://localhost:3000/api/public/institutions/1/academic-years
```

---

## Testing Checklist

### Backend Testing

- [ ] Student ID config API responds correctly
- [ ] Preview endpoint shows correct ID format
- [ ] Public registration creates user + student profile + academic history
- [ ] Generated student ID follows configured format
- [ ] Email format is correct: `{studentId}@{institutionDomain}`
- [ ] Password is randomly generated (8 characters)
- [ ] Programs endpoint returns available programs
- [ ] Academic years endpoint returns years

### Frontend Testing

- [ ] Registration page loads at `/register/:institutionId`
- [ ] Form validation works (required fields)
- [ ] Programs dropdown populates from API
- [ ] Academic years dropdown populates from API
- [ ] Form submission shows loading state
- [ ] Success modal displays with credentials
- [ ] Copy to clipboard works
- [ ] Password visibility toggle works
- [ ] Auto-login redirects to student dashboard
- [ ] Manual login option navigates to login page
- [ ] Error messages display for failed registration

### Integration Testing

- [ ] Admin can configure student ID format
- [ ] Configuration saves successfully
- [ ] Preview shows correct ID examples
- [ ] Student registration generates correct ID
- [ ] Auto-login works with generated credentials
- [ ] Student dashboard loads with correct data
- [ ] Duplicate email registration is prevented
- [ ] Invalid institution ID shows error

---

## Common Issues

### Issue: "Institution not found"
**Solution:** Ensure the institution ID in the URL exists in your database.

### Issue: "Program not found"
**Solution:** Ensure programs exist for the institution and are active.

### Issue: "Academic year not found"
**Solution:** Create academic years for the institution in the admin panel.

### Issue: Student ID config not found
**Solution:** Configure student ID generation in the admin panel first.

### Issue: Auto-login fails
**Solution:** Check that the login API endpoint is working. Try manual login instead.

---

## Next Steps

After successful registration and login:

1. **Update Student Dashboard** (Task 5)
   - Display student profile information
   - Show program and academic details
   - Display enrolled courses
   - Show exam schedule

2. **Add Features**
   - Email verification
   - Bulk student import
   - Student profile editing
   - Document upload

---

## Database Check Queries

```sql
-- Check institutions
SELECT id, name, code, website FROM "Institution";

-- Check programs
SELECT p.id, p.name, p.code, d.name as department
FROM "Program" p
JOIN "Department" d ON p."departmentId" = d.id;

-- Check academic years
SELECT id, year, name, "isCurrent"
FROM "AcademicYear"
WHERE "institutionId" = 1;

-- Check student ID config
SELECT * FROM "StudentIdConfig"
WHERE "institutionId" = 1;

-- Check registered students
SELECT u.id, u."firstName", u."lastName", u.email,
       sp."studentId", sp."indexNumber"
FROM "User" u
JOIN "StudentProfile" sp ON u.id = sp."userId"
WHERE u.role = 'STUDENT';
```

---

## Support

If you encounter any issues:
1. Check backend logs: `backend/` terminal
2. Check frontend console: Browser DevTools
3. Verify database state: Use the SQL queries above
4. Check API responses: Use browser Network tab

---

**Status:** ✅ Task 4 Complete - Public Student Registration System Ready for Testing
