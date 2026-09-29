const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://apnileapp_db_user:tQ9neTgbpTIlVtCnBO8uUFvmQTUShSM3@dpg-dapjntv1k1mc73brsu70-a.oregon-postgres.render.com/apnileapp_db?schema=public&sslmode=require"
    }
  }
});

async function main() {
  console.log("Wiping demo data from Render DB...");
  await prisma.corporateProject.deleteMany({});
  await prisma.mockTask.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.meeting.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  console.log("Projects, Tasks, Submissions, Teams, Meetings, and Chat cleared!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
