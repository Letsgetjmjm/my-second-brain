import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ArrowLeft, Plus, ChevronDown, ChevronRight, MessageCircleQuestion, Lightbulb as BulbIcon, Trash2 } from 'lucide-react';

export default function ArchiveSubject() {
  const { studyData, activeSubject, setCurrentView, updateStudyData, showToast, removeChapter, removeSection } = useStore();
  const [activeChapter, setActiveChapter] = useState('');
  const [activeSub, setActiveSub] = useState('');
  const [activePage, setActivePage] = useState(0);
  const [collapsedChaps, setCollapsedChaps] = useState({});
  const [newInput, setNewInput] = useState('');

  const currentNoteData = studyData[activeSubject]?.[activeChapter]?.[activeSub];

  const handleAdd = (type) => {
    if (!newInput || !activeSub) return;
    updateStudyData(d => {
      if (type === 'Q') d[activeSubject][activeChapter][activeSub].questions.push({ text: newInput, answer: '', resolved: false });
      else d[activeSubject][activeChapter][activeSub].ideas.push({ text: newInput });
    });
    setNewInput('');
    showToast('성공적으로 등록되었습니다!');
  };

  const handleDeleteChapter = (chap) => {
    if(window.confirm(`'${chap}' 챕터와 하위 노트를 모두 삭제하시겠습니까?`)) {
      removeChapter(activeSubject, chap);
      if(activeChapter === chap) { setActiveChapter(''); setActiveSub(''); }
      showToast('챕터가 삭제되었습니다.');
    }
  };

  const handleDeleteSection = (e, chap, sub) => {
    e.stopPropagation();
    if(window.confirm(`'${sub}' 노트를 삭제하시겠습니까?`)) {
      removeSection(activeSubject, chap, sub);
      if(activeSub === sub) { setActiveSub(''); }
      showToast('노트가 삭제되었습니다.');
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 h-screen flex flex-col animate-[fadeIn_0.3s_ease-out]">
      <div className="mt-8 mb-6">
        <button onClick={() => setCurrentView('archive')} className="flex items-center gap-2 px-5 py-2.5 bg-[#222] text-white border border-[#444] rounded-xl hover:bg-[#333] transition-all font-bold w-fit">
          <ArrowLeft size={18} /> 과목 목록
        </button>
      </div>

      <div className="flex gap-6 flex-1 pb-8 min-h-0">
        
        {/* 목차 사이드바 */}
        <div className="bg-[#1a1a1a] border border-[#2a2a40] rounded-2xl w-[360px] overflow-y-auto custom-scroll p-6 shadow-xl flex flex-col">
          <h2 className="border-b border-[#333] pb-4 text-[#4CAF50] text-xl font-bold flex justify-between items-center mb-5 shrink-0">
            <span className="truncate pr-2">{activeSubject}</span>
            <button 
              onClick={() => { const c = window.prompt("새 챕터(폴더) 이름을 입력하세요:"); if(c) updateStudyData(d => { d[activeSubject][c] = {}; }); }}
              className="shrink-0 flex items-center text-sm font-normal text-black bg-[#4CAF50] hover:bg-[#45a049] px-3 py-1.5 rounded-lg"
            >
              + 챕터
            </button>
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-1">
            <p className="text-[#555] text-xs mb-4 leading-relaxed">※ + 챕터를 만들어 큰 폴더를 생성하고, 그 안의 + 버튼을 눌러 소목차(메모장)를 추가하세요.</p>
            {Object.keys(studyData[activeSubject] || {}).map(chap => (
              <div key={chap} className="mb-4 bg-[#111] p-3 rounded-xl border border-[#333] group/chap">
                <div className="flex justify-between items-center mb-3">
                  <div onClick={() => setCollapsedChaps(prev => ({ ...prev, [chap]: !prev[chap] }))} className="flex flex-1 items-center gap-2 font-bold text-[#e0e0e0] cursor-pointer hover:text-white transition-colors truncate">
                    {collapsedChaps[chap] ? <ChevronRight size={18} className="shrink-0"/> : <ChevronDown size={18} className="shrink-0"/>} 
                    <span className="truncate">{chap}</span>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => handleDeleteChapter(chap)} className="text-[#888] bg-[#222] hover:bg-[#ff4757] hover:text-white p-1.5 rounded-lg transition-colors border border-[#444]"><Trash2 size={16}/></button>
                    <button onClick={() => { const s = window.prompt(`'${chap}' 안에 추가할 메모장 이름:`); if(s) updateStudyData(d => { d[activeSubject][chap][s] = { status: 'X', pages: ['','','','',''], questions: [], ideas: [], problems: [] }; }); }} className="text-[#888] bg-[#222] hover:bg-[#4CAF50] hover:text-black p-1.5 rounded-lg transition-colors border border-[#444]"><Plus size={16}/></button>
                  </div>
                </div>
                
                {!collapsedChaps[chap] && Object.keys(studyData[activeSubject][chap]).map(sub => {
                  const isActive = activeSub === sub;
                  return (
                    <div key={sub} onClick={() => { setActiveChapter(chap); setActiveSub(sub); setActivePage(0); }} 
                      className={`group/sub flex items-center justify-between p-3 ml-2 rounded-xl cursor-pointer transition-all mb-3 ${isActive ? 'bg-[#2a2a40] text-[#4CAF50] font-bold shadow-md border border-[#4CAF50]/50' : 'bg-[#1a1a1a] hover:bg-[#252525] text-[#ccc] border border-transparent hover:border-[#444]'}`}>
                      <span className="text-sm flex-1 truncate pr-2">{sub}</span>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        {/* 휴지통 상시 노출 및 명도 조절 */}
                        <button onClick={(e) => handleDeleteSection(e, chap, sub)} className="text-[#777] hover:text-[#ff4757] transition-colors p-1.5 rounded-md hover:bg-[#333]">
                          <Trash2 size={16}/>
                        </button>
                        {/* 상태 버튼 시인성 극대화 */}
                        <div className="flex gap-1 bg-[#0a0a0a] p-1 rounded-lg border border-[#333]">
                          {['X', '△', 'O'].map(sym => {
                            const isSelected = studyData[activeSubject][chap][sub].status === sym;
                            return (
                              <button key={sym} onClick={(e) => { e.stopPropagation(); updateStudyData(d => { d[activeSubject][chap][sub].status = sym; }); }}
                                className={`w-7 h-7 text-[12px] font-bold rounded-md flex items-center justify-center transition-all ${
                                  isSelected 
                                    ? (sym === 'O' ? 'bg-[#4CAF50] text-white shadow-[0_0_8px_rgba(76,175,80,0.5)]' 
                                      : sym === '△' ? 'bg-[#f39c12] text-white shadow-[0_0_8px_rgba(243,156,18,0.5)]' 
                                      : 'bg-[#ff4757] text-white shadow-[0_0_8px_rgba(255,71,87,0.5)]') 
                                    : 'bg-[#222] text-[#888] hover:bg-[#444] hover:text-white border border-[#333]'
                                }`}>
                                {sym}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 에디터 메인 뷰 */}
        <div className="bg-[#1a1a1a] border border-[#2a2a40] rounded-2xl flex-1 flex flex-col p-8 shadow-xl min-w-0">
          {!activeSub ? (
            <div className="flex-1 flex items-center justify-center text-[#888] text-lg bg-[#111] rounded-2xl border border-dashed border-[#333]">좌측 목차에서 소목차를 선택해 에디터를 여세요.</div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-[#888] text-sm mb-2 bg-[#222] inline-block px-3 py-1 rounded-full">{activeChapter}</h2>
                <h1 className="text-[#4CAF50] text-3xl font-bold truncate">{activeSub}</h1>
              </div>

              <div className="flex-1 flex flex-col bg-[#111] rounded-2xl border border-[#333] overflow-hidden mb-6 shadow-inner">
                <textarea 
                  key={`${activeChapter}-${activeSub}-${activePage}`}
                  className="flex-1 bg-transparent text-white border-none p-6 text-lg resize-none outline-none custom-scroll leading-relaxed" 
                  defaultValue={currentNoteData?.pages?.[activePage] || ''} 
                  onBlur={(e) => { const val = e.target.value; updateStudyData(d => { d[activeSubject][activeChapter][activeSub].pages[activePage] = val; }); }} 
                  placeholder={`${activeSub}에 대한 학습 기록, 수식, 회로도 분석 등을 자유롭게 기록하세요...`} 
                />
                <div className="flex justify-center gap-6 p-4 bg-[#0a0a0a] border-t border-[#333]">
                  {[0, 1, 2, 3, 4].map(pageNum => (
                    <button key={pageNum} onClick={() => setActivePage(pageNum)} 
                      className={`text-lg font-bold transition-all hover:scale-110 w-10 h-10 flex items-center justify-center rounded-full ${activePage === pageNum ? 'bg-[#4CAF50] text-black shadow-lg' : 'text-[#555] hover:text-[#888] hover:bg-[#222]'}`}>
                      {pageNum + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <input type="text" value={newInput} onChange={(e) => setNewInput(e.target.value)} 
                  placeholder="공부 중 생긴 질문(Q) 또는 아이디어(Idea) 입력..." 
                  className="flex-1 bg-[#111] border border-[#333] rounded-xl p-4 text-white outline-none focus:border-[#4CAF50] transition-colors" />
                <button onClick={() => handleAdd('Q')} className="flex items-center gap-2 bg-[#ff4757] text-white px-6 py-4 rounded-xl font-bold hover:brightness-110 transition-all shadow-md shrink-0">
                  <MessageCircleQuestion size={20}/> Q 등록
                </button>
                <button onClick={() => handleAdd('I')} className="flex items-center gap-2 bg-[#2ed573] text-black px-6 py-4 rounded-xl font-bold hover:brightness-110 transition-all shadow-md shrink-0">
                  <BulbIcon size={20}/> Idea 등록
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}