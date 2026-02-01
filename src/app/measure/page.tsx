'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MeasureLandingPage() {
  const [orderId, setOrderId] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      router.push(`/measure/${orderId}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Measurement Tool</h1>
          <p className="mt-2 text-zinc-400">Enter your Order ID to begin the fitting process.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900 p-8 rounded-xl border border-zinc-800">
          <div>
            <label htmlFor="orderId" className="block text-sm font-medium text-zinc-300">
              Order ID
            </label>
            <input
              id="orderId"
              type="text"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="mt-2 block w-full rounded-md border-0 bg-zinc-950 py-3 px-4 text-white shadow-sm ring-1 ring-inset ring-zinc-700 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
              placeholder="#1234-5678"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
          >
            Start Measurement
          </button>
        </form>
      </div>
    </div>
  );
}
