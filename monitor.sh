#!/bin/bash

# rektSafe Server Monitor Script
# Checks server every 5 minutes and restarts if no response

URL="http://localhost:3000"
CHECK_INTERVAL=300  # 5 minutes in seconds
DIST_DIR="/Users/shachindra/Projects/rektsafe/dist"
LOG_FILE="/tmp/rektsafe_monitor.log"
PID_FILE="/tmp/rektsafe_server.pid"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_server() {
    curl -s --max-time 10 "$URL/zksig/" > /dev/null 2>&1
    return $?
}

start_server() {
    log "Starting server..."

    # Kill any existing server on port 3000
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2

    # Start new server
    cd "$DIST_DIR" && python3 -m http.server 3000 > /dev/null 2>&1 &
    echo $! > "$PID_FILE"
    sleep 3

    if check_server; then
        log "Server started successfully on $URL"
        return 0
    else
        log "ERROR: Failed to start server"
        return 1
    fi
}

# Main monitoring loop
log "=== Monitor started ==="

# Start server initially if not running
if ! check_server; then
    start_server
fi

while true; do
    if check_server; then
        log "Health check: OK"
    else
        log "Health check: FAILED - Restarting server..."
        start_server
    fi

    sleep $CHECK_INTERVAL
done
