import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { DownloadCloud, Plus, X, UploadCloud, AlertCircle } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export function SettingsView() {
  const { 
    trackedNames, addTrackedName, removeTrackedName,
    autoTagRules, addAutoTagRule, removeAutoTagRule,
    autoTagNames, setAutoTagNames,
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
    <div className="flex-1 h-full overflow-y-auto bg-transparent p-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        <header>
          <h2 className="text-2xl font-bold tracking-tight text-[#202020] mb-2">
            设置与导出
          </h2>
          <p className="text-[#808080] text-sm">自定义你的数据统计规则并管理本地数据。</p>
        </header>

        {/* 导出区域 */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm p-6 mb-8 mt-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C4DFF] opacity-5 rounded-bl-full" />
          <h3 className="text-xl font-bold text-[#202020] mb-4 flex items-center gap-2">
            <DownloadCloud className="w-6 h-6 text-[#7C4DFF]" />
            下载原生 Obsidian 插件
          </h3>
          <p className="text-sm text-[#808080] mb-6 max-w-2xl leading-relaxed">
            此在线面板为插件和数据洞察预览图。系统已为您自动构建了真正的 <strong>Obsidian 插件源码包</strong>。请点击下方按钮下载 <code>diary-insight-plugin.zip</code>。
            <br/><br/>
            <strong>安装方法：</strong>直接解压该文件，将包含 <code>main.js</code> 等文件的 <strong><code>diary-insight</code></strong> 文件夹，完整放入你本地 Obsidian 笔记库的 <code>.obsidian/plugins/</code> 目录中。最终目录结构必须是 <code>.obsidian/plugins/diary-insight/main.js</code>，然后在 Obsidian 设置中重启并开启此插件即可。
          </p>
          <div className="flex gap-4">
            <a 
              href="/diary-insight-plugin.zip" 
              download 
              className="flex items-center gap-2 bg-[#7C4DFF] hover:bg-[#6839e6] text-white px-6 py-3 rounded-md transition-colors text-sm font-medium shadow-sm cursor-pointer"
            >
              <DownloadCloud className="w-4 h-4" />
              下载 Diary Insight 插件包 (.zip)
            </a>
            <button 
              onClick={handleExportZip}
              className="flex items-center gap-2 bg-white border border-[#DCDCDC] hover:bg-gray-50 text-[#202020] px-5 py-3 rounded-md transition-colors text-sm font-medium shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              导出当前演示数据 (Markdown)
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 人名管理 */}
          <section className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm p-6 flex flex-col">
            <h3 className="text-lg font-bold text-[#202020] mb-4">
              统计人名管理
            </h3>
            <p className="text-xs text-[#808080] mb-6 flex-1">
              添加你想要在图表中重点跟踪出现频率的人名（如家人、同事、朋友）。
            </p>
            
            <form onSubmit={handleAddName} className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder="输入人名..." 
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="flex-1 bg-white border border-[#DCDCDC] text-[#202020] text-sm rounded-md px-3 py-2 outline-none focus:border-[#7C4DFF] shadow-sm transition-colors"
              />
              <button type="submit" className="bg-white border border-[#DCDCDC] text-[#202020] hover:bg-gray-50 shadow-sm px-3 py-2 rounded-md transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-wrap gap-2 mb-6">
              {trackedNames.map(name => (
                <span key={name} className="flex items-center gap-1.5 bg-[#F8F9FF] border border-[#E0E4FF] text-[#7C4DFF] text-sm px-3 py-1.5 rounded-full">
                  {name}
                  <button onClick={() => removeTrackedName(name)} className="text-[#808080] hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {trackedNames.length === 0 && (
                <span className="text-sm text-[#808080]">暂无跟踪名单。</span>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-[#E5E5E5] flex items-center justify-between">
              <span className="text-sm font-medium text-[#202020]">将出现的人名转为标签</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={autoTagNames} onChange={(e) => setAutoTagNames(e.target.checked)} />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7C4DFF]"></div>
              </label>
            </div>
          </section>

          {/* 自动标签规则 */}
          <section className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm p-6 flex flex-col">
            <h3 className="text-lg font-bold text-[#202020] mb-4">
              自动标签化规则
            </h3>
            <p className="text-xs text-[#808080] mb-6 flex-1">
              当你在日记中输入特定关键词时，系统会自动为你打上对应的标签。
            </p>
            
            <form onSubmit={handleAddRule} className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder="输入关键词..." 
                value={newKeyword}
                onChange={e => setNewKeyword(e.target.value)}
                className="flex-1 w-1/2 bg-white border border-[#DCDCDC] text-[#202020] text-sm rounded-md px-3 py-2 outline-none focus:border-[#7C4DFF] shadow-sm transition-colors"
                required
              />
              <span className="text-[#808080] flex items-center">→</span>
              <input 
                type="text" 
                placeholder="触发标签名..." 
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                className="flex-1 w-1/2 bg-white border border-[#DCDCDC] text-[#202020] text-sm rounded-md px-3 py-2 outline-none focus:border-[#7C4DFF] shadow-sm transition-colors"
                required
              />
              <button type="submit" className="bg-white border border-[#DCDCDC] text-[#202020] hover:bg-gray-50 shadow-sm px-3 py-2 rounded-md transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-col gap-2 relative">
              {autoTagRules.map(rule => (
                <div key={rule.id} className="flex items-center justify-between bg-white border border-[#E5E5E5] text-sm px-3 py-2 rounded-md shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-[#202020]">"{rule.keyword}"</span>
                    <span className="text-[#808080] text-xs">触发标签</span>
                    <span className="text-[#7C4DFF] bg-[#F8F9FF] border border-[#E0E4FF] px-2 py-0.5 rounded">#{rule.tag}</span>
                  </div>
                  <button onClick={() => removeAutoTagRule(rule.id)} className="text-[#808080] hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {autoTagRules.length === 0 && (
                <span className="text-sm text-[#808080]">暂无自动标签规则。</span>
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
