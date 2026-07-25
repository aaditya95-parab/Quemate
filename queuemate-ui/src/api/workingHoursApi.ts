import { apiClient } from "./apiClient";
import type {
  CreateStaffTimeOffRequest,
  StaffTimeOff,
  UpdateWorkingHoursRequest,
  WorkingHour,
} from "../types/workingHours";

export async function getBusinessWorkingHours(
  businessId: string,
): Promise<WorkingHour[]> {
  const response = await apiClient.get<WorkingHour[]>(
    `/api/businesses/${businessId}/working-hours`,
  );

  return response.data;
}

export async function updateBusinessWorkingHours(
  businessId: string,
  request: UpdateWorkingHoursRequest,
): Promise<WorkingHour[]> {
  const response = await apiClient.put<WorkingHour[]>(
    `/api/businesses/${businessId}/working-hours`,
    request,
  );

  return response.data;
}

export async function getStaffWorkingHours(
  businessId: string,
  staffId: string,
): Promise<WorkingHour[]> {
  const response = await apiClient.get<WorkingHour[]>(
    `/api/businesses/${businessId}/staff/${staffId}/working-hours`,
  );

  return response.data;
}

export async function updateStaffWorkingHours(
  businessId: string,
  staffId: string,
  request: UpdateWorkingHoursRequest,
): Promise<WorkingHour[]> {
  const response = await apiClient.put<WorkingHour[]>(
    `/api/businesses/${businessId}/staff/${staffId}/working-hours`,
    request,
  );

  return response.data;
}

export async function getStaffTimeOff(
  businessId: string,
  staffId: string,
): Promise<StaffTimeOff[]> {
  const response = await apiClient.get<StaffTimeOff[]>(
    `/api/businesses/${businessId}/staff/${staffId}/time-off`,
  );

  return response.data;
}

export async function createStaffTimeOff(
  businessId: string,
  staffId: string,
  request: CreateStaffTimeOffRequest,
): Promise<StaffTimeOff> {
  const response = await apiClient.post<StaffTimeOff>(
    `/api/businesses/${businessId}/staff/${staffId}/time-off`,
    request,
  );

  return response.data;
}

export async function deleteStaffTimeOff(
  businessId: string,
  staffId: string,
  timeOffId: string,
): Promise<void> {
  await apiClient.delete(
    `/api/businesses/${businessId}/staff/${staffId}/time-off/${timeOffId}`,
  );
}