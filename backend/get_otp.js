const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://apnileapp_db_user:tQ9neTgbpTIlVtCnBO8uUFvmQTUShSM3@dpg-dapjntv1k1mc73brsu70-a.oregon-postgres.render.com/apnileapp_db?schema=public&sslmode=require"
    }
  }
});
prisma.user.findUnique({ where: { email: 'mentor2@kle.edu' } }).then(u => {
  console.log('--- OTP CODE IS:', u.otpCode, '---');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
