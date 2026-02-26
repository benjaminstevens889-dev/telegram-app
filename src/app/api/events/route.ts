import { NextRequest } from 'next/server';

// Global store for SSE connections
declare global {
  // eslint-disable-next-line no-var
  var sseConnections: Map<string, Set<(data: string) => void>> | undefined;
}

// Initialize global connections store
if (!global.sseConnections) {
  global.sseConnections = new Map<string, Set<(data: string) => void>>();
}

const connections = global.sseConnections;

// Send event to specific user
export function sendEventToUser(userId: string, event: string, data: any) {
  const userConnections = connections.get(userId);
  if (userConnections) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    userConnections.forEach((send) => send(message));
    console.log(`[SSE] Sent ${event} to user ${userId}`);
    return true;
  }
  return false;
}

// Broadcast to all users
export function broadcastEvent(event: string, data: any) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  connections.forEach((userConnections) => {
    userConnections.forEach((send) => send(message));
  });
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');

  if (!userId) {
    return new Response('Missing userId', { status: 400 });
  }

  // Setup SSE stream
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Send function for this connection
  const send = async (data: string) => {
    try {
      await writer.write(encoder.encode(data));
    } catch {
      // Connection closed
    }
  };

  // Register connection
  if (!connections.has(userId)) {
    connections.set(userId, new Set());
  }
  connections.get(userId)!.add((data: string) => {
    send(data).catch(() => {});
  });

  console.log(`[SSE] User ${userId} connected. Total users: ${connections.size}`);

  // Send initial connection message
  await writer.write(encoder.encode(`event: connected\ndata: {"userId":"${userId}"}\n\n`));

  // Heartbeat to keep connection alive
  const heartbeat = setInterval(async () => {
    try {
      await writer.write(encoder.encode(': heartbeat\n\n'));
    } catch {
      clearInterval(heartbeat);
    }
  }, 30000);

  // Cleanup on disconnect
  request.signal.addEventListener('abort', () => {
    clearInterval(heartbeat);
    const userConnections = connections.get(userId);
    if (userConnections) {
      userConnections.delete((data: string) => send(data).catch(() => {}));
      if (userConnections.size === 0) {
        connections.delete(userId);
      }
    }
    console.log(`[SSE] User ${userId} disconnected`);
  });

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
