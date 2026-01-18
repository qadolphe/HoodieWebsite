import { SwatBloc } from '@swatbloc/sdk';

const requiredKey = process.env.NEXT_PUBLIC_SWATBLOC_KEY || process.env.SWATBLOC_PUBLIC_KEY;

if (!requiredKey) {
  throw new Error("Missing NEXT_PUBLIC_SWATBLOC_KEY or SWATBLOC_PUBLIC_KEY in environment variables");
}

const swat = new SwatBloc(requiredKey);

async function check() {
  try {
    console.log("\nListing products from products API...");
    const products = await swat.products.list();
    console.log("Products count:", products.length);
    console.log("Latest Products:", JSON.stringify(products.slice(-2), null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

check();
