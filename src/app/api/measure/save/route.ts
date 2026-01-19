import { NextResponse } from 'next/server';
import { swatAdmin } from '@/lib/swatbloc';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, measurements, itemId } = body;

    if (!orderId || !measurements) {
        return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const updates: any = {
        metafields: {}
    };

    if (itemId) {
        // Standardized storage: always use namespaced keys per item
        updates.metafields[`status_${itemId}`] = 'complete';
        updates.metafields[`measurements_${itemId}`] = JSON.stringify(measurements);
    } else {
        // Should not happen with new frontend, but if it does, 
        // implies a single-item legacy scenario or an error.
        // We'll mark the global status for safety.
        updates.metafields['measurement_status'] = 'complete';
    }

    // Update measurements in the order using the SDK
    await (swatAdmin.orders.update as any)(orderId, updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error saving measurements:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
