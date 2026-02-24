require('dotenv').config();
const bcrypt = require('bcrypt');
const prisma = require('./src/db');

async function seed() {
    try {
        const hash = await bcrypt.hash('admin123', 10);
        const user = await prisma.user.create({
            data: {
                email: 'admin@myflipcoin.com',
                password: hash,
                name: 'Super Admin',
                role: 'SUPERUSER',
                status: 'active'
            }
        });
        await prisma.wallet.create({ data: { userId: user.id, balance: 0 } });
        console.log('✅ Superuser created!');
        console.log(`   Email: admin@myflipcoin.com`);
        console.log(`   Password: admin123`);
        console.log(`   Role: SUPERUSER`);
    } catch (error) {
        if (error.code === 'P2002') {
            console.log('⚠️  Superuser already exists!');
        } else {
            console.error('❌ Error:', error.message);
        }
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

seed();
