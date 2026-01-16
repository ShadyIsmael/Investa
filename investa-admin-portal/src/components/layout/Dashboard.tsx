
import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { financeService } from '@/services/financeService';
import { userService } from '@/services/userService';
import { clientService } from '@/services/clientService';
import { supportService } from '@/services/supportService';
import { StatCard } from '@/components/common/StatCard';
import { generateExecutiveSummary } from '@/services/geminiService';
import { AiStatus, DashboardStat, ChartDataPoint, User, Client, ReportedUser } from '@/types';
import { Icon } from '@/components/common/Icons';

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [revenue, setRevenue] = useState<ChartDataPoint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [topClients, setTopClients] = useState<Client[]>([]);
  const [investmentsByCategory, setInvestmentsByCategory] = useState<{ name: string; value: number }[]>([]);

  const PIE_COLORS = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];
  const [reportedUsers, setReportedUsers] = useState<ReportedUser[]>([]);

  const [aiStatus, setAiStatus] = useState<AiStatus>(AiStatus.IDLE);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch revenue first so charts render even if other endpoints fail
        try {
          const r = await financeService.getRevenueData();
          setRevenue(r);
          console.debug('[Dashboard] fetched revenue:', r);
        } catch (err) {
          console.warn('[Dashboard] revenue fetch failed:', err);
          setRevenue([]);
        }

        // Fetch remaining endpoints without blocking revenue
        const settled = await Promise.allSettled([
          financeService.getDashboardStats(),
          userService.getUsers(),
          clientService.getTopClients(),
          userService.getReportedUsers(),
        ]);

        let baseStats: any[] = [];
        if (settled[0].status === 'fulfilled') {
          baseStats = settled[0].value ?? [];
          console.debug('[Dashboard] stats:', settled[0].value);
        } else {
          console.warn('[Dashboard] stats load failed', settled[0]);
        }

        if (settled[1].status === 'fulfilled') {
          setUsers(settled[1].value);
          console.debug('[Dashboard] users:', settled[1].value);
        } else {
          console.warn('[Dashboard] users load failed', settled[1]);
        }

        if (settled[2].status === 'fulfilled') {
          setTopClients(settled[2].value);
          console.debug('[Dashboard] topClients:', settled[2].value);
        } else {
          console.warn('[Dashboard] topClients load failed', settled[2]);
        }

        if (settled[3].status === 'fulfilled') {
          setReportedUsers(settled[3].value);
          console.debug('[Dashboard] reportedUsers:', settled[3].value);
        } else {
          console.warn('[Dashboard] reportedUsers load failed', settled[3]);
        }

        // Fetch totals for clients, investments by category (from API), and support tickets
        try {
          const extras = await Promise.allSettled([
            clientService.getClients(),
            financeService.getInvestmentsByCategory(),
            supportService.getTickets(),
          ]);

          const clientsResult = extras[0];
          const investmentsByCategoryResult = extras[1];
          const ticketsResult = extras[2];

          const totalClients = clientsResult.status === 'fulfilled' && Array.isArray(clientsResult.value) ? clientsResult.value.length : 0;
          const investmentsByCategoryData = investmentsByCategoryResult.status === 'fulfilled' && Array.isArray(investmentsByCategoryResult.value) ? investmentsByCategoryResult.value : [];
          const totalInvestments = investmentsByCategoryData.reduce((s: number, it: any) => s + (Number(it.value ?? 0) || 0), 0);
          const totalTickets = ticketsResult.status === 'fulfilled' && Array.isArray(ticketsResult.value) ? ticketsResult.value.length : 0;

          const extraStats = [
            { id: 'clients', label: 'Clients', value: String(totalClients), change: 0, trend: 'up', iconName: 'users' },
            { id: 'investments', label: 'Investments', value: `$${totalInvestments.toLocaleString()}`, change: 0, trend: 'up', iconName: 'revenue' },
            { id: 'tickets', label: 'Tickets', value: String(totalTickets), change: 0, trend: totalTickets > 0 ? 'down' : 'up', iconName: 'headset' },
          ];

          setStats([...extraStats, ...baseStats]);
          setInvestmentsByCategory(investmentsByCategoryData as { name: string; value: number }[]);
        } catch (err) {
          console.warn('[Dashboard] failed to load extra totals', err);
          setStats(baseStats);
        }
      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGenerateInsight = async () => {
    setAiStatus(AiStatus.LOADING);
    try {
      const dataToAnalyze = { stats, revenue };
      const summary = await generateExecutiveSummary(dataToAnalyze);
      setAiResponse(summary || "No insights could be generated.");
      setAiStatus(AiStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setAiStatus(AiStatus.ERROR);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium text-sm">Aggregating real-time financial data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* AI Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-950 rounded-xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">System Overview</h2>
            <p className="text-indigo-100/80 mt-0.5 text-[13px]">Real-time performance metrics and intelligent forecasting.</p>
          </div>
          <button 
            onClick={handleGenerateInsight}
            disabled={aiStatus === AiStatus.LOADING}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all disabled:opacity-50"
          >
            <Icon name="sparkles" className="w-4 h-4" />
            {aiStatus === AiStatus.LOADING ? 'Analyzing...' : 'AI Insights'}
          </button>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none"></div>
      </div>

      {/* AI Response Area */}
      {aiStatus !== AiStatus.IDLE && (
        <div className={`p-5 rounded-xl border ${aiStatus === AiStatus.ERROR ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'}`}>
          {aiStatus === AiStatus.LOADING && (
            <div className="flex items-center justify-center py-2 space-x-3">
              <div className="w-5 h-5 border-2 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-[13px] text-slate-500 font-medium">Gemini is synthesizing insights...</p>
            </div>
          )}
          {aiStatus === AiStatus.SUCCESS && aiResponse && (
            <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400 font-bold text-[14px]">
                <Icon name="sparkles" className="w-4 h-4" />
                <h3>Strategic Analysis</h3>
              </div>
              <div className="text-[13px] whitespace-pre-line leading-relaxed opacity-90">{aiResponse}</div>
            </div>
          )}
        </div>
      )}

      {/* Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Revenue Summary (charts removed) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
             <Icon name="revenue" className="w-4 h-4 text-indigo-600" />
             Revenue Stream
          </h3>
          <div className="h-[300px] w-full">
            {Array.isArray(revenue) && revenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">No revenue timeseries available</div>
            )}
          </div>
          <details className="mt-3">
            <summary className="cursor-pointer text-sm text-slate-500">Show mapped revenue array</summary>
            <pre className="mt-2 text-xs bg-slate-50 p-2 rounded-lg text-slate-700 dark:bg-slate-800 dark:text-slate-300 overflow-auto max-h-40">{JSON.stringify(revenue, null, 2)}</pre>
          </details>
          {/* compact line chart removed */}
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Icon name="chart" className="w-4 h-4 text-indigo-600" />
            Market Engagement
          </h3>
          <div className="h-64 w-full">
            {Array.isArray(investmentsByCategory) && investmentsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={investmentsByCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={4}
                    label={({ name, percent }) => `${name} ${Math.round((percent || 0) * 100)}%`}
                  >
                    {investmentsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toLocaleString(undefined, { minimumFractionDigits: 2 })} EGP`} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">No investment category data available</div>
            )}
          </div>
          <div className="mt-3 text-sm text-slate-500">Shows percentage breakdown of investments by category.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-950/30">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Icon name="shield-check" className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">Top Scored Clients</h3>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-500 text-[9px] uppercase font-bold tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="px-5 py-2.5">Company</th>
                  <th className="px-5 py-2.5 text-center">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {topClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <img src={client.avatar} alt="" className="w-7 h-7 rounded-lg object-cover shadow-sm" />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-[12px] leading-none group-hover:text-indigo-600 transition-colors">{client.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {/* show raw score amount if available, otherwise fallback to verificationPercent */}
                      <span className="text-[11px] font-bold text-emerald-600">{(() => {
                        const sc = (client as any).score ?? client.verificationPercent;
                        if (typeof sc === 'number') {
                          return Number.isInteger(sc) ? String(sc) : sc.toFixed(1);
                        }
                        return String(sc);
                      })()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
