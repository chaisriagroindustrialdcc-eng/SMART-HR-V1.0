import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Search, 
  Plus, 
  Trash2, 
  Printer, 
  ChevronRight, 
  CheckSquare, 
  Clock, 
  User, 
  Building, 
  CheckCircle, 
  X, 
  HelpCircle, 
  Sliders, 
  RefreshCw, 
  TrendingUp, 
  FileText, 
  Calendar, 
  Scale, 
  ArrowLeftRight,
  TrendingDown,
  Sparkles,
  BarChart as BarChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
  Legend,
  PieChart,
  Pie
} from 'recharts';
import { dbSync } from '../../services/dbSync';
import KpiCard from '../../components/shared/KpiCard';
import { DraggableModal } from '../../components/shared/DraggableModal';
import { useLanguage } from '../../context/LanguageContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface ProbationEvaluation {
  id: string; // Evaluation ID
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  assessDate: string;
  hireDate: string;
  probationEndDate: string;
  status: 'Passed' | 'Extended' | 'Failed' | 'Pending Assessment';
  scoreTechnical: number; // 0-100
  scoreAttendance: number; // 0-100
  scoreTeamwork: number; // 0-100
  scorePotential: number; // 0-100
  comments: string;
}

interface MasterEmployee {
  id: string;
  name: string;
  department?: string;
  position?: string;
  contractType?: string;
  status?: string;
  hireDate?: string;
}

const months = [
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
];

// Custom Tooltip for performance breakdowns
const EvaluationChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1d2636] text-white p-3.5 rounded-xl border border-slate-700/50 shadow-xl text-xs font-semibold leading-relaxed">
        <p className="font-extrabold uppercase tracking-wide text-[#b58c4f] border-b border-white/10 pb-1.5 mb-1.5 font-mono">
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5 text-slate-300 font-sans">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color || item.fill }} />
                {item.name}:
              </span>
              <span className="font-mono font-bold text-white">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Sliding User Guide Panel
function UserGuidePanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { language } = useLanguage();
  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div 
        className={`fixed inset-0 z-[190] bg-[#212c46]/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      <div 
        className={`fixed inset-y-0 right-0 z-[200] w-full md:w-[500px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col border-l-4 border-[#3f809e] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-5 px-6 border-b-2 border-[#3f809e] bg-[#212c46] text-white shrink-0">
          <div>
            <h3 className="font-black flex items-center gap-3 uppercase tracking-widest text-[14px] font-sans">
              <Award size={20} className="text-[#3f809e]"/> PROBATION EVALUATION GUIDE
            </h3>
            <p className="text-[11px] font-bold text-[#d7d7d7] uppercase tracking-widest mt-1">
              คู่มือประเมินผลพนักงานทดลองงาน
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white rounded-xl transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 text-[#414757] text-[12px] leading-relaxed custom-scrollbar bg-white">
          <section>
            <h4 className="text-[13px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b border-[#eaeaec] pb-2 font-sans">
              <CheckSquare size={18} className="text-[#3f809e]"/> 1. วัตถุประสงค์และประโยชน์
            </h4>
            <p className="text-[12.5px] text-[#525a72]">
              ช่วยคัดกรองและประเมินพนักงานใหม่ในช่วงทดลองงาน (ส่วนใหญ่ 119 วัน) เพื่อพิจารณาความพร้อมในการบรรจุเป็นพนักงานประจำ โดยมีเกณฑ์วัดผลครอบคลุม 4 มิติประสิทธิภาพสูงสุด
            </p>
          </section>

          <section>
            <h4 className="text-[13px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b border-[#eaeaec] pb-2 font-sans">
              <Sliders size={18} className="text-[#b58c4f]"/> 2. รายละเอียดเกณฑ์การวัดผล (Evaluation Metrics)
            </h4>
            <ul className="space-y-4 text-[12px]">
              <li className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <strong className="text-[#212c46] text-[11px] block uppercase font-mono">1. Technical & Execution (ทักษะเฉพาะทางและการลงมือทำ)</strong>
                วัดความขยัน ความสามารถ ความเชี่ยวชาญ ค่าน้ำหนัก และความเสถียรในการทำงานที่ได้รับมอบหมาย
              </li>
              <li className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <strong className="text-[#212c46] text-[11px] block uppercase font-mono">2. Attendance & Reliability (สถิติเวลาและความรับผิดชอบ)</strong>
                พิจารณาจากการมาสาย ขาดงาน พฤตินิยมในการลงเวลาทำงาน และการควบคุมระยะเวลาตามกฎระเบียบวินัย
              </li>
              <li className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <strong className="text-[#212c46] text-[11px] block uppercase font-mono">3. Teamwork & Attitude (ทีมเวิร์กและทัศนคติเชิงบวก)</strong>
                วัดพฤติกรรมการเข้าหาเพื่อนร่วมงาน ความสามารถในการปรับปรุงตัว ติเพื่อก่อ และความคิดสร้างสรรค์ร่วมกัน
              </li>
              <li className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <strong className="text-[#212c46] text-[11px] block uppercase font-mono">4. Growth Potential (ศักยภาพและการพัฒนาอย่างก้าวกระโดด)</strong>
                วิเคราะห์โครงสร้างคุณค่าของตัวบุคคล ศักยภาพการเติบโตขึ้นเป็น Leader หรือผู้ขับเคลื่อนหลักในทีมสังกัด
              </li>
            </ul>
          </section>

          <section>
            <h4 className="text-[13px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b border-[#eaeaec] pb-2 font-sans">
              <Scale size={18} className="text-[#657f4d]"/> 3. ผลลัพธ์และการอนุมัติ (Status Flow)
            </h4>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-[#657f4d]/10 border border-[#657f4d]/20 p-2.5 rounded-xl">
                <span className="font-extrabold text-[#657f4d] text-[10px] block uppercase">Passed (ผ่านพ้นทดลอง)</span>
                บรรจุเข้าเป็นสตาฟฟ์ประจำสากล อัปเดตข้อมูลขึ้นระบบ Salary Master
              </div>
              <div className="bg-[#b58c4f]/10 border border-[#b58c4f]/20 p-2.5 rounded-xl">
                <span className="font-extrabold text-[#b58c4f] text-[10px] block uppercase">Extended (ขยายเวลา)</span>
                เพิ่มระยะเวลาทดลองขึ้นสูงสุด 30-45 วัน เพื่อสังเกตพัฒนาการเพิ่ม
              </div>
              <div className="bg-[#932c2e]/10 border border-[#932c2e]/20 p-2.5 rounded-xl col-span-2">
                <span className="font-extrabold text-[#932c2e] text-[10px] block uppercase">Failed (ไม่ผ่านการทดลองงาน)</span>
                สิ้นสุดสัญญาการจ้างงานตามข้อบังคับสากล ดำเนินการจัดเก็บประวัติเพื่อถอดถอน
              </div>
            </div>
          </section>
        </div>

        <div className="p-4 bg-[#f8f9fa] border-t border-[#eaeaec] flex justify-end shrink-0">
          <button 
            onClick={onClose} 
            className="px-8 py-2.5 bg-[#212c46] text-white font-black rounded-xl uppercase text-[11px] hover:bg-[#414757] transition-all shadow-md tracking-wider cursor-pointer"
          >
            {language === 'TH' ? 'รับทราบ' : 'Got it'}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

export default function ProbationPage() {
  const { t, language } = useLanguage();
  
  // States
  const [evaluations, setEvaluations] = useState<ProbationEvaluation[]>([]);
  const [employees, setEmployees] = useState<MasterEmployee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState<boolean>(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedEval, setSelectedEval] = useState<ProbationEvaluation | null>(null);

  // Form State
  const [formValues, setFormValues] = useState({
    employeeId: '',
    hireDate: new Date().toISOString().split('T')[0],
    probationEndDate: '',
    status: 'Pending Assessment' as ProbationEvaluation['status'],
    scoreTechnical: 80,
    scoreAttendance: 85,
    scoreTeamwork: 80,
    scorePotential: 75,
    comments: ''
  });

  // Calculate default end date based on hire date (+119 days)
  useEffect(() => {
    if (formValues.hireDate) {
      const hd = new Date(formValues.hireDate);
      hd.setDate(hd.getDate() + 119);
      setFormValues(prev => ({
        ...prev,
        probationEndDate: hd.toISOString().split('T')[0]
      }));
    }
  }, [formValues.hireDate]);

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [evalRes, empRes] = await Promise.all([
        dbSync.read('probation_evaluations'),
        dbSync.read('employees')
      ]);

      if (evalRes && evalRes.data && Array.isArray(evalRes.data.items)) {
        setEvaluations(evalRes.data.items);
      } else {
        // Fallback Mock Data if empty
        const mockEvals: ProbationEvaluation[] = [
          {
            id: 'prb-01',
            employeeId: 'EMP-010',
            employeeName: 'Natthawat Chansri / ณัฐวัตร จันทร์ศรี',
            department: 'Information Technology / เทคโนโลยีสารสนเทศ',
            position: 'Software Developer / นักพัฒนาซอฟต์แวร์',
            assessDate: '2026-06-05',
            hireDate: '2026-02-15',
            probationEndDate: '2026-06-15',
            status: 'Pending Assessment',
            scoreTechnical: 82,
            scoreAttendance: 90,
            scoreTeamwork: 85,
            scorePotential: 80,
            comments: 'เรียนรู้เร็ว เข้ากับเพื่อนร่วมทีมได้ดี ขาดเพียงทักษะจัดการกระบวนการแบบ Agile ต้องควบคุมต่อ'
          },
          {
            id: 'prb-02',
            employeeId: 'EMP-014',
            employeeName: 'Supanee Srisawat / สุพรรณี ศรีสวัสดิ์',
            department: 'Strategic HR / ฝ่ายทรัพยากรบุคคลเชิงกลยุทธ์',
            position: 'HR Administrator / ผู้ดูแลระบบบุคคล',
            assessDate: '2026-05-10',
            hireDate: '2026-01-12',
            probationEndDate: '2026-05-12',
            status: 'Passed',
            scoreTechnical: 92,
            scoreAttendance: 98,
            scoreTeamwork: 94,
            scorePotential: 90,
            comments: 'ผลงานดีเด่นอย่างมาก มีความรอบคอบและเสนอระบบดิจิทัลปรับปรุงโครงสร้างงานอย่างเป็นรูปธรรม'
          },
          {
            id: 'prb-03',
            employeeId: 'EMP-022',
            employeeName: 'Chaiwat Pimthong / ชัยวัฒน์ พิมพ์ทอง',
            department: 'Technical & Engineering / วิศวกรรมเทคนิค',
            position: 'Service Technician / ช่างซ่อมบำรุงบริการ',
            assessDate: '2026-06-01',
            hireDate: '2026-02-05',
            probationEndDate: '2026-06-05',
            status: 'Extended',
            scoreTechnical: 68,
            scoreAttendance: 60,
            scoreTeamwork: 75,
            scorePotential: 70,
            comments: 'ทักษะงานซ่อมพอใช้ได้ แต่สถิติเวลาทำงานสายค่อนข้างบ่อย ขอต่อเวลาเพิ่ม 30 วันเพื่อประเมนวินัยด่วน'
          }
        ];
        setEvaluations(mockEvals);
        // Save mock schema to sheets
        await dbSync.write('probation_evaluations', mockEvals);
      }

      if (empRes && empRes.data && Array.isArray(empRes.data.items)) {
        setEmployees(empRes.data.items);
      }
    } catch (err) {
      console.error('Failed to load probation datasets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerScheduleEvaluationModal = () => {
    setIsQuickActionOpen(false);
    if (evaluations.length === 0) {
      MySwal.fire('No Records', 'ไม่มีรายชื่อสตาฟฟ์ให้ทำการประเมินค่ะ', 'warning');
      return;
    }

    MySwal.fire({
      title: 'SCHEDULE EVALUATION MEETING',
      html: `
        <div class="text-left font-sans text-xs space-y-4">
          <div>
            <label class="block font-black uppercase text-slate-400 mb-1">Select Staff on Probation</label>
            <select id="swal-schedule-emp" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none">
              ${evaluations.map(e => `<option value="${e.employeeId}">${e.employeeName.split('/')[0].trim()} (${e.position.split('/')[0].trim()})</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block font-black uppercase text-slate-400 mb-1">Schedule Date & Time</label>
            <input type="datetime-local" id="swal-schedule-datetime" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none" value="2026-06-12T10:00">
          </div>
          <div>
            <label class="block font-black uppercase text-slate-400 mb-1">Assign Evaluation Lead / Supervisor</label>
            <input type="text" id="swal-schedule-supervisor" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none" placeholder="e.g. Somchai Jaidee (Operations Director)">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'SCHEDULE NOW',
      cancelButtonText: 'CANCEL',
      confirmButtonColor: '#212c46',
      cancelButtonColor: '#932c2e',
      preConfirm: () => {
        const empId = (document.getElementById('swal-schedule-emp') as HTMLSelectElement).value;
        const datetime = (document.getElementById('swal-schedule-datetime') as HTMLInputElement).value;
        const supervisor = (document.getElementById('swal-schedule-supervisor') as HTMLInputElement).value;
        
        if (!supervisor) {
          Swal.showValidationMessage('Please assign an evaluation supervisor!');
          return false;
        }
        
        return { empId, datetime, supervisor };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const data = result.value;
        if (data) {
          const employee = evaluations.find(e => e.employeeId === data.empId);
          MySwal.fire({
            icon: 'success',
            title: 'Evaluation Scheduled!',
            text: `การประเมินผลสำหรับคุณ ${employee?.employeeName.split('/')[0].trim()} ถูกนัดหมายเรียบร้อยแล้วค่ะ \nวันเวลา: ${data.datetime} \nผู้ประเมิน: ${data.supervisor}`,
            confirmButtonColor: '#212c46'
          });
        }
      }
    });
  };

  const triggerSendReminderMail = () => {
    setIsQuickActionOpen(false);
    if (evaluations.length === 0) {
      MySwal.fire('No Records', 'ไม่มีข้อมูลสำหรับการแจ้งเตือนค่ะ', 'warning');
      return;
    }

    MySwal.fire({
      title: 'SEND PROBATION REMINDER ALERT',
      html: `
        <div class="text-left font-sans text-xs space-y-4">
          <div>
            <label class="block font-black uppercase text-slate-400 mb-1">Target Nearing End Date Employee</label>
            <select id="swal-reminder-emp" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none">
              ${evaluations.map(e => `<option value="${e.employeeId}">${e.employeeName.split('/')[0].trim()} (Expires: ${e.probationEndDate})</option>`).join('')}
            </select>
          </div>
          <div class="bg-blue-50 border border-blue-200 p-3.5 rounded-xl">
            <span class="block font-black text-blue-800 uppercase mb-1">Email Alert Preview</span>
            <p class="text-slate-600 leading-relaxed font-mono text-[10px]">
              <strong>To:</strong> Department Head & HR Audit Lead <br/>
              <strong>Subject:</strong> [ALERT] Pending Probation Evaluation Required <br/><br/>
              Please be advised that the probation period for this employee is nearing completion. Retain or extended performance assessments must be logged within 5 business days to synchronize with the dynamic Salary Master systems.
            </p>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'SEND EMAIL NOW',
      cancelButtonText: 'CANCEL',
      confirmButtonColor: '#212c46',
      cancelButtonColor: '#932c2e'
    }).then((result) => {
      if (result.isConfirmed) {
        const empId = (document.getElementById('swal-reminder-emp') as HTMLSelectElement).value;
        const employee = evaluations.find(e => e.employeeId === empId);

        MySwal.fire({
          icon: 'success',
          title: 'Reminder Dispatched!',
          text: `อีเมลทวงถามประเมินสำหรับคุณ ${employee?.employeeName.split('/')[0].trim()} ถูกส่งไปยังผู้รับผิดชอบแล้วค่ะ`,
          confirmButtonColor: '#212c46'
        });
      }
    });
  };

  // Compute stats
  const metrics = useMemo(() => {
    const total = evaluations.length;
    const passed = evaluations.filter(e => e.status === 'Passed').length;
    const pending = evaluations.filter(e => e.status === 'Pending Assessment').length;
    const extendedFailed = evaluations.filter(e => e.status === 'Extended' || e.status === 'Failed').length;

    return { total, passed, pending, extendedFailed };
  }, [evaluations]);

  // Compute unique departments for dropdown
  const departments = useMemo(() => {
    const depts = new Set<string>();
    evaluations.forEach(e => {
      if (e.department) depts.add(e.department);
    });
    return ['All', ...Array.from(depts)];
  }, [evaluations]);

  // Extracted unique years for filtering
  const yearsList = useMemo(() => {
    const yrs = new Set<string>();
    evaluations.forEach(e => {
      const dateStr = e.assessDate || e.hireDate;
      if (dateStr && dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts[0]) yrs.add(parts[0]);
      }
    });
    // Ensure 2026 is always available for convenience
    yrs.add('2026');
    return ['All', ...Array.from(yrs).sort()];
  }, [evaluations]);

  // Status counts for badges
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: evaluations.length,
      'Pending Assessment': 0,
      Passed: 0,
      Extended: 0,
      Failed: 0
    };
    evaluations.forEach(e => {
      if (e.status in counts) {
        counts[e.status]++;
      }
    });
    return counts;
  }, [evaluations]);

  // Filter & Search
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(e => {
      const nameMatch = (e.employeeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (e.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (e.position || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const deptMatch = selectedDeptFilter === 'All' || e.department === selectedDeptFilter;
      const statusMatch = selectedStatusFilter === 'All' || e.status === selectedStatusFilter;

      // Month & Year Filter based on assessDate (or falling back to hireDate if assessDate is empty)
      const dateStr = e.assessDate || e.hireDate || '';
      let monthMatch = true;
      let yearMatch = true;
      if (dateStr && dateStr.includes('-')) {
        const parts = dateStr.split('-');
        const y = parts[0];
        const m = parts[1];
        if (selectedMonth !== 'All') {
          monthMatch = m === selectedMonth;
        }
        if (selectedYear !== 'All') {
          yearMatch = y === selectedYear;
        }
      }

      return nameMatch && deptMatch && statusMatch && monthMatch && yearMatch;
    });
  }, [evaluations, searchQuery, selectedDeptFilter, selectedStatusFilter, selectedMonth, selectedYear]);

  // Recharts analytic data
  const chartData = useMemo(() => {
    return filteredEvaluations.map(e => ({
      name: e.employeeName ? e.employeeName.split('/')[0].trim() : e.employeeId,
      'Technical': e.scoreTechnical,
      'Attendance': e.scoreAttendance,
      'Teamwork': e.scoreTeamwork,
      'Potential': e.scorePotential
    }));
  }, [filteredEvaluations]);

  // Auto populate department, position & details when choosing employee in form
  const selectedEmployeeObject = useMemo(() => {
    return employees.find(emp => emp.id === formValues.employeeId);
  }, [formValues.employeeId, employees]);

  // Open modal for evaluation modification
  const handleOpenEdit = (evalObj: ProbationEvaluation) => {
    setModalMode('edit');
    setSelectedEval(evalObj);
    setFormValues({
      employeeId: evalObj.employeeId,
      hireDate: evalObj.hireDate || '',
      probationEndDate: evalObj.probationEndDate || '',
      status: evalObj.status,
      scoreTechnical: evalObj.scoreTechnical || 80,
      scoreAttendance: evalObj.scoreAttendance || 80,
      scoreTeamwork: evalObj.scoreTeamwork || 80,
      scorePotential: evalObj.scorePotential || 80,
      comments: evalObj.comments || ''
    });
    setIsModalOpen(true);
  };

  // Open creation modal
  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedEval(null);
    setFormValues({
      employeeId: '',
      hireDate: new Date().toISOString().split('T')[0],
      probationEndDate: '',
      status: 'Pending Assessment',
      scoreTechnical: 80,
      scoreAttendance: 85,
      scoreTeamwork: 80,
      scorePotential: 75,
      comments: ''
    });
    setIsModalOpen(true);
  };

  // Delete Record
  const handleDelete = async (id: string, name: string) => {
    const confirmation = await MySwal.fire({
      title: 'Are you sure?',
      text: `คุณต้องการลบรายงานการประเมินช่วงทดลองงานของ ${name} ใช่หรือไม่? ซึ่งจะไม่สามารถย้อนกลับข้อมูลได้`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#932c2e',
      cancelButtonColor: '#212c46',
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'Cancel'
    });

    if (confirmation.isConfirmed) {
      setIsLoading(true);
      try {
        const updated = evaluations.filter(ev => ev.id !== id);
        setEvaluations(updated);
        await dbSync.delete('probation_evaluations', [{ id }]);
        MySwal.fire('Completed!', 'บันทึกประเมินการทดลองงานถูกลบเรียบร้อยแล้วค่ะ', 'success');
      } catch (err) {
        console.error('Delete failed:', err);
        MySwal.fire('Error', 'ไม่สามารถลบประเมินการทดลองงานออกจากดาต้าเบสได้ค่ะ', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.employeeId) {
      MySwal.fire('Missing Selection', 'โปรดเลือกพนักงานที่ต้องทำการประเมินก่อนค่ะ', 'warning');
      return;
    }

    const matchedEmp = selectedEmployeeObject;
    const finalName = matchedEmp ? matchedEmp.name : 'Unknown Employee';
    const finalDept = matchedEmp ? (matchedEmp.department || 'N/A') : 'N/A';
    const finalPos = matchedEmp ? (matchedEmp.position || 'N/A') : 'N/A';

    const payload: ProbationEvaluation = {
      id: modalMode === 'create' ? `prb-${Date.now()}` : (selectedEval?.id || ''),
      employeeId: formValues.employeeId,
      employeeName: finalName,
      department: finalDept,
      position: finalPos,
      assessDate: new Date().toISOString().split('T')[0],
      hireDate: formValues.hireDate,
      probationEndDate: formValues.probationEndDate,
      status: formValues.status,
      scoreTechnical: Number(formValues.scoreTechnical),
      scoreAttendance: Number(formValues.scoreAttendance),
      scoreTeamwork: Number(formValues.scoreTeamwork),
      scorePotential: Number(formValues.scorePotential),
      comments: formValues.comments
    };

    setIsLoading(true);
    try {
      await dbSync.write('probation_evaluations', [payload]);
      await loadData();
      setIsModalOpen(false);
      MySwal.fire({
        title: 'Success!',
        text: 'ประเมินผลการทดลองงานพนักงานเรียบร้อยค่ะ',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Save failed:', err);
      MySwal.fire('Error', 'ผิดพลาดทางเทคนิค ไม่สามารถจัดเก็บผลประเมินได้ค่ะ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f8f9fc] px-4 sm:px-8 py-6 space-y-6 overflow-y-auto pb-12">
      
      {/* user guide tab */}
      <button 
        onClick={() => setIsGuideOpen(true)} 
        className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#3f809e] hover:text-white hover:border-[#3f809e] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group cursor-pointer" 
        style={{ top: '80px' }}
      >
        <HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
        <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[11px] font-mono">USER GUIDE</span>
      </button>

      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Spacing from Topbar is naturally driven by space-y-6 container */}
      {/* 2. Page Header Bar - transparent background directly on warm page background */}
      <div className="h-14 flex flex-row items-center justify-between gap-4 z-20 shrink-0 bg-transparent mt-2">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center shrink-0">
            <div className="absolute inset-0 bg-[#3f809e]/20 blur-[15px] opacity-40 rounded-full"></div>
            <div className="relative z-10 p-2 border border-[#3f809e]/30 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
              <Award size={24} strokeWidth={2.5} className="text-[#3f809e]" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none text-2xl">
              PROBATION <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3f809e] to-[#b58c4f]">EVALUATIONS</span>
            </h3>
            <p className="text-[11px] font-bold text-[#606a5f] uppercase tracking-[0.2em] mt-1 opacity-80 leading-none">
              PROBATION EMPLOYEE EVALUATIONS, METRICS & ADMISSION AUDITING
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="p-2.5 rounded-xl border border-dotted border-slate-300 bg-white hover:bg-slate-50 transition-all text-[#212c46] shadow-sm flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <Printer size={16} /> Print Reports
          </button>
          <button 
            onClick={handleOpenCreate}
            className="bg-[#212c46] hover:bg-[#3f809e] text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all hover:shadow-[0_0_15px_rgba(63,128,158,0.3)] shadow flex items-center gap-2 cursor-pointer border border-[#2d2c4a]"
          >
            <Plus size={14} strokeWidth={3} /> Evaluate New Staff
          </button>
        </div>
      </div>

      {/* KPI METRICS SYSTEM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 mb-3">
        <KpiCard 
          label={language === 'TH' ? 'พนักงานทดลองงานทั้งหมด' : 'Total Under Evaluation'} 
          value={metrics.total} 
          icon={User} 
          color="#3f809e" 
          description="In Progress Evaluation"
        />
        <KpiCard 
          label={language === 'TH' ? 'พนักงานทีผ่านทดลองงาน' : 'Passed Probation'} 
          value={metrics.passed} 
          icon={CheckCircle} 
          color="#657f4d" 
          description="Successfully Confirmed"
        />
        <KpiCard 
          label={language === 'TH' ? 'อยู่ระหว่างรอการประเมิน' : 'Pending Review'} 
          value={metrics.pending} 
          icon={Clock} 
          color="#b58c4f" 
          description="Awaiting Supervisor Action"
        />
        <KpiCard 
          label={language === 'TH' ? 'ขยายการประเมิน / ตกเกณฑ์' : 'Extended / Failed'} 
          value={metrics.extendedFailed} 
          icon={Scale} 
          color="#932c2e" 
          description="Review or Non-compliance"
        />
      </div>

      {/* SEARCH AND FILTER PANELS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {/* Search input with search icon */}
        <div className="bg-white rounded-2xl border border-[#eaeaec] p-4 shadow-sm flex items-center gap-3">
          <span className="text-[#3f809e] shrink-0">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'TH' ? "ค้นหา รหัส, ชื่อ หรือตำแหน่ง..." : "Search ID, Name or Role..."}
            className="w-full text-xs font-bold outline-none text-[#212c46] bg-transparent placeholder-slate-400"
          />
        </div>

        {/* Status Dropdown with Dynamic Count Badges */}
        <div className="bg-white rounded-2xl border border-[#eaeaec] p-4 shadow-sm flex items-center justify-between gap-3">
          <span className="text-[10px] font-black uppercase text-[#525f7a] tracking-wider shrink-0 flex items-center gap-1.5 font-mono">
            <CheckCircle size={14} className="text-[#657f4d]" /> STATUS
          </span>
          <div className="flex items-center gap-2 w-full max-w-[180px]">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-[#f8f9fc] border border-[#eaeaec] px-3 py-2 rounded-xl text-xs font-bold text-[#212c46] outline-none cursor-pointer focus:border-[#3f809e] w-full"
            >
              <option value="All">{t('All Status')} ({statusCounts['All'] || 0})</option>
              <option value="Pending Assessment">{language === 'TH' ? 'รอการประเมิน' : 'Pending'} ({statusCounts['Pending Assessment'] || 0})</option>
              <option value="Passed">{language === 'TH' ? 'ผ่านทดลองงาน' : 'Passed'} ({statusCounts['Passed'] || 0})</option>
              <option value="Extended">{language === 'TH' ? 'ขยายเวลา' : 'Extended'} ({statusCounts['Extended'] || 0})</option>
              <option value="Failed">{language === 'TH' ? 'ไม่ผ่านเกณฑ์' : 'Failed'} ({statusCounts['Failed'] || 0})</option>
            </select>
            <span className="shrink-0 bg-[#3f809e] text-white font-mono text-[10px] px-2 py-1 rounded-lg font-black min-w-[24px] text-center">
              {statusCounts[selectedStatusFilter] || 0}
            </span>
          </div>
        </div>

        {/* Month & Year Date Picker Filter */}
        <div className="bg-white rounded-2xl border border-[#eaeaec] p-4 shadow-sm flex items-center justify-between gap-3">
          <span className="text-[10px] font-black uppercase text-[#525f7a] tracking-wider shrink-0 flex items-center gap-1.5 font-mono">
            <Calendar size={14} className="text-[#b58c4f]" /> SCHEDULED
          </span>
          <div className="flex items-center gap-1.5 w-full max-w-[180px]">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-[#f8f9fc] border border-[#eaeaec] px-2 py-2 rounded-xl text-[11px] font-bold text-[#212c46] outline-none cursor-pointer focus:border-[#3f809e] flex-1"
            >
              <option value="All">{language === 'TH' ? 'ทุกเดือน' : 'All Months'}</option>
              {months.filter(m => m.value !== 'All').map(m => (
                <option key={m.value} value={m.value}>
                  {language === 'TH' ? m.label_th : m.label_en}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-[#f8f9fc] border border-[#eaeaec] px-2 py-2 rounded-xl text-[11px] font-bold text-[#212c46] outline-none cursor-pointer focus:border-[#3f809e] w-20"
            >
              <option value="All">{language === 'TH' ? 'ทุกปี' : 'All'}</option>
              {yearsList.filter(y => y !== 'All').map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Department filter */}
        <div className="bg-white rounded-2xl border border-[#eaeaec] p-4 shadow-sm flex items-center justify-between gap-3">
          <span className="text-[10px] font-black uppercase text-[#525f7a] tracking-wider shrink-0 flex items-center gap-1.5 font-mono">
            <Building size={14} className="text-[#3f809e]" /> DEPARTMENT
          </span>
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="bg-[#f8f9fc] border border-[#eaeaec] px-3 py-2 rounded-xl text-xs font-bold text-[#212c46] outline-none cursor-pointer focus:border-[#3f809e] w-full max-w-[150px]"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{t(dept)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* DASHBOARD CHARTS SECTION (RECHARTS) */}
      {filteredEvaluations.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Dimension Breakdown Bar Chart (2/3 span) */}
          <div className="xl:col-span-2 bg-white p-5 rounded-2xl border border-[#eaeaec] shadow-sm flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h4 className="text-[12px] font-black uppercase tracking-wider text-[#212c46] flex items-center gap-2">
                <BarChartIcon size={16} className="text-[#3f809e]" /> Performance Dimension Breakdown (%)
              </h4>
              <span className="text-[10px] font-extrabold text-[#7a8b95] uppercase font-mono">Interactive Scores</span>
            </div>
            
            <div className="h-64 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#7a8b95" fontSize={10} fontWeight="bold" />
                  <YAxis domain={[0, 100]} stroke="#7a8b95" fontSize={10} fontWeight="bold" />
                  <RechartsTooltip content={<EvaluationChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                  <Bar dataKey="Technical" fill="#3f809e" radius={[4, 4, 0, 0]} name="Technical Skills" />
                  <Bar dataKey="Attendance" fill="#657f4d" radius={[4, 4, 0, 0]} name="Attendance" />
                  <Bar dataKey="Teamwork" fill="#b58c4f" radius={[4, 4, 0, 0]} name="Teamwork & Attitude" />
                  <Bar dataKey="Potential" fill="#d96245" radius={[4, 4, 0, 0]} name="Growth Potential" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending vs Completed Pie Chart (1/3 span) */}
          <div className="bg-white p-5 rounded-2xl border border-[#eaeaec] shadow-sm flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h4 className="text-[12px] font-black uppercase tracking-wider text-[#212c46] flex items-center gap-2">
                <CheckSquare size={16} className="text-[#657f4d]" /> Evaluation Status Overview
              </h4>
              <span className="text-[10px] font-black text-slate-400 uppercase font-mono">KPI Ratio</span>
            </div>
            
            <div className="h-64 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: metrics.total - metrics.pending, color: '#657f4d' },
                      { name: 'Pending Assessment', value: metrics.pending, color: '#b58c4f' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    <Cell key="cell-0" fill="#657f4d" />
                    <Cell key="cell-1" fill="#b58c4f" />
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[20px] font-black text-[#212c46] leading-none">
                  {Math.round(((metrics.total - metrics.pending) / (metrics.total || 1)) * 100)}%
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Done Rate</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 text-[10px] font-black text-[#212c46]">
              <div className="flex items-center gap-1.5 justify-center bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                <span className="w-2 h-2 rounded-full bg-[#657f4d]" />
                <span>Completed: {metrics.total - metrics.pending}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                <span className="w-2 h-2 rounded-full bg-[#b58c4f]" />
                <span>Pending: {metrics.pending}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE PROBATION PROGRESS TRACKER */}
      <div className="bg-white p-5 rounded-2xl border border-[#eaeaec] shadow-sm flex flex-col">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#3f809e] animate-pulse" />
            <h4 className="text-[12px] font-black uppercase tracking-wider text-[#212c46]">
              Active Probation Progress Tracker (119-Day Milestones)
            </h4>
          </div>
          <span className="text-[10px] font-black bg-[#3f809e]/10 text-[#3f809e] px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
            Days remaining countdown
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evaluations.map(emp => {
            // Find total probation days (default 119) and calculate elapsed days relative to current date '2026-06-12'
            const hire = new Date(emp.hireDate);
            const end = new Date(emp.probationEndDate);
            const today = new Date('2026-06-12'); // Use cohesive 2026 current calendar frame
            
            // Difference in days
            const totalDays = Math.max(1, Math.round((end.getTime() - hire.getTime()) / (1000 * 60 * 60 * 24)));
            let elapsedDays = Math.round((today.getTime() - hire.getTime()) / (1000 * 60 * 60 * 24));
            
            // Constrain elapsed days
            if (elapsedDays < 0) elapsedDays = 0;
            if (elapsedDays > totalDays) elapsedDays = totalDays;
            
            const progressPct = Math.round((elapsedDays / totalDays) * 100);
            const daysLeft = Math.max(0, totalDays - elapsedDays);
            
            // Theme colors based on progress and outcome
            let barColor = 'bg-[#3f809e]'; // standard blue
            if (progressPct > 85) {
              barColor = 'bg-[#932c2e] animate-pulse'; // critical red near end date
            } else if (progressPct > 60) {
              barColor = 'bg-[#b58c4f]'; // warning gold
            } else {
              barColor = 'bg-[#657f4d]'; // green safe early stage
            }

            return (
              <div key={emp.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h5 className="text-[12px] font-extrabold text-[#212c46] hover:text-[#3f809e] transition-colors truncate max-w-[180px]">
                      {t(emp.employeeName)}
                    </h5>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{emp.employeeId}</span>
                    <span className="text-[10.5px] font-black text-[#b58c4f] uppercase block mt-1">{t(emp.position)}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider border ${
                    daysLeft <= 15 ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {daysLeft} Days Left
                  </span>
                </div>

                <div className="space-y-2 mt-1">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500">
                    <span>Day {elapsedDays} / {totalDays}</span>
                    <span>{progressPct}% Completed</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${progressPct}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100/80 mt-3 pt-2.5 text-[10px] font-bold text-slate-400 font-mono">
                  <span>Hired: {emp.hireDate}</span>
                  <span className="text-[#212c46] font-extrabold font-sans">End: {emp.probationEndDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN DATA TABLE CONTAINER */}
      <div className="bg-white rounded-2xl border border-[#eaeaec] shadow-sm overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-400">
            <RefreshCw className="animate-spin text-[#3f809e] mb-3" size={32} />
            <p className="text-[12px] font-black uppercase tracking-wider">Syncing Secure Worksheets...</p>
          </div>
        ) : filteredEvaluations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-400 text-center">
            <User size={48} className="text-slate-300 mb-3" />
            <p className="text-[12.5px] font-black uppercase text-slate-500">No matching evaluations</p>
            <p className="text-[11px] text-slate-400 mt-1">ทดลองค้นหาโดยระบุชื่อ รหัสพนักงาน หรือสลับตัวกรองแผนกดูค่ะ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans border-collapse min-w-[1000px]">
              <thead className="bg-[#212c46] text-white select-none">
                <tr className="border-b border-[#b7a159]">
                  <th className="py-3.5 px-5 font-black uppercase tracking-widest text-[9.5px] w-40">Identity</th>
                  <th className="py-3.5 px-5 font-black uppercase tracking-widest text-[9.5px]">Hire & End Interval</th>
                  <th className="py-3.5 px-5 font-black uppercase tracking-widest text-[9.5px] text-center">Dimension Breakdown</th>
                  <th className="py-3.5 px-5 font-black uppercase tracking-widest text-[9.5px] text-center">Overall Score</th>
                  <th className="py-3.5 px-5 font-black uppercase tracking-widest text-[9.5px] text-center">Status</th>
                  <th className="py-3.5 px-5 font-black uppercase tracking-widest text-[9.5px] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredEvaluations.map((item, index) => {
                  const avgScore = Math.round(
                    (item.scoreTechnical + item.scoreAttendance + item.scoreTeamwork + item.scorePotential) / 4
                  );

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50/50 transition-colors ${index % 2 === 1 ? 'bg-slate-50/10' : ''}`}
                    >
                      {/* Identity Details */}
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-extrabold text-[#212c46] truncate">
                            {t(item.employeeName)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 font-mono mt-0.5">
                            {item.employeeId}
                          </span>
                          <span className="text-[10px] font-bold text-[#b58c4f] uppercase mt-1 leading-none">
                            {t(item.position)}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">
                            {t(item.department)}
                          </span>
                        </div>
                      </td>

                      {/* Dates & Intervals */}
                      <td className="py-4 px-5">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hire:</span>
                            <span className="text-[11px] font-bold text-[#4c546a] font-mono">{item.hireDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#932c2e] to-[#b58c4f] uppercase tracking-widest">End:</span>
                            <span className="text-[11px] font-extrabold text-[#212c46] font-mono">{item.probationEndDate}</span>
                          </div>
                          {item.id && (
                            <div className="text-[9.5px] text-[#3f809e] font-bold">
                              Assessed: {item.assessDate}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Performance Breakdowns */}
                      <td className="py-4 px-5">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 max-w-sm mx-auto">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-medium">Technical:</span>
                            <span className="font-mono font-bold text-[#3f809e]">{item.scoreTechnical}%</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-medium">Attendance:</span>
                            <span className="font-mono font-bold text-[#657f4d]">{item.scoreAttendance}%</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-medium">Teamwork:</span>
                            <span className="font-mono font-bold text-[#b58c4f]">{item.scoreTeamwork}%</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-medium">Potential:</span>
                            <span className="font-mono font-bold text-[#d96245]">{item.scorePotential}%</span>
                          </div>
                        </div>
                      </td>

                      {/* Overall score radial/stat box */}
                      <td className="py-4 px-5 text-center">
                        <div className="inline-flex flex-col items-center justify-center p-2 bg-[#f8f9fc] rounded-xl border border-slate-200/50 min-w-16">
                          <span className="text-[18px] font-black font-mono text-[#212c46] leading-none">
                            {avgScore}
                          </span>
                          <span className="text-[8px] font-black text-slate-400 tracking-widest uppercase mt-1">Average</span>
                        </div>
                      </td>

                      {/* Evaluation Decision Status */}
                      <td className="py-4 px-5 text-center">
                        <span 
                          className={`inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border font-mono ${
                            item.status === 'Passed' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : item.status === 'Extended'
                                ? 'bg-amber-50 text-amber-700 border-[#b58c4f]/30'
                                : item.status === 'Failed'
                                  ? 'bg-[#932c2e]/10 text-[#932c2e] border-[#932c2e]/20'
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 px-2.5 rounded-lg border border-slate-100 bg-slate-50 transition-all text-[#212c46] hover:bg-[#3f809e] hover:text-white hover:border-[#3f809e] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                          >
                            <Sliders size={12} /> Evaluate
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.employeeName)}
                            className="p-1.5 rounded-lg border border-transparent bg-red-50 text-[#932c2e] hover:bg-[#932c2e] hover:text-white transition-all cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EVALUATION DIALOG / MODAL (DRAGGABLE SYSTEM MODAL) */}
      <AnimatePresence>
        {isModalOpen && (
          <DraggableModal
            title={modalMode === 'create' ? 'EVALUATE AND ACCREDIT NEW PROBATION STAFF' : 'UPDATE PROBATION DIMENSIONS & SCORE'}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            width="max-w-2xl"
          >
            <form onSubmit={handleSubmit} className="p-6 space-y-6 font-sans text-slate-700">
              
              {/* Employee Selection Detail */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-[#525f7a] tracking-widest block mb-1.5">Select Candidate / Employee</label>
                  {modalMode === 'create' ? (
                    <select
                      value={formValues.employeeId}
                      onChange={(e) => setFormValues(prev => ({ ...prev, employeeId: e.target.value }))}
                      className="bg-[#f8f9fc] border border-[#eaeaec] w-full p-2.5 rounded-xl text-xs font-bold text-[#212c46] outline-none cursor-pointer focus:border-[#3f809e]"
                    >
                      <option value="">-- Choose Employee on Probation --</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.id} - {emp.name} ({emp.department || 'No Dept'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="bg-[#f8f9fc] p-3 rounded-xl border border-slate-200/50">
                      <p className="text-[12px] font-extrabold text-[#212c46]">{selectedEval ? t(selectedEval.employeeName) : 'N/A'}</p>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{formValues.employeeId}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-[#525f7a] tracking-widest block mb-1.5">Initial Hire Date</label>
                  <input 
                    type="date"
                    value={formValues.hireDate}
                    onChange={(e) => setFormValues(prev => ({ ...prev, hireDate: e.target.value }))}
                    className="bg-[#f8f9fc] border border-[#eaeaec] w-full p-2.5 rounded-xl text-xs font-bold text-[#212c46] outline-none focus:border-[#3f809e]"
                  />
                </div>
              </div>

              {/* Autocomplete indicators based on selection */}
              {selectedEmployeeObject && modalMode === 'create' && (
                <div className="bg-[#3f809e]/5 border border-[#3f809e]/20 p-3.5 rounded-xl flex items-center justify-between gap-4 animate-fadeIn">
                  <div>
                    <span className="text-[9px] font-black text-[#3f809e] uppercase tracking-widest">Auto-linked Details</span>
                    <h5 className="text-[12px] font-extrabold text-[#212c46] mt-0.5">{selectedEmployeeObject.name}</h5>
                    <span className="text-[10px] font-bold text-[#b58c4f] uppercase">{selectedEmployeeObject.position} • {selectedEmployeeObject.department}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#657f4d]/10 border border-[#657f4d]/20 text-[#657f4d] rounded-full text-[10px] font-bold">
                    Contract: {selectedEmployeeObject.contractType || 'Probation'}
                  </div>
                </div>
              )}

              {/* Dimensions Sliders */}
              <div className="space-y-4 border-t border-b border-slate-100 py-4">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">Dimensonal Scores (0-100%)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Technical Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-[#212c46]">Technical & Execution:</span>
                      <span className="font-mono text-[#3f809e]">{formValues.scoreTechnical}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={formValues.scoreTechnical}
                      onChange={(e) => setFormValues(prev => ({ ...prev, scoreTechnical: Number(e.target.value) }))}
                      className="w-full accent-[#3f809e]"
                    />
                  </div>

                  {/* Attendance Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-[#212c46]">Attendance & Responsibility:</span>
                      <span className="font-mono text-[#657f4d]">{formValues.scoreAttendance}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={formValues.scoreAttendance}
                      onChange={(e) => setFormValues(prev => ({ ...prev, scoreAttendance: Number(e.target.value) }))}
                      className="w-full accent-[#657f4d]"
                    />
                  </div>

                  {/* Teamwork Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-[#212c46]">Teamwork & Attitude:</span>
                      <span className="font-mono text-[#b58c4f]">{formValues.scoreTeamwork}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={formValues.scoreTeamwork}
                      onChange={(e) => setFormValues(prev => ({ ...prev, scoreTeamwork: Number(e.target.value) }))}
                      className="w-full accent-[#b58c4f]"
                    />
                  </div>

                  {/* Potential Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-[#212c46]">Growth Potential:</span>
                      <span className="font-mono text-[#d96245]">{formValues.scorePotential}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={formValues.scorePotential}
                      onChange={(e) => setFormValues(prev => ({ ...prev, scorePotential: Number(e.target.value) }))}
                      className="w-full accent-[#d96245]"
                    />
                  </div>
                </div>
              </div>

              {/* Status and comments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-[#525f7a] tracking-widest block mb-1.5">Expected End Date</label>
                  <input 
                    type="date"
                    value={formValues.probationEndDate}
                    onChange={(e) => setFormValues(prev => ({ ...prev, probationEndDate: e.target.value }))}
                    className="bg-[#f8f9fc] border border-[#eaeaec] w-full p-2.5 rounded-xl text-xs font-bold text-[#212c46] outline-none focus:border-[#3f809e]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-[#525f7a] tracking-widest block mb-1.5">Decision Outcome Status</label>
                  <select
                    value={formValues.status}
                    onChange={(e) => setFormValues(prev => ({ ...prev, status: e.target.value as ProbationEvaluation['status'] }))}
                    className="bg-[#f8f9fc] border border-[#eaeaec] w-full p-2.5 rounded-xl text-xs font-bold text-[#212c46] outline-none cursor-pointer focus:border-[#3f809e]"
                  >
                    <option value="Pending Assessment">Pending Assessment</option>
                    <option value="Passed">Passed (ผ่านทดลอง)</option>
                    <option value="Extended">Extended (ต่อเวลาทดลอง)</option>
                    <option value="Failed">Failed (ไม่ผ่านการทดลอง)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#525f7a] tracking-widest block mb-1.5">Audit Comments & Supervisor recommendation</label>
                <textarea
                  rows={3}
                  value={formValues.comments}
                  onChange={(e) => setFormValues(prev => ({ ...prev, comments: e.target.value }))}
                  placeholder="Specify developmental comments, technical strengths, or action plan items..."
                  className="bg-[#f8f9fc] border border-[#eaeaec] w-full p-3 rounded-2xl text-xs font-bold text-[#212c46] outline-none focus:border-[#3f809e] resize-none"
                />
              </div>

              {/* Buttons panel */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all font-bold text-[11px] uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-2.5 rounded-xl bg-[#212c46] text-white hover:bg-[#3f809e] transition-all font-black text-[11px] uppercase tracking-widest shadow cursor-pointer border border-transparent"
                >
                  Save Assessment
                </button>
              </div>

            </form>
          </DraggableModal>
        )}
      </AnimatePresence>

      {/* FLOATING QUICK ACTION MENU */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {isQuickActionOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xl flex flex-col gap-2.5 min-w-64 max-w-sm mr-1.5"
            >
              <div className="border-b pb-2 mb-1 flex items-center justify-between">
                <span className="text-[10px] font-black text-[#212c46] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={14} className="text-[#b58c4f]" /> HR QUICK COMMANDS
                </span>
                <span className="text-[8px] bg-[#3f809e]/10 text-[#3f809e] px-2 py-0.5 rounded font-black font-mono">HR BETA</span>
              </div>

              {/* Action 1: Schedule Evaluation */}
              <button
                onClick={triggerScheduleEvaluationModal}
                className="w-full text-left p-2.5 px-3 rounded-xl hover:bg-slate-50 hover:text-[#3f809e] group transition-all text-[#212c46] flex items-center gap-2.5 border border-dashed border-slate-100 hover:border-[#3f809e]/30 cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-[#3f809e]/10 text-[#3f809e] group-hover:bg-[#3f809e] group-hover:text-white transition-colors">
                  <Calendar size={14} />
                </div>
                <div>
                  <span className="text-[11.5px] font-extrabold uppercase block leading-tight">Schedule Evaluation</span>
                  <span className="text-[9px] text-slate-400 block font-semibold leading-tight mt-0.5">Set date and assessment supervisor</span>
                </div>
              </button>

              {/* Action 2: Send Reminder */}
              <button
                onClick={triggerSendReminderMail}
                className="w-full text-left p-2.5 px-3 rounded-xl hover:bg-slate-50 hover:text-[#657f4d] group transition-all text-[#212c46] flex items-center gap-2.5 border border-dashed border-slate-100 hover:border-[#657f4d]/30 cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-[#657f4d]/10 text-[#657f4d] group-hover:bg-[#657f4d] group-hover:text-white transition-colors">
                  <FileText size={14} />
                </div>
                <div>
                  <span className="text-[11.5px] font-extrabold uppercase block leading-tight">Send Reminder Email</span>
                  <span className="text-[9px] text-slate-400 block font-semibold leading-tight mt-0.5">Alert department head to evaluate</span>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
          className="relative group h-14 w-14 rounded-full bg-[#212c46] text-white flex items-center justify-center hover:bg-[#3f809e] hover:shadow-[0_0_20px_rgba(63,128,158,0.5)] border-2 border-[#b58c4f] shadow-2xl transition-all duration-300 transform active:scale-95 pointer-events-auto cursor-pointer"
          title="HR Quick Actions Menu"
        >
          <div className="absolute inset-0 rounded-full bg-[#b58c4f]/20 animate-ping opacity-70 group-hover:opacity-0 transition-opacity"></div>
          <Sparkles size={22} className="text-[#b58c4f] group-hover:rotate-12 transition-transform" />
        </button>
      </div>

    </div>
  );
}
