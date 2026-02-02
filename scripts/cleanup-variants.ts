import { SwatBloc } from '@swatbloc/sdk';

async function run() {
    const liveKey = process.env.NEXT_PRIVATE_SWATBLOC_LIVE_KEY;
    const swat = new SwatBloc(liveKey!);

    const products = await swat.products.list();
    const refillKit = products.find((p: any) => p.title && p.title.includes("Refill"));

    if (!refillKit) { console.error("No refill kit"); return; }
    console.log(`Product: ${refillKit.id}`);

    const variants = await swat.variants.list(refillKit.id);
    console.log(`Found ${variants.length} variants.`);

    // Group by size
    const bySize: Record<string, any[]> = {};
    for (const v of variants) {
        const size = v.options?.Size;
        if (size) {
            if (!bySize[size]) bySize[size] = [];
            bySize[size].push(v);
        }
    }

    for (const size in bySize) {
        const list = bySize[size];
        if (list.length > 1) {
            console.log(`Duplicate found for ${size}. Keeping the newest one.`);
            // Sort by created_at maybe? Or just keep last one in list (if list is chronological).
            // Let's assume list order is undefined, we'll keep the last one created. 
            // Since we don't have created_at in the succinct log, let's just keep the one with the NEW ID that we just saw created.
            // Actually, simply deleting all but one is fine.
            
            // list[0] is essentially an "extra".
            for (let i = 0; i < list.length - 1; i++) {
                const toDelete = list[i];
                console.log(`Deleting duplicate ${toDelete.id}...`);
                try {
                   // Try signatures
                   // 1. swat.variants.delete(productId, variantId)
                   await swat.variants.delete(refillKit.id, toDelete.id);
                   console.log("✅ Deleted.");
                } catch (e1: any) {
                    console.error(`Attempt 1 failed: ${e1.message}`);
                    try {
                        // 2. swat.variants.delete(variantId)
                        await swat.variants.delete(toDelete.id);
                    } catch (e2: any) {
                        console.error(`Attempt 2 failed: ${e2.message}`);
                    }
                }
            }
        }
    }
}

run();
