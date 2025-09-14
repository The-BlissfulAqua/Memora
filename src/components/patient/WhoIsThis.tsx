import React, { useRef, useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';

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

            setLoadingMessage('Starting camera...');
            startVideo();
        };

        const startVideo = () => {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => {
                    console.error("Error starting video stream:", err);
                    setLoadingMessage('Could not access camera.');
                });
        };

        loadFaceApi();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

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
                    // Using a more robust CORS proxy for unsplash images.
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
        
        const intervalId = setInterval(async () => {
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

        // This is a more robust way to clear interval on component unmount in useEffect
        return () => clearInterval(intervalId);
    };

    // This effect runs the handleVideoPlay function once the video element is ready.
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.addEventListener('play', handleVideoPlay);
            const cleanup = () => {
              video.removeEventListener('play', handleVideoPlay)
            }
            return cleanup
        }
    }, [memories]); // Rerun if memories change

    return (
        <div className="relative p-4 sm:p-6 bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl h-[95vh] flex flex-col">
            <header className="flex items-center mb-4 border-b border-slate-700/50 pb-4">
                <button onClick={onBack} className="text-slate-400 text-sm p-2 rounded-full hover:bg-slate-800/50 transition-colors mr-2 flex items-center gap-1">
                    <span className='text-lg'>&larr;</span> Back
                </button>
                <h2 className="text-2xl font-bold text-white">Who Is This?</h2>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center relative">
                {!isReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-20">
                        <div className="w-16 h-16 border-4 border-t-transparent border-slate-500 rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-300">{loadingMessage}</p>
                    </div>
                )}
                <div className="relative w-full max-w-full aspect-[3/4] overflow-hidden rounded-lg shadow-lg bg-black">
                    <video ref={videoRef} autoPlay muted playsInline className="absolute top-0 left-0 w-full h-full object-cover transform -scale-x-100"></video>
                    <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full transform -scale-x-100"></canvas>
                </div>
            </main>
        </div>
    );
};

export default WhoIsThis;