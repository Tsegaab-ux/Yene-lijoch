// src/hooks/useMedia.ts
import { useCallback, useState } from "react";
import { Platform } from "react-native";
import { api } from "../services/api";
import {
  MediaCreateData,
  MediaItem,
  MediaUpdateData,
  UseMediaReturn,
} from "../types/mediaTypes";

// ======================================================================
// File detection + normalization
// ======================================================================

/**
 * True if `v` is (or wraps) something we can upload.
 *
 * Covers every shape we've actually seen from Expo pickers:
 *   Web (DocumentPicker):     { file: File, uri: "blob:...", name, mimeType }
 *   Web (ImagePicker):        { uri: "blob:...", name, mimeType }
 *   Native (both pickers):    { uri: "file://...", name, mimeType, kind }
 *   Raw File / Blob
 *   Bare URI string
 */
function isUploadableFile(v: unknown): boolean {
  if (!v) return false;

  // Real File / Blob — cross-realm safe via constructor name.
  const ctor = (v as any)?.constructor?.name;
  if (ctor === "File" || ctor === "Blob") return true;
  if (typeof File !== "undefined" && v instanceof File) return true;
  if (typeof Blob !== "undefined" && v instanceof Blob) return true;

  // Bare URI string.
  if (typeof v === "string" && v.length > 0) return true;

  if (typeof v === "object") {
    const o = v as Record<string, any>;
    // Web DocumentPicker wrapper: { file: File, ... }
    if (o.file && isUploadableFile(o.file)) return true;
    // Expo picker shape: { uri, name, mimeType, kind }
    if (typeof o.uri === "string" && o.uri.length > 0) return true;
  }

  return false;
}

/**
 * Fetch a URI (blob:, data:, http(s):, file:) into a real Blob and append.
 *
 * Web: browsers only accept Blob | File in FormData — passing an object
 * stringifies it to "[object Object]", which DRF rejects with
 * "The submitted data was not a file". We fetch the URI and wrap the
 * result in a File so the multipart part carries a filename.
 *
 * Native: FormData accepts { uri, name, type } directly; the RN fetch
 * polyfill reads the file from disk.
 */
async function appendFromUri(
  form: FormData,
  key: string,
  uri: string,
  name: string,
  type: string,
): Promise<void> {
  if (Platform.OS !== "web") {
    form.append(key, { uri, name, type } as any);
    return;
  }

  const res = await fetch(uri);
  const blob = await res.blob();
  const file =
    typeof File !== "undefined"
      ? new File([blob], name, { type: blob.type || type })
      : (blob as any);
  form.append(key, file, name);
}

/**
 * Append a file to FormData in the shape the platform expects.
 *
 *   Web:    FormData.append(key, File | Blob)  ← never a plain object
 *   Native: FormData.append(key, { uri, name, type })
 */
async function appendFile(
  form: FormData,
  key: string,
  v: unknown,
): Promise<void> {
  if (!v) return;

  // Unwrap { file: File, ... } to the inner File.
  if (
    typeof v === "object" &&
    (v as any).file &&
    isUploadableFile((v as any).file)
  ) {
    v = (v as any).file;
  }

  const ctor = (v as any)?.constructor?.name;

  // Real File — append directly.
  if (ctor === "File" || (typeof File !== "undefined" && v instanceof File)) {
    form.append(key, v as File);
    return;
  }

  // Real Blob — wrap with a filename so DRF sees a file, not a blob.
  if (ctor === "Blob" || (typeof Blob !== "undefined" && v instanceof Blob)) {
    const blob = v as Blob;
    form.append(key, blob, (blob as any).name ?? `${key}-${Date.now()}`);
    return;
  }

  // Bare URI string.
  if (typeof v === "string") {
    await appendFromUri(
      form,
      key,
      v,
      `${key}-${Date.now()}`,
      "application/octet-stream",
    );
    return;
  }

  // Expo picker shape: { uri, name, mimeType, kind }.
  const o = v as Record<string, any>;
  if (!o.uri) return;
  await appendFromUri(
    form,
    key,
    o.uri,
    o.name ?? o.fileName ?? `${key}-${Date.now()}`,
    o.mimeType ?? o.type ?? "application/octet-stream",
  );
}

/**
 * FormData `instanceof` is unreliable across realms. Duck-type on the
 * methods every spec-compliant FormData has, plus a constructor-name
 * fallback for polyfills that miss `entries` / `set`.
 */
function isFormData(v: unknown): v is FormData {
  if (!v || typeof v !== "object") return false;
  if ((v as any)?.constructor?.name === "FormData") return true;
  const o = v as any;
  return typeof o.append === "function" && typeof o.getAll === "function";
}

/** DRF returns either an array or { results: [...] } — normalize. */
function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as any).results)) {
    return (data as any).results as T[];
  }
  return [];
}

// ======================================================================
// Hook
// ======================================================================

export function useMedia(): UseMediaReturn {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [item, setItem] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------------------------------------------
  // Error extraction
  // ------------------------------------------------------------------
  const extractError = (err: unknown, fallback: string): string => {
    const axiosErr = err as any;
    const data = axiosErr?.response?.data;

    if (data) {
      if (typeof data === "string") return data;
      if (data.detail) {
        return Array.isArray(data.detail)
          ? data.detail.map(String).join(", ")
          : String(data.detail);
      }
      if (data.error) return String(data.error);
      if (typeof data === "object") {
        const messages = Object.values(data)
          .flat()
          .filter(Boolean)
          .map(String)
          .join(", ");
        if (messages) return messages;
      }
    }

    return err instanceof Error ? err.message : fallback;
  };

  // ------------------------------------------------------------------
  // Payload builder — async because web fetches blob URIs
  // ------------------------------------------------------------------
  const buildPayload = async (
    data: MediaCreateData | MediaUpdateData,
  ): Promise<FormData | Record<string, any>> => {
    const hasFile = isUploadableFile(data.file) || isUploadableFile(data.cover);

    // No file → JSON, stripping empty values so we don't send
    // `file: null` (which DRF might treat as a clear).
    if (!hasFile) {
      const out: Record<string, any> = {};
      Object.entries(data).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        out[k] = v;
      });
      return out;
    }

    // File present → multipart, appending only fields with values.
    const form = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null || value === "") continue;

      if (key === "file" || key === "cover") {
        await appendFile(form, key, value);
        continue;
      }
      if (typeof value === "boolean") {
        form.append(key, value ? "true" : "false");
        continue;
      }
      form.append(key, String(value));
    }
    return form;
  };

  /**
   * Build axios config for a write request.
   *
   * For FormData, strip Content-Type so the HTTP client sets it — and,
   * crucially, the multipart boundary — on its own. Setting the header
   * manually without a boundary is the classic reason native uploads
   * silently send nothing. The identity `transformRequest` prevents
   * axios from JSON-stringifying the FormData in some versions.
   */
  const writeConfig = (payload: FormData | Record<string, any>) => {
    if (isFormData(payload)) {
      const headers: Record<string, any> = {};
      headers["Content-Type"] = undefined;
      return { headers, transformRequest: [(d: any) => d] };
    }
    return { headers: { "Content-Type": "application/json" } };
  };

  // ------------------------------------------------------------------
  // Read
  // ------------------------------------------------------------------

  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<MediaItem[] | { results: MediaItem[] }>(
        "/media/",
      );
      const list = asArray<MediaItem>(data);
      setMedia(list);
      return list;
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
        const { data } = await api.get<MediaItem[] | { results: MediaItem[] }>(
          "/media/",
          { params },
        );
        const list = asArray<MediaItem>(data);
        setMedia(list);
        return list;
      } catch (err) {
        setError(extractError(err, "Failed to fetch media"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
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
      const payload = await buildPayload(data);

      if (__DEV__) {
        console.log("[useMedia] createMedia payload", {
          isFormData: isFormData(payload),
          keys: isFormData(payload)
            ? Array.from((payload as FormData).keys())
            : Object.keys(payload),
          hasFile: isUploadableFile(data.file),
          hasCover: isUploadableFile(data.cover),
          platform: Platform.OS,
        });
        if (isFormData(payload)) {
          for (const [k, v] of (payload as FormData).entries()) {
            console.log("[useMedia] entry", k, {
              ctor: (v as any)?.constructor?.name,
              typeof: typeof v,
              isFile:
                typeof File !== "undefined" && (v as any) instanceof File,
              isBlob:
                typeof Blob !== "undefined" && (v as any) instanceof Blob,
            });
          }
        }
      }

      const response = await api.post<MediaItem>(
        "/media/",
        payload,
        writeConfig(payload),
      );

      const created = response.data;
      setMedia((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      const message = extractError(err, "Failed to create media");
      if (__DEV__) {
        console.error(
          "[useMedia] createMedia error:",
          (err as any)?.response?.data ?? err,
        );
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
        const payload = await buildPayload(data);
        const response = await api.patch<MediaItem>(
          `/media/${id}/`,
          payload,
          writeConfig(payload),
        );
        const updated = response.data;
        setMedia((prev) =>
          prev.map((m) =>
            String(m.id) === String(id) ? { ...m, ...updated } : m,
          ),
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
    [item],
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
    [item],
  );

  // ------------------------------------------------------------------
  // Toggle publish
  // ------------------------------------------------------------------
  const toggleMediaPublish = useCallback(
    async (id: number | string) => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await api.post<{ id: number; published: boolean }>(
          `/media/${id}/toggle-publish/`,
        );
        setMedia((prev) =>
          prev.map((m) =>
            String(m.id) === String(id)
              ? { ...m, published: data.published }
              : m,
          ),
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
    [item],
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