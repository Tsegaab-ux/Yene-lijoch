// app/hooks/useParentData.ts
import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import { Parent, ParentChild, UseParentDataReturn } from "../types/parentTypes";

// Normalise the backend's snake_case child shape to camelCase.
function normaliseChild(raw: any): ParentChild {
  return {
    id: raw.id,
    name: raw.name,
    initials: raw.initials ?? "?",
    grade: raw.grade ?? "",
    age: raw.age ?? null,
    status: raw.status ?? "active",
    classroomId: raw.classroom_id ?? null,
    groupName: raw.group_name ?? null,
  };
}

function normaliseParent(raw: any): Parent {
  return {
    id: raw.id,
    full_name: raw.full_name ?? "",
    email: raw.email ?? "",
    contact: raw.contact ?? "",
    profile_image: raw.profile_image ?? null,
    organization: raw.organization ?? null,
    children: (raw.children ?? []).map(normaliseChild),
  };
}

export function useParentData(): UseParentDataReturn {
  const [parent, setParent] = useState<Parent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractError = (err: unknown, fallback: string): string => {
    const e = err as any;
    const data = e?.response?.data;
    if (data) {
      if (typeof data === "string") return data;
      if (data.detail) return String(data.detail);
      if (data.error) return String(data.error);
      if (typeof data === "object") {
        const messages = Object.values(data).flat().filter(Boolean).join(", ");
        if (messages) return messages;
      }
    }
    return err instanceof Error ? err.message : fallback;
  };

  const fetchParent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/parents/me/");
      const normalised = normaliseParent(data);
      setParent(normalised);
      return normalised;
    } catch (err) {
      setError(extractError(err, "Failed to load parent profile"));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateParent = useCallback(async (payload: Partial<Parent>) => {
    setIsSaving(true);
    setError(null);
    try {
      const { data } = await api.patch("/parents/me/", payload);
      const normalised = normaliseParent(data);
      setParent(normalised);
      return normalised;
    } catch (err) {
      const message = extractError(err, "Failed to update parent profile");
      setError(message);
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, []);

  useEffect(() => {
    fetchParent();
  }, [fetchParent]);

  return {
    parent,
    children: parent?.children ?? [],
    isLoading,
    isSaving,
    error,
    refetch: fetchParent,
    updateParent,
  };
}