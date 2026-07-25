import { apiClient } from "./apiClient";
import type {
  AssignStaffServicesRequest,
  CreateStaffRequest,
  StaffMember,
  UpdateStaffRequest,
} from "../types/staff";

export async function getStaff(
  businessId: string,
): Promise<StaffMember[]> {
  const response = await apiClient.get<StaffMember[]>(
    `/api/businesses/${businessId}/staff`,
  );

  return response.data;
}

export async function createStaff(
  businessId: string,
  request: CreateStaffRequest,
): Promise<StaffMember> {
  const response = await apiClient.post<StaffMember>(
    `/api/businesses/${businessId}/staff`,
    request,
  );

  return response.data;
}

export async function updateStaff(
  businessId: string,
  staffId: string,
  request: UpdateStaffRequest,
): Promise<StaffMember> {
  const response = await apiClient.put<StaffMember>(
    `/api/businesses/${businessId}/staff/${staffId}`,
    request,
  );

  return response.data;
}

export async function assignStaffServices(
  businessId: string,
  staffId: string,
  request: AssignStaffServicesRequest,
): Promise<StaffMember> {
  const response = await apiClient.put<StaffMember>(
    `/api/businesses/${businessId}/staff/${staffId}/services`,
    request,
  );

  return response.data;
}

export async function deactivateStaff(
  businessId: string,
  staffId: string,
): Promise<void> {
  await apiClient.delete(
    `/api/businesses/${businessId}/staff/${staffId}`,
  );
}