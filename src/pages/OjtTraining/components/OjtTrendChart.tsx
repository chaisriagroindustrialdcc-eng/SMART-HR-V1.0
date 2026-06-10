import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import * as Icons from 'lucide-react';

interface OjtTrendChartProps {
  learners: any[];
}

// 6 Months historic mock data per department for average mastery (%)
const HISTORIC_DATA: { [key: string]: { month: string; value: number }[] } = {
  'Property Management': [
    { month: 'Jan', value: 35 },
    { month: 'Feb', value: 42 },
    { month: 'Mar', value: 50 },
    { month: 'Apr', value: 58 },
    { month: 'May', value: 65 },
    { month: 'Jun', value: 76 }
  ],
  'Marketing Dept': [
    { month: 'Jan', value: 45 },
    { month: 'Feb', value: 55 },
    { month: 'Mar', value: 65 },
    { month: 'Apr', value: 80 },
    { month: 'May', value: 90 },
    { month: 'Jun', value: 100 }
  ],
  'Finance & Accounts': [
    { month: 'Jan', value: 20 },
    { month: 'Feb', value: 25 },
    { month: 'Mar', value: 30 },
    { month: 'Apr', value: 38 },
    { month: 'May', value: 50 },
    { month: 'Jun', value: 56 }
  ],
  'Legal & Procurement': [
    { month: 'Jan', value: 10 },
    { month: 'Feb', value: 15 },
    { month: 'Mar', value: 15 },
    { month: 'Apr', value: 22 },
    { month: 'May', value: 30 },
    { month: 'Jun', value: 35 }
  ],
  'All Departments': [
    { month: 'Jan', value: 27 },
    { month: 'Feb', value: 34 },
    { month: 'Mar', value: 40 },
    { month: 'Apr', value: 49 },
    { month: 'May', value: 58 },
    { month: 'Jun', value: 67 }
  ]
};

const THEME_COLORS: { [key: string]: string } = {
  'Property Management': '#3f809e', // skyBlue
  'Marketing Dept': '#b58c4f', // gold
  'Finance & Accounts': '#657f4d', // success
  'Legal & Procurement': '#a94228', // accent
  'All Departments': '#212c46' // primary
};

export default function OjtTrendChart({ learners }: OjtTrendChartProps) {
  const depts = Object.keys(HISTORIC_DATA);
  const [selectedDepts, setSelectedDepts] = useState<string[]>(['All Departments', 'Property Management']);

  const toggleDept = (dept: string) => {
    if (selectedDepts.includes(dept)) {
      if (selectedDepts.length > 1) {
        setSelectedDepts(selectedDepts.filter((d) => d !== dept));
      }
    } else {
      setSelectedDepts([...selectedDepts, dept]);
    }
  };

  // Compile data for Recharts
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month) => {
      const entry: any = { month };
      selectedDepts.forEach((dept) => {
        const item = HISTORIC_DATA[dept]?.find((d) => d.month === month);
        if (item) {
          entry[dept] = item.value;
        }
      });
      return entry;
    });
  }, [selectedDepts]);

  return (
    <div className="bg-white border border-[#eaeaec] p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col md:col-span-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-2 border-b border-dashed border-gray-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#3f809e]/15 text-[#3f809e] rounded-lg">
            <Icons.TrendingUp size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="text-[11.5px] font-black text-[#212c46] uppercase tracking-wider">
              OJT Mastery Progress Trend
            </h4>
            <p className="text-[9px] text-[#7a8b95] font-bold uppercase tracking-widest leading-none mt-0.5">
              Average Skill Mastery (%) Over the Last 6 Months
            </p>
          </div>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap gap-1.5 max-w-md">
          {depts.map((d) => {
            const isSelected = selectedDepts.includes(d);
            return (
              <button
                key={d}
                onClick={() => toggleDept(d)}
                style={{
                  backgroundColor: isSelected ? `${THEME_COLORS[d]}15` : '#f8f9fa',
                  color: isSelected ? THEME_COLORS[d] : '#9ca3af',
                  borderColor: isSelected ? `${THEME_COLORS[d]}40` : '#eaeaec'
                }}
                className="px-2 py-1 border rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 hover:scale-[1.02]"
              >
                <span
                  style={{ backgroundColor: isSelected ? THEME_COLORS[d] : '#d1d5db' }}
                  className="w-1.5 h-1.5 rounded-full"
                ></span>
                {d}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#7a8b95', fontSize: 10, fontWeight: 'bold' }}
              axisLine={{ stroke: '#eaeaec' }}
              tickLine={{ stroke: '#eaeaec' }}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
              tick={{ fill: '#7a8b95', fontSize: 10, fontWeight: 'bold' }}
              axisLine={{ stroke: '#eaeaec' }}
              tickLine={{ stroke: '#eaeaec' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #eaeaec',
                borderRadius: '12px',
                fontSize: '11px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                fontFamily: 'sans-serif'
              }}
              formatter={(value, name) => [`${value}%`, name]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              content={(props) => {
                const { payload } = props;
                return (
                  <div className="flex justify-center gap-4 mt-2 select-none">
                    {payload?.map((entry: any, index) => (
                      <span key={index} className="flex items-center gap-1.5 text-[9px] font-extrabold text-[#212c46] uppercase tracking-wider">
                        <span style={{ backgroundColor: entry.color }} className="w-2.5 h-1 rounded-full inline-block"></span>
                        {entry.value}
                      </span>
                    ))}
                  </div>
                );
              }}
            />
            {selectedDepts.map((dept) => (
              <Line
                key={dept}
                type="monotone"
                dataKey={dept}
                stroke={THEME_COLORS[dept]}
                strokeWidth={3}
                activeDot={{ r: 6 }}
                dot={{ strokeWidth: 2, r: 4 }}
                animationDuration={500}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
