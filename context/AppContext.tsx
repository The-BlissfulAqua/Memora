import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Reminder, Alert, AppAction, Memory, EventLogItem, SharedQuote, VoiceMessage, SenderRole } from '../types';

interface AppState {
  reminders: Reminder[];
  alerts: Alert[];
  memories: Memory[];
  eventLog: EventLogItem[];
  sharedQuote: SharedQuote | null;
  voiceMessages: VoiceMessage[];
}

const initialState: AppState = {
  reminders: [
    { id: '1', title: 'Take Morning Pills', time: '8:00 AM', completed: false, icon: 'medication' },
    { id: '2', title: 'Eat Breakfast', time: '8:30 AM', completed: false, icon: 'meal' },
    { id: '3', title: 'Drink a glass of water', time: '10:00 AM', completed: false, icon: 'hydration' },
    { id: '4', title: 'Take Afternoon Pills', time: '1:00 PM', completed: false, icon: 'medication' },
  ],
  alerts: [],
  memories: [
      { id: 'mem-1', imageUrl: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?q=80&w=2835&auto=format&fit=crop', caption: 'Remember our lovely dog, Paws?', sharedBy: 'Your Daughter, Jane' },
      { id: 'mem-2', imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=2940&auto=format&fit=crop', caption: 'Our favorite beach vacation.', sharedBy: 'Your Son, Mike' }
  ],
  eventLog: [
      { id: 'evt-1', text: 'Caregiver scheduled "Take Morning Pills"', timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(), icon: 'task' }
  ],
  sharedQuote: { id: 'quote-1', text: 'A kind heart is a fountain of gladness, making everything in its vicinity freshen into smiles.', timestamp: new Date().toLocaleTimeString() },
  voiceMessages: [
    { id: 'vm-1', audioUrl: 'https://www.w3schools.com/html/horse.mp3', duration: 2, senderRole: SenderRole.FAMILY, senderName: 'Your Daughter, Jane', timestamp: 'Yesterday' },
    { id: 'vm-2', audioUrl: 'https://www.w3schools.com/html/horse.mp3', duration: 2, senderRole: SenderRole.CAREGIVER, senderName: 'Caregiver', timestamp: 'This morning' },
  ]
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'COMPLETE_REMINDER':
      const completedReminder = state.reminders.find(r => r.id === action.payload);
      const newCompleteEvent: EventLogItem = {
          id: new Date().toISOString(),
          text: `Patient marked "${completedReminder?.title}" as complete.`,
          timestamp: new Date().toLocaleString(),
          icon: 'reminder'
      };
      return {
        ...state,
        reminders: state.reminders.map((r) =>
          r.id === action.payload ? { ...r, completed: true } : r
        ),
        eventLog: [newCompleteEvent, ...state.eventLog],
      };
    case 'ADD_REMINDER':
        const newReminderEvent: EventLogItem = {
            id: new Date().toISOString(),
            text: `Caregiver scheduled "${action.payload.title}".`,
            timestamp: new Date().toLocaleString(),
            icon: 'task'
        };
      return {
        ...state,
        reminders: [...state.reminders, action.payload],
        eventLog: [newReminderEvent, ...state.eventLog],
      };
    case 'DELETE_REMINDER':
        return {
            ...state,
            reminders: state.reminders.filter(r => r.id !== action.payload)
        }
    case 'TRIGGER_SOS':
      const sosMessage = action.payload.type === 'FALL'
        ? 'Potential fall detected!'
        : 'Patient triggered an SOS alert!';
      const newSosEvent: EventLogItem = {
        id: new Date().toISOString(),
        text: sosMessage,
        timestamp: new Date().toLocaleString(),
        icon: action.payload.type === 'FALL' ? 'fall' : 'sos'
      };
      return {
        ...state,
        alerts: [action.payload, ...state.alerts],
        eventLog: [newSosEvent, ...state.eventLog],
      };
    case 'ADD_MEMORY':
      const newMemoryEvent: EventLogItem = {
        id: new Date().toISOString(),
        text: `${action.payload.sharedBy} shared a new memory.`,
        timestamp: new Date().toLocaleString(),
        icon: 'memory'
      };
      return {
          ...state,
          memories: [action.payload, ...state.memories],
          eventLog: [newMemoryEvent, ...state.eventLog],
      };
    case 'ADD_QUOTE':
        return {
            ...state,
            sharedQuote: action.payload
        };
    case 'LOG_EMOTION':
      const emotion = action.payload.emotion;
      const newEmotionAlert: Alert = {
          id: new Date().toISOString(),
          message: `Patient seems to be feeling ${emotion}.`,
          timestamp: new Date().toLocaleString(),
          type: 'EMOTION'
      };
      const newEmotionEvent: EventLogItem = {
          id: new Date().toISOString(),
          text: `Detected emotion: ${emotion}.`,
          timestamp: new Date().toLocaleString(),
          icon: 'emotion'
      };
      const isNegativeEmotion = ['sad', 'angry', 'fearful', 'disgusted'].includes(emotion);
      return {
          ...state,
          alerts: isNegativeEmotion ? [newEmotionAlert, ...state.alerts] : state.alerts,
          eventLog: [newEmotionEvent, ...state.eventLog],
      };
    case 'ADD_VOICE_MESSAGE':
        return {
            ...state,
            voiceMessages: [action.payload, ...state.voiceMessages]
        };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};