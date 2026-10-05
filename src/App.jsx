import React from 'react';
import { useStore } from './store/useStore';
import Dashboard from './views/Dashboard';
import StudyArchive from './views/StudyArchive';
import ArchiveSubject from './views/ArchiveSubject';
import ProblemTracker from './views/ProblemTracker';
import QnA from './views/QnA';
import QnASubject from './views/QnASubject';
import CompletedSubjects from './views/CompletedSubjects';

export default function App() {
  const { currentView, toastMessage } = useStore();

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#f3f4f6] font-sans relative">
      {/* 글로벌 알림 (Toast) */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-[#2ed573] text-black px-6 py-3 rounded-full font-bold shadow-[0_5px_15px_rgba(46,213,115,0.4)] animate-[fadeIn_0.3s_ease-out]">
          ✓ {toastMessage}
        </div>
      )}

      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'archive' && <StudyArchive />}
      {currentView === 'archive-subject' && <ArchiveSubject />}
      {currentView === 'completed' && <CompletedSubjects />}
      {currentView === 'problems' && <ProblemTracker />}
      {currentView === 'qna' && <QnA />}
      {currentView === 'qna-subject' && <QnASubject />}
    </div>
  );
}