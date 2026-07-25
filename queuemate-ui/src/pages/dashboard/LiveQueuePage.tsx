import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useLiveQueue } from "../../hooks/useLiveQueue";
import type { QueueUpdatedEvent } from "../../types/queue";

interface QueueEntry {
  id: string;
  tokenNumber: string;
  customerName: string;
  serviceName: string;
  status: string;
}

import { useBusiness } from "../../context/BusinessContext";

export default function LiveQueuePage() {
  const { currentBusinessId } = useBusiness();

  if (!currentBusinessId) {
    return null;
  }

  const businessId = currentBusinessId;
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = useCallback(async () => {
    try {
      const token = localStorage.getItem("jwtToken");

      const response = await axios.get<QueueEntry[]>(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/businesses/${businessId}/queue`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setQueueEntries(response.data);
    } catch (error) {
      console.error("Could not load queue:", error);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const handleQueueUpdated = useCallback(
    (event: QueueUpdatedEvent) => {
      console.log("Queue update received:", event);

      void loadQueue();
    },
    [loadQueue],
  );

  useLiveQueue({
    businessId,
    onQueueUpdated: handleQueueUpdated,
  });

  if (loading) {
    return <p>Loading queue...</p>;
  }

  return (
    <main>
      <h1>Live Queue</h1>

      {queueEntries.length === 0 ? (
        <p>No customers are currently in the queue.</p>
      ) : (
        <div>
          {queueEntries.map((entry) => (
            <article key={entry.id}>
              <strong>{entry.tokenNumber}</strong>
              <p>{entry.customerName}</p>
              <p>{entry.serviceName}</p>
              <p>{entry.status}</p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}