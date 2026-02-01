'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckCircle, Loader2, Trash2, ArrowLeft } from 'lucide-react';
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
    secondary: "bg-zinc-100 text-black hover:bg-zinc-200 active:bg-zinc-300",
    destructive: "bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

// --- MAIN COMPONENT ---
export default function CanvasTool({ imageUrl, onComplete, onBack }: { 
  imageUrl: string, 
  onComplete: (data: Measurements) => void,
  onBack: () => void
}) {
  // State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  
  const [step, setStep] = useState<'calibrate' | 'segment' | 'confirm'>('calibrate');
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
  const [maskOverlay, setMaskOverlay] = useState<ImageBitmap | null>(null);

  // Measurements
  const [calcHeight, setCalcHeight] = useState<{ raw: string, final: string, size: string } | null>(null);

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
  }, [cardRect, step, segmentBounds, tapPoint, isSegmenting, maskOverlay]);

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
      
      // Draw Mask Overlay (Purple tint)
      if (maskOverlay) {
        ctx.globalAlpha = 0.6; 
        ctx.drawImage(maskOverlay, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
      }

      // Draw Tap Point
      if (tapPoint) {
        ctx.beginPath();
        ctx.arc(tapPoint.x, tapPoint.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#9333ea'; // Purple
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  };

  // --- 4. CORE LOGIC: SEGMENTATION ---
  const runSegmentation = async (p: Point) => {
    // Safety Checks
    if (!segmenterInstance || !sourceImageRef.current || !canvasRef.current) {
        console.error("Missing instances:", { segmenter: !!segmenterInstance, image: !!sourceImageRef.current, canvas: !!canvasRef.current });
        return;
    }
      
    setTapPoint(p);
    setSegmentBounds(null);
    setIsSegmenting(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
         console.error("Failed to get 2D context");
         return;
      }

      // 1. debug check: ensure canvas is not empty
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Convert click to 0-1 normalized coordinates
      const normX = p.x / canvas.width;
      const normY = p.y / canvas.height;

      // RUN MODEL (CPU Mode)
      // Use ImageData to ensure we are passing exactly what we have in memory
      segmenterInstance.segment(
        imageData, 
        { keypoint: { x: normX, y: normY } },
        (result: any) => {
          if (!result.categoryMask) {
            console.warn("No category mask in result");
            alert("AI returned no mask. Try another spot.");
            setIsSegmenting(false);
            return;
          }
                  
          // Process Mask (Find bounds)
          // Fix: Call methods directly on the object to preserve 'this' context
          const width = result.categoryMask.width;
          const height = result.categoryMask.height;
          const mask = result.categoryMask.getAsUint8Array();

          // GENERATE MASK OVERLAY
          const maskImgData = new ImageData(new Uint8ClampedArray(width * height * 4), width, height);
          for(let i=0; i<mask.length; i++) {
             // Logic inverted: if mask[i] == 0 (typically background if previous logic was 'filled background'),
             // or check standard behavior.
             // USER REQUEST: Selected area (object) = Purple, Background = Clear.
             // Previous successful detailed log showed typical distribution: 0: 95, 255: 906.
             // That means mostly 255. If user saw purple background, then 255 was purple.
             // So 255 = background. Thus 0 = Object.
             // So we paint Purple if val == 0.
             
             if(mask[i] === 0) { // Object (based on user observation)
                 const p = i * 4;
                 maskImgData.data[p] = 147;   // R (Purple-600)
                 maskImgData.data[p+1] = 51;  // G
                 maskImgData.data[p+2] = 234; // B
                 maskImgData.data[p+3] = 180; // A (Mostly opaque)
             }
          }
          createImageBitmap(maskImgData).then(bmp => setMaskOverlay(bmp));

          let minX = width, maxX = 0, minY = height, maxY = 0;
          
          // Re-scan for bounds using the 'Object' value (0 in this hypothesis)
          for (let i = 0; i < mask.length; i++) {
            if (mask[i] === 0) { 
              const x = i % width;
              const y = Math.floor(i / width);
                          
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }

          // If no object pixels found (minX still width), safety fallback or alert
          // BUT: The mask might be inverted depending on click. 
          // If we find practically 0 pixels doing it this way, we might need to flip logic.
          // Let's assume the user observation is truth.
          const found = minX < width;

          if (found) {
             // Scale mask coordinates back to screen space
             const scaleX = canvas.width / width;
             const scaleY = canvas.height / height;
             
             const bounds = {
               left: minX * scaleX,
               right: maxX * scaleX,
               top: minY * scaleY,
               bottom: maxY * scaleY,
               centerX: ((minX + maxX) / 2) * scaleX
             };

             setSegmentBounds(bounds);
          } else {
             alert('No object found. Please try tapping firmly on the hoodie.');
          }
          setIsSegmenting(false);
        }
      );
    } catch (e) {
      console.error("Segmentation Error:", e);
      setIsSegmenting(false);
      alert("Error running segmentation.");
    }
  };

  // --- 5. INTERACTION HANDLERS (Touch/Mouse) ---
  const getPoint = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const r = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Scale visual coordinates to internal canvas coordinates
    const scaleX = canvas.width / r.width;
    const scaleY = canvas.height / r.height;

    return { 
      x: (cx - r.left) * scaleX, 
      y: (cy - r.top) * scaleY 
    };
  };

  const handleStart = (e: any) => {
    const p = getPoint(e);

    if (step === 'calibrate' && cardRect) {
      // Check for resize/drag
      const HIT_AREA = 40;
      const r = cardRect;
      
      let mode = null;
          
      // Simple corner detection
      if (Math.hypot(p.x - r.x, p.y - r.y) < HIT_AREA) mode = 'resize-tl';
      else if (Math.hypot(p.x - (r.x+r.width), p.y - (r.y+r.height)) < HIT_AREA) mode = 'resize-br';
      else if (p.x > r.x && p.x < r.x + r.width && p.y > r.y && p.y < r.y + r.height) mode = 'drag';
          
      if (mode) {
        setInteractionMode(mode);
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

  // --- 6. FINAL CALCULATIONS & SIZING ---
  const calculateSize = () => {
    if (!cardRect || !segmentBounds) return;
      
    // 1. Calculate PPI (Pixels Per Inch)
    const ppi = cardRect.width / 3.375;
      
    // 2. Calculate Height in Pixels
    const pixelHeight = segmentBounds.bottom - segmentBounds.top;
      
    // 3. Convert to Inches & Add allowance
    const rawInches = pixelHeight / ppi;
    const finalInches = rawInches + 1.5;

    // 4. Map to Size
    // Rough heuristic for hoodie height (shoulder to bottom hem)
    // S: 25-26", M: 26-27", L: 27-28", XL: 28-29", XXL: 29+
    let size = 'M';
    if (finalInches < 25) size = 'XS';
    else if (finalInches < 26) size = 'S';
    else if (finalInches < 27) size = 'M';
    else if (finalInches < 28) size = 'L';
    else if (finalInches < 29) size = 'XL';
    else size = '2XL (+30")';

    setCalcHeight({
        raw: rawInches.toFixed(2),
        final: finalInches.toFixed(2),
        size: size
    });
    setStep('confirm');
  };

  const submitMeasurement = () => {
      if(!calcHeight) return;
      onComplete({
        raw_height: calcHeight.raw,
        final_cut_height: calcHeight.final,
        ppi: cardRect!.width / 3.375
      });
  };

  const handleBack = () => {
    if (step === 'segment' || step === 'confirm') {
      setStep('calibrate');
      setSegmentBounds(null);
      setMaskOverlay(null);
      setTapPoint(null);
    } else {
      onBack();
    }
  };

  return (
  <div className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden h-[100dvh]">
    {/* HEADER */}
    <div className="relative p-4 bg-zinc-900 border-b border-zinc-800 z-20 shrink-0">
      <button 
        onClick={handleBack}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-white transition-colors z-30"
        aria-label="Go back"
      >
        <ArrowLeft className="w-6 h-6"/>
      </button>

      <div className="text-center">
        <h2 className="text-white font-bold text-lg">
          {step === 'calibrate' ? 'Scale Calibration' : step === 'confirm' ? 'Confirm Size' : 'Tap Your Hoodie'}
        </h2>
        <p className="text-zinc-400 text-sm">
          {step === 'calibrate' ? 'Resize box to match your card' : step === 'confirm' ? 'Does this look right?' : 'Tap center of hoodie to measure'}
        </p>
      </div>
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

      {/* CONFIRM OVERLAY */}
      {step === 'confirm' && calcHeight && (
          <div className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center p-6">
              <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-sm border border-zinc-800">
                  <h3 className="text-xl font-bold text-white mb-6 text-center">Measurement Result</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-zinc-800 p-4 rounded-lg text-center">
                          <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-1">Measured Height</label>
                          <div className="text-2xl font-mono text-white">{calcHeight.raw}"</div>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-lg text-center border border-blue-500/30">
                          <label className="block text-blue-400 text-xs uppercase tracking-wider mb-1">Estimated Size</label>
                          <div className="text-2xl font-bold text-blue-500">{calcHeight.size}</div>
                      </div>
                  </div>

                  <p className="text-zinc-400 text-sm text-center mb-6">
                       We calculated this size based on the purple area. 
                  </p>

                  <div className="space-y-3">
                      <Button onClick={submitMeasurement} variant="primary" className="w-full">
                          Confirm & Save
                      </Button>
                      <Button onClick={() => setStep('segment')} variant="secondary" className="w-full">
                          Retake Measurement
                      </Button>
                  </div>
              </div>
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
    { step !== 'confirm' && (
    <div className="p-6 bg-zinc-900 z-10 shrink-0 grid grid-cols-2 gap-4 border-t border-zinc-800">
      {step === 'calibrate' ? (
       <>
         <Button onClick={() => setCardRect(null)} variant="secondary">Reset Box</Button>
         <Button onClick={() => setStep('segment')} variant="primary">
           Confirm Scale <CheckCircle className="ml-2 w-4 h-4"/>
         </Button>
       </>
      ) : (
       <>
         <Button onClick={() => {
            setSegmentBounds(null);
            setMaskOverlay(null);
            setTapPoint(null);
         }} variant="secondary">
           <Trash2 className="mr-2 w-4 h-4"/> Clear
         </Button>
         <Button onClick={calculateSize} disabled={!segmentBounds} variant="primary">
           Calculate Fit
         </Button>
       </>
      )}
    </div>
    )}
  </div>
  );
}
