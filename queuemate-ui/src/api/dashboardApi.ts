import { getAppointments } from "./appointmentApi";
import { getLiveQueue } from "./queueApi";
import type { DashboardData } from "../types/dashboard";

function getTodayDate(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function getDashboardData(
  businessId: string,
): Promise<DashboardData> {
  const today = getTodayDate();

  const [appointments, queueEntries] = await Promise.all([
    getAppointments(businessId, today),
    getLiveQueue(businessId, today),
  ]);

  const activeAppointmentStatuses = [
    "Booked",
    "Confirmed",
    "CheckedIn",
    "InService",
  ];

  const activeQueueStatuses = [
    "Waiting",
    "Called",
    "Serving",
  ];

  const estimatedRevenue = appointments
    .filter(
      (appointment) =>
        appointment.status !== "Cancelled" &&
        appointment.status !== "NoShow",
    )
    .reduce(
      (total, appointment) =>
        total + appointment.priceAtBooking,
      0,
    );

  const upcomingAppointments = appointments
    .filter(
      (appointment) =>
        activeAppointmentStatuses.includes(
          appointment.status,
        ) &&
        new Date(appointment.startDateTimeUtc).getTime() >=
          Date.now(),
    )
    .sort(
      (first, second) =>
        new Date(first.startDateTimeUtc).getTime() -
        new Date(second.startDateTimeUtc).getTime(),
    )
    .slice(0, 5);

  const activeQueueEntries = queueEntries
    .filter((entry) =>
      activeQueueStatuses.includes(entry.status),
    )
    .sort(
      (first, second) =>
        first.dailySequenceNumber -
        second.dailySequenceNumber,
    )
    .slice(0, 8);

  return {
    statistics: {
      totalAppointments: appointments.length,

      activeAppointments: appointments.filter(
        (appointment) =>
          activeAppointmentStatuses.includes(
            appointment.status,
          ),
      ).length,

      completedAppointments: appointments.filter(
        (appointment) =>
          appointment.status === "Completed",
      ).length,

      cancelledAppointments: appointments.filter(
        (appointment) =>
          appointment.status === "Cancelled",
      ).length,

      waitingCustomers: queueEntries.filter(
        (entry) => entry.status === "Waiting",
      ).length,

      calledCustomers: queueEntries.filter(
        (entry) => entry.status === "Called",
      ).length,

      servingCustomers: queueEntries.filter(
        (entry) => entry.status === "Serving",
      ).length,

      completedQueueEntries: queueEntries.filter(
        (entry) => entry.status === "Completed",
      ).length,

      estimatedRevenue,
    },

    upcomingAppointments,
    activeQueueEntries,
  };
}