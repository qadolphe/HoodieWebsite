import { NextResponse } from 'next/server';
import { swatAdmin } from '@/lib/swatbloc';
import { KIT_IDS } from '@/lib/constants';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const sessionId = searchParams.get('sessionId');

    if (!orderId && !sessionId) {
        return NextResponse.json({ success: false, error: 'Missing orderId or sessionId' }, { status: 400 });
    }

    let data: any = null;

    if (sessionId) {
        // Retry logic to wait for webhook
        const MAX_RETRIES = 5;
        for (let i = 0; i < MAX_RETRIES; i++) {
            const orders = await (swatAdmin as any).orders.list({ sessionId });
            if (orders && orders.length > 0) {
                // Fetch full order details to ensure we have all items/metafields
                data = await swatAdmin.orders.get(orders[0].id) as any;
                break;
            }
            await new Promise(r => setTimeout(r, 1500));
        }
    } else if (orderId) {
        data = await swatAdmin.orders.get(orderId) as any;
    }

    if (!data) {
         return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const realOrderId = data.id;

    // Collate all possible item fields from the SDK response
    const allItems = [
        ...(data.items || []), 
        ...(data.line_items || []),
        ...(data.order_items || [])
    ];

    const hasKit = allItems.some((item: any) => {
        const rawProdId = item.product_id || item.product?.id || item.productId || item.id || '';
        const prodId = typeof rawProdId === 'string' ? rawProdId.toLowerCase() : '';
        return KIT_IDS.includes(prodId);
    });

    const isComplete = data.metafields?.measurement_status === 'complete' || data.metadata?.measurement_status === 'complete';

    return NextResponse.json({ 
        success: true, 
        completed: isComplete,
        hasKit,
        orderId: realOrderId,
        measurements: isComplete ? data.metafields : null 
    });
  } catch (error) {
    console.error('API Error checking status:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
