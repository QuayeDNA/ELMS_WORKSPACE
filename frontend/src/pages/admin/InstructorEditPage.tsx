import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useInstructorById, useInstructors } from "@/hooks/useInstructors";
import {
  AcademicRank,
  EmploymentType,
  EmploymentStatus,
} from "@/types/instructor";
import { ArrowLeft, Save, User } from "lucide-react";
import { toast } from "sonner";

const InstructorEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const instructorId = parseInt(id || "0");

  const { instructor, loading: fetchLoading } = useInstructorById(instructorId);
  const { updateInstructor, permissions } = useInstructors();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    user: {
      firstName: string;
      lastName: string;
      middleName: string;
      title?: string;
      phone?: string;
      dateOfBirth: string;
      gender?: string;
      nationality?: string;
      address?: string;
    };
    profile: {
      academicRank?: AcademicRank;
      employmentType: EmploymentType;
      employmentStatus: EmploymentStatus;
      hireDate: string;
      highestQualification: string;
      specialization: string;
      researchInterests: string;
      officeLocation: string;
      officeHours: string;
      biography: string;
      profileImageUrl: string;
      canCreateExams: boolean;
      canGradeScripts: boolean;
      canViewResults: boolean;
      canTeachCourses: boolean;
    };
  }>({
    user: {
      firstName: "",
      lastName: "",
      middleName: "",
      title: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      nationality: "",
      address: "",
    },
    profile: {
      academicRank: undefined,
      employmentType: EmploymentType.FULL_TIME,
      employmentStatus: EmploymentStatus.ACTIVE,
      hireDate: "",
      highestQualification: "",
      specialization: "",
      researchInterests: "",
      officeLocation: "",
      officeHours: "",
      biography: "",
      profileImageUrl: "",
      canCreateExams: true,
      canGradeScripts: true,
      canViewResults: true,
      canTeachCourses: true,
    },
  });

  // Load instructor data when component mounts
  useEffect(() => {
    if (instructor) {
      setFormData({
        user: {
          firstName: instructor.user.firstName,
          lastName: instructor.user.lastName,
          middleName: instructor.user.middleName || "",
          title: instructor.user.title || "",
          phone: instructor.user.phone || "",
          dateOfBirth: instructor.user.dateOfBirth
            ? new Date(instructor.user.dateOfBirth).toISOString().split("T")[0]
            : "",
          gender: instructor.user.gender || "",
          nationality: instructor.user.nationality || "",
          address: instructor.user.address || "",
        },
        profile: {
          academicRank: instructor.academicRank || undefined,
          employmentType: instructor.employmentType,
          employmentStatus: instructor.employmentStatus,
          hireDate: instructor.hireDate
            ? new Date(instructor.hireDate).toISOString().split("T")[0]
            : "",
          highestQualification: instructor.highestQualification || "",
          specialization: instructor.specialization || "",
          researchInterests: instructor.researchInterests || "",
          officeLocation: instructor.officeLocation || "",
          officeHours: instructor.officeHours || "",
          biography: instructor.biography || "",
          profileImageUrl: instructor.profileImageUrl || "",
          canCreateExams: instructor.canCreateExams,
          canGradeScripts: instructor.canGradeScripts,
          canViewResults: instructor.canViewResults,
          canTeachCourses: instructor.canTeachCourses,
        },
      });
    }
  }, [instructor]);

  if (!permissions.canUpdate) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You do not have permission to edit instructors.
          </p>
          <Button onClick={() => navigate("/admin/instructors")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Instructors
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert date strings to Date objects if provided
      const submitData = {
        ...formData,
        user: {
          ...formData.user,
          dateOfBirth: formData.user.dateOfBirth
            ? new Date(formData.user.dateOfBirth).toISOString()
            : undefined,
        },
        profile: {
          ...formData.profile,
          hireDate: formData.profile.hireDate
            ? new Date(formData.profile.hireDate).toISOString()
            : undefined,
        },
      };

      await updateInstructor(instructorId, submitData);
      toast.success("Instructor updated successfully");
      navigate(`/admin/instructors/${instructorId}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update instructor"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateUserField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        [field]: value,
      },
    }));
  };

  const updateProfileField = (
    field: string,
    value: string | boolean | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value,
      },
    }));
  };

  if (fetchLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Instructor Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The instructor you're trying to edit doesn't exist.
          </p>
          <Button onClick={() => navigate("/admin/instructors")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Instructors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/instructors/${instructorId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Instructor
            </h1>
            <p className="text-gray-600">Update instructor information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.user.firstName}
                  onChange={(e) => updateUserField("firstName", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.user.lastName}
                  onChange={(e) => updateUserField("lastName", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  value={formData.user.middleName}
                  onChange={(e) =>
                    updateUserField("middleName", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Select
                  value={formData.user.title}
                  onValueChange={(value) => updateUserField("title", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr">Dr</SelectItem>
                    <SelectItem value="Prof">Prof</SelectItem>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.user.phone}
                  onChange={(e) => updateUserField("phone", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.user.dateOfBirth}
                  onChange={(e) =>
                    updateUserField("dateOfBirth", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.user.gender}
                  onValueChange={(value) => updateUserField("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={formData.user.nationality}
                  onChange={(e) =>
                    updateUserField("nationality", e.target.value)
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.user.address}
                onChange={(e) => updateUserField("address", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="academicRank">Academic Rank</Label>
                <Select
                  value={formData.profile.academicRank}
                  onValueChange={(value) =>
                    updateProfileField("academicRank", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic rank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AcademicRank.GRADUATE_ASSISTANT}>
                      Graduate Assistant
                    </SelectItem>
                    <SelectItem value={AcademicRank.ASSISTANT_LECTURER}>
                      Assistant Lecturer
                    </SelectItem>
                    <SelectItem value={AcademicRank.LECTURER}>
                      Lecturer
                    </SelectItem>
                    <SelectItem value={AcademicRank.SENIOR_LECTURER}>
                      Senior Lecturer
                    </SelectItem>
                    <SelectItem value={AcademicRank.PRINCIPAL_LECTURER}>
                      Principal Lecturer
                    </SelectItem>
                    <SelectItem value={AcademicRank.ASSOCIATE_PROFESSOR}>
                      Associate Professor
                    </SelectItem>
                    <SelectItem value={AcademicRank.PROFESSOR}>
                      Professor
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select
                  value={formData.profile.employmentType}
                  onValueChange={(value) =>
                    updateProfileField("employmentType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EmploymentType.FULL_TIME}>
                      Full Time
                    </SelectItem>
                    <SelectItem value={EmploymentType.PART_TIME}>
                      Part Time
                    </SelectItem>
                    <SelectItem value={EmploymentType.CONTRACT}>
                      Contract
                    </SelectItem>
                    <SelectItem value={EmploymentType.VISITING}>
                      Visiting
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="employmentStatus">Employment Status</Label>
                <Select
                  value={formData.profile.employmentStatus}
                  onValueChange={(value) =>
                    updateProfileField("employmentStatus", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EmploymentStatus.ACTIVE}>
                      Active
                    </SelectItem>
                    <SelectItem value={EmploymentStatus.ON_LEAVE}>
                      On Leave
                    </SelectItem>
                    <SelectItem value={EmploymentStatus.RETIRED}>
                      Retired
                    </SelectItem>
                    <SelectItem value={EmploymentStatus.TERMINATED}>
                      Terminated
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="hireDate">Hire Date</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.profile.hireDate}
                  onChange={(e) =>
                    updateProfileField("hireDate", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="highestQualification">
                  Highest Qualification
                </Label>
                <Input
                  id="highestQualification"
                  value={formData.profile.highestQualification}
                  onChange={(e) =>
                    updateProfileField("highestQualification", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={formData.profile.specialization}
                  onChange={(e) =>
                    updateProfileField("specialization", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="officeLocation">Office Location</Label>
                <Input
                  id="officeLocation"
                  value={formData.profile.officeLocation}
                  onChange={(e) =>
                    updateProfileField("officeLocation", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="officeHours">Office Hours</Label>
                <Input
                  id="officeHours"
                  value={formData.profile.officeHours}
                  onChange={(e) =>
                    updateProfileField("officeHours", e.target.value)
                  }
                  placeholder="e.g., Mon-Fri 9AM-5PM"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="researchInterests">Research Interests</Label>
              <Textarea
                id="researchInterests"
                value={formData.profile.researchInterests}
                onChange={(e) =>
                  updateProfileField("researchInterests", e.target.value)
                }
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="biography">Biography</Label>
              <Textarea
                id="biography"
                value={formData.profile.biography}
                onChange={(e) =>
                  updateProfileField("biography", e.target.value)
                }
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canCreateExams"
                  checked={formData.profile.canCreateExams}
                  onCheckedChange={(checked) =>
                    updateProfileField("canCreateExams", checked)
                  }
                />
                <Label htmlFor="canCreateExams">Can Create Exams</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canGradeScripts"
                  checked={formData.profile.canGradeScripts}
                  onCheckedChange={(checked) =>
                    updateProfileField("canGradeScripts", checked)
                  }
                />
                <Label htmlFor="canGradeScripts">Can Grade Scripts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canViewResults"
                  checked={formData.profile.canViewResults}
                  onCheckedChange={(checked) =>
                    updateProfileField("canViewResults", checked)
                  }
                />
                <Label htmlFor="canViewResults">Can View Results</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canTeachCourses"
                  checked={formData.profile.canTeachCourses}
                  onCheckedChange={(checked) =>
                    updateProfileField("canTeachCourses", checked)
                  }
                />
                <Label htmlFor="canTeachCourses">Can Teach Courses</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/admin/instructors/${instructorId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Updating..." : "Update Instructor"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InstructorEditPage;
