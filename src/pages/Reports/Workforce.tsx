import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, HelpCircle, X, CheckCircle2, Clock, Calendar, Info, 
  PieChart as LucidePieChart, BrainCircuit, UserMinus, Building2, Briefcase, 
  TrendingUp, Target, BookOpen, Key, RefreshCw, FileText, Download, Printer, 
  Percent, ShieldCheck, DollarSign, Activity, Sparkles, Sliders
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
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie
} from 'recharts';
import Swal from 'sweetalert2';
import KpiCard from '../../components/shared/KpiCard';

// --- Theme Configuration (SMART HR Navy, Gold & Forest Warm Earth Tones) ---
const THEME = {
  bgMain: 'transparent',
  primary: '#212c46', // deep navy
  primaryLight: '#4d87a8', // tech blue
  accent: '#a94228', // clay orange
  gold: '#b58c4f', // bronze gold
  success: '#657f4d', // warm forest green
  skyBlue: '#3f809e',
  dustyBlue: '#7a8b95',
  palette: [
    '#212c46', '#b58c4f', '#657f4d', '#3f809e', '#a94228',
    '#932c2e', '#4d87a8', '#b7a159', '#7a8b95', '#606a5f'
  ]
};

// --- Raw / Filterable Datasets ---
const AGE_DISTRIBUTION_DATA = [
  { group: 'Gen Z (18-25)', count: 48, color: '#3f809e' },
  { group: 'Millennials (26-40)', count: 124, color: '#212c46' },
  { group: 'Gen X (41-55)', count: 52, color: '#b58c4f' },
  { group: 'Boomers (56+)', count: 21, color: '#a94228' }
];

const CONTRACT_TYPE_DATA = [
  { name: 'Permanent (บรรจุประจำ)', value: 185, color: '#657f4d' },
  { name: 'Probation (ทดลองงาน)', value: 35, color: '#b58c4f' },
  { name: 'Contract (พนักงานสัญญาจ้าง)', value: 20, color: '#3f809e' },
  { name: 'Internship (นักศึกษาฝึกงาน)', value: 5, color: '#7a8b95' }
];

const DEPT_HEADCOUNT_STATS = [
  { id: 'WF-001', dept: 'Operations', male: 78, female: 42, total: 120, avgAge: 32, avgTenure: '4.8 Y' },
  { id: 'WF-002', dept: 'Engineering', male: 26, female: 9, total: 35, avgAge: 29, avgTenure: '3.1 Y' },
  { id: 'WF-003', dept: 'Marketing', male: 8, female: 14, total: 22, avgAge: 28, avgTenure: '1.9 Y' },
  { id: 'WF-004', dept: 'Sales', male: 20, female: 25, total: 45, avgAge: 31, avgTenure: '2.5 Y' },
  { id: 'WF-005', dept: 'Finance', male: 3, female: 9, total: 12, avgAge: 34, avgTenure: '5.2 Y' },
  { id: 'WF-006', dept: 'HR & Admin', male: 4, female: 7, total: 11, avgAge: 33, avgTenure: '6.0 Y' }
];

