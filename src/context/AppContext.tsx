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
    { id: '1', title: 'Take Morning Pills', time: '08:00 AM', completed: false, icon: 'medication' },
    { id: '2', title: 'Eat Breakfast', time: '08:30 AM', completed: false, icon: 'meal' },
    { id: '3', title: 'Drink a glass of water', time: '10:00 AM', completed: false, icon: 'hydration' },
  ],
  alerts: [],
  memories: [
    {
      id: 'mem1',
      imageUrl: 'https://images.unsplash.com/photo-1558032761-e50cf35451a9?q=80&w=2070&auto=format&fit=crop',
      caption: 'That wonderful day we spent at the beach with the grandkids. Remember how much they loved the ice cream?',
      sharedBy: 'Your Daughter, Jane'
    }
  ],
  eventLog: [
    { id: 'ev1', text: 'Caregiver scheduled "Take Morning Pills".', timestamp: new Date().toLocaleString(), icon: 'task' }
  ],
  sharedQuote: {
    id: 'q1',
    text: 'Just a little note to say we are thinking of you today!',
    timestamp: new Date().toLocaleString()
  },
  voiceMessages: [
      { 
          id: 'vm1', 
          audioUrl: 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAsYVVYA', // Placeholder for a real audio file
          duration: 5,
          senderRole: SenderRole.FAMILY, 
          senderName: 'Your Grandson, Leo',
          timestamp: '10:30 AM'
      },
  ],
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