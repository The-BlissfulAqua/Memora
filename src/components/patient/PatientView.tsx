import React, { useState, useEffect } from 'react';
import PatientHome from './PatientHome';
import ARNavigation from './ARNavigation';
import AICompanion from './AICompanion';
import RemindersList from './RemindersList';
import CognitiveGames from './CognitiveGames';
import MemoryAlbumView from './MemoryAlbumView';
import VoiceMessages from './VoiceMessages';
import WhoIsThis from './WhoIsThis';
import { PatientScreen } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Motion } from '@capacitor/motion';

const PatientView: React.FC = () => {
  const { dispatch } = useAppContext();
  const [screen, setScreen] = useState<PatientScreen>(PatientScreen.HOME);

  // Fall Detection Logic
  useEffect(() => {
    const FALL_THRESHOLD = 25; // m/s^2, a threshold for fall detection
    
    const startFallDetection = async () => {
        try {
            // Check and request permissions for motion sensors on native devices
            const permissions = await Motion.requestPermissions();
            if (permissions.motion !== 'granted') {
                console.warn('Motion permission not granted. Fall detection disabled.');
                return;
            }

            await Motion.addListener('accel', (event) => {
                const { x, y, z } = event.acceleration;
                const magnitude = Math.sqrt(x * x + y * y + z * z);
                
                if (magnitude > FALL_THRESHOLD) {
                    console.log('Potential fall detected! Magnitude:', magnitude);
                    dispatch({
                        type: 'TRIGGER_SOS',
                        payload: {
                            id: new Date().toISOString(),
                            message: 'Potential Fall Detected!',
                            timestamp: new Date().toLocaleString(),
                            type: 'FALL',
                        },
                    });
                    // To prevent multiple alerts, a cooldown could be added here in a real app.
                }
            });

        } catch (e) {
            console.error('Error setting up fall detection:', e);
        }
    };
    
    startFallDetection();

    return () => {
      // Clean up listeners when the component unmounts
      Motion.removeAllListeners();
    };
  }, [dispatch]);


  const renderScreen = () => {
    switch (screen) {
      case PatientScreen.HOME:
        return <PatientHome setScreen={setScreen} />;
      case PatientScreen.NAVIGATION:
        return <ARNavigation onBack={() => setScreen(PatientScreen.HOME)} />;
      case PatientScreen.AI_COMPANION:
        return <AICompanion onBack={() => setScreen(PatientScreen.HOME)} />;
      case PatientScreen.REMINDERS:
        return <RemindersList onBack={() => setScreen(PatientScreen.HOME)} />;
      case PatientScreen.COGNITIVE_GAMES:
        return <CognitiveGames onBack={() => setScreen(PatientScreen.HOME)} />;
      case PatientScreen.MEMORY_ALBUM:
        return <MemoryAlbumView onBack={() => setScreen(PatientScreen.HOME)} />;
      case PatientScreen.VOICE_MESSAGES:
        return <VoiceMessages onBack={() => setScreen(PatientScreen.HOME)} />;
      case PatientScreen.WHO_IS_THIS:
        return <WhoIsThis onBack={() => setScreen(PatientScreen.HOME)} />;
      default:
        return <PatientHome setScreen={setScreen} />;
    }
  };

  return <div className="w-full h-full">{renderScreen()}</div>;
};

export default PatientView;