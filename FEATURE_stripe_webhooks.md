# Feature: Stripe Webhooks & Fraud Handling

This feature implements a secure webhook handler for Stripe events and basic fraud detection logic.

## Environment Variables

Add the following to your `server/.env` file:

```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
FRAUD_THRESHOLD=500
```

## How to Test Locally

### 1. Install Stripe CLI
Download and install the [Stripe CLI](https://stripe.com/docs/stripe-cli).

### 2. Login to Stripe
```bash
stripe login
```

### 3. Forward Webhooks
Start forwarding webhooks to your local server:
```bash
stripe listen --forward-to localhost:5000/api/v1/webhooks/stripe
```
The CLI will output your `STRIPE_WEBHOOK_SECRET` (starting with `whsec_`). Update your `.env` file with this value.

### 4. Trigger Events
In a new terminal, trigger a successful checkout:
```bash
stripe trigger checkout.session.completed --metadata userId=YOUR_USER_ID
```
*Note: Replace `YOUR_USER_ID` with a valid MongoDB ObjectId from your `users` collection.*

## Fraud Flags in Test Mode

The system automatically flags orders for manual review if:
1. **Total Price > Threshold**: If the order total exceeds `FRAUD_THRESHOLD` (default: 500).
2. **Country Mismatch**: If the billing country does not match the shipping country.

### Testing Fraud Flags
You can trigger a high-value order to see the flag in action:
```bash
stripe trigger checkout.session.completed --metadata userId=YOUR_USER_ID --amount 60000
```
*(Amount is in cents, so 60000 = $600)*

## Admin Endpoint
Admins can view flagged orders at:
`GET /api/v1/payments/flagged`
