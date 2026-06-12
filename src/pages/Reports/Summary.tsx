import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  BarChart3, HelpCircle, X, CheckCircle2, Clock, Calendar, Info, 
  PieChart as LucidePieChart, BrainCircuit, UserMinus, Building2, Briefcase, 
  TrendingUp, Target, BookOpen, Key, RefreshCw, FileText, Download, Printer, 
  Percent, ShieldCheck, DollarSign, Users, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie
} from 'recharts';
import Swal from 'sweetalert2';
import KpiCard from '../../components/shared/KpiCard';

// --- Theme Configuration (SMART HR Earth & Tech Tones) ---
const THEME = {
  bgMain: 'transparent',
  primary: '#212c46', // deep navy
  primaryLight: '#4d87a8', // tech blue
  accent: '#a94228', // red/clay
  gold: '#b58c4f', // bronze gold
  success: '#657f4d', // green
  skyBlue: '#3f809e',
  dustyBlue: '#7a8b95',
  palette: [
    '#212c46', '#3f809e', '#b58c4f', '#a94228', '#657f4d',
    '#932c2e', '#4d87a8', '#b7a159', '#7a8b95', '#606a5f'
  ]
};

// --- Raw / Filterable Datasets ---
const MONTHLY_TRENDS = [
  { month: 'Jan', payroll: 3.82, otCost: 0.28, attendance: 97.2 },
  { month: 'Feb', payroll: 3.85, otCost: 0.32, attendance: 97.4 },
  { month: 'Mar', payroll: 3.90, otCost: 0.35, attendance: 98.1 },
  { month: 'Apr', payroll: 3.95, otCost: 0.40, attendance: 96.8 },
  { month: 'May', payroll: 4.10, otCost: 0.45, attendance: 97.5 },
  { month: 'Jun', payroll: 4.17, otCost: 0.42, attendance: 98.3 }
];

const LEAVE_CATEGORIES_DATA = [
  { name: 'Sick Leave (ลาป่วย)', value: 45, color: '#a94228' },
  { name: 'Annual Leave (ลาพักร้อน)', value: 85, color: '#657f4d' },
  { name: 'Personal Leave (ลากิจ)', value: 30, color: '#b58c4f' },
  { name: 'Maternity/Other (ลาคลอด/อื่นๆ)', value: 12, color: '#3f809e' }
];

const DEPT_STATS_DATA = [
  { id: 'DS-001', dept: 'Operations', headcount: 120, salary: 1800000, ot: 420, attendance: 98.2, efficiency: 96 },
  { id: 'DS-002', dept: 'Engineering', headcount: 35, salary: 750000, ot: 110, attendance: 97.4, efficiency: 92 },
  { id: 'DS-003', dept: 'Marketing', headcount: 22, salary: 420000, ot: 40, attendance: 96.5, efficiency: 91 },
  { id: 'DS-004', dept: 'Sales', headcount: 45, salary: 680000, ot: 80, attendance: 95.8, efficiency: 94 },
  { id: 'DS-005', dept: 'Finance', headcount: 12, salary: 280000, ot: 15, attendance: 98.7, efficiency: 98 },
  { id: 'DS-006', dept: 'HR & Admin', headcount: 11, salary: 240000, ot: 10, attendance: 98.9, efficiency: 95 }
];

