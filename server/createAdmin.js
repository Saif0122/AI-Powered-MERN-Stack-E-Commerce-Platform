import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/userModel.js';

dotenv.config();

const createAdmin = async (name, email, password) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists, updating to admin...');
            existingUser.role = 'admin';
            if (password) {
                existingUser.password = password; // Will be hashed by pre-save hook
            }
            await existingUser.save();
            console.log('User updated to admin successfully');
        } else {
            console.log('Creating new admin user...');
            const newUser = new User({
                name,
                email,
                password, // Will be hashed by pre-save hook
                role: 'admin'
            });
            await newUser.save();
            console.log('Admin user created successfully');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err);
        process.exit(1);
    }
};

const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node createAdmin.js <name> <email> [password]');
    process.exit(1);
}

createAdmin(args[0], args[1], args[2] || 'admin1234');
