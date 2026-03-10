import express from 'express';
import { handleWebhook } from '../controllers/paymentController.js';

const router = express.Router();

// Webhook endpoint: /api/v1/webhooks/stripe
router.post('/stripe', handleWebhook);

export default router;
