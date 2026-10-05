import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ArrowLeft, ChevronDown, ChevronRight, Check, Lightbulb as BulbIcon, CheckCircle } from 'lucide-react';

export default function QnASubject() {
  const { studyData, completedSubjects, activeSubject, qnaType, setCurrentView, updateStudyData } = useStore();
  const isQ = qnaType === 'Q';
  const isCompleted = completedSubjects.includes(activeSubject);
  
  const [activeChap, setActiveChap] = useState('');
  const [activeSec, setActiveSec] = useState('');
  const [collapsedChaps, setCollapsedChaps] = useState({});
  const [answerInputs, setAnswerInputs] = useState({});
  const [newInput, setNewInput] = useState('');

  const currentSubData = activeSec ? (studyData[activeSubject]?.[activeChap]?.[activeSec] || {}) : {};
  const questions = currentSubData.questions || [];
  const unresolvedQs = questions.map((q, idx) => ({ ...q, originalIdx: idx })).filter(q => !q.resolved);
  const resolvedQs = questions.map((q, idx) => ({ ...q, originalIdx: idx })).filter(q => q.resolved);
  const ideas = currentSubData.ideas || [];

  const handleResolveQ = (idx) => {
    updateStudyData(d => {
      const q = d[activeSubject][activeChap][activeSec].questions[idx];
      q.answer = answerInputs[idx] !== undefined ? answerInputs[idx] : (q.answer || '');
      q.resolved = true;
    });
    setAnswerInputs(prev => { const newObj = { ...prev }; delete newObj[idx]; return newObj; });
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 h-screen flex flex-col animate-[fadeIn_0.3s_ease-out]">
      <div className="mt-8 mb-6">
        <button onClick={() => setCurrentView('qna')} className="flex items-center gap-2 px-5 py-2.5 bg-[#222] text-white border border-[#444] rounded-full hover:bg-[#333] transition-all font-bold w-fit">
          <ArrowLeft size={18} /> Q&A 홈
        </button>
      </div>

      <div className="flex gap-6 flex-1 pb-8 min-h-0">
        <div className="bg-[#1a1a1a] border border-[#2a2a40] rounded-3xl w-[340px] overflow-y-auto custom-scroll p-6 shadow-xl">
          <div className={`border-b border-[#333] pb-4 mb-4`}>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 bg-[#1e3a8a] text-[#60a5fa] text-xs font-bold px-2 py-1 rounded-md mb-2">
                <CheckCircle size={12}/> 완료된 과목
              </span>
            )}
            <h2 className={`text-2xl font-bold ${isQ ? 'text-[#ff4757]' : 'text-[#2ed573]'}`}>
              {activeSubject}
            </h2>
          </div>
          <div>
            {Object.keys(studyData[activeSubject] || {}).map(chap => (
              <div key={chap} className="mb-4">
                <div onClick={() => setCollapsedChaps(prev => ({ ...prev, [chap]: !prev[chap] }))} className="flex items-center gap-2 text-[#ccc] cursor-pointer bg-white/5 p-3 rounded-xl mb-2 font-bold text-sm hover:bg-white/10 transition-colors">
                  {collapsedChaps[chap] ? <ChevronRight size={18} /> : <ChevronDown size={18} />} <span className="truncate">{chap}</span>
                </div>
                {!collapsedChaps[chap] && Object.keys(studyData[activeSubject][chap]).map(sec => {
                  const isActive = activeSec === sec;
                  return (
                    <div key={sec} onClick={() => { setActiveChap(chap); setActiveSec(sec); }} 
                      className={`p-3 ml-4 rounded-xl cursor-pointer transition-colors mb-1 ${isActive ? 'bg-[#2a2a40] text-white font-bold shadow-md' : 'text-[#aaa] hover:bg-[#222]'}`}>
                      <span className="text-sm">{sec}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className={`bg-[#1e1e1e] border rounded-3xl flex-1 flex flex-col min-h-0 shadow-xl ${isQ ? 'border-[#5a2a2a]' : 'border-[#2a5a2a]'}`}>
          {!activeSec ? (
            <div className="flex-1 flex items-center justify-center text-[#888] text-lg">좌측 목차에서 파트를 선택해주세요.</div>
          ) : (
            <div className="flex-1 overflow-y-auto custom-scroll p-8">
              <div className="text-center mb-10">
                <h2 className="text-[#888] text-lg mb-2">{activeChap}</h2>
                <h1 className={`text-3xl font-bold m-0 ${isQ ? 'text-[#ff4757]' : 'text-[#2ed573]'}`}>{activeSec}</h1>
              </div>

              {isQ ? (
                <>
                  <h3 className="text-[#ff4757] border-b border-[#444] pb-3 mb-6 text-xl font-bold">미해결 질문 ({unresolvedQs.length})</h3>
                  <div className="flex flex-col gap-6 mb-12">
                    {unresolvedQs.length === 0 && <p className="text-[#888] text-lg">모든 질문을 해결했습니다!</p>}
                    {unresolvedQs.map(q => (
                      <div key={q.originalIdx} className="bg-[#111] p-8 rounded-3xl border-l-4 border-[#ff4757] shadow-md">
                        <h4 className="text-xl text-white font-bold mb-6 leading-relaxed">Q. {q.text}</h4>
                        <textarea placeholder="스스로 찾은 해답 작성..." 
                          value={answerInputs[q.originalIdx] !== undefined ? answerInputs[q.originalIdx] : (q.answer || '')}
                          onChange={(e) => setAnswerInputs(prev => ({ ...prev, [q.originalIdx]: e.target.value }))}
                          className="w-full bg-[#222] border border-[#444] rounded-2xl p-5 text-white outline-none resize-y min-h-[120px] mb-5 focus:border-[#ff4757] transition-colors text-lg" />
                        <div className="flex justify-end">
                          <button onClick={() => handleResolveQ(q.originalIdx)} className="flex items-center gap-2 bg-[#2ed573] text-black px-8 py-3 rounded-2xl font-bold hover:brightness-110 transition-all shadow-md">
                            <Check size={20}/> 해결 완료
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-[#2ed573] border-b border-[#444] pb-3 mb-6 text-xl font-bold">완료된 질문 (Resolved) ({resolvedQs.length})</h3>
                  <div className="flex flex-col gap-6">
                    {resolvedQs.length === 0 && <p className="text-[#888] text-lg">아직 해결된 질문이 없습니다.</p>}
                    {resolvedQs.map(q => (
                      <div key={q.originalIdx} className="bg-[#1a2e1e]/30 p-8 rounded-3xl border border-[#2ed573]/50">
                        <div className="flex justify-between items-start mb-6">
                          <h4 className="text-xl text-[#888] line-through m-0">Q. {q.text}</h4>
                          <button onClick={() => updateStudyData(d => { d[activeSubject][activeChap][activeSec].questions[q.originalIdx].resolved = false; })} 
                            className="text-[#ff4757] hover:underline text-base font-bold px-4 py-2 rounded-full hover:bg-[#ff4757]/10 transition-colors">다시 풀기</button>
                        </div>
                        <b className="text-[#2ed573] block mb-3 text-base">A. 나의 답변</b>
                        <p className="text-white whitespace-pre-wrap m-0 leading-relaxed text-lg">{q.answer || '(답변 없음)'}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-4 mb-10">
                    <input type="text" value={newInput} onChange={(e) => setNewInput(e.target.value)} 
                      onKeyPress={(e) => { if(e.key === 'Enter' && newInput){ updateStudyData(d => { d[activeSubject][activeChap][activeSec].ideas.push({ text: newInput }); }); setNewInput(''); } }}
                      placeholder="새로운 아이디어 기록..." 
                      className="flex-1 bg-[#111] border border-[#333] rounded-2xl p-5 text-white outline-none focus:border-[#2ed573] transition-colors text-lg shadow-inner" />
                    <button onClick={() => { if(newInput){ updateStudyData(d => { d[activeSubject][activeChap][activeSec].ideas.push({ text: newInput }); }); setNewInput(''); } }} 
                      className="bg-[#2ed573] text-black px-10 font-bold rounded-2xl hover:brightness-110 transition-all shadow-md text-lg">
                      추가
                    </button>
                  </div>
                  <div className="flex flex-col gap-5">
                    {ideas.length === 0 && <p className="text-[#888] text-center mt-10 text-lg">등록된 아이디어가 없습니다.</p>}
                    {ideas.map((idea, idx) => (
                      <div key={idx} className="p-6 bg-[#1a2e1e]/50 border-l-4 border-[#2ed573] rounded-2xl flex items-start gap-5 shadow-md">
                        <BulbIcon size={28} className="text-[#2ed573] shrink-0 mt-1" />
                        <span className="text-white text-lg leading-relaxed">{idea.text}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}