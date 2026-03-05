import 'dotenv/config';
import { connectDB } from './server/config/db.js';

async function test() {
    console.log('--- Diagnostic Start ---');
    try {
        console.log('Attempting to connect to MongoDB...');
        await connectDB();
        console.log('✅ MongoDB connection attempt complete (check logs for success)');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
    }

    try {
        console.log('Importing server.js...');
        await import('./server/server.js');
        console.log('✅ server.js imported');
    } catch (err) {
        console.error('❌ Server Import Error:', err);
        console.error('Stack:', err.stack);
    }
}

test();
