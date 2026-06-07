import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { DownloadCloud, Plus, X, UploadCloud, AlertCircle } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export function SettingsView() {
  const { 
    trackedNames, addTrackedName, removeTrackedName,
    autoTagRules, addAutoTagRule, removeAutoTagRule,
    diaries
  } = useAppStore();

  const [newName, setNewName] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newTag, setNewTag] = useState('');

  const handleAddName = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      addTrackedName(newName.trim());
      setNewName('');
    }
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyword.trim() && newTag.trim()) {
      addAutoTagRule({ keyword: newKeyword.trim(), tag: newTag.trim() });
      setNewKeyword('');
      setNewTag('');
    }
  };

  const handleExportZip = async () => {
    if (diaries.length === 0) {
      alert('没有可以导出的日记');
      return;
    }
    
    const zip = new JSZip();
    
    diaries.forEach(diary => {
      // Obsidian frontmatter
      const frontmatter = `---
tags:
${diary.tags.map(t => `  - ${t}`).join('\n')}
date: ${diary.date}
---

`;
      const fileContent = frontmatter + diary.content;
      zip.file(`${diary.date}.md`, fileContent);
    });

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'obsidian_diaries_export.zip');
    } catch (error) {
      console.error('Export failed', error);
      alert('导出失败，请重试');
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-neutral-900 p-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        <header>
          <h2 className="text-2xl font-medium tracking-tight text-neutral-100 mb-2">
            设置与导出
          </h2>
          <p className="text-neutral-500 text-sm">自定义你的数据统计规则并管理本地数据。</p>
        </header>

        {/* 导出区域 */}
        <section className="bg-neutral-800/30 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-neutral-200 mb-4 flex items-center gap-2">
            <DownloadCloud className="w-5 h-5 text-indigo-400" />
            导出到 Obsidian
          </h3>
          <p className="text-sm text-neutral-400 mb-6">
            将所有日记导出为 Markdown 压缩包。解压后可直接拖入 Obsidian 仓库（Vault）中，自带 Frontmatter 标签格式。
          </p>
          <button 
            onClick={handleExportZip}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-md transition-colors text-sm font-medium"
          >
            <DownloadCloud className="w-4 h-4" />
            生成 ZIP 压缩包
          </button>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 人名管理 */}
          <section className="bg-neutral-800/30 border border-neutral-800 rounded-xl p-6 flex flex-col">
            <h3 className="text-lg font-medium text-neutral-200 mb-4">
              统计人名管理
            </h3>
            <p className="text-xs text-neutral-500 mb-6 flex-1">
              添加你想要在图表中重点跟踪出现频率的人名（如家人、同事、朋友）。
            </p>
            
            <form onSubmit={handleAddName} className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder="输入人名..." 
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 text-neutral-200 text-sm rounded-md px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
              />
              <button type="submit" className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-md transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {trackedNames.map(name => (
                <span key={name} className="flex items-center gap-1.5 bg-neutral-800 text-neutral-300 text-sm px-3 py-1.5 rounded-full">
                  {name}
                  <button onClick={() => removeTrackedName(name)} className="text-neutral-500 hover:text-red-400 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {trackedNames.length === 0 && (
                <span className="text-sm text-neutral-600">暂无跟踪名单。</span>
              )}
            </div>
          </section>

          {/* 自动标签规则 */}
          <section className="bg-neutral-800/30 border border-neutral-800 rounded-xl p-6 flex flex-col">
            <h3 className="text-lg font-medium text-neutral-200 mb-4">
              自动标签化规则
            </h3>
            <p className="text-xs text-neutral-500 mb-6 flex-1">
              当你在日记中输入特定关键词时，系统会自动为你打上对应的标签。
            </p>
            
            <form onSubmit={handleAddRule} className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder="输入关键词..." 
                value={newKeyword}
                onChange={e => setNewKeyword(e.target.value)}
                className="flex-1 w-1/2 bg-neutral-950 border border-neutral-800 text-neutral-200 text-sm rounded-md px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
                required
              />
              <span className="text-neutral-600 flex items-center">→</span>
              <input 
                type="text" 
                placeholder="触发标签名..." 
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                className="flex-1 w-1/2 bg-neutral-950 border border-neutral-800 text-neutral-200 text-sm rounded-md px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
                required
              />
              <button type="submit" className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-md transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-col gap-2 relative">
              {autoTagRules.map(rule => (
                <div key={rule.id} className="flex items-center justify-between bg-neutral-800/50 border border-neutral-800 text-sm px-3 py-2 rounded-md">
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-300">"{rule.keyword}"</span>
                    <span className="text-neutral-600 text-xs">触发标签</span>
                    <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">#{rule.tag}</span>
                  </div>
                  <button onClick={() => removeAutoTagRule(rule.id)} className="text-neutral-500 hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {autoTagRules.length === 0 && (
                <span className="text-sm text-neutral-600">暂无自动标签规则。</span>
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
