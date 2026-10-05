import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Clock, BookOpen, Lightbulb, ClipboardList, Plus, Check, Trash2, Pencil, X, CheckCircle, FileText } from 'lucide-react';

export default function Dashboard() {
  // studyData 상태를 가져오도록 추가
  const { studyData, dueDates, dDays, setCurrentView, addDueDate, removeDueDate, editDueDate, addDDay, removeDDay, editDDay, showToast } = useStore();
  
  const [newDueTitle, setNewDueTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDDayTitle, setNewDDayTitle] = useState('');
  const [newDDayDate, setNewDDayDate] = useState('');

  const [editingDue, setEditingDue] = useState(null);
  const [editDueData, setEditDueData] = useState({ title: '', date: '' });
  
  const [editingDDay, setEditingDDay] = useState(null);
  const [editDDayData, setEditDDayData] = useState({ title: '', date: '' });

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

  // [핵심] 미해결 문제 개수 자동 계산 엔진
  let unresolvedProblemCount = 0;
  Object.values(studyData || {}).forEach(subject => {
    Object.values(subject || {}).forEach(chapter => {
      Object.values(chapter || {}).forEach(section => {
        unresolvedProblemCount += (section.problems || []).filter(p => !p.resolved).length;
      });
    });
  });

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 min-h-screen flex flex-col py-10 animate-[fadeIn_0.3s_ease-out]">
      <h1 className="text-center text-4xl font-extrabold tracking-tight mb-12 text-white">🧠 My Second Brain</h1>
      
      <div className="grid grid-cols-3 gap-6 mb-10">
        {/* Due Date 카드 */}
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

        {/* 미해결 문제 카드 - 이제 동적 데이터 연동됨! */}
        <div onClick={() => setCurrentView('problems')} className="bg-gradient-to-br from-[#1e272e] to-[#2f3640] border border-[#2a2a40] p-6 rounded-2xl shadow-xl hover:-translate-y-2 transition-all cursor-pointer flex flex-col h-[340px] group">
          <h3 className="flex items-center gap-3 border-b border-yellow-500/30 pb-4 mb-5 text-[#fbc531] text-xl font-bold">
            <ClipboardList size={22} /> Non-solved problem
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* 하드코딩 3을 없애고 계산된 카운트 변수를 삽입 */}
            <span className={`text-7xl font-black group-hover:scale-110 transition-transform ${unresolvedProblemCount > 0 ? 'text-[#ff4757]' : 'text-[#2ed573]'}`}>
              {unresolvedProblemCount}
            </span>
            <span className="text-base text-[#fbc531]/70 mt-6 font-medium bg-[#fbc531]/10 px-4 py-2 rounded-full">
              {unresolvedProblemCount > 0 ? '클릭하여 문제 해결하기' : '모든 문제를 해결했습니다!'}
            </span>
          </div>
        </div>

        {/* D-Day 카드 */}
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