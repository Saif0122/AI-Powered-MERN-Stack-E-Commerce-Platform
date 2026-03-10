import 'dotenv/config';
import mongoose from 'mongoose';
import User from './server/models/userModel.js';

async function fix() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Update the user to admin
        const email = 'kdsalkdsalk37@gmail.com'; // Extracted from previous output
        const user = await User.findOneAndUpdate(
            { email },
            { role: 'admin' },
            { new: true }
        );

        if (user) {
            console.log(`✅ User ${email} updated to role: ${user.role}`);
        } else {
            console.log(`❌ User ${email} not found`);
        }

        // Also update any 'seller' to 'vendor' and 'buyer' to 'user' to align with new schema
        const sellerUpdate = await User.updateMany({ role: 'seller' }, { role: 'vendor' });
        console.log(`Updated ${sellerUpdate.modifiedCount} 'seller' to 'vendor'`);

        const buyerUpdate = await User.updateMany({ role: 'buyer' }, { role: 'user' });
        console.log(`Updated ${buyerUpdate.modifiedCount} 'buyer' to 'user'`);

        process.exit(0);
    } catch (err) {
        console.error('Fix failed:', err);
        process.exit(1);
    }
}

fix();
