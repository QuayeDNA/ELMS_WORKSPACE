# ELMS API Testing Guide with Postman

## 📦 Import the Collection

1. Open Postman
2. Click **Import** in the top-left
3. Select the file: `ELMS_API_Complete_Collection.postman_collection.json`
4. The collection will be imported with all 49 endpoints organized into 6 folders

---

## 🔐 Authentication Setup

### Step 1: Start the Backend Server

```bash
cd backend
npm run dev
```

The server should start on `http://localhost:3000`

### Step 2: Login to Get Auth Token

The collection includes 5 login requests for different user roles:

1. **Super Admin** - `admin@elms.com` / `Admin@123`
2. **Institution Admin** - `admin@git.edu.gh` / `password123`
3. **Faculty Admin (Dean)** - `dean.engineering@git.edu.gh` / `password123`
4. **Lecturer** - `james.lecturer@git.edu.gh` / `password123`
5. **Student** - `alice.student@st.git.edu.gh` / `password123`

**To Login:**
1. Navigate to `0. Authentication` folder
2. Select a login request (e.g., "Login - Super Admin")
3. Click **Send**
4. The auth token will be **automatically saved** to the collection variable `{{authToken}}`

### Step 3: Verify Token is Set

1. Click on the collection name in the left sidebar
2. Go to **Variables** tab
3. You should see `authToken` with a value

---

## 🎯 Testing Strategy

### Phase 1: Basic Authentication Tests

**Test all 5 login endpoints:**
- ✅ Super Admin login
- ✅ Institution Admin login
- ✅ Faculty Admin login
- ✅ Lecturer login
- ✅ Student login

**Expected Results:**
- Status: 200 OK
- Response includes: `token`, `user` object with role
- Token automatically saved to collection variables

---

### Phase 2: Academic Period Management (15 endpoints)

**Prerequisites:**
- Login as Faculty Admin or Admin
- You need existing semester data in the database

**Test Order:**

1. **Create Academic Period** ⭐ CRITICAL FIRST STEP
   - Creates a new academic period
   - Saves `academicPeriodId` to collection variables
   - Update body with valid `semesterId` from your database

2. **List All Academic Periods**
   - Verify your created period appears
   - Note down the ID

3. **Get Academic Period by ID**
   - Uses `{{academicPeriodId}}` variable

4. **Update Academic Period**
   - Modify period details

5. **Activate Academic Period**
   - Changes status to ACTIVE

6. **Get Current Academic Period**
   - Should return the activated period

7. **Get Period Statistics**
   - Shows period metrics

8. **Add Course to Period**
   - Requires valid `{{courseId}}`
   - Set the courseId variable first

9. **Get Period Courses**
   - View all courses in the period

10. **Remove Course from Period**
    - Clean up test data

11. **Get Period Registrations**
    - View registrations (if any exist)

12. **Get Registered Students**
    - View enrolled students

13. **Get Upcoming Periods**
    - List future periods

14. **Close Academic Period**
    - Changes status to CLOSED

15. **Delete Academic Period**
    - Clean up (only if no dependent data)

---

### Phase 3: Course Registration System (12 endpoints)

**Prerequisites:**
- Login as Student first
- Have an active academic period
- Have semester and course offering data

**Setup Variables:**
```
studentId: Get from login response (auto-saved for student login)
semesterId: ID of active semester
courseOfferingId: ID of a course offering in the semester
```

**Test Order:**

1. **Create Registration** ⭐ START HERE
   - Creates draft registration
   - Saves `registrationId` automatically
   - Adjust `studentId`, `semesterId` in body

2. **Get Registration by ID**
   - View created registration

3. **Get Student Registrations**
   - List all registrations for student

4. **Get Eligible Courses**
   - View courses student can register for
   - Note down a `courseOfferingId`

5. **Check Course Eligibility**
   - Verify if student can take a specific course

6. **Add Course to Registration**
   - Add a course to the registration
   - Update `courseOfferingId` in body

7. **Validate Registration**
   - Check if registration meets all rules

8. **Get Registration Summary**
   - View summary of registration

9. **Submit Registration**
   - Submit for approval (Student role)

10. **Switch to Lecturer/Admin**
    - Login as Lecturer or Faculty Admin

11. **Approve Registration**
    - Approve the submitted registration

12. **Remove Course from Registration** (Optional)
    - Test removing a course

Alternative: **Reject Registration**
- Test rejection workflow instead of approval

---

### Phase 4: Prerequisite Validation (6 endpoints)

