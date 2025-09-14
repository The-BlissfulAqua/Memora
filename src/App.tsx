import React, { useState } from 'react';
import PatientView from './components/patient/PatientView';
import CaregiverView from './components/caregiver/CaregiverView';
import FamilyView from './components/family/FamilyView';
import { ViewMode } from './types';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.PATIENT);

  const handleSwitchView = () => {
    if (viewMode === ViewMode.PATIENT) {
      setViewMode(ViewMode.CAREGIVER);
    } else if (viewMode === ViewMode.CAREGIVER) {
      setViewMode(ViewMode.FAMILY);
    } else {
      setViewMode(ViewMode.PATIENT);
    }
  };

  const getNextViewName = () => {
    if (viewMode === ViewMode.PATIENT) return 'Caregiver';
    if (viewMode === ViewMode.CAREGIVER) return 'Family';
    return 'Patient';
  };

  const renderView = () => {
    switch(viewMode) {
      case ViewMode.PATIENT:
        return <PatientView />;
      case ViewMode.CAREGIVER:
        return <CaregiverView />;
      case ViewMode.FAMILY:
        return <FamilyView />;
      default:
        return <PatientView />;
    }
  }

  return (
    // The main background is now on the body tag in index.html
    <div className="min-h-screen font-sans antialiased text-gray-300"> 
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={handleSwitchView}
          className="px-4 py-2 bg-slate-800/80 border border-slate-700 backdrop-blur-sm text-sm text-gray-300 rounded-full shadow-lg hover:bg-slate-700/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          Switch to {getNextViewName()} View
        </button>
      </div>
      
      <div className="container mx-auto max-w-lg p-2 sm:p-4">
        {renderView()}
      </div>
    </div>
  );
};

export default App;