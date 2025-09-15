import React, { useRef, useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

// Reference to the global faceapi object from the script tag
declare const faceapi: any;

interface WhoIsThisProps {
    onBack: () => void;
}

const WhoIsThis: React.FC<WhoIsThisProps> = ({ onBack }) => {
    const { state } = useAppContext();
    const { memories } = state;
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loadingMessage, setLoadingMessage] = useState('Loading AI models...');
    const [isReady, setIsReady] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        const loadFaceApi = async () => {
            if (typeof faceapi === 'undefined') {
                setLoadingMessage('Error: AI library not found.');
                return;
            }

            const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            ]);
            setLoadingMessage('Ready to start camera.');
        };

        loadFaceApi();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startVideo = async () => {
        try {
            setLoadingMessage('Requesting camera permission...');
            
            // Conditionally check permissions for native builds
            if (Capacitor.isNativePlatform()) {
                const permissionStatus = await Camera.requestPermissions();
                if (permissionStatus.camera !== 'granted') {
                    setLoadingMessage("Camera access denied. Please enable it in the app settings.");
                    return;
                }
            }

            setLoadingMessage('Starting camera...');
            // On the web, this call alone will trigger the permission prompt.
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCameraOn(true);
            }
        } catch (err) {
             console.error("Error starting video stream:", err);
             let message = "Could not access camera.";
             if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
                message = "Camera access was denied. Please allow it in your browser settings.";
             }
             setLoadingMessage(message);
        }
    };

    const handleVideoPlay = async () => {
        setLoadingMessage('Analyzing faces from memory album...');

        if (!memories || memories.length === 0) {
            setLoadingMessage('No memories found to recognize faces.');
            setIsReady(true);
            return;
        }

        const labeledFaceDescriptors = await Promise.all(
            memories.map(async (memory) => {
                const descriptions = [];
                try {
                    const img = await faceapi.fetchImage(`https://corsproxy.io/?${encodeURIComponent(memory.imageUrl)}`);
                    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                    if (detections) {
                        descriptions.push(detections.descriptor);
                    }
                } catch (e) {
                    console.error('Could not load image or detect face for', memory.sharedBy, e);
                }
                return new faceapi.LabeledFaceDescriptors(memory.sharedBy, descriptions);
            })
        );
        
        const validDescriptors = labeledFaceDescriptors.filter(d => d.descriptors.length > 0);

        if (validDescriptors.length === 0) {
            setLoadingMessage('Could not analyze faces from memory album.');
            setIsReady(true);
            return;
        }

        const faceMatcher = new faceapi.FaceMatcher(validDescriptors, 0.6);
        setLoadingMessage('Ready to recognize!');
        setIsReady(true);
        
        intervalRef.current = window.setInterval(async () => {
            if (canvasRef.current && videoRef.current && !videoRef.current.paused) {
                const canvas = canvasRef.current;
                const video = videoRef.current;
                const displaySize = { width: video.videoWidth, height: video.videoHeight };
                
                faceapi.matchDimensions(canvas, displaySize);
                
                const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                
                const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    results.forEach((result, i) => {
                        const box = resizedDetections[i].detection.box;
                        const drawBox = new faceapi.draw.DrawBox(box, { 
                            label: result.toString(),
                            boxColor: 'rgba(59, 130, 246, 1)',
                            drawLabelOptions: {
                                fontColor: 'white',
                                padding: 8,
                                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                            }
                        });
                        drawBox.draw(canvas);
                    });
                }
            }
        }, 500);
    };

    useEffect(() => {
        const video = videoRef.current;
        if (video && isCameraOn) {
            video.addEventListener('play', handleVideoPlay);
            return () => {
              if (video) video.removeEventListener('play', handleVideoPlay)
            }
        }
    }, [memories, isCameraOn]);

    return (
        <div className="relative p-4 sm:p-6 bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl h-[95vh] flex flex-col">
            <header className="flex items-center mb-4 border-b border-slate-700/50 pb-4">
                <button onClick={onBack} className="text-slate-400 text-sm p-2 rounded-full hover:bg-slate-800/50 transition-colors mr-2 flex items-center gap-1">
                    <span className='text-lg'>&larr;</span> Back
                </button>
                <h2 className="text-2xl font-bold text-white">Who Is This?</h2>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center relative">
                <div className="relative w-full max-w-full aspect-[3/4] overflow-hidden rounded-lg shadow-lg bg-black flex items-center justify-center">
                    {!isCameraOn ? (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-20 p-4">
                            <p className="text-slate-300 text-center mb-4">{loadingMessage}</p>
                            <button 
                                onClick={startVideo} 
                                disabled={loadingMessage.includes('Loading')}
                                className="px-6 py-3 bg-slate-700 text-white font-bold rounded-full shadow-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-wait"
                            >
                                Start Camera
                            </button>
                        </div>
                    ) : (
                        !isReady && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-20">
                                <div className="w-16 h-16 border-4 border-t-transparent border-slate-500 rounded-full animate-spin"></div>
                                <p className="mt-4 text-slate-300">{loadingMessage}</p>
                            </div>
                        )
                    )}
                    <video ref={videoRef} autoPlay muted playsInline className="absolute top-0 left-0 w-full h-full object-cover transform -scale-x-100"></video>
                    <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full transform -scale-x-100"></canvas>
                </div>
            </main>
        </div>
    );
};

export default WhoIsThis;
