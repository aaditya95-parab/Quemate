export interface WorkingHour {
  id: string;
  dayOfWeek: number;
  startTime: string | null;
  endTime: string | null;
  isClosed: boolean;
}

export interface WorkingHourRequest {
  dayOfWeek: number;
  startTime: string | null;
  endTime: string | null;
  isClosed: boolean;
}

export interface UpdateWorkingHoursRequest {
  workingHours: WorkingHourRequest[];
}

export interface StaffTimeOff {
  id: string;
  staffMemberId: string;
  startDateTimeUtc: string;
  endDateTimeUtc: string;
  reason: string | null;
}

export interface CreateStaffTimeOffRequest {
  startDateTimeUtc: string;
  endDateTimeUtc: string;
  reason?: string;
}