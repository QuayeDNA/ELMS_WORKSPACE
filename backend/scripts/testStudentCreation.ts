import { studentService } from "../src/services/studentService";

async function testStudentCreation() {
  console.log("Testing student creation with auto-generated index number...");

  try {
    const studentData = {
      user: {
        email: "test.student@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "Student",
        phone: "+233123456789",
      },
      profile: {
        studentId: "STU001",
        level: 100,
        semester: 1,
        programId: 1, // BSc-CS program
      },
    };

    const result = await studentService.createStudent(studentData);
    console.log("Student created successfully!");
    console.log("Student ID:", result.studentId);
    console.log("Index Number:", result.indexNumber);
    console.log("Full result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error creating student:", error);
  }
}

testStudentCreation();
