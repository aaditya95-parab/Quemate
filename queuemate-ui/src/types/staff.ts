import type { Service } from "./service";

export interface StaffMember {
  id: string;
  businessId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  services: StaffAssignedService[];
}

export interface StaffAssignedService {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

export interface CreateStaffRequest {
  fullName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  serviceIds: string[];
}

export interface UpdateStaffRequest {
  fullName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  isActive: boolean;
}

export interface AssignStaffServicesRequest {
  serviceIds: string[];
}

export type AvailableService = Service;