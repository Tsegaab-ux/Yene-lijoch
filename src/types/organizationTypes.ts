
export interface OrganizationStatsTypes {
  totalOrganizations: number;
  pendingOrganizations: number;
  approvedOrganizations: number;
  rejectedOrganizations: number;
  totalMembers: number;
  growthRate: string;
}

export interface FilterState {
  status: string;
  orgType: string;
  searchQuery: string;
}

export interface OrganizationMembership {
  id: number;
  profile: {
    id: number;
    username: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  organization: number;
  organization_name: string;
  role: string;
  status: "pending" | "approved" | "rejected";
}

export interface Organization {
  id: number;
  name: string;
  description?: string;
  address?: string;
  org_type?: string;
  phone?: string;
  email?: string;
  contact?: string;
  website?: string;
  status: "active" | "pending" | "suspended";
  created_at: string;
  updated_at: string;
  members_count?: number;
}

export interface OrganizationDetail extends Organization {
  members: OrganizationMembership[];
  pending_members: OrganizationMembership[];
  created_by?: {
    id: number;
    username: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  founded?: string;
  region?: string;
  social_media?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
  service_times?: {
    sunday?: string;
    wednesday?: string;
    friday?: string;
    saturday?: string;
  };
  approved_at?: string;
  approved_by?: {
    id: number;
    username: string;
  };
  rejection_reason?: string;
}

export interface PendingOrganization {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  description?: string;
  address?: string;
  contact?: string;
  email?: string;
  website?: string;
  created_at: string;
  org_type?: string;
  created_by: {
    id: number;
    username: string;
    email?: string;
  };
}

export interface PendingMembership {
  id: number;
  organization: Organization;
  user: {
    id: number;
    username: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  role: string;
  user_display: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface OrganizationSearchResult {
  id: number;
  name: string;
  description?: string;
  members_count: number;
}

export interface OrganizationFormData {
  name: string;
  org_type: string;
  address: string;
  contact: string;
  confirm_despite_similar?: boolean;
}

export interface SimilarOrganization {
  id: number;
  name: string;
  org_type: string;
  status: string;
  similarity?: number;
}

export interface FormErrors {
  name?: string;
  org_type?: string;
  address?: string;
  contact?: string;
  similar_organizations?: SimilarOrganization[];
}
