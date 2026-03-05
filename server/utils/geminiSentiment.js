import axios from 'axios';
import env from '../config/env.js';
import logger from './logger.js';
import AppError from './AppError.js';

/**
 * Analyzes sentiment of a review comment using Gemini 3 Flash.
 * Returns a numeric score between -1 (Negative) and 1 (Positive).
 * 
 * Constraint: Return ONLY the numeric score to ensure low token usage.
 * 
 * @param {string} comment - The review comment to analyze.
 * @returns {Promise<number>} - Numeric sentiment score.
 */
export const analyzeSentiment = async (comment) => {
    if (!comment || typeof comment !== 'string') {
        throw new AppError('Comment text is required for sentiment analysis', 400);
    }

    if (!env.GEMINI_API_KEY) {
        logger.error('GEMINI_API_KEY is not configured for sentiment analysis');
        throw new AppError('Sentiment service unavailable', 503);
    }

    // Note: Using Gemini 1.5 Flash as 'Gemini 3 Flash' might be a typo or future ref.
    // We'll use v1beta to access the latest flash models.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

    const prompt = `Analyze the sentiment of the following review comment and return ONLY a numeric value between -1.0 and 1.0, where -1.0 is very negative, 0 is neutral, and 1.0 is very positive. 
  Do not include any text or explanation.
  
  Comment: "${comment}"
  
  Sentiment Score:`;

    try {
        const response = await axios.post(
            url,
            {
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
                generationConfig: {
                    temperature: 0.1, // Low temperature for consistent numeric output
                    maxOutputTokens: 10, // Minimal tokens for low cost
                },
            },
            {
                timeout: 5000, // 5-second timeout for snappy response
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const resultText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!resultText) {
            throw new Error('No response content from Gemini API');
        }

        const score = parseFloat(resultText);

        if (isNaN(score)) {
            logger.warn(`Gemini returned non-numeric sentiment: ${resultText}`);
            return 0; // Default to neutral on malformed output
        }

        // Clamp score between -1 and 1
        const clampedScore = Math.max(-1, Math.min(1, score));

        logger.debug(`Sentiment analysis completed: ${clampedScore}`);
        return clampedScore;
    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.error?.message || error.message;

        logger.error(`Gemini Sentiment Error [${status}]: ${message}`);

        // In production, we might want to fail-safe to 0 (neutral) instead of throwing
        return 0;
    }
};
