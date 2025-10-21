import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

const sampleProducts = [
  {
    name: 'Fresh Organic Tomatoes',
    category: 'Vegetables',
    price: '4.99',
    unit: 'per lb',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&h=300&fit=crop',
    farmer: 'Green Valley Farm',
    farmer_id: 1,
    distance: 5,
    organic: true,
    featured: true,
    description: 'Juicy, vine-ripened organic tomatoes grown with sustainable farming practices.',
    stock: 50
  },
  {
    name: 'Farm Fresh Eggs',
    category: 'Dairy & Eggs',
    price: '6.50',
    unit: 'dozen',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&h=300&fit=crop',
    farmer: 'Happy Hen Farm',
    farmer_id: 2,
    distance: 8,
    organic: true,
    featured: true,
    description: 'Free-range eggs from happy hens with bright orange yolks and rich flavor.',
    stock: 30
  },
  {
    name: 'Organic Carrots',
    category: 'Vegetables',
    price: '3.25',
    unit: 'per lb',
    image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=500&h=300&fit=crop',
    farmer: 'Sunshine Acres',
    farmer_id: 3,
    distance: 12,
    organic: true,
    featured: false,
    description: 'Sweet, crunchy organic carrots perfect for snacking or cooking.',
    stock: 40
  },
  {
    name: 'Local Honey',
    category: 'Pantry',
    price: '12.99',
    unit: 'per jar',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&h=300&fit=crop',
    farmer: 'Bee Happy Apiaries',
    farmer_id: 4,
    distance: 6,
    organic: true,
    featured: true,
    description: 'Pure, raw local honey harvested from wildflower meadows.',
    stock: 20
  },
  {
    name: 'Fresh Spinach',
    category: 'Vegetables',
    price: '5.75',
    unit: 'per bunch',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&h=300&fit=crop',
    farmer: 'Green Valley Farm',
    farmer_id: 1,
    distance: 5,
    organic: true,
    featured: false,
    description: 'Tender, nutrient-rich spinach leaves perfect for salads and cooking.',
    stock: 25
  },
  {
    name: 'Grass-Fed Ground Beef',
    category: 'Meat',
    price: '8.99',
    unit: 'per lb',
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500&h=300&fit=crop',
    farmer: 'Prairie Wind Ranch',
    farmer_id: 5,
    distance: 15,
    organic: true,
    featured: true,
    description: 'Premium grass-fed ground beef from pasture-raised cattle.',
    stock: 15
  }
];

async function seedProducts() {
  try {
    console.log('🌱 Starting to seed products...');
    
    for (const product of sampleProducts) {
      try {
        await sql`
          INSERT INTO products (name, category, price, unit, image, farmer, farmer_id, distance, organic, featured, description, stock)
          VALUES (${product.name}, ${product.category}, ${product.price}, ${product.unit}, ${product.image}, ${product.farmer}, ${product.farmer_id}, ${product.distance}, ${product.organic}, ${product.featured}, ${product.description}, ${product.stock})
        `;
        console.log(`✅ Added: ${product.name}`);
      } catch (error) {
        if (error.message.includes('duplicate key')) {
          console.log(`⚠️ ${product.name} already exists, skipping...`);
        } else {
          console.error(`❌ Error adding ${product.name}:`, error.message);
        }
      }
    }
    
    console.log('🎉 Products seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  }
}

seedProducts();