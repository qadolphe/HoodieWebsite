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
        // 1. Find the kits first
        console.log("Fetching products from environment...");
        const products = await swat.products.list();
        
        console.log(`Found ${products.length} products total.`);

        const kits = products.filter((p: any) => 
            p.id === '9b17e3aa-0d23-44da-a317-a33540d142fe' || // Refill
            p.id === 'e6d01c1b-6923-4f2c-9454-3ccd3ab726ca' || // Essentials
            p.id === 'c4f4d01d-eb12-47ae-9234-9e066c70e279'    // All-in-one
        );

        console.log(`Targeting ${kits.length} kits.`);

        for (const kit of kits) {
            console.log(`\n--- Processing Kit: ${kit.title} (${kit.id}) ---`);

            // Update Product Level Options first
            console.log("Updating Product Options definition...");
            try {
                await swat.products.update(kit.id, {
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

            // Check if variants already exist
            console.log("Checking existing variants...");
            const existingVariants = await swat.variants.list(kit.id).catch(() => []);
            console.log(`Found ${existingVariants.length} existing variants.`);

            // DELETE existing variants for this kit to ensure fresh creation with correct options
            if (existingVariants.length > 0) {
                console.log("Deleting existing variants to key correct options mapping...");
                for (const v of existingVariants) {
                    try {
                        console.log(`Deleting ${v.title}...`);
                        await swat.variants.delete(kit.id, v.id); 
                        console.log("✅ Deleted.");
                    } catch (e: any) {
                        console.error(`❌ Failed to delete ${v.id}:`, e.message);
                    }
                }
            }

            // 2. Create Variants
            const skuBase = kit.slug.replace(/-kit.*$/, '').toUpperCase();

            for (const size of SIZES) {
                 console.log(`Creating variant: ${size}...`);
                 const price = kit.price; 
                 
                 try {
                    const variant = await swat.variants.create(kit.id, {
                        title: `${kit.title} - ${size}`,
                        price: price, 
                        inventory_quantity: 100,
                        options: {
                            "Size": size
                        },
                        sku: `${skuBase}-${size}`,
                    });
                    console.log(`✅ Created ${variant.title} (${variant.id})`);
                 } catch (err: any) {
                     console.error(`❌ Failed to create ${size}:`, err.message || err);
                 }
            }
        }

    } catch (error) {
        console.error("Script failed:", error);
    }
}

run();
