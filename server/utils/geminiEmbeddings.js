import axios from 'axios';
import env from '../config/env.js';
import logger from './logger.js';
import AppError from './AppError.js';

/**
 * Generates vector embeddings for a given text using Google AI Studio API.
 * 
 * Model: models/embedding-001 (standard Gemini embedding model)
 * API documentation: https://ai.google.dev/api/rest/v1/models/batchEmbedContents
 * 
 * @param {string} text - The input text to embed.
 * @returns {Promise<number[]>} - A promise that resolves to the embedding vector.
 */
export const generateEmbedding = async (text) => {
    if (!text || typeof text !== 'string') {
        throw new AppError('Text input is required for generating embeddings', 400);
    }

    if (!env.GEMINI_API_KEY) {
        logger.error('GEMINI_API_KEY is not configured');
        throw new AppError('Embedding service unavailable', 503);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${env.GEMINI_API_KEY}`;

    try {
        const response = await axios.post(
            url,
            {
                model: 'models/embedding-001',
                content: {
                    parts: [{ text }],
                },
            },
            {
                timeout: 10000, // 10-second timeout
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const embedding = response.data?.embedding?.values;

        if (!embedding || !Array.isArray(embedding)) {
            throw new Error('Malformed response: Embedding values not found');
        }

        logger.debug('Successfully generated embedding via Gemini API');
        return embedding;
    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.error?.message || error.message;

        logger.error(`Gemini API Error [${status}]: ${message}`);

        if (error.code === 'ECONNABORTED') {
            throw new AppError('The embedding request timed out', 504);
        }

        throw new AppError(`Failed to generate embedding: ${message}`, status);
    }
};
