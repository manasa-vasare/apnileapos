const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:%3Fyu5F37dr5AFyrd@localhost:5432/apnileappp?schema=public"
    }
  }
});

async function main() {
  console.log("Wiping demo data from Local DB...");
  await prisma.corporateProject.deleteMany({});
  await prisma.mockTask.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.meeting.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  console.log("Projects, Tasks, Submissions, Teams, Meetings, and Chat cleared!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
