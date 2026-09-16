import { Student } from "./studentTypes";

export interface TeacherClass {
  id: number;
  name: string;
  grade?: string;
  student_count: number;
  students: Student[];
}

export interface TeacherOrganization {
  id: number;
  name: string;
}

export interface Teacher {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  profile_image?: string | null;
  contact?: string;
  date_of_birth?: string | null;
  organization?: TeacherOrganization | null;
  employment_date?: string;
  classes: TeacherClass[];
  program: string;
  group: string;
}

export interface TeacherUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  contact?: string;
  address?: string;
  date_of_birth?: string | null;
}

export interface UseTeacherDataReturn {
  teacher: Teacher | null;
  primaryClass: TeacherClass | null;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean,
  updateTeacher: (payload: TeacherUpdateData) => Promise<Teacher>;
  refetch: () => Promise<Teacher | null>;
}
