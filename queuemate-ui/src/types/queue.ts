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