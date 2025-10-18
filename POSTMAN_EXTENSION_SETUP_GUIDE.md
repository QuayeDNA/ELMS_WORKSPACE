# Postman VS Code Extension Setup Guide

## 🎯 Setting Up API Testing in Postman Extension

Since the collection import isn't working with the Postman VS Code extension, follow these steps to manually create your test environment:

---

## Option 1: Manual Setup in Postman Extension (Recommended)

### Step 1: Create a New Collection

1. Open the Postman extension in VS Code (click the Postman icon in the Activity Bar)
2. Click **"Create Collection"** or **"+"** button
3. Name it: **"ELMS API - Complete Backend"**

### Step 2: Set Up Environment Variables

1. In the Postman extension, click on **"Environments"**
2. Create a new environment named **"ELMS Local Development"**
3. Add these variables:

| Variable Name | Initial Value | Current Value |
|---------------|---------------|---------------|
| `baseUrl` | `http://localhost:3000` | `http://localhost:3000` |
| `authToken` | _(empty)_ | _(empty)_ |
| `studentId` | _(empty)_ | _(empty)_ |
| `semesterId` | `1` | `1` |
| `registrationId` | _(empty)_ | _(empty)_ |
| `courseOfferingId` | `1` | `1` |
| `courseId` | `1` | `1` |
| `programId` | `1` | `1` |
| `academicPeriodId` | _(empty)_ | _(empty)_ |

4. Save the environment
5. Select it as the active environment

### Step 3: Set Collection-Level Authorization

1. Click on your collection name
2. Go to **Authorization** tab
3. Select **Type**: `Bearer Token`
4. **Token**: `{{authToken}}`
5. This will apply to all requests in the collection

---

## Step 4: Create Authentication Requests

### Create a folder: "0. Authentication"

#### Request 1: Login - Super Admin

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/auth/login`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
```json
{
  "email": "admin@elms.com",
  "password": "Admin@123"
}
```
- **Tests** tab (add this script):
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set('authToken', response.data.token);
        console.log('Token saved:', response.data.token);
    }
}
```
- **Auth**: `No Auth` (override collection auth for login only)

#### Request 2: Login - Student

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/auth/login`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
```json
{
  "email": "alice.student@st.git.edu.gh",
  "password": "password123"
}
```
- **Tests** tab:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set('authToken', response.data.token);
        pm.environment.set('studentId', response.data.user.id);
        console.log('Token and Student ID saved');
    }
}
```
- **Auth**: `No Auth`

#### Request 3: Login - Faculty Admin

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/auth/login`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
```json
{
  "email": "dean.engineering@git.edu.gh",
  "password": "password123"
}
```
- **Tests** tab:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set('authToken', response.data.token);
        console.log('Faculty Admin token saved');
    }
}
```
- **Auth**: `No Auth`

#### Request 4: Login - Lecturer

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/auth/login`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
```json
{
  "email": "james.lecturer@git.edu.gh",
  "password": "password123"
}
```
- **Tests** tab:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set('authToken', response.data.token);
    }
}
```
- **Auth**: `No Auth`

#### Request 5: Login - Institution Admin

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/auth/login`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
```json
{
  "email": "admin@git.edu.gh",
  "password": "password123"
}
```
- **Tests** tab:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set('authToken', response.data.token);
    }
}
```
- **Auth**: `No Auth`

---

## Step 5: Create Academic Period Requests

### Create a folder: "1. Academic Periods"

#### Request 1: Create Academic Period

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/academic-periods`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
```json
{
  "semesterId": 1,
  "registrationStart": "2025-01-01T00:00:00Z",
  "registrationEnd": "2025-01-15T23:59:59Z",
  "addDropDeadline": "2025-01-22T23:59:59Z"
}
```
- **Tests** tab:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    if (response.data && response.data.id) {
        pm.environment.set('academicPeriodId', response.data.id);
        console.log('Academic Period ID saved:', response.data.id);
    }
}
```
- **Auth**: Inherit from collection (Bearer Token)

#### Request 2: List All Academic Periods

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/academic-periods`
- **Auth**: Inherit from collection

#### Request 3: Get Academic Period by ID

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/academic-periods/{{academicPeriodId}}`
- **Auth**: Inherit from collection

#### Request 4: Update Academic Period

