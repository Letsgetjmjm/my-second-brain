import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ArrowLeft, MessageCircleQuestion, Lightbulb as BulbIcon, CheckCircle, Clock } from 'lucide-react';

export default function QnA() {
  const { studyData, completedSubjects, setCurrentView, setQnaType, setActiveSubject } = useStore();
  const [viewMode, setViewMode] = useState('active'); // 'active' | 'completed'

  const subjects = Object.keys(studyData);
  const displaySubjects = viewMode === 'active' 
    ? subjects.filter(sub => !completedSubjects.includes(sub))
    : subjects.filter(sub => completedSubjects.includes(sub));

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 h-screen flex flex-col animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-center mt-8 mb-6">
        <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-2 px-5 py-2.5 bg-[#222] text-white border border-[#444] rounded-full hover:bg-[#333] transition-all font-bold w-fit">
          <ArrowLeft size={18} /> 대시보드
        </button>

        {/* 토글 탭 (Segmented Control) */}
        <div className="flex bg-[#111] p-1.5 rounded-2xl border border-[#333] shadow-inner">
          <button onClick={() => setViewMode('active')} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${viewMode === 'active' ? 'bg-[#2a2a40] text-white shadow-md' : 'text-[#888] hover:text-white'}`}>
            <Clock size={18} /> 진행 중
          </button>
          <button onClick={() => setViewMode('completed')} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${viewMode === 'completed' ? 'bg-[#1e3a8a] text-[#60a5fa] shadow-md' : 'text-[#888] hover:text-white'}`}>
            <CheckCircle size={18} /> 완료됨
          </button>
        </div>
      </div>

      {displaySubjects.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[#888] text-xl">
          해당 상태에 등록된 과목이 없습니다.
        </div>
      ) : (
        <div className="flex flex-1 gap-6 pb-8 min-h-0">
          {/* Question Column */}
          <div className="bg-[#1a1a1a] border border-[#2a2a40] rounded-3xl flex-1 overflow-y-auto custom-scroll p-8 shadow-xl">
            <h1 className="flex items-center gap-3 text-3xl font-bold text-[#ff4757] border-b border-[#333] pb-5 mb-8">
              <MessageCircleQuestion size={32} /> 미해결 질문함 (Question)
            </h1>
            <div className="grid grid-cols-2 gap-6">
              {displaySubjects.map(sub => {
                let count = 0;
                Object.values(studyData[sub] || {}).forEach(c => Object.values(c).forEach(s => { count += (s.questions || []).filter(q => !q.resolved).length; }));
                return (
                  <div key={sub} onClick={() => { setQnaType('Q'); setActiveSubject(sub); setCurrentView('qna-subject'); }}
                    className={`bg-[#111] p-8 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all hover:-translate-y-2 hover:shadow-lg ${count > 0 ? 'border-2 border-[#ff4757]' : 'border border-[#333] hover:border-[#ff4757]'}`}>
                    <h2 className="text-2xl text-white font-bold mb-4 text-center break-keep">{sub}</h2>
                    <span className={`font-bold text-lg ${count > 0 ? 'text-[#ff4757]' : 'text-[#888]'}`}>미해결 {count}개</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Idea Column */}
          <div className="bg-[#1a1a1a] border border-[#2a2a40] rounded-3xl flex-1 overflow-y-auto custom-scroll p-8 shadow-xl">
            <h1 className="flex items-center gap-3 text-3xl font-bold text-[#2ed573] border-b border-[#333] pb-5 mb-8">
              <BulbIcon size={32} /> 아이디어함 (Idea)
            </h1>
            <div className="grid grid-cols-2 gap-6">
              {displaySubjects.map(sub => {
                let count = 0;
                Object.values(studyData[sub] || {}).forEach(c => Object.values(c).forEach(s => { count += (s.ideas || []).length; }));
                return (
                  <div key={sub} onClick={() => { setQnaType('I'); setActiveSubject(sub); setCurrentView('qna-subject'); }}
                    className={`bg-[#111] p-8 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all hover:-translate-y-2 hover:shadow-lg ${count > 0 ? 'border-2 border-[#2ed573]' : 'border border-[#333] hover:border-[#2ed573]'}`}>
                    <h2 className="text-2xl text-white font-bold mb-4 text-center break-keep">{sub}</h2>
                    <span className={`font-bold text-lg ${count > 0 ? 'text-[#2ed573]' : 'text-[#888]'}`}>아이디어 {count}개</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}