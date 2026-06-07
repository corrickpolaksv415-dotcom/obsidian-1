import { useMemo } from 'react';
import { useAppStore } from '../lib/store';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { Users, Tag as TagIcon, FileText } from 'lucide-react';

export function StatsView() {
  const { diaries, trackedNames } = useAppStore();

  // 1. Last 14 days writing stats (word count)
  const last14DaysStats = useMemo(() => {
    const stats = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const diary = diaries.find(d => d.date === dateStr);
      stats.push({
        date: format(d, 'MM-dd'),
        words: diary ? diary.content.length : 0
      });
    }
    return stats;
  }, [diaries]);

  // 2. Tracked names occurrences
  const nameStats = useMemo(() => {
    return trackedNames.map(name => {
      const count = diaries.reduce((acc, curr) => {
        const matches = curr.content.match(new RegExp(name, 'g'));
        return acc + (matches ? matches.length : 0);
      }, 0);
      return { name, count };
    }).sort((a, b) => b.count - a.count);
  }, [diaries, trackedNames]);

  // 3. Top tags
  const topTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    diaries.forEach(d => {
      d.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8
  }, [diaries]);

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-neutral-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header>
          <h2 className="text-2xl font-medium tracking-tight text-neutral-100 flex items-center gap-3 mb-2">
            数据统计洞察
          </h2>
          <p className="text-neutral-500 text-sm">通过数据了解你的书写习惯和关注焦点。</p>
        </header>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-800/40 border border-neutral-800 rounded-xl p-6 flex items-start gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-neutral-400 mb-1">总日记篇数</p>
              <h3 className="text-2xl font-medium text-neutral-100">{diaries.length}</h3>
            </div>
          </div>
          <div className="bg-neutral-800/40 border border-neutral-800 rounded-xl p-6 flex items-start gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
              <TagIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-neutral-400 mb-1">标签总数</p>
              <h3 className="text-2xl font-medium text-neutral-100">
                {new Set(diaries.flatMap(d => d.tags)).size}
              </h3>
            </div>
          </div>
          <div className="bg-neutral-800/40 border border-neutral-800 rounded-xl p-6 flex items-start gap-4">
            <div className="p-3 bg-pink-500/10 text-pink-400 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-neutral-400 mb-1">跟踪人名数</p>
              <h3 className="text-2xl font-medium text-neutral-100">{trackedNames.length}</h3>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="bg-neutral-800/30 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-neutral-300 mb-6">近 14 天写作字数趋势</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last14DaysStats} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
                <XAxis dataKey="date" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', borderRadius: '8px', color: '#f5f5f5' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Line type="monotone" dataKey="words" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 6 }} name="字数" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-neutral-800/30 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-neutral-300 mb-6">提及人名频次统计</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={nameStats} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} width={60} />
                  <RechartsTooltip 
                    cursor={{fill: '#262626'}}
                    contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', borderRadius: '8px', color: '#f5f5f5' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} name="提及次数">
                    {nameStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-neutral-800/30 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-neutral-300 mb-6">高频标签分布</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topTags} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
                  <XAxis dataKey="tag" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    cursor={{fill: '#262626'}}
                    contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', borderRadius: '8px', color: '#f5f5f5' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="使用次数" fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