- **Method**: `PUT`
- **URL**: `{{baseUrl}}/api/academic-periods/{{academicPeriodId}}`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
```json
{
  "registrationStart": "2025-01-02T00:00:00Z",
  "registrationEnd": "2025-01-16T23:59:59Z"
}
```
- **Auth**: Inherit from collection

#### Request 5: Activate Academic Period

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/academic-periods/{{academicPeriodId}}/activate`
- **Auth**: Inherit from collection

#### Request 6: Get Current Academic Period

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/academic-periods/current`
- **Auth**: Inherit from collection

#### Request 7: Close Academic Period

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/academic-periods/{{academicPeriodId}}/close`
- **Auth**: Inherit from collection

#### Request 8: Get Period Statistics

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/academic-periods/{{academicPeriodId}}/statistics`
- **Auth**: Inherit from collection

#### Request 9: Delete Academic Period

- **Method**: `DELETE`
- **URL**: `{{baseUrl}}/api/academic-periods/{{academicPeriodId}}`
- **Auth**: Inherit from collection

---

## Step 6: Create Registration Requests

### Create a folder: "2. Course Registration"

#### Request 1: Create Registration

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/registrations`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
```json
{
  "studentId": {{studentId}},
  "semesterId": {{semesterId}}
}
```
- **Tests** tab:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    if (response.data && response.data.id) {
        pm.environment.set('registrationId', response.data.id);
        console.log('Registration ID saved:', response.data.id);
    }
}
```
- **Auth**: Inherit from collection

#### Request 2: Get Registration by ID

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/registrations/{{registrationId}}`
- **Auth**: Inherit from collection

#### Request 3: Get Student Registrations

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/registrations/student/{{studentId}}`
- **Auth**: Inherit from collection

#### Request 4: Get Eligible Courses

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/registrations/{{studentId}}/eligible-courses?semesterId={{semesterId}}`
- **Auth**: Inherit from collection

#### Request 5: Check Course Eligibility

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/registrations/{{studentId}}/check-eligibility/{{courseOfferingId}}`
- **Auth**: Inherit from collection

#### Request 6: Add Course to Registration

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/registrations/{{registrationId}}/courses`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
```json
{
  "courseOfferingId": {{courseOfferingId}}
}
```
- **Auth**: Inherit from collection

#### Request 7: Remove Course from Registration

- **Method**: `DELETE`
- **URL**: `{{baseUrl}}/api/registrations/{{registrationId}}/courses/{{courseOfferingId}}`
- **Auth**: Inherit from collection

#### Request 8: Validate Registration

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/registrations/{{registrationId}}/validate`
- **Auth**: Inherit from collection

#### Request 9: Get Registration Summary

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/registrations/{{registrationId}}/summary`
- **Auth**: Inherit from collection

#### Request 10: Submit Registration

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/registrations/{{registrationId}}/submit`
- **Auth**: Inherit from collection

#### Request 11: Approve Registration

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/registrations/{{registrationId}}/approve`
- **Auth**: Inherit from collection

#### Request 12: Reject Registration

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/registrations/{{registrationId}}/reject`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
```json
{
  "reason": "Credit limit exceeded"
}
```
- **Auth**: Inherit from collection

---

## Quick Start Testing Workflow

### 1. First Time Setup (5 minutes)

```
✅ Start backend server: cd backend && npm run dev
✅ Create collection in Postman extension
✅ Create environment with variables
✅ Set collection auth to Bearer Token using {{authToken}}
✅ Create 5 login requests in "0. Authentication" folder
```

### 2. Test Authentication (2 minutes)

```
1. Run "Login - Super Admin" → Check token is saved in environment
2. Run "Login - Student" → Check token and studentId are saved
3. Verify authToken variable has a value in environment
```

### 3. Test Your First Endpoint (1 minute)

```
1. Ensure backend is running
2. Run "Login - Super Admin"
3. Run "List All Academic Periods"
4. Should return array of periods (or empty array if none exist)
```

---

## ⚡ Pro Tips for Postman Extension

### Tip 1: Use Snippets

The Postman extension has built-in code snippets. When writing test scripts:
- Type `pm.` and you'll get autocomplete suggestions
- Common snippets: `pm.response.json()`, `pm.environment.set()`

### Tip 2: View Console Output

- Open VS Code's Output panel (View → Output)
- Select "Postman" from dropdown
- You'll see `console.log()` output from your test scripts

### Tip 3: Quick Duplicate Requests

- Right-click on a request → Duplicate
- Modify the duplicate instead of creating from scratch
- Speeds up creating similar requests

