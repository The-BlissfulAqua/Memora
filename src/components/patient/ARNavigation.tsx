import React, { useState, useEffect, useRef } from 'react';

interface ARNavigationProps {
  onBack: () => void;
}

type NavState = 'SELECTION' | 'BLUEPRINT' | 'NAVIGATING';

const destinations = ['Kitchen', 'Bathroom', 'Bedroom', 'Living Room'];

// Simple house layout with coordinates and target compass headings for AR
// Headings: 0=North, 90=East, 180=South, 270=West
const roomLayout: { [key: string]: { x: number; y: number; heading: number } } = {
    'Living Room': { x: 77.5, y: 85, heading: 296 }, // Target is NW
    'Bedroom': { x: 222.5, y: 85, heading: 10 },    
    'Kitchen': { x: 77.5, y: 315, heading: 170 },   
    'Bathroom': { x: 222.5, y: 315, heading: 190 }, 
};

const startPoint = roomLayout['Living Room'];

const ARNavigation: React.FC<ARNavigationProps> = ({ onBack }) => {
  const [navState, setNavState] = useState<NavState>('SELECTION');
  const [destination, setDestination] = useState<string | null>(null);

  // State for AR view
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [arError, setArError] = useState<string | null>(null);
  const [steps, setSteps] = useState(10);
  
  // Refs for reliable step detection
  const stepPhase = useRef<'UP' | 'DOWN'>('DOWN');
  const lastStepTimestamp = useRef(0);


  // Effect for setting up and tearing down AR features (camera, compass, motion)
  useEffect(() => {
    if (navState !== 'NAVIGATING') {
      return;
    }

    let isMounted = true;

    // Compass Listener
    const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null && isMounted) {
            setHeading(event.alpha);
        }
    };
    window.addEventListener('deviceorientation', handleOrientation);
    
    // Reliable Step Detection Listener
    const handleMotion = (event: DeviceMotionEvent) => {
        if (!event.acceleration || !isMounted) return;

        const now = Date.now();
        // Cooldown of 400ms to prevent detecting a single step multiple times
        if (now - lastStepTimestamp.current < 400) return;

        const z = event.acceleration.z ?? 0;
        const HIGH_THRESHOLD = 11.5; // m/s^2 - high point of a step
        const LOW_THRESHOLD = 8.0;   // m/s^2 - low point of a step

        // This simple state machine detects the "up then down" pattern of a step
        if (stepPhase.current === 'DOWN' && z > HIGH_THRESHOLD) {
            stepPhase.current = 'UP';
        } else if (stepPhase.current === 'UP' && z < LOW_THRESHOLD) {
            stepPhase.current = 'DOWN';
            lastStepTimestamp.current = now;
            setSteps(prev => (prev > 0 ? prev - 1 : 0));
        }
    };
    window.addEventListener('devicemotion', handleMotion);

    // Cleanup function
    return () => {
        isMounted = false;
        window.removeEventListener('deviceorientation', handleOrientation);
        window.removeEventListener('devicemotion', handleMotion);
        
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };
  }, [navState]);
  
  const handleStartARClick = async () => {
    setArError(null);
    try {
        // Request motion sensor permissions (required on iOS 13+)
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            const permission = await (DeviceOrientationEvent as any).requestPermission();
            if (permission !== 'granted') {
                throw new Error("Access to motion sensors was denied.");
            }
        }

        // Request camera and start stream
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // This is crucial to ensure the video plays on all devices
            await videoRef.current.play();
        }
        
        setSteps(10); // Reset steps for new journey
        stepPhase.current = 'DOWN';
        lastStepTimestamp.current = 0;
        setNavState('NAVIGATING');

    } catch (err: any) {
        console.error("Error starting AR:", err);
        let message = "Could not start AR. Please check permissions in your settings.";
        if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
            message = "Permission denied. Please allow camera and motion sensor access.";
        } else if (err.message) {
            message = err.message;
        }
        setArError(message);
    }
  };

  const handleBack = () => {
    setSteps(10);
    setHeading(null);
    setArError(null);
    if (navState === 'NAVIGATING') {
        setNavState('BLUEPRINT');
    } else if (navState === 'BLUEPRINT') {
        setNavState('SELECTION');
        setDestination(null);
    } else {
        onBack();
    }
  }

  // --- RENDER LOGIC ---

  if (navState === 'SELECTION') {
    return (
      <div className="relative p-4 sm:p-6 bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl h-[95vh] flex flex-col">
       <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-slate-700"></div>
       <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-slate-700"></div>

        <header className="flex items-center mb-6 border-b border-slate-700/50 pb-4">
            <button onClick={onBack} className="text-slate-400 text-sm p-2 rounded-full hover:bg-slate-800/50 transition-colors mr-2 flex items-center gap-1">
                <span className='text-lg'>&larr;</span> Back
            </button>
            <h2 className="text-2xl font-bold text-white">Where to?</h2>
        </header>
        <div className="flex-grow flex flex-col space-y-3">
          {destinations.map(d => (
            <button
              key={d}
              onClick={() => { setDestination(d); setNavState('BLUEPRINT'); }}
              className="flex items-center w-full p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/90 transition-colors duration-200 border border-transparent hover:border-slate-700"
            >
                <span className="text-xl font-semibold text-gray-200">{d}</span>
                <span className="ml-auto text-gray-500">&rarr;</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (navState === 'BLUEPRINT') {
    // The blueprint view remains the same.
    const endPoint = destination ? roomLayout[destination] : startPoint;
    const angleRad = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
    const angleDeg = -90 - (angleRad * 180 / Math.PI);
    const snappedAngleDeg = Math.round(angleDeg / 90) * 90;
    const MAP_WIDTH = 300; const MAP_HEIGHT = 400;
    const rotationRad = (snappedAngleDeg * Math.PI) / 180;
    const newBoundingBoxWidth = MAP_WIDTH * Math.abs(Math.cos(rotationRad)) + MAP_HEIGHT * Math.abs(Math.sin(rotationRad));
    const newBoundingBoxHeight = MAP_WIDTH * Math.abs(Math.sin(rotationRad)) + MAP_HEIGHT * Math.abs(Math.cos(rotationRad));
    const scale = Math.min(MAP_WIDTH / newBoundingBoxWidth, MAP_HEIGHT / newBoundingBoxHeight);
    const finalScale = scale * 0.95;
    const svgTransform = `translate(150 200) rotate(${-snappedAngleDeg}) scale(${finalScale}) translate(-150 -200)`;
    const endAngleDeg = angleRad * 180 / Math.PI;

    return (
      <div className="relative p-4 sm:p-6 bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl h-[95vh] flex flex-col">
        <header className="flex items-center mb-6 border-b border-slate-700/50 pb-4">
            <button onClick={handleBack} className="text-slate-400 text-sm p-2 rounded-full hover:bg-slate-800/50 transition-colors mr-2 flex items-center gap-1">
                <span className='text-lg'>&larr;</span> Back
            </button>
            <h2 className="text-2xl font-bold text-white">Map to {destination}</h2>
        </header>
        <main className="flex-grow flex flex-col items-center justify-center overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 300 400" className="max-w-full max-h-[60vh]">
                <g transform={svgTransform} style={{ transition: 'transform 0.7s ease-in-out' }}>
                    <rect width="300" height="400" fill="#1E293B" />
                    {Object.entries(roomLayout).map(([name, {x, y}]) => {
                        const width = 135, height = 150, rectX = x - width/2, rectY = y - height/2;
                        return (<g key={name}>
                            <rect x={rectX} y={rectY} width={width} height={height} fill={name === destination ? "rgba(59, 130, 246, 0.2)" : "none"} stroke={name === destination ? "#3B82F6" : "#475569"} strokeWidth="2" />
                            <text x={x} y={y} textAnchor="middle" fill="#94A3B8" fontSize="16" transform={`rotate(${snappedAngleDeg} ${x} ${y})`}>{name}</text>
                        </g>)
                    })}
                    <path d={`M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`} fill="none" stroke="#34D399" strokeWidth="4" strokeDasharray="8 4">
                        <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />
                    </path>
                    <polygon points="-12,-6 0,0 -12,6" fill="#34D399" transform={`translate(${endPoint.x}, ${endPoint.y}) rotate(${endAngleDeg})`} />
                    <circle cx={startPoint.x} cy={startPoint.y} r="8" fill="#10B981" />
                    <text x={startPoint.x} y={startPoint.y} textAnchor="middle" dy="4" fill="white" fontSize="12" fontWeight="bold" transform={`rotate(${snappedAngleDeg} ${startPoint.x} ${startPoint.y})`}>You</text>
                </g>
            </svg>
        </main>
        {arError && <div className="my-2 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-sm text-center">{arError}</div>}
        <footer className='mt-4'>
            <button onClick={handleStartARClick} className="w-full py-4 bg-slate-700 text-white text-xl font-bold rounded-lg shadow-lg hover:bg-slate-600 transition-colors">Start AR Navigation</button>
        </footer>
      </div>
    );
  }

  // --- NAVIGATING STATE ---
  const isArrived = steps <= 0;
  let arrowRotation = 0;
  let isCorrectDirection = false;

  if (heading !== null && !isArrived) {
      const targetHeading = destination ? roomLayout[destination].heading : 0;
      let angleDiff = targetHeading - heading;
      
      // Normalize angle difference to be between -180 and 180 for the shortest turn
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;

      const DIRECTION_THRESHOLD = 20; // 20 degrees of leeway
      
      // If user is facing the correct direction, snap arrow to point up
      if (Math.abs(angleDiff) <= DIRECTION_THRESHOLD) {
          isCorrectDirection = true;
          arrowRotation = 0;
      } else {
          isCorrectDirection = false;
          arrowRotation = angleDiff; // Point in the direction of the turn
      }
  }

  return (
    <div className="relative w-full h-[95vh] bg-black overflow-hidden rounded-3xl shadow-2xl flex flex-col justify-between border border-slate-700/50">
      <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500" style={{ opacity: isArrived ? 0.3 : 1 }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none"></div>
      
      <header className="relative z-10 p-4 flex justify-between items-center text-white">
        <button onClick={handleBack} className="text-white text-sm p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1 backdrop-blur-sm">
            <span className='text-lg'>&larr;</span> Back
        </button>
        <h2 className="text-lg font-bold">To {destination}</h2>
        <div className="w-20"></div> {/* Spacer */}
      </header>

      {isArrived && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20">
              <div className="text-7xl mb-4 animate-bounce">🎉</div>
              <h3 className="text-4xl font-bold">You have arrived!</h3>
              <button 
                onClick={() => { setNavState('SELECTION'); setDestination(null); }}
                className="mt-8 px-8 py-3 bg-green-700/80 border border-green-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-green-600 transition-colors"
              >
                Done
              </button>
          </div>
      )}

      <footer className="relative z-10 p-6 text-white">
        <div className={`flex items-end justify-center h-24 transition-opacity duration-300 ${isArrived ? 'opacity-0' : 'opacity-100'}`}>
            {heading !== null && (
                <div 
                    className="transition-transform duration-500 ease-out"
                    style={{ transform: `rotate(${arrowRotation}deg)` }}
                >
                     <svg width="80" height="80" viewBox="0 0 100 100" className="drop-shadow-lg">
                        <polygon points="50,0 100,100 50,75 0,100" className={`transition-all duration-300 ${isCorrectDirection ? 'fill-green-400 animate-pulse' : 'fill-white/80'}`}/>
                    </svg>
                </div>
            )}
        </div>
        <div className="mt-4 p-4 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
                <p className="text-sm text-slate-300">Steps Remaining</p>
                <p className="text-5xl font-bold transition-all duration-200" key={steps}>{steps}</p>
            </div>
            <div className="h-12 text-center flex items-center justify-center w-48">
                {heading === null && <p className="text-slate-400">Initializing...</p>}
            </div>
        </div>
      </footer>
    </div>
  );
};

export default ARNavigation;
