#!/bin/bash
set -e

echo "=== Starting Discord Bot Deployment ==="
echo "Checking environment and files..."

# Check for critical files
if [ -f ".env" ]; then
  echo "✅ .env file found"
else
  echo "❌ .env file missing!"
fi

if [ -f "credentials.json" ]; then
  echo "✅ credentials.json found"
else
  echo "❌ credentials.json missing!"
fi

# Print Discord token (first few characters only)
DISCORD_TOKEN=$(grep DISCORD_BOT_TOKEN .env | cut -d "=" -f2 | tr -d " ")
if [ -n "$DISCORD_TOKEN" ]; then
  echo "✅ Found DISCORD_BOT_TOKEN: ${DISCORD_TOKEN:0:8}..."
else
  echo "❌ DISCORD_BOT_TOKEN not found in .env!"
fi

# List current directory for debugging
echo "📂 Directory contents:"
ls -la

# Create a simple status file to record running processes
touch discord_bot_status.log
echo "Startup timestamp: $(date)" > discord_bot_status.log

# Create health check server
PORT=${PORT:-8080}
echo "Creating health check server on port $PORT..."

cat > health_server.py << 'EOF'
import http.server
import socketserver
import os

PORT = int(os.environ.get('PORT', 8080))

class HealthHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b'Discord bot is running')
        
    def log_message(self, format, *args):
        return

print(f"Health check server started at port {PORT}")
httpd = socketserver.TCPServer(("", PORT), HealthHandler)
httpd.serve_forever()
EOF

# Start the health check server in the background and save its PID
python health_server.py &
HEALTH_PID=$!

# Make sure the health server is running before continuing
echo "Waiting for health check server to start..."
sleep 5

# Check if the health server process is still running
if kill -0 $HEALTH_PID 2>/dev/null; then
  echo "✅ Health check server running on port $PORT"
else
  echo "❌ Health check server failed to start!"
  exit 1
fi

# Run the Discord bot with output to log file
echo "===== STARTING DISCORD BOT NOW! =====" >> discord_bot_status.log
echo "Starting Discord bot with command: python -u init_discord_bot.py"
echo "Starting Discord bot..."
echo "Command executed at: $(date)" >> discord_bot_status.log

# Run the Discord bot with all output captured to the log file
python -u init_discord_bot.py 2>&1 | tee -a discord_bot.log

# Report on exit
echo "Discord bot exited with code $?" | tee -a discord_bot_status.log

# Keep the container running for health check
echo "Bot exited, keeping container alive for logs inspection"
tail -f discord_bot.log 