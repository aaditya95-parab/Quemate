export interface AvailableSlot {
  startDateTimeUtc: string;
  endDateTimeUtc: string;
  localStartTime: string;
  localEndTime: string;
}

export interface Appointment {
  id: string;
  businessId: string;
  serviceId: string;
  serviceName: string;
  staffMemberId: string;
  staffName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  startDateTimeUtc: string;
  endDateTimeUtc: string;
  status: AppointmentStatusName;
  notes: string | null;
  priceAtBooking: number;
  createdAtUtc: string;
}

export interface CreateAppointmentRequest {
  serviceId: string;
  staffMemberId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  startDateTimeUtc: string;
  notes?: string;
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatusValue;
}

export type AppointmentStatusName =
  | "Booked"
  | "Confirmed"
  | "CheckedIn"
  | "InService"
  | "Completed"
  | "Cancelled"
  | "NoShow";

export type AppointmentStatusValue =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7;

export const appointmentStatusOptions: Array<{
  value: AppointmentStatusValue;
  label: AppointmentStatusName;
}> = [
  { value: 1, label: "Booked" },
  { value: 2, label: "Confirmed" },
  { value: 3, label: "CheckedIn" },
  { value: 4, label: "InService" },
  { value: 5, label: "Completed" },
  { value: 6, label: "Cancelled" },
  { value: 7, label: "NoShow" },
];