**Prerequisites:**
- Have courses with prerequisite relationships
- Have student enrollment data

**Test Order:**

1. **Get Course Prerequisites**
   - View prerequisites for a course
   - Set `courseId` and `programId` variables

2. **Check Prerequisites**
   - Check if student has met prerequisites
   - Set `studentId` and `courseId`

3. **Get Missing Prerequisites**
   - View which prerequisites are missing

4. **Batch Check Prerequisites**
   - Check multiple courses at once
   - Update courseIds array in body

5. **Validate Prerequisite Chain**
   - Validate full prerequisite dependency chain

6. **Get Courses Requiring Prerequisite**
   - View dependent courses

---

### Phase 5: Semester Records (8 endpoints)

**Prerequisites:**
- Login as Faculty Admin or Admin
- Have completed enrollments with grades
- Have student and semester IDs

**Test Order:**

1. **Create Semester Record**
   - Initialize semester record for a student
   - Set `studentId` and `semesterId`

2. **Get Semester Record**
   - View the created record

3. **Get All Student Semester Records**
   - View all semesters for a student

4. **Update Semester Record**
   - Update statistics manually

5. **Calculate Semester GPA**
   - Calculate GPA from completed courses with grades

6. **Update Academic Standing**
   - Update based on GPA (Good Standing, Probation, etc.)

7. **Get Semester Statistics**
   - View detailed semester statistics

8. **Finalize Semester Record**
   - Lock the record (cannot be modified after)

---

### Phase 6: Academic History (10 endpoints)

**Prerequisites:**
- Login as Faculty Admin or Admin
- Have student with completed semesters
- Have finalized semester records

**Test Order:**

1. **Create Academic History**
   - Initialize academic history for student
   - Set admission year and expected graduation

2. **Get Academic History**
   - View current academic history

3. **Update Cumulative GPA**
   - Calculate cumulative GPA from all semesters

4. **Check Level Progression**
   - Check if student should advance levels (100→200→300→400)

5. **Update Academic Standing**
   - Update overall academic standing

6. **Update Current Semester**
   - Update which semester student is in

7. **Get Academic Summary**
   - View comprehensive summary

8. **Get Academic Transcript** ⭐ IMPORTANT
   - Generate complete transcript
   - Shows all courses, grades, GPA

9. **Check Graduation Eligibility**
   - Verify if student can graduate
   - Requires: 120+ credits, GPA ≥2.0, Level 400

10. **Mark As Graduated**
    - Mark student as graduated (if eligible)

---

## 🔧 Collection Variables

The collection uses these variables (automatically set or manually update):

| Variable | Description | Auto-Set | Example |
|----------|-------------|----------|---------|
| `baseUrl` | API base URL | ❌ | `http://localhost:3000` |
| `authToken` | JWT token | ✅ | Set by login requests |
| `studentId` | Student user ID | ✅ | Set by student login |
| `semesterId` | Semester ID | ❌ | `1` |
| `registrationId` | Registration ID | ✅ | Set by create registration |
| `courseOfferingId` | Course offering ID | ❌ | `1` |
| `courseId` | Course ID | ❌ | `1` |
| `programId` | Program ID | ❌ | `1` |
| `academicPeriodId` | Academic period ID | ✅ | Set by create period |

**To Update Variables:**
1. Click collection name
2. Go to **Variables** tab
3. Update **Current Value** column
4. Click **Save**

---

## 🧪 Test Scripts

Each login request includes a test script that automatically:
- Extracts the JWT token from response
- Saves it to `{{authToken}}` variable
- Saves user ID for student logins

Some create endpoints save IDs automatically for chaining requests.

---

## 📋 Testing Checklist

### ✅ Authentication
- [ ] Super Admin login works
- [ ] Institution Admin login works
- [ ] Faculty Admin login works
- [ ] Lecturer login works
- [ ] Student login works
- [ ] Token is saved automatically

### ✅ Academic Periods (15 endpoints)
- [ ] Create academic period
- [ ] List all periods
- [ ] Get period by ID
- [ ] Update period
- [ ] Activate period
- [ ] Close period
- [ ] Get current period
- [ ] Get upcoming periods
- [ ] Add course to period
- [ ] Get period courses
- [ ] Remove course from period
- [ ] Get period registrations
- [ ] Get registered students
- [ ] Get period statistics
- [ ] Delete period

