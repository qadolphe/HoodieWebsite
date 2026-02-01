'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckCircle, Loader2, RefreshCcw } from 'lucide-react';
import { Measurements } from '@/types';

// --- GLOBAL SINGLETON TO PREVENT IOS CRASHES ---
// This prevents React Strict Mode from double-initializing the heavy WASM binary
let segmenterInstance: any = null;
let isLoadingSegmenter = false;

// --- TYPES ---
interface Point { x: number; y: number }
interface Rect { x: number; y: number; width: number; height: number }
interface SegmentBounds { top: number; bottom: number; left: number; right: number; centerX: number }

// --- UI COMPONENTS ---
function Button({ onClick, disabled, className = '', children, variant = 'default' }: any) {
  const baseStyle = "flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 touch-manipulation active:scale-95 duration-100";
  const variants: any = {
    default: "bg-zinc-800 text-white hover:bg-zinc-700 active:bg-zinc-600",
    primary: "bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700",
    secondary: "bg-zinc-100 text-black hover:bg-zinc-200 active:bg-zinc-300"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

// --- MAIN COMPONENT ---
export default function CanvasTool({ imageUrl, onComplete }: { imageUrl: string, onComplete: (data: Measurements) => void }) {
  // State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  
  const [step, setStep] = useState<'calibrate' | 'segment'>('calibrate');
  const [isModelReady, setIsModelReady] = useState(false);
  const [isSegmenting, setIsSegmenting] = useState(false);
  
  // Calibration State
  const [cardRect, setCardRect] = useState<Rect | null>(null);
  const [interactionMode, setInteractionMode] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [initialDragRect, setInitialDragRect] = useState<Rect | null>(null);

  // Segmentation State
  const [segmentBounds, setSegmentBounds] = useState<SegmentBounds | null>(null);
  const [tapPoint, setTapPoint] = useState<Point | null>(null);

  // --- 1. ROBUST MODEL INITIALIZATION ---
  useEffect(() => {
  const initModel = async () => {
    if (segmenterInstance) {
      setIsModelReady(true);
      return;
    }
    if (isLoadingSegmenter) return;

    isLoadingSegmenter = true;

    try {
    console.log("Loading MediaPipe...");
        
    // Dynamic import to avoid SSR errors
    const { InteractiveSegmenter, FilesetResolver } = await import('@mediapipe/tasks-vision');

    // CRITICAL FIX: Hardcoded version ensures JS and WASM match exactly
        const vision = await FilesetResolver.forVisionTasks(
          "/mediapipe"
        );

    segmenterInstance = await InteractiveSegmenter.createFromOptions(vision, {
      baseOptions: {
      // Using the 'Magic Touch' model which is optimized for interactions
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/interactive_segmenter/magic_touch/float32/1/magic_touch.tflite",
      delegate: "CPU" // FORCE CPU: GPU is unstable on iOS Safari/Webkit
      },
      outputCategoryMask: true,
      outputConfidenceMasks: false,
    });

    console.log("Segmenter Loaded!");
    setIsModelReady(true);
    } catch (error) {
    console.error("CRITICAL MODEL FAILURE:", error);
    alert("Failed to load AI model. Please refresh.");
    } finally {
    isLoadingSegmenter = false;
    }
  };

  initModel();
  }, []);

  // --- 2. IMAGE LOADING & SETUP ---
  useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const img = new Image();
  img.src = imageUrl;
  img.crossOrigin = "anonymous"; // Necessary for canvas manipulation
    
  img.onload = () => {
    sourceImageRef.current = img;
      
    // Calculate layout
    const aspectRatio = img.height / img.width;
    const displayWidth = window.innerWidth;
    const displayHeight = Math.floor(displayWidth * aspectRatio);

    // Set canvas dimensions
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    // Initial Card Position (Center)
    if (!cardRect) {
      const w = displayWidth * 0.4; // 40% of screen width
      const h = w / 1.586; // Credit card aspect ratio
      setCardRect({
        x: (displayWidth - w) / 2,
        y: (displayHeight - h) / 2,
        width: w,
        height: h
      });
    }
      
    // Initial Draw
    const ctx = canvas.getContext('2d');
    if(ctx) draw(ctx, canvas, img);
  };
  }, [imageUrl]);

  // --- 3. DRAW LOOP (Reacts to state changes) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = sourceImageRef.current;
    if (!canvas || !img) return;
      
    const ctx = canvas.getContext('2d');
    if (ctx) draw(ctx, canvas, img);
  }, [cardRect, step, segmentBounds, tapPoint, isSegmenting]);

  const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, img: HTMLImageElement) => {
    // Clear & Draw Base Image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw Calibration Box
    if (step === 'calibrate' && cardRect) {
      // Semi-transparent fill
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.beginPath();
      ctx.roundRect(cardRect.x, cardRect.y, cardRect.width, cardRect.height, 8);
      ctx.fill();

      // Border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Corner Handles
      ctx.fillStyle = 'white';
      const corners = [
        { x: cardRect.x, y: cardRect.y }, // TL
        { x: cardRect.x + cardRect.width, y: cardRect.y }, // TR
        { x: cardRect.x, y: cardRect.y + cardRect.height }, // BL
        { x: cardRect.x + cardRect.width, y: cardRect.y + cardRect.height } // BR
      ];
      corners.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      });
    }

    // Draw Segmentation Results
    if (step === 'segment') {
      // Draw Tap Point
      if (tapPoint) {
        ctx.beginPath();
        ctx.arc(tapPoint.x, tapPoint.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw Bounding Box
      if (segmentBounds) {
        const { top, bottom, left, right, centerX } = segmentBounds;
              
        // Dashed Box
        ctx.strokeStyle = '#22c55e'; // Green
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(left, top, right - left, bottom - top);
              
        // Solid Center Line
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(centerX, top);
        ctx.lineTo(centerX, bottom);
        ctx.strokeStyle = '#22c55e';
        ctx.stroke();
      }
    }
  };

  // --- 4. CORE LOGIC: SEGMENTATION ---
  const runSegmentation = async (p: Point) => {
    // Safety Checks
    if (!segmenterInstance || !sourceImageRef.current || !canvasRef.current) return;
      
    setTapPoint(p);
    setSegmentBounds(null);
    setIsSegmenting(true);

    try {
      const canvas = canvasRef.current;
          
      // Convert click to 0-1 normalized coordinates
      const normX = p.x / canvas.width;
      const normY = p.y / canvas.height;

      // RUN MODEL (CPU Mode)
      segmenterInstance.segment(
        sourceImageRef.current, // Pass the HTMLImageElement directly
        { keypoint: { x: normX, y: normY } },
        (result: any) => {
          if (!result.categoryMask) {
            setIsSegmenting(false);
            return;
          }
                  
          // Process Mask (Find bounds)
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
             // Scale mask coordinates back to screen space
             const scaleX = canvas.width / width;
             const scaleY = canvas.height / height;
                       
             setSegmentBounds({
               left: minX * scaleX,
               right: maxX * scaleX,
               top: minY * scaleY,
               bottom: maxY * scaleY,
               centerX: ((minX + maxX) / 2) * scaleX
             });
          }
          setIsSegmenting(false);
        }
      );
    } catch (e) {
      console.error(e);
      setIsSegmenting(false);
    }
  };

  // --- 5. INTERACTION HANDLERS (Touch/Mouse) ---
  const getPoint = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const r = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cx - r.left, y: cy - r.top };
  };

  const handleStart = (e: any) => {
    const p = getPoint(e);

    if (step === 'calibrate' && cardRect) {
      // Check for resize/drag
      const HIT_AREA = 40;
      const r = cardRect;
          
      // Simple corner detection
      if (Math.hypot(p.x - r.x, p.y - r.y) < HIT_AREA) setInteractionMode('resize-tl');
      else if (Math.hypot(p.x - (r.x+r.width), p.y - (r.y+r.height)) < HIT_AREA) setInteractionMode('resize-br');
      else if (p.x > r.x && p.x < r.x + r.width && p.y > r.y && p.y < r.y + r.height) setInteractionMode('drag');
          
      if (interactionMode) {
        setDragStart(p);
        setInitialDragRect({...r});
      }
    } else if (step === 'segment' && !isSegmenting && isModelReady) {
      runSegmentation(p);
    }
  };

  const handleMove = (e: any) => {
    if (!interactionMode || !dragStart || !initialDragRect) return;
    e.preventDefault(); // Stop scroll while dragging
      
    const p = getPoint(e);
    const dx = p.x - dragStart.x;
    const dy = p.y - dragStart.y;
    const r = {...initialDragRect};
    const ASPECT = 85.6 / 53.98;

    if (interactionMode === 'drag') {
      setCardRect({ ...r, x: r.x + dx, y: r.y + dy });
    } else if (interactionMode === 'resize-br') {
      const w = Math.max(50, r.width + dx);
      setCardRect({ ...r, width: w, height: w / ASPECT });
    } else if (interactionMode === 'resize-tl') {
      const w = Math.max(50, r.width - dx);
      setCardRect({ 
        x: (r.x + r.width) - w, 
        y: (r.y + r.height) - (w / ASPECT), 
        width: w, 
        height: w / ASPECT 
      });
    }
  };

  const handleEnd = () => {
    setInteractionMode(null);
    setDragStart(null);
  };

  // --- 6. FINAL CALCULATIONS ---
  const finish = () => {
    if (!cardRect || !segmentBounds) return;
      
    // 1. Calculate PPI (Pixels Per Inch)
    // Standard Credit Card Width = 3.375 inches
    const ppi = cardRect.width / 3.375;
      
    // 2. Calculate Height in Pixels
    const pixelHeight = segmentBounds.bottom - segmentBounds.top;
      
    // 3. Convert to Inches
    const rawInches = pixelHeight / ppi;
      
    // 4. Add "Sewing Allowance" (1.5 inches standard)
    const finalInches = rawInches + 1.5;

    onComplete({
      raw_height: rawInches.toFixed(2),
      final_cut_height: finalInches.toFixed(2),
      ppi: ppi
    });
  };

  return (
  <div className="flex flex-col h-[100dvh] bg-black">
    {/* HEADER */}
    <div className="p-4 bg-zinc-900 text-center z-10 shrink-0">
      <h2 className="text-white font-bold text-lg">
        {step === 'calibrate' ? 'Scale Calibration' : 'Tap Your Hoodie'}
      </h2>
      <p className="text-zinc-400 text-sm">
        {step === 'calibrate' ? 'Resize box to match your card' : 'Tap center of hoodie to measure'}
      </p>
    </div>

    {/* CANVAS AREA */}
    <div className="flex-1 relative overflow-hidden bg-zinc-950 flex items-center justify-center">
      {/* Loading Overlay */}
      {(isSegmenting || !isModelReady) && step === 'segment' && (
        <div className="absolute inset-0 bg-black/50 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3"/>
          <span className="text-white font-medium">
            {!isModelReady ? 'Loading AI...' : 'Measuring...'}
          </span>
        </div>
      )}
          
      <canvas 
        ref={canvasRef}
        className="max-w-full max-h-full touch-none"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />
    </div>

    {/* CONTROLS */}
    <div className="p-6 bg-zinc-900 z-10 shrink-0 grid grid-cols-2 gap-4">
      {step === 'calibrate' ? (
       <>
         <Button onClick={() => setCardRect(null)} variant="secondary">Reset Box</Button>
         <Button onClick={() => setStep('segment')} variant="primary">
           Confirm Scale <CheckCircle className="ml-2 w-4 h-4"/>
         </Button>
       </>
      ) : (
       <>
         <Button onClick={() => setSegmentBounds(null)} variant="secondary">
           <RefreshCcw className="mr-2 w-4 h-4"/> Retry
         </Button>
         <Button onClick={finish} disabled={!segmentBounds} variant="primary">
           Calculate Fit
         </Button>
       </>
      )}
    </div>
  </div>
  );
}
