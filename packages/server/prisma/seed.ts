import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear in correct order to avoid FK constraint errors
  // Clear in correct order to avoid FK constraint errors
  await prisma.photo.deleteMany({});
  await prisma.timelineEvent.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.quizAnswer.deleteMany({});
  await prisma.preference.deleteMany({});
  await prisma.missMeterLog.deleteMany({});
  await prisma.tripItem.deleteMany({});
  await prisma.watchlistItem.deleteMany({});
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

  console.log(`✅ Created users: ${user1.displayName} & ${user2.displayName}`);

  // Create countdown config
  const nextVisit = new Date('2026-07-01'); // ← Change this to your actual meetup date
  await prisma.countdownConfig.upsert({
    where: { id: 'default' },
    update: { targetDate: nextVisit },
    create: {
      id: 'default',
      targetDate: nextVisit,
      label: 'Next time I see you 🛫',
    },
  });

  console.log('✅ Created countdown config');

  const timelineEvents = [
    {
      date: new Date('1440-01-01'),
      title: 'Gutenberg Invents the Printing Press',
      description: 'Knowledge spreads across the world. Books, newspapers, love letters — all made possible.',
      emoji: '📜',
      order: 1,
    },
    {
      date: new Date('1969-07-20'),
      title: 'Moon Landing',
      description: 'Humanity reached the moon. A small step for man, a giant leap for mankind. Still not the most important event of history. That came later.',
      emoji: '🌕',
      order: 2,
    },
    {
      date: new Date('1983-01-01'),
      title: 'Internet Born',
      description: 'The internet was born. The world got connected. Still not the most important connection ever made.',
      emoji: '🌐',
      order: 3,
    },
    {
      date: new Date('2021-09-22'),
      title: 'The First Birthday 🎂',
      description: 'Your first birthday together. You spilled the iced tea. You were crying. He was consoling you. In that one moment — watching how genuinely you felt everything — he knew. Your heart was the purest thing he had ever seen.',
      emoji: '🎂',
      order: 4,
    },
    {
      date: new Date('2021-11-09'),
      title: 'The First Kiss 💋',
      description: 'November 9th, 2021. Scientists are still studying the atmospheric disturbance this caused.',
      emoji: '💋',
      order: 5,
    },
    {
      date: new Date('2022-02-26'),
      title: 'The First Good Kiss 😘',
      description: 'February 25th or 26th, 2022. (He remembers it was one of these two. She remembers exactly which one. Typical.) Either way — certified improvement. 10/10, would recommend.',
      emoji: '😘',
      order: 6,
    },
    {
      date: new Date('2022-09-01'),
      title: 'The Coaching Era Begins 🚌',
      description: 'September 2022 to January 2023. Every single day, travelling together to coaching. The commute that somehow became the best part of the day. Historians will refer to this as the Golden Age.',
      emoji: '🚌',
      order: 7,
    },
  ];

  for (const event of timelineEvents) {
    await prisma.timelineEvent.create({ data: event });
  }

  console.log(`✅ Created ${timelineEvents.length} timeline events`);
  console.log('🎉 Seeding complete!');
  console.log('');
  console.log('Login credentials:');
  console.log('  Dev     → username: dev2211   / password: dev2211');
  console.log('  Yashika → username: yashu2211 / password: yashu2211');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });