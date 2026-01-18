import { SwatBloc } from '@swatbloc/sdk';
// Run with: npx tsx --env-file=.env.local scripts/seed-products.ts

const requiredKey = process.env.NEXT_PUBLIC_SWATBLOC_KEY || process.env.SWATBLOC_PUBLIC_KEY;

if (!requiredKey) {
  throw new Error("Missing NEXT_PUBLIC_SWATBLOC_KEY or SWATBLOC_PUBLIC_KEY in environment variables");
}

const swat = new SwatBloc(requiredKey);

const INVENTORY = [
  { 
    title: "Standard Mail-In Service", 
    name: "Standard Mail-In Service", 
    slug: "mail-in-service",
    category: "service",
    price: 6500, // $65.00
    description: "Customer sends their hoodie → You line it → You return it." 
  },
  { 
    title: "Concierge Service", 
    name: "Concierge Service", 
    slug: "concierge",
    category: "service",
    price: 14500, // $145.00 (Example: $80 Hoodie + $65 Service) - Adjust as needed
    description: "You buy the hoodie new (e.g., a Nike hoodie) → You line it → You ship the finished product. Price includes estimated hoodie cost." 
  }
];

async function seed() {
  console.log("🌱 Seeding products...");
  
  for (const item of INVENTORY) {
    try {
        const product = await swat.products.create({
          title: item.title,
          name: item.name,
          slug: item.slug,
          category: item.category,
          price: item.price, // Ensure this is in cents!
          description: item.description,
          inventory_quantity: 100, // Match SDK field name
          images: [] 
        });
        console.log(`✅ Created: ${product.title || product.name}`);
    } catch (error: any) {
        console.error(`❌ Failed to create ${item.name}:`, error.message);
    }
  }
}

seed();
