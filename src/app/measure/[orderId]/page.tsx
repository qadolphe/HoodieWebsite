'use client';

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CanvasTool from '@/components/CanvasTool';
import { Upload, CheckCircle } from 'lucide-react';
import { Measurements } from '@/types';

export default function MeasurementPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router = useRouter();
  
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'complete'>('pending');
  const [items, setItems] = useState<{ id: string; name: string; status: string }[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [localCompletedIds, setLocalCompletedIds] = useState<Set<string>>(new Set());
  
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        
        // In development, if NEXT_PUBLIC_URL is set (e.g. to a local IP or tunnel), 
        // use that host instead of localhost so phones can scan the QR code.
        const envUrl = process.env.NEXT_PUBLIC_URL;
        if (envUrl && envUrl !== 'http://localhost:3000' && window.location.hostname === 'localhost') {
            const baseUrl = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
            setCurrentUrl(`${baseUrl}${url.pathname}${url.search}`);
        } else {
            setCurrentUrl(window.location.href);
        }
    }
  }, []);

  useEffect(() => {
    if (currentUrl) {
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`);
    }
  }, [currentUrl]);

  // Poll for status changes (Cross-device sync)
  useEffect(() => {
    // Only poll if we are not done & we haven't taken an image locally
    if (status === 'complete' || image) return;

    let intervalId: NodeJS.Timeout;

    const checkStatus = async () => {
        try {
            const res = await fetch(`/api/measure/status?orderId=${orderId}`);
            const data = await res.json();
            
            if (data.success) {
                if (data.items && Array.isArray(data.items)) {
                    // Merge server items with local completion state to prevent race conditions
                    const mergedItems = data.items.map((srvItem: any) => {
                         if (localCompletedIds.has(srvItem.id)) {
                             return { ...srvItem, status: 'complete' };
                         }
                         return srvItem;
                    });

                    setItems(mergedItems);
                    
                    // Find first pending item
                    const pendingItem = mergedItems.find((i: any) => i.status !== 'complete');
                    if (pendingItem) {
                         // Only update active item if it's different (avoids flicks)
                         setActiveItemId(prev => prev === pendingItem.id ? prev : pendingItem.id);
                    } else if (data.completed || mergedItems.every((i: any) => i.status === 'complete')) {
                        setStatus('complete');
                        clearInterval(intervalId);
                    }
                } else if (data.completed) {
                     // Fallback for legacy
                     setStatus('complete');
                     clearInterval(intervalId);
                }
            }
        } catch (e) {
            console.error("Polling error", e);
        }
    };

    checkStatus();
    intervalId = setInterval(checkStatus, 3000);

    return () => clearInterval(intervalId);
  }, [orderId, status, image, localCompletedIds]);


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = async (measurements: Measurements) => {
    try {
      const activeId = activeItemId || (items.length > 0 ? items[0].id : null);
      
      const res = await fetch('/api/measure/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, measurements, itemId: activeId }),
      });

      if (!res.ok) throw new Error('Failed to save');
      
      // Update local state instead of hard navigating
      setImage(null);
      // Mark as locally complete so polling doesn't revert us
      if (activeId) {
          setLocalCompletedIds(prev => {
              const next = new Set(prev);
              next.add(activeId);
              return next;
          });
      }
      
      // Update items list locally to reflect validation
      const updatedItems = items.map(i => i.id === activeId ? { ...i, status: 'complete' } : i);
      setItems(updatedItems);
      
      // Check if any left
      const nextItem = updatedItems.find(i => i.status !== 'complete');
      if (nextItem) {
          setActiveItemId(nextItem.id);
          alert('Measurement saved! Processing next item...');
      } else {
          setStatus('complete');
      }

    } catch (error) {
      console.error(error);
      alert('Error saving measurement. Please try again.');
    }
  };

  if (status === 'complete') {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-4">
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center max-w-md w-full">
                  <div className="mx-auto w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="w-8 h-8" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Measurements Received!</h1>
                  <p className="text-zinc-400 mb-6">Your sizing data has been synced to your order.</p>
                  <button onClick={() => router.push('/')} className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transaction">
                      Back to Shop
                  </button>
              </div>
          </div>
      );
  }

  if (image) {
    return (
      <CanvasTool 
        imageUrl={image} 
        onComplete={handleComplete} 
        onBack={() => setImage(null)}
      />
    );
  }

  const copyLink = () => {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 flex items-center justify-center">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left: Mobile Handoff */}
        <div className="hidden md:flex bg-zinc-900 border border-zinc-800 rounded-3xl p-8 lg:p-12 flex-col items-center text-center h-full justify-center shadow-2xl">
            {qrCodeUrl && (
             <div className="mb-8 p-4 bg-white rounded-2xl shadow-lg">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src={qrCodeUrl} alt="Scan to Measure on Phone" className="w-48 h-48 mix-blend-multiply" />
             </div>
            )}
             <h2 className="text-2xl font-bold mb-4">Use your phone</h2>
             <p className="text-zinc-400 text-base mb-8 max-w-xs mx-auto">
                 Scan this code to open the tool on your mobile device. Photos are easier to take!
             </p>
             <div className="flex items-center gap-3 w-full max-w-xs">
                 <div className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-400 text-sm px-4 py-3 rounded-xl truncate font-mono">
                    {currentUrl || 'Loading...'}
                 </div>
                 <button onClick={copyLink} className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all hover:scale-105 active:scale-95 border border-zinc-700">
                     {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <span className="text-xs font-bold uppercase tracking-wider">Copy</span>}
                 </button>
             </div>
             <div className="mt-8 flex items-center gap-3 text-sm text-zinc-500 bg-zinc-950/50 px-4 py-2 rounded-full border border-zinc-900">
                 <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                 Waiting for device...
             </div>
        </div>

        {/* Right: Desktop Upload */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left space-y-8 py-8 md:pl-4">
            <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Measurement Tool</h1>
                {items.length > 0 && activeItemId && (
                    <div className="mb-4 inline-block bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-lg text-blue-400 font-mono text-sm">
                        Measuring: {items.find(i => i.id === activeItemId)?.name || 'Unknown Item'}
                        <span className="ml-2 opacity-50">
                             ({items.filter(i => i.status === 'complete').length + 1} / {items.length})
                        </span>
                    </div>
                )}
                <p className="text-zinc-400 text-lg max-w-md bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/30">
                    We just need one photo to calculate your perfect fit.
                </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-xl">
                 <h3 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
                    Instructions:
                 </h3>
                 <ul className="space-y-4 text-zinc-400 text-left">
                     <li className="flex items-start gap-3">
                        <span className="bg-zinc-800 text-zinc-300 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                        Lay your favorite hoodie flat on the floor.
                     </li>
                     <li className="flex items-start gap-3">
                        <span className="bg-zinc-800 text-zinc-300 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                        <span>Place a <strong className="text-white">standard credit card</strong> next to it (for scale).</span>
                     </li>
                     <li className="flex items-start gap-3">
                        <span className="bg-zinc-800 text-zinc-300 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                        Take a photo directly from above.
                     </li>
                 </ul>
            </div>

            <div className="pt-4">
                <label className="cursor-pointer group relative overflow-hidden bg-white text-black font-bold py-5 px-10 rounded-full hover:bg-zinc-200 transition-all transform hover:scale-105 inline-flex items-center gap-3 text-lg shadow-lg active:scale-95">
                    <Upload className="w-6 h-6" />
                    <span className="md:hidden">Take Photo</span>
                    <span className="hidden md:inline">Upload Photo Instead</span>
                    <input 
                        type="file" 
                        accept="image/*"
                        capture="environment"
                        className="hidden" 
                        onChange={handleImageUpload}
                    />
                </label>
            </div>
        </div>

      </div>
    </div>
  );
}
