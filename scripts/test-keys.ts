import { SwatBloc } from '@swatbloc/sdk';

const pk = "pk_live_dnX7sfOjZoIhBrisMOQ5J9NFS6Ee1V2W";
const sk = "sk_live_tGXA2PClcNlbqYzcTrwmZQJes2pkmuZ8";

async function test(name: string, key: string) {
    console.log(`Testing with ${name} (${key.slice(0, 7)}...)...`);
    const swat = new SwatBloc(key);
    try {
        const product = await swat.products.create({
            name: "Test " + name,
            slug: "test-" + name.toLowerCase(),
            price: 100,
            category: "test"
        });
        console.log(`✅ Success for ${name}!`);
    } catch (e: any) {
        console.log(`❌ Failed for ${name}: ${e.message}`);
    }
}

async function run() {
    await test("Public Key", pk);
    await test("Secret Key", sk);
}

run();