### ✅ Course Registration (12 endpoints)
- [ ] Create registration (Student)
- [ ] Get registration by ID
- [ ] Get student registrations
- [ ] Get eligible courses
- [ ] Check course eligibility
- [ ] Add course to registration
- [ ] Validate registration
- [ ] Get registration summary
- [ ] Submit registration (Student)
- [ ] Approve registration (Lecturer/Admin)
- [ ] Reject registration (Lecturer/Admin)
- [ ] Remove course from registration

### ✅ Prerequisites (6 endpoints)
- [ ] Get course prerequisites
- [ ] Check prerequisites
- [ ] Get missing prerequisites
- [ ] Batch check prerequisites
- [ ] Validate prerequisite chain
- [ ] Get courses requiring prerequisite

### ✅ Semester Records (8 endpoints)
- [ ] Create semester record
- [ ] Get semester record
- [ ] Get all student records
- [ ] Update semester record
- [ ] Calculate semester GPA
- [ ] Update academic standing
- [ ] Get semester statistics
- [ ] Finalize semester record

### ✅ Academic History (10 endpoints)
- [ ] Create academic history
- [ ] Get academic history
- [ ] Update cumulative GPA
- [ ] Check level progression
- [ ] Update academic standing
- [ ] Update current semester
- [ ] Check graduation eligibility
- [ ] Mark as graduated
- [ ] Get academic summary
- [ ] Get academic transcript

### ✅ Authorization Tests
- [ ] Student can view own records
- [ ] Student cannot view other students' records
- [ ] Student cannot approve registrations
- [ ] Lecturer can approve registrations
- [ ] Faculty Admin can calculate GPA
- [ ] Admin has full access

---

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid token" or "Unauthorized"
**Solution:**
- Re-run a login request
- Token is automatically saved
- Check Variables tab to confirm token exists

### Issue 2: "Student not found" or "Semester not found"
**Solution:**
- Update collection variables with valid IDs
- Run database seed script first
- Check your database for existing records

### Issue 3: Variables not updating
**Solution:**
- Click **Save** on the collection after changing variables
- Check the test script is enabled (not disabled)
- Look at Console (View → Show Postman Console) for errors

### Issue 4: "Cannot read property 'id' of undefined"
**Solution:**
- The previous request didn't return expected data
- Check response structure
- Update variable manually if auto-save fails

### Issue 5: 404 Not Found
**Solution:**
- Verify backend is running on port 3000
- Check `baseUrl` variable is correct
- Verify the route is registered in server.ts

---

## 🎓 Complete Test Workflow Example

### Scenario: Student Registration Flow

1. **Setup**
   ```
   Login as Super Admin → Create Academic Period
   Login as Faculty Admin → Create Semester Record
   ```

2. **Registration**
   ```
   Login as Student → Create Registration
   Add 4 courses (12 credits)
   Check eligibility for each course
   Validate registration
   Submit registration
   ```

3. **Approval**
   ```
   Login as Lecturer → Approve Registration
   System creates enrollments automatically
   ```

4. **Grading** (Manual in DB or future endpoint)
   ```
   Update enrollment grades in database
   ```

5. **GPA Calculation**
   ```
   Login as Faculty Admin → Calculate Semester GPA
   Update Academic Standing
   Finalize Semester Record
   ```

6. **History Update**
   ```
   Update Cumulative GPA
   Check Level Progression
   Get Academic Transcript
   ```

---

## 📊 Expected Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### List Response
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "count": 10
}
```

---

## 🔍 Debugging Tips

1. **Enable Postman Console**
   - View → Show Postman Console
   - See all requests, responses, and script logs

2. **Check Test Results**
   - Click on response → Test Results tab
   - View which tests passed/failed

3. **Inspect Variables**
   - Collection → Variables tab
   - Verify all values are correct

4. **View Server Logs**
   - Check backend terminal for errors
   - Look for validation errors or database issues

5. **Test Individual Requests**
   - Don't run entire folder at once initially
   - Test one endpoint at a time
   - Verify response before moving to next

---

## 📝 Notes

- All endpoints require authentication except login
- Token is automatically included via collection-level auth
- Some endpoints require specific roles (check descriptions)
- Variables are automatically saved by test scripts where possible
- Update manual variables before testing dependent endpoints

---

## ✅ Quick Start

1. Import collection into Postman
2. Ensure backend is running (`npm run dev`)
3. Run "Login - Super Admin" request
4. Start testing endpoints in order
5. Check off completed items in the checklist above

---

**Happy Testing! 🚀**

For issues or questions, check the backend logs and Postman console for detailed error messages.
