import { apiClient } from "./apiClient";
import type {
  JoinQueueRequest,
  QueueEntry,
  QueueTracking,
  UpdateQueueStatusRequest,
} from "../types/queue";

export async function getLiveQueue(
  businessId: string,
  date?: string,
): Promise<QueueEntry[]> {
  const response = await apiClient.get<QueueEntry[]>(
    `/api/businesses/${businessId}/queue`,
    {
      params: date ? { date } : undefined,
    },
  );

  return response.data;
}

export async function joinQueue(
  businessId: string,
  request: JoinQueueRequest,
): Promise<QueueEntry> {
  const response = await apiClient.post<QueueEntry>(
    `/api/businesses/${businessId}/queue/join`,
    request,
  );

  return response.data;
}

export async function updateQueueStatus(
  businessId: string,
  queueEntryId: string,
  request: UpdateQueueStatusRequest,
): Promise<QueueEntry> {
  const response = await apiClient.patch<QueueEntry>(
    `/api/businesses/${businessId}/queue/${queueEntryId}/status`,
    request,
  );

  return response.data;
}

export async function callNextCustomer(
  businessId: string,
  serviceId?: string,
): Promise<QueueEntry> {
  const response = await apiClient.post<QueueEntry>(
    `/api/businesses/${businessId}/queue/call-next`,
    null,
    {
      params: serviceId
        ? {
            serviceId,
          }
        : undefined,
    },
  );

  return response.data;
}

export async function trackQueueToken(
  businessId: string,
  queueEntryId: string,
  customerPhone: string,
): Promise<QueueTracking> {
  const response = await apiClient.get<QueueTracking>(
    `/api/businesses/${businessId}/queue/${queueEntryId}/track`,
    {
      params: {
        customerPhone,
      },
    },
  );

  return response.data;
}

export async function cancelQueueEntry(
  businessId: string,
  queueEntryId: string,
  customerPhone: string,
): Promise<void> {
  await apiClient.post(
    `/api/businesses/${businessId}/queue/${queueEntryId}/cancel`,
    null,
    {
      params: {
        customerPhone,
      },
    },
  );
}