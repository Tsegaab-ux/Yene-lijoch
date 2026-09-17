// app/contexts/MediaContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { useMedia } from "../hooks/useMedia";
import {
  MediaContextValue,
  MediaCreateData,
  MediaItem,
  MediaUpdateData,
} from "../types/mediaTypes";

const MediaContext = createContext<MediaContextValue | undefined>(undefined);

export function MediaProvider({ children }: { children: ReactNode }) {
  const {
    media,
    isLoading,
    error,
    fetchMedia,
    createMedia,
    updateMedia,
    deleteMedia,
    toggleMediaPublish,
  } = useMedia();

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const value = useMemo<MediaContextValue>(
    () => ({
      media,
      isLoading,
      error,
      refetch: fetchMedia,
      createMedia,
      updateMedia,
      deleteMedia,
      toggleMediaPublish,
    }),
    [
      media,
      isLoading,
      error,
      fetchMedia,
      createMedia,
      updateMedia,
      deleteMedia,
      toggleMediaPublish,
    ]
  );

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
}

export function useMediaContext(): MediaContextValue {
  const ctx = useContext(MediaContext);
  if (!ctx) {
    throw new Error("useMediaContext must be used inside <MediaProvider>");
  }
  return ctx;
}