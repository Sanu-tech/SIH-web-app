// /components/CameraCapture.tsx

import React, { useState, useEffect, useRef } from 'react';
import { CameraIcon, RefreshIcon, ZoomInIcon, ZoomOutIcon, FlashOnIcon, FlashOffIcon, GridIcon, XIcon } from './icons/Icons';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [capabilities, setCapabilities] = useState<MediaTrackCapabilities | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Camera control states
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        activeStream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          const track = mediaStream.getVideoTracks()[0];
          setStream(mediaStream);
          setVideoTrack(track);
          const caps = track.getCapabilities();
          setCapabilities(caps);
          // Set initial zoom based on capabilities
          // FIX: Property 'zoom' does not exist on type 'MediaTrackCapabilities'. Cast to any to access it.
          if ((caps as any).zoom) {
            // FIX: Property 'zoom' does not exist on type 'MediaTrackCapabilities'. Cast to any to access its properties.
            setZoom((caps as any).zoom.min || 1);
          }
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access the camera. Please check permissions and try again.");
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
      setVideoTrack(null);
    };
  }, []);

  useEffect(() => {
    // FIX: Property 'zoom' does not exist on type 'MediaTrackCapabilities'. Cast to any to access it.
    if (videoTrack && (capabilities as any)?.zoom) {
      // FIX: 'zoom' does not exist in type 'MediaTrackConstraintSet'. Cast to any.
      videoTrack.applyConstraints({ advanced: [{ zoom: zoom }] } as any);
    }
  }, [zoom, videoTrack, capabilities]);

  useEffect(() => {
    // FIX: Property 'torch' does not exist on type 'MediaTrackCapabilities'. Cast to any to access it.
    if (videoTrack && (capabilities as any)?.torch) {
      // FIX: 'torch' does not exist in type 'MediaTrackConstraintSet'. Cast to any.
      videoTrack.applyConstraints({ advanced: [{ torch: flashOn }] } as any);
    }
  }, [flashOn, videoTrack, capabilities]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
    }
  };

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center p-4 bg-red-500/10 text-red-500 rounded-lg">
            <p className="font-semibold">Camera Error</p>
            <p className="text-sm text-center">{error}</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-btn text-sm">Close</button>
        </div>
    );
  }

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-auto"
        onClick={(e) => { // Basic tap-to-focus hint
          const target = e.target as HTMLVideoElement;
          target.style.filter = 'brightness(1.1)';
          setTimeout(() => { target.style.filter = 'brightness(1)'; }, 150);
        }}
      ></video>

      {showGrid && (
        <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
          <div className="col-span-1 row-span-1 border-r border-b border-white/30"></div>
          <div className="col-span-1 row-span-1 border-r border-b border-white/30"></div>
          <div className="col-span-1 row-span-1 border-b border-white/30"></div>
          <div className="col-span-1 row-span-1 border-r border-b border-white/30"></div>
          <div className="col-span-1 row-span-1 border-r border-b border-white/30"></div>
          <div className="col-span-1 row-span-1 border-b border-white/30"></div>
          <div className="col-span-1 row-span-1 border-r border-white/30"></div>
          <div className="col-span-1 row-span-1 border-r border-white/30"></div>
        </div>
      )}

      {/* Close button */}
      <button onClick={onClose} className="absolute top-2 left-2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm z-10 hover:bg-black/60 transition-colors" aria-label="Close camera">
        <XIcon className="w-6 h-6"/>
      </button>

      {/* Capture Button */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <button onClick={handleCapture} className="w-16 h-16 rounded-full bg-white/30 border-4 border-white flex items-center justify-center backdrop-blur-sm hover:bg-white/50 transition-colors" aria-label="Capture photo">
              <CameraIcon className="w-8 h-8 text-white"/>
          </button>
      </div>

      {/* Controls */}
      <div className="absolute top-2 right-2 flex flex-col space-y-2 z-10">
        {/* FIX: Property 'torch' does not exist on type 'MediaTrackCapabilities'. Cast to any to access it. */}
        {(capabilities as any)?.torch && (
            <button onClick={() => setFlashOn(!flashOn)} className="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm" aria-label="Toggle flash">
                {flashOn ? <FlashOnIcon /> : <FlashOffIcon />}
            </button>
        )}
        <button onClick={() => setShowGrid(!showGrid)} className={`w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm ${showGrid ? 'bg-primary/50' : ''}`} aria-label="Toggle grid">
            <GridIcon />
        </button>
      </div>

      {/* FIX: Property 'zoom' does not exist on type 'MediaTrackCapabilities'. Cast to any to access it. */}
      {(capabilities as any)?.zoom && (
        <div className="absolute bottom-4 right-4 w-28 p-2 bg-black/40 rounded-full backdrop-blur-sm flex items-center space-x-2 z-10">
            <ZoomOutIcon className="w-5 h-5 text-white flex-shrink-0"/>
            <input
                type="range"
                // FIX: Property 'zoom' does not exist on type 'MediaTrackCapabilities'. Cast to any to access its properties.
                min={(capabilities as any).zoom.min}
                // FIX: Property 'zoom' does not exist on type 'MediaTrackCapabilities'. Cast to any to access its properties.
                max={(capabilities as any).zoom.max}
                // FIX: Property 'zoom' does not exist on type 'MediaTrackCapabilities'. Cast to any to access its properties.
                step={(capabilities as any).zoom.step}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/30 rounded-full appearance-none slider-thumb"
                aria-label="Zoom"
            />
            <ZoomInIcon className="w-5 h-5 text-white flex-shrink-0"/>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default CameraCapture;
