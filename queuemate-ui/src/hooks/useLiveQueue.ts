import { useEffect } from "react";
import { startQueueConnection } from "../realtime/queueConnection";
import type { QueueUpdatedEvent } from "../types/queue";

interface UseLiveQueueOptions {
  businessId: string;
  onQueueUpdated: (event: QueueUpdatedEvent) => void;
}

export function useLiveQueue({
  businessId,
  onQueueUpdated,
}: UseLiveQueueOptions): void {
  useEffect(() => {
    if (!businessId) {
      return;
    }

    let isMounted = true;

    const connect = async () => {
      try {
        const connection = await startQueueConnection();

        connection.on(
          "QueueUpdated",
          onQueueUpdated,
        );

        await connection.invoke(
          "JoinBusinessGroup",
          businessId,
        );
      } catch (error) {
        console.error(
          "Could not connect to the live queue:",
          error,
        );
      }
    };

    void connect();

    return () => {
      isMounted = false;

      const disconnect = async () => {
        const connection = await startQueueConnection();

        connection.off(
          "QueueUpdated",
          onQueueUpdated,
        );

        if (isMounted) {
          return;
        }

        try {
          await connection.invoke(
            "LeaveBusinessGroup",
            businessId,
          );
        } catch {
          // The connection may already be closed.
        }
      };

      void disconnect();
    };
  }, [businessId, onQueueUpdated]);
}