// --- High-detail User Guide Panel ---
function UserGuidePanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <>
      <div 
        id="guide-backdrop-workforce" 
        className={`fixed inset-0 z-[190] bg-[#212c46]/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      <div 
        id="guide-sidebar-panel-workforce" 
        className={`fixed inset-y-0 right-0 z-[200] w-full md:w-[500px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col border-l-4 border-l-[#b58c4f] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-5 px-6 border-b-2 border-l-[#b58c4f] bg-[#212c46] text-white shrink-0">
          <div>
            <h3 className="font-black flex items-center gap-3 uppercase tracking-widest text-[15px] text-[#f3f3f1]">
              <BookOpen size={20} className="text-[#b58c4f]" /> WORKFORCE REPORT GUIDE
            </h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">คู่มือวิเคราะห์โครงสร้างพิกัดกำลังพลและทรัพยากร</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-rose-500 hover:bg-white/10 rounded-xl transition-colors cursor-pointer">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 text-[#212c46] text-[12px] leading-relaxed custom-scrollbar bg-white">
          <section className="animate-fadeIn">
            <h4 className="text-[13px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-slate-100 pb-2 font-mono">
              <Users size={18} className="text-[#b58c4f]" /> 1. Demographic Breakdown standards
            </h4>
            <p className="text-[12px] mb-3 text-slate-600 font-medium font-thai">การแบ่งปันสัดส่วน Generation และความหลากหลายในที่ทำงาน:</p>
            <ul className="list-none pl-0 space-y-3 font-thai">
              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Sparkles size={16} className="shrink-0 text-amber-500 mt-0.5" /> 
                <div>
                  <strong className="text-[#212c46]">Generational Diversity:</strong> สัดส่วนพนักงานแบ่งตามทฤษฎีประชากรศาสตร์ (Baby Boomers, Gen X, Millennials, Gen Z) เพื่อใช้กำหนดนโยบายผลประโยชน์ตอบแทนให้เหมาะสม
                </div>
              </li>
              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Sliders size={16} className="shrink-0 text-[#3f809e] mt-0.5" /> 
                <div>
                  <strong className="text-[#3f809e]">Male-To-Female Balance:</strong> สถิติด้านโครงสร้างเพศเพื่อผลักดันสิทธิ์เสรีภาพความเท่าเทียมในสถานที่ทำงานอย่างถูกต้องสากล
                </div>
              </li>
            </ul>
          </section>

          <section className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <h4 className="text-[13px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-slate-100 pb-2 font-mono">
              <Briefcase size={18} className="text-[#a94228]" /> 2. Employment Contract Controls
            </h4>
            <p className="text-[12px] mb-3 text-slate-600 font-medium">การติดตามความเคลื่อนไหวทางกฎหมายสัญญาจ้าง:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 font-medium">
              <li>Permanent (พนักงานบรรจุสัญญาถาวร) ได้รับสวัสดิการโบนัสและสิทธิ์รักษาพยาบาลสมบูรณ์</li>
              <li>Probation (ระยะทดลองงาน 119 วัน) มีสถิติติดตามความคืบหน้าของคะแนนประเมินรายสัปดาห์</li>
              <li>Contract & interns สัญญาเช่าภายนอกหรือกลุ่มพัฒนาทักษะวิชาชีพสอดคล้องตามกฎหมายแรงงานไทย</li>
            </ul>
          </section>

          <section className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <h4 className="text-[13px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-slate-100 pb-2 font-mono">
              <ShieldCheck size={18} className="text-[#657f4d]" /> 3. Strategic Workforce Planning
            </h4>
            <p className="text-[12px] text-slate-600 font-medium">
              สถิติอายุงานเฉลี่ย (Avg Tenure) สามารถตรวจสอบข้อมูลเชิงประวัติการโอนย้ายเพื่อทำความเข้าใจอัตราเกาะติดงาน และใช้วางแผนทดแทนตำแหน่ง (Succession Planning) ป้องกันปัญหาขาดกำลังผลิตที่มีผลกระทบกับสายงานโรงงาน
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

export default function WorkforceReport() {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedContract, setSelectedContract] = useState<string>('All');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Filter department statistics
  const filteredDeptStats = useMemo(() => {
    if (selectedDept === 'All') return DEPT_HEADCOUNT_STATS;
    return DEPT_HEADCOUNT_STATS.filter(item => item.dept === selectedDept);
  }, [selectedDept]);

  // Compute metrics dynamically
  const computedMetrics = useMemo(() => {
    const totalHeadcount = DEPT_HEADCOUNT_STATS.reduce((acc, curr) => acc + curr.total, 0);
    const avgAge = parseFloat((DEPT_HEADCOUNT_STATS.reduce((acc, curr) => acc + curr.avgAge, 0) / DEPT_HEADCOUNT_STATS.length).toFixed(1));
    const totalMale = DEPT_HEADCOUNT_STATS.reduce((acc, curr) => acc + curr.male, 0);
    const totalFemale = DEPT_HEADCOUNT_STATS.reduce((acc, curr) => acc + curr.female, 0);
    const maleRatio = ((totalMale / totalHeadcount) * 100).toFixed(0);
    const femaleRatio = ((totalFemale / totalHeadcount) * 100).toFixed(0);

    return {
      headcount: totalHeadcount,
      avgAge: avgAge + ' ปี',
      ratio: `${maleRatio}% / ${femaleRatio}%`,
      tenure: '3.8 ปีเฉลี่ย'
    };
  }, []);

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Dept ID,Department Name,Male Staff,Female Staff,Total Headcount,Avg Age,Avg Tenure\n';
    
    DEPT_HEADCOUNT_STATS.forEach(row => {
      csvContent += `${row.id},${row.dept},${row.male},${row.female},${row.total},${row.avgAge},${row.avgTenure}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SMART_HR_Workforce_Demographic_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'ส่งออกรายงานข้อมูลจำแนกข้อมูลกำลังพลสำเร็จ!',
      showConfirmButton: false,
      timer: 2000
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="workforce-report-page" className="flex flex-col flex-1 w-full bg-transparent px-4 sm:px-8 py-4 space-y-4 mb-12 animate-fadeIn">
      
      {/* Page Header (Transparent directly on content, height 56px, px-8, custom design style) */}
      <div id="page-header" className="flex items-center justify-between h-14 px-8 bg-transparent border-b border-white/40 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl border border-slate-200/80 bg-white/95 flex items-center justify-center text-[#212c46] shadow-sm relative overflow-hidden shrink-0">
            <Users size={20} className="text-[#b58c4f] z-10" />
            <div className="absolute inset-0 bg-[#b58c4f]/10 opacity-50 z-0"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[24px] font-black leading-none text-[#212c46] uppercase tracking-tighter">WORKFORCE REPORT</h1>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">รายงานสถิติกำลังพลและประชากรศาสตร์พนักงาน</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button 
            id="btn-print-workforce"
            onClick={handlePrint}
            className="bg-white/90 hover:bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-slate-600 shadow-xs transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold uppercase"
          >
            <Printer size={15} className="text-[#3f809e]" />
            <span className="hidden md:inline">Print</span>
          </button>
          <button 
            id="btn-export-workforce"
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
        id="floating-pdf-guide-trigger-workforce"
        onClick={() => setIsGuideOpen(true)}
        className="fixed right-0 top-[80px] z-50 bg-[#212c46] hover:bg-[#b58c4f] text-[#f3f3f1] hover:text-[#212c46] font-black uppercase text-[10px] tracking-widest rounded-l-2xl border-l-[3px] border-y border-[#b58c4f]/50 py-8 px-1.5 shadow-lg flex flex-col items-center gap-2 transform transition-all hover:-translate-x-1 duration-300 pointer-events-auto cursor-pointer"
      >
        <HelpCircle size={14} className="animate-bounce text-[#b58c4f]" />
        <span className="[writing-mode:vertical-lr] tracking-[4px] font-mono select-none font-bold">USER GUIDE</span>
      </button>

      {/* Filter Controls Panel */}
      <div id="filter-controls-workforce" className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department (ส่วนงาน)</label>
            <select 
              id="workforce-dept-select"
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employment Contract (รูปแบบสัญญาจ้าง)</label>
            <select 
              id="workforce-contract-select"
              value={selectedContract} 
              onChange={(e) => setSelectedContract(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-[#212c46] outline-none focus:border-[#b58c4f] min-w-[150px]"
            >
              <option value="All">ALL CONTRACT TYPES</option>
              <option value="Permanent">PERMANENT STAFF</option>
              <option value="Probation">PROBATIONARY STAFF</option>
              <option value="Contract">CONTRACT CONTRACTORS</option>
              <option value="Internship">INTERN TRAINING</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] font-bold text-slate-400 font-mono flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl">
          <RefreshCw size={12} className="text-[#657f4d] animate-spin" />
          <span>REALTIME DB SYNC ACTIVE</span>
        </div>
      </div>

      {/* KPI Cards Row (Grid gap-4, margin bottom mb-3) */}
      <div id="kpi-cards-workforce" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
        <KpiCard 
          label="ACTIVE WORKING STAFF" 
          value={computedMetrics.headcount} 
          color={THEME.primary} 
          icon={Users} 
          description="Total permanent & contracted sum" 
        />
        <KpiCard 
          label="AVERAGE STAFF AGE" 
          value={computedMetrics.avgAge} 
          color={THEME.skyBlue} 
          icon={Activity} 
          description="Workforce maturity index" 
        />
        <KpiCard 
          label="GENDER RATIO (M / F)" 
          value={computedMetrics.ratio} 
          color={THEME.gold} 
          icon={Percent} 
          description="Diversity structural breakdown" 
        />
        <KpiCard 
          label="AVERAGE TENURE DEVIATION" 
          value={computedMetrics.tenure} 
          color={THEME.success} 
          icon={Calendar} 
          description="Staff loyalty retention average" 
        />
      </div>

      {/* Visual Analytics Grid */}
      <div id="workforce-charts-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Generational Breakdown Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-black text-[#212c46] uppercase tracking-wider flex items-center gap-2">
              <LucidePieChart size={16} className="text-[#3f809e]" /> Generational Distribution (Demographic)
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">แบ่งสัดส่วนเจเนอเรชั่นขององค์การ</p>
          </div>
          <div className="h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={AGE_DISTRIBUTION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {AGE_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 justify-center pl-2">
              {AGE_DISTRIBUTION_DATA.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[10px] font-bold text-[#212c46]">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                  <span className="truncate max-w-[120px]">{item.group}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Headcount by Department Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-black text-[#212c46] uppercase tracking-wider flex items-center gap-2">
              <Building2 size={16} className="text-[#b58c4f]" /> Department Headcount Distribution
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">จำนวนบุคลากรรายกำลังแยกตามฝ่ายงาน</p>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPT_HEADCOUNT_STATS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="dept" stroke="#7a8b95" fontSize={10} tickLine={false} />
                <YAxis stroke="#7a8b95" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10, textTransform: 'uppercase' }} />
                <Bar dataKey="male" name="Male Staff" fill={THEME.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="female" name="Female Staff" fill={THEME.skyBlue} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Contract Type Distribution Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-black text-[#212c46] uppercase tracking-wider flex items-center gap-2">
              <Briefcase size={16} className="text-[#657f4d]" /> Contract Ratio Breakdown
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">สัดส่วนรายละเอียดประเภทร่างสัญญาหลักพนักงาน</p>
          </div>
          <div className="h-[220px]" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={CONTRACT_TYPE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {CONTRACT_TYPE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 justify-center pl-2">
              {CONTRACT_TYPE_DATA.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[10px] font-bold text-[#212c46]">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                  <span className="truncate max-w-[124px]">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Department Statistical Table (Last Content Block - mt-8 spacing below to keep footer away) */}
      <div id="workforce-data-table-section" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-4">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-xs font-black text-[#212c46] uppercase tracking-wider">Demographic & Tenure Registry</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">ตารางรายละเอียดสรุปประชากรศาสตร์ความมั่นคงรายแผนก</p>
          </div>
          <div className="text-[10px] bg-[#657f4d]/10 text-[#657f4d] border border-[#657f4d]/20 px-3 py-1 rounded-full font-black uppercase tracking-wide">
            ✓ Internal Directory Policy Confirmed
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[#212c46] uppercase font-bold text-[10px] tracking-wider bg-slate-100/50">
                <th className="py-3 px-6">ID Node</th>
                <th className="py-3 px-6">Department Name (ส่วนงาน)</th>
                <th className="py-3 px-6 text-center">Male Count</th>
                <th className="py-3 px-6 text-center">Female Count</th>
                <th className="py-3 px-6 text-center">Total Workforce</th>
                <th className="py-3 px-6 text-center">Average Age</th>
                <th className="py-3 px-6 text-center">Avg Job Tenure</th>
                <th className="py-3 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeptStats.map((item) => {
                const isTenured = parseFloat(item.avgTenure) >= 3.0;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors text-[11px] font-sans font-medium text-slate-600">
                    <td className="py-3.5 px-6 font-mono font-black text-slate-400">{item.id}</td>
                    <td className="py-3.5 px-6 font-black text-[#212c46] uppercase tracking-normal">{item.dept}</td>
                    <td className="py-3.5 px-6 text-center font-mono text-[#4d87a8] font-bold">{item.male}</td>
                    <td className="py-3.5 px-6 text-center font-mono text-[#a94228] font-bold">{item.female}</td>
                    <td className="py-3.5 px-6 text-center font-black font-mono text-slate-800">{item.total}</td>
                    <td className="py-3.5 px-6 text-center font-bold font-mono">{item.avgAge} ปี</td>
                    <td className="py-3.5 px-6 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-mono font-black ${isTenured ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                        {item.avgTenure}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className="flex items-center justify-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${isTenured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-[9px] font-black uppercase text-slate-400">{isTenured ? 'STABLE' : 'YOUTH'}</span>
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
      <div id="footer-buffer-spacing-workforce" className="mt-8"></div>

      {/* Sliding User Guide Panel */}
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
