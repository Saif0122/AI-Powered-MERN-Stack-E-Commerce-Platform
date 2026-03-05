import { Worker } from 'bullmq';
import { connection } from '../config/queueConfig.js';
import Product from '../models/productModel.js';
import { generateEmbedding } from '../utils/geminiEmbeddings.js';
import logger from '../utils/logger.js';

const embeddingWorker = connection ? new Worker('product-embeddings', async (job) => {
    const { productId } = job.data;

    logger.info(`Processing embedding for Product: ${productId}`);

    const product = await Product.findById(productId);
    if (!product) {
        logger.error(`Product not found for embedding job: ${productId}`);
        return;
    }

    try {
        const embeddings = await generateEmbedding(product.description);
        await Product.findByIdAndUpdate(productId, { embeddings });
        logger.info(`Successfully generated and saved embedding for Product: ${productId}`);
    } catch (err) {
        logger.error(`Failed to generate embedding for Product: ${productId} - ${err.message}`);
        throw err; // Re-throw to trigger BullMQ retry
    }
}, { connection }) : null;

embeddingWorker?.on('failed', (job, err) => {
    logger.error(`Embedding job ${job.id} failed: ${err.message}`);
});

export default embeddingWorker;
