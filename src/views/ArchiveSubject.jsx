import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  ArrowLeft, Plus, ChevronDown, ChevronRight, 
  MessageCircleQuestion, Lightbulb as BulbIcon, 
  Trash2, Edit3, Eye 
} from 'lucide-react';

// 마크다운 및 수식 렌더링을 위한 라이브러리
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default function ArchiveSubject() {
  const { studyData, activeSubject, setCurrentView, updateStudyData, showToast, removeChapter, removeSection } = useStore();
  const [activeChapter, setActiveChapter] = useState('');
  const [activeSub, setActiveSub] = useState('');
  const [activePage, setActivePage] = useState(0);
  const [collapsedChaps, setCollapsedChaps] = useState({});
  const [newInput, setNewInput] = useState('');
  
  // [마크다운/수식] 작성/미리보기 토글 및 실시간 타이핑 렌더링용 로컬 상태
  const [isPreview, setIsPreview] = useState(false);
  const [localContent, setLocalContent] = useState('');

  const currentNoteData = activeSub ? studyData[activeSubject]?.[activeChapter]?.[activeSub] : null;

  // 챕터나 소목차, 페이지가 바뀔 때마다 로컬 컨텐츠 동기화
  useEffect(() => {
    if (currentNoteData) {
      setLocalContent(currentNoteData.pages[activePage] || '');
    }
  }, [activeChapter, activeSub, activePage, currentNoteData]);

  // 입력 시 로컬 상태와 전역 Zustand 스토어를 동시에 업데이트
  const handleContentChange = (e) => {
    const val = e.target.value;
    setLocalContent(val);
    updateStudyData(d => {
      d[activeSubject][activeChapter][activeSub].pages[activePage] = val;
    });
  };

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
    <div className="w-full max-w-[1400px] mx-auto px-6 h-screen flex flex-col animate-[fadeIn_0.3s_ease-out] min-w-[1024px]">
      
      <div className="mt-8 mb-6">
        <button onClick={() => setCurrentView('archive')} className="flex items-center gap-2 px-5 py-2.5 bg-[#222] text-white border border-[#444] rounded-xl hover:bg-[#333] transition-all font-bold w-fit shadow-md">
          <ArrowLeft size={18} /> 과목 목록
        </button>
      </div>

      <div className="flex gap-6 flex-1 pb-8 min-h-0">
        
        {/* 목차 사이드바 */}
        <div className="bg-[#1a1a1a] border border-[#2a2a40] rounded-2xl w-[360px] overflow-y-auto custom-scroll p-6 shadow-xl flex flex-col shrink-0">
          <h2 className="border-b border-[#333] pb-4 text-[#4CAF50] text-xl font-bold flex justify-between items-center mb-5 shrink-0">
            <span className="truncate pr-2">{activeSubject}</span>
            <button 
              onClick={() => { const c = window.prompt("새 챕터(폴더) 이름을 입력하세요:"); if(c) updateStudyData(d => { d[activeSubject][c] = {}; }); }}
              className="shrink-0 flex items-center text-sm font-bold text-black bg-[#4CAF50] hover:bg-[#45a049] px-3 py-1.5 rounded-lg transition-transform hover:scale-105"
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
                    <div key={sub} onClick={() => { setActiveChapter(chap); setActiveSub(sub); setActivePage(0); setIsPreview(false); }} 
                      className={`group/sub flex items-center justify-between p-3 ml-2 rounded-xl cursor-pointer transition-all mb-3 ${isActive ? 'bg-[#2a2a40] text-[#4CAF50] font-bold shadow-md border border-[#4CAF50]/50' : 'bg-[#1a1a1a] hover:bg-[#252525] text-[#ccc] border border-transparent hover:border-[#444]'}`}>
                      <span className="text-sm flex-1 truncate pr-2">{sub}</span>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={(e) => handleDeleteSection(e, chap, sub)} className="text-[#777] hover:text-[#ff4757] transition-colors p-1.5 rounded-md hover:bg-[#333]">
                          <Trash2 size={16}/>
                        </button>
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
            <div className="flex-1 flex items-center justify-center text-[#888] text-lg bg-[#111] rounded-2xl border border-dashed border-[#333]">
              좌측 목차에서 소목차를 선택해 에디터를 여세요.
            </div>
          ) : (
            <>
              {/* 타이틀 및 토글 버튼 영역 (겹침 방지를 위해 헤더를 좌우로 분리) */}
              <div className="flex justify-between items-end mb-6 shrink-0">
                <div className="text-left flex-1 min-w-0 pr-4">
                  <h2 className="text-[#888] text-sm mb-2 bg-[#222] inline-block px-3 py-1 rounded-full">{activeChapter}</h2>
                  <h1 className="text-[#4CAF50] text-3xl font-bold truncate">{activeSub}</h1>
                </div>

                {/* 뷰 토글 버튼을 텍스트 밖으로 완전히 빼내어 절대 가려지지 않음 */}
                <div className="flex gap-2 bg-[#0a0a0a] p-1.5 rounded-xl border border-[#333] shadow-lg shrink-0">
                  <button onClick={() => setIsPreview(false)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${!isPreview ? 'bg-[#4CAF50] text-black shadow-md' : 'text-[#888] hover:text-white hover:bg-[#222]'}`}>
                    <Edit3 size={16} /> Write
                  </button>
                  <button onClick={() => setIsPreview(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isPreview ? 'bg-[#4CAF50] text-black shadow-md' : 'text-[#888] hover:text-white hover:bg-[#222]'}`}>
                    <Eye size={16} /> Preview
                  </button>
                </div>
              </div>

              {/* 에디터 및 마크다운 뷰어 영역 (방해물 없음) */}
              <div className="flex-1 flex flex-col bg-[#111] rounded-2xl border border-[#333] overflow-hidden mb-6 shadow-inner relative group min-h-0">
                {isPreview ? (
                  <div className="flex-1 p-8 overflow-y-auto custom-scroll text-lg leading-relaxed 
                                  [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-[#4CAF50] [&_h1]:mb-4 [&_h1]:border-b [&_h1]:border-[#333] [&_h1]:pb-2
                                  [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mb-3 [&_h2]:mt-6
                                  [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[#ccc] [&_h3]:mb-3 [&_h3]:mt-4
                                  [&_p]:mb-4 [&_p]:text-[#e0e0e0]
                                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 
                                  [&_li]:mb-1.5
                                  [&_blockquote]:border-l-4 [&_blockquote]:border-[#4CAF50] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#aaa] [&_blockquote]:bg-[#1a1a1a] [&_blockquote]:py-2 [&_blockquote]:rounded-r-lg
                                  [&_pre]:bg-[#1a1a1a] [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-[#333] [&_pre]:overflow-x-auto [&_pre]:mb-4 [&_pre]:shadow-inner
                                  [&_code]:bg-[#2a2a2a] [&_code]:text-[#ff4757] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_pre_code]:bg-transparent [&_pre_code]:text-[#a6e22e] [&_pre_code]:px-0
                                  [&_a]:text-[#3498db] [&_a]:underline
                                  break-words whitespace-pre-wrap">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {localContent || '*작성된 노트가 없습니다.*'}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <textarea 
                    className="flex-1 bg-transparent text-white border-none p-8 text-lg resize-none outline-none custom-scroll leading-relaxed placeholder:text-[#555]" 
                    value={localContent} 
                    onChange={handleContentChange}
                    placeholder="마크다운 문법과 $$수식$$을 자유롭게 기록하세요... (우측 상단 Preview를 눌러 렌더링 확인)" 
                  />
                )}

                <div className="flex justify-center gap-6 p-4 bg-[#0a0a0a] border-t border-[#333] shrink-0">
                  {[0, 1, 2, 3, 4].map(pageNum => (
                    <button key={pageNum} onClick={() => { setActivePage(pageNum); setIsPreview(false); }} 
                      className={`text-lg font-bold transition-all hover:scale-110 w-10 h-10 flex items-center justify-center rounded-full ${activePage === pageNum ? 'bg-[#4CAF50] text-black shadow-[0_0_10px_rgba(76,175,80,0.4)]' : 'text-[#555] hover:text-[#888] hover:bg-[#222]'}`}>
                      {pageNum + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 shrink-0">
                <input type="text" value={newInput} onChange={(e) => setNewInput(e.target.value)} 
                  placeholder="공부 중 생긴 질문(Q) 또는 아이디어(Idea) 입력..." 
                  className="flex-1 bg-[#111] border border-[#333] rounded-xl p-4 text-white outline-none focus:border-[#4CAF50] transition-colors" />
                <button onClick={() => handleAdd('Q')} className="flex items-center justify-center gap-2 bg-[#ff4757] text-white px-6 py-4 rounded-xl font-bold hover:brightness-110 transition-all shadow-md shrink-0">
                  <MessageCircleQuestion size={20}/> Q 등록
                </button>
                <button onClick={() => handleAdd('I')} className="flex items-center justify-center gap-2 bg-[#2ed573] text-black px-6 py-4 rounded-xl font-bold hover:brightness-110 transition-all shadow-md shrink-0">
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