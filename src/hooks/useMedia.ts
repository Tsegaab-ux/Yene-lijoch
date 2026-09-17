// app/hooks/useMedia.ts
import { useCallback, useState } from "react";
import { api } from "../services/api";
import {
  MediaCreateData,
  MediaItem,
  MediaUpdateData,
  UseMediaReturn,
} from "../types/mediaTypes";

export function useMedia(): UseMediaReturn {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [item, setItem] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------------------------------------------
  // Error extraction — same pattern as every other hook
  // ------------------------------------------------------------------
  const extractError = (err: unknown, fallback: string): string => {
    const axiosErr = err as any;
    const data = axiosErr?.response?.data;

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

  // ------------------------------------------------------------------
  // Payload builder — FormData only when a file is present
  // ------------------------------------------------------------------
  const buildPayload = (
    data: MediaCreateData | MediaUpdateData
  ): FormData | Record<string, any> => {
    const hasFile =
      typeof File !== "undefined" &&
      ((data.file && data.file instanceof File) ||
        (data.cover && data.cover instanceof File));

    if (!hasFile) {
      const out: Record<string, any> = {};
      Object.entries(data).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        out[k] = v;
      });
      return out;
    }

    const form = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;
      if (typeof File !== "undefined" && value instanceof File) {
        form.append(key, value);
      } else if (typeof value === "boolean") {
        form.append(key, value ? "true" : "false");
      } else {
        form.append(key, String(value));
      }
    });
    return form;
  };

  // ------------------------------------------------------------------
  // Read
  // ------------------------------------------------------------------

  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<MediaItem[]>("/media/");
      setMedia(data);
      return data;
    } catch (err) {
      setError(extractError(err, "Failed to fetch media"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMediaFiltered = useCallback(
    async (params: {
      kind?: MediaItem["kind"];
      source?: MediaItem["source"];
      published?: boolean;
      age_group?: string;
      q?: string;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await api.get<MediaItem[]>("/media/", { params });
        setMedia(data);
        return data;
      } catch (err) {
        setError(extractError(err, "Failed to fetch media"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchMediaItem = useCallback(async (id: number | string) => {
    if (!id) return null;
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<MediaItem>(`/media/${id}/`);
      setItem(data);
      return data;
    } catch (err) {
      setError(extractError(err, "Failed to fetch media item"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ------------------------------------------------------------------
  // Write
  // ------------------------------------------------------------------

  const createMedia = useCallback(async (data: MediaCreateData) => {
    setIsSaving(true);
    setError(null);
    try {
      const payload = buildPayload(data);
      const response = await api.post<MediaItem>("/media/", payload, {
        headers:
          payload instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : { "Content-Type": "application/json" },
      });
      const created = response.data;
      setMedia((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      const message = extractError(err, "Failed to create media");
      if (__DEV__) {
        console.error("[useMedia] createMedia error:", (err as any)?.response?.data);
      }
      setError(message);
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateMedia = useCallback(
    async (id: number | string, data: MediaUpdateData) => {
      if (!id) return null;
      setIsSaving(true);
      setError(null);
      try {
        const payload = buildPayload(data);
        const response = await api.patch<MediaItem>(`/media/${id}/`, payload, {
          headers:
            payload instanceof FormData
              ? { "Content-Type": "multipart/form-data" }
              : { "Content-Type": "application/json" },
        });
        const updated = response.data;
        setMedia((prev) =>
          prev.map((m) => (String(m.id) === String(id) ? { ...m, ...updated } : m))
        );
        if (item && String(item.id) === String(id)) {
          setItem(updated);
        }
        return updated;
      } catch (err) {
        setError(extractError(err, "Failed to update media"));
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [item]
  );

  const deleteMedia = useCallback(
    async (id: number | string) => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        await api.delete(`/media/${id}/`);
        setMedia((prev) => prev.filter((m) => String(m.id) !== String(id)));
        if (item && String(item.id) === String(id)) {
          setItem(null);
        }
      } catch (err) {
        setError(extractError(err, "Failed to delete media"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [item]
  );

  // ------------------------------------------------------------------
  // Toggle publish — matches the "Publish / Hide" chip
  // ------------------------------------------------------------------
  const toggleMediaPublish = useCallback(
    async (id: number | string) => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await api.post<{ id: number; published: boolean }>(
          `/media/${id}/toggle-publish/`
        );
        setMedia((prev) =>
          prev.map((m) =>
            String(m.id) === String(id) ? { ...m, published: data.published } : m
          )
        );
        if (item && String(item.id) === String(id)) {
          setItem({ ...item, published: data.published });
        }
        return data;
      } catch (err) {
        setError(extractError(err, "Failed to toggle publish"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [item]
  );

  return {
    media,
    item,
    isLoading,
    isSaving,
    error,

    fetchMedia,
    fetchMediaFiltered,
    fetchMediaItem,

    createMedia,
    updateMedia,
    deleteMedia,

    toggleMediaPublish,
  };
}