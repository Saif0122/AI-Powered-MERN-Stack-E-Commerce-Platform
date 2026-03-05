import { Worker } from 'bullmq';
import { connection } from '../config/queueConfig.js';
import Product from '../models/productModel.js';
import logger from '../utils/logger.js';

const emailWorker = connection ? new Worker('email-notifications', async (job) => {
    const { productId, vendorId } = job.data;

    logger.info(`Sending low-stock email for Product: ${productId} to Vendor: ${vendorId}`);

    const product = await Product.findById(productId);
    if (!product) return;

    // Simulation of email sending
    console.log(`
        --------------------------------------------
        TO: vendor-${vendorId}@mercatox.com
        SUBJECT: 🚨 LOW STOCK ALERT: ${product.title}
        BODY: Your product "${product.title}" has reached ${product.stock} items.
        Please restock soon!
        --------------------------------------------
    `);

    logger.info(`Email successfully "sent" for Product: ${productId}`);
}, { connection }) : null;

export default emailWorker;
