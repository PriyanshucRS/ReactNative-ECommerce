/**
 * Seeds sample products into Firestore `products` collection.
 *
 * Requirements:
 * - `backend/firebaseServiceAccountKey.json` must exist (same as server).
 * - Run from repo: `cd backend && node scripts/seedProducts.js`
 *
 * Optional env:
 * - SEED_USER_ID — stored as product `userId` (default: "seed-demo")
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// Same credentials as server (`backend/firebaseServiceAccountKey.json`).
const { db } = require('../src/service/firebaseService');
const admin = require('firebase-admin');

const SEED_USER_ID = process.env.SEED_USER_ID || 'seed-demo';

const PRODUCTS = [
  {
    title: 'Wireless Earbuds Pro',
    price: 2499,
    description:
      'Active noise cancellation, 30h battery with case, IPX5 water resistant.',
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1590658260037-6b121765878a?w=800&q=80',
  },
  {
    title: 'Smart Fitness Watch',
    price: 3999,
    description:
      'Heart rate, SpO2, sleep tracking, 7-day battery life.',
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
  },
  {
    title: 'Cotton Crew T-Shirt',
    price: 599,
    description: '100% cotton, regular fit, machine washable.',
    category: 'Clothing',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
  },
  {
    title: 'Stainless Steel Water Bottle',
    price: 799,
    description: '750ml insulated, keeps drinks cold up to 24 hours.',
    category: 'Home',
    image:
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
  },
  {
    title: 'Running Shoes Lite',
    price: 3299,
    description:
      'Lightweight mesh upper, cushioned sole for daily runs.',
    category: 'Clothing',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  },
];

async function main() {
  const batch = db.batch();
  const col = db.collection('products');

  PRODUCTS.forEach(p => {
    const ref = col.doc();
    batch.set(ref, {
      ...p,
      userId: SEED_USER_ID,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
  console.log(`Seeded ${PRODUCTS.length} products into Firestore (userId=${SEED_USER_ID}).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
