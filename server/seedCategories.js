import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/categoryModel.js';

dotenv.config();

const categories = [
    { name: 'Electronics', description: 'Electronic devices, gadgets, and accessories' },
    { name: 'Fashion', description: 'Clothing, footwear, and fashion accessories' },
    { name: 'Home & Living', description: 'Furniture, decor, and home essentials' },
    { name: 'Books', description: 'Physical books and digital editions' },
    { name: 'Health & Beauty', description: 'Skincare, makeup, and health products' },
    { name: 'Sports', description: 'Sports equipment and fitness gear' }
];

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        for (const cat of categories) {
            const exists = await Category.findOne({ name: cat.name });
            if (!exists) {
                await Category.create(cat);
                console.log(`Created category: ${cat.name}`);
            } else {
                console.log(`Category already exists: ${cat.name}`);
            }
        }

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedCategories();
