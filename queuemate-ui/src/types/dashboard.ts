import type { Appointment } from "./appointment";
import type { QueueEntry } from "./queue";

export interface DashboardStatistics {
  totalAppointments: number;
  activeAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  waitingCustomers: number;
  calledCustomers: number;
  servingCustomers: number;
  completedQueueEntries: number;
  estimatedRevenue: number;
}

export interface DashboardData {
  statistics: DashboardStatistics;
  upcomingAppointments: Appointment[];
  activeQueueEntries: QueueEntry[];
}