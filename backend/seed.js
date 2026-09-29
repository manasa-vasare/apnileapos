const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with central users and B2B projects...');

  // 1. Seed Central Admin User
  const adminEmail = 'admin@apnileap.com';
  const adminPassword = 'admin123';
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { persona: 'admin' },
    create: {
      email: adminEmail,
      password: adminPassword,
      displayName: 'Central Admin',
      role: 'MODERATOR',
      persona: 'admin'
    },
  });
  console.log(`✅ Admin user created/verified: ${admin.email}`);

  // Campuses bypassed

  // 2. Seed Campus Coordinator Users (for easy testing)
  const coordinators = [
    { email: 'sponsor@company1.com', name: 'Company 1 Sponsor', role: 'SPONSOR', spokeId: null },
    { email: 'kle@apnileap.com', name: 'KLE Coordinator', role: 'COORDINATOR', spokeId: '3' },
    { email: 'coep@apnileap.com', name: 'COEP Coordinator', role: 'COORDINATOR', spokeId: '101' },
    { email: 'mmcoep@apnileap.com', name: 'MMCOEP Coordinator', role: 'COORDINATOR', spokeId: '102' },
    { email: 'rit@apnileap.com', name: 'RIT Coordinator', role: 'COORDINATOR', spokeId: '103' },
  ];

  for (const coord of coordinators) {
    const pwd = 'spoke123';
    await prisma.user.upsert({
      where: { email: coord.email },
      update: { role: coord.role, persona: 'admin' },
      create: {
        email: coord.email,
        password: pwd,
        displayName: coord.name,
        role: coord.role,
        spokeId: coord.campusId,
        persona: 'admin'
      }
    });
    console.log(`✅ Coordinator created/verified: ${coord.email}`);
  }

  // 2.5 Seed Faculty Mentors
  const mentors = [
    { email: 'meenadeshmukh@coep.in', name: 'Dr. Meena Deshmukh', role: 'MENTOR', spokeId: '101' },
    { email: 'sanjaypatil@coep.in', name: 'Prof. Sanjay Patil', role: 'MENTOR', spokeId: '101' },
    { email: 'snehabhosale@coep.in', name: 'Prof. Sneha Bhosale', role: 'MENTOR', spokeId: '101' },
    { email: 'kavitajoshi@mmcoep.in', name: 'Dr. Kavita Joshi', role: 'MENTOR', spokeId: '102' },
    { email: 'amitkulkarni@mmcoep.in', name: 'Prof. Amit Kulkarni', role: 'MENTOR', spokeId: '102' },
    { email: 'rohitpawar@mmcoep.in', name: 'Dr. Rohit Pawar', role: 'MENTOR', spokeId: '102' },
    { email: 'sureshdesai@rit.in', name: 'Dr. Suresh Desai', role: 'MENTOR', spokeId: '103' },
    { email: 'nehasingh@rit.in', name: 'Prof. Neha Singh', role: 'MENTOR', spokeId: '103' },
    { email: 'poojajadhav@rit.in', name: 'Prof. Pooja Jadhav', role: 'MENTOR', spokeId: '103' },
  ];

  for (const mentor of mentors) {
    const pwd = 'faculty123';
    await prisma.user.upsert({
      where: { email: mentor.email },
      update: { persona: 'admin' },
      create: {
        email: mentor.email,
        password: pwd,
        displayName: mentor.name,
        role: mentor.role,
        spokeId: mentor.campusId,
        persona: 'admin'
      }
    });
    console.log(`✅ Faculty Mentor created/verified: ${mentor.email}`);
  }

  // 2.7 Seed Students
  const students = [
    { email: 'manasa@kle.edu', name: 'Manasa Vasare', role: 'STUDENT', spokeId: '3' },
    { email: 'divya@kle.edu', name: 'Divya Kumari', role: 'STUDENT', spokeId: '3' },
    { email: 'vineet@kle.edu', name: 'Vineet Kulkarni', role: 'STUDENT', spokeId: '3' },
    { email: 'renuka@kle.edu', name: 'Renuka Kagadal', role: 'STUDENT', spokeId: '3' },
    { email: 'vageesh@kle.edu', name: 'Vageesh Mathad', role: 'STUDENT', spokeId: '3' },
    { email: 'mehak@kle.edu', name: 'Mehak Sayed', role: 'STUDENT', spokeId: '3' },
    { email: 'parth@kle.edu', name: 'Parth Karpe', role: 'STUDENT', spokeId: '3' },
    { email: 'nupur@kle.edu', name: 'Nupur', role: 'STUDENT', spokeId: '3' },
    { email: 'snehajoshi@coep.edu', name: 'Sneha Joshi', role: 'STUDENT', spokeId: '101' },
    { email: 'amitwaghmare@coep.edu', name: 'Amit Waghmare', role: 'STUDENT', spokeId: '101' },
    { email: 'nikhilrane@mmcoep.edu', name: 'Nikhil Rane', role: 'STUDENT', spokeId: '102' },
    { email: 'sayalideshmukh@mmcoep.edu', name: 'Sayali Deshmukh', role: 'STUDENT', spokeId: '102' },
    { email: 'tejasshinde@rit.edu', name: 'Tejas Shinde', role: 'STUDENT', spokeId: '103' },
    { email: 'pritipatil@rit.edu', name: 'Priti Patil', role: 'STUDENT', spokeId: '103' },
  ];

  for (const student of students) {
    const pwd = 'student123';
    await prisma.user.upsert({
      where: { email: student.email },
      update: { persona: 'admin' },
      create: {
        email: student.email,
        password: pwd,
        displayName: student.name,
        role: student.role,
        spokeId: student.campusId,
        persona: 'admin'
      }
    });
    console.log(`✅ Student created/verified: ${student.email}`);
  }

  // 3. Seed B2B Company Projects
  const projects = [
    {
      company: 'Company 1',
      logoUrl: 'https://logo.clearbit.com/company1.com?size=80',
      title: 'Autonomous Drone Navigation with Jetson Orin',
      description: 'Develop a real-time obstacle avoidance and path-planning system for delivery drones using Company 1 Jetson Orin Nano and depth cameras.',
      duration: '6 Months',
      status: 'Proposed',
      dateAdded: '2026-05-18',
      phases: [{ name: "Phase 1", description: 'Phase 1: Setup Jetson Orin Nano environment and calibrate depth cameras' }]
    },
    {
      company: 'Company 1',
      logoUrl: 'https://logo.clearbit.com/company1.com?size=80',
      title: 'Real-Time Sign Language Translator',
      description: 'Build a GPU-accelerated computer vision pipeline that translates Indian Sign Language gestures into text and speech in real time using deep learning.',
      duration: '5 Months',
      status: 'Proposed',
      dateAdded: '2026-05-20',
      phases: [{ name: "Phase 1", description: 'Phase 1: Configure PyTorch on TensorRT and collect ISL gesture baseline dataset' }]
    },
    {
      company: 'Company 1',
      logoUrl: 'https://logo.clearbit.com/company1.com?size=80',
      title: 'AI-Powered Traffic Flow Optimization',
      description: 'Create an company2ligent traffic signal control system using edge AI inference on Company 1 hardware to reduce congestion and emergency vehicle wait times.',
      duration: '7 Months',
      status: 'Proposed',
      dateAdded: '2026-05-22',
      phases: [{ name: "Phase 1", description: 'Phase 1: Deploy YOLOv8 on Jetson edge devices and capture raw traffic feeds' }]
    },
    {
      company: 'Company 1',
      logoUrl: 'https://logo.clearbit.com/company1.com?size=80',
      title: 'Edge AI Smart Agriculture System',
      description: 'Build an AI-based system using Jetson Nano for precision agriculture monitoring, soil health inspection, and pest detection on crops.',
      duration: '6 Months',
      status: 'Proposed',
      dateAdded: '2026-05-24',
      phases: [{ name: "Phase 1", description: 'Phase 1: Setup Jetson Nano node in test greenhouse and test moisture sensors' }]
    },
    {
      company: 'Company 1',
      logoUrl: 'https://logo.clearbit.com/company1.com?size=80',
      title: 'Isaac Automated Industrial Defect Inspector',
      description: 'Design a high-precision computer vision model deployed on Jetson Orin to automatically inspect PCBs and identify manufacturing anomalies in real time.',
      duration: '8 Months',
      status: 'Proposed',
      dateAdded: '2026-05-26',
      phases: [{ name: "Phase 1", description: 'Phase 1: Set up Isaac Sim workspace and import PCB CAD designs' }]
    }
  ];

  for (const proj of projects) {
    const existing = await prisma.corporateProject.findFirst({
      where: { 
        company: proj.company,
        title: proj.title 
      }
    });
    
    if (!existing) {
      proj.budget = "$10,000";
      proj.proposedDueDate = "2026-12-31";
      await prisma.corporateProject.create({ data: proj });
      console.log(`✅ Created project: [${proj.company}] ${proj.title}`);
    } else {
      console.log(`⚠️ Project already exists: [${proj.company}] ${proj.title}`);
    }
  }

  console.log('✅ Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
