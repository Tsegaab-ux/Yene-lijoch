// app/hooks/useClassrooms.ts
import { useState, useCallback } from "react";
import { api } from "../services/api";
import {
  Classroom,
  ClassroomCreateData,
  ClassroomUpdateData,
  ClassRoomStudent,
  StudentCreateData,
  UseClassroomsReturn,
} from "../types/claessesTypes";

interface ClassroomFilterParams {
  status?: string;
  teacher?: string | number;
  q?: string;
}

interface ApiErrorResponse {
  detail?: string;
  error?: string;
  [key: string]: unknown;
}

interface AxiosErrorLike {
  response?: {
    data?: string | ApiErrorResponse;
  };
}

export function useClassrooms(): UseClassroomsReturn {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------------------------------------------
  // Error extraction — mirrors the pattern in useStudentData
  // ------------------------------------------------------------------
  const extractError = (err: unknown, fallback: string): string => {
    const axiosErr = err as AxiosErrorLike;
    const data: string | ApiErrorResponse | undefined = axiosErr?.response?.data;

    if (data) {
      if (typeof data === "string") return data;
      if (typeof data === "object") {
        if (data.detail) return String(data.detail);
        if (data.error) return String(data.error);
        const messages = Object.values(data)
          .flat()
          .filter(Boolean)
          .join(", ");
        if (messages) return messages;
      }
    }

    return err instanceof Error ? err.message : fallback;
  };

  // ------------------------------------------------------------------
  // Read
  // ------------------------------------------------------------------

  const fetchClassrooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Classroom[]>("/classes/");
      setClassrooms(data);
      return data;
    } catch (err) {
      setError(extractError(err, "Failed to fetch classrooms"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchClassroomsFiltered = useCallback(
    async (params: { status?: string; teacher?: string | number; q?: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await api.get<Classroom[]>("/classes/", { params });
        setClassrooms(data);
        return data;
      } catch (err) {
        setError(extractError(err, "Failed to fetch classrooms"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchClassroom = useCallback(async (id: number | string) => {
    if (!id) return null;
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Classroom>(`/classes/${id}/`);
      setClassroom(data);
      return data;
    } catch (err) {
      setError(extractError(err, "Failed to fetch classroom"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ------------------------------------------------------------------
  // Status toggle — uses the model's string statuses
  // ------------------------------------------------------------------
  const toggleClassroomStatus = useCallback(
    async (id: number | string) => {
      setIsLoading(true);
      setError(null);
      try {
        const current = classrooms.find((c) => String(c.id) === String(id));
        if (!current) throw new Error("Classroom not found");

        const nextStatus =
          current.status === "active" ? "inactive" : "active";

        const { data } = await api.patch<Classroom>(`/classes/${id}/`, {
          status: nextStatus,
        });

        setClassrooms((prev) =>
          prev.map((c) => (String(c.id) === String(id) ? { ...c, ...data } : c))
        );
        if (classroom && String(classroom.id) === String(id)) {
          setClassroom(data);
        }
        return data;
      } catch (err) {
        setError(extractError(err, "Failed to toggle classroom status"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [classrooms, classroom]
  );

  // ------------------------------------------------------------------
  // Create — accepts nested students (matches the UI's "Save group
  // & students" button)
  // ------------------------------------------------------------------
  const addClassroom = useCallback(async (data: ClassroomCreateData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<Classroom>("/classes/", data);
      const created = response.data;
      setClassrooms((prev) => [...prev, created]);
      return created;
    } catch (err) {
      const message = extractError(err, "Failed to add classroom");
      if (__DEV__) {
        console.error("[useClassrooms] addClassroom error:", (err as any)?.response?.data);
      }
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ------------------------------------------------------------------
  // Update
  // ------------------------------------------------------------------
  const updateClassroom = useCallback(
    async (id: number | string, data: ClassroomUpdateData) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.patch<Classroom>(`/classes/${id}/`, data);
        const updated = response.data;
        setClassrooms((prev) =>
          prev.map((c) => (String(c.id) === String(id) ? { ...c, ...updated } : c))
        );
        if (classroom && String(classroom.id) === String(id)) {
          setClassroom(updated);
        }
        return updated;
      } catch (err) {
        setError(extractError(err, "Failed to update classroom"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [classroom]
  );

  // ------------------------------------------------------------------
  // Delete (soft delete via DELETE; backend flips status to "inactive")
  // ------------------------------------------------------------------
  const deleteClassroom = useCallback(
    async (id: number | string) => {
      setIsLoading(true);
      setError(null);
      try {
        await api.delete(`/classes/${id}/`);
        setClassrooms((prev) => prev.filter((c) => String(c.id) !== String(id)));
        if (classroom && String(classroom.id) === String(id)) {
          setClassroom(null);
        }
      } catch (err) {
        setError(extractError(err, "Failed to delete classroom"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [classroom]
  );

  // ------------------------------------------------------------------
  // Roster actions — match the UI's "Add student" / "Remove" chips
  // ------------------------------------------------------------------
  const addStudentToClass = useCallback(
    async (classId: number | string, student: StudentCreateData) => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await api.post<ClassRoomStudent>(
          `/classes/${classId}/students/`,
          student
        );

        // Update both the list and the detail view.
        setClassrooms((prev) =>
          prev.map((c) =>
            String(c.id) === String(classId)
              ? { ...c, roster: [...(c.roster ?? []), data] }
              : c
          )
        );
        if (classroom && String(classroom.id) === String(classId)) {
          setClassroom({
            ...classroom,
            roster: [...(classroom.roster ?? []), data],
          });
        }
        return data;
      } catch (err) {
        setError(extractError(err, "Failed to add student"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [classroom]
  );

  const removeStudentFromClass = useCallback(
    async (classId: number | string, studentId: number | string) => {
      setIsLoading(true);
      setError(null);
      try {
        await api.delete(`/classes/${classId}/students/${studentId}/`);
        setClassrooms((prev) =>
          prev.map((c) =>
            String(c.id) === String(classId)
              ? {
                  ...c,
                  roster: (c.roster ?? []).filter(
                    (s) => String(s.id) !== String(studentId)
                  ),
                }
              : c
          )
        );
        if (classroom && String(classroom.id) === String(classId)) {
          setClassroom({
            ...classroom,
            roster: (classroom.roster ?? []).filter(
              (s) => String(s.id) !== String(studentId)
            ),
          });
        }
      } catch (err) {
        setError(extractError(err, "Failed to remove student"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [classroom]
  );

  return {
    classrooms,
    classroom,
    isLoading,
    error,

    fetchClassrooms,
    fetchClassroomsFiltered,
    fetchClassroom,

    addClassroom,
    updateClassroom,
    deleteClassroom,
    toggleClassroomStatus,

    addStudentToClass,
    removeStudentFromClass,
  };
}
