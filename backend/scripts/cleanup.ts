import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Cleaning existing data...');

  // Delete in reverse dependency order to avoid foreign key constraints
  // Note: audit_logs table was removed, replaced with exam_session_logs
  // await prisma.auditLog.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.scriptMovement.deleteMany();
  await prisma.script.deleteMany();
  await prisma.examSession.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.studentAssessment.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.assessmentType.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.courseLecturer.deleteMany();
  await prisma.courseOffering.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.programCourse.deleteMany();
  await prisma.course.deleteMany();
  await prisma.program.deleteMany();
  await prisma.programPrefix.deleteMany();
  await prisma.lecturerDepartment.deleteMany();
  await prisma.room.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.lecturerProfile.deleteMany();
  await prisma.invigilatorProfile.deleteMany();
  await prisma.scriptHandlerProfile.deleteMany();
  await prisma.examOfficerProfile.deleteMany();
  await prisma.facultyAdminProfile.deleteMany();
  await prisma.adminProfile.deleteMany();
  await prisma.department.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  console.log('✅ Database cleaned successfully');
}

cleanDatabase()
  .then(async () => {
    await prisma.$disconnect();
    console.log('🎉 Database cleanup completed!');
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('💥 Cleanup failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
