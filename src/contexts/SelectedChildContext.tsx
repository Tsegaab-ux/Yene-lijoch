// app/contexts/SelectedChildContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParentData } from "../hooks/useParentData";
import { ParentChild } from "../types/parentTypes";

interface SelectedChildContextValue {
  // data
  parent: ReturnType<typeof useParentData>["parent"];
  childrenList: ParentChild[];
  selectedChild: ParentChild | null;
  selectedId: number | null;
  groupName: string | null;

  // actions
  setSelectedId: (id: number) => void;

  // state
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<any>;
}

const SelectedChildContext = createContext<SelectedChildContextValue | undefined>(
  undefined
);

export function SelectedChildProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { parent, children: childrenList, isLoading, error, refetch } =
    useParentData();

  const [selectedId, setSelectedIdState] = useState<number | null>(null);

  // Auto-select the first child once the list loads.
  useEffect(() => {
    if (selectedId === null && childrenList.length > 0) {
      setSelectedIdState(childrenList[0].id);
    }
    // If the selected child disappears (removed from the roster),
    // fall back to the first available.
    if (
      selectedId !== null &&
      childrenList.length > 0 &&
      !childrenList.some((c) => c.id === selectedId)
    ) {
      setSelectedIdState(childrenList[0].id);
    }
  }, [childrenList, selectedId]);

  const selectedChild = useMemo(
    () => childrenList.find((c) => c.id === selectedId) ?? null,
    [childrenList, selectedId]
  );

  const setSelectedId = useCallback((id: number) => {
    setSelectedIdState(id);
  }, []);

  const value = useMemo<SelectedChildContextValue>(
    () => ({
      parent,
      childrenList,
      selectedChild,
      selectedId,
      groupName: selectedChild?.groupName ?? null,
      setSelectedId,
      isLoading,
      error,
      refetch,
    }),
    [
      parent,
      childrenList,
      selectedChild,
      selectedId,
      setSelectedId,
      isLoading,
      error,
      refetch,
    ]
  );

  return (
    <SelectedChildContext.Provider value={value}>
      {children}
    </SelectedChildContext.Provider>
  );
}

export function useSelectedChild(): SelectedChildContextValue {
  const ctx = useContext(SelectedChildContext);
  if (!ctx) {
    throw new Error(
      "useSelectedChild must be used inside <SelectedChildProvider>"
    );
  }
  return ctx;
}