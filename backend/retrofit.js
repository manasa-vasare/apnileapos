require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function provisionExisting() {
  const auth = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64');
  
  const project = await prisma.corporateProject.findFirst({
    where: { title: 'Smart Water Distribution Monitoring & Leak Detection Network' }
  });
  
  if (!project) return console.log("Not found");
  
  const safeCompany = "COM";
  const newKey = `${safeCompany}${Math.floor(Math.random() * 9000) + 1000}`;
  
  console.log(`Creating Jira Project ${newKey}...`);
  
  const projectBody = {
      key: newKey,
      name: project.title.substring(0, 80),
      projectTypeKey: "software",
      projectTemplateKey: "com.pyxis.greenhopper.jira:gh-simplified-kanban-classic",
      description: project.description,
      leadAccountId: "712020:9b424ef2-c4f0-4698-9488-90af2d3bae9f"
  };
  
  try {
      const projRes = await axios.post(`${process.env.JIRA_DOMAIN}/rest/api/3/project`, projectBody, {
          headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" }
      });
      const realKey = projRes.data.key;
      console.log(`Jira Project Created: ${realKey}`);
      
      const standardTasks = project.phases.map(p => `Phase ${p.name}: ${p.description}`);
      
      for (let taskSummary of standardTasks) {
        await axios.post(`${process.env.JIRA_DOMAIN}/rest/api/3/issue`, {
          fields: {
            project: { key: realKey },
            summary: taskSummary,
            description: { type: "doc", version: 1, content: [{ type: "paragraph", content: [{ type: "text", text: "Automated task" }] }] },
            issuetype: { name: "Task" },
            labels: ["allocated-task"]
          }
        }, {
          headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" }
        });
      }
      
      let allocs = project.allocations;
      let target = allocs.find(a => a.targetCampusId === "3");
      target.assignedKey = realKey;
      target.customBoardId = realKey;
      
      await prisma.corporateProject.update({
        where: { id: project.id },
        data: { assignedKey: realKey, allocations: allocs }
      });
      
      console.log("Successfully retrofitted DB with Live Jira project:", realKey);
  } catch (e) {
      console.error(e.response?.data || e.message);
  }
}

provisionExisting();
