require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { connectMongo } = require('../src/service/mongoService');
const Product = require('../src/models/product.model');

const SEED_USER_ID = process.env.SEED_USER_ID || 'seed-demo';

const EXTRA_PRODUCTS = [
  {
    title: 'Gaming Mouse RGB',
    price: 1299,
    description: 'Ergonomic wired mouse with adjustable DPI and RGB lighting.',
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80',
  },
  {
    title: 'Yoga Mat Pro',
    price: 899,
    description: 'Anti-slip 6mm yoga mat with carrying strap.',
    category: 'Home',
    image:
      'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&q=80',
  },
  {
    title: 'Denim Jacket Classic',
    price: 2599,
    description: 'Regular-fit denim jacket for all-season styling.',
    category: 'Clothing',
    image:
      'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&q=80',
  },
  {
    title: 'USB-C Fast Charger 65W',
    price: 1499,
    description: 'Compact GaN charger for phones, tablets, and laptops.',
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80',
  },
  {
    title: 'Wooden Wall Shelf Set',
    price: 1899,
    description: 'Set of 3 floating shelves with matte finish.',
    category: 'Home',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
  },
];

async function main() {
  await connectMongo();
  await Product.insertMany(
    EXTRA_PRODUCTS.map(p => ({
      ...p,
      userId: SEED_USER_ID,
    })),
  );
  console.log(
    `Seeded ${EXTRA_PRODUCTS.length} extra products into MongoDB (userId=${SEED_USER_ID}).`,
  );
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
