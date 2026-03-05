# Real-time Testing & Deployment Checklist - MercatoX

This guide covers the setup, testing, and monitoring of real-time features including Socket.IO, Redis caching, and background workers.

---

## 1. Local Environment Setup

### Redis with Docker Compose
MercatoX uses Redis for caching and background queues (BullMQ).
- **Start Redis**:
  ```bash
  docker-compose up -d redis
  ```
- **Verify Connection**:
  ```bash
  docker exec -it mercatox-redis redis-cli ping
  # Expected output: PONG
  ```

### Local Socket.IO Development
- Ensure `server.js` initializes `initSocket(server)`.
- The client connects via `socket.io-client` to the server port (default: 5000).
- **Debugging Tip**: Use the [Socket.IO Admin UI](https://socket.io/docs/v4/admin-ui/) for visual monitoring of connections and rooms.

---

## 2. Order & Flow Simulation

### Simulate Order Flow (curl)
To test the full flow (Cart -> Checkout -> Stock Alert), use the following steps:

1. **Get Auth Token**:
   ```bash
   # Login to get JWT
   curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "password": "password123"}'
   ```

2. **Add to Cart**:
   ```bash
   curl -X POST http://localhost:5000/api/v1/cart \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"productId": "<PROD_ID>", "quantity": 1}'
   ```

3. **Checkout**:
   ```bash
   curl -X POST http://localhost:5000/api/v1/orders \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"shippingAddress": {"fullName": "Test User", "address": "123 Main St", "city": "London", "postalCode": "E1 6AN", "country": "UK"}}'
   ```

---

## 3. Cache & Background Job Testing

### Cache Invalidation
- **Scenario**: When an order is placed, admin analytics and user recommendations must invalidate.
- **Verification**: Check Redis keys after an order:
  ```bash
  docker exec -it mercatox-redis redis-cli keys "*"
  # Ensure 'admin:stats:dashboard' and 'recs:personalized:<USER_ID>' are cleared/recomputed.
  ```

### Background Workers
- Ensure `npm run worker` is running in a separate terminal.
- **Health Endpoint**: Access `http://localhost:5000/health` to ensure the main server is up. 
- *Recommendation*: Implement a `/health/worker` endpoint that checks BullMQ connection status.

---

## 4. E2E Test Scenarios (Playwright)

### Scenario A: Low-Stock Alert
1. User adds the last item of a product to cart.
2. User completes checkout.
3. **Assert**: `Product.stock` decreases.
4. **Assert**: Socket.IO event `low-stock` is emitted to the vendor room.
5. **Assert**: Background job `low-stock-email` is enqueued in Redis.

### Scenario B: Sentiment-Driven Recommendations
1. User writes a product review with text "Absolutely amazing, best purchase ever!".
2. Sentiment analysis (Gemini) marks it as `positive`.
3. **Assert**: User's recommendation weight for that category increases.
4. **Assert**: Next call to `/api/v1/recommendations/personalized` reflects the change.

---

## 5. Monitoring & Health

- **Structured Logging**: All real-time events (Socket emits, Job completions) are logged via `logger.js` to `server.log`.
- **Worker Monitoring**: Use `bull-board` or similar dashboard for real-time queue visibility in production.
- **Health Checks**:
  - `GET /health` -> 200 OK
  - `GET /api/v1/analytics/admin` -> Check `fromCache` header to verify Redis health.
