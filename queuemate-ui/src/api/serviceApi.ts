import { apiClient } from "./apiClient";
import type {
  CreateServiceRequest,
  Service,
  UpdateServiceRequest,
} from "../types/service";

export async function getServices(
  businessId: string,
): Promise<Service[]> {
  const response = await apiClient.get<Service[]>(
    `/api/businesses/${businessId}/services`,
  );

  return response.data;
}

export async function createService(
  businessId: string,
  request: CreateServiceRequest,
): Promise<Service> {
  const response = await apiClient.post<Service>(
    `/api/businesses/${businessId}/services`,
    request,
  );

  return response.data;
}

export async function updateService(
  businessId: string,
  serviceId: string,
  request: UpdateServiceRequest,
): Promise<Service> {
  const response = await apiClient.put<Service>(
    `/api/businesses/${businessId}/services/${serviceId}`,
    request,
  );

  return response.data;
}

export async function deactivateService(
  businessId: string,
  serviceId: string,
): Promise<void> {
  await apiClient.delete(
    `/api/businesses/${businessId}/services/${serviceId}`,
  );
}