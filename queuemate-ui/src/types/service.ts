export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
}

export interface UpdateServiceRequest {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}