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

    // Filter down to just the kits
    const kitItems = allItems.filter((item: any) => {
        const rawProdId = item.product_id || item.product?.id || item.productId || item.id || '';
        const prodId = typeof rawProdId === 'string' ? rawProdId.toLowerCase() : '';
        return KIT_IDS.includes(prodId);
    });

    // Expand items with quantity > 1 into individual entries
    const expandedItems: any[] = [];
    kitItems.forEach((item: any) => {
        const qty = item.quantity || 1;
        for (let i = 0; i < qty; i++) {
            // Use a composite ID if multiple qty: itemId_index
            // If qty is 1, just use itemId
            const instanceId = qty > 1 ? `${item.id}_${i}` : item.id;
            const instanceName = qty > 1 ? `${item.name || item.title || 'Kit'} (${i + 1})` : (item.name || item.title || 'Kit');
            
            // Check status in metafields. 
            // We'll store per-item status in a metafield key like `measurement_status_${instanceId}`
            // Or look for a JSON object in `measurement_data`
            
            // For now, let's assume we store it in metadata with key `status_${instanceId}`
            const statusKey = `status_${instanceId}`;
            const itemStatus = data.metafields?.[statusKey] || data.metadata?.[statusKey] || 'pending';

            expandedItems.push({
                id: instanceId,
                name: instanceName,
                status: itemStatus
            });
        }
    });

    const hasKit = expandedItems.length > 0;
    const allComplete = expandedItems.length > 0 && expandedItems.every(i => i.status === 'complete');
    
    // Fallback for legacy single-status orders
    const legacyComplete = data.metafields?.measurement_status === 'complete' || data.metadata?.measurement_status === 'complete';

    return NextResponse.json({ 
        success: true, 
        completed: allComplete || legacyComplete,
        hasKit,
        orderId: realOrderId,
        items: expandedItems
    });
  } catch (error) {
    console.error('API Error checking status:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