### Tip 4: Use Pre-request Scripts

For requests that need a token, add this pre-request script:
```javascript
const token = pm.environment.get('authToken');
if (!token) {
    console.error('No auth token found! Run a login request first.');
}
```

### Tip 5: Collection Runner

- Select your collection
- Click "Run Collection"
- Select which requests to run
- Great for testing multiple endpoints in sequence

---

## 🐛 Troubleshooting

### Issue: "Authorization header missing"

**Solution:**
1. Check that collection-level auth is set to Bearer Token
2. Verify `{{authToken}}` variable has a value
3. Run a login request to get a fresh token

### Issue: "Cannot find variable {{studentId}}"

**Solution:**
1. Run "Login - Student" request
2. Check the test script saves the ID: `pm.environment.set('studentId', response.data.user.id)`
3. Verify the variable exists in your environment

### Issue: Request returns 404

**Solution:**
1. Verify backend server is running on port 3000
2. Check the URL is correct: `{{baseUrl}}/api/...`
3. Verify `baseUrl` environment variable is `http://localhost:3000`

### Issue: Token expired

**Solution:**
1. Run any login request again to get a fresh token
2. The test script will automatically update the `authToken` variable

---

## 📋 Complete Request Checklist

### Authentication (5 requests)
- [ ] Login - Super Admin
- [ ] Login - Student
- [ ] Login - Faculty Admin
- [ ] Login - Lecturer
- [ ] Login - Institution Admin

### Academic Periods (9 requests minimum)
- [ ] Create Academic Period
- [ ] List All Academic Periods
- [ ] Get Academic Period by ID
- [ ] Update Academic Period
- [ ] Activate Academic Period
- [ ] Get Current Academic Period
- [ ] Close Academic Period
- [ ] Get Period Statistics
- [ ] Delete Academic Period

### Course Registration (12 requests)
- [ ] Create Registration
- [ ] Get Registration by ID
- [ ] Get Student Registrations
- [ ] Get Eligible Courses
- [ ] Check Course Eligibility
- [ ] Add Course to Registration
- [ ] Remove Course from Registration
- [ ] Validate Registration
- [ ] Get Registration Summary
- [ ] Submit Registration
- [ ] Approve Registration
- [ ] Reject Registration

---

## Next Steps

After setting up these core requests:

1. **Continue with Prerequisites folder** (6 requests) - See POSTMAN_TESTING_GUIDE.md
2. **Add Semester Records folder** (8 requests) - See POSTMAN_TESTING_GUIDE.md
3. **Add Academic History folder** (10 requests) - See POSTMAN_TESTING_GUIDE.md

Each folder follows the same pattern:
1. Create folder
2. Add requests with method, URL, headers, body
3. Add test scripts to save IDs
4. Set auth to inherit from collection

---

## 🎓 Full Collection Structure

```
ELMS API - Complete Backend/
├── 0. Authentication/
│   ├── Login - Super Admin
│   ├── Login - Student
│   ├── Login - Faculty Admin
│   ├── Login - Lecturer
│   └── Login - Institution Admin
├── 1. Academic Periods/
│   ├── Create Academic Period
│   ├── List All Academic Periods
│   ├── Get Academic Period by ID
│   ├── Update Academic Period
│   ├── Activate Academic Period
│   ├── Get Current Academic Period
│   ├── Close Academic Period
│   ├── Get Period Statistics
│   └── Delete Academic Period
├── 2. Course Registration/
│   ├── Create Registration
│   ├── Get Registration by ID
│   ├── Get Student Registrations
│   ├── Get Eligible Courses
│   ├── Check Course Eligibility
│   ├── Add Course to Registration
│   ├── Remove Course from Registration
│   ├── Validate Registration
│   ├── Get Registration Summary
│   ├── Submit Registration
│   ├── Approve Registration
│   └── Reject Registration
├── 3. Prerequisites/
│   └── (6 requests - see POSTMAN_TESTING_GUIDE.md)
├── 4. Semester Records/
│   └── (8 requests - see POSTMAN_TESTING_GUIDE.md)
└── 5. Academic History/
    └── (10 requests - see POSTMAN_TESTING_GUIDE.md)
```

---

**Total Time to Set Up**: ~20-30 minutes for all 49 requests

**Happy Testing! 🚀**

Once you've tested all endpoints successfully, we'll move to frontend integration.
