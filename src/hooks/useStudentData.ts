// app/hooks/useStudentData.ts
import { useState, useCallback } from "react";
import { api } from "../services/api";
import {
  Student,
  StudentCreateData,
  StudentDetail,
  StudentUpdateData,
  UseStudentDataReturn,
} from "../types/studentTypes";

export function useStudentData(): UseStudentDataReturn {
  const [students, setStudents] = useState<Student[]>([]);
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // ------------------------------------------------------------------
  // Internal helpers
  // ------------------------------------------------------------------
  const extractError = (err: unknown, fallback: string): string => {
    const axiosErr = err as any;
    const data = axiosErr?.response?.data;

    if (data) {
      if (typeof data === "string") return data;
      if (data.detail) return String(data.detail);
      if (data.error) return String(data.error);
      if (typeof data === "object") {
        // Flatten DRF field errors: { field: ["msg", ...] }
        const messages = Object.values(data)
          .flat()
          .filter(Boolean)
          .join(", ");
        if (messages) return messages;
      }
    }

    return err instanceof Error ? err.message : fallback;
  };

  const handleResponse = useCallback(async <T,>(response: Response): Promise<T> => {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(extractError(data, "API request failed"));
    }
    return data as T;
  }, []);

  // ------------------------------------------------------------------
  // Read
  // ------------------------------------------------------------------

  // List students (scoped to the caller's organization by the backend).
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Student[]>("/students/");
      const data = response.data;
      setStudents(data);
      setTotal(data.length);
      return data;
    } catch (err) {
      setError(extractError(err, "Failed to fetch students"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // List with filters (status, classroom, search query).
  const fetchStudentsFiltered = useCallback(
    async (params: { status?: string; classroom?: string | number; q?: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<Student[]>("/students/", { params });
        const data = response.data;
        setStudents(data);
        setTotal(data.length);
        return data;
      } catch (err) {
        setError(extractError(err, "Failed to fetch students"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Single student.
  const fetchStudent = useCallback(async (id: string | number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<StudentDetail>(`/students/${id}/`);
      const data = response.data;
      setStudent(data);
      return data;
    } catch (err) {
      setError(extractError(err, "Failed to fetch student"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ------------------------------------------------------------------
  // Write
  // ------------------------------------------------------------------

  // Create a student. Matches the refined backend payload:
  //   { name, groupId, grade, age, parentName, parentEmail }
  const createStudent = useCallback(async (studentData: StudentCreateData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<Student>("/students/", studentData);
      const data = response.data;
      setStudents((prev) => [...prev, data]);
      setTotal((prev) => prev + 1);
      return data;
    } catch (err) {
      const message = extractError(err, "Failed to create student");
      // Keep the full response available for debugging.
      if (__DEV__) {
        console.error("[useStudentData] createStudent error:", (err as any)?.response?.data);
      }
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a student. Accepts camelCase aliases (`name`, `groupId`, ...).
  const updateStudent = useCallback(
    async (id: string | number, studentData: StudentUpdateData) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.patch<StudentDetail>(`/students/${id}/`, studentData);
        const data = response.data;
        setStudents((prev) =>
          prev.map((s) => (String(s.id) === String(id) ? { ...s, ...data } : s))
        );
        if (student && String(student.id) === String(id)) {
          setStudent(data);
        }
        return data;
      } catch (err) {
        setError(extractError(err, "Failed to update student"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [student]
  );

  // Soft delete — backend flips status to "inactive" and returns a message.
  const deleteStudent = useCallback(
    async (id: string | number) => {
      setIsLoading(true);
      setError(null);
      try {
        await api.delete(`/students/${id}/`);
        setStudents((prev) => prev.filter((s) => String(s.id) !== String(id)));
        setTotal((prev) => Math.max(0, prev - 1));
        if (student && String(student.id) === String(id)) {
          setStudent(null);
        }
      } catch (err) {
        setError(extractError(err, "Failed to delete student"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [student]
  );

  // Toggle active/inactive via PATCH — no dedicated endpoint needed.
  const toggleStudentStatus = useCallback(
    async (id: string | number) => {
      setIsLoading(true);
      setError(null);
      try {
        const current = students.find((s) => String(s.id) === String(id));
        if (!current) throw new Error("Student not found");

        const newStatus = current.status === "active" ? "inactive" : "active";

        const response = await api.patch<Student>(`/students/${id}/`, {
          status: newStatus,
        });
        const data = response.data;
        setStudents((prev) =>
          prev.map((s) => (String(s.id) === String(id) ? { ...s, ...data } : s))
        );
        if (student && String(student.id) === String(id)) {
          setStudent(data as unknown as StudentDetail);
        }
        return data;
      } catch (err) {
        setError(extractError(err, "Failed to toggle student status"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [students, student]
  );

  // ------------------------------------------------------------------
  // Current user (parent)
  // ------------------------------------------------------------------
  const getCurrentStudentProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<StudentDetail>("/users/me/");
      const data = response.data;
      setStudent(data);
      return data;
    } catch (err) {
      setError(extractError(err, "Failed to get current student profile"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ------------------------------------------------------------------
  // Deactivated / reactivation (uses ?status=inactive)
  // ------------------------------------------------------------------
  const fetchDeactivatedStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Student[]>("/students/", {
        params: { status: "inactive" },
      });
      const data = response.data;
      setStudents(data);
      setTotal(data.length);
      return data;
    } catch (err) {
      setError(extractError(err, "Failed to fetch deactivated students"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reactivateStudent = useCallback(
    async (studentId: number | string) => {
      try {
        await api.patch(`/students/${studentId}/`, { status: "active" });
        await fetchDeactivatedStudents();
        return true;
      } catch (err) {
        throw new Error(extractError(err, "Failed to reactivate student"));
      }
    },
    [fetchDeactivatedStudents]
  );

  // Permanent delete requires a dedicated backend endpoint. Keep this
  // method but expect a 404 until `DELETE /students/<id>/permanent/` is added.
  const permanentDeleteStudent = useCallback(
    async (studentId: number | string) => {
      try {
        await api.delete(`/students/${studentId}/permanent/`);
        await fetchDeactivatedStudents();
        return true;
      } catch (err) {
        throw new Error(extractError(err, "Failed to permanently delete student"));
      }
    },
    [fetchDeactivatedStudents]
  );

  // ------------------------------------------------------------------
  // Enrollment — assign a student to a group via PATCH.
  // ------------------------------------------------------------------
  const enrollStudent = useCallback(
    async (studentId: string | number, classData: { groupId?: number | string; classroom?: number | string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const payload = {
          groupId: classData.groupId ?? classData.classroom,
        };
        const response = await api.patch<Student>(`/students/${studentId}/`, payload);
        return response.data;
      } catch (err) {
        setError(extractError(err, "Failed to enroll student"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ------------------------------------------------------------------
  // Grades / attendance — separate apps, not part of the student API.
  // Keep these stubs but point them at the right endpoints if/when
  // those apps exist.
  // ------------------------------------------------------------------
  const getStudentGrades = useCallback(async (studentId: string | number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/students/${studentId}/grades/`);
      return response.data;
    } catch (err) {
      setError(extractError(err, "Failed to fetch student grades"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStudentAttendance = useCallback(
    async (studentId: string | number, params?: Record<string, any>) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/students/${studentId}/attendance/`, {
          params,
        });
        return response.data;
      } catch (err) {
        setError(extractError(err, "Failed to fetch student attendance"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    students,
    student,
    isLoading,
    error,
    total,
    fetchStudents,
    fetchStudentsFiltered,
    fetchStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    toggleStudentStatus,
    getCurrentStudentProfile,
    fetchDeactivatedStudents,
    reactivateStudent,
    permanentDeleteStudent,
    enrollStudent,
    getStudentGrades,
    getStudentAttendance,
  };
}
