import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5221";

let connection: HubConnection | null = null;

export function getQueueConnection(): HubConnection {
  if (connection) {
    return connection;
  }

  connection = new HubConnectionBuilder()
    .withUrl(`${apiBaseUrl}/hubs/queue`, {
      accessTokenFactory: () => localStorage.getItem("jwtToken") ?? "",
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();

  return connection;
}

export async function startQueueConnection(): Promise<HubConnection> {
  const queueConnection = getQueueConnection();

  if (
    queueConnection.state === HubConnectionState.Disconnected
  ) {
    await queueConnection.start();
  }

  return queueConnection;
}

export async function stopQueueConnection(): Promise<void> {
  if (
    connection &&
    connection.state !== HubConnectionState.Disconnected
  ) {
    await connection.stop();
  }
}