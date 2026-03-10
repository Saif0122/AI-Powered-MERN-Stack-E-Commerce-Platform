import 'dotenv/config';
import mongoose from 'mongoose';
import User from './server/models/userModel.js';

async function verify() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- Database Verification ---');

        const users = await User.find({ role: 'admin' });
        console.log(`Found ${users.length} admin users:`);
        users.forEach(u => console.log(`- ${u.name} (${u.email}): role=${u.role}`));

        const allUsers = await User.find({}).limit(5);
        console.log('\nTop 5 users roles:');
        allUsers.forEach(u => console.log(`- ${u.email}: role=${u.role}`));

        process.exit(0);
    } catch (err) {
        console.error('Verification failed:', err);
        process.exit(1);
    }
}

verify();
