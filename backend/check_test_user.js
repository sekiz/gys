const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    const email = 'test@uzmangys.com';
    const user = await prisma.user.findUnique({
        where: { email: email }
    });

    if (user) {
        console.log(`User found: ${user.email} (ID: ${user.id}, Role: ${user.role})`);
    } else {
        console.log(`User NOT found: ${email}`);
    }
}

checkUser()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
