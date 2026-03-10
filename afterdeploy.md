# Local development environment
# The API proxy path — Vite dev server forwards /api/* to Railway (see vite.config.ts proxy)
VITE_API_URL=http://localhost:5173/api/v1

# /api

# Direct Railway URL for Socket.IO (WebSockets cannot go through the Vercel/Vite proxy)
VITE_SOCKET_URL=https://ai-powered-mern-stack-e-commerce-platform-production.up.railway.app




"https://ai-powered-mern-stack-e-commerce-platform-production.up.railway.app/api/v1/$1"
