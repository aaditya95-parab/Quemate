import { apiClient } from "./apiClient";
import type {
  Appointment,
  AvailableSlot,
  CreateAppointmentRequest,
  UpdateAppointmentStatusRequest,
} from "../types/appointment";
import type { Service } from "../types/service";
import type { StaffMember } from "../types/staff";

export async function getPublicServices(
  businessId: string,
): Promise<Service[]> {
  const response = await apiClient.get<Service[]>(
    `/api/public/businesses/${businessId}/services`,
  );

  return response.data;
}

export async function getPublicStaff(
  businessId: string,
): Promise<StaffMember[]> {
  const response = await apiClient.get<StaffMember[]>(
    `/api/public/businesses/${businessId}/staff`,
  );

  return response.data;
}

export async function getAvailableSlots(
  businessId: string,
  serviceId: string,
  staffId: string,
  date: string,
): Promise<AvailableSlot[]> {
  const response = await apiClient.get<AvailableSlot[]>(
    `/api/businesses/${businessId}/appointments/available-slots`,
    {
      params: {
        serviceId,
        staffId,
        date,
      },
    },
  );

  return response.data;
}

export async function createAppointment(
  businessId: string,
  request: CreateAppointmentRequest,
): Promise<Appointment> {
  const response = await apiClient.post<Appointment>(
    `/api/businesses/${businessId}/appointments`,
    request,
  );

  return response.data;
}

export async function getAppointments(
  businessId: string,
  date?: string,
): Promise<Appointment[]> {
  const response = await apiClient.get<Appointment[]>(
    `/api/businesses/${businessId}/appointments`,
    {
      params: date ? { date } : undefined,
    },
  );

  return response.data;
}

export async function getAppointmentById(
  businessId: string,
  appointmentId: string,
): Promise<Appointment> {
  const response = await apiClient.get<Appointment>(
    `/api/businesses/${businessId}/appointments/${appointmentId}`,
  );

  return response.data;
}

export async function updateAppointmentStatus(
  businessId: string,
  appointmentId: string,
  request: UpdateAppointmentStatusRequest,
): Promise<Appointment> {
  const response = await apiClient.patch<Appointment>(
    `/api/businesses/${businessId}/appointments/${appointmentId}/status`,
    request,
  );

  return response.data;
}

export async function cancelAppointment(
  businessId: string,
  appointmentId: string,
  customerPhone: string,
): Promise<void> {
  await apiClient.post(
    `/api/businesses/${businessId}/appointments/${appointmentId}/cancel`,
    null,
    {
      params: {
        customerPhone,
      },
    },
  );
}