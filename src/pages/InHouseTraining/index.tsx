import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { SchemaAwareDataService } from '../../services/schemaAwareDataService';
import { DraggableModal } from '../../components/shared/DraggableModal';
import KpiCard from '../../components/shared/KpiCard';
import { useLanguage } from '../../context/LanguageContext';
import { PrintPreviewModal } from '../../components/shared/PrintPreviewModal';
import { PrintableReport } from '../../components/shared/PrintableReport';
import { registerPrintLog } from '../../utils/printLogger';
import Swal from 'sweetalert2';

interface InHouseSession {
  id: string;
  courseName: string;
  trainerName: string;
  department: string;
  date: string;
  startTime: string;
  endTime: string;
  participantsCount: number;
  cost: number;
  status: 'Draft' | 'Scheduled' | 'In Progress' | 'Completed';
  location: string;
  avgScore: number;
  remarks: string;
}

const DEFAULT_SESSIONS: InHouseSession[] = [
  {
    id: 'TS-001',
    courseName: 'Smart Leadership & Team Coaching Skills',
    trainerName: 'คุณสมภพ เดชากร',
    department: 'Smart Management',
    date: '2026-06-15',
    startTime: '09:00',
    endTime: '16:00',
    participantsCount: 15,
    cost: 15000,
    status: 'Scheduled',
    location: 'ห้องประชุมใหญ่ ชั้น 3',
    avgScore: 0,
    remarks: 'อบรมพัฒนาทักษะความเป็นผู้นำของผู้จัดการฝ่ายและหัวหน้าแผนก'
  },
  {
    id: 'TS-002',
    courseName: 'ISO 14001:2015 Environmental System Standard',
    trainerName: 'อ.เกรียงศักดิ์ คมดี',
    department: 'Quality Assurance',
    date: '2026-06-20',
    startTime: '13:00',
    endTime: '17:00',
    participantsCount: 25,
    cost: 8000,
    status: 'Scheduled',
    location: 'ห้องสัมมนา IT Training Suite',
    avgScore: 0,
    remarks: 'ปูพื้นฐานและข้อกำหนดด้านกฎหมายสิ่งแวดล้อมสำหรับผู้ตรวจประเมินภายใน'
  },
  {
    id: 'TS-003',
    courseName: 'Basic Safety & First Aid Awareness (อบรมจป.ทั่วไป)',
    trainerName: 'คุณรดาวรรณ เกื้อจิตร์',
    department: 'Production & Safety',
    date: '2026-05-18',
    startTime: '09:00',
    endTime: '12:00',
    participantsCount: 30,
    cost: 0,
    status: 'Completed',
    location: 'อาคารเอนกประสงค์ โรงงาน 1',
    avgScore: 4.8,
    remarks: 'อบรมการซ้อมแผนปฐมพยาบาลเบื้องต้นประจำปี คอร์สบังคับกฎหมายแรงงาน'
  }
];

