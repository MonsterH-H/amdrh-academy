#!/bin/bash
# AMDRH Service Watchdog
# Keeps the realtime socket.io service alive

SERVICE_DIR="/home/z/my-project/mini-services/realtime-service"
LOG_FILE="/home/z/my-project/realtime-service.log"
WLOG="/home/z/my-project/watchdog.log"
PORT=3004
CHECK_INTERVAL=15

echo "[Watchdog] Starting socket.io watchdog for port $PORT" > "$WLOG"

while true; do
  # Check if port is in use by trying to connect
  if ! (echo >/dev/tcp/127.0.0.1/$PORT) 2>/dev/null; then
    echo "[Watchdog] $(date) - Port $PORT not responding, restarting..." >> "$WLOG"
    cd "$SERVICE_DIR"
    nohup bun index.ts > "$LOG_FILE" 2>&1 &
    sleep 4
    if (echo >/dev/tcp/127.0.0.1/$PORT) 2>/dev/null; then
      echo "[Watchdog] $(date) - Restarted OK" >> "$WLOG"
    else
      echo "[Watchdog] $(date) - Restart failed" >> "$WLOG"
    fi
  fi
  sleep $CHECK_INTERVAL
done
