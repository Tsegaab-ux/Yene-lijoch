// app/types/claessesTypes.ts

export type ClassroomStatus = "active" | "inactive" | "completed";

export interface ClassRoomStudent {
  id: number | string;
  name: string;
  groupId?: number | string | null;
  grade?: string;
  age?: number | null;
  parentName?: string;
  parentEmail?: string;
  status?: "active" | "inactive" | "graduated";
}

export interface Classroom {
  id: number | string;
  name: string;

  // Frontend-facing
  teacherName?: string;
  grade?: string;
  roster?: ClassRoomStudent[];
  student_count?: number;

  // Native fields
  description?: string;
  age_group?: string | null;
  teacher?: number | string | null;
  status: ClassroomStatus;
  start_date?: string | null;
  end_date?: string | null;
  organization?: number | string | null;
  organization_name?: string;

  created_at?: string;
  updated_at?: string;
}

export interface ClassroomCreateData {
  name: string;
  teacherName?: string;
  teacher?: number | string | null;
  grade?: string;
  description?: string;
  age_group?: string;
  status?: ClassroomStatus;
  start_date?: string | null;
  end_date?: string | null;
  students?: Array<{
    name: string;
    grade?: string;
    age?: number | null;
    parentName?: string;
    parentEmail?: string;
  }>;
}

export type ClassroomUpdateData = Partial<ClassroomCreateData>;

export interface UseClassroomsReturn {
  classrooms: Classroom[];
  classroom: Classroom | null;
  isLoading: boolean;
  error: string | null;

  fetchClassrooms: () => Promise<Classroom[]>;
  fetchClassroomsFiltered: (params: {
    status?: string;
    teacher?: string | number;
    q?: string;
  }) => Promise<Classroom[]>;
  fetchClassroom: (id: number | string) => Promise<Classroom | null>;

  addClassroom: (data: ClassroomCreateData) => Promise<Classroom>;
  updateClassroom: (id: number | string, data: ClassroomUpdateData) => Promise<Classroom>;
  deleteClassroom: (id: number | string) => Promise<void>;
  toggleClassroomStatus: (id: number | string) => Promise<Classroom>;

  addStudentToClass: (
    classId: number | string,
    student: StudentCreateData
  ) => Promise<ClassRoomStudent>;
  removeStudentFromClass: (
    classId: number | string,
    studentId: number | string
  ) => Promise<void>;
}

export type StudentCreateData = {
  name: string;
  groupId?: number | string | null;
  grade?: string;
  age?: number | null;
  parentName?: string;
  parentEmail?: string;
};
