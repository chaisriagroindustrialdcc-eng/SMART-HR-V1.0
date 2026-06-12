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

interface PublicSeminar {
  id: string;
  courseName: string;
  organizer: string;
  employeeId: string;
  employeeName: string;
  department: string;
  startDate: string;
  endDate: string;
  registrationFee: number;
  status: 'Pending Approval' | 'Approved' | 'Attended' | 'Rejected' | 'Cancelled';
  approver: string;
  remarks: string;
}

const DEFAULT_SEMINARS: PublicSeminar[] = [
  {
    id: 'PB-001',
    courseName: 'PDPA Compliance for HR Professionals (พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล)',
    organizer: 'สถาบันมาตรฐานการทำงานแห่งประเทศไทย',
    employeeId: 'EMP-005',
    employeeName: 'คุณอุมาพร สมฤดี',
    department: 'Smart Management',
    startDate: '2026-06-18',
    endDate: '2026-06-19',
    registrationFee: 4500,
    status: 'Approved',
    approver: 'คุณสมภพ (Director)',
    remarks: 'อบรมมาตรการคุ้มครองข้อมูลส่วนบุคคลในการจ้างงานและการเก็บบันทึกประวัติ'
  },
  {
    id: 'PB-002',
    courseName: 'Advance Tax Planning & Corporate Law 2026',
    organizer: 'Thailand Federation of Accountants',
    employeeId: 'EMP-012',
    employeeName: 'คุณกิตติศักดิ์ พูลเพิ่ม',
    department: 'Finance & Accounts',
    startDate: '2026-07-02',
    endDate: '2026-07-03',
    registrationFee: 6000,
    status: 'Pending Approval',
    approver: 'คุณรพีพร (CFO)',
    remarks: 'วางแผนเพื่อปรับปรุงการลดหย่อนภาษีสรรพากรสำหรับคู่สัญญากลุ่มอุตสาหกรรมร่วม'
  },
  {
    id: 'PB-003',
    courseName: 'Modern Strategic Talent Acquisition and AI Recruitment',
    organizer: 'HR Association of Thailand (PMAT)',
    employeeId: 'EMP-008',
    employeeName: 'คุณสาวิตรี แก้วรุ่ง',
    department: 'Smart Management',
    startDate: '2026-05-10',
    endDate: '2026-05-11',
    registrationFee: 5500,
    status: 'Attended',
    approver: 'คุณสมจิตร์ (HR Director)',
    remarks: 'การสรรหาผู้สมัครเชิงรุกด้วยแชตบอทและ AI เพื่อเพิ่มประสิทธิภาพคัดกรองเรซูเม่'
  }
];

