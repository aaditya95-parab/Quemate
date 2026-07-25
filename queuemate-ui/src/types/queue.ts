export interface QueueEntry {
  id: string;
  businessId: string;
  tokenNumber: string;
  dailySequenceNumber: number;
  queueDate: string;
  serviceId: string;
  serviceName: string;
  staffMemberId: string | null;
  staffName: string | null;
  appointmentId: string | null;
  customerName: string;
  customerPhone: string;
  status: QueueStatusName;
  joinedAtUtc: string;
  calledAtUtc: string | null;
  serviceStartedAtUtc: string | null;
  completedAtUtc: string | null;
}

export interface JoinQueueRequest {
  serviceId: string;
  staffMemberId?: string;
  appointmentId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
}

export interface QueueTracking {
  queueEntryId: string;
  tokenNumber: string;
  status: QueueStatusName;
  peopleAhead: number;
  estimatedWaitMinutes: number;
  currentlyServingToken: string | null;
  serviceName: string;
}

export interface UpdateQueueStatusRequest {
  status: QueueStatusValue;
  staffMemberId?: string;
}

export interface QueueUpdatedEvent {
  eventType:
    | "QueueJoined"
    | "QueueStatusChanged"
    | "NextCustomerCalled"
    | "QueueCancelled";

  businessId: string;
  queueEntryId: string;
  tokenNumber: string;
  status: string;
  occurredAtUtc: string;
}

export type QueueStatusName =
  | "Waiting"
  | "Called"
  | "Serving"
  | "Completed"
  | "Cancelled"
  | "NoShow";

export type QueueStatusValue = 1 | 2 | 3 | 4 | 5 | 6;

export const queueStatusOptions: Array<{
  value: QueueStatusValue;
  label: QueueStatusName;
}> = [
  { value: 1, label: "Waiting" },
  { value: 2, label: "Called" },
  { value: 3, label: "Serving" },
  { value: 4, label: "Completed" },
  { value: 5, label: "Cancelled" },
  { value: 6, label: "NoShow" },
];