# Phase 2 - Systematic Fix Plan (53 Errors)

## Current Status
- **Total Errors**: 53
- **Files Affected**: 2
  - prerequisiteService.ts: 8 errors
  - registrationService.ts: 45 errors

## Fix Categories (Priority Order)

### CATEGORY 1: Non-Existent Relations (24 errors) - HIGH PRIORITY
These are simple find-replace fixes.

#### 1.1 Remove `program: true` from User includes (7 occurrences)
Files: prerequisiteService.ts (0), registrationService.ts (7)
- **Lines**: 137, 181, 395, 457, 515, 631, 731
- **Fix**: Remove `program: true,` line entirely
- **Reason**: User model has no direct `program` relation

#### 1.2 Change `lecturer: true` to `primaryLecturer: true` (8 occurrences)
Files: registrationService.ts only
- **Lines**: 150, 194, 300, 408, 470, 528, 748
- **Fix**: Replace `lecturer: true` with `primaryLecturer: true`
- **Reason**: CourseOffering has `primaryLecturer` not `lecturer`

#### 1.3 Remove `venue: true` from CourseOffering includes (2 occurrences)
Files: registrationService.ts only
- **Lines**: 234, 616
- **Fix**: Remove `venue: true,` line entirely
- **Reason**: CourseOffering has no `venue` relation

#### 1.4 Remove `approvedByUser: true` (1 occurrence)
Files: registrationService.ts only
- **Line**: 118
- **Fix**: Remove `approvedByUser: true,` line entirely
- **Reason**: CourseRegistration has no `approvedByUser` relation

#### 1.5 Remove `isPublished: true` from where clause (1 occurrence)
Files: registrationService.ts only
- **Line**: 744
- **Fix**: Remove `isPublished: true` line from where clause
- **Reason**: CourseOffering has no `isPublished` field

### CATEGORY 2: Property Name Mismatches (5 errors) - HIGH PRIORITY
Simple property name changes.

#### 2.1 Fix `maxStudents` → `maxEnrollment` (2 occurrences)
Files: registrationService.ts only
- **Lines**: 260, 654
- **Fix**: Replace `courseOffering.maxStudents` with `courseOffering.maxEnrollment`

#### 2.2 Fix `course.credits` → `course.creditHours` (2 occurrences)
Files: registrationService.ts only
- **Lines**: 275, 350
- **Fix**: Replace `.course.credits` with `.course.creditHours`

#### 2.3 Fix `eligibility.errors` → `eligibility.reasons` (1 occurrence)
Files: registrationService.ts only
- **Line**: 271,  717 (interface return)
- **Fix**: Replace `eligibility.errors` with `eligibility.reasons`
- **Also Update**: CourseEligibility interface in types/registration.ts line 90 (`errors` → `reasons`)

### CATEGORY 3: Missing _count Aggregations (4 errors) - MEDIUM PRIORITY
Need to add `_count` to include statements.

#### 3.1 Add _count to courseOffering queries (4 occurrences)
Files: registrationService.ts only
- **Lines**: 259 (2 errors on same line), 653 (2 errors on same line)
- **Current**: Query doesn't include `_count`
- **Fix**: Add to include:
```typescript
_count: {
  select: {
    enrollments: true,
    registeredCourses: true
  }
}
```

### CATEGORY 4: Prerequisite Parsing Issues (8 errors) - MEDIUM PRIORITY
JSON string needs to be parsed to number array.

#### 4.1 Parse prerequisiteCourseIds (6 occurrences)
Files: prerequisiteService.ts (6), registrationService.ts (2)
- **prerequisiteService.ts Lines**: 80, 90, 97, 104, 162, 166, 212, 213, 214
- **registrationService.ts Lines**: 671, 683
- **Current**: `programCourse.prerequisiteCourseIds as string[]`
- **Fix**:
```typescript
const prerequisiteIds = programCourse.prerequisiteCourseIds
  ? JSON.parse(programCourse.prerequisiteCourseIds) as number[]
  : [];
```
- **Then**: Fix comparisons to use numbers instead of strings

### CATEGORY 5: Null Safety Issues (6 errors) - MEDIUM PRIORITY
Add optional chaining for potentially undefined properties.

#### 5.1 registration.registeredCourses (2 occurrences)
Files: registrationService.ts only
- **Lines**: 562, 567, 785
- **Fix**: Add `?.` → `registration.registeredCourses?.length`
- **Also**: Add safety check `|| []` after loops

#### 5.2 regCourse.courseOffering (4 + 1 occurrences)
Files: registrationService.ts only
- **Lines**: 574, 578, 582, 587, 799
- **Fix**: Add `?.` → `regCourse.courseOffering?.course.code`
- **Better**: Add guard clause at loop start

### CATEGORY 6: User Property Access (7 errors) - COMPLEX
User model access issues - need to include relations or use different access path.

#### 6.1 student.programId (2 occurrences)
Files: prerequisiteService.ts (1), registrationService.ts (1)
- **prerequisiteService.ts Line**: Already fixed with studentProfiles
- **registrationService.ts Line**: 663
- **Fix**: Get from studentProfiles: `student.studentProfiles?.[0]?.programId`
- **Include Needed**: Add `studentProfiles: true` to User query

#### 6.2 student.enrollments (3 occurrences)
Files: prerequisiteService.ts (1), registrationService.ts (1)
- **prerequisiteService.ts Line**: 103
- **registrationService.ts Line**: 674
- **Fix**: Ensure `enrollments` are included in the User query
- **Already Included**: Check if query has `enrollments: true` or add it

#### 6.3 student.academicHistory (1 occurrence)
Files: registrationService.ts only
- **Line**: 702
- **Fix**: Ensure `academicHistory: true` is in User query

#### 6.4 TypeScript doesn't see includes (1 occurrence)
Files: prerequisiteService.ts
- **Line**: 64 (studentProfiles not recognized)
- **Root Cause**: TypeScript type inference issue
- **Fix**: The include IS there, but TS doesn't infer it. May need explicit type or runtime check

### CATEGORY 7: CourseOffering Property Access (3 errors) - COMPLEX
CourseOffering needs course relation included.

#### 7.1 courseOffering.course.credits (1 occurrence)
Files: registrationService.ts only
- **Line**: 275
- **Fix**: Ensure `course: true` is in CourseOffering include, then use `creditHours`

#### 7.2 courseOffering.course (2 occurrences)
Files: registrationService.ts only
- **Lines**: 703, 799
- **Line 703**: `courseOffering.course.code` - needs `course` included
- **Line 799**: `courseOffering.courseId` should be `courseOffering.course.id`
- **Fix**: Ensure all CourseOffering queries include `course: true`

### CATEGORY 8: Type Definition Fixes (1 error) - LOW PRIORITY
Type interface mismatches.

#### 8.1 RegistrationSummary.registrationId type (1 occurrence)
Files: types/registration.ts
- **Line**: 189
- **Current**: `registrationId?: string;`
- **Fix**: `registrationId?: number;`

## Execution Order

1. ✅ **Fix CATEGORY 1** (24 errors) - Simple find-replace, no logic changes
2. **Fix CATEGORY 2** (5 errors) - Simple property renames
3. **Fix CATEGORY 8** (1 error) - Type definition fix
4. **Fix CATEGORY 3** (4 errors) - Add _count to includes
5. **Fix CATEGORY 7** (3 errors) - Ensure course relations included
6. **Fix CATEGORY 6** (7 errors) - Ensure User relations included
7. **Fix CATEGORY 5** (6 errors) - Add null safety
8. **Fix CATEGORY 4** (8 errors) - Parse JSON prerequisites

## Expected Outcome
- All 53 errors resolved
- Both services compile successfully
- Ready to create controllers and routes
