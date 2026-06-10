import React, { useMemo } from 'react';
import * as Icons from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  ReferenceLine
} from 'recharts';

interface Learner {
  id: string;
  employeeName: string;
  employeeId: string;
  dept: string;
  role: string;
  skills?: { name: string; mastered: boolean }[];
  [key: string]: any;
}

interface OjtSkillHeatmapProps {
  learners: Learner[];
}

export default function OjtSkillHeatmap({ learners }: OjtSkillHeatmapProps) {
  // 1. Process and format department-level mastery data
  const chartData = useMemo(() => {
    const deptMap: { [key: string]: { total: number; mastered: number; count: number } } = {};

    learners.forEach((l) => {
      const skills = l.skills || [];
      const total = skills.length || 5; 
      const mastered = skills.filter((s) => s.mastered).length;

      if (!deptMap[l.dept]) {
        deptMap[l.dept] = { total: 0, mastered: 0, count: 0 };
      }
      deptMap[l.dept].total += total;
      deptMap[l.dept].mastered += mastered;
      deptMap[l.dept].count += 1;
    });

    return Object.entries(deptMap).map(([deptName, val]) => {
      const percentage = val.total > 0 ? Math.round((val.mastered / val.total) * 100) : 0;
      
      // Determine rating: low (Red), warning (Orange/Amber), high (Green)
      let color = '#dc2626'; // Red
      let status = 'Critical';
      if (percentage >= 80) {
        color = '#10b981'; // Green
        status = 'Optimal';
      } else if (percentage >= 50) {
        color = '#f59e0b'; // Amber
        status = 'Coached';
      }

      return {
        department: deptName,
        abbrev: deptName.replace(' Management', '').replace(' Dept', '').split('&')[0].trim(),
        percentage,
        count: val.count,
        mastered: val.mastered,
        total: val.total,
        status,
        color
      };
    }).sort((a, b) => b.percentage - a.percentage); // Sort highest first for structured display
  }, [learners]);

  // Weakest department detection
  const weakestDept = useMemo(() => {
    if (chartData.length === 0) return null;
    return [...chartData].sort((a, b) => a.percentage - b.percentage)[0];
  }, [chartData]);

  // Color helper for badges and card backgrounds
  const getBadgeStyle = (pct: number) => {
    if (pct >= 80) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (pct >= 50) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const CustomHeader = (
    <div className="flex justify-between items-center pb-3 border-b border-dashed border-slate-100 mb-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-[#a94228]/10 text-[#a94228] rounded-lg">
          <Icons.BarChart4 size={15} strokeWidth={2.5} />
        </div>
        <div>
          <h4 className="text-[11.5px] font-black text-[#212c46] uppercase tracking-wider">
            Recharts Department Mastery Spectrum
          </h4>
          <p className="text-[9px] text-[#7a8b95] font-bold uppercase tracking-widest leading-none mt-0.5">
            D3-Powered competency heat charts by division
          </p>
        </div>
      </div>

      {weakestDept && weakestDept.percentage < 55 && (
        <span className="text-[8.5px] font-black uppercase text-rose-600 bg-rose-50 border border-rose-200/50 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Icons.AlertTriangle size={10} /> Focus Required: {weakestDept.department}
        </span>
      )}
    </div>
  );

  return (
    <div className="bg-white border border-[#eaeaec] p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col h-full text-left">
      {CustomHeader}

      {/* Heat spectrum guidance key */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-xl text-[9px] text-slate-500 font-black uppercase tracking-wider mb-5">
        <span className="text-slate-400">Spectrum Key:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-rose-600 rounded"></span>
          <span>Red: Critical (&lt;50%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-amber-500 rounded"></span>
          <span>Amber: Coached (50-79%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded"></span>
          <span>Green: Certified (80%+)</span>
        </div>
      </div>

      {/* Recharts Render Container */}
      <div className="h-56 mb-4 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">
            No active learner data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
            >
              <defs>
                <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#b91c1c" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#d97706" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#047857" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="abbrev" 
                tick={{ fontSize: 9, fontWeight: 800, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis 
                domain={[0, 100]} 
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#212c46] text-white p-3 rounded-xl border border-slate-700 shadow-xl text-left text-[10px] font-sans">
                        <p className="font-extrabold text-[#b58c4f] uppercase tracking-wide mb-1">
                          {data.department}
                        </p>
                        <p className="font-normal text-slate-300">
                          Mastered Items: <strong className="text-white font-mono">{data.mastered} / {data.total}</strong>
                        </p>
                        <p className="font-normal text-slate-300">
                          Competency Score: <strong className="text-emerald-400 font-mono">{data.percentage}%</strong>
                        </p>
                        <p className="font-normal text-slate-300">
                          Active Apprentices: <strong className="text-sky-300 font-mono">{data.count}</strong>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={80} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Target 80%', fill: '#10b981', fontSize: 8, position: 'top', fontWeight: 700 }} />
              <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => {
                  let fillUrl = 'url(#redGrad)';
                  if (entry.percentage >= 80) fillUrl = 'url(#greenGrad)';
                  else if (entry.percentage >= 50) fillUrl = 'url(#amberGrad)';

                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={fillUrl}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Structured Mastery Department Cards Row */}
      <span className="block text-[8.5px] font-black text-[#b58c4f] uppercase tracking-wider mb-2.5">
        Mastery Percentages by Business Unit
      </span>

      <div className="grid grid-cols-2 gap-2 mt-auto">
        {chartData.map((d) => {
          const badgeClass = getBadgeStyle(d.percentage);
          return (
            <div 
              key={d.department} 
              className="p-3 bg-slate-50/50 border border-slate-100 hover:border-slate-200/80 hover:bg-slate-50 rounded-xl flex flex-col justify-between transition-all"
            >
              <div className="flex justify-between items-start gap-1">
                <span className="text-[9.5px] font-black text-[#212c46] truncate max-w-[120px]" title={d.department}>
                  {d.department.replace(' Dept', '').replace('Management', 'Mgt')}
                </span>
                <span className={`text-[8px] px-1.5 py-0.2 rounded font-black tracking-wider border ${badgeClass}`}>
                  {d.percentage}%
                </span>
              </div>
              
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-3.5">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${d.percentage}%`,
                    backgroundColor: d.percentage >= 80 ? '#10b981' : d.percentage >= 50 ? '#f59e0b' : '#dc2626'
                  }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