// --- User Guide Panel for Public & Seminar ---
function UserGuidePanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <>
      <div className={`fixed inset-0 z-[190] bg-[#212c46]/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose}/>
      <div className={`fixed inset-y-0 right-0 z-[200] w-full md:w-[500px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col border-l-4 border-[#b58c4f] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex justify-between items-center p-5 px-6 border-b-2 border-[#b58c4f] bg-[#212c46] text-white shrink-0">
          <div>
            <h3 className="font-black flex items-center gap-3 uppercase tracking-widest text-[15px]"><Icons.BookOpen size={20} className="text-[#b58c4f]"/> PUBLIC SEMINAR GUIDE</h3>
            <p className="text-[11px] font-bold text-[#d7d7d7] uppercase tracking-widest mt-1">คู่มือหลักสูตรสัมมนาภายนอก</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-[#932c2e] hover:bg-white/10 rounded-xl transition-colors"><Icons.X size={24}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8 text-[#414757] text-[12px] leading-relaxed custom-scrollbar bg-white animate-fadeIn">
          <section>
            <h4 className="text-[13px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-[#eaeaec] pb-2 font-mono">
              <Icons.BookmarkCheck size={18} className="text-[#b58c4f]"/> 1. แผนภูมิการสัมมนาจากภายนอก
            </h4>
            <p className="text-[12px] mb-2 font-sans text-[#525a72]">
              เป็นเมนูบันทึกและอนุมัติหลักสูตรที่บุคลากรภายนอกจัดขึ้น เช่น สถาบันวิชาชีพ, มหาวิทยาลัย หรือหน่วยราชการ เพื่อนำมาเบิกค่าธรรมเนียมสมัครเรียนอบรม
            </p>
            <ul className="list-none pl-0 space-y-2 mt-2">
              <li className="flex items-start gap-2 bg-[#f8f9fa] p-3 rounded-xl border border-[#eaeaec]">
                <Icons.Plus size={16} className="shrink-0 text-[#b58c4f] mt-0.5" />
                <span>เพิ่มข้อมูลคอร์ส: ทำได้ผ่านหัวข้อปุ่ม <strong>+ RECORD NEW SEMINAR</strong> โดยระบุถึงผู้ให้บริการ, สถานะเบิกจ่ายพนักงานอบรม และใบอนุญาตอย่างครบถ้วน</span>
              </li>
              <li className="flex items-start gap-2 bg-[#f8f9fa] p-3 rounded-xl border border-[#eaeaec]">
                <Icons.Coins size={16} className="shrink-0 text-[#657f4d] mt-0.5" />
                <span>ใบเสร็จ / บันทึกงบ: จัดสรรงบประหยัดต้นทุน และตรวจสอบค่าลงทะเบียนรวมเพื่อเปรียบเทียบความคุ้มค่า</span>
              </li>
            </ul>
          </section>

          <section>
            <h4 className="text-[13px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-[#eaeaec] pb-2 font-mono">
              <Icons.ShieldCheck size={18} className="text-[#657f4d]"/> 2. วงจรออนไลน์การอนุมัติ (Registration Lifecycle Management)
            </h4>
            <div className="space-y-2">
              <div className="p-3 bg-[#fef3c7]/40 rounded-xl border border-[#fef3c7] flex justify-between items-center">
                <span>PENDING APPROVAL: รอพิจารณางบประมาณ</span>
                <span className="text-amber-600 font-extrabold text-[10px]">ตรวจสอบ</span>
              </div>
              <div className="p-3 bg-[#e0f1e8] rounded-xl border border-[#c2ebd5] flex justify-between items-center">
                <span>APPROVED: อนุมัติการเข้าเรียน</span>
                <span className="text-emerald-700 font-extrabold text-[10px]">อนุมัติแล้ว</span>
              </div>
              <div className="p-3 bg-[#f1f5f9] rounded-xl border border-[#e2e8f0] flex justify-between items-center">
                <span>ATTENDED: ไปร่วมเสร็จสิ้นและตรวจใบรับรอง</span>
                <span className="text-[#212c46] font-extrabold text-[10px]">ยืนยันการเรียน</span>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-[13px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-[#eaeaec] pb-2 font-mono">
              <Icons.FileSpreadsheet size={18} className="text-[#a94228]"/> 3. สิทธิ์ลดหย่อนและรายงาน
            </h4>
            <p className="text-[12px] text-[#525a72]">
              ข้อมูลส่วนนี้เป็นข้อมูลลดหย่อนภาษี 200% ด้วยพระราชบัญญัติพัฒนาฝีมือแรงงาน สามารถคลิกพิมพ์รายงานได้ผ่าน <strong>PRINT GUIDE REPORT</strong>
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

export default function PublicSeminar() {
  const { t } = useLanguage();
  const [seminars, setSeminars] = useState<PublicSeminar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [currentSeminar, setCurrentSeminar] = useState<Partial<PublicSeminar>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Load Public & Seminar from Schema Aware service
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await SchemaAwareDataService.getAll('PublicSeminar', DEFAULT_SEMINARS);
      setSeminars(data);
    } catch (err) {
      console.error('Failed to load public seminars:', err);
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
    seminars.forEach(s => { if (s.date) yrs.add(s.date.split('-')[0]); });
    yrs.add('2026');
    return ['All', ...Array.from(yrs).sort()];
  }, [seminars]);

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
    const counts: Record<string, number> = { All: seminars.length, 'Pending Approval': 0, Approved: 0, Attended: 0, Rejected: 0 };
    seminars.forEach(s => { if (s.status in counts) counts[s.status]++; });
    return counts;
  }, [seminars]);

  // Filter lists
  const filteredSeminars = useMemo(() => {
    return seminars.filter(s => {
      const matchSearch =
        s.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.organizer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'All' ? true : s.status === statusFilter;
      const matchDate = checkMonthYear(s.date, selectedMonth, selectedYear);
      return matchSearch && matchStatus && matchDate;
    });
  }, [seminars, searchTerm, statusFilter, selectedMonth, selectedYear]);

  // Counting parameters
  const stats = useMemo(() => {
    const total = seminars.length;
    const pending = seminars.filter(s => s.status === 'Pending Approval').length;
    const approved = seminars.filter(s => s.status === 'Approved' || s.status === 'Attended').length;
    const totalFee = seminars.reduce((sum, s) => sum + (Number(s.registrationFee) || 0), 0);
    
    return { total, pending, approved, totalFee };
  }, [seminars]);

  // Handle Save
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSeminar.courseName || !currentSeminar.organizer || !currentSeminar.employeeName) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Key Information',
        text: 'Please input Course Name, Organizer, and Employee Name.'
      });
      return;
    }

    const seminarToSave: PublicSeminar = {
      id: currentSeminar.id || `PB-${Math.floor(100 + Math.random() * 900)}`,
      courseName: currentSeminar.courseName,
      organizer: currentSeminar.organizer,
      employeeId: currentSeminar.employeeId || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      employeeName: currentSeminar.employeeName,
      department: currentSeminar.department || 'General',
      startDate: currentSeminar.startDate || '',
      endDate: currentSeminar.endDate || '',
      registrationFee: Number(currentSeminar.registrationFee) || 0,
      status: (currentSeminar.status || 'Pending Approval') as any,
      approver: currentSeminar.approver || '',
      remarks: currentSeminar.remarks || ''
    };

    setIsLoading(true);
    const response = await SchemaAwareDataService.save('PublicSeminar', seminarToSave);
    setIsLoading(false);

    if (response.status === 'success') {
      Swal.fire({
        icon: 'success',
        title: 'Data Synchronized',
        text: response.message,
        confirmButtonColor: '#212c46'
      });
      setIsModalOpen(false);
      setCurrentSeminar({});
      loadData();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Sync Action Failed',
        text: response.message
      });
    }
  };

  // Register print logging for audits
  const triggerPrintLogging = () => {
    registerPrintLog('Public Seminars Directory');
    setIsPrintOpen(true);
  };

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 font-sans text-left min-h-screen">
      
      {/* 1. Header user guide floating tab */}
      <button 
        onClick={() => setIsGuideOpen(true)} 
        className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#b58c4f] hover:text-white hover:border-[#b58c4f] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group cursor-pointer" 
        style={{ top: '80px' }}
      >
        <Icons.HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
        <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[11px] font-mono">USER GUIDE</span>
      </button>

      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Header section */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0 bg-transparent">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center cursor-default shrink-0">
            <div className="absolute inset-0 bg-[#b58c4f] blur-[15px] opacity-20 rounded-full"></div>
            <div className="relative z-10 w-10 h-10 border border-slate-200 rounded-2xl bg-white/50 backdrop-blur-sm shadow-sm flex items-center justify-center">
              <Icons.BookmarkCheck size={20} strokeWidth={2.5} className="text-[#b58c4f]" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
              การลงทะเบียนสัมมนาภายนอก <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#657f4d] to-[#b58c4f]">PUBLIC & SEMINAR ENROLLMENT</span>
            </h3>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mt-0.5 leading-none">
              customized external courses, professional summits, and national compliance workshops
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 w-full mt-[2px] space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
          <KpiCard 
            title="TOTAL REGISTERED USERS"
            value={stats.total}
            color="#3f809e"
            icon={Icons.Users}
            description="Total external courses requested"
          />
          <KpiCard 
            title="PENDING REGISTRATION CHECKS"
            value={stats.pending}
            color="#b58c4f"
            icon={Icons.MessageSquareQuote}
            description="Requiring immediate HR/Admin checks"
          />
          <KpiCard 
            title="APPROVED SUMMIT PASSES"
            value={stats.approved}
            color="#657f4d"
            icon={Icons.ShieldCheck}
            description="Confirmed or attended classes"
          />
          <KpiCard 
            title="COMMITTED BUDGET DISBURSEMENTS"
            value={`${stats.totalFee.toLocaleString()} ฿`}
            color="#a94228"
            icon={Icons.CreditCard}
            description="Total professional registration fees"
          />
        </div>

      {/* Main Table with Integrated Control Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" id="public-seminar-integrated-registry">
        {/* Unified Tool and Filter Header */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex flex-col xl:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 w-full xl:w-auto items-center">
            <span className="text-[#212c46] font-black text-xs uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1.5 font-sans">
              <Icons.Award size={14} className="text-[#3f809e]" /> Seminar Registry ({filteredSeminars.length})
            </span>
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <input
                type="text"
                placeholder="Search courses, employee, or organizer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#212c46]/10 focus:border-[#212c46] bg-white"
              />
              <Icons.Search size={14} className="absolute left-3 top-3 text-slate-400" />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-white border border-[#eaeaec] px-3.5 py-2 rounded-xl shadow-xs">
              <Icons.CheckCircle size={13} className="text-emerald-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:outline-none"
              >
                <option value="All">All statuses ({statusCounts['All']})</option>
                <option value="Pending Approval">Pending Approval ({statusCounts['Pending Approval']})</option>
                <option value="Approved">Approved ({statusCounts['Approved']})</option>
                <option value="Attended">Attended ({statusCounts['Attended']})</option>
                <option value="Rejected">Rejected ({statusCounts['Rejected']})</option>
              </select>
              <span className="shrink-0 bg-[#212c46] text-white font-mono text-[9px] px-1.5 py-0.5 rounded-md font-black min-w-[20px] text-center">
                {statusCounts[statusFilter] || statusCounts['All'] || 0}
              </span>
            </div>

            {/* Date Picker for month and year */}
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

          {/* Unified Actions Bar */}
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
                setCurrentSeminar({});
                setIsEditing(false);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#212c46] text-[#b58c4f] font-extrabold uppercase text-[10px] tracking-widest rounded-xl border border-[#b58c4f]/20 hover:bg-[#b58c4f] hover:text-[#212c46] cursor-pointer shadow-sm active:scale-95 transition-all w-full sm:w-auto justify-center"
            >
              <Icons.Plus size={13} />
              Request Pass
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 font-semibold text-[10px] text-slate-400 uppercase tracking-widest">
                <th className="py-3 px-4 text-left">Request ID</th>
                <th className="py-3 px-4 text-left">Course Topic & Organizer</th>
                <th className="py-3 px-4 text-left">Employee Name</th>
                <th className="py-3 px-4 text-left">Department</th>
                <th className="py-3 px-4 text-center">Sessions Duration</th>
                <th className="py-3 px-4 text-right">Fee (THB)</th>
                <th className="py-3 px-4 text-center font-bold">Approver</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-slate-700">
              {filteredSeminars.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center font-bold text-slate-400 uppercase tracking-wider">
                    No individual seminar passes logged
                  </td>
                </tr>
              ) : (
                filteredSeminars.map((item) => {
                  const isPending = item.status === 'Pending Approval';
                  const isApproved = item.status === 'Approved' || item.status === 'Attended';
                  const isFailed = item.status === 'Rejected' || item.status === 'Cancelled';
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-black text-slate-500">{item.id}</td>
                      <td className="py-3.5 px-4 text-left max-w-[280px]">
                        <div className="font-extrabold text-[#212c46] leading-snug">{item.courseName}</div>
                        <span className="text-[9px] text-[#b58c4f] font-bold uppercase tracking-wide leading-none mt-1 inline-block">
                          🏫 {item.organizer}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-left">
                        <div className="font-bold">{item.employeeName}</div>
                        <span className="text-[9px] text-slate-400 font-mono italic leading-none">{item.employeeId}</span>
                      </td>
                      <td className="py-3.5 px-4 text-left font-bold">{item.department}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-600">
                        <div>{item.startDate}</div>
                        <span className="text-[8.5px] text-gray-400">to {item.endDate}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-800 pr-6">
                        {item.registrationFee ? `${item.registrationFee.toLocaleString()} ฿` : '0 ฿'}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500 font-bold">{item.approver || '—'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 text-[8.5px] font-black rounded-full uppercase tracking-wider border ${
                          isPending ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' :
                          isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          isFailed ? 'bg-rose-50 text-rose-700 border-rose-100' :
                          'bg-slate-50 text-slate-600 border-slate-100'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => {
                              setCurrentSeminar(item);
                              setIsEditing(true);
                              setIsModalOpen(true);
                            }}
                            className="p-1 bg-[#212c46]/5 hover:bg-[#212c46]/10 text-[#212c46] rounded-md cursor-pointer"
                            title="Edit Individual Request"
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

      {/* Request Modal */}
      <DraggableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? `Edit Public & Seminar Registry` : `Request Individual Seminar Pass (Auto-Provision)`}
      >
        <form onSubmit={handleSubmit} className="p-6 max-h-[85vh] overflow-y-auto font-sans flex flex-col gap-4 text-left">
          <div className="bg-[#212c46] text-white p-3.5 rounded-xl mb-2 text-left relative overflow-hidden">
            <p className="text-[9px] text-[#b58c4f] font-black uppercase tracking-widest mb-1">GOOGLE SHEETS CONFIG DECODE</p>
            <p className="text-[10px] leading-relaxed text-gray-300">
              Saving triggers dynamic sheet checking. If sheet <strong className="text-white">'PublicSeminar'</strong> is not present, the backend creates it instantly, freeze rows, and styles colors.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Pass ID (Leave blank to generate)</label>
              <input
                type="text"
                value={currentSeminar.id || ''}
                readOnly={isEditing}
                onChange={(e) => setCurrentSeminar(p => ({ ...p, id: e.target.value }))}
                placeholder="e.g. PB-004"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-slate-50/70"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Course Name / Seminar Topic *</label>
              <input
                type="text"
                required
                value={currentSeminar.courseName || ''}
                onChange={(e) => setCurrentSeminar(p => ({ ...p, courseName: e.target.value }))}
                placeholder="e.g. Modern Tax Laws and Inventions 2026"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#212c46]"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Organizer / Institution *</label>
              <input
                type="text"
                required
                value={currentSeminar.organizer || ''}
                onChange={(e) => setCurrentSeminar(p => ({ ...p, organizer: e.target.value }))}
                placeholder="e.g. สภาลูกจ้างแห่งชาติ"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#212c46]"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Employee ID *</label>
              <input
                type="text"
                required
                value={currentSeminar.employeeId || ''}
                onChange={(e) => setCurrentSeminar(p => ({ ...p, employeeId: e.target.value }))}
                placeholder="e.g. EMP-015"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#212c46]"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Employee Name *</label>
              <input
                type="text"
                required
                value={currentSeminar.employeeName || ''}
                onChange={(e) => setCurrentSeminar(p => ({ ...p, employeeName: e.target.value }))}
                placeholder="e.g. คุณอมรรัตน์ บุตรา"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#212c46]"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Department</label>
              <input
                type="text"
                value={currentSeminar.department || ''}
                onChange={(e) => setCurrentSeminar(p => ({ ...p, department: e.target.value }))}
                placeholder="e.g. Production Team"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Registration Fee (฿)</label>
              <input
                type="number"
                min="0"
                value={currentSeminar.registrationFee || 0}
                onChange={(e) => setCurrentSeminar(p => ({ ...p, registrationFee: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
              <input
                type="date"
                value={currentSeminar.startDate || ''}
                onChange={(e) => setCurrentSeminar(p => ({ ...p, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">End Date</label>
              <input
                type="date"
                value={currentSeminar.endDate || ''}
                onChange={(e) => setCurrentSeminar(p => ({ ...p, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Status</label>
              <select
                value={currentSeminar.status || 'Pending Approval'}
                onChange={(e) => setCurrentSeminar(p => ({ ...p, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#212c46]"
              >
                <option value="Pending Approval">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Attended">Attended</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Authorized Approver</label>
              <input
                type="text"
                value={currentSeminar.approver || ''}
                onChange={(e) => setCurrentSeminar(p => ({ ...p, approver: e.target.value }))}
                placeholder="e.g. คุณสมจิตร์ (Director)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Remarks & Details</label>
              <textarea
                value={currentSeminar.remarks || ''}
                onChange={(e) => setCurrentSeminar(p => ({ ...p, remarks: e.target.value }))}
                placeholder="Add other details or registration links..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold"
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
        title="Public & Seminar Enrollment Report"
        documentId="TAI-PSE-2026-06"
        defaultWatermark="OFFICIAL"
      >
        <PrintableReport
          title="PUBLIC SEMINAR & SUMMIT ENROLLMENT"
          subtitle="External course passes, customized summits & compliance training directory"
          documentId="TAI-PSE-2026-06"
        >
          <div className="mt-4">
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-300 font-bold text-slate-800 uppercase tracking-wider text-left">
                  <th className="p-2 border border-slate-300 text-[9px]">ID</th>
                  <th className="p-2 border border-slate-300 text-[9px]">Course, Topic & Organizer</th>
                  <th className="p-2 border border-slate-300 text-[9px]">Employee</th>
                  <th className="p-2 border border-slate-300 text-[9px]">Dept</th>
                  <th className="p-2 border border-slate-300 text-[9px]">Duration</th>
                  <th className="p-2 border border-slate-300 text-right text-[9px]">Fee (฿)</th>
                  <th className="p-2 border border-slate-300 text-center text-[9px]">Approver</th>
                  <th className="p-2 border border-slate-300 text-center text-[9px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSeminars.map((item) => (
                  <tr key={item.id} className="text-[9px] hover:bg-slate-50/50">
                    <td className="p-2 border border-slate-200 font-mono font-bold text-slate-600">{item.id}</td>
                    <td className="p-2 border border-slate-200">
                      <div className="font-bold text-slate-900">{item.courseName}</div>
                      <span className="text-[8px] text-slate-500">🏫 {item.organizer}</span>
                    </td>
                    <td className="p-2 border border-slate-200">
                      <div className="font-bold">{item.employeeName}</div>
                      <span className="text-[8px] text-slate-400 font-mono">{item.employeeId}</span>
                    </td>
                    <td className="p-2 border border-slate-200 font-semibold">{item.department}</td>
                    <td className="p-2 border border-slate-200">
                      <div>{item.startDate}</div>
                      <span className="text-[8px] text-slate-400">to {item.endDate}</span>
                    </td>
                    <td className="p-2 border border-slate-200 text-right font-mono font-bold">{item.registrationFee ? item.registrationFee.toLocaleString() : '0'}</td>
                    <td className="p-2 border border-slate-200 text-center">{item.approver || '—'}</td>
                    <td className="p-2 border border-slate-200 text-center font-bold">{item.status}</td>
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
