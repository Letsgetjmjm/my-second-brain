import React from 'react';
import { useStore } from '../store/useStore';
import { ArrowLeft, RotateCcw, CheckCircle, Trash2 } from 'lucide-react';

export default function CompletedSubjects() {
  const { studyData, completedSubjects, setCurrentView, setActiveSubject, toggleSubjectComplete, removeSubject, getSubjectProgress, showToast } = useStore();
  
  // 완료된 과목만 필터링
  const finishedSubjects = completedSubjects.filter(sub => studyData[sub]);

  const handleRestore = (e, sub) => {
    e.stopPropagation();
    toggleSubjectComplete(sub);
    showToast(`'${sub}' 과목이 다시 아카이브(진행 중)로 복구되었습니다.`);
  };

  const handleDelete = (e, sub) => {
    e.stopPropagation();
    if (window.confirm(`'${sub}' 과목을 영구적으로 삭제하시겠습니까?`)) {
      removeSubject(sub);
      showToast('과목이 영구 삭제되었습니다.');
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 h-screen overflow-y-auto animate-[fadeIn_0.3s_ease-out] pb-[50px]">
      <div className="flex justify-between items-center mt-8 mb-10">
        <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-2 px-5 py-2.5 bg-[#222] text-white border border-[#444] rounded-full hover:bg-[#333] hover:scale-105 transition-all font-bold">
          <ArrowLeft size={18} /> 대시보드
        </button>
      </div>

      <h1 className="text-4xl font-bold mb-10 pl-2 flex items-center gap-3 text-[#3498db]">
        <CheckCircle size={40} /> Completed Subjects (완료됨)
      </h1>

      {finishedSubjects.length === 0 ? (
        <div className="text-center text-[#888] mt-20 text-lg">아직 완료한 과목이 없습니다. Study Archive에서 과목을 완료 처리해 보세요!</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {finishedSubjects.map(sub => {
            const progress = getSubjectProgress(sub);
            
            return (
              <div key={sub} onClick={() => { setActiveSubject(sub); setCurrentView('archive-subject'); }}
                className="bg-[#1a1a1a] border border-[#2a2a40] p-6 rounded-3xl hover:border-[#3498db] hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-all cursor-pointer group flex flex-col justify-between h-[160px]">
                
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold text-gray-400 group-hover:text-[#3498db] transition-colors m-0 truncate pr-2 line-through decoration-2 decoration-[#3498db]/50">{sub}</h2>
                  <div className="flex gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => handleRestore(e, sub)} title="아카이브로 복구" className="p-2 text-[#aaa] hover:text-[#4CAF50] hover:bg-[#4CAF50]/10 rounded-full transition-colors">
                      <RotateCcw size={20} />
                    </button>
                    <button onClick={(e) => handleDelete(e, sub)} title="영구 삭제" className="p-2 text-[#aaa] hover:text-[#ff4757] hover:bg-red-500/10 rounded-full transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                
                <div>
                  <div className="w-full h-2 bg-[#333] rounded-full overflow-hidden mt-4 relative">
                    <div className="bg-[#3498db] h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="text-right text-xs text-[#3498db] font-bold mt-2">수고하셨습니다!</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}