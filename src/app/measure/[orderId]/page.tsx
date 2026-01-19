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
  const [copied, setCopied] = useState(false);

  // Poll for status changes (Cross-device sync)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkStatus = async () => {
        try {
            const res = await fetch(`/api/measure/status?orderId=${orderId}`);
            const data = await res.json();
            if (data.success && data.completed) {
                setStatus('complete');
                clearInterval(intervalId);
            }
        } catch (e) {
            console.error("Polling error", e);
        }
    };

    checkStatus();
    intervalId = setInterval(checkStatus, 3000);

    return () => clearInterval(intervalId);
  }, [orderId]);


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
      const res = await fetch('/api/measure/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, measurements }),
      });

      if (!res.ok) throw new Error('Failed to save');
      
      setStatus('complete');
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
      />
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`;

  const copyLink = () => {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        
        {/* Left: Mobile Handoff */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col items-center text-center h-full justify-center">
             <div className="mb-6 p-4 bg-white rounded-xl">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src={qrCodeUrl} alt="Scan to Measure on Phone" className="w-40 h-40 mix-blend-multiply" />
             </div>
             <h2 className="text-xl font-bold mb-2">Use your phone</h2>
             <p className="text-zinc-400 text-sm mb-6">
                 Scan this code to open the tool on your mobile device. Photos are easier to take!
             </p>
             <div className="flex items-center gap-2 w-full">
                 <input readOnly value={currentUrl} className="bg-zinc-950 border border-zinc-700 text-zinc-400 text-xs p-3 rounded-lg flex-1 truncate" />
                 <button onClick={copyLink} className="p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition">
                     {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <span className="text-xs font-bold">Copy</span>}
                 </button>
             </div>
             <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 Waiting for device...
             </div>
        </div>

        {/* Right: Desktop Upload */}
        <div className="flex flex-col items-center text-center space-y-8 py-8">
            <div>
                <h1 className="text-3xl font-bold mb-4">Measurement Tool</h1>
                <p className="text-zinc-400 max-w-xs mx-auto">
                    We just need one photo to calculate your perfect fit.
                </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-xl text-left text-sm space-y-3 max-w-sm w-full mx-auto">
                 <h3 className="font-semibold text-white">Instructions:</h3>
                 <ul className="space-y-2 text-zinc-400 list-disc list-inside">
                     <li>Lay your favorite hoodie flat on the floor.</li>
                     <li>Place a <strong>standard credit card</strong> next to it (for scale).</li>
                     <li>Take a photo directly from above.</li>
                 </ul>
            </div>

            <label className="cursor-pointer group relative overflow-hidden bg-white text-black font-bold py-4 px-8 rounded-full hover:bg-zinc-200 transition-all transform hover:scale-105 inline-flex items-center gap-3">
                <Upload className="w-5 h-5" />
                Upload Photo instead
                <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                />
            </label>
        </div>

      </div>
    </div>
  );
}
