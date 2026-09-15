// app/hooks/useStudentData.ts
import { useState, useCallback } from "react";
import { api } from "../services/api";
import { Student, StudentCreateData, StudentDetail, StudentUpdateData, UseStudentDataReturn } from "../types/studentTypes";

export function useStudentData(): UseStudentDataReturn {
  const [students, setStudents] = useState<Student[]>([]);
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Helper to handle API responses
  const handleResponse = useCallback(async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
      if (data.errors) {
        const errorMessages = Object.values(data.errors).flat().join(", ");
        throw new Error(errorMessages);
      }
      throw new Error(data.error || data.detail || "API request failed");
    }
    return data;
  }, []);

  // Fetch all students
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin-students/");
      const data = response.data;
      setStudents(data);
      setTotal(data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch students");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch single student
  const fetchStudent = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/students/${id}/`);
      const data = response.data;
      setStudent(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch student");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new student using StudentRegisterSerializer
  const createStudent = useCallback(async (studentData: StudentCreateData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/students/", studentData);
      const data = response.data;
      setStudents((prev) => [...prev, data]);
      return data;
    } catch (err) {
      // Log the full error response
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Full error response:", (err as any)?.response);
      console.error("Error data:", (err as any)?.response?.data);
      setError(error.message || "Failed to create student");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update student using StudentEditSerializer
  const updateStudent = useCallback(async (id: string, studentData: StudentUpdateData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/students/${id}/`, studentData);
      const data = response.data;
      setStudents((prev) => prev.map((s) => (s.id === id ? data : s)));
      if (student?.id === id) {
        setStudent(data);
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update student");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [student]);

  // Delete student
  const deleteStudent = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/students/${id}/`);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      if (student?.id === id) {
        setStudent(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete student");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [, student]);

  // Toggle student status (active/inactive)
  const toggleStudentStatus = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const studentToToggle = students.find((s) => s.id === id);
      if (!studentToToggle) throw new Error("Student not found");

      const newStatus = studentToToggle.status === "active" ? "inactive" : "active";
      
      const response = await api.patch(`/students/${id}/`, {
        status: newStatus,
      });

      const data = response.data;
      setStudents((prev) => prev.map((s) => (s.id === id ? data : s)));
      if (student?.id === id) {
        setStudent(data);
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle student status");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [students, student, ]);

  // Get current student profile
  const getCurrentStudentProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/users/me/");
      const data = response.data;
      setStudent(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get current student profile");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch deactivated students
  const fetchDeactivatedStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/students/deactivated/");
      const data = response.data;
      setStudents(data.students || data);
      setTotal(data.total || data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch deactivated students");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reactivate student
  const reactivateStudent = useCallback(async (studentId: number) => {
    try {
      await api.post(`/students/${studentId}/reactivate/`, {});
      await fetchDeactivatedStudents();
      return true;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to reactivate student");
    }
  }, [, fetchDeactivatedStudents]);

  // Permanent delete student
  const permanentDeleteStudent = useCallback(async (studentId: number) => {
    try {
      await api.delete(`/students/${studentId}/permanent/`);
      await fetchDeactivatedStudents();
      return true;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to permanently delete student");
    }
  }, [, fetchDeactivatedStudents]);

  // Enroll student in a class
  const enrollStudent = useCallback(async (studentId: string, classData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/students/${studentId}/enroll/`, classData);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enroll student");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get student grades
  const getStudentGrades = useCallback(async (studentId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/students/${studentId}/grades/`);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch student grades");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get student attendance
  const getStudentAttendance = useCallback(async (studentId: string, params?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/students/${studentId}/attendance/`);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch student attendance");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    students,
    student,
    isLoading,
    error,
    total,
    fetchStudents,
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
  };
}