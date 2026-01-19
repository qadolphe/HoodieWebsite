'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface Point { x: number; y: number }
interface Rect { x: number; y: number; width: number; height: number }

// Simple Button component
function Button({ onClick, className = '', children, variant = 'default' }: { onClick: () => void, className?: string, children: React.ReactNode, variant?: 'default' | 'primary' }) {
    const baseStyle = "flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors";
    const variants = {
        default: "bg-zinc-800 text-white hover:bg-zinc-700",
        primary: "bg-white text-black hover:bg-zinc-200"
    };
    
    return (
        <button 
            onClick={onClick} 
            className={`${baseStyle} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}

export default function CanvasTool({ imageUrl, onComplete }: { imageUrl: string, onComplete: (data: any) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState<'calibrate' | 'measure'>('calibrate');
  
  // Calibration State
  const [cardRect, setCardRect] = useState<Rect | null>(null);
  const [interactionMode, setInteractionMode] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [initialDragRect, setInitialDragRect] = useState<Rect | null>(null);

  // Measure State
  const [measurePoints, setMeasurePoints] = useState<Point[]>([]);

  // 1. Load Image & Init Rect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.src = imageUrl;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const aspectRatio = img.height / img.width;
      canvas.width = window.innerWidth;
      canvas.height = window.innerWidth * aspectRatio;
      
      // Initialize Card Rect in center if not set
      if (!cardRect) {
          const w = canvas.width * 0.4;
          const h = w / 1.586; // Credit card aspect ratio 85.6mm / 53.98mm ~= 1.586
          setCardRect({
              x: (canvas.width - w) / 2,
              y: (canvas.height - h) / 2,
              width: w,
              height: h
          });
      }
      
      draw(ctx, canvas, img);
    };
  }, [imageUrl]);

  // Redraw
  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx || !cardRect) return; // Wait for init
      
      const img = new Image();
      img.src = imageUrl;
      img.crossOrigin = "anonymous";
      
      // We need to redraw, check if cached or reload
      if (img.complete && img.naturalWidth !== 0) {
        draw(ctx, canvas, img);
      } else {
        img.onload = () => draw(ctx, canvas, img);
      }
  }, [cardRect, measurePoints, step, imageUrl]);

  const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, img: HTMLImageElement) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (step === 'calibrate' && cardRect) {
          // Semi-transparent fill
          ctx.beginPath();
          ctx.roundRect(cardRect.x, cardRect.y, cardRect.width, cardRect.height, 10);
          ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
          ctx.fill();

          // Border
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Handles circles
          const handleSize = 6;
          ctx.fillStyle = '#fff';
          const corners = [
              { x: cardRect.x, y: cardRect.y }, // TL
              { x: cardRect.x + cardRect.width, y: cardRect.y }, // TR
              { x: cardRect.x, y: cardRect.y + cardRect.height }, // BL
              { x: cardRect.x + cardRect.width, y: cardRect.y + cardRect.height }, // BR
          ];
          
          corners.forEach(c => {
             ctx.beginPath();
             ctx.arc(c.x, c.y, handleSize, 0, 2 * Math.PI);
             ctx.fill();
             ctx.stroke();
          });
      }

      if (step === 'measure') {
          measurePoints.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = '#22c55e';
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
          });

          if (measurePoints.length >= 2) {
              ctx.beginPath();
              ctx.moveTo(measurePoints[0].x, measurePoints[0].y);
              ctx.lineTo(measurePoints[1].x, measurePoints[1].y);
              ctx.strokeStyle = '#22c55e';
              ctx.lineWidth = 3;
              ctx.stroke();
          }
      }
  };

  // --- Interaction Logic ---

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent | TouchEvent | MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      return {
          x: clientX - rect.left,
          y: clientY - rect.top
      };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
      // Don't prevent default immediately for touch unless necessary, but here likely yes
      // e.preventDefault(); 
      const p = getCanvasPoint(e);

      if (step === 'calibrate' && cardRect) {
          const handleRadius = 30; // Hit area larger than visual
          const isNear = (x1: number, y1: number, x2: number, y2: number) => Math.hypot(x1-x2, y1-y2) < handleRadius;

          let mode = null;
          if (isNear(p.x, p.y, cardRect.x, cardRect.y)) mode = 'resize-tl';
          else if (isNear(p.x, p.y, cardRect.x + cardRect.width, cardRect.y)) mode = 'resize-tr';
          else if (isNear(p.x, p.y, cardRect.x, cardRect.y + cardRect.height)) mode = 'resize-bl';
          else if (isNear(p.x, p.y, cardRect.x + cardRect.width, cardRect.y + cardRect.height)) mode = 'resize-br';
          else if (p.x > cardRect.x && p.x < cardRect.x + cardRect.width && p.y > cardRect.y && p.y < cardRect.y + cardRect.height) {
              mode = 'drag';
          }
          
          setInteractionMode(mode);

          if (mode) {
              setDragStart(p);
              setInitialDragRect({ ...cardRect });
          }
      } else if (step === 'measure' && measurePoints.length < 2) {
          setMeasurePoints([...measurePoints, p]);
      }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (step !== 'calibrate' || !interactionMode || !dragStart || !initialDragRect) return;
      e.preventDefault(); // Only prevent scroll when dragging

      const p = getCanvasPoint(e);
      const dx = p.x - dragStart.x;
      const dy = p.y - dragStart.y;
      const newRect = { ...initialDragRect };

      if (interactionMode === 'drag') {
          newRect.x += dx;
          newRect.y += dy;
      } else if (interactionMode === 'resize-br') {
          newRect.width += dx;
          newRect.height += dy;
      } else if (interactionMode === 'resize-bl') {
          newRect.x += dx;
          newRect.width -= dx;
          newRect.height += dy;
      } else if (interactionMode === 'resize-tr') {
          newRect.y += dy;
          newRect.width += dx;
          newRect.height -= dy;
      } else if (interactionMode === 'resize-tl') {
          newRect.x += dx;
          newRect.y += dy;
          newRect.width -= dx;
          newRect.height -= dy;
      }
      
      if (newRect.width < 50) newRect.width = 50;
      if (newRect.height < 30) newRect.height = 30;

      setCardRect(newRect);
  };

  const handleEnd = () => {
      setInteractionMode(null);
      setDragStart(null);
      setInitialDragRect(null);
  };


  // 3. The Math
  const calculateResults = () => {
    if (!cardRect || measurePoints.length < 2) return;

    // Use the rect width as reference
    const refPixelWidth = cardRect.width; 
    const pixelsPerInch = refPixelWidth / 3.375; 

    const hoodPixelHeight = Math.hypot(measurePoints[1].x - measurePoints[0].x, measurePoints[1].y - measurePoints[0].y);
    const realHeightInches = hoodPixelHeight / pixelsPerInch;
    const finalCutHeight = realHeightInches + 1.5;

    onComplete({
      raw_height: realHeightInches.toFixed(2),
      final_cut_height: finalCutHeight.toFixed(2),
      ppi: pixelsPerInch
    });
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-black select-none">
      <div className="p-4 text-white text-center bg-zinc-900 z-10">
        <h2 className="font-bold text-lg mb-1">{step === 'calibrate' ? 'Calibrate Scale' : 'Measure Hoodie'}</h2>
        <p className="text-sm text-zinc-400">
            {step === 'calibrate' 
                ? 'Drag corners to match the credit card.' 
                : 'Tap the Top of hood & Bottom hem.'}
        </p>
      </div>
      
      <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-black">
          <canvas 
            ref={canvasRef} 
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            className="touch-none max-w-full cursor-crosshair"
            style={{ maxHeight: 'calc(100vh - 150px)' }} 
          />
      </div>

      <div className="p-6 bg-zinc-900 w-full z-10 flex gap-4">
        {step === 'calibrate' ? (
           <>
              <Button onClick={() => {
                  setInteractionMode(null);
                  setCardRect(null); // Reset to center
                  // Force re-init in useEffect
              }} className="flex-1" variant="default">Reset</Button>
              <Button 
                onClick={() => setStep('measure')} 
                className="flex-[2]" 
                variant="primary"
               >
                Confirm Card <CheckCircle className="ml-2 w-4 h-4" />
              </Button>
           </>
        ) : (
            <>
              <Button onClick={() => setMeasurePoints([])} className="flex-1" variant="default">Clear</Button>
              <Button 
                onClick={calculateResults} 
                className="flex-[2]" 
                variant="primary"
              >
                Calculate Fit
              </Button>
            </>
        )}
      </div>
    </div>
  );
}
