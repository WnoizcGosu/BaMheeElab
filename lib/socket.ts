/**
 * Socket.IO transport for SubmissionUpdateEvent.
 *
 * The server and the worker run as separate Node processes. We bridge them
 * through Redis pub/sub:
 *
 *   server (npm run socket)
 *     └─ Socket.IO server with @socket.io/redis-adapter — accepts browser
 *        clients on SOCKET_PORT (default 3001).
 *   worker (npm run worker)
 *     └─ @socket.io/redis-emitter — fire-and-forget emit into Redis; the
 *        server picks it up and delivers to the right user-room. No HTTP
 *        server bound here, so the worker can run alongside the socket
 *        server without port conflicts.
 *
 * Client contract:
 *   - On connect, client emits `join` with the userId it wants events for.
 *   - Server emits `submission:update` (payload = SubmissionUpdateEvent) into
 *     the userId-room.
 */
import { Server as IOServer } from "socket.io";
import { createServer, type Server as HttpServer } from "node:http";
import { createAdapter } from "@socket.io/redis-adapter";
import { Emitter } from "@socket.io/redis-emitter";
import type { SubmissionUpdateEvent } from "@/types/submission";
import { redis, createBlockingConnection } from "@/lib/redis";

const SOCKET_PORT = Number(process.env.SOCKET_PORT || 3001);
const CORS_ORIGIN = process.env.SOCKET_CORS_ORIGIN || "*";

declare global {
  // eslint-disable-next-line no-var
  var __io: IOServer | undefined;
  // eslint-disable-next-line no-var
  var __ioHttp: HttpServer | undefined;
  // eslint-disable-next-line no-var
  var __ioEmitter: Emitter | undefined;
}

function buildIO(): IOServer {
  const http = createServer();
  const io = new IOServer(http, {
    cors: { origin: CORS_ORIGIN, methods: ["GET", "POST"] },
  });

  // Redis adapter — lets other processes (the worker) emit into our rooms.
  const pubClient = redis;
  const subClient = createBlockingConnection();
  io.adapter(createAdapter(pubClient, subClient));

  io.on("connection", (socket) => {
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

/** Boot the full Socket.IO server. Call this only from the standalone process. */
export function getIO(): IOServer {
  if (!global.__io) global.__io = buildIO();
  return global.__io;
}

/** Cross-process emitter — no HTTP bind, safe to call from the worker. */
function getEmitter(): Emitter {
  if (!global.__ioEmitter) {
    global.__ioEmitter = new Emitter(redis);
  }
  return global.__ioEmitter;
}

/**
 * Emit a submission update to the owning user's room. Works from any process;
 * the standalone Socket.IO server picks it up via the Redis adapter and
 * forwards to connected browser clients.
 */
export function emitSubmissionUpdate(
  userId: string,
  event: SubmissionUpdateEvent
): void {
  getEmitter().to(userId).emit("submission:update", event);
}

// `npm run socket` boots the server.
if (require.main === module) {
  getIO();
}
