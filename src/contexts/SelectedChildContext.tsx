import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { SharedStudent } from "../data/sharedContent";
import { useSharedContent } from "./SharedContentContext";

const PARENT_EMAIL = "parent@test.com";

type SelectedChildContextValue = {
  childrenList: SharedStudent[];
  selectedChild: SharedStudent;
  selectedId: string;
  setSelectedId: (id: string) => void;
  groupName: string;
};

const SelectedChildContext = createContext<SelectedChildContextValue | null>(
  null
);

const EMPTY: SharedStudent = {
  id: "none",
  name: "No child",
  groupId: "",
  grade: "-",
  age: 0,
  parentName: "Parent",
  parentEmail: PARENT_EMAIL,
  initials: "NC",
  avatarColor: "#8A847A",
  attendance: 0,
  overallProgress: 0,
  streak: 0,
};

export function SelectedChildProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getParentChildren, getGroupName } = useSharedContent();
  const childrenList = getParentChildren(PARENT_EMAIL);
  const [selectedId, setSelectedId] = useState(childrenList[0]?.id ?? "none");

  useEffect(() => {
    if (!childrenList.find((c) => c.id === selectedId) && childrenList[0]) {
      setSelectedId(childrenList[0].id);
    }
  }, [childrenList, selectedId]);

  const value = useMemo(() => {
    const selectedChild =
      childrenList.find((child) => child.id === selectedId) ??
      childrenList[0] ??
      EMPTY;

    return {
      childrenList,
      selectedChild,
      selectedId: selectedChild.id,
      setSelectedId,
      groupName: getGroupName(selectedChild.groupId),
    };
  }, [childrenList, selectedId, getGroupName]);

  return (
    <SelectedChildContext.Provider value={value}>
      {children}
    </SelectedChildContext.Provider>
  );
}

export function useSelectedChild() {
  const context = useContext(SelectedChildContext);
  if (!context) {
    throw new Error(
      "useSelectedChild must be used within SelectedChildProvider"
    );
  }
  return context;
}
