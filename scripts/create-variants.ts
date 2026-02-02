import { SwatBloc } from '@swatbloc/sdk';

// SIZES to create
const SIZES = ['S', 'M', 'L', 'XL', '2XL'];

async function run() {
    const liveKey = process.env.NEXT_PRIVATE_SWATBLOC_LIVE_KEY;
    
    if (!liveKey) {
        throw new Error("Missing NEXT_PRIVATE_SWATBLOC_LIVE_KEY");
    }
    
    // Check if key looks valid (starts with sk_live_)
    if (!liveKey.startsWith('sk_live_')) {
        console.warn("Warning: Key does not start with 'sk_live_', are you sure this is the live secret key?");
    }

    console.log(`Using Key: ${liveKey.substring(0, 10)}...`);
    
    const swat = new SwatBloc(liveKey);

    try {
        // 1. Find the product first
        console.log("Fetching products from environment...");
        const products = await swat.products.list();
        
        console.log(`Found ${products.length} products.`);
        console.log(products); // Log full objects to inspect structure

        const refillKit = products.find((p: any) => 
            (p.title && p.title.includes("Refill")) || (p.slug && p.slug.includes("refill"))
        );

        if (!refillKit) {
            console.error("Could not find 'Refill Kit'.");
            return;
        }

        console.log(`Targeting Product: ${refillKit.title} (${refillKit.id})`);

        // Update Product Level Options first
        console.log("Updating Product Options definition...");
        try {
            await swat.products.update(refillKit.id, {
                options: [
                    {
                        name: "Size",
                        values: SIZES
                    }
                ]
            });
            console.log("✅ Product options definition updated.");
        } catch (e: any) {
            console.error("❌ Failed to update product options:", e.message);
        }

        // Check if variants already exist to avoid duplicates (optional, but good practice)
        console.log("Checking existing variants...");
        const existingVariants = await swat.variants.list(refillKit.id).catch(() => []);
        console.log(`Found ${existingVariants.length} existing variants.`);

        // DELETE existing variants to ensure fresh creation with correct options
        if (existingVariants.length > 0) {
            console.log("Deleting existing variants to key correct options mapping...");
            for (const v of existingVariants) {
                try {
                    console.log(`Deleting ${v.title}...`);
                    // Correct signature: swat.variants.delete(productId, variantId)
                    await swat.variants.delete(refillKit.id, v.id); 
                    console.log("✅ Deleted.");
                } catch (e: any) {
                    console.error(`❌ Failed to delete ${v.id}:`, e.message);
                }
            }
        }

        // 2. Create Variants
        for (const size of SIZES) {
             console.log(`Creating variant: ${size}...`);
             // Use price directly (it's already 2499 cents)
             const price = refillKit.price; 
             
             try {
                const variant = await swat.variants.create(refillKit.id, {
                    title: `${refillKit.title} - ${size}`,
                    price: price, 
                    inventory_quantity: 100,
                    options: {
                        "Size": size
                    },
                    sku: `REFILL-${size}`,
                });
                console.log(`✅ Created ${variant.title} (${variant.id})`);
             } catch (err: any) {
                 console.error(`❌ Failed to create ${size}:`, err.message || err);
             }
        }

    } catch (error) {
        console.error("Script failed:", error);
    }
}

run();
