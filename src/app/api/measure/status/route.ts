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
        console.log(`[Status Check] Searching by Session ID: ${sessionId}`);
        // Retry logic to wait for webhook
        const MAX_RETRIES = 5;
        for (let i = 0; i < MAX_RETRIES; i++) {
            const orders = await (swatAdmin as any).orders.list({ sessionId });
            if (orders && orders.length > 0) {
                // We found the order, but let's fetch the full details by ID to ensure we have all items/metafields
                const foundOrder = orders[0];
                console.log(`[Status Check] Order found by session on attempt ${i + 1}:`, foundOrder.id);
                
                // Fetch full order details
                data = await swatAdmin.orders.get(foundOrder.id) as any;
                break;
            }
            console.log(`[Status Check] Attempt ${i + 1} failed, retrying...`);
            await new Promise(r => setTimeout(r, 1500));
        }
    } else if (orderId) {
        // Fetch order by ID directly
        data = await swatAdmin.orders.get(orderId) as any;
    }

    if (!data) {
         return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Capture the real internal ID if we searched by session
    const realOrderId = data.id;

    // Check if order contains a kit (for frontend persistence)
    // We check root level items, line_items, and order_items based on SDK variation
    console.log('[Status Check] Order Keys:', Object.keys(data));
    
    const allItems = [
        ...(data.items || []), 
        ...(data.line_items || []),
        ...(data.order_items || [])
    ];

    if (allItems.length === 0) {
        console.warn('[Status Check] No items found in order data directly. Checking nested SDK fields.');
    }

    const hasKit = allItems.some((item: any) => {
        // Checking against KIT_IDS from constants - ensure lowercase comparison
        const rawProdId = item.product_id || item.product?.id || item.productId || item.id || '';
        const prodId = typeof rawProdId === 'string' ? rawProdId.toLowerCase() : '';
        const isKit = KIT_IDS.includes(prodId);
        
        console.log(`[Status Check] Item: ${item.title || item.name}, ID: ${prodId}, Is Kit: ${isKit}`);
        return isKit;
    });

    console.log(`[Status Check] Order: ${realOrderId}, Has Kit: ${hasKit}, Total Items Checked: ${allItems.length}`);

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