// --- User Guide Panel for In-House Training ---
function UserGuidePanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <>
      <div className={`fixed inset-0 z-[190] bg-[#212c46]/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose}/>
      <div className={`fixed inset-y-0 right-0 z-[200] w-full md:w-[500px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col border-l-4 border-[#657f4d] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex justify-between items-center p-5 px-6 border-b-2 border-[#657f4d] bg-[#212c46] text-white shrink-0">
          <div>
            <h3 className="font-black flex items-center gap-3 uppercase tracking-widest text-[15px]"><Icons.BookOpen size={20} className="text-[#657f4d]"/> IN-HOUSE TRAINING GUIDE</h3>
            <p className="text-[11px] font-bold text-[#d7d7d7] uppercase tracking-widest mt-1">คู่มือหลักสูตรฝึกอบรมภายใน</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-[#932c2e] hover:bg-white/10 rounded-xl transition-colors"><Icons.X size={24}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8 text-[#414757] text-[12px] leading-relaxed custom-scrollbar bg-white animate-fadeIn">
          <section>
            <h4 className="text-[13px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-[#eaeaec] pb-2 font-mono">
              <Icons.GraduationCap size={18} className="text-[#657f4d]"/> 1. ทัศนวิสัยและการจดบันทึกคอร์ส
            </h4>
            <p className="text-[12px] mb-2 font-sans text-[#525a72]">
              เป็นเมนูบันทึก คอร์สฝึกอบรมภายในบริษัท เพื่อสร้างความชำนาญการ และจัดอบรมตามกรอบความปลอดภัยตามกฎหมายเป็นหลัก
            </p>
            <ul className="list-none pl-0 space-y-2 mt-2">
              <li className="flex items-start gap-2 bg-[#f8f9fa] p-3 rounded-xl border border-[#eaeaec]">
                <Icons.Plus size={16} className="shrink-0 text-[#657f4d] mt-0.5" />
                <span>การลงทะเบียนเพิ่มคอร์ส: ทำได้ผ่านหัวข้อปุ่ม <strong>+ ADD NEW SESSION</strong> โดยมีกรอกวิทยากร ค่าใช้จ่ายร่วม และรหัสสถานะเป็นสำคัญ</span>
              </li>
              <li className="flex items-start gap-2 bg-[#f8f9fa] p-3 rounded-xl border border-[#eaeaec]">
                <Icons.Target size={16} className="shrink-0 text-[#b58c4f] mt-0.5" />
                <span>ค่าใช้จ่ายแฝง: บันทึกข้อมูลค่าใช้จ่ายและงบประมาณเพื่อสรุปงบจัดสรรในการประชุมผู้บริหาร</span>
              </li>
            </ul>
          </section>

          <section>
            <h4 className="text-[13px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-[#eaeaec] pb-2 font-mono">
              <Icons.ShieldAlert size={18} className="text-[#a94228]"/> 2. วงจรสถานะงานสัมมนา (Status Lifecycle)
            </h4>
            <p className="text-[11px] text-[#7a8b95] uppercase tracking-wide mb-2">พนักงานฝึกอบรมดูแลความคืบหน้ารายงานสำคัญผ่าน 4 ระดับ:</p>
            <div className="space-y-2">
              <div className="p-3 bg-[#e0f2fe]/40 rounded-xl border border-[#e0f2fe]">
                <span className="font-extrabold text-[#0369a1] text-[11px] block">DRAFT / SCHEDULED</span>
                ขั้นตอนเตรียมการและการจองนัดหมายพนักงานล่วงหน้า
              </div>
              <div className="p-3 bg-[#fef3c7]/40 rounded-xl border border-[#fef3c7]">
                <span className="font-extrabold text-[#b45309] text-[11px] block">IN PROGRESS</span>
                ช่วงระยะเวลาพนักงานกำลังร่วมชั้นเรียนตามกำหนดการสัมมนาหลัก
              </div>
              <div className="p-3 bg-[#dcfce7]/40 rounded-xl border border-[#dcfce7]">
                <span className="font-extrabold text-[#15803d] text-[11px] block">COMPLETED</span>
                หลักสูตรเรียบร้อย และประเมินคะแนนสรุปย้อนหลังเป็นสถิติองค์การ
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-[13px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-[#eaeaec] pb-2 font-mono">
              <Icons.FileSpreadsheet size={18} className="text-[#3f809e]"/> 3. การพิมพ์รายงานและ KPI Analytics
            </h4>
            <p className="text-[12px] text-[#525a72]">
              ผู้ดูแลสามารถสืบค้น ค้นหาคอร์สด้วยชื่อ ยึดตารางแบบเรียบง่ายและสามารถคลิกปุ่ม <strong>PRINT GUIDE REPORT</strong> เพื่อจัดเก็บเป็นต้นแบบบำรุงทรัพยากรบุคคล
            </p>
          </section>
        </div>
        
        <div className="p-4 bg-[#f8f9fa] border-t border-[#eaeaec] flex justify-end shrink-0">
          <button onClick={onClose} className="px-8 py-2.5 bg-[#212c46] text-white font-black rounded-xl uppercase text-[11px] hover:bg-[#414757] hover:text-white transition-all shadow-md tracking-[0.1em] cursor-pointer">รับทราบ (Got it)</button>
        </div>
      </div>
    </>, document.body
  );
}

export default function InHouseTraining() {
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<InHouseSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<Partial<InHouseSession>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Load In-House Training from auto-provisioning service
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await SchemaAwareDataService.getAll('InHouseTraining', DEFAULT_SESSIONS);
      setSessions(data);
    } catch (err) {
      console.error('Failed to load in-house sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper for date extraction
  const checkMonthYear = (dateStr: string | undefined, mFilter: string, yFilter: string) => {
    if (!dateStr) return true;
    const parts = dateStr.split('-');
    const y = parts[0];
    const m = parts[1];
    const mMatch = mFilter === 'All' || m === mFilter;
    const yMatch = yFilter === 'All' || y === yFilter;
    return mMatch && yMatch;
  };

  const yearsList = useMemo(() => {
    const yrs = new Set<string>();
    sessions.forEach(s => { if (s.date) yrs.add(s.date.split('-')[0]); });
    yrs.add('2026');
    return ['All', ...Array.from(yrs).sort()];
  }, [sessions]);

  const months = useMemo(() => [
    { value: 'All', label_en: 'All Months', label_th: 'ทุกเดือน' },
    { value: '01', label_en: 'January', label_th: 'มกราคม' },
    { value: '02', label_en: 'February', label_th: 'กุมภาพันธ์' },
    { value: '03', label_en: 'March', label_th: 'มีนาคม' },
    { value: '04', label_en: 'April', label_th: 'เมษายน' },
    { value: '05', label_en: 'May', label_th: 'พฤษภาคม' },
    { value: '06', label_en: 'June', label_th: 'มิถุนายน' },
    { value: '07', label_en: 'July', label_th: 'กรกฎาคม' },
    { value: '08', label_en: 'August', label_th: 'สิงหาคม' },
    { value: '09', label_en: 'September', label_th: 'กันยายน' },
    { value: '10', label_en: 'October', label_th: 'ตุลาคม' },
    { value: '11', label_en: 'November', label_th: 'พฤศจิกายน' },
    { value: '12', label_en: 'December', label_th: 'ธันวาคม' }
  ], []);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: sessions.length, Draft: 0, Scheduled: 0, 'In Progress': 0, Completed: 0 };
    sessions.forEach(s => { if (s.status in counts) counts[s.status]++; });
    return counts;
  }, [sessions]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchSearch = 
        s.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.trainerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'All' ? true : s.status === statusFilter;
      const matchDate = checkMonthYear(s.date, selectedMonth, selectedYear);
      return matchSearch && matchStatus && matchDate;
    });
  }, [sessions, searchTerm, statusFilter, selectedMonth, selectedYear]);

  // Statistics
  const stats = useMemo(() => {
    const total = sessions.length;
    const scheduled = sessions.filter(s => s.status === 'Scheduled').length;
    const completed = sessions.filter(s => s.status === 'Completed').length;
    const participants = sessions.reduce((sum, s) => sum + (Number(s.participantsCount) || 0), 0);
    const totalCost = sessions.reduce((sum, s) => sum + (Number(s.cost) || 0), 0);
    
    return { total, scheduled, completed, participants, totalCost };
  }, [sessions]);

  // Handle Create or Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession.courseName || !currentSession.trainerName || !currentSession.date) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Required Fields',
        text: 'Please input Course Name, Trainer Name, and Date.'
      });
      return;
    }

    const sessionToSave: InHouseSession = {
      id: currentSession.id || `TS-${Math.floor(100 + Math.random() * 900)}`,
      courseName: currentSession.courseName,
      trainerName: currentSession.trainerName,
      department: currentSession.department || 'General',
      date: currentSession.date,
      startTime: currentSession.startTime || '09:00',
      endTime: currentSession.endTime || '16:00',
      participantsCount: Number(currentSession.participantsCount) || 0,
      cost: Number(currentSession.cost) || 0,
      status: (currentSession.status || 'Draft') as any,
      location: currentSession.location || '',
      avgScore: Number(currentSession.avgScore) || 0,
      remarks: currentSession.remarks || ''
    };

    setIsLoading(true);
    const response = await SchemaAwareDataService.save('InHouseTraining', sessionToSave);
    setIsLoading(false);

    if (response.status === 'success') {
      Swal.fire({
        icon: 'success',
        title: 'Data Saved Successfully',
        text: response.message,
        confirmButtonColor: '#212c46'
      });
      setIsModalOpen(false);
      setCurrentSession({});
      loadData();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: response.message
      });
    }
  };

  // Log Print Activity to tracked table in System Logs
  const triggerPrintLogging = () => {
    registerPrintLog('In-House Training Directory');
    setIsPrintOpen(true);
  };

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 font-sans text-left min-h-screen">
      
      {/* 1. Header user guide floating tab */}
      <button 
        onClick={() => setIsGuideOpen(true)} 
        className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#657f4d] hover:text-white hover:border-[#657f4d] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group cursor-pointer" 
        style={{ top: '80px' }}
      >
        <Icons.HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
        <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[11px] font-mono">USER GUIDE</span>
      </button>

      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Header section representing the executive style */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0 bg-transparent">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center cursor-default shrink-0">
            <div className="absolute inset-0 bg-[#657f4d] blur-[15px] opacity-20 rounded-full"></div>
            <div className="relative z-10 w-10 h-10 border border-slate-200 rounded-2xl bg-white/50 backdrop-blur-sm shadow-sm flex items-center justify-center">
              <Icons.GraduationCap size={20} strokeWidth={2.5} className="text-[#657f4d]" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
              หลักสูตรฝึกอบรมภายใน <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#657f4d] to-[#b58c4f]">IN-HOUSE TRAINING DIRECTORY</span>
            </h3>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mt-0.5 leading-none">
              internal capability coaching, safety certifications & organizational workshops
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 w-full mt-[2px] space-y-4">
        {/* KPI Cards section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
          <KpiCard 
            title="TOTAL REGISTERED SESSIONS"
            value={stats.total}
            color="#3f809e"
            icon={Icons.ListCollapse}
            description="Total training session entries logged"
          />
          <KpiCard 
            title="SCHEDULED EVENTS"
            value={stats.scheduled}
            color="#b58c4f"
            icon={Icons.CalendarClock}
            description="Inbound slated sessions"
          />
          <KpiCard 
            title="TOTAL TRAINED ASSOCIATES"
            value={stats.participants}
            color="#657f4d"
            icon={Icons.Sparkles}
            description="Count of participant sign-ups"
          />
          <KpiCard 
            title="INVESTED COGNITIVE COSTS"
            value={`${stats.totalCost.toLocaleString()} ฿`}
            color="#a94228"
            icon={Icons.Coins}
            description="Total course expense registry"
          />
        </div>

      {/* Main training table with integrated controls */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" id="inhouse-integrated-registry">
        {/* Unified Tool and Filter Header */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex flex-col xl:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 w-full xl:w-auto items-center">
            <span className="text-[#212c46] font-black text-xs uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1.5 font-sans">
              <Icons.Library size={14} className="text-[#3f809e]"/> Registry List ({filteredSessions.length})
            </span>
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <input
                type="text"
                placeholder="Search by course or trainer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#212c46]/10 focus:border-[#212c46] bg-white"
              />
              <Icons.Search size={14} className="absolute left-3 top-3 text-slate-400" />
            </div>

            {/* Status filter with counts */}
            <div className="flex items-center gap-1.5 bg-white border border-[#eaeaec] px-3.5 py-2 rounded-xl shadow-xs">
              <Icons.CheckCircle size={13} className="text-emerald-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:outline-none"
              >
                <option value="All">All Statuses ({statusCounts['All']})</option>
                <option value="Draft">Draft ({statusCounts['Draft']})</option>
                <option value="Scheduled">Scheduled ({statusCounts['Scheduled']})</option>
                <option value="In Progress">In Progress ({statusCounts['In Progress']})</option>
                <option value="Completed">Completed ({statusCounts['Completed']})</option>
              </select>
              <span className="shrink-0 bg-[#212c46] text-white font-mono text-[9px] px-1.5 py-0.5 rounded-md font-black min-w-[20px] text-center">
                {statusCounts[statusFilter] || statusCounts['All'] || 0}
              </span>
            </div>

            {/* Date picker for month and year */}
            <div className="bg-white border border-[#eaeaec] px-3.5 py-2 rounded-xl shadow-xs flex items-center justify-between gap-1.5">
              <span className="text-[10px] font-black uppercase text-[#525f7a] tracking-wider shrink-0 flex items-center gap-1 font-mono">
                <Icons.Calendar size={13} className="text-[#b58c4f]" /> SCHEDULED
              </span>
              <div className="flex items-center gap-1">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-[#f8f9fc] border border-[#eaeaec] px-1.5 py-0.5 rounded-lg text-[10.5px] font-bold text-[#212c46] outline-none cursor-pointer focus:border-[#709654]"
                >
                  <option value="All">{useLanguage().language === 'TH' ? 'ทุกเดือน' : 'All Months'}</option>
                  {months.filter(m => m.value !== 'All').map(m => (
                    <option key={m.value} value={m.value}>
                      {useLanguage().language === 'TH' ? m.label_th : m.label_en}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-[#f8f9fc] border border-[#eaeaec] px-1.5 py-0.5 rounded-lg text-[10.5px] font-bold text-[#212c46] outline-none cursor-pointer focus:border-[#709654]"
                >
                  <option value="All">{useLanguage().language === 'TH' ? 'ทุกปี' : 'All'}</option>
                  {yearsList.filter(y => y !== 'All').map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 w-full xl:w-auto justify-end">
            <button
              onClick={triggerPrintLogging}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white text-slate-700 font-extrabold uppercase text-[10px] tracking-widest rounded-xl border border-slate-200/80 hover:bg-slate-50 cursor-pointer shadow-sm active:scale-95 transition-all w-full sm:w-auto justify-center"
            >
              <Icons.Printer size={13} className="text-slate-500" />
              Print Report
            </button>
            <button
              onClick={() => {
                setCurrentSession({});
                setIsEditing(false);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#212c46] text-[#b58c4f] font-extrabold uppercase text-[10px] tracking-widest rounded-xl border border-[#b58c4f]/20 hover:bg-[#b58c4f] hover:text-[#212c46] cursor-pointer shadow-sm active:scale-95 transition-all w-full sm:w-auto justify-center"
            >
              <Icons.Plus size={13} />
              Add Session (Auto-Provision)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 font-semibold text-[10px] text-slate-400 uppercase tracking-widest">
                <th className="py-3 px-4 text-left">Session ID</th>
                <th className="py-3 px-4 text-left">Course & Topic Name</th>
                <th className="py-3 px-4 text-left">Assigned Trainer</th>
                <th className="py-3 px-4 text-left">Department</th>
                <th className="py-3 px-4 text-center">Date & Time</th>
                <th className="py-3 px-4 text-right">Participants</th>
                <th className="py-3 px-4 text-right">Investment</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-slate-700">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center font-bold text-slate-400 uppercase tracking-wider">
                    No in-house sessions found matching criteria
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const isCompleted = session.status === 'Completed';
                  const isScheduled = session.status === 'Scheduled';
                  const isInProgress = session.status === 'In Progress';
                  
                  return (
                    <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-black text-slate-500">{session.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-[#212c46] leading-none">{session.courseName}</div>
                        <span className="text-[9px] text-[#7a8b95] font-semibold uppercase leading-none mt-1 inline-block">
                          📍 {session.location || 'Undecided Location'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold">{session.trainerName}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[9.5px] font-bold text-slate-600 uppercase tracking-wider">
                          {session.department}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="font-bold">{session.date}</div>
                        <span className="text-[9px] text-gray-400 font-mono">
                          {session.startTime} - {session.endTime}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold pr-8">{session.participantsCount}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold pr-6">
                        {session.cost ? `${session.cost.toLocaleString()} ฿` : 'Free'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 text-[8.5px] font-black rounded-full uppercase tracking-wider border ${
                          isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          isScheduled ? 'bg-sky-50 text-sky-700 border-sky-100' :
                          isInProgress ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' :
                          'bg-slate-50 text-slate-600 border-slate-100'
                        }`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => {
                              setCurrentSession(session);
                              setIsEditing(true);
                              setIsModalOpen(true);
                            }}
                            className="p-1 bg-[#212c46]/5 hover:bg-[#212c46]/10 text-[#212c46] rounded-md transition-colors cursor-pointer"
                            title="Edit In-house Training Details"
                          >
                            <Icons.Edit3 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Draggable Modal */}
      <DraggableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? `Edit In-House Training Session` : `New In-House Academy (Auto-Provision)`}
      >
        <form onSubmit={handleSubmit} className="p-6 max-h-[85vh] overflow-y-auto font-sans flex flex-col gap-4 text-left">
          <div className="bg-[#212c46] text-white p-3.5 rounded-xl mb-2 text-left relative overflow-hidden">
            <p className="text-[9px] text-[#b58c4f] font-black uppercase tracking-widest mb-1">GOOGLE SHEETS SCHEMATIC DEPLOY</p>
            <p className="text-[10px] leading-relaxed text-gray-300">
              Saving triggers dynamic sheet checking. If sheet <strong className="text-white">'InHouseTraining'</strong> is absent, it creates it instantly, freeze rows, and styles colors.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Session ID (Leave blank to auto-generate)</label>
              <input
                type="text"
                value={currentSession.id || ''}
                readOnly={isEditing}
                onChange={(e) => setCurrentSession(p => ({ ...p, id: e.target.value }))}
                placeholder="e.g. TS-004"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#212c46] bg-slate-50/70"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Course Name *</label>
              <input
                type="text"
                required
                value={currentSession.courseName || ''}
                onChange={(e) => setCurrentSession(p => ({ ...p, courseName: e.target.value }))}
                placeholder="e.g. ISO 9001 Process Excellence"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#212c46]"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Assigned Trainer Name *</label>
              <input
                type="text"
                required
                value={currentSession.trainerName || ''}
                onChange={(e) => setCurrentSession(p => ({ ...p, trainerName: e.target.value }))}
                placeholder="e.g. ดร.อนันต์ บูรณะ"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#212c46]"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Target Department</label>
              <input
                type="text"
                value={currentSession.department || ''}
                onChange={(e) => setCurrentSession(p => ({ ...p, department: e.target.value }))}
                placeholder="e.g. Smart Management"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Date *</label>
              <input
                type="date"
                required
                value={currentSession.date || ''}
                onChange={(e) => setCurrentSession(p => ({ ...p, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#212c46]"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Start Time</label>
              <input
                type="time"
                value={currentSession.startTime || '09:00'}
                onChange={(e) => setCurrentSession(p => ({ ...p, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">End Time</label>
              <input
                type="time"
                value={currentSession.endTime || '16:00'}
                onChange={(e) => setCurrentSession(p => ({ ...p, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Participants count</label>
              <input
                type="number"
                min="0"
                value={currentSession.participantsCount || 0}
                onChange={(e) => setCurrentSession(p => ({ ...p, participantsCount: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Course Cost (THB)</label>
              <input
                type="number"
                min="0"
                value={currentSession.cost || 0}
                onChange={(e) => setCurrentSession(p => ({ ...p, cost: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Status</label>
              <select
                value={currentSession.status || 'Draft'}
                onChange={(e) => setCurrentSession(p => ({ ...p, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-xs font-semibold"
              >
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Location / Suite</label>
              <input
                type="text"
                value={currentSession.location || ''}
                onChange={(e) => setCurrentSession(p => ({ ...p, location: e.target.value }))}
                placeholder="e.g. Meeting Hall 2"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Average Evaluation Rating (0.0 - 5.0)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={currentSession.avgScore || 0}
                onChange={(e) => setCurrentSession(p => ({ ...p, avgScore: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Remarks & Details</label>
              <textarea
                value={currentSession.remarks || ''}
                onChange={(e) => setCurrentSession(p => ({ ...p, remarks: e.target.value }))}
                placeholder="Remarks regarding course details, materials..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#212c46]"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-black uppercase text-slate-500 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-[#212c46] text-white font-black uppercase text-xs rounded-lg hover:bg-opacity-90 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Deploy & Synchronize'}
            </button>
          </div>
        </form>
      </DraggableModal>

      {/* Fully Functional Print Report Preview Modal */}
      <PrintPreviewModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        title="In-House Training Directory Report"
        documentId="TAI-IHT-2026-06"
        defaultWatermark="OFFICIAL"
      >
        <PrintableReport
          title="IN-HOUSE TRAINING DIRECTORY"
          subtitle="Internal Capability Coaching, Safety Certifications & Corporate Workshops Status report"
          documentId="TAI-IHT-2026-06"
        >
          <div className="mt-4">
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-300 font-bold text-slate-800 uppercase tracking-wider text-left">
                  <th className="p-2 border border-slate-300 text-[9px]">Session ID</th>
                  <th className="p-2 border border-slate-300 text-[9px]">Course & Topic Name</th>
                  <th className="p-2 border border-slate-300 text-[9px]">Trainer</th>
                  <th className="p-2 border border-slate-300 text-[9px]">Dept</th>
                  <th className="p-2 border border-slate-300 text-[9px]">Date & Time</th>
                  <th className="p-2 border border-slate-300 text-center text-[9px]">Participants</th>
                  <th className="p-2 border border-slate-300 text-right text-[9px]">Cost (฿)</th>
                  <th className="p-2 border border-slate-300 text-center text-[9px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="text-[9px] hover:bg-slate-50/50">
                    <td className="p-2 border border-slate-200 font-mono font-bold text-slate-600">{session.id}</td>
                    <td className="p-2 border border-slate-200">
                      <div className="font-bold text-slate-900">{session.courseName}</div>
                      <span className="text-[8px] text-slate-500">📍 {session.location || 'Undecided Location'}</span>
                    </td>
                    <td className="p-2 border border-slate-200">{session.trainerName}</td>
                    <td className="p-2 border border-slate-200 font-semibold">{session.department}</td>
                    <td className="p-2 border border-slate-200">{session.date} ({session.startTime} - {session.endTime})</td>
                    <td className="p-2 border border-slate-200 text-center">{session.participantsCount}</td>
                    <td className="p-2 border border-slate-200 text-right font-mono">{session.cost ? session.cost.toLocaleString() : 'Free'}</td>
                    <td className="p-2 border border-slate-200 text-center font-bold">{session.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PrintableReport>
      </PrintPreviewModal>
      </div>
    </div>
  );
}
