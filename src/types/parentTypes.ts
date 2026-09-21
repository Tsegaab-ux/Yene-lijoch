// app/types/parentTypes.ts

export interface ParentChild {
  id: number;
  name: string;
  initials: string;
  grade: string;
  age?: number | null;
  status: "active" | "inactive" | "graduated";
  classroomId: number | null;
  groupName: string | null;
}

export interface ParentOrganization {
  id: number;
  name: string;
}

export interface Parent {
  id: number;
  full_name: string;
  email: string;
  contact?: string;
  profile_image?: string | null;
  organization?: ParentOrganization | null;
  children: ParentChild[];
}

export interface UseParentDataReturn {
  parent: Parent | null;
  children: ParentChild[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  refetch: () => Promise<Parent | null>;
  updateParent: (data: Partial<Parent>) => Promise<Parent>;
}