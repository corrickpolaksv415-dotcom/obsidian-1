import { ViewType } from '../App';
import { BookOpen, BarChart2, Settings, DownloadCloud } from 'lucide-react';

interface SidebarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const navItems = [
    { id: 'diary' as ViewType, label: '日记管理', icon: BookOpen },
    { id: 'stats' as ViewType, label: '数据统计', icon: BarChart2 },
    { id: 'settings' as ViewType, label: '设置与导出', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 h-full bg-[#EBEBEB] border-r border-[#DCDCDC] flex flex-col pt-6">
      <div className="px-6 pb-6 border-b border-[#DCDCDC]">
        <h1 className="text-lg font-bold tracking-wide flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#7C4DFF]" />
          <span>Obsidian 洞察</span>
        </h1>
        <p className="text-xs text-[#808080] mt-1">本地日记分析辅助工具</p>
      </div>

      <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
              currentView === item.id 
                ? 'bg-white text-[#7C4DFF] shadow-sm' 
                : 'text-[#5C5C5C] hover:bg-white/50 hover:text-[#202020]'
            }`}
          >
            <item.icon className={`w-4 h-4 ${currentView === item.id ? 'text-[#7C4DFF]' : ''}`} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-[#DCDCDC]">
        <div className="flex items-center justify-between text-xs text-[#808080]">
          <span>Diary Insight v1.0</span>
          <span>插件管理控制台</span>
        </div>
      </div>
    </aside>
  );
}
