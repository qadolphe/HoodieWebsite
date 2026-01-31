'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Measurements } from '@/types';
// Dynamically imported inside useEffect to avoid SSR issues
// import { InteractiveSegmenter, FilesetResolver } from '@mediapipe/tasks-vision';

interface Point { x: number; y: number }
interface Rect { x: number; y: number; width: number; height: number }
interface SegmentBounds { top: number; bottom: number; left: number; right: number; centerX: number }

// Simple Button component
function Button({ onClick, disabled, className = '', children, variant = 'default' }: { onClick: () => void, disabled?: boolean, className?: string, children: React.ReactNode, variant?: 'default' | 'primary' }) {
    const baseStyle = "flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50";
    const variants = {
        default: "bg-zinc-800 text-white hover:bg-zinc-700",
        primary: "bg-white text-black hover:bg-zinc-200"
    };
    
    return (
        <button 
            onClick={onClick} 
            disabled={disabled}
            className={`${baseStyle} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}

export default function CanvasTool({ imageUrl, onComplete }: { imageUrl: string, onComplete: (data: Measurements) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const [step, setStep] = useState<'calibrate' | 'segment'>('calibrate');
  
  // Calibration State
  const [cardRect, setCardRect] = useState<Rect | null>(null);
  const [interactionMode, setInteractionMode] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [initialDragRect, setInitialDragRect] = useState<Rect | null>(null);

  // Segmentation State
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [segmentBounds, setSegmentBounds] = useState<SegmentBounds | null>(null);
  const [tapPoint, setTapPoint] = useState<Point | null>(null);
  // Type as 'any' or generic object since we don't import the type statically
  const [segmenter, setSegmenter] = useState<any>(null);

  // Initialize MediaPipe Segmenter
  useEffect(() => {
    const loadSegmenter = async () => {
      try {
        const { InteractiveSegmenter, FilesetResolver } = await import('@mediapipe/tasks-vision');
        
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm"
        );
        const newSegmenter = await InteractiveSegmenter.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/interactive_segmenter/magic_touch/float32/1/magic_touch.tflite",
            delegate: "CPU"
          },
          outputCategoryMask: true,
          outputConfidenceMasks: false,
        });
        setSegmenter(newSegmenter);
        console.log("MediaPipe Segmenter loaded");
      } catch (error) {
        console.error("Error loading segmenter:", error);
      }
    };
    loadSegmenter();
  }, []);

  // Load Image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.src = imageUrl;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      sourceImageRef.current = img;
      const aspectRatio = img.height / img.width;
      canvas.width = window.innerWidth;
      canvas.height = Math.floor(window.innerWidth * aspectRatio);
      
      if (!cardRect) {
          const w = canvas.width * 0.4;
          const h = w / 1.586; // Credit card aspect ratio
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

  // Redraw on state changes
  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx || !cardRect) return;
      
      const img = new Image();
      img.src = imageUrl;
      img.crossOrigin = "anonymous";
      
      if (img.complete && img.naturalWidth !== 0) {
        draw(ctx, canvas, img);
      } else {
        img.onload = () => draw(ctx, canvas, img);
      }
  }, [cardRect, step, imageUrl, segmentBounds, tapPoint]);

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

          // Corner handles
          const handleSize = 6;
          ctx.fillStyle = '#fff';
          const corners = [
              { x: cardRect.x, y: cardRect.y },
              { x: cardRect.x + cardRect.width, y: cardRect.y },
              { x: cardRect.x, y: cardRect.y + cardRect.height },
              { x: cardRect.x + cardRect.width, y: cardRect.y + cardRect.height },
          ];
          
          corners.forEach(c => {
             ctx.beginPath();
             ctx.arc(c.x, c.y, handleSize, 0, 2 * Math.PI);
             ctx.fill();
             ctx.stroke();
          });
      }

      if (step === 'segment') {
          // Show tap point
          if (tapPoint) {
              ctx.beginPath();
              ctx.arc(tapPoint.x, tapPoint.y, 12, 0, 2 * Math.PI);
              ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
              ctx.fill();
              ctx.strokeStyle = '#3b82f6';
              ctx.lineWidth = 3;
              ctx.stroke();
          }

          // Show segmented bounds
          if (segmentBounds) {
              // Draw bounding box
              const { top, bottom, left, right, centerX } = segmentBounds;
              
              ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
              ctx.lineWidth = 2;
              ctx.setLineDash([5, 5]);
              ctx.strokeRect(left, top, right - left, bottom - top);
              ctx.setLineDash([]);

              // Draw measurement line (top to bottom at center)
              ctx.beginPath();
              ctx.moveTo(centerX, top);
              ctx.lineTo(centerX, bottom);
              ctx.strokeStyle = '#22c55e';
              ctx.lineWidth = 3;
              ctx.stroke();

              // Top point
              ctx.beginPath();
              ctx.arc(centerX, top, 8, 0, 2 * Math.PI);
              ctx.fillStyle = '#22c55e';
              ctx.fill();
              ctx.strokeStyle = 'white';
              ctx.lineWidth = 2;
              ctx.stroke();

              // Bottom point
              ctx.beginPath();
              ctx.arc(centerX, bottom, 8, 0, 2 * Math.PI);
              ctx.fillStyle = '#22c55e';
              ctx.fill();
              ctx.strokeStyle = 'white';
              ctx.lineWidth = 2;
              ctx.stroke();
          }
      }
  };

  // --- Interaction Logic ---

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      return {
          x: clientX - rect.left,
          y: clientY - rect.top
      };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
      const p = getCanvasPoint(e);

      if (step === 'calibrate' && cardRect) {
          const handleRadius = 30;
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
      }

      // Tap to segment in segment mode
      if (step === 'segment' && !isSegmenting) {
          runSegmentation(p);
      }
  };

  const runSegmentation = async (p: Point) => {
      const canvas = canvasRef.current;
      if (!canvas || !segmenter || !sourceImageRef.current) return;

      setTapPoint(p);
      setSegmentBounds(null);
      setIsSegmenting(true);

      try {
          // Create an ImageBitmap - this is GPU-ready and most reliable for MediaPipe
          const bitmap = await createImageBitmap(sourceImageRef.current);
          
          // Normalized coordinates (0-1)
          const normX = p.x / canvas.width;
          const normY = p.y / canvas.height;

          segmenter.segment(
              bitmap,
              { keypoint: { x: normX, y: normY } },
              (result: any) => {
                  bitmap.close(); // Clean up the bitmap
                  
                  if (!result.categoryMask) {
                      setIsSegmenting(false);
                      return;
                  }
                  
                  const { width, height, getAsUint8Array } = result.categoryMask;
                  const mask = getAsUint8Array();

                  let minX = width, maxX = 0, minY = height, maxY = 0;
                  let found = false;

                  for (let i = 0; i < mask.length; i++) {
                      if (mask[i] > 0) { 
                          found = true;
                          const x = i % width;
                          const y = Math.floor(i / width);
                          
                          if (x < minX) minX = x;
                          if (x > maxX) maxX = x;
                          if (y < minY) minY = y;
                          if (y > maxY) maxY = y;
                      }
                  }

                  if (found) {
                       // Scale bounds back to canvas size
                       const scaleX = canvas.width / width;
                       const scaleY = canvas.height / height;
                       
                       setSegmentBounds({
                           left: minX * scaleX,
                           right: maxX * scaleX,
                           top: minY * scaleY,
                           bottom: maxY * scaleY,
                           centerX: ((minX + maxX) / 2) * scaleX
                       });
                  } else {
                      alert('No object found at tap location.');
                  }
                  setIsSegmenting(false);
              }
          );
      } catch (error) {
          console.error('Segmentation error:', error);
          alert('Segmentation failed. Please try again.');
          setIsSegmenting(false);
      }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (step !== 'calibrate' || !interactionMode || !dragStart || !initialDragRect) return;
      e.preventDefault();

      const p = getCanvasPoint(e);
      const dx = p.x - dragStart.x;
      const dy = p.y - dragStart.y;
      const newRect = { ...initialDragRect };
      
      const CARD_ASPECT = 85.6 / 53.98;

      if (interactionMode === 'drag') {
          newRect.x += dx;
          newRect.y += dy;
      } else {
          let newW = initialDragRect.width;
          
          if (interactionMode === 'resize-br' || interactionMode === 'resize-tr') {
              newW = initialDragRect.width + dx;
          } else {
              newW = initialDragRect.width - dx;
          }

          if (newW < 50) newW = 50;

          newRect.width = newW;
          newRect.height = newW / CARD_ASPECT;

          if (interactionMode === 'resize-tl') {
              newRect.x = (initialDragRect.x + initialDragRect.width) - newRect.width;
              newRect.y = (initialDragRect.y + initialDragRect.height) - newRect.height;
          } else if (interactionMode === 'resize-bl') {
              newRect.x = (initialDragRect.x + initialDragRect.width) - newRect.width;
          } else if (interactionMode === 'resize-tr') {
              newRect.y = (initialDragRect.y + initialDragRect.height) - newRect.height;
          }
      }
      
      setCardRect(newRect);
  };

  const handleEnd = () => {
      setInteractionMode(null);
      setDragStart(null);
      setInitialDragRect(null);
  };

  const confirmCalibration = () => {
    setStep('segment');
  };

  const calculateResults = () => {
    if (!cardRect || !segmentBounds) return;

    const pixelsPerInch = cardRect.width / 3.375; // Credit card is 3.375" wide
    const hoodiePixelHeight = segmentBounds.bottom - segmentBounds.top;
    const realHeightInches = hoodiePixelHeight / pixelsPerInch;
    const finalCutHeight = realHeightInches + 1.5;

    onComplete({
      raw_height: realHeightInches.toFixed(2),
      final_cut_height: finalCutHeight.toFixed(2),
      ppi: pixelsPerInch
    });
  };

  const resetSegment = () => {
    setSegmentBounds(null);
    setTapPoint(null);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-black select-none">
      <div className="p-4 text-white text-center bg-zinc-900 z-10">
        <h2 className="font-bold text-lg mb-1">
          {step === 'calibrate' ? 'Calibrate Scale' : 'Tap the Hoodie'}
        </h2>
        <p className="text-sm text-zinc-400">
            {step === 'calibrate' 
                ? 'Drag corners to match the credit card.' 
                : 'Tap on the hoodie to detect its bounds.'}
        </p>
      </div>
      
      <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-black">
          {isSegmenting && (
              <div className="absolute inset-0 bg-black/60 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                  <p className="text-white font-medium">Detecting hoodie...</p>
              </div>
          )}
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
                  setCardRect(null);
              }} className="flex-1" variant="default">Reset</Button>
              <Button 
                onClick={confirmCalibration} 
                className="flex-[2]" 
                variant="primary"
               >
                Confirm Card <CheckCircle className="ml-2 w-4 h-4" />
              </Button>
           </>
        ) : (
            <>
              <Button onClick={resetSegment} className="flex-1" variant="default">
                {segmentBounds ? 'Retry' : 'Reset'}
              </Button>
              <Button 
                onClick={calculateResults} 
                disabled={!segmentBounds}
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