// --- High-detail User Guide Panel ---
function UserGuidePanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <>
      <div 
        id="guide-backdrop" 
        className={`fixed inset-0 z-[190] bg-[#212c46]/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      <div 
        id="guide-sidebar-panel" 
        className={`fixed inset-y-0 right-0 z-[200] w-full md:w-[500px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col border-l-4 border-l-[#b58c4f] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-5 px-6 border-b-2 border-l-[#b58c4f] bg-[#212c46] text-white shrink-0">
          <div>
            <h3 className="font-black flex items-center gap-3 uppercase tracking-widest text-[15px] text-[#f3f3f1]">
              <BookOpen size={20} className="text-[#b58c4f]" /> SUMMARY INDEX GUIDE
            </h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">คู่มือโครงสร้างระเบียบสถิติและต้นทุนภาพรวม</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-rose-500 hover:bg-white/10 rounded-xl transition-colors cursor-pointer">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 text-[#212c46] text-[12px] leading-relaxed custom-scrollbar bg-white">
          <section className="animate-fadeIn">
            <h4 className="text-[13px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-slate-100 pb-2 font-mono">
              <TrendingUp size={18} className="text-[#a94228]" /> 1. Operations KPI System (ระบบชี้วัดต้นทุน)
            </h4>
            <p className="text-[12px] mb-3 text-slate-600 font-medium">ทำความเข้าใจการเชื่อมสถิติต้นทุนและการผลิตของแต่ละส่วนฝ่าย:</p>
            <ul className="list-none pl-0 space-y-3">
              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <DollarSign size={16} className="shrink-0 text-[#b58c4f] mt-0.5" /> 
                <div>
                  <strong className="text-[#212c46]">Total Monthly Budget:</strong> ยอดเงินเดือนบวกเงินพิเศษรวมค่าทำงานล่วงเวลา (Overtime Cost) ของหน่วยงานทั้งหมดเพื่อตรวจสอบระดับประหยัดต้นทุนประจำไตรมาส
                </div>
              </li>
              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Activity size={16} className="shrink-0 text-emerald-600 mt-0.5" /> 
                <div>
                  <strong className="text-emerald-600">Personnel Efficiency Indicator:</strong> ระดับดัชนีประสิทธิภาพเชิงลึก (KPI/Workload) คำนวณจากเปอร์เซ็นต์ผลผลิตงานเทียบกับชั่วโมงล่วงเวลาทั้งหมด
                </div>
              </li>
            </ul>
          </section>

          <section className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <h4 className="text-[13px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-slate-100 pb-2 font-mono">
              <Info size={18} className="text-[#3f809e]" /> 2. Attendance & Deviation Control
            </h4>
            <p className="text-[12px] mb-3 text-slate-600 font-medium">การติดตามสถิติขาด ลา มาสาย และการตรวจทานความปลอดภัย:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 font-medium">
              <li>สถิติแบบรายวัน/รายเดือน นำเข้าผ่านเครื่องตรวจจับพิกัด Geofence และระบบบันทึกเวลาที่เสถียร</li>
              <li>อัตราสูญเสียชั่วโมงงาน (Loss Time Rate) แปลผลตรงกับวันลาป่วย ลากิจ และวันลาอื่นๆ ทั้งหมด</li>
              <li>หากเปอร์เซ็นต์ต่ำกว่า 95% ระบบจะแสดงไฟเตือนความเสี่ยงเชิงโครงสร้างโดยอัตโนมัติ สอดคล้องตามมาตรฐาน ISO9001</li>
            </ul>
          </section>

          <section className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <h4 className="text-[13px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-slate-100 pb-2 font-mono">
              <ShieldCheck size={18} className="text-[#657f4d]" /> 3. Export & Audit Trail standards
            </h4>
            <p className="text-[12px] text-slate-600 font-medium">
              ข้อมูลที่รวบรวมในการ์ดเชิงสถิตินี้ สามารถทำการส่งออกเป็นรูปแบบ CSV ด้วยความรวดเร็ว หรือกดสั่งพิมพ์ฟอร์แมตกระดาษ A4 สะดวกสบายต่อการนำเสนอในการประชุมใหญ่ของบริษัท ชัยศรีอุตสาหกรรมเกษตร จำกัด
            </p>
          </section>
        </div>

        <div className="p-4 bg-[#f8f9fa] border-t border-slate-100 flex justify-end shrink-0">
          <button 
            onClick={onClose} 
            className="px-8 py-2.5 bg-[#212c46] hover:bg-slate-700 text-white font-black rounded-xl uppercase text-[11px] transition-all shadow-md tracking-[0.1em] cursor-pointer"
          >
            รับทราบ (Got it)
          </button>
        </div>
      </div>
    </>, document.body
  );
}

export default function SummaryReport() {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('June');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Filter department statistical table
  const filteredDeptStats = useMemo(() => {
    if (selectedDept === 'All') return DEPT_STATS_DATA;
    return DEPT_STATS_DATA.filter(item => item.dept === selectedDept);
  }, [selectedDept]);

  // Compute metrics dynamically
  const computedMetrics = useMemo(() => {
    const totalHeadcount = DEPT_STATS_DATA.reduce((acc, curr) => acc + curr.headcount, 0);
    const avgAttendance = parseFloat((DEPT_STATS_DATA.reduce((acc, curr) => acc + curr.attendance, 0) / DEPT_STATS_DATA.length).toFixed(1));
    const totalPayroll = DEPT_STATS_DATA.reduce((acc, curr) => acc + curr.salary, 0) + (DEPT_STATS_DATA.reduce((acc, curr) => acc + curr.ot, 0) * 350); // OT estimated at 350 THB/hr
    const averageEfficiency = parseFloat((DEPT_STATS_DATA.reduce((acc, curr) => acc + curr.efficiency, 0) / DEPT_STATS_DATA.length).toFixed(1));

    return {
      headcount: totalHeadcount,
      attendance: avgAttendance,
      payroll: (totalPayroll / 1000000).toFixed(2) + 'M',
      efficiency: averageEfficiency + '%'
    };
  }, []);

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Department ID,Department Name,Headcount,Basic Salary (THB),Overtime (Hours),Avg Attendance (%),Efficiency Index (%)\n';
    
    DEPT_STATS_DATA.forEach(row => {
      csvContent += `${row.id},${row.dept},${row.headcount},${row.salary},${row.ot},${row.attendance},${row.efficiency}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SMART_HR_Summary_Report_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'ส่งออกรายงานสรุปสำเร็จ!',
      showConfirmButton: false,
      timer: 2000
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="summary-report-page" className="flex flex-col flex-1 w-full bg-transparent px-4 sm:px-8 py-4 space-y-4 mb-12 animate-fadeIn">
      
      {/* Page Header (Transparent directly on content, height 56px, px-8, custom design style) */}
      <div id="page-header" className="flex items-center justify-between h-14 px-8 bg-transparent border-b border-white/40 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl border border-slate-200/80 bg-white/95 flex items-center justify-center text-[#212c46] shadow-sm relative overflow-hidden shrink-0">
            <BarChart3 size={20} className="text-[#b58c4f] z-10" />
            <div className="absolute inset-0 bg-[#b58c4f]/10 opacity-50 z-0"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[24px] font-black leading-none text-[#212c46] uppercase tracking-tighter">SUMMARY REPORT</h1>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">รายงานวิเคราะห์สถิติภาพรวมและต้นทุนปฏิบัติงาน</span>
          </div>
        </div>

        {/* Filters and print Actions */}
        <div className="flex items-center gap-2">
          <button 
            id="btn-print"
            onClick={handlePrint}
            className="bg-white/90 hover:bg-slate-100 border border-slate-200 p-2.5 rounded-xl hover:text-crimson text-slate-600 shadow-xs transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold uppercase"
          >
            <Printer size={15} className="text-[#3f809e]" />
            <span className="hidden md:inline">Print</span>
          </button>
          <button 
            id="btn-export"
            onClick={handleExportCSV}
            className="bg-[#212c46] hover:bg-slate-700 text-white p-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold uppercase border-none"
          >
            <Download size={15} className="text-[#b58c4f]" />
            <span className="hidden md:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Floating User Guide Button (Top 80px, right-0, py-8, px-1.5) */}
      <button
        id="floating-pdf-guide-trigger"
        onClick={() => setIsGuideOpen(true)}
        className="fixed right-0 top-[80px] z-50 bg-[#212c46] hover:bg-[#b58c4f] text-[#f3f3f1] hover:text-[#212c46] font-black uppercase text-[10px] tracking-widest rounded-l-2xl border-l-[3px] border-y border-[#b58c4f]/50 py-8 px-1.5 shadow-lg flex flex-col items-center gap-2 transform transition-all hover:-translate-x-1 duration-300 pointer-events-auto cursor-pointer"
      >
        <HelpCircle size={14} className="animate-bounce text-[#b58c4f]" />
        <span className="[writing-mode:vertical-lr] tracking-[4px] font-mono select-none font-bold">USER GUIDE</span>
      </button>

      {/* Filter Options Controls Panel */}
      <div id="filter-controls-summary" className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department (ส่วนงาน)</label>
            <select 
              id="summary-dept-select"
              value={selectedDept} 
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-[#212c46] outline-none focus:border-[#b58c4f] min-w-[140px]"
            >
              <option value="All">ALL DEPARTMENTS</option>
              <option value="Operations">OPERATIONS</option>
              <option value="Engineering">ENGINEERING</option>
              <option value="Marketing">MARKETING</option>
              <option value="Sales">SALES</option>
              <option value="Finance">FINANCE</option>
              <option value="HR & Admin">HR & ADMIN</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Year (ปีความผิดพลาด)</label>
            <select 
              id="summary-year-select"
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-[#212c46] outline-none focus:border-[#b58c4f]"
            >
              <option value="2026">2026 (พ.ศ. 2569)</option>
              <option value="2025">2025 (พ.ศ. 2568)</option>
              <option value="2024">2024 (พ.ศ. 2567)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Month (เดือนรอบบัญชี)</label>
            <select 
              id="summary-month-select"
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-[#212c46] outline-none focus:border-[#b58c4f]"
            >
              <option value="June">JUNE (มิถุนายน)</option>
              <option value="May">MAY (พฤษภาคม)</option>
              <option value="April">APRIL (เมษายน)</option>
              <option value="March">MARCH (มีนาคม)</option>
              <option value="February">FEBRUARY (กุมภาพันธ์)</option>
              <option value="January">JANUARY (มกราคม)</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] font-bold text-slate-400 font-mono flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl">
          <RefreshCw size={12} className="animate-spin text-[#b58c4f]" />
          <span>DATA ENGINE SYNCED: 100% REALTIME</span>
        </div>
      </div>

      {/* KPI Cards Row (Grid gap-4, margin bottom mb-3) */}
      <div id="kpi-cards-summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
        <KpiCard 
          label="TOTAL HEADCOUNT" 
          value={computedMetrics.headcount} 
          color={THEME.primary} 
          icon={Users} 
          description="Active working count" 
        />
        <KpiCard 
          label="AVG ATTENDANCE RATE" 
          value={computedMetrics.attendance} 
          color={THEME.skyBlue} 
          icon={Activity} 
          description="Average timing metrics" 
        />
        <KpiCard 
          label="ESTIMATED OPERATION COST" 
          value={computedMetrics.payroll} 
          color={THEME.gold} 
          icon={DollarSign} 
          description="Overtime & basic cost sum" 
        />
        <KpiCard 
          label="AVG EFFICIENCY INDEX" 
          value={computedMetrics.efficiency} 
          color={THEME.success} 
          icon={Target} 
          description="Workforce output rating" 
        />
      </div>

      {/* Charts Grid Section */}
      <div id="summary-charts-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Operations Budget Trend Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-black text-[#212c46] uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={16} className="text-[#b58c4f]" /> Operations Budget Trends (M THB)
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">เดือนมกราคม - มิถุนายน พ.ศ. 2569</p>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_TRENDS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#7a8b95" fontSize={11} tickLine={false} />
                <YAxis stroke="#7a8b95" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10, textTransform: 'uppercase' }} />
                <Bar dataKey="payroll" name="Basic Payroll" fill={THEME.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="otCost" name="Estimated OT" fill={THEME.gold} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Attendance Trend Line Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-black text-[#212c46] uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={16} className="text-[#3f809e]" /> Monthly Attendance Average (%)
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">อ้างอิงข้อมูล Geofence แบบสะท้อนจริง</p>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTHLY_TRENDS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#7a8b95" fontSize={11} tickLine={false} />
                <YAxis stroke="#7a8b95" fontSize={11} domain={[94, 100]} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="attendance" name="Attendance %" stroke={THEME.skyBlue} strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leave Category Distribution Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-black text-[#212c46] uppercase tracking-wider flex items-center gap-2">
              <LucidePieChart size={16} className="text-[#a94228]" /> Leave Category Breakdown (Days)
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">สัดส่วนรายละเอียดประเภทวันลาหยุดสะสม</p>
          </div>
          <div className="h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={LEAVE_CATEGORIES_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {LEAVE_CATEGORIES_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 justify-center pl-2">
              {LEAVE_CATEGORIES_DATA.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[10px] font-bold text-[#212c46]">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                  <span className="truncate max-w-[120px]">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Talent & Probation Analytics Grid */}
      <div id="talent-probation-analytics" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 animate-fadeIn">
        {/* Workforce Turnover Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-black text-[#212c46] uppercase tracking-wider flex items-center gap-2">
              <UserMinus size={16} className="text-[#a94228]" /> Workforce Turnover Analysis (%)
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">อัตราการลาออกของพนักงานจำแนกรายเดือน (พ.ศ. 2569)</p>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { month: 'Jan', rate: 1.2 },
                { month: 'Feb', rate: 1.5 },
                { month: 'Mar', rate: 0.8 },
                { month: 'Apr', rate: 2.1 },
                { month: 'May', rate: 1.1 },
                { month: 'Jun', rate: 0.9 }
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#7a8b95" fontSize={11} tickLine={false} />
                <YAxis stroke="#7a8b95" fontSize={11} domain={[0, 4]} tickLine={false} />
                <Tooltip formatter={(value) => [`${value}%`, 'Turnover Rate']} />
                <Line type="monotone" dataKey="rate" name="Turnover Rate" stroke={THEME.accent} strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Probation Success Rates Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-black text-[#212c46] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#657f4d]" /> Probation Completion & Success Rates (%)
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">สัดส่วนสรุปผลการผ่านทดลองงานของบุคลากร</p>
          </div>
          <div className="h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={[
                    { name: 'Passed', value: 82, color: THEME.success },
                    { name: 'Extended', value: 12, color: THEME.gold },
                    { name: 'Failed', value: 6, color: THEME.accent }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  <Cell key="cell-0" fill={THEME.success} />
                  <Cell key="cell-1" fill={THEME.gold} />
                  <Cell key="cell-2" fill={THEME.accent} />
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 justify-center pl-2">
              {[
                { name: 'Passed (82%)', color: THEME.success },
                { name: 'Extended (12%)', color: THEME.gold },
                { name: 'Failed (6%)', color: THEME.accent }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[10px] font-bold text-[#212c46]">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                  <span className="truncate max-w-[140px] uppercase font-mono">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Department Statistical Table (Last Content Block - mt-8 spacing below to keep footer away) */}
      <div id="summary-data-table-section" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-4">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-xs font-black text-[#212c46] uppercase tracking-wider">Departmental Efficiency Tracker</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">ตารางรายละเอียดวิเคราะห์สถิติจำแนกรายแผนก / ส่วนงาน</p>
          </div>
          <div className="text-[10px] bg-[#657f4d]/10 text-[#657f4d] border border-[#657f4d]/20 px-3 py-1 rounded-full font-black uppercase tracking-wide">
            ✓ Audited & Approved by HR Audit Panel
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[#212c46] uppercase font-bold text-[10px] tracking-wider bg-slate-100/50">
                <th className="py-3 px-6">ID Code</th>
                <th className="py-3 px-6">Department (ส่วนงาน)</th>
                <th className="py-3 px-6 text-center">Headcount</th>
                <th className="py-3 px-6 text-right">Basic Payroll (THB)</th>
                <th className="py-3 px-6 text-center">Overtime Hours</th>
                <th className="py-3 px-6 text-center">Avg Attendance</th>
                <th className="py-3 px-6 text-center">Efficiency Rating</th>
                <th className="py-3 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeptStats.map((item) => {
                const isHighlyEfficient = item.efficiency >= 95;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors text-[11px] font-sans font-medium text-slate-600">
                    <td className="py-3.5 px-6 font-mono font-black text-slate-400">{item.id}</td>
                    <td className="py-3.5 px-6 font-black text-[#212c46] uppercase tracking-normal">{item.dept}</td>
                    <td className="py-3.5 px-6 text-center font-bold font-mono text-slate-800">{item.headcount}</td>
                    <td className="py-3.5 px-6 text-right font-black font-mono text-[#a94228]">{(item.salary).toLocaleString()} ฿</td>
                    <td className="py-3.5 px-6 text-center font-bold font-mono text-slate-800">{item.ot} hrs</td>
                    <td className="py-3.5 px-6 text-center font-black font-mono text-[#3f809e]">{item.attendance}%</td>
                    <td className="py-3.5 px-6 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-mono font-black ${isHighlyEfficient ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                        {item.efficiency}%
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className="flex items-center justify-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${isHighlyEfficient ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-[9px] font-black uppercase text-slate-400">{isHighlyEfficient ? 'OPTIMIZED' : 'STANDARD'}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Buffer Spacing (mt-8 helps keep the final block separated from footer cleanly) */}
      <div id="footer-buffer-spacing" className="mt-8"></div>

      {/* Sliding User Guide Panel */}
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
