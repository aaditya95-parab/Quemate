import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { startQueueConnection } from "../../realtime/queueConnection";
import LoadingState from "../../components/ui/LoadingState";
import StatusBadge from "../../components/ui/StatusBadge";
import type { QueueUpdatedEvent } from "../../types/queue";

interface TokenTracking {
  queueEntryId: string;
  tokenNumber: string;
  status: string;
  peopleAhead: number;
  estimatedWaitMinutes: number;
  currentlyServingToken: string | null;
  serviceName: string;
}

interface TrackTokenPageProps {
  businessId: string;
  queueEntryId: string;
  customerPhone: string;
}

export default function TrackTokenPage({
  businessId,
  queueEntryId,
  customerPhone,
}: TrackTokenPageProps) {
  const [tracking, setTracking] = useState<TokenTracking | null>(
    null,
  );

  const loadTokenTracking = useCallback(async () => {
    try {
      const response = await axios.get<TokenTracking>(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/businesses/${businessId}/queue/${queueEntryId}/track`,
        {
          params: {
            customerPhone,
          },
        },
      );

      setTracking(response.data);
    } catch (error) {
      console.error("Could not load token tracking:", error);
    }
  }, [businessId, queueEntryId, customerPhone]);

  useEffect(() => {
    void loadTokenTracking();
  }, [loadTokenTracking]);

  useEffect(() => {
    if (!queueEntryId) {
      return;
    }

    const handleTokenUpdated = (
      event: QueueUpdatedEvent,
    ) => {
      console.log("Token update received:", event);
      void loadTokenTracking();
    };

    const connect = async () => {
      try {
        const connection = await startQueueConnection();

        connection.on(
          "TokenUpdated",
          handleTokenUpdated,
        );

        await connection.invoke(
          "JoinTokenGroup",
          queueEntryId,
        );
      } catch (error) {
        console.error(
          "Could not connect to token updates:",
          error,
        );
      }
    };

    void connect();

    return () => {
      const disconnect = async () => {
        try {
          const connection = await startQueueConnection();

          connection.off(
            "TokenUpdated",
            handleTokenUpdated,
          );

          await connection.invoke(
            "LeaveTokenGroup",
            queueEntryId,
          );
        } catch {
          // Connection may already be closed.
        }
      };

      void disconnect();
    };
  }, [queueEntryId, loadTokenTracking]);

  if (!tracking) {
    return (
      <main className="booking-shell public-page">
        <LoadingState label="Loading token..." />
      </main>
    );
  }

  return (
    <main className="booking-shell public-page">
      <section className="hero-panel">
        <div className="stack">
          <p>QueueMate live tracking</p>
          <h1>Track your token</h1>
          <p>Live queue status for your visit.</p>
        </div>
      </section>

      <section className="panel stack">
        <h2 className="queue-token">{tracking.tokenNumber}</h2>

        <StatusBadge status={tracking.status} />
        <p>Service: {tracking.serviceName}</p>
        <p>People ahead: {tracking.peopleAhead}</p>
        <p>
          Estimated wait: {tracking.estimatedWaitMinutes} minutes
        </p>

        {tracking.currentlyServingToken && (
          <p>
            Currently serving:{" "}
            {tracking.currentlyServingToken}
          </p>
        )}
      </section>
    </main>
  );
}
