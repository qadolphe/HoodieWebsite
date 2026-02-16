import { SwatBloc } from '@swatbloc/sdk';
// Run with: npx tsx --env-file=.env.local scripts/update-kits-pipeline.ts

const secretKey = process.env.NEXT_PRIVATE_SWATBLOC_KEY;

if (!secretKey) {
  throw new Error("Missing NEXT_PRIVATE_SWATBLOC_KEY in environment variables");
}

const swat = new SwatBloc(secretKey);

const KITS = [
    { name: 'Essentials Kit', id: 'e6d01c1b-6923-4f2c-9454-3ccd3ab726ca' },
    { name: 'Refill Kit', id: '9b17e3aa-0d23-44da-a317-a33540d142fe' },
    { name: 'All-in-One Kit', id: 'c4f4d01d-eb12-47ae-9234-9e066c70e279' }
];

const steps = [
    {
        id: 'labels_box_printed',
        label: 'Labels and Box Printed',
        required_metadata: []
    },
    {
        id: 'kit_assembled',
        label: 'Kit Assembled',
        required_metadata: []
    },
    {
        id: 'kit_sent',
        label: 'Kit Sent',
        required_metadata: []
    },
    {
        id: 'kit_recieved',
        label: 'Kit Recieved',
        required_metadata: []
    }
];

async function updatePipeline() {
    for (const kit of KITS) {
        console.log(`UPDATE: Updating pipeline for ${kit.name} (${kit.id})...`);
        try {
            const product = await swat.products.updatePipeline(kit.id, steps);
            console.log(`SUCCESS: Pipeline updated for ${kit.name}.`);
        } catch (error: any) {
            console.error(`ERROR: Failed to update pipeline for ${kit.name}:`, error.message);
            if (error.response) {
                console.error('Data:', error.response.data);
            }
        }
    }
}

updatePipeline();
