import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      currentView: 'dashboard',
      activeSubject: '회로이론',
      qnaType: 'Q',
      
      toastMessage: '',
      showToast: (msg) => {
        set({ toastMessage: msg });
        setTimeout(() => set({ toastMessage: '' }), 2500);
      },

      dueDates: [{ id: 1, title: 'SPICE 오류 수정', date: '2026-10-06' }],
      dDays: [{ id: 1, title: '전기기사 필기', date: '2026-11-03' }],
      
      // 완료된 과목 이름을 담는 배열
      completedSubjects: [],

      studyData: { 
        '회로이론': { 
          'Chap 1. 기본 개념': { 
            '1.1 전하와 전류': { status: 'X', pages: ['','','','',''], questions: [], ideas: [], problems: [] } 
          } 
        } 
      },

      setCurrentView: (view) => set({ currentView: view }),
      setActiveSubject: (sub) => set({ activeSubject: sub }),
      setQnaType: (type) => set({ qnaType: type }), 
      
      addDueDate: (newItem) => set((state) => ({ dueDates: [...state.dueDates, newItem] })),
      removeDueDate: (id) => set((state) => ({ dueDates: state.dueDates.filter(d => d.id !== id) })),
      editDueDate: (id, newTitle, newDate) => set((state) => ({
        dueDates: state.dueDates.map(d => d.id === id ? { ...d, title: newTitle, date: newDate } : d)
      })),

      addDDay: (newItem) => set((state) => ({ dDays: [...state.dDays, newItem] })),
      removeDDay: (id) => set((state) => ({ dDays: state.dDays.filter(d => d.id !== id) })),
      editDDay: (id, newTitle, newDate) => set((state) => ({
        dDays: state.dDays.map(d => d.id === id ? { ...d, title: newTitle, date: newDate } : d)
      })),
      
      updateStudyData: (updater) => set((state) => {
        const newData = JSON.parse(JSON.stringify(state.studyData));
        updater(newData);
        return { studyData: newData };
      }),

      // [신규] 과목 완료 / 복구 토글 기능
      toggleSubjectComplete: (subjectName) => set((state) => {
        const isCompleted = state.completedSubjects.includes(subjectName);
        if (isCompleted) {
          return { completedSubjects: state.completedSubjects.filter(s => s !== subjectName) };
        } else {
          return { completedSubjects: [...state.completedSubjects, subjectName] };
        }
      }),

      addSubject: (subjectName) => set((state) => {
        if (state.studyData[subjectName]) return state; 
        return { studyData: { ...state.studyData, [subjectName]: {} } };
      }),

      // [신규] 완전 삭제 기능들 (과목, 챕터, 소목차)
      removeSubject: (subjectName) => set((state) => {
        const newData = { ...state.studyData };
        delete newData[subjectName];
        return { 
          studyData: newData,
          completedSubjects: state.completedSubjects.filter(s => s !== subjectName)
        };
      }),

      removeChapter: (subjectName, chapterName) => set((state) => {
        const newData = JSON.parse(JSON.stringify(state.studyData));
        delete newData[subjectName][chapterName];
        return { studyData: newData };
      }),

      removeSection: (subjectName, chapterName, sectionName) => set((state) => {
        const newData = JSON.parse(JSON.stringify(state.studyData));
        delete newData[subjectName][chapterName][sectionName];
        return { studyData: newData };
      }),

      getSubjectProgress: (subjectName) => {
        const data = get().studyData[subjectName];
        if (!data) return 0;
        let totalSections = 0; let completedSections = 0;
        Object.values(data).forEach(chap => {
          Object.values(chap).forEach(sec => { totalSections++; if (sec.status === 'O') completedSections++; });
        });
        if (totalSections === 0) return 0;
        return Math.round((completedSections / totalSections) * 100);
      }
    }),
    { name: 'second-brain-storage' }
  )
);