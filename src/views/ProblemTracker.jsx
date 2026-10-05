import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ArrowLeft, ClipboardList, Check, X, ChevronDown, ChevronRight, Image as ImageIcon } from 'lucide-react';

export default function ProblemTracker() {
  const { studyData, setCurrentView, updateStudyData } = useStore();
  const subjects = Object.keys(studyData);

  const [activeSubj, setActiveSubj] = useState('');
  const [activeChap, setActiveChap] = useState('');
  const [activeSec, setActiveSec] = useState('');
  const [collapsedChaps, setCollapsedChaps] = useState({});
  const [newInput, setNewInput] = useState('');
  const [imageBase64, setImageBase64] = useState(null);

  const handleImagePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => setImageBase64(event.target.result);
        reader.readAsDataURL(blob);
      }
    }
  };

  const handleAddProblem = () => {
    if (!newInput && !imageBase64) return;
    updateStudyData(d => {
      if (!d[activeSubj][activeChap][activeSec].problems) d[activeSubj][activeChap][activeSec].problems = [];
      d[activeSubj][activeChap][activeSec].problems.push({ text: newInput, image: imageBase64, resolved: false });
    });
    setNewInput('');
    setImageBase64(null);
  };

  const currentProblems = activeSec ? (studyData[activeSubj]?.[activeChap]?.[activeSec]?.problems || []) : [];

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 h-screen flex flex-col animate-[fadeIn_0.3s_ease-out]">
      <div className="mt-8 mb-6 flex items-center gap-6">
        <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-2 px-5 py-2.5 bg-[#222] text-white border border-[#444] rounded-full hover:bg-[#333] transition-all font-bold">
          <ArrowLeft size={18} /> 대시보드
        </button>
        <h1 className="text-3xl font-bold text-[#fbc531] flex items-center gap-3 m-0">
          <ClipboardList size={32} /> Non-solved problem (미해결 문제함)
        </h1>
      </div>

      <div className="flex gap-6 flex-1 pb-8 min-h-0">
        <div className="bg-[#1a1a1a] border border-[#2a2a40] rounded-3xl w-[340px] overflow-y-auto custom-scroll p-6 shadow-xl">
          {subjects.map(sub => (
            <div key={sub} className="mb-4">
              <div onClick={() => setActiveSubj(activeSubj === sub ? '' : sub)}
                className={`text-lg font-bold p-4 rounded-2xl cursor-pointer transition-all ${activeSubj === sub ? 'bg-[#fbc531]/10 text-[#fbc531] border border-[#fbc531]/30 shadow-md' : 'bg-[#111] text-white border border-[#333] hover:border-[#555]'}`}>
                {sub}
              </div>
              
              {activeSubj === sub && (
                <div className="mt-3 pl-2">
                  {Object.keys(studyData[sub] || {}).map(chap => (
                    <div key={chap} className="mb-2">
                      <div onClick={() => setCollapsedChaps(prev => ({ ...prev, [chap]: !prev[chap] }))} className="flex items-center gap-2 text-[#ccc] cursor-pointer bg-white/5 p-2.5 rounded-xl mb-1 font-bold text-sm hover:bg-white/10 transition-colors">
                        {collapsedChaps[chap] ? <ChevronRight size={16} /> : <ChevronDown size={16} />} {chap}
                      </div>
                      {!collapsedChaps[chap] && Object.keys(studyData[sub][chap]).map(sec => {
                        const pCount = (studyData[sub][chap][sec].problems || []).filter(p => !p.resolved).length;
                        const isActive = activeSec === sec;
                        return (
                          <div key={sec} onClick={() => { setActiveChap(chap); setActiveSec(sec); }} 
                            className={`flex justify-between items-center p-2.5 ml-4 rounded-xl cursor-pointer transition-colors ${isActive ? 'bg-[#2a2a40] text-white font-bold shadow-md' : 'text-[#aaa] hover:bg-[#222]'}`}>
                            <span className="text-sm">{sec}</span>
                            {pCount > 0 && <span className="text-xs font-bold bg-[#ff4757] text-white px-2 py-0.5 rounded-full">{pCount}</span>}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-[#1e1e1e] border border-[#443a15] rounded-3xl flex-1 flex flex-col min-h-0 shadow-xl">
          {!activeSec ? (
            <div className="flex-1 flex items-center justify-center text-[#888] text-lg">좌측에서 과목과 챕터를 선택해 문제를 등록하세요.</div>
          ) : (
            <div className="flex flex-col h-full p-8">
              <div className="text-center mb-8">
                <h2 className="text-[#ccc] text-lg mb-2">{activeChap}</h2>
                <h1 className="text-[#fbc531] text-3xl font-bold m-0">{activeSec}</h1>
              </div>

              <div className="bg-[#111] border border-[#333] p-6 rounded-3xl mb-8 shrink-0 shadow-inner">
                <p className="text-[#888] text-sm mb-4 flex items-center gap-2"><ImageIcon size={16}/> 오실로스코프 파형이나 문제 캡처 이미지를 텍스트 창에 직접 붙여넣기(Ctrl+V) 하세요.</p>
                {imageBase64 && (
                  <div className="relative inline-block mb-4">
                    <img src={imageBase64} alt="pasted" className="max-h-[200px] rounded-xl border border-[#555] shadow-md" />
                    <button onClick={() => setImageBase64(null)} className="absolute -top-3 -right-3 bg-[#ff4757] text-white rounded-full p-1.5 hover:scale-110 transition-transform shadow-lg">
                      <X size={16}/>
                    </button>
                  </div>
                )}
                <div className="flex gap-4">
                  <textarea value={newInput} onChange={(e) => setNewInput(e.target.value)} onPaste={handleImagePaste}
                    placeholder="막힌 문제의 내용, 수식, 코드 등을 입력하세요..."
                    className="flex-1 bg-[#222] border border-[#444] rounded-2xl p-4 text-white outline-none resize-none h-[100px] focus:border-[#fbc531] transition-colors custom-scroll" />
                  <button onClick={handleAddProblem} className="bg-[#fbc531] text-black font-bold px-8 rounded-2xl hover:brightness-110 transition-all shadow-md">
                    문제 등록
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scroll pr-2 flex flex-col gap-5">
                {currentProblems.length === 0 && <p className="text-[#888] text-center mt-10 text-lg">등록된 미해결 문제가 없습니다.</p>}
                {currentProblems.map((prob, idx) => (
                  <div key={idx} className={`p-6 rounded-2xl border-l-4 transition-all shadow-md ${prob.resolved ? 'bg-white/5 border-[#888] opacity-60' : 'bg-[#fbc531]/5 border-[#fbc531]'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`font-bold text-xl ${prob.resolved ? 'text-[#888]' : 'text-[#fbc531]'}`}>Problem {idx + 1}</span>
                      <button onClick={() => updateStudyData(d => { d[activeSubj][activeChap][activeSec].problems[idx].resolved = !prob.resolved; })}
                        className={`px-5 py-2 rounded-full text-sm font-bold border transition-colors ${prob.resolved ? 'border-[#888] text-[#888] hover:text-white hover:border-white' : 'border-[#2ed573] text-[#2ed573] hover:bg-[#2ed573] hover:text-black'}`}>
                        {prob.resolved ? '다시 풀기' : '해결 완료'}
                      </button>
                    </div>
                    {prob.image && <img src={prob.image} alt={`problem-${idx}`} className="max-w-full max-h-[350px] object-contain rounded-xl mb-4 border border-[#444] shadow-sm" />}
                    {prob.text && <p className="text-white whitespace-pre-wrap leading-relaxed m-0 text-lg">{prob.text}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}