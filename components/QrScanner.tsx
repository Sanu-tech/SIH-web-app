// Fix: Removed typo 'a,' from the import statement to correctly import React hooks.
import React, { useRef, useEffect, useState } from 'react';
import { XIcon, CheckCircleIcon } from './icons/Icons';

// Define jsQR for TypeScript since it's loaded from a script tag
declare var jsQR: (data: Uint8ClampedArray, width: number, height: number, options?: {
  inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth';
}) => { data: string } | null;


interface QrScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // FIX: `useRef<number>()` requires an initial value. Initialize with `null` and update the type.
  const animationFrameId = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastScannedData, setLastScannedData] = useState<string | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    if (!videoElement || !canvasElement) return;

    const canvasContext = canvasElement.getContext('2d', { willReadFrequently: true });
    if (!canvasContext) {
        setError("Could not get canvas context.");
        return;
    }
    
    let stream: MediaStream;

    const tick = () => {
      if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        setIsLoading(false);
        canvasElement.height = videoElement.videoHeight;
        canvasElement.width = videoElement.videoWidth;
        canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        
        const imageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data !== lastScannedData) {
            setLastScannedData(code.data);
            onScan(code.data);
            // Provide a cooldown period to prevent rapid rescans of the same code
            setTimeout(() => setLastScannedData(null), 2000);
        }
      }
      animationFrameId.current = requestAnimationFrame(tick);
    };

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(mediaStream => {
        stream = mediaStream;
        videoElement.srcObject = stream;
        videoElement.setAttribute("playsinline", "true"); // Required for iOS
        videoElement.play();
        animationFrameId.current = requestAnimationFrame(tick);
      })
      .catch(err => {
        console.error("Camera Error:", err);
        setError("Camera access was denied. Please enable camera permissions in your browser settings.");
        setIsLoading(false);
      });

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScan, lastScannedData]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square bg-black rounded-lg overflow-hidden">
      <video ref={videoRef} playsInline className="w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Visual Reticle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`w-3/4 h-3/4 border-4 rounded-lg shadow-lg transition-colors duration-300 ${lastScannedData ? 'border-success' : 'border-white/50'}`}></div>
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4">
          <p className="text-white text-center font-semibold">Initializing Camera...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center">
          <p className="text-danger font-semibold mb-2">Camera Error</p>
          <p className="text-white text-sm">{error}</p>
        </div>
      )}

      {lastScannedData && (
        <div className="absolute inset-0 bg-success/80 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-fade-in" aria-live="polite">
          <CheckCircleIcon className="w-20 h-20" />
          <p className="mt-4 text-2xl font-bold">Scanned!</p>
        </div>
      )}

      <button onClick={onClose} className="absolute top-2 right-2 p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors z-10">
        <XIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default QrScanner;