const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('./src/utils/bcrypt');

const prisma = new PrismaClient();

async function main() {
    const email = 'a';
    const password = 'a';

    console.log(`Creating admin user: ${email} / ${password}`);

    try {
        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.upsert({
            where: { email: email },
            update: {
                password: hashedPassword,
                role: 'ADMIN',
                isActive: true,
                name: 'Temp Admin'
            },
            create: {
                email: email,
                password: hashedPassword,
                name: 'Temp Admin',
                role: 'ADMIN',
                isActive: true
            },
        });

        console.log('✅ Admin user created successfully!');
        console.log('-----------------------------------');
        console.log(`Email (Username): ${user.email}`);
        console.log(`Password: ${password}`);
        console.log('-----------------------------------');
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
