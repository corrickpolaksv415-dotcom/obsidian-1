import { useState, useMemo } from 'react';
import { useAppStore } from '../lib/store';
import { format } from 'date-fns';
import { Plus, Search, Tag, Trash2 } from 'lucide-react';
import { Diary } from '../types';

export function DiaryView() {
  const { diaries, addDiary, updateDiary, deleteDiary, autoTagRules } = useAppStore();
  const [selectedId, setSelectedId] = useState<string | null>(diaries[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedDiary = diaries.find(d => d.id === selectedId);

  const filteredDiaries = useMemo(() => {
    if (!searchQuery.trim()) return diaries;
    const q = searchQuery.toLowerCase();
    return diaries.filter(d => 
      d.content.toLowerCase().includes(q) || 
      d.date.includes(q) ||
      d.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }, [diaries, searchQuery]);

  const handleCreateDraft = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const existing = diaries.find(d => d.date === today);
    if (existing) {
      setSelectedId(existing.id);
      return;
    }
    const newId = Date.now().toString();
    addDiary({ date: today, content: '', tags: [] });
    // After adding, it will be at the top of the array
    // Wait for render or just manually set it:
    setTimeout(() => {
      setSelectedId(newId);
    }, 10);
  };

  const handleContentChange = (val: string) => {
    if (!selectedId) return;

    // Auto tag processing
    let updatedTags = Array.from(selectedDiary?.tags || []);
    
    // Check auto tag rules
    autoTagRules.forEach(rule => {
      if (val.includes(rule.keyword) && !updatedTags.includes(rule.tag)) {
        updatedTags.push(rule.tag);
      }
    });

    // Also parse hashtags dynamically from "#text " 
    const hashtagRegex = /#([\w\u4e00-\u9fa5]+)/g;
    let match;
    while ((match = hashtagRegex.exec(val)) !== null) {
      const tag = match[1];
      if (!updatedTags.includes(tag)) {
        updatedTags.push(tag);
      }
    }

    updateDiary(selectedId, { content: val, tags: updatedTags });
  };

  const removeTag = (tagToRemove: string) => {
    if (!selectedId || !selectedDiary) return;
    const newTags = selectedDiary.tags.filter(t => t !== tagToRemove);
    updateDiary(selectedId, { tags: newTags });
  };

  return (
    <div className="flex h-full bg-neutral-900">
      {/* List Pane */}
      <div className="w-[300px] border-r border-neutral-800 flex flex-col bg-neutral-900/50">
        <div className="p-4 border-b border-neutral-800">
          <button 
            onClick={handleCreateDraft}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            新建今日日记
          </button>
          
          <div className="mt-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
            <input 
              type="text" 
              placeholder="搜索日记或标签..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-800 text-neutral-200 text-sm rounded-md pl-9 pr-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {filteredDiaries.map(diary => (
            <div 
              key={diary.id}
              onClick={() => setSelectedId(diary.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedId === diary.id 
                  ? 'bg-neutral-800 border-l-2 border-indigo-500' 
                  : 'hover:bg-neutral-800/60 border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-neutral-200">{diary.date}</span>
              </div>
              <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                {diary.content || '无内容...'}
              </p>
              {diary.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {diary.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] bg-neutral-700/50 text-neutral-400 px-1.5 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                  {diary.tags.length > 3 && (
                    <span className="text-[10px] text-neutral-500 px-1.5 py-0.5">+{diary.tags.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          ))}
          {filteredDiaries.length === 0 && (
            <div className="text-center text-xs text-neutral-500 py-8">
              没有找到相关日记
            </div>
          )}
        </div>
      </div>

      {/* Editor Pane */}
      <div className="flex-1 flex flex-col h-full bg-neutral-900">
        {selectedDiary ? (
          <>
            <div className="px-8 py-6 border-b border-neutral-800 flex items-center justify-between">
              <h2 className="text-xl font-medium tracking-tight text-neutral-100 flex items-center gap-3">
                {selectedDiary.date}
              </h2>
              <button 
                onClick={() => {
                  if (confirm('确定要删除这篇日记吗？')) {
                    deleteDiary(selectedDiary.id);
                    setSelectedId(null);
                  }
                }}
                className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded transition-colors tooltip"
                title="删除日记"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden relative">
              <textarea
                value={selectedDiary.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="在此输入日记内容... 输入关键词自动打标签，或使用 #标签 添加"
                className="flex-1 w-full p-8 bg-transparent text-neutral-200 text-base leading-loose resize-none outline-none font-sans"
              />
            </div>

            {selectedDiary.tags.length > 0 && (
               <div className="px-8 py-4 border-t border-neutral-800 bg-neutral-950/30 flex flex-wrap gap-2 items-center">
                 <Tag className="w-4 h-4 text-neutral-500 mr-1" />
                 {selectedDiary.tags.map(tag => (
                   <span key={tag} className="flex items-center gap-1 text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded-md">
                     #{tag}
                     <button onClick={() => removeTag(tag)} className="hover:text-white transition-colors">
                       &times;
                     </button>
                   </span>
                 ))}
               </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-600 flex-col gap-4">
            <BookOpen className="w-12 h-12 opacity-20" />
            <p>选择一篇日记或者新建今日日记</p>
          </div>
        )}
      </div>
    </div>
  );
}
