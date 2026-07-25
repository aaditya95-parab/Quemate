export interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  timeZone: string;
  currentUserRole: string;
  createdAtUtc: string;
}

export interface CreateBusinessRequest {
  name: string;
  category: string;
  phone?: string;
  email?: string;
  address?: string;
  timeZone: string;
}