import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Verify Active Timetable Data
 *
 * Checks that the active timetable seed ran successfully
 */

async function main() {
  console.log('🔍 Verifying Active Timetable Data...\n');

  // 1. Check for published timetables
  console.log('📅 Checking Timetables:');
  const timetables = await prisma.examTimetable.findMany({
    where: {
      isPublished: true,
      status: 'PUBLISHED'
    },
    include: {
      academicYear: true,
      semester: true,
      faculty: true
    },
    orderBy: { createdAt: 'desc' }
  });

  if (timetables.length === 0) {
    console.log('❌ No published timetables found\n');
    return;
  }

  console.log(`✅ Found ${timetables.length} published timetable(s)\n`);

  for (const timetable of timetables) {
    console.log('━'.repeat(60));
    console.log(`Timetable: ${timetable.title}`);
    console.log(`ID:        ${timetable.id}`);
    console.log(`Status:    ${timetable.status} (Published: ${timetable.isPublished})`);
    console.log(`Academic:  ${timetable.academicYear.yearCode} - ${timetable.semester.name}`);
    console.log(`Faculty:   ${timetable.faculty?.name || 'N/A'}`);
    console.log(`Period:    ${timetable.startDate.toDateString()} to ${timetable.endDate.toDateString()}`);
    console.log(`Created:   ${timetable.createdAt.toLocaleString()}`);
    console.log('━'.repeat(60));

    // 2. Check exam entries
    console.log('\n📝 Checking Exam Sessions:');
    const entries = await prisma.examTimetableEntry.findMany({
      where: { timetableId: timetable.id },
      include: {
        course: true,
        venue: true,
        _count: {
          select: {
            examRegistrations: true,
            invigilatorAssignments: true,
            studentVerifications: true
          }
        }
      },
      orderBy: [{ examDate: 'asc' }, { startTime: 'asc' }]
    });

    if (entries.length === 0) {
      console.log('❌ No exam sessions found for this timetable\n');
      continue;
    }

    console.log(`✅ Found ${entries.length} exam sessions\n`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let upcomingSessions = 0;
    let pastSessions = 0;
    let todaySessions = 0;

    for (const entry of entries) {
      const examDate = new Date(entry.examDate);
      examDate.setHours(0, 0, 0, 0);

      const dayDiff = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      let timeStatus = '';

      if (dayDiff < 0) {
        pastSessions++;
        timeStatus = `(${Math.abs(dayDiff)} days ago)`;
      } else if (dayDiff === 0) {
        todaySessions++;
        timeStatus = '(TODAY)';
      } else {
        upcomingSessions++;
        timeStatus = `(in ${dayDiff} days)`;
      }

      console.log(`Session #${entry.id}:`);
      console.log(`  Course:        ${entry.course.code} - ${entry.course.name}`);
      console.log(`  Date:          ${entry.examDate.toDateString()} ${timeStatus}`);
      console.log(`  Time:          ${entry.startTime.toLocaleTimeString()} - ${entry.endTime.toLocaleTimeString()}`);
      console.log(`  Duration:      ${entry.duration} minutes`);
      console.log(`  Venue:         ${entry.venue.name} (Capacity: ${entry.venue.capacity})`);
      console.log(`  Status:        ${entry.status}`);
      console.log(`  Students:      ${entry.studentCount || 0} expected, ${entry._count.examRegistrations} registered`);
      console.log(`  Invigilators:  ${entry._count.invigilatorAssignments} assigned`);
      console.log(`  Check-ins:     ${entry._count.studentVerifications} verified`);
      console.log('');
    }

    console.log('Session Timing:');
    console.log(`  📅 Today:     ${todaySessions}`);
    console.log(`  ⏭️  Upcoming:  ${upcomingSessions}`);
    console.log(`  ⏮️  Past:      ${pastSessions}`);

    // 3. Check exam registrations
    console.log('\n👥 Checking Exam Registrations:');
    const registrations = await prisma.examRegistration.findMany({
      where: {
        examEntry: { timetableId: timetable.id }
      }
    });

    const registrationStats = {
      total: registrations.length,
      present: registrations.filter(r => r.isPresent).length,
      absent: registrations.filter(r => !r.isPresent).length,
      submitted: registrations.filter(r => r.scriptSubmitted).length,
      withQR: registrations.filter(r => r.studentQRCode).length,
      withSeat: registrations.filter(r => r.seatNumber).length
    };

    console.log(`✅ Total Registrations: ${registrationStats.total}`);
    console.log(`   Present:             ${registrationStats.present} (${((registrationStats.present / registrationStats.total) * 100).toFixed(1)}%)`);
    console.log(`   Absent:              ${registrationStats.absent} (${((registrationStats.absent / registrationStats.total) * 100).toFixed(1)}%)`);
    console.log(`   Scripts Submitted:   ${registrationStats.submitted}`);
    console.log(`   With QR Code:        ${registrationStats.withQR} (${((registrationStats.withQR / registrationStats.total) * 100).toFixed(1)}%)`);
    console.log(`   With Seat Number:    ${registrationStats.withSeat}`);

    // 4. Check venues
    console.log('\n🏢 Checking Venues:');
    const venueUsage = await prisma.venue.findMany({
      where: {
        timetableEntries: {
          some: { timetableId: timetable.id }
        }
      },
      include: {
        _count: {
          select: { timetableEntries: true }
        }
      }
    });

    console.log(`✅ Venues Used: ${venueUsage.length}`);
    for (const venue of venueUsage) {
      console.log(`   ${venue.name}: ${venue._count.timetableEntries} sessions (Capacity: ${venue.capacity})`);
    }

    // 5. Check exam logistics
    console.log('\n📊 Checking Exam Logistics:');
    const logistics = await prisma.examLogistics.findMany({
      where: {
        examEntry: { timetableId: timetable.id }
      }
    });

    const logisticsStats = {
      total: logistics.length,
      notStarted: logistics.filter(l => l.sessionStatus === 'NOT_STARTED').length,
      inProgress: logistics.filter(l => l.sessionStatus === 'IN_PROGRESS').length,
      completed: logistics.filter(l => l.sessionStatus === 'COMPLETED').length,
      totalExpected: logistics.reduce((sum, l) => sum + l.totalExpected, 0),
      totalPresent: logistics.reduce((sum, l) => sum + l.totalPresent, 0),
      withIncidents: logistics.filter(l => l.hasIncidents).length
    };

    console.log(`✅ Logistics Records: ${logisticsStats.total}`);
    console.log(`   Not Started:   ${logisticsStats.notStarted}`);
    console.log(`   In Progress:   ${logisticsStats.inProgress}`);
    console.log(`   Completed:     ${logisticsStats.completed}`);
    console.log(`   Expected:      ${logisticsStats.totalExpected} students`);
    console.log(`   Present:       ${logisticsStats.totalPresent} students`);
    console.log(`   With Incidents: ${logisticsStats.withIncidents}`);

    // 6. Validation checks
    console.log('\n✔️  Validation Checks:');
    const checks = [
      { name: 'Timetable is published', pass: timetable.isPublished },
      { name: 'Has exam sessions', pass: entries.length > 0 },
      { name: 'All sessions have venues', pass: entries.every(e => e.venueId) },
      { name: 'All sessions have courses', pass: entries.every(e => e.courseId) },
      { name: 'Has exam registrations', pass: registrations.length > 0 },
      { name: 'All registrations have QR codes', pass: registrationStats.withQR === registrationStats.total },
      { name: 'All registrations have seat numbers', pass: registrationStats.withSeat === registrationStats.total },
      { name: 'Logistics records created', pass: logistics.length === entries.length },
      { name: 'Has upcoming sessions', pass: upcomingSessions > 0 }
    ];

    let allPassed = true;
    for (const check of checks) {
      console.log(`   ${check.pass ? '✅' : '❌'} ${check.name}`);
      if (!check.pass) allPassed = false;
    }

    console.log('\n' + '━'.repeat(60));
    if (allPassed) {
      console.log('✅ All validation checks passed!');
      console.log('🚀 Timetable is ready for testing');
    } else {
      console.log('⚠️  Some validation checks failed');
      console.log('Please review the issues above');
    }
    console.log('━'.repeat(60) + '\n');
  }

  // Summary
  console.log('\n📋 Quick Test Guide:');
  console.log('━'.repeat(60));
  console.log('1. Login as Exams Officer:');
  console.log('   Email: exams.officer@tughana.edu.gh');
  console.log('   Password: password123');
  console.log('');
  console.log('2. View Dashboard:');
  console.log('   Navigate to Exams Officer Dashboard');
  console.log('   Select the active timetable');
  console.log('');
  console.log('3. Test Student Check-In:');
  console.log('   Use QR codes from exam registrations');
  console.log('   Or use the sample QR codes printed above');
  console.log('━'.repeat(60));
}

main()
  .catch((e) => {
    console.error('❌ Error verifying timetable:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
