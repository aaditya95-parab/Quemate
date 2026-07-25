import { apiClient } from "./apiClient";
import type {
  Business,
  CreateBusinessRequest,
} from "../types/business";

export async function getMyBusinesses(): Promise<Business[]> {
  const response = await apiClient.get<Business[]>(
    "/api/businesses",
  );

  return response.data;
}

export async function getBusinessById(
  businessId: string,
): Promise<Business> {
  const response = await apiClient.get<Business>(
    `/api/businesses/${businessId}`,
  );

  return response.data;
}

export async function createBusiness(
  request: CreateBusinessRequest,
): Promise<Business> {
  const response = await apiClient.post<Business>(
    "/api/businesses",
    request,
  );

  return response.data;
}