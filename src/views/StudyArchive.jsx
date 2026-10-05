import React from 'react';
import { useStore } from '../store/useStore';
import { ArrowLeft, Trash2, CheckCircle } from 'lucide-react';

export default function StudyArchive() {
  const { studyData, completedSubjects, setCurrentView, setActiveSubject, addSubject, removeSubject, toggleSubjectComplete, getSubjectProgress, showToast } = useStore();
  
  // 완료되지 않은 과목만 필터링
  const activeSubjects = Object.keys(studyData).filter(sub => !completedSubjects.includes(sub));

  const handleAddSubject = () => {
    const subName = window.prompt("새로 추가할 과목 이름을 입력하세요:");
    if (subName && subName.trim() !== '') addSubject(subName.trim());
  };

  const handleDelete = (e, sub) => {
    e.stopPropagation();
    if (window.confirm(`'${sub}' 과목을 영구적으로 삭제하시겠습니까?\n내부의 모든 노트와 데이터가 사라집니다.`)) {
      removeSubject(sub);
      showToast('과목이 삭제되었습니다.');
    }
  };

  const handleComplete = (e, sub) => {
    e.stopPropagation();
    toggleSubjectComplete(sub);
    showToast(`'${sub}' 과목이 완료(Completed)로 이동되었습니다.`);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 h-screen overflow-y-auto animate-[fadeIn_0.3s_ease-out] pb-[50px]">
      <div className="flex justify-between items-center mt-8 mb-10">
        <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-2 px-5 py-2.5 bg-[#222] text-white border border-[#444] rounded-full hover:bg-[#333] hover:scale-105 transition-all font-bold">
          <ArrowLeft size={18} /> 대시보드
        </button>
        <button onClick={handleAddSubject} className="px-5 py-2.5 bg-[#1a2e1e] text-[#4CAF50] border border-[#4CAF50] rounded-full hover:bg-[#25422b] hover:scale-105 transition-all font-bold shadow-lg">
          + 과목 추가
        </button>
      </div>

      <h1 className="text-4xl font-bold mb-10 pl-2">📁 Study Archive (진행 중)</h1>

      {activeSubjects.length === 0 ? (
        <div className="text-center text-[#888] mt-20 text-lg">진행 중인 과목이 없습니다. 우측 상단 버튼을 눌러 과목을 추가하세요.</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {activeSubjects.map(sub => {
            const progress = getSubjectProgress(sub);
            
            return (
              <div key={sub} onClick={() => { setActiveSubject(sub); setCurrentView('archive-subject'); }}
                className="bg-[#1a1a1a] border border-[#2a2a40] p-6 rounded-3xl hover:border-[#4CAF50] hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-all cursor-pointer group flex flex-col justify-between h-[160px]">
                
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold group-hover:text-[#4CAF50] transition-colors m-0 truncate pr-2">{sub}</h2>
                  <div className="flex gap-2">
                    <button onClick={(e) => handleComplete(e, sub)} title="완료 처리" className="p-2 text-[#aaa] hover:text-[#3498db] hover:bg-[#3498db]/10 rounded-full transition-colors">
                      <CheckCircle size={20} />
                    </button>
                    <button onClick={(e) => handleDelete(e, sub)} title="삭제" className="p-2 text-[#aaa] hover:text-[#ff4757] hover:bg-red-500/10 rounded-full transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                
                <div>
                  <div className="w-full h-2 bg-[#333] rounded-full overflow-hidden mt-4 relative">
                    <div className="bg-[#4CAF50] h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="text-right text-xs text-[#888] font-bold mt-2">{progress}% 진행됨</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}