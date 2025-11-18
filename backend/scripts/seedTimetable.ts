import { PrismaClient, ExamTimetableStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTimetableForInstitution2() {
  console.log('📅 Starting timetable seeding for institution ID 2...');

  try {
    // Check if institution 2 exists
    const institution = await prisma.institution.findUnique({
      where: { id: 2 }
    });

    if (!institution) {
      console.log('❌ Institution ID 2 not found. Creating it...');

      // Create institution 2
      const newInstitution = await prisma.institution.create({
        data: {
          name: 'University of Ghana',
          code: 'UG',
          type: 'UNIVERSITY',
          status: 'ACTIVE',
          establishedYear: 1948,
          address: 'Legon, Accra',
          city: 'Accra',
          state: 'Greater Accra',
          country: 'Ghana',
          contactEmail: 'info@ug.edu.gh',
          contactPhone: '+233-30-555-0200',
          website: 'https://www.ug.edu.gh',
          description: 'The premier university in Ghana, offering comprehensive education across multiple disciplines.',
          logoUrl: 'https://www.ug.edu.gh/assets/logo.png'
        }
      });

      console.log(`✅ Created institution: ${newInstitution.name} (ID: ${newInstitution.id})`);
    } else {
      console.log(`✅ Found institution: ${institution.name} (ID: ${institution.id})`);
    }

    // Get all programs for institution 2
    const programs = await prisma.program.findMany({
      where: {
        department: {
          faculty: {
            institutionId: 2
          }
        }
      },
      include: {
        department: {
          include: {
            faculty: true
          }
        }
      }
    });

    console.log(`📚 Found ${programs.length} programs for institution 2`);

    if (programs.length === 0) {
      console.log('⚠️ No programs found for institution 2. Creating sample programs and courses...');
      await createSampleProgramsAndCourses();
      // Re-fetch programs after creation
      const updatedPrograms = await prisma.program.findMany({
        where: {
          department: {
            faculty: {
              institutionId: 2
            }
          }
        },
        include: {
          department: {
            include: {
              faculty: true
            }
          }
        }
      });
      programs.push(...updatedPrograms);
    }

    // Get academic year and semester for institution 2
    let academicYear = await prisma.academicYear.findFirst({
      where: {
        institutionId: 2,
        yearCode: '2024/2025'
      }
    });

    if (!academicYear) {
      academicYear = await prisma.academicYear.create({
        data: {
          yearCode: '2024/2025',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2025-06-30'),
          isCurrent: true,
          institutionId: 2
        }
      });
      console.log(`✅ Created academic year: ${academicYear.yearCode}`);
    }

    let semester = await prisma.semester.findFirst({
      where: {
        academicYearId: academicYear.id,
        semesterNumber: 1
      }
    });

    if (!semester) {
      semester = await prisma.semester.create({
        data: {
          academicYearId: academicYear.id,
          semesterNumber: 1,
          name: 'Semester 1',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2025-01-15'),
          isCurrent: true
        }
      });
      console.log(`✅ Created semester: ${semester.name}`);
    }

    // Create academic period for exams
    let academicPeriod = await prisma.academicPeriod.findFirst({
      where: {
        semesterId: semester.id
      }
    });

    if (!academicPeriod) {
      academicPeriod = await prisma.academicPeriod.create({
        data: {
          semesterId: semester.id,
          examStartDate: new Date('2024-12-16'),
          examEndDate: new Date('2025-01-10'),
          registrationStartDate: new Date('2024-11-01'),
          registrationEndDate: new Date('2024-11-30'),
          lectureStartDate: new Date('2024-09-01'),
          lectureEndDate: new Date('2024-12-15'),
          resultsReleaseDate: new Date('2025-02-15'),
          maxCreditsPerStudent: 24,
          minCreditsPerStudent: 12,
          isActive: true,
          isRegistrationOpen: false,
          isAddDropOpen: false
        }
      });
      console.log(`✅ Created academic period for semester ${semester.name}`);
    }

    // Get a user to use as createdBy (preferably an admin)
    const adminUser = await prisma.user.findFirst({
      where: {
        institutionId: 2,
        role: { in: ['SUPER_ADMIN', 'ADMIN', 'EXAMS_OFFICER'] }
      }
    });

    if (!adminUser) {
      throw new Error('No admin user found for institution 2. Please create an admin user first.');
    }

    // Create the timetable
    const timetable = await prisma.examTimetable.create({
      data: {
        title: 'End of Semester 1 Examinations 2024/2025',
        description: 'Comprehensive examination timetable covering all programs and courses for Semester 1, 2024/2025 academic year.',
        academicYearId: academicYear.id,
        semesterId: semester.id,
        academicPeriodId: academicPeriod.id,
        institutionId: 2,
        startDate: new Date('2024-12-16'),
        endDate: new Date('2025-01-10'),
        status: ExamTimetableStatus.DRAFT,
        isPublished: false,
        allowOverlaps: false,
        autoResolveConflicts: true,
        defaultExamDuration: 180, // 3 hours
        totalExams: 0, // Will be updated after creating entries
        totalConflicts: 0,
        createdBy: adminUser.id
      }
    });

    console.log(`✅ Created timetable: ${timetable.title} (ID: ${timetable.id})`);

    // Get all courses linked to programs
    const programCourses = await prisma.programCourse.findMany({
      where: {
        program: {
          department: {
            faculty: {
              institutionId: 2
            }
          }
        },
        semester: 1 // Only semester 1 courses
      },
      include: {
        program: true,
        course: true
      }
    });

    console.log(`📖 Found ${programCourses.length} program-course links for semester 1`);

    // Get venues for institution 2
    let venues = await prisma.venue.findMany({
      where: { institutionId: 2 },
      include: { rooms: true }
    });

    if (venues.length === 0) {
      console.log('🏫 No venues found for institution 2. Creating sample venues...');
      venues = await createSampleVenues();
    }

    // Get invigilators (lecturers) for institution 2
    const invigilators = await prisma.user.findMany({
      where: {
        institutionId: 2,
        role: 'LECTURER'
      }
    });

    console.log(`👨‍🏫 Found ${invigilators.length} invigilators for institution 2`);

    // Create timetable entries
    const examDates = [
      new Date('2024-12-16'),
      new Date('2024-12-17'),
      new Date('2024-12-18'),
      new Date('2024-12-19'),
      new Date('2024-12-20'),
      new Date('2025-01-06'),
      new Date('2025-01-07'),
      new Date('2025-01-08'),
      new Date('2025-01-09'),
      new Date('2025-01-10')
    ];

    const timeSlots = [
      { start: '09:00', end: '12:00' },
      { start: '14:00', end: '17:00' }
    ];

    let entryCount = 0;
    let currentDateIndex = 0;
    let currentTimeSlotIndex = 0;

    // Group courses by level for better scheduling
    const coursesByLevel = programCourses.reduce((acc, pc) => {
      if (!acc[pc.level]) acc[pc.level] = [];
      acc[pc.level].push(pc);
      return acc;
    }, {} as Record<number, typeof programCourses>);

    // Schedule exams level by level
    for (const level of Object.keys(coursesByLevel).sort()) {
      const levelCourses = coursesByLevel[parseInt(level)];

      for (const programCourse of levelCourses) {
        // Get all programs that offer this course at this level
        const relevantPrograms = await prisma.programCourse.findMany({
          where: {
            courseId: programCourse.courseId,
            level: programCourse.level,
            semester: 1
          },
          include: {
            program: true
          }
        });

        const programIds = relevantPrograms.map(pc => pc.programId);

        // Select venue and invigilators
        const venue = venues[entryCount % venues.length];
        const numInvigilators = Math.min(3, invigilators.length);
        const selectedInvigilators = invigilators.slice(0, numInvigilators);

        // Calculate exam time
        const examDate = examDates[currentDateIndex % examDates.length];
        const timeSlot = timeSlots[currentTimeSlotIndex % timeSlots.length];

        const startTime = new Date(examDate);
        const [startHour, startMinute] = timeSlot.start.split(':').map(Number);
        startTime.setHours(startHour, startMinute, 0, 0);

        const endTime = new Date(examDate);
        const [endHour, endMinute] = timeSlot.end.split(':').map(Number);
        endTime.setHours(endHour, endMinute, 0, 0);

        // Create timetable entry
        await prisma.examTimetableEntry.create({
          data: {
            timetableId: timetable.id,
            courseId: programCourse.courseId,
            programIds: JSON.stringify(programIds),
            level: programCourse.level,
            examDate: examDate,
            startTime: startTime,
            endTime: endTime,
            duration: programCourse.course.creditHours * 60, // Convert credit hours to minutes
            venueId: venue.id,
            roomIds: JSON.stringify([venue.rooms[0]?.id || 1]), // Use first room or default
            invigilatorIds: JSON.stringify(selectedInvigilators.map(i => i.id)),
            status: 'SCHEDULED',
            notes: `Level ${programCourse.level} examination for ${programCourse.course.name}`,
            specialRequirements: programCourse.course.prerequisites ?
              `Prerequisites: ${programCourse.course.prerequisites}` : null
          }
        });

        entryCount++;

        // Move to next time slot
        currentTimeSlotIndex++;
        if (currentTimeSlotIndex >= timeSlots.length) {
          currentTimeSlotIndex = 0;
          currentDateIndex++;
        }
      }
    }

    // Update timetable statistics
    await prisma.examTimetable.update({
      where: { id: timetable.id },
      data: {
        totalExams: entryCount
      }
    });

    console.log(`✅ Created ${entryCount} timetable entries`);
    console.log(`🎉 Timetable seeding completed successfully!`);
    console.log(`📊 Summary:`);
    console.log(`- Institution: ID 2`);
    console.log(`- Programs covered: ${programs.length}`);
    console.log(`- Courses scheduled: ${entryCount}`);
    console.log(`- Exam period: Dec 16, 2024 - Jan 10, 2025`);
    console.log(`- Timetable ID: ${timetable.id}`);

  } catch (error) {
    console.error('❌ Error during timetable seeding:', error);
    throw error;
  }
}

async function createSampleProgramsAndCourses() {
  // Create a faculty for institution 2
  const faculty = await prisma.faculty.create({
    data: {
      name: 'Faculty of Arts and Sciences',
      code: 'FAS',
      institutionId: 2,
      deanId: null
    }
  });

  // Create departments
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Computer Science',
        code: 'CS',
        facultyId: faculty.id,
        hodId: null
      }
    }),
    prisma.department.create({
      data: {
        name: 'Mathematics',
        code: 'MATH',
        facultyId: faculty.id,
        hodId: null
      }
    }),
    prisma.department.create({
      data: {
        name: 'English',
        code: 'ENG',
        facultyId: faculty.id,
        hodId: null
      }
    })
  ]);

  // Create programs
  const programs = await Promise.all([
    prisma.program.create({
      data: {
        name: 'Computer Science',
        code: 'BSC_CS_UG',
        type: 'BACHELOR',
        level: 'UNDERGRADUATE',
        durationYears: 4,
        creditHours: 120,
        departmentId: departments[0].id,
        isActive: true
      }
    }),
    prisma.program.create({
      data: {
        name: 'Mathematics',
        code: 'BSC_MATH_UG',
        type: 'BACHELOR',
        level: 'UNDERGRADUATE',
        durationYears: 3,
        creditHours: 90,
        departmentId: departments[1].id,
        isActive: true
      }
    }),
    prisma.program.create({
      data: {
        name: 'English Literature',
        code: 'BA_ENG_UG',
        type: 'BACHELOR',
        level: 'UNDERGRADUATE',
        durationYears: 3,
        creditHours: 90,
        departmentId: departments[2].id,
        isActive: true
      }
    })
  ]);

  // Create courses
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        name: 'Introduction to Computer Science',
        code: 'CS101_UG',
        creditHours: 3,
        level: 100,
        departmentId: departments[0].id,
        isActive: true
      }
    }),
    prisma.course.create({
      data: {
        name: 'Data Structures',
        code: 'CS201_UG',
        creditHours: 3,
        level: 200,
        departmentId: departments[0].id,
        isActive: true
      }
    }),
    prisma.course.create({
      data: {
        name: 'Calculus I',
        code: 'MATH101_UG',
        creditHours: 3,
        level: 100,
        departmentId: departments[1].id,
        isActive: true
      }
    }),
    prisma.course.create({
      data: {
        name: 'English Literature',
        code: 'ENG101_UG',
        creditHours: 3,
        level: 100,
        departmentId: departments[2].id,
        isActive: true
      }
    })
  ]);

  // Create program-course links
  await Promise.all([
    prisma.programCourse.create({
      data: {
        programId: programs[0].id,
        courseId: courses[0].id,
        level: 100,
        semester: 1,
        isRequired: true,
        isCore: true,
        yearInProgram: 1
      }
    }),
    prisma.programCourse.create({
      data: {
        programId: programs[0].id,
        courseId: courses[1].id,
        level: 200,
        semester: 1,
        isRequired: true,
        isCore: true,
        yearInProgram: 2
      }
    }),
    prisma.programCourse.create({
      data: {
        programId: programs[1].id,
        courseId: courses[2].id,
        level: 100,
        semester: 1,
        isRequired: true,
        isCore: true,
        yearInProgram: 1
      }
    }),
    prisma.programCourse.create({
      data: {
        programId: programs[2].id,
        courseId: courses[3].id,
        level: 100,
        semester: 1,
        isRequired: true,
        isCore: true,
        yearInProgram: 1
      }
    })
  ]);

  console.log('✅ Created sample programs and courses for institution 2');
}

async function createSampleVenues() {
  // Create a venue with rooms
  const venue = await prisma.venue.create({
    data: {
      name: 'Main Examination Hall',
      location: 'Central Campus',
      capacity: 500,
      institutionId: 2
    },
    include: {
      rooms: true
    }
  });

  // Create rooms for the venue
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        name: 'Hall A',
        capacity: 100,
        venueId: venue.id
      }
    }),
    prisma.room.create({
      data: {
        name: 'Hall B',
        capacity: 100,
        venueId: venue.id
      }
    }),
    prisma.room.create({
      data: {
        name: 'Hall C',
        capacity: 150,
        venueId: venue.id
      }
    }),
    prisma.room.create({
      data: {
        name: 'Hall D',
        capacity: 150,
        venueId: venue.id
      }
    })
  ]);

  console.log(`✅ Created venue with ${rooms.length} rooms`);
  return [{ ...venue, rooms }];
}

// Run the seeding
seedTimetableForInstitution2()
  .then(async () => {
    await prisma.$disconnect();
    console.log('🎉 Timetable seeding process completed successfully!');
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('💥 Timetable seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
