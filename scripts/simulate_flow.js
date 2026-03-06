import axios from 'axios';
import 'dotenv/config';

/**
 * Script to simulate End-to-End flow:
 * 1. Login
 * 2. Add product to cart
 * 3. Place order
 * 4. Trigger stock alerts
 */

const API_URL = process.env.API_URL || 'https://ai-powered-mern-stack-e-commerce-platform-production.up.railway.app/api/v1';
const USER_CREDENTIALS = {
    email: 'user@example.com',
    password: 'password123'
};
const PRODUCT_ID = '65f1a2b3c4d5e6f7a8b9c0d1'; // Replace with a valid ID from your DB

async function simulate() {
    try {
        console.log('--- Starting Flow Simulation ---');

        // 1. Login
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, USER_CREDENTIALS);
        const token = loginRes.data.token;
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
        console.log('✅ Logged in successfully');

        // 2. Add to Cart
        console.log('2. Adding product to cart...');
        await axios.post(`${API_URL}/cart`, { productId: PRODUCT_ID, quantity: 1 }, authHeaders);
        console.log('✅ Added to cart');

        // 3. Checkout (Places order, triggers stock check, socket emits, and cache invalidation)
        console.log('3. Placing order...');
        const orderData = {
            shippingAddress: {
                fullName: 'Simulator Bot',
                phone: '123456789',
                address: '123 Tech Lane',
                city: 'Cyber City',
                postalCode: '10101',
                country: 'Netland'
            }
        };
        const orderRes = await axios.post(`${API_URL}/orders`, orderData, authHeaders);
        console.log('✅ Order placed:', orderRes.data.data.order._id);

        console.log('\n--- Simulation Complete ---');
        console.log('Check server logs for:');
        console.log('1. Socket.IO "new-order" emission');
        console.log('2. Socket.IO "low-stock" emission (if threshold met)');
        console.log('3. Redis cache invalidation for "admin:stats:dashboard"');

    } catch (error) {
        console.error('❌ Simulation Failed:', error.response?.data?.message || error.message);
    }
}

simulate();
