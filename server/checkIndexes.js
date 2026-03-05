import 'dotenv/config';
import mongoose from 'mongoose';
import env from './config/env.js';
import logger from './utils/logger.js';

// Import all models to ensure they are registered
import './models/userModel.js';
import './models/productModel.js';
import './models/reviewModel.js';
import './models/categoryModel.js';
import './models/cartModel.js';
import './models/orderModel.js';
import './models/couponModel.js';
import './models/wishlistModel.js';
import './models/exampleModel.js';
import './models/userActivityModel.js';

const checkIndexes = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        logger.success('✅ Connected to MongoDB.');

        console.log('\n--- 🔍 Checking Indexes ---');

        const models = mongoose.modelNames();
        for (const modelName of models) {
            const Model = mongoose.model(modelName);
            const collectionName = Model.collection.name;

            console.log(`\n📦 Collection: ${collectionName}`);

            try {
                const indexes = await Model.collection.indexes();
                indexes.forEach((idx, i) => {
                    const keys = Object.entries(idx.key)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ');
                    const properties = [];
                    if (idx.unique) properties.push('UNIQUE');
                    if (idx.sparse) properties.push('SPARSE');

                    const propsString = properties.length ? ` [${properties.join(', ')}]` : '';
                    console.log(`  ${i + 1}. { ${keys} }${propsString} (name: ${idx.name})`);
                });
            } catch (err) {
                console.log(`  ⚠️ Could not fetch indexes (Collection might not exist yet)`);
            }
        }

        console.log('\n✅ Index check complete.');
        process.exit(0);
    } catch (error) {
        logger.error(`❌ Error checking indexes: ${error.message}`);
        process.exit(1);
    }
};

checkIndexes();
