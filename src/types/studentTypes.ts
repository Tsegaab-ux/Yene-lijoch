import { Organization } from "./organizationTypes";

// Student type based on your Django serializers
export interface Student {
  id: string;
  // Profile fields
  username: string;
  full_name: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image: string | null;
  sex: "male" | "female" | "other";
  address: string;
  contact: string;
  date_of_birth: string;
  // Student fields
  organization: string;
  guardian_name: string;
  guardian_contact: string;
  status: "active" | "inactive" | "graduated" | "transferred";
  enrollment_date: string;
}

export interface StudentListProps {
  students: Student[];
  viewMode: "list" | "grid";
  searchQuery: string;
  filters: {
    status: string;
    organization: string;
    sex: string;
  };
  onToggleStatus: (id: string) => Promise<void>;
}

export interface StudentCreateData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  contact: string;
  date_of_birth: string;
  address: string;
  profile_image: string | null;
  student_details: {
    organization: string;
    guardian_name: string;
    guardian_contact: string;
    status?: string;
    enrollment_date: string;
  };
}

export interface StudentUpdateData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  contact: string;
  date_of_birth: string;
  address: string;
  sex: string;
  profile_image: string | null;
  student_details: {
    organization: string;
    guardian_name: string;
    guardian_contact: string;
    status?: string;
    enrollment_date: string;
  };
}

export interface UseStudentDataReturn {
  students: Student[];
  student: StudentDetail | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  fetchStudents: () => Promise<void>;
  fetchStudent: (id: string) => Promise<Student>;
  createStudent: (studentData: StudentCreateData) => Promise<Student>;
  updateStudent: (id: string, studentData: StudentUpdateData) => Promise<Student>;
  deleteStudent: (id: string) => Promise<void>;
  toggleStudentStatus: (id: string) => Promise<Student>;
  getCurrentStudentProfile: () => Promise<Student>;
  fetchDeactivatedStudents: () => Promise<void>;
  reactivateStudent: (studentId: number) => Promise<boolean>;
  permanentDeleteStudent: (studentId: number) => Promise<boolean>;
  enrollStudent: (studentId: string, classData: any) => Promise<any>;
  getStudentGrades: (studentId: string) => Promise<any[]>;
}

export interface StudentDetail {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image: string | null;
  sex: "male" | "female" | "other";
  address: string;
  contact: string;
  date_of_birth: string;
  organization: Organization;
  guardian_name: string;
  guardian_contact: string;
  status: "active" | "inactive" | "graduated" | "transferred";
  enrollment_date: string;
  created_at?: string;
  updated_at?: string;
}

// Sample data for demonstration - replace with actual API data
export interface StudentActivity {
  id: string;
  type: "enrollment" | "graduation" | "class" | "achievement" | "attendance";
  title: string;
  description: string;
  date: string;
  icon: any;
}

export interface StudentClass {
  id: string;
  name: string;
  teacher: string;
  schedule: string;
  progress: number;
  grade: string;
}

export interface StudentAchievement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "academic" | "sports" | "arts" | "community";
}