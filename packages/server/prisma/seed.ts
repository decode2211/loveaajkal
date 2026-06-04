import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing users to avoid conflicts
  await prisma.user.deleteMany({});

  // Create both users
  const passwordHash1 = await bcrypt.hash('dev2211', 12);
  const passwordHash2 = await bcrypt.hash('yashu2211', 12);

  const user1 = await prisma.user.create({
    data: {
      username: 'dev2211',
      passwordHash: passwordHash1,
      displayName: 'Dev',
      timezone: 'Asia/Kolkata',
      city: 'Guntur',
      avatarUrl: null,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'yashu2211',
      passwordHash: passwordHash2,
      displayName: 'Yashika',
      timezone: 'America/Chicago',
      city: 'Katy, Texas',
      avatarUrl: null,
    },
  });

  console.log(`✅ Created users: ${user1.displayName} & ${user2.displayName}`);  // Create countdown config
  const nextVisit = new Date();
  nextVisit.setDate(nextVisit.getDate() + 47);

  await prisma.countdownConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      targetDate: nextVisit,
      label: 'Next time I see you 🛫',
    },
  });

  console.log('✅ Created countdown config');

 const timelineEvents = [

  // ━━━ EVENTS THAT CHANGED MANKIND ━━━

  {
    date: new Date('1400000-01-01'),  // use a symbolic old date
    title: 'Discovery of Fire 🔥',
    description: 'Early humans discovered fire. Warm hands, cooked food, dramatic candlelit dinners became possible. None of it mattered yet.',
    emoji: '🔥',
    order: 1,
  },
  {
    date: new Date('3500-01-01BC'),
    title: 'Invention of the Wheel 🛞',
    description: 'Mesopotamia figured out the wheel. Transportation, pottery, civilization — all unlocked. Still not the most important invention. That came later.',
    emoji: '🛞',
    order: 2,
  },
  
  

  // ━━━ THE ACTUAL IMPORTANT EVENTS ━━━

  {
    date: new Date('2021-09-22'),
    title: 'The First Birthday 🎂',
    description: 'Your first birthday together. You spilled the iced tea. You were crying. He was consoling you. In that one moment — watching how genuinely you felt everything — he knew. Your heart was the purest thing he had ever seen. Mankind had been waiting 4 million years for this moment.',
    emoji: '🎂',
    order: 6,
  },
  {
    date: new Date('2021-11-09'),
    title: 'The First Kiss 💋',
    description: 'November 9th, 2021. Scientists are still studying the atmospheric disturbance this caused.',
    emoji: '💋',
    order: 7,
  },
  {
    date: new Date('2022-02-26'),
    title: 'The First Good Kiss 😘',
    description: 'February 25th or 26th, 2022. (He remembers it was one of these two. She remembers exactly which one. Typical.) Either way — certified improvement. 10/10, would recommend.',
    emoji: '😘',
    order: 9,
  },

  {
    date: new Date('2022-09-01'),
    title: 'The Coaching Era Begins 🚌',
    description: 'September 2022 to January 2023. Every single day, travelling together to coaching. The commute that somehow became the best part of the day. Historians will refer to this as the Golden Age.',
    emoji: '🚌',
    order: 8,
  },
  

  // ━━━ PLACEHOLDER FOR FUTURE MEMORIES ━━━
  // (These get added via the app UI — see below)

  ];

  for (const event of timelineEvents) {
    await prisma.timelineEvent.create({ data: event }).catch(() => {
      // skip if already exists
    });
  }

  console.log(`✅ Created ${timelineEvents.length} timeline events`);

  console.log('🎉 Seeding complete!');
  console.log('');
  console.log('Login credentials:');
  console.log('  Person 1 → username: person1 / password: password123');
  console.log('  Person 2 → username: person2 / password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
