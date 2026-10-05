import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Clock, BookOpen, Lightbulb, ClipboardList, Plus, Check, Trash2, Pencil, X, CheckCircle, FileText, Download, Upload } from 'lucide-react';

export default function Dashboard() {
  const { studyData, dueDates, dDays, completedSubjects, setCurrentView, addDueDate, removeDueDate, editDueDate, addDDay, removeDDay, editDDay, showToast, overwriteState } = useStore();
  
  const [newDueTitle, setNewDueTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDDayTitle, setNewDDayTitle] = useState('');
  const [newDDayDate, setNewDDayDate] = useState('');

  const [editingDue, setEditingDue] = useState(null);
  const [editDueData, setEditDueData] = useState({ title: '', date: '' });
  
  const [editingDDay, setEditingDDay] = useState(null);
  const [editDDayData, setEditDDayData] = useState({ title: '', date: '' });

  const fileInputRef = useRef(null);

  const getDayStatus = (targetDateStr) => {
    if (!targetDateStr) return { text: '', diff: 0 };
    const today = new Date(); today.setHours(0,0,0,0);
    const target = new Date(targetDateStr); target.setHours(0,0,0,0);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    
    if (diff > 0) return { text: `D-${diff}`, color: diff <= 3 ? 'text-[#ff4757]' : 'text-[#2ed573]', diff };
    if (diff === 0) return { text: 'D-Day', color: 'text-[#ff4757]', diff };
    return { text: `D+${Math.abs(diff)}`, color: 'text-[#888]', diff }; 
  };

  const handleAddDue = () => { if(newDueTitle && newDueDate) { addDueDate({ id: Date.now(), title: newDueTitle, date: newDueDate }); setNewDueTitle(''); setNewDueDate(''); showToast('기한이 등록되었습니다.'); } };
  const handleAddDDay = () => { if(newDDayTitle && newDDayDate) { addDDay({ id: Date.now(), title: newDDayTitle, date: newDDayDate }); setNewDDayTitle(''); setNewDDayDate(''); showToast('D-Day가 등록되었습니다.'); } };
  const saveDueEdit = (id) => { editDueDate(id, editDueData.title, editDueData.date); setEditingDue(null); showToast('기한이 수정되었습니다.'); };
  const saveDDayEdit = (id) => { editDDay(id, editDDayData.title, editDDayData.date); setEditingDDay(null); showToast('D-Day가 수정되었습니다.'); };

  const activeDDays = dDays.filter(item => getDayStatus(item.date).diff >= 0);

  let unresolvedProblemCount = 0;
  Object.values(studyData || {}).forEach(subject => {
    Object.values(subject || {}).forEach(chapter => {
      Object.values(chapter || {}).forEach(section => {
        unresolvedProblemCount += (section.problems || []).filter(p => !p.resolved).length;
      });
    });
  });

  // [유지] JSON 백업 내보내기 기능
  const handleExportData = () => {
    const backupData = { studyData, dueDates, dDays, completedSubjects };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SecondBrain_Backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('데이터가 파일로 안전하게 백업되었습니다.');
  };

  // [유지] JSON 파일 불러오기 기능
  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if(imported.studyData) {
          overwriteState(imported);
          showToast('데이터가 성공적으로 복구되었습니다!');
        } else {
          alert('유효한 백업 파일이 아닙니다.');
        }
      } catch (error) {
        alert('파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // 동일한 파일 다시 선택 가능하도록 초기화
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 min-h-screen flex flex-col py-10 animate-[fadeIn_0.3s_ease-out] relative min-w-[1024px]">
      
      {/* 헤더 및 백업/복구 버튼 영역 */}
      <div className="flex justify-between items-center mb-12">
        <div className="w-[120px]"></div> {/* 중앙 정렬을 위한 더미 공간 */}
        <h1 className="text-4xl font-extrabold tracking-tight text-white m-0">🧠 My Second Brain</h1>
        <div className="flex gap-3 w-[120px] justify-end">
          <button onClick={handleExportData} title="데이터 백업하기" className="p-2.5 bg-[#222] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-black border border-[#4CAF50]/30 rounded-xl transition-all shadow-md">
            <Download size={20} />
          </button>
          <button onClick={() => fileInputRef.current?.click()} title="데이터 복구하기" className="p-2.5 bg-[#222] text-[#3498db] hover:bg-[#3498db] hover:text-black border border-[#3498db]/30 rounded-xl transition-all shadow-md">
            <Upload size={20} />
          </button>
          <input type="file" accept=".json" ref={fileInputRef} onChange={handleImportData} className="hidden" />
        </div>
      </div>
      
      {/* 강제 3열 고정 (grid-cols-3) */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-[#1a1a1a] border border-[#2a2a40] p-6 rounded-2xl shadow-xl flex flex-col h-[340px]">
          <h3 className="flex items-center gap-3 border-b border-[#333] pb-4 mb-5 text-[#4CAF50] text-xl font-bold">
            <Clock size={22} /> Due date
          </h3>
          <div className="flex gap-2 mb-5">
            <input type="text" value={newDueTitle} onChange={e => setNewDueTitle(e.target.value)} placeholder="과제명 입력" className="flex-1 bg-[#111] border border-[#333] rounded-xl px-4 py-2 text-sm outline-none focus:border-[#4CAF50] transition-colors" />
            <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className="w-[130px] bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4CAF50] cursor-pointer" />
            <button onClick={handleAddDue} className="bg-[#4CAF50] text-black w-10 h-10 rounded-xl hover:bg-[#45a049] transition-colors flex items-center justify-center shrink-0"><Plus size={20}/></button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scroll pr-2 flex flex-col gap-3">
            {dueDates.map(item => {
              const status = getDayStatus(item.date);
              if (editingDue === item.id) {
                return (
                  <div key={item.id} className="flex flex-col gap-2 p-3 bg-white/10 rounded-xl border border-[#4CAF50]">
                    <div className="flex gap-2">
                      <input type="text" value={editDueData.title} onChange={e => setEditDueData({...editDueData, title: e.target.value})} className="flex-1 bg-[#111] border border-[#333] rounded-lg px-2 py-1 text-sm outline-none focus:border-[#4CAF50]" />
                      <input type="date" value={editDueData.date} onChange={e => setEditDueData({...editDueData, date: e.target.value})} className="w-[110px] bg-[#111] border border-[#333] rounded-lg px-2 py-1 text-sm outline-none focus:border-[#4CAF50]" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingDue(null)} className="p-1.5 bg-[#333] text-white hover:bg-red-500 rounded-lg transition-colors"><X size={14} /></button>
                      <button onClick={() => saveDueEdit(item.id)} className="p-1.5 bg-[#4CAF50] text-black hover:bg-[#45a049] rounded-lg transition-colors"><Check size={14} /></button>
                    </div>
                  </div>
                );
              }
              return (
                <div key={item.id} className="group flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                  <span className={`flex-1 text-base truncate ${status.diff < 0 ? 'text-[#888] line-through' : 'text-gray-200'}`}>{item.title}</span>
                  <b className={`text-sm font-bold ${status.color}`}>{status.text}</b>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingDue(item.id); setEditDueData({ title: item.title, date: item.date }); }} className="p-1.5 text-[#aaa] hover:text-white hover:bg-[#333] rounded-lg transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => removeDueDate(item.id)} className="p-1.5 text-[#ff4757] hover:text-white hover:bg-[#ff4757] rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div onClick={() => setCurrentView('problems')} className="bg-gradient-to-br from-[#1e272e] to-[#2f3640] border border-[#2a2a40] p-6 rounded-2xl shadow-xl hover:-translate-y-2 transition-all cursor-pointer flex flex-col h-[340px] group">
          <h3 className="flex items-center gap-3 border-b border-yellow-500/30 pb-4 mb-5 text-[#fbc531] text-xl font-bold">
            <ClipboardList size={22} /> Non-solved problem
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <span className={`text-7xl font-black group-hover:scale-110 transition-transform ${unresolvedProblemCount > 0 ? 'text-[#ff4757]' : 'text-[#2ed573]'}`}>
              {unresolvedProblemCount}
            </span>
            <span className="text-base text-[#fbc531]/70 mt-6 font-medium bg-[#fbc531]/10 px-4 py-2 rounded-full">
              {unresolvedProblemCount > 0 ? '클릭하여 문제 해결하기' : '모든 문제를 해결했습니다!'}
            </span>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a40] p-6 rounded-2xl shadow-xl flex flex-col h-[340px]">
          <h3 className="flex items-center gap-3 border-b border-[#333] pb-4 mb-5 text-[#4CAF50] text-xl font-bold">
            <Clock size={22} /> D-Day
          </h3>
          <div className="flex gap-2 mb-5">
            <input type="text" value={newDDayTitle} onChange={e => setNewDDayTitle(e.target.value)} placeholder="시험명 입력" className="flex-1 bg-[#111] border border-[#333] rounded-xl px-4 py-2 text-sm outline-none focus:border-[#4CAF50] transition-colors" />
            <input type="date" value={newDDayDate} onChange={e => setNewDDayDate(e.target.value)} className="w-[130px] bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4CAF50] cursor-pointer" />
            <button onClick={handleAddDDay} className="bg-[#4CAF50] text-black w-10 h-10 rounded-xl hover:bg-[#45a049] transition-colors flex items-center justify-center shrink-0"><Plus size={20}/></button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scroll pr-2 flex flex-col gap-3">
            {activeDDays.length === 0 && <p className="text-[#555] text-center mt-4 text-sm">등록된 D-Day가 없습니다.</p>}
            {activeDDays.map(item => {
              const status = getDayStatus(item.date);
              if (editingDDay === item.id) {
                return (
                  <div key={item.id} className="flex flex-col gap-2 p-3 bg-white/10 rounded-xl border border-[#4CAF50]">
                    <div className="flex gap-2">
                      <input type="text" value={editDDayData.title} onChange={e => setEditDDayData({...editDDayData, title: e.target.value})} className="flex-1 bg-[#111] border border-[#333] rounded-lg px-2 py-1 text-sm outline-none focus:border-[#4CAF50]" />
                      <input type="date" value={editDDayData.date} onChange={e => setEditDDayData({...editDDayData, date: e.target.value})} className="w-[110px] bg-[#111] border border-[#333] rounded-lg px-2 py-1 text-sm outline-none focus:border-[#4CAF50]" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingDDay(null)} className="p-1.5 bg-[#333] text-white hover:bg-red-500 rounded-lg transition-colors"><X size={14} /></button>
                      <button onClick={() => saveDDayEdit(item.id)} className="p-1.5 bg-[#4CAF50] text-black hover:bg-[#45a049] rounded-lg transition-colors"><Check size={14} /></button>
                    </div>
                  </div>
                );
              }
              return (
                <div key={item.id} className="group flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                  <span className="text-base text-gray-200 truncate pr-2">{item.title}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <b className={`text-base font-bold ${status.color}`}>{status.text}</b>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingDDay(item.id); setEditDDayData({ title: item.title, date: item.date }); }} className="p-1.5 text-[#aaa] hover:text-white hover:bg-[#333] rounded-lg transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => removeDDay(item.id)} className="p-1.5 text-[#ff4757] hover:text-white hover:bg-[#ff4757] rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 강제 4열 고정 (grid-cols-4) */}
      <div className="grid grid-cols-4 gap-6 flex-1 pb-10">
        <div onClick={() => setCurrentView('archive')} className="bg-[#1a1a1a] border border-[#2a2a40] rounded-2xl flex flex-col justify-center items-center cursor-pointer hover:border-[#4CAF50] hover:-translate-y-2 transition-all shadow-lg p-6">
          <BookOpen size={40} color="#4CAF50" className="mb-4"/>
          <h2 className="text-xl font-bold text-gray-200">Study Archive</h2>
        </div>
        <div onClick={() => setCurrentView('qna')} className="bg-[#1a1a1a] border border-[#2a2a40] rounded-2xl flex flex-col justify-center items-center cursor-pointer hover:border-[#ff4757] hover:-translate-y-2 transition-all shadow-lg p-6">
          <Lightbulb size={40} color="#ff4757" className="mb-4"/>
          <h2 className="text-xl font-bold text-gray-200">Question & Idea</h2>
        </div>
        <div onClick={() => setCurrentView('completed')} className="bg-[#1a1a1a] border border-[#2a2a40] rounded-2xl flex flex-col justify-center items-center cursor-pointer hover:border-[#3498db] hover:-translate-y-2 transition-all shadow-lg p-6">
          <CheckCircle size={40} color="#3498db" className="mb-4"/>
          <h2 className="text-xl font-bold text-gray-200">Completed</h2>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a40] rounded-2xl flex flex-col justify-center items-center opacity-50 shadow-lg p-6 cursor-not-allowed">
          <FileText size={40} color="#888" className="mb-4"/>
          <h2 className="text-xl font-bold text-gray-400 text-center">Insight &<br/>Paper Review</h2>
        </div>
      </div>
    </div>
  );
}