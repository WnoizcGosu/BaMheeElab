/**
 * Socket.IO server.
 *
 * Two ways to use this module:
 *
 *  1. Run it standalone: `npx tsx lib/socket.ts` boots an HTTP+WS server on
 *     SOCKET_PORT (default 3001). The worker imports `emitSubmissionUpdate`
 *     from this file and the io instance is shared via globalThis so emits
 *     reach clients connected to that same server.
 *
 *  2. Import `getIO()` from another long-lived Node process (e.g. the worker
 *     itself) — it lazily attaches to / creates the same singleton.
 *
 * Client contract:
 *   - On connect, client emits `join` with the userId it wants to receive
 *     events for. Server joins that socket to a room named after the userId.
 *   - Server emits `submission:update` (payload = SubmissionUpdateEvent) into
 *     the userId-room.
 */
import { Server as IOServer } from "socket.io";
import { createServer, type Server as HttpServer } from "node:http";
import type { SubmissionUpdateEvent } from "@/types/submission";

const SOCKET_PORT = Number(process.env.SOCKET_PORT || 3001);
const CORS_ORIGIN = process.env.SOCKET_CORS_ORIGIN || "*";

declare global {
  // eslint-disable-next-line no-var
  var __io: IOServer | undefined;
  // eslint-disable-next-line no-var
  var __ioHttp: HttpServer | undefined;
}

function buildIO(): IOServer {
  const http = createServer();
  const io = new IOServer(http, {
    cors: { origin: CORS_ORIGIN, methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    // Frontend tells us which user this socket belongs to.
    socket.on("join", (userId: string) => {
      if (typeof userId === "string" && userId.length > 0) {
        socket.join(userId);
        socket.emit("joined", { userId });
      }
    });
  });

  http.listen(SOCKET_PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[socket] Socket.IO listening on :${SOCKET_PORT}`);
  });

  global.__ioHttp = http;
  return io;
}

export function getIO(): IOServer {
  if (!global.__io) global.__io = buildIO();
  return global.__io;
}

/**
 * Emit a submission update to the owning user's room.
 * This is the only function the worker should need.
 */
export function emitSubmissionUpdate(
  userId: string,
  event: SubmissionUpdateEvent
): void {
  getIO().to(userId).emit("submission:update", event);
}

// If run directly (`tsx lib/socket.ts`), boot the server.
if (require.main === module) {
  getIO();
}
