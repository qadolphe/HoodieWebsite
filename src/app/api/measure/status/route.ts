import { NextResponse } from 'next/server';
import { swatAdmin } from '@/lib/swatbloc';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
        return NextResponse.json({ success: false, error: 'Missing orderId' }, { status: 400 });
    }

    // Fetch order to check status
    const data = await (swatAdmin as any).collection('orders').get(orderId);

    if (!data) {
         return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const isComplete = data.metafields?.measurement_status === 'complete';

    return NextResponse.json({ 
        success: true, 
        completed: isComplete,
        measurements: isComplete ? data.metafields : null 
    });
  } catch (error) {
    console.error('API Error checking status:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
