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

  const COLORS = ['#7C4DFF', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e'];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-transparent p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header>
          <h2 className="text-2xl font-bold tracking-tight text-[#202020] flex items-center gap-3 mb-2">
            数据统计洞察
          </h2>
          <p className="text-[#808080] text-sm">通过数据了解你的书写习惯和关注焦点。</p>
        </header>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm p-6 flex items-start gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-[#808080] mb-1">总日记篇数</p>
              <h3 className="text-2xl font-bold text-[#202020]">{diaries.length}</h3>
            </div>
          </div>
          <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm p-6 flex items-start gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <TagIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-[#808080] mb-1">标签总数</p>
              <h3 className="text-2xl font-bold text-[#202020]">
                {new Set(diaries.flatMap(d => d.tags)).size}
              </h3>
            </div>
          </div>
          <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm p-6 flex items-start gap-4">
            <div className="p-3 bg-pink-50 text-pink-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-[#808080] mb-1">跟踪人名数</p>
              <h3 className="text-2xl font-bold text-[#202020]">{trackedNames.length}</h3>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="bg-white border border-[#E5E5E5] shadow-sm rounded-xl p-6">
          <h3 className="text-sm font-bold text-[#202020] mb-6">近 14 天写作字数趋势</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last14DaysStats} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
                <XAxis dataKey="date" stroke="#808080" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#808080" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#E5E5E5', borderRadius: '8px', color: '#202020' }}
                  itemStyle={{ color: '#7C4DFF' }}
                />
                <Line type="monotone" dataKey="words" stroke="#7C4DFF" strokeWidth={3} dot={{ r: 4, fill: '#7C4DFF', strokeWidth: 0 }} activeDot={{ r: 6 }} name="字数" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white border border-[#E5E5E5] shadow-sm rounded-xl p-6">
            <h3 className="text-sm font-bold text-[#202020] mb-6">提及人名频次统计</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={nameStats} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#808080" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#808080" fontSize={12} tickLine={false} axisLine={false} width={60} />
                  <RechartsTooltip 
                    cursor={{fill: '#F5F5F5'}}
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#E5E5E5', borderRadius: '8px', color: '#202020' }}
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

          <div className="bg-white border border-[#E5E5E5] shadow-sm rounded-xl p-6">
            <h3 className="text-sm font-bold text-[#202020] mb-6">高频标签分布</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topTags} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
                  <XAxis dataKey="tag" stroke="#808080" fontSize={12} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke="#808080" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    cursor={{fill: '#F5F5F5'}}
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#E5E5E5', borderRadius: '8px', color: '#202020' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="使用次数" fill="#7C4DFF" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
