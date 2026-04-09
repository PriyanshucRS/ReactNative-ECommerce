require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { db } = require('../src/service/firebaseService');
const admin = require('firebase-admin');

const SEED_USER_ID = process.env.SEED_USER_ID || 'seed-demo';

const MORE_PRODUCTS = [
  {
    title: 'Bluetooth Speaker Mini',
    price: 1799,
    description: 'Compact wireless speaker with deep bass and 12h playback.',
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&q=80',
  },
  {
    title: 'Ceramic Coffee Mug Set',
    price: 999,
    description: 'Set of 4 ceramic mugs, microwave and dishwasher safe.',
    category: 'Home',
    image:
      'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=800&q=80',
  },
  {
    title: 'Laptop Backpack 25L',
    price: 2199,
    description: 'Water-resistant backpack with padded 15.6-inch laptop sleeve.',
    category: 'Clothing',
    image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
  },
  {
    title: 'Noise Cancelling Headphones',
    price: 5499,
    description: 'Over-ear headphones with ANC and 40-hour battery life.',
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  },
  {
    title: 'Minimal Desk Lamp',
    price: 1499,
    description: 'LED desk lamp with 3 brightness modes and touch controls.',
    category: 'Home',
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
  },
];

async function main() {
  const batch = db.batch();
  const col = db.collection('products');

  MORE_PRODUCTS.forEach(p => {
    const ref = col.doc();
    batch.set(ref, {
      ...p,
      userId: SEED_USER_ID,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
  console.log(
    `Seeded ${MORE_PRODUCTS.length} more products into Firestore (userId=${SEED_USER_ID}).`,
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
