/**
 * Reset and Create Active Timetable
 * - Deletes all existing exam timetables
 * - Creates a new active, published timetable for testing
 * - Adds exams with proper dates for DEV_MODE testing
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetAndCreateActiveTimetable() {
  console.log('🚀 Starting timetable reset and creation...\n');

  try {
    // Step 1: Delete all existing exam timetables and related data
    console.log('🗑️  Deleting existing timetables...');

    // Delete in proper order to respect foreign key constraints
    await prisma.examSessionLog.deleteMany();
    await prisma.examLogistics.deleteMany();
    await prisma.examRegistration.deleteMany();
    await prisma.examTimetableEntry.deleteMany();
    await prisma.examTimetable.deleteMany();

    console.log('✅ All timetables deleted\n');

    // Step 2: Get necessary data for timetable creation
    console.log('📋 Fetching required data...');

    const semester = await prisma.semester.findFirst({
      where: { isCurrent: true }
    });

    if (!semester) {
      throw new Error('No current semester found. Please create one first.');
    }

    // Get programs with their courses
    const programs = await prisma.program.findMany({
      where: { isActive: true },
      include: {
        programCourses: {
          include: {
            course: true
          },
          where: {
            semester: semester.semesterNumber
          },
          take: 3
        }
      },
      take: 2 // Get 2 programs for testing
    });

    if (programs.length === 0) {
      throw new Error('No programs found.');
    }

    // Extract unique courses from all programs
    const courseMap = new Map();
    programs.forEach(program => {
      program.programCourses.forEach(pc => {
        if (!courseMap.has(pc.courseId)) {
          courseMap.set(pc.courseId, {
            course: pc.course,
            level: pc.level,
            programs: [program.id]
          });
        } else {
          courseMap.get(pc.courseId).programs.push(program.id);
        }
      });
    });

    const coursesData = Array.from(courseMap.values());

    if (coursesData.length === 0) {
      throw new Error('No courses found for current semester in active programs.');
    }

    const venue = await prisma.venue.findFirst({
      include: {
        rooms: true
      }
    });

    if (!venue) {
      throw new Error('No venue found. Please create one first.');
    }

    // Get or create rooms for the venue
    let rooms = venue.rooms;
    if (rooms.length === 0) {
      // Create default rooms if none exist
      const room1 = await prisma.room.create({
        data: {
          name: 'Hall A',
          capacity: 200,
          venueId: venue.id
        }
      });
      const room2 = await prisma.room.create({
        data: {
          name: 'Hall B',
          capacity: 200,
          venueId: venue.id
        }
      });
      const room3 = await prisma.room.create({
        data: {
          name: 'Hall C',
          capacity: 100,
          venueId: venue.id
        }
      });
      rooms = [room1, room2, room3];
    }

    const academicYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true }
    });

    if (!academicYear) {
      throw new Error('No current academic year found.');
    }

    const institution = await prisma.institution.findFirst();
    if (!institution) {
      throw new Error('No institution found.');
    }

    const creator = await prisma.user.findFirst({
      where: {
        roleProfiles: {
          some: {
            role: { in: ['SUPER_ADMIN', 'ADMIN', 'EXAMS_OFFICER'] }
          }
        }
      }
    });

    if (!creator) {
      throw new Error('No admin user found to create timetable.');
    }

    console.log(`✅ Found ${programs.length} programs with ${coursesData.length} courses for ${semester.name}`);
    console.log(`✅ Venue: ${venue.name} with ${rooms.length} room(s)\n`);

    // Step 3: Create new active timetable
    console.log('📅 Creating new active exam timetable...');

    const now = new Date();
    const timetable = await prisma.examTimetable.create({
      data: {
        title: `${semester.name} Exams - Active (DEV)`,
        institutionId: institution.id,
        semesterId: semester.id,
        academicYearId: academicYear.id,
        startDate: now,
        endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isPublished: true,
        status: 'PUBLISHED',
        description: 'Active timetable for testing - DEV_MODE bypasses all time checks',
        createdBy: creator.id,
        publishedBy: creator.id,
        publishedAt: now
      }
    });

    console.log(`✅ Timetable created: ${timetable.title} (ID: ${timetable.id})\n`);

    // Step 4: Create exam entries with program links
    console.log('📝 Creating exam entries with program assignments...');

    const examEntries = [];
    const baseDate = new Date(2024, 11, 1); // December 1, 2024

    for (let i = 0; i < coursesData.length; i++) {
      const { course, level, programs: programIds } = coursesData[i];
      const examDate = new Date(baseDate);
      examDate.setDate(baseDate.getDate() + i * 2);

      const startTime = new Date(examDate);
      startTime.setHours(9, 0, 0, 0);

      const endTime = new Date(examDate);
      endTime.setHours(12, 0, 0, 0);

      // Create exam entry with level - DRAFT status for Exams Officer to review
      const examEntry = await prisma.examTimetableEntry.create({
        data: {
          timetableId: timetable.id,
          courseId: course.id,
          venueId: venue.id,
          level: level,
          examDate: examDate,
          startTime: startTime,
          endTime: endTime,
          duration: 180,
          status: 'DRAFT', // Draft - Exams Officer will update after assigning invigilators
          notes: 'DEV_MODE - Time checks bypassed. Awaiting invigilator assignment.'
        },
        include: {
          course: true,
          venue: true
        }
      });

      // Link programs to this exam entry
      for (const programId of programIds) {
        await prisma.examTimetableProgram.create({
          data: {
            timetableEntryId: examEntry.id,
            programId: programId
          }
        });
      }

      // Assign rooms to this exam entry (distribute across available rooms)
      const numRooms = Math.min(rooms.length, 2); // Use 1-2 rooms per exam
      for (let r = 0; r < numRooms; r++) {
        const room = rooms[r % rooms.length];
        await prisma.examTimetableRoom.create({
          data: {
            timetableEntryId: examEntry.id,
            roomId: room.id,
            capacity: Math.floor(room.capacity / numRooms) // Divide capacity among rooms
          }
        });
      }

      examEntries.push(examEntry);
      console.log(`  ✅ ${course.code} (Level ${level}): ${examDate.toDateString()} - ${programIds.length} program(s), ${numRooms} room(s)`);
    }

    console.log(`\n✅ Created ${examEntries.length} exam entries with program and room assignments\n`);

    // Step 5: Register students for exams
    console.log('👥 Registering students for exams...');

    const students = await prisma.user.findMany({
      where: {
        roleProfiles: {
          some: {
            role: 'STUDENT',
            isActive: true
          }
        }
      },
      take: 5
    });

    let registrationCount = 0;
    for (const student of students) {
      for (let i = 0; i < examEntries.length; i++) {
        const examEntry = examEntries[i];

        // Create exam registration
        await prisma.examRegistration.create({
          data: {
            studentId: student.id,
            examEntryId: examEntry.id,
            studentQRCode: `${student.id}-${examEntry.id}-${Date.now()}`,
            seatNumber: `A${registrationCount + 1}`,
            isPresent: false
          }
        });

        // Create exam logistics if not exists
        const existingLogistics = await prisma.examLogistics.findUnique({
          where: { examEntryId: examEntry.id }
        });

        if (!existingLogistics) {
          await prisma.examLogistics.create({
            data: {
              examEntryId: examEntry.id,
              totalExpected: students.length,
              totalPresent: 0,
              totalAbsent: 0
            }
          });
        }

        registrationCount++;
      }
    }

    console.log(`✅ Registered ${students.length} students for ${examEntries.length} exams\n`);

    // Step 6: Summary
    console.log('📊 Summary:');
    console.log('─────────────────────────────────────');
    console.log(`Timetable: ${timetable.title}`);
    console.log(`Status: ${timetable.status} (Published: ${timetable.isPublished})`);
    console.log(`Semester: ${semester.name}`);
    console.log(`Programs: ${programs.length}`);
    console.log(`Exam Entries: ${examEntries.length} (Status: DRAFT)`);
    console.log(`Rooms Assigned: Yes (${rooms.length} available)`);
    console.log(`Invigilators: Not assigned - Exams Officer to assign`);
    console.log(`Student Registrations: ${registrationCount}`);
    console.log('\n🎯 DEV_MODE: All time/date checks bypassed');
    console.log('📍 Check-in available for ALL exams anytime');
    console.log('⚠️  Exam entries in DRAFT - Update to CONFIRMED after invigilator assignment');
    console.log('─────────────────────────────────────\n');

    console.log('✅ Timetable reset and creation completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
resetAndCreateActiveTimetable()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
