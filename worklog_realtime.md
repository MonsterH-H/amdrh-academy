---
Task ID: 2
Agent: Realtime Service Agent
Task: Create WebSocket real-time service + frontend integration + push API

Work Log:
- Created mini-services/realtime-service/index.ts with Socket.IO server on port 3004:
  - Rate limiting: 5 connections/10s per IP, 30 messages/60s per user
  - Room-based broadcasting (per user, per role, per conversation)
  - Presence tracking with 90s TTL heartbeat cleanup
  - In-memory notification count cache
  - Connection state recovery support
  - HTTP API endpoints for Next.js push integration:
    - POST /push/user — push event to specific user
    - POST /push/role — push event to all users of a role
    - POST /push/broadcast — push to all connected sockets
    - POST /cache/notification-count — update and broadcast unread count
    - GET /presence/online — get online users list
    - GET /presence/role — get online users by role
    - GET /health — service health check
  - Socket events: notifications:subscribe, notifications:read, notifications:allRead,
    messages:subscribe, messages:unsubscribe, messages:typing, messages:new,
    progress:update, quiz:submit, admin:broadcast, ping/pong
- Created src/hooks/use-realtime.ts — React hook for Socket.IO client:
  - Singleton connection manager with auto-reconnect (exponential backoff)
  - Connection state tracking (isConnected)
  - Event subscription helpers (on/emit)
  - Notification subscription
  - Conversation room subscription/unsubscription
  - Typing indicator emission
  - Message sending with rate limiting
  - Progress update emission
- Created src/app/api/realtime/push/route.ts — Next.js push API:
  - pushToUser, pushToRole, pushToAll helper functions
  - 3s timeout on all push requests (never blocks API routes)
  - Graceful fallback if realtime service is unavailable
- Created src/app/api/realtime/online/route.ts — Online users API:
  - GET with optional role filter
  - Falls back to {count: 0, users: []} if service is down
- Renamed src/middleware.ts to src/proxy.ts for Next.js 16 compatibility
  - Changed export from middleware() to proxy()
- Installed socket.io + socket.io-client packages

Stage Summary:
- Real-time WebSocket service running on port 3004 with rate limiting and presence tracking
- Frontend hook (useRealtime) for real-time connection management
- Push API bridge between Next.js and Socket.IO service
- Online users API endpoint
- Next.js 16 proxy convention (middleware → proxy rename)
