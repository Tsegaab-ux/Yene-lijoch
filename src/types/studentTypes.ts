export type StudentStatus = "active" | "inactive" | "graduated";

export interface Student {
  id: number | string;
  name: string;
  groupId: number | string | null;
  group_name?: string;
  grade: string;
  age?: number | null;
  parentName: string;
  parentEmail: string;
  status: StudentStatus;
  created_at?: string;
  updated_at?: string;
}

export interface StudentDetail extends Student {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  username?: string;
  email?: string;
  profile_image?: string | null;
  sex?: string;
  address?: string;
  contact?: string;
  date_of_birth?: string;
  guardian_contact?: string;
  enrollment_date?: string | null;
}

export interface StudentCreateData {
  name: string;
  groupId?: number | string | null;
  grade?: string;
  age?: number | null;
  parentName?: string;
  parentEmail?: string;
  status?: StudentStatus;
  enrollment_date?: string | null;
}

export type StudentUpdateData = Partial<StudentCreateData> & {
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  contact?: string;
  address?: string;
  date_of_birth?: string | null;
  sex?: string;
  guardian_contact?: string;
};

export interface UseStudentDataReturn {
  students: Student[];
  student: StudentDetail | null;
  isLoading: boolean;
  error: string | null;
  total: number;

  fetchStudents: () => Promise<Student[]>;
  fetchStudentsFiltered: (params: {
    status?: string;
    classroom?: string | number;
    q?: string;
  }) => Promise<Student[]>;
  fetchStudent: (id: string | number) => Promise<StudentDetail>;

  createStudent: (data: StudentCreateData) => Promise<Student>;
  updateStudent: (id: string | number, data: StudentUpdateData) => Promise<StudentDetail>;
  deleteStudent: (id: string | number) => Promise<void>;
  toggleStudentStatus: (id: string | number) => Promise<Student>;

  getCurrentStudentProfile: () => Promise<StudentDetail>;

  fetchDeactivatedStudents: () => Promise<Student[]>;
  reactivateStudent: (id: number | string) => Promise<boolean>;
  permanentDeleteStudent: (id: number | string) => Promise<boolean>;

  enrollStudent: (
    id: string | number,
    data: { groupId?: number | string; classroom?: number | string }
  ) => Promise<Student>;

  getStudentGrades: (id: string | number) => Promise<any>;
  getStudentAttendance: (id: string | number, params?: Record<string, any>) => Promise<any>;
}
