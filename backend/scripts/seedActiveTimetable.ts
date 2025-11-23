import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Seed Active Exam Timetable
 *
 * Creates a published exam timetable for the current/upcoming week with:
 * - 12 exam sessions across different days and times
 * - Exam registrations for all students
 * - Unique QR codes for each student-exam pair
 */

async function main() {
  console.log('🚀 Starting Active Timetable Seed...\n');

  // 1. Get existing data
  console.log('📊 Fetching existing data...');

  const institution = await prisma.institution.findFirst();
  if (!institution) {
    throw new Error('No institution found. Run comprehensive-seed first.');
  }

  const academicYear = await prisma.academicYear.findFirst({
    where: { isCurrent: true }
  });
  if (!academicYear) {
    throw new Error('No current academic year found.');
  }

  const semester = await prisma.semester.findFirst({
    where: {
      academicYearId: academicYear.id,
      isCurrent: true
    }
  });
  if (!semester) {
    throw new Error('No current semester found.');
  }

  const faculty = await prisma.faculty.findFirst();
  if (!faculty) {
    throw new Error('No faculty found. Run comprehensive-seed first.');
  }

  const venues = await prisma.venue.findMany({
    include: { rooms: true }
  });
  if (venues.length === 0) {
    throw new Error('No venues found. Run comprehensive-seed first.');
  }

  const courses = await prisma.course.findMany({
    where: {
      level: { in: [100, 200, 300, 400] }
    },
    take: 12
  });
  if (courses.length === 0) {
    throw new Error('No courses found. Run comprehensive-seed first.');
  }

  // If we have fewer than 12 courses, we'll reuse them
  const numSessions = Math.min(12, courses.length * 2);
  console.log(`✅ Courses: ${courses.length} (will create ${numSessions} sessions)`);

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' }
  });
  if (students.length === 0) {
    throw new Error('No students found.');
  }

  console.log(`✅ Found: ${institution.name}`);
  console.log(`✅ Academic Year: ${academicYear.yearCode}`);
  console.log(`✅ Semester: ${semester.name}`);
  console.log(`✅ Venues: ${venues.length}`);
  console.log(`✅ Students: ${students.length}\n`);

  // 2. Create Active Exam Timetable
  console.log('📅 Creating active exam timetable...');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1); // Start tomorrow
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7); // 7-day exam period

  const timetable = await prisma.examTimetable.create({
    data: {
      title: `End of Semester Exams - ${semester.name} ${academicYear.yearCode}`,
      description: 'Active examination timetable for testing and demonstration',
      academicYearId: academicYear.id,
      semesterId: semester.id,
      institutionId: institution.id,
      facultyId: faculty.id,
      startDate,
      endDate,
      status: 'PUBLISHED',
      isPublished: true,
      publishedAt: new Date(),
      publishedBy: 1, // Super Admin
      approvalStatus: 'APPROVED',
      approvedBy: 1,
      approvedAt: new Date(),
      defaultExamDuration: 180,
      allowOverlaps: false,
      autoResolveConflicts: true,
      createdBy: 1
    }
  });

  console.log(`✅ Timetable created: ${timetable.title}`);
  console.log(`   ID: ${timetable.id}`);
  console.log(`   Period: ${startDate.toDateString()} to ${endDate.toDateString()}\n`);

  // 3. Create Exam Sessions
  console.log('📝 Creating exam sessions...');

  // Dynamically create sessions based on available courses
  const examSessions = [];
  const times = ['08:00', '12:00', '15:00'];
  let sessionIndex = 0;

  for (let day = 1; day <= 5; day++) {
    for (const time of times) {
      if (sessionIndex >= numSessions) break;

      const courseIndex = sessionIndex % courses.length;
      const venueIndex = sessionIndex % venues.length;

      // Distribute students across sessions
      const studentsPerSession = Math.floor(students.length / numSessions) + 1;
      const startStudentIdx = (sessionIndex * studentsPerSession) % students.length;
      const studentIndices = [];

      for (let i = 0; i < Math.min(studentsPerSession, students.length); i++) {
        studentIndices.push((startStudentIdx + i) % students.length);
      }

      examSessions.push({
        day,
        time,
        course: courseIndex,
        venue: venueIndex,
        students: studentIndices
      });

      sessionIndex++;
    }
    if (sessionIndex >= numSessions) break;
  }

  let totalRegistrations = 0;
  const entries = [];

  for (const session of examSessions) {
    const examDate = new Date(startDate);
    examDate.setDate(examDate.getDate() + session.day - 1);

    const [hours, minutes] = session.time.split(':');
    const startTime = new Date(examDate);
    startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 180); // 3 hours

    const course = courses[session.course];
    const venue = venues[session.venue];
    const sessionStudents = session.students.map(idx => students[idx]);

    // Create exam entry
    const entry = await prisma.examTimetableEntry.create({
      data: {
        timetableId: timetable.id,
        courseId: course.id,
        level: course.level,
        examDate,
        startTime,
        endTime,
        duration: 180,
        venueId: venue.id,
        seatingCapacity: venue.capacity,
        studentCount: sessionStudents.length,
        status: 'SCHEDULED',
        notes: `${course.name} examination`
      }
    });

    entries.push(entry);

    // Create room assignment
    if (venue.rooms.length > 0) {
      await prisma.examTimetableRoom.create({
        data: {
          timetableEntryId: entry.id,
          roomId: venue.rooms[0].id,
          capacity: venue.rooms[0].capacity
        }
      });
    }

    // Create ExamLogistics record
    await prisma.examLogistics.create({
      data: {
        examEntryId: entry.id,
        totalExpected: sessionStudents.length,
        totalPresent: 0,
        totalAbsent: 0,
        totalLateArrivals: 0,
        scriptsSubmitted: 0,
        scriptsCollected: 0,
        scriptsPending: sessionStudents.length,
        invigilatorsAssigned: 0,
        invigilatorsPresent: 0,
        invigilatorsAbsent: 0,
        sessionStatus: 'NOT_STARTED',
        dataVerificationStatus: 'PENDING',
        hasIncidents: false,
        hasUnresolvedIncidents: false,
        capacityExceeded: false
      }
    });

    // Create exam registrations with QR codes
    for (const student of sessionStudents) {
      const qrCode = generateQRCode(student.id, entry.id, course.code);

      await prisma.examRegistration.create({
        data: {
          studentId: student.id,
          examEntryId: entry.id,
          studentQRCode: qrCode,
          isPresent: false,
          scriptSubmitted: false,
          seatNumber: `${String.fromCharCode(65 + Math.floor(totalRegistrations / 10))}${(totalRegistrations % 10) + 1}`
        }
      });

      totalRegistrations++;
    }

    console.log(`✅ Session ${entries.length}: ${course.code} - ${course.name}`);
    console.log(`   Date: ${examDate.toDateString()} at ${session.time}`);
    console.log(`   Venue: ${venue.name}`);
    console.log(`   Students: ${sessionStudents.length}`);
  }

  console.log(`\n✅ Created ${entries.length} exam sessions`);
  console.log(`✅ Created ${totalRegistrations} exam registrations\n`);

  // 4. Update timetable statistics
  await prisma.examTimetable.update({
    where: { id: timetable.id },
    data: {
      totalExams: entries.length,
      totalConflicts: 0
    }
  });

  // 5. Summary
  console.log('📊 Summary:');
  console.log('━'.repeat(50));
  console.log(`Timetable ID:        ${timetable.id}`);
  console.log(`Title:               ${timetable.title}`);
  console.log(`Status:              ${timetable.status} (${timetable.isPublished ? 'Published' : 'Draft'})`);
  console.log(`Period:              ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
  console.log(`Exam Sessions:       ${entries.length}`);
  console.log(`Total Registrations: ${totalRegistrations}`);
  console.log(`Venues Used:         ${new Set(entries.map(e => e.venueId)).size}`);
  console.log('━'.repeat(50));
  console.log('\n✅ Active timetable seed completed successfully!\n');

  // Print first few QR codes for testing
  const sampleRegistrations = await prisma.examRegistration.findMany({
    take: 3,
    include: {
      student: { select: { firstName: true, lastName: true, email: true } },
      examEntry: {
        include: {
          course: { select: { code: true, name: true } },
          venue: { select: { name: true } }
        }
      }
    }
  });

  console.log('🎫 Sample QR Codes for Testing:');
  console.log('━'.repeat(50));
  for (const reg of sampleRegistrations) {
    console.log(`Student: ${reg.student.firstName} ${reg.student.lastName}`);
    console.log(`Email:   ${reg.student.email}`);
    console.log(`Course:  ${reg.examEntry.course.code} - ${reg.examEntry.course.name}`);
    console.log(`Venue:   ${reg.examEntry.venue.name}`);
    console.log(`QR Code: ${reg.studentQRCode}`);
    console.log(`Seat:    ${reg.seatNumber}`);
    console.log('');
  }
  console.log('━'.repeat(50));
}

/**
 * Generate unique QR code for student exam registration
 */
function generateQRCode(studentId: number, examEntryId: number, courseCode: string): string {
  const timestamp = Date.now();
  const randomPart = crypto.randomBytes(4).toString('hex');
  return `EXAM-${courseCode}-S${studentId}-E${examEntryId}-${timestamp}-${randomPart}`.toUpperCase();
}

main()
  .catch((e) => {
    console.error('❌ Error seeding active timetable:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
