import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';

async function run() {
    if (process.env.NODE_ENV !== 'development') {
        console.error('Script à utiliser uniquement en development.');
        process.exit(1);
    }
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI absent — configure .env');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const cursor = User.find().cursor();
    let updated = 0;
    for await (const user of cursor) {
        const pw = user.password || '';
        if (!/^\$2[aby]\$/.test(pw)) {
            const newHash = await bcrypt.hash(String(pw), 10);
            user.password = newHash;
            await user.save();
            console.log('Hashed password for', user.email);
            updated++;
        }
    }

    console.log(`Done — updated ${updated} users`);
    await mongoose.disconnect();
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});