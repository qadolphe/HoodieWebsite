import { NextResponse } from 'next/server';
import { swatAdmin } from '@/lib/swatbloc';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, measurements } = body;

    if (!orderId || !measurements) {
        return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Update measurements in the order using the SDK
    await (swatAdmin.orders.update as any)(orderId, {
      metafields: {
          measurement_status: 'complete',
          ...measurements
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error saving measurements:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
