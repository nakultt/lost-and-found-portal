// Inserts sample posts so the listing page has data to show.
require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./models/Post');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lost_and_found';
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

const samples = [
  {
    type: 'lost',
    title: 'Black HP Laptop Charger',
    description: '65W HP charger with a small sticker on the brick. Left it after the DBMS lab.',
    category: 'electronics',
    location: 'CSE Block, Lab 3',
    date: daysAgo(1),
    contact: { name: 'Arjun', email: 'arjun@college.edu', phone: '9876543210' },
  },
  {
    type: 'found',
    title: 'Student ID Card - Priya S',
    description: 'Found near the canteen entrance. 2nd year ECE. Handed over to the security desk.',
    category: 'id-cards',
    location: 'Main Canteen',
    date: daysAgo(0),
    contact: { name: 'Security Office', email: 'security@college.edu' },
  },
  {
    type: 'lost',
    title: 'Operating System Concepts (Galvin)',
    description: 'Blue cover, name written on first page. Library copy, need it back urgently.',
    category: 'books',
    location: 'Central Library, 2nd floor',
    date: daysAgo(3),
    contact: { name: 'Meena', email: 'meena@college.edu' },
  },
  {
    type: 'found',
    title: 'Casio fx-991ES Calculator',
    description: 'Scientific calculator found in exam hall after the maths paper.',
    category: 'electronics',
    location: 'Exam Hall B',
    date: daysAgo(2),
    contact: { name: 'Rahul', email: 'rahul@college.edu', phone: '9123456780' },
  },
  {
    type: 'found',
    title: 'Bunch of keys with red keychain',
    description: 'Three keys, one looks like a bike key. Found on the basketball court.',
    category: 'keys',
    location: 'Sports Ground',
    date: daysAgo(4),
    contact: { name: 'Karthik', email: 'karthik@college.edu' },
  },
  {
    type: 'lost',
    title: 'Grey Wildcraft Backpack',
    description: 'Contains a lab record and a blue lunch box. Left on the college bus (Route 7).',
    category: 'bags',
    location: 'College Bus Route 7',
    date: daysAgo(2),
    contact: { name: 'Divya', email: 'divya@college.edu', phone: '9988776655' },
  },
  {
    type: 'found',
    title: 'Boat Airdopes (white case)',
    description: 'Wireless earbuds in a white charging case, found under a seat in the seminar hall.',
    category: 'accessories',
    location: 'Seminar Hall 1',
    date: daysAgo(1),
    contact: { name: 'Vignesh', email: 'vignesh@college.edu' },
  },
  {
    type: 'lost',
    title: 'Navy blue college hoodie',
    description: 'Size M, AI&DS department hoodie. Left in the indoor stadium after practice.',
    category: 'clothing',
    location: 'Indoor Stadium',
    date: daysAgo(6),
    contact: { name: 'Sanjay', email: 'sanjay@college.edu' },
    status: 'resolved',
  },
];

(async () => {
  await mongoose.connect(MONGO_URI);
  await Post.deleteMany({});
  await Post.insertMany(samples);
  console.log(`Seeded ${samples.length} posts`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
