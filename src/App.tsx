import { AppProvider } from './lib/store';
import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DiaryView } from './components/DiaryView';
import { StatsView } from './components/StatsView';
import { SettingsView } from './components/SettingsView';

export type ViewType = 'diary' | 'stats' | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('diary');

  return (
    <AppProvider>
      <div className="flex h-screen w-full bg-[#F5F5F5] text-[#202020] font-sans overflow-hidden">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
        <main className="flex-1 flex flex-col h-full right-content-area" style={{ maxWidth: 'calc(100vw - 256px)'}}>
          {currentView === 'diary' && <DiaryView />}
          {currentView === 'stats' && <StatsView />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>
    </AppProvider>
  );
}
