import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Diary, AutoTagRule } from '../types';
import { format, subDays } from 'date-fns';

const defaultMockDiaries: Diary[] = [
  {
    id: '1',
    date: format(new Date(), 'yyyy-MM-dd'),
    content: '今天和小明一起去吃了火锅，感觉很不错。项目的进展也很顺利，完成了一个重要的模块。#开发 #聚餐',
    tags: ['开发', '聚餐']
  },
  {
    id: '2',
    date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    content: '张三提到了明年的计划，我觉得很有启发。晚上读了一会儿 Obsidian 的文档。',
    tags: ['计划']
  },
  {
    id: '3',
    date: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    content: '今天感觉有点累，李四帮忙处理了一些工作。天气不错，但没什么心情出去。#心情',
    tags: ['心情']
  },
  {
    id: '4',
    date: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    content: '小明和张三因为一点小事争论起来，我在场听了听并没有发表意见。继续推进#开发 任务。',
    tags: ['开发']
  }
];

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [diaries, setDiaries] = useState<Diary[]>(() => {
    const saved = localStorage.getItem('obsidian_diaries');
    return saved ? JSON.parse(saved) : defaultMockDiaries;
  });

  const [trackedNames, setTrackedNames] = useState<string[]>(() => {
    const saved = localStorage.getItem('obsidian_tracked_names');
    return saved ? JSON.parse(saved) : ['小明', '张三', '李四'];
  });

  const [autoTagRules, setAutoTagRules] = useState<AutoTagRule[]>(() => {
    const saved = localStorage.getItem('obsidian_auto_tags');
    return saved ? JSON.parse(saved) : [
      { id: '1', keyword: '工作', tag: '工作' },
      { id: '2', keyword: '学习', tag: '学习' },
      { id: '3', keyword: '小明', tag: '朋友' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('obsidian_diaries', JSON.stringify(diaries));
  }, [diaries]);

  useEffect(() => {
    localStorage.setItem('obsidian_tracked_names', JSON.stringify(trackedNames));
  }, [trackedNames]);

  useEffect(() => {
    localStorage.setItem('obsidian_auto_tags', JSON.stringify(autoTagRules));
  }, [autoTagRules]);

  const addDiary = (diaryData: Omit<Diary, 'id'>) => {
    const newDiary: Diary = { ...diaryData, id: Date.now().toString() };
    setDiaries((prev) => [newDiary, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const updateDiary = (id: string, updates: Partial<Diary>) => {
    setDiaries((prev) => prev.map((d) => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDiary = (id: string) => {
    setDiaries((prev) => prev.filter((d) => d.id !== id));
  };

  const addTrackedName = (name: string) => {
    if (!trackedNames.includes(name)) {
      setTrackedNames((prev) => [...prev, name]);
    }
  };

  const removeTrackedName = (name: string) => {
    setTrackedNames((prev) => prev.filter((n) => n !== name));
  };

  const addAutoTagRule = (ruleData: Omit<AutoTagRule, 'id'>) => {
    const newRule: AutoTagRule = { ...ruleData, id: Date.now().toString() };
    setAutoTagRules((prev) => [...prev, newRule]);
  };

  const removeAutoTagRule = (id: string) => {
    setAutoTagRules((prev) => prev.filter((r) => r.id !== id));
  };

  const importDiaries = (imported: Diary[]) => {
    // Basic deduplication based on date
    setDiaries((prev) => {
      const existingDates = new Set(prev.map(d => d.date));
      const newD = imported.filter(d => !existingDates.has(d.date));
      const combined = [...prev, ...newD];
      return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }

  return (
    <AppContext.Provider value={{
      diaries, trackedNames, autoTagRules,
      addDiary, updateDiary, deleteDiary,
      addTrackedName, removeTrackedName,
      addAutoTagRule, removeAutoTagRule,
      importDiaries
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
