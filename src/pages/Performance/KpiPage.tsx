import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Target, 
  Users, 
  Building2, 
  User, 
  Plus, 
  Clock,
  Search, 
  Filter, 
  RefreshCw, 
  Trash2, 
  Edit, 
  BarChart3, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  FileSpreadsheet, 
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  Percent,
  TrendingDown
} from 'lucide-react';
import { dbSync } from '../../services/dbSync';
import { DraggableModal } from '../../components/shared/DraggableModal';
import KpiCard from '../../components/shared/KpiCard';
import { CsvExport } from '../../components/shared/CsvExport';
import { CsvUpload } from '../../components/shared/CsvUpload';
import { useLanguage } from '../../context/LanguageContext';
import Swal from 'sweetalert2';

// Types for KPIs
export interface DepartmentKpi {
  id: string;
  kpiCode: string;
  name: string;
  department: string;
  weight: number; // percentage, e.g. 20 (meaning 20%)
  targetValue: string;
  actualValue: string;
  progress: number; // calculated completion 0-100
  period: string; // e.g., "2026-Q1", "2026-Q2"
  status: 'On Track' | 'Exceeded' | 'Behind' | 'Critical';
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IndividualKpi {
  id: string;
  kpiCode: string;
  employeeId: string;
  employeeName: string;
  department: string;
  name: string;
  weight: number;
  targetValue: string;
  actualValue: string;
  progress: number;
  period: string;
  status: 'Met' | 'Not Met' | 'Pending';
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  position: string;
}

// Initial seed data for Department KPIs
const INITIAL_DEPT_KPIS: DepartmentKpi[] = [
  {
    id: 'DKPI-001',
    kpiCode: 'KPI-MGT-001',
    name: 'ประเมินความพึงพอใจการทำงานของพนักงาน (Employee Satisfaction)',
    department: 'Human Resources',
    weight: 20,
    targetValue: '85%',
    actualValue: '88%',
    progress: 100,
    period: '2026-Q1',
    status: 'On Track',
    description: 'ผลสำรวจความพึงพอใจและความผูกพันในองค์กรของพนักงานประจำปีเบื้องต้น'
  },
  {
    id: 'DKPI-002',
    kpiCode: 'KPI-MGT-002',
    name: 'สัดส่วนชั่วโมงการฝึกอบรมต่อคน (Average Training Hours)',
    department: 'Human Resources',
    weight: 15,
    targetValue: '12 hrs',
    actualValue: '15 hrs',
    progress: 100,
    period: '2026-Q1',
    status: 'Exceeded',
    description: 'จำนวนชั่วโมงฝึกอบรมสะสมเฉลี่ยต่อนายจ้าง/พนักงานเพื่อเสริมสร้างศักยภาพ'
  },
  {
    id: 'DKPI-003',
    kpiCode: 'KPI-QA-001',
    name: 'อัตราของเสียจากการผลิตผลิตภัณฑ์ (Product Defect Rate)',
    department: 'Quality Assurance',
    weight: 25,
    targetValue: '0.50%',
    actualValue: '0.38%',
    progress: 100,
    period: '2026-Q1',
    status: 'On Track',
    description: 'สัดส่วนของเสียที่พบลดลงกว่าที่กำหนดตามเป้าหมายของฝ่ายประกันคุณภาพ'
  },
  {
    id: 'DKPI-004',
    kpiCode: 'KPI-IT-001',
    name: 'ระยะเวลาอัตราระบบออนไลน์ทำงานปกติ (Core System Uptime)',
    department: 'Information Technology',
    weight: 20,
    targetValue: '99.90%',
    actualValue: '99.94%',
    progress: 100,
    period: '2026-Q1',
    status: 'On Track',
    description: 'ความต่อเนื่องในการรันเซิร์ฟเวอร์หลักและแอปพลิเคชันภายใน'
  },
  {
    id: 'DKPI-005',
    kpiCode: 'KPI-IT-002',
    name: 'ระยะเวลาการแก้ปัญหาด้านเทคนิคเฉลี่ย (Average Ticket Resolution Time)',
    department: 'Information Technology',
    weight: 10,
    targetValue: '4 hrs',
    actualValue: '5.5 hrs',
    progress: 72,
    period: '2026-Q1',
    status: 'Behind',
    description: 'ระยะเวลาในการปิดใบงานช่วยเหลือระบบล่าช้าเนื่องจากปริมาณคำขอบริการใหม่สูงขึ้น'
  },
  {
    id: 'DKPI-006',
    kpiCode: 'KPI-PRD-001',
    name: 'ชั่วโมงการทำงานปลอดภัยไม่มีอุบัติเหตุ (Zero Accident Safe Hours)',
    department: 'Production & Safety',
    weight: 30,
    targetValue: '10,000 hrs',
    actualValue: '12,500 hrs',
    progress: 100,
    period: '2026-Q1',
    status: 'Exceeded',
    description: 'ชั่วโมงสะสมการปฏิบัติงานโดยไม่มีอุบัติเหตุนำไปสู่การหยุดงาน'
  }
];

// Initial seed data for Individual KPIs
const INITIAL_IND_KPIS: IndividualKpi[] = [
  {
    id: 'IKPI-001',
    kpiCode: 'KPI-IND-001',
    employeeId: 'EMP-001',
    employeeName: 'สมชาย รักดี (Somchai Rakdee)',
    department: 'Human Resources',
    name: 'ประสิทธิภาพการสรรหาอัตรากำลังพลเป้าหมาย (Recruitment Target Fulfillment)',
    weight: 30,
    targetValue: '100%',
    actualValue: '90%',
    progress: 90,
    period: '2026-Q1',
    status: 'Met',
    description: 'จัดหาสรรหาและบรรจุพนักงานได้ตรงตามแผนอัตราร้อยละเก้าสิบ'
  },
  {
    id: 'IKPI-002',
    kpiCode: 'KPI-IND-002',
    employeeId: 'EMP-001',
    employeeName: 'สมชาย รักดี (Somchai Rakdee)',
    department: 'Human Resources',
    name: 'ความคืบหน้าการพัฒนาโมดูลการอบรมภายในดิจิทัล (Digital Training Module)',
    weight: 20,
    targetValue: '3 modules',
    actualValue: '2 modules',
    progress: 66,
    period: '2026-Q1',
    status: 'Not Met',
    description: 'จัดทำวิดีโอและหลักสูตรปฐมพยาบาลและผู้นำยุคใหม่'
  },
  {
    id: 'IKPI-003',
    kpiCode: 'KPI-IND-003',
    employeeId: 'EMP-002',
    employeeName: 'วรรณพร สดใส (Wannaporn Sodsai)',
    department: 'Human Resources',
    name: 'สัดส่วนการตรวจสอบโปรแกรมเงินเดือนแม่นยำ (Payroll Processing Accuracy)',
    weight: 40,
    targetValue: '99.9%',
    actualValue: '100%',
    progress: 100,
    period: '2026-Q1',
    status: 'Met',
    description: 'การคำนวณเบี้ยขยัน การหักภาษี และการบันทึกหักเงินถูกต้องครบถ้วน'
  },
  {
    id: 'IKPI-004',
    kpiCode: 'KPI-IND-004',
    employeeId: 'EMP-003',
    employeeName: 'กิตติพงษ์ ยอดเยี่ยม (Kittipong Yodyiem)',
    department: 'Information Technology',
    name: 'ความเร็วการพัฒนาระบบซิงค์ Google Sheets ออฟไลน์ (Sync Engine)',
    weight: 50,
    targetValue: '95% integration',
    actualValue: '98% integration',
    progress: 100,
    period: '2026-Q1',
    status: 'Met',
    description: 'ความเชื่อถือได้ความเสถียรของเบื้องหลังฐานข้อมูลสตรีมมิ่ง'
  },
  {
    id: 'IKPI-005',
    kpiCode: 'KPI-IND-005',
    employeeId: 'EMP-004',
    employeeName: 'นภาลัย เรืองรอง (Napalai Ruangrong)',
    department: 'Quality Assurance',
    name: 'การตรวจประเมินความสอดคล้อง ISO (ISO Compliance Audit)',
    weight: 35,
    targetValue: '0 NCR',
    actualValue: 'Pending audit',
    progress: 0,
    period: '2026-Q1',
    status: 'Pending',
    description: 'การดำเนินการสุ่มตรวจสอบสภาพแวดล้อมกระบวนการทำงานและสรุปรายงาน'
  }
];

// --- User Guide Panel for KPI / OKR Setting ---
function UserGuidePanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <>
      <div className={`fixed inset-0 z-[190] bg-[#212c46]/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose}/>
      <div className={`fixed inset-y-0 right-0 z-[200] w-full md:w-[500px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col border-l-4 border-[#709654] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex justify-between items-center p-5 px-6 border-b-2 border-[#709654] bg-[#212c46] text-white shrink-0">
          <div>
            <h3 className="font-black flex items-center gap-3 uppercase tracking-widest text-[15px]"><Target size={20} className="text-[#709654]"/> KPI & OKR SETTING GUIDE</h3>
            <p className="text-[11px] font-bold text-[#d7d7d7] uppercase tracking-widest mt-1">คู่มือตั้งค่าตัวชี้วัดผลงานหลัก</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-[#932c2e] hover:bg-white/10 rounded-xl transition-colors"><Plus size={24} className="rotate-45"/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8 text-[#414757] text-[12px] leading-relaxed custom-scrollbar bg-white animate-fadeIn">
          <section>
            <h4 className="text-[13px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-[#eaeaec] pb-2 font-mono">
              <Building2 size={18} className="text-[#709654]"/> 1. แผนสัดส่วน KPIs ขององค์กร
            </h4>
            <p className="text-[12px] mb-2 font-sans text-[#525a72]">
              โครงกรอบการทำงานนี้แบ่งมาตรฐานหลักออกเป็น 2 มิติผ่านหัวข้อแท็บดนูปุ่มหลัก:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#525a72]">
              <li><strong>KPIs แบบหน่วยงาน (Department KPIs):</strong> ตัวชี้วัดสำคัญของแต่ละแผนก (เช่น น้ำหนักความถูกต้อง, งานผลิต หรือสถิติความปลอดภัย)</li>
              <li><strong>KPIs แบบบุคคล (Individual KPIs):</strong> ดัชนีศักยภาพของพนักงานเฉพาะราย สำหรับจัดสัดส่วนการแข่งขันและประเมินผลโบนัสและคุณภาพงานปลายปี</li>
            </ul>
          </section>

          <section>
            <h4 className="text-[13px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-[#eaeaec] pb-2 font-mono">
              <Sparkles size={18} className="text-[#b58c4f]"/> 2. วิธีการกำหนดประเมินผลลัพธ์
            </h4>
            <p className="text-[12px] mb-2">เจ้าหน้าที่หรือผู้บริหารตั้งค่าได้โดยเลือก <strong>+ ADD NEW KPI</strong>:</p>
            <ul className="list-decimal pl-5 space-y-2 mt-1">
              <li>ชื่อหัวข้อดัชนีและรหัสหน่วยงาน (e.g. KPI-DEP-001)</li>
              <li><strong>ค่าน้ำหนักหลัก (Weight %):</strong> สัดส่วนความสำคัญเมื่อเปรียบเทียบจาก 100%</li>
              <li><strong>ค่าเป้าหมาย (Target) และความสำเร็จสะสมจริง (Actual):</strong> ระบุความคืบหน้าปัจจุบันเป็นตัวอักษรหรืออัตราส่วนเพื่อประเมินความปลอดภัยทันใจ</li>
            </ul>
          </section>

          <section>
            <h4 className="text-[13px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-[#eaeaec] pb-2 font-mono">
              <FileSpreadsheet size={18} className="text-[#3f809e]"/> 3. นำเข้าแบบรวดเร็ว (Bulk CSV Import)
            </h4>
            <p className="text-[12px] text-[#525a72]">
              เพื่อความรวดเร็วสูงสุด แผนก HR สามารถดาวน์โหลดตัวอย่างไฟล์ จัดเรียงค่าน้ำหนักใน Excel และลากวางเพื่อซิงโครไนซ์เข้าระบบคอร์แบบทันที ไม่ต้องป้อนข้อมูลทีละรายการ
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

export default function KpiPage() {
  const { t } = useLanguage();
  
  // Tab states: 'department' | 'individual'
  const [activeTab, setActiveTab] = useState<'department' | 'individual'>('department');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  
  // Data lists
  const [deptKpis, setDeptKpis] = useState<DepartmentKpi[]>([]);
  const [indKpis, setIndKpis] = useState<IndividualKpi[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter/Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [periodFilter, setPeriodFilter] = useState('All');

  // Modals
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isIndModalOpen, setIsIndModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form states (Editing / Creating)
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Department Form
  const [deptForm, setDeptForm] = useState<Partial<DepartmentKpi>>({
    kpiCode: '',
    name: '',
    department: 'Human Resources',
    weight: 10,
    targetValue: '',
    actualValue: '',
    progress: 100,
    period: '2026-Q2',
    status: 'On Track',
    description: ''
  });

  // Individual Form
  const [indForm, setIndForm] = useState<Partial<IndividualKpi>>({
    kpiCode: '',
    employeeId: '',
    employeeName: '',
    department: 'Human Resources',
    name: '',
    weight: 10,
    targetValue: '',
    actualValue: '',
    progress: 100,
    period: '2026-Q2',
    status: 'Pending',
    description: ''
  });

  // Fetch all lists from dbSync / fallback
  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Department KPIs
      const deptRes = await dbSync.read('kpi_department');
      if (deptRes.status === 'success' && deptRes.data?.items && deptRes.data.items.length > 0) {
        setDeptKpis(deptRes.data.items);
      } else {
        // First load seed
        setDeptKpis(INITIAL_DEPT_KPIS);
        await dbSync.write('kpi_department', INITIAL_DEPT_KPIS);
      }

      // 2. Individual KPIs
      const indRes = await dbSync.read('kpi_individual');
      if (indRes.status === 'success' && indRes.data?.items && indRes.data.items.length > 0) {
        setIndKpis(indRes.data.items);
      } else {
        // First load seed
        setIndKpis(INITIAL_IND_KPIS);
        await dbSync.write('kpi_individual', INITIAL_IND_KPIS);
      }

      // 3. Employees directory (to link names in Individual KPIs dropdown)
      const empRes = await dbSync.read('employees');
      if (empRes.status === 'success' && empRes.data?.items) {
        setEmployees(empRes.data.items);
      }
    } catch (err) {
      console.error('Error loading KPI sets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Action: Force sync & reload
  const handleReload = async () => {
    await loadData();
    Swal.fire({
      icon: 'success',
      title: 'ข้อมูลอัปเดตสำเร็จ',
      text: 'ดึงข้อมูลพิกัดชีตและคลาวด์เรียบร้อยแล้ว',
      confirmButtonColor: '#1e293b',
      timer: 1500
    });
  };

  // Departments uniquely present for dropdown filters
  const departmentsList = useMemo(() => {
    const list = new Set<string>();
    deptKpis.forEach(item => {
      if (item.department) list.add(item.department);
    });
    indKpis.forEach(item => {
      if (item.department) list.add(item.department);
    });
    // Add default core departments just in case
    ['Human Resources', 'Information Technology', 'Quality Assurance', 'Production & Safety', 'Accounting', 'Sales'].forEach(d => list.add(d));
    return Array.from(list);
  }, [deptKpis, indKpis]);

  // Unique periods present for dropdown filters
  const periodsList = useMemo(() => {
    const list = new Set<string>(['2026-Q1', '2026-Q2', '2026-Q3', '2026-Q4']);
    deptKpis.forEach(item => {
      if (item.period) list.add(item.period);
    });
    indKpis.forEach(item => {
      if (item.period) list.add(item.period);
    });
    return Array.from(list);
  }, [deptKpis, indKpis]);

  // Filtered Department list
  const filteredDeptKpis = useMemo(() => {
    return deptKpis.filter(item => {
      const matchSearch = 
        item.kpiCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchDept = deptFilter === 'All' || item.department === deptFilter;
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchPeriod = periodFilter === 'All' || item.period === periodFilter;

      return matchSearch && matchDept && matchStatus && matchPeriod;
    });
  }, [deptKpis, searchTerm, deptFilter, statusFilter, periodFilter]);

  // Filtered Individual list
  const filteredIndKpis = useMemo(() => {
    return indKpis.filter(item => {
      const matchSearch =
        item.kpiCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDept = deptFilter === 'All' || item.department === deptFilter;
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchPeriod = periodFilter === 'All' || item.period === periodFilter;

      return matchSearch && matchDept && matchStatus && matchPeriod;
    });
  }, [indKpis, searchTerm, deptFilter, statusFilter, periodFilter]);

  // Statistics for Department metrics
  const deptStats = useMemo(() => {
    const total = deptKpis.length;
    const weightsSum = deptKpis.reduce((acc, current) => acc + (Number(current.weight) || 0), 0);
    const exceeded = deptKpis.filter(k => k.status === 'Exceeded').length;
    const behind = deptKpis.filter(k => k.status === 'Behind' || k.status === 'Critical').length;
    const onTrack = deptKpis.filter(k => k.status === 'On Track').length;
    const averageProgress = total > 0 ? Math.round(deptKpis.reduce((acc, curr) => acc + (curr.progress || 0), 0) / total) : 0;
    
    return { total, weightsSum, exceeded, behind, onTrack, averageProgress };
  }, [deptKpis]);

  // Statistics for Individual metrics
  const indStats = useMemo(() => {
    const total = indKpis.length;
    const met = indKpis.filter(k => k.status === 'Met').length;
    const notMet = indKpis.filter(k => k.status === 'Not Met').length;
    const pending = indKpis.filter(k => k.status === 'Pending').length;
    const completionRate = total > 0 ? Math.round((met / total) * 100) : 0;

    return { total, met, notMet, pending, completionRate };
  }, [indKpis]);

  // Reset Filters tool
  const resetFilters = () => {
    setSearchTerm('');
    setDeptFilter('All');
    setStatusFilter('All');
    setPeriodFilter('All');
  };

  // Action: Save Department KPI
  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.kpiCode || !deptForm.name || !deptForm.department) {
      Swal.fire('ข้อผิดพลาด', 'กรุณาระบุรหัส KPI ชื่อ และฝ่ายงาน', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const progressNum = Number(deptForm.progress) || 100;
      const weightNum = Number(deptForm.weight) || 10;
      
      if (isEditing && editingId) {
        // Edit flow
        const updated = deptKpis.map(item => {
          if (item.id === editingId) {
            return {
              ...item,
              ...deptForm,
              weight: weightNum,
              progress: progressNum
            } as DepartmentKpi;
          }
          return item;
        });

        const targetRecord = updated.find(x => x.id === editingId)!;
        await dbSync.update('kpi_department', [targetRecord]);
        setDeptKpis(updated);
        Swal.fire('สำเร็จ', 'แก้ไขข้อมูล KPI ฝ่ายเรียบร้อย', 'success');
      } else {
        // Create flow
        const newRecord: DepartmentKpi = {
          id: `DKPI-${Date.now().toString().slice(-6)}`,
          kpiCode: deptForm.kpiCode,
          name: deptForm.name,
          department: deptForm.department || 'Human Resources',
          weight: weightNum,
          targetValue: deptForm.targetValue || '100%',
          actualValue: deptForm.actualValue || '-',
          progress: progressNum,
          period: deptForm.period || '2026-Q2',
          status: deptForm.status || 'On Track',
          description: deptForm.description || ''
        };

        const listToSave = [newRecord];
        await dbSync.write('kpi_department', listToSave);
        setDeptKpis(prev => [newRecord, ...prev]);
        Swal.fire('สำเร็จ', 'บันทึกข้อมูล KPI ฝ่ายใหม่เรียบร้อย', 'success');
      }
      setIsDeptModalOpen(false);
    } catch (err) {
      console.error(err);
      Swal.fire('ข้อผิดพลาด', 'พิกัดของช่วงอยู่นอกมิติข้อมูลของแผ่นงาน หรือล้มเหลว', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Action: Fill Edit Form Department
  const handleEditDeptInit = (kpi: DepartmentKpi) => {
    setIsEditing(true);
    setEditingId(kpi.id);
    setDeptForm(kpi);
    setIsDeptModalOpen(true);
  };

  // Action: Delete Department KPI
  const handleDeleteDept = (id: string, code: string) => {
    Swal.fire({
      title: `ลบหัวข้อ ${code}?`,
      text: "คุณแน่ใจหรือไม่ที่จะลบดัชนีชี้วัดข้อนี้ ออกจากฐานข้อมูลส่วนกลาง",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#475569',
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        try {
          await dbSync.delete('kpi_department', [{ id }]);
          setDeptKpis(prev => prev.filter(x => x.id !== id));
          Swal.fire('ลบออกแล้ว', 'ลบหัวข้อ KPI เรียบร้อยการทำงานสมบูรณ์', 'success');
        } catch (err) {
          console.error(err);
          Swal.fire('ข้อผิดพลาด', 'ลบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 'error');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // Action: Save Individual KPI
  const handleSaveInd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!indForm.kpiCode || !indForm.name || !indForm.employeeName) {
      Swal.fire('ข้อผิดพลาด', 'กรุณาระบุรหัส KPI ชื่อ และเลือกผู้ปฏิบัติงาน', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const progressNum = Number(indForm.progress) || 100;
      const weightNum = Number(indForm.weight) || 10;

      // Link selected employee details
      const selectedEmp = employees.find(e => e.name === indForm.employeeName);
      const empIdForRecord = selectedEmp ? selectedEmp.employeeId : (indForm.employeeId || 'U999');
      const deptForRecord = selectedEmp ? selectedEmp.department : (indForm.department || 'Human Resources');

      if (isEditing && editingId) {
        const updated = indKpis.map(item => {
          if (item.id === editingId) {
            return {
              ...item,
              ...indForm,
              employeeId: empIdForRecord,
              department: deptForRecord,
              weight: weightNum,
              progress: progressNum
            } as IndividualKpi;
          }
          return item;
        });

        const targetRecord = updated.find(x => x.id === editingId)!;
        await dbSync.update('kpi_individual', [targetRecord]);
        setIndKpis(updated);
        Swal.fire('สำเร็จ', 'แก้ไขข้อมูล KPI รายบุคคลเรียบร้อย', 'success');
      } else {
        const newRecord: IndividualKpi = {
          id: `IKPI-${Date.now().toString().slice(-6)}`,
          kpiCode: indForm.kpiCode,
          employeeId: empIdForRecord,
          employeeName: indForm.employeeName,
          department: deptForRecord,
          name: indForm.name,
          weight: weightNum,
          targetValue: indForm.targetValue || '100%',
          actualValue: indForm.actualValue || '-',
          progress: progressNum,
          period: indForm.period || '2026-Q2',
          status: indForm.status || 'Pending',
          description: indForm.description || ''
        };

        const listToSave = [newRecord];
        await dbSync.write('kpi_individual', listToSave);
        setIndKpis(prev => [newRecord, ...prev]);
        Swal.fire('สำเร็จ', 'บันทึกข้อมูล KPI รายบุคคลเรียบร้อย', 'success');
      }
      setIsIndModalOpen(false);
    } catch (err) {
      console.error(err);
      Swal.fire('ข้อผิดพลาด', 'จัดเก็บสัญญาล้มเหลวในแผ่นงาน', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditIndInit = (kpi: IndividualKpi) => {
    setIsEditing(true);
    setEditingId(kpi.id);
    setIndForm(kpi);
    setIsIndModalOpen(true);
  };

  const handleDeleteInd = (id: string, code: string) => {
    Swal.fire({
      title: `ลบหัวข้อบุคคล ${code}?`,
      text: "การลบจะสะท้อนการปรับประสพการณ์คะแนนประเมินผลกลาง",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#475569',
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        try {
          await dbSync.delete('kpi_individual', [{ id }]);
          setIndKpis(prev => prev.filter(x => x.id !== id));
          Swal.fire('สำเร็จ', 'ดัชนีชี้วัดลบจากคลาวด์/แผ่นงานเรียบร้อย', 'success');
        } catch (err) {
          console.error(err);
          Swal.fire('ล้มเหลว', 'เกิดความผิดพลาดในการลบ', 'error');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // CSV Import flow
  const handleBulkImport = async (data: any[]) => {
    setIsLoading(true);
    try {
      if (activeTab === 'department') {
        const formatted = data.map((item, index) => ({
          id: item.id || `DKPI-BL-${Date.now().toString().slice(-4)}-${index}`,
          kpiCode: item.kpiCode || `KPI-DEP-${index + 10}`,
          name: item.name || 'Untitled Dept KPI',
          department: item.department || 'Human Resources',
          weight: Number(item.weight) || 10,
          targetValue: String(item.targetValue || '90%'),
          actualValue: String(item.actualValue || '-'),
          progress: Number(item.progress) || 100,
          period: item.period || '2026-Q1',
          status: item.status || 'On Track',
          description: item.description || ''
        }));
        
        await dbSync.write('kpi_department', formatted);
        setDeptKpis(prev => [...formatted, ...prev]);
        Swal.fire('สำเร็จ', `อัปโหลด KPI หน่วยงานจำนวน ${data.length} รายการแล้ว`, 'success');
      } else {
        const formatted = data.map((item, index) => ({
          id: item.id || `IKPI-BL-${Date.now().toString().slice(-4)}-${index}`,
          kpiCode: item.kpiCode || `KPI-IND-${index + 10}`,
          employeeId: item.employeeId || 'U999',
          employeeName: item.employeeName || 'Unnamed Staff',
          department: item.department || 'Human Resources',
          name: item.name || 'Untitled Individual KPI',
          weight: Number(item.weight) || 10,
          targetValue: String(item.targetValue || '100%'),
          actualValue: String(item.actualValue || '-'),
          progress: Number(item.progress) || 100,
          period: item.period || '2026-Q1',
          status: item.status || 'Pending',
          description: item.description || ''
        }));

        await dbSync.write('kpi_individual', formatted);
        setIndKpis(prev => [...formatted, ...prev]);
        Swal.fire('สำเร็จ', `อัปโหลด KPI รายบุคคลจำนวน ${data.length} รายการแล้ว`, 'success');
      }
      setIsImportModalOpen(false);
    } catch (err) {
      console.error(err);
      Swal.fire('การนำข้อมูลเข้าล้มเหลว', 'เกิดข้อผิดพลาดในการเชื่อมต่อคลาวด์แผ่นงาน', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Sync state helpers
  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'Exceeded': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'On Track': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Behind': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Critical': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Met': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Not Met': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Pending': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusThai = (status: string) => {
    switch (status) {
      case 'Exceeded': return 'เกินเป้าหมาย (Exceeded)';
      case 'On Track': return 'เป็นไปตามเป้า (On Track)';
      case 'Behind': return 'ล่าช้ากว่าเป้า (Behind)';
      case 'Critical': return 'วิกฤตความเสี่ยง (Critical)';
      case 'Met': return 'บรรลุผลสำเร็จ (Met)';
      case 'Not Met': return 'ไม่บรรลุเป้าหมาย (Not Met)';
      case 'Pending': return 'รอการวัดผล (Pending)';
      default: return status;
    }
  };

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 text-slate-800" id="kpis-setting-module">
      
      {/* 1. Header user guide floating tab */}
      <button 
        onClick={() => setIsGuideOpen(true)} 
        className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#709654] hover:text-white hover:border-[#709654] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group cursor-pointer" 
        style={{ top: '80px' }}
      >
        <Plus size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
        <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[11px] font-mono">USER GUIDE</span>
      </button>

      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Page Header Section */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0 bg-transparent">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center cursor-default shrink-0">
            <div className="absolute inset-0 bg-[#709654] blur-[15px] opacity-20 rounded-full"></div>
            <div className="relative z-10 w-10 h-10 border border-slate-200 rounded-2xl bg-white/50 backdrop-blur-sm shadow-sm flex items-center justify-center">
              <Target size={20} strokeWidth={2.5} className="text-[#212c46]" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
              ดัชนีชี้วัดผลงานหลัก <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#657f4d] to-[#b58c4f]">KPIs Setting</span>
            </h3>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mt-0.5 leading-none">
              ระบบศูนย์กลางจัดการเป้าหมายระดับหน่วยงานและรายบุคคล เชื่อมข้อมูลชีตกลางเรียลไทม์
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh sync button */}
          <button
            onClick={handleReload}
            disabled={isLoading}
            className="flex items-center justify-center p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-all disabled:opacity-50"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>

          {/* Bulk Import Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
          >
            <FileSpreadsheet size={15} />
            <span>นำเข้าข้อมูล (XLSX/CSV)</span>
          </button>

          {/* Add KPI standard button */}
          <button
            onClick={() => {
              setIsEditing(false);
              if (activeTab === 'department') {
                setDeptForm({
                  kpiCode: `KPI-DEP-${Date.now().toString().slice(-4)}`,
                  name: '',
                  department: 'Human Resources',
                  weight: 10,
                  targetValue: '',
                  actualValue: '',
                  progress: 100,
                  period: '2026-Q2',
                  status: 'On Track',
                  description: ''
                });
                setIsDeptModalOpen(true);
              } else {
                setIndForm({
                  kpiCode: `KPI-IND-${Date.now().toString().slice(-4)}`,
                  employeeId: '',
                  employeeName: employees[0]?.name || '',
                  department: 'Human Resources',
                  name: '',
                  weight: 10,
                  targetValue: '',
                  actualValue: '',
                  progress: 100,
                  period: '2026-Q2',
                  status: 'Pending',
                  description: ''
                });
                setIsIndModalOpen(true);
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-700 to-indigo-800 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:from-sky-800 hover:to-indigo-900 transition-all shadow-md"
          >
            <Plus size={16} />
            <span>สร้าง KPI ใหม่</span>
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 w-full mt-[2px] space-y-4">
        {/* Tabs Selector Navigation */}
        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl w-full max-w-md border border-slate-200/50">
          <button
            onClick={() => { setActiveTab('department'); resetFilters(); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'department'
                ? 'bg-white text-[#111f42] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 size={16} />
            <span>KPIs แบบหน่วยงาน</span>
          </button>
          <button
            onClick={() => { setActiveTab('individual'); resetFilters(); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'individual'
                ? 'bg-white text-[#111f42] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User size={16} />
            <span>KPIs แบบบุคคล</span>
          </button>
        </div>

      {/* KPI Stats Overview Panels (Dynamic based on selected Tab) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeTab === 'department' ? (
          <>
            <KpiCard
              label="TOTAL DEPT KPIs"
              value={deptStats.total}
              icon={Target}
              color="#3b82f6"
              description="จำนวนดัชนีชี้วัดฝ่ายทั้งหมด"
            />
            <KpiCard
              label="AVERAGE PROGRESS"
              value={`${deptStats.averageProgress}%`}
              icon={TrendingUp}
              color="#4f46e5"
              description="ความก้าวหน้ารวมฝ่ายเฉลี่ย"
            />
            <KpiCard
              label="ON TRACK / EXCEEDED"
              value={`${deptStats.onTrack + deptStats.exceeded}`}
              icon={CheckCircle}
              color="#10b981"
              description="จำนวนเป้าหมายอยู่ในเกณฑ์ดี"
            />
            <KpiCard
              label="BEHIND BUDGET/PLAN"
              value={deptStats.behind}
              icon={AlertTriangle}
              color="#f59e0b"
              description="จำนวนเป้าหมายที่ต่ำกว่าเกณฑ์"
            />
          </>
        ) : (
          <>
            <KpiCard
              label="TOTAL INDIVIDUAL KPIs"
              value={indStats.total}
              icon={Users}
              color="#3b82f6"
              description="ดัชนีชี้วัดบุคคลสะสม"
            />
            <KpiCard
              label="COMPLETION RATE"
              value={`${indStats.completionRate}%`}
              icon={CheckCircle}
              color="#10b981"
              description="สัดส่วนที่บรรลุผลเป้าหมาย"
            />
            <KpiCard
              label="MET CRITERIA"
              value={indStats.met}
              icon={TrendingUp}
              color="#0d9488"
              description="ประเมินผ่านตามเกณฑ์"
            />
            <KpiCard
              label="PENDING ASSESSMENT"
              value={indStats.pending}
              icon={Clock}
              color="#f59e0b"
              description="รอสรุปผลงานระดับถัดไป"
            />
          </>
        )}
      </div>

      {/* Filters & Control Station */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
        <div className="flex items-center gap-2 text-slate-700">
          <Filter size={16} className="text-[#3b82f6]" />
          <span className="text-xs font-black uppercase tracking-wider">แผงควบคุมระบุเงื่อนไขค้นหา</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Search text input */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, รหัส, หรือแฝง..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Department dropdown */}
          <div className="flex flex-col">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
            >
              <option value="All">ทุกฝ่ายงาน (All Departments)</option>
              {departmentsList.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Status dropdown */}
          <div className="flex flex-col">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
            >
              <option value="All">ทุกสถานะ (All Status)</option>
              {activeTab === 'department' ? (
                <>
                  <option value="Exceeded">Exceeded (เกินเป้าหมาย)</option>
                  <option value="On Track">On Track (เป็นไปตามเป้า)</option>
                  <option value="Behind">Behind (ล่าช้ากว่าเป้า)</option>
                  <option value="Critical">Critical (วิกฤตความเสี่ยง)</option>
                </>
              ) : (
                <>
                  <option value="Met">Met (บรรลุผลสำเร็จ)</option>
                  <option value="Not Met">Not Met (ไม่บรรลุเป้าหมาย)</option>
                  <option value="Pending">Pending (รอการประเมิน)</option>
                </>
              )}
            </select>
          </div>

          {/* Period filter dropdown */}
          <div className="flex flex-col">
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
            >
              <option value="All">ทุกช่วงเวลาสำรวจ (All Periods)</option>
              {periodsList.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Action Controls & Clear button */}
        <div className="flex items-center justify-between border-t border-slate-50 pt-4 flex-wrap gap-2 text-xs">
          <div className="text-slate-400 font-medium">
            พบรายการกรองผลลัพธ์ทั้งสิ้น 
            <strong className="text-slate-800 mx-1 font-extrabold font-mono text-sm">
              {activeTab === 'department' ? filteredDeptKpis.length : filteredIndKpis.length}
            </strong> 
            จากผลรวมทั้งหมด
          </div>

          <div className="flex items-center gap-2">
            {(searchTerm || deptFilter !== 'All' || statusFilter !== 'All' || periodFilter !== 'All') && (
              <button
                onClick={resetFilters}
                className="px-3.5 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 rounded-lg font-black uppercase tracking-wider transition-all"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            )}

            {/* CSV Export Module */}
            <CsvExport
              data={activeTab === 'department' ? filteredDeptKpis : filteredIndKpis}
              filename={activeTab === 'department' ? 'department_kpi_export.csv' : 'individual_kpi_export.csv'}
              label={activeTab === 'department' ? 'ส่งออกข้อมูลฝ่าย (CSV)' : 'ส่งออกข้อมูลบุคคล (CSV)'}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area (Lists table as card components) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        
        {activeTab === 'department' ? (
          /* SECTION: Department KPI Table */
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#1e293b]/5 border-b border-[#1e293b]/10">
                <tr>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-[#212c46]">รหัส (Code)</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-[#212c46]">เป้าหมาย / ดัชนีชี้วัด (KPI Title)</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-[#212c46]">ฝ่ายงาน (Dept)</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-center text-[#212c46]">น้ำหนัก (Weight)</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-center text-[#212c46]">เป้าหมาย / ผลจริง (Target / Actual)</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-center text-[#212c46]">สัดส่วนผลลัพธ์ (Progress)</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-[#212c46]">สถานะ (Status)</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-center text-[#212c46]">จัดการ (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeptKpis.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 font-extrabold uppercase tracking-widest">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle size={28} className="text-slate-300" />
                        <span>ไม่พบคู่สัญญาเป้าหมาย KPI ตามเงื่อนไขกรอง</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDeptKpis.map((kpi, index) => (
                    <tr key={`${kpi.id}-${index}`} className="hover:bg-slate-50/55 transition-colors">
                      {/* Code */}
                      <td className="px-6 py-4 font-extrabold font-mono text-[#4338ca] uppercase tracking-wider">{kpi.kpiCode}</td>
                      
                      {/* Title & Description */}
                      <td className="px-6 py-4 max-w-sm">
                        <p className="font-extrabold text-[#111f42] text-sm leading-tight">{kpi.name}</p>
                        <p className="text-[11px] text-slate-400 font-semibold line-clamp-1 mt-1">{kpi.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-black">{kpi.period}</span>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-[#1e293b] text-[10px] font-black uppercase rounded-full tracking-wider">
                          <Building2 size={11} className="text-[#3b82f6]" />
                          {kpi.department}
                        </span>
                      </td>

                      {/* Weight */}
                      <td className="px-6 py-4 text-center font-extrabold text-[#212c46]">
                        <span className="flex items-center justify-center gap-0.5">
                          {kpi.weight}% <Percent size={11} className="text-slate-400" />
                        </span>
                      </td>

                      {/* Target / Actual */}
                      <td className="px-6 py-4 text-center">
                        <div className="text-slate-500 font-bold">Target: <strong className="text-[#111f42]">{kpi.targetValue}</strong></div>
                        <div className="text-slate-500 font-bold">Actual: <strong className="text-[#3b82f6]">{kpi.actualValue}</strong></div>
                      </td>

                      {/* Progress bar */}
                      <td className="px-6 py-4 max-w-xs text-center">
                        <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 font-bold mb-1">
                          <span>Progress: {kpi.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              kpi.progress >= 100 
                                ? 'bg-emerald-500' 
                                : kpi.progress >= 70 
                                  ? 'bg-sky-500' 
                                  : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, kpi.progress))}%` }}
                          />
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full tracking-wider border ${getBadgeColor(kpi.status)}`}>
                          {getStatusThai(kpi.status)}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEditDeptInit(kpi)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-[#4338ca] transition-colors"
                            title="แก้ไข"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteDept(kpi.id, kpi.kpiCode)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                            title="ลบ"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* SECTION: Individual KPI Table */
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#1e293b]/5 border-b border-[#1e293b]/10">
                <tr>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-[#212c46]">รหัส (Code)</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-[#212c46]">ผู้ได้รับสิทธิเป้าหมาย (Employee Details)</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-[#212c46]">ชื่อดัชนีชี้วัดผลงาน (Individual KPI Title)</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-center text-[#212c46]">น้ำหนัก (Weight)</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-center text-[#212c46]">เป้าสัญญา (Target / Actual)</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-[10px] tracking-widest text-center text-[#212c46]">อัตรา (%)</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-[#212c46]">ประเมินสรุป (Status)</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-center text-[#212c46]">จัดการ (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIndKpis.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 font-extrabold uppercase tracking-widest">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle size={28} className="text-slate-300" />
                        <span>ไม่พบข้อมูลเป้าประเมินบุคคล</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredIndKpis.map((kpi, index) => (
                    <tr key={`${kpi.id}-${index}`} className="hover:bg-slate-50/55 transition-colors">
                      {/* Code */}
                      <td className="px-6 py-4 font-extrabold font-mono text-[#4338ca] uppercase tracking-wider">{kpi.kpiCode}</td>
                      
                      {/* Name / Emp Detail */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-[#111f42] flex items-center justify-center font-extrabold border border-slate-200">
                            {kpi.employeeName ? kpi.employeeName.charAt(0) : 'U'}
                          </div>
                          <div>
                            <p className="font-extrabold text-[#111f42] text-sm leading-tight">{kpi.employeeName}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{kpi.department} • {kpi.employeeId}</p>
                          </div>
                        </div>
                      </td>

                      {/* Title & Description */}
                      <td className="px-6 py-4 max-w-sm">
                        <p className="font-extrabold text-[#212c46] text-sm leading-tight">{kpi.name}</p>
                        <p className="text-[11px] text-slate-400 font-semibold line-clamp-1 mt-1">{kpi.description || 'ไม่มีลายลักษณ์ระบุ'}</p>
                        <span className="inline-block bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-black mt-1.5">{kpi.period}</span>
                      </td>

                      {/* Weight */}
                      <td className="px-6 py-4 text-center font-extrabold text-[#212c46]">
                        {kpi.weight}%
                      </td>

                      {/* Target / Actual */}
                      <td className="px-6 py-4 text-center">
                        <div className="text-slate-500 font-semibold">T: <span className="text-[#111f42] font-extrabold">{kpi.targetValue}</span></div>
                        <div className="text-slate-500 font-semibold">A: <span className="text-sky-700 font-extrabold">{kpi.actualValue}</span></div>
                      </td>

                      {/* Progress / Completion Rate */}
                      <td className="px-6 py-4 text-center">
                        <span className={`font-mono font-black font-extrabold ${
                          kpi.progress >= 90 ? 'text-emerald-700' : 'text-slate-600'
                        }`}>
                          {kpi.progress}%
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-full tracking-wider border ${getBadgeColor(kpi.status)}`}>
                          {getStatusThai(kpi.status)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEditIndInit(kpi)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-[#4338ca] transition-colors"
                            title="แก้ไข"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteInd(kpi.id, kpi.kpiCode)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                            title="ลบ"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* MODAL: DRAGGABLE CREATE / EDIT DEPARTMENT KPI */}
      <DraggableModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title={isEditing ? "แก้ไขแก้ไขฝ่ายดัชนีชี้วัด (Edit Department KPI)" : "เพิ่มหัวข้อ KPI ฝ่ายงานใหม่ (New Department KPI)"}
        width="max-w-lg"
      >
        <form onSubmit={handleSaveDept} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-[#111f42] uppercase tracking-wider mb-2">
                รหัสหัวข้อดัชนีชี้วัด (KPI Code) *
              </label>
              <input
                type="text"
                value={deptForm.kpiCode}
                onChange={(e) => setDeptForm(p => ({ ...p, kpiCode: e.target.value }))}
                placeholder="เช่น KPI-MGT-001"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all"
              />
            </div>
            
            {/* Period */}
            <div>
              <label className="block text-[10px] font-black text-[#111f42] uppercase tracking-wider mb-2">
                ช่วงเวลาสัมมนาสำเร็จ (Period) *
              </label>
              <select
                value={deptForm.period}
                onChange={(e) => setDeptForm(p => ({ ...p, period: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              >
                <option value="2026-Q1">2026-Q1</option>
                <option value="2026-Q2">2026-Q2</option>
                <option value="2026-Q3">2026-Q3</option>
                <option value="2026-Q4">2026-Q4</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#111f42] uppercase tracking-wider mb-2">
              ชื่อรายละเอียดเป้าหมาย (KPI Title) *
            </label>
            <input
              type="text"
              value={deptForm.name}
              onChange={(e) => setDeptForm(p => ({ ...p, name: e.target.value }))}
              placeholder="เป้าระบุเป็นลายลักษณ์ที่วัดได้ชัดเจน"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-[#111f42] uppercase tracking-wider mb-2">
                ฝ่ายงานรับผิดชอบ (Department) *
              </label>
              <select
                value={deptForm.department}
                onChange={(e) => setDeptForm(p => ({ ...p, department: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-sky-500 outline-none"
              >
                {departmentsList.filter(d => d !== 'All').map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#111f42] uppercase tracking-wider mb-2">
                ค่าน้ำหนักหัวข้อ (KPI Weight %) *
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={deptForm.weight}
                onChange={(e) => setDeptForm(p => ({ ...p, weight: Number(e.target.value) }))}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-[#111f42] uppercase tracking-wider mb-2">
                เป้าหมายข้อตกลง (Target Value)
              </label>
              <input
                type="text"
                placeholder="เช่น 95% หรือ 10 วัน"
                value={deptForm.targetValue}
                onChange={(e) => setDeptForm(p => ({ ...p, targetValue: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-[#111f42] uppercase tracking-wider mb-2">
                ผลที่ได้จริง (Actual Value)
              </label>
              <input
                type="text"
                placeholder="เช่น 98% หรือ 8 วัน"
                value={deptForm.actualValue}
                onChange={(e) => setDeptForm(p => ({ ...p, actualValue: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-[#111f42] uppercase tracking-wider mb-2">
                ความสอดคล้องสถานะ (Status) *
              </label>
              <select
                value={deptForm.status}
                onChange={(e) => setDeptForm(p => ({ ...p, status: e.target.value as any }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="On Track">On Track (ในทิศทางเป้าหมาย)</option>
                <option value="Exceeded">Exceeded (เกินเพดานเป้าหมาย)</option>
                <option value="Behind">Behind (ล่าช้าแผนงาน)</option>
                <option value="Critical">Critical (วิกฤตความเสี่ยงสูง)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#111f42] uppercase tracking-wider mb-2">
                อัตราผลคำนวณความคืบหน้า (Progress %)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={deptForm.progress}
                onChange={(e) => setDeptForm(p => ({ ...p, progress: Number(e.target.value) }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#111f42] uppercase tracking-wider mb-2">
              คำอธิบาย/ลายลักษณ์วัตถุประสงค์ (Description)
            </label>
            <textarea
              rows={3}
              value={deptForm.description}
              onChange={(e) => setDeptForm(p => ({ ...p, description: e.target.value }))}
              placeholder="ระบุข้อกำหนดนิยาม สัดส่วนคำนวณที่ใช้..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDeptModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#475569] font-black uppercase text-xs tracking-wider rounded-xl transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-xs tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isLoading ? "จัดเก็บลงชีต..." : "บันทึกคีย์บอร์ด"}
            </button>
          </div>

        </form>
      </DraggableModal>

      {/* MODAL: DRAGGABLE CREATE / EDIT INDIVIDUAL KPI */}
      <DraggableModal
        isOpen={isIndModalOpen}
        onClose={() => setIsIndModalOpen(false)}
        title={isEditing ? "แก้ไขรายบุคคลดัชนีชี้วัด (Edit Individual KPI)" : "กำหนดหัวข้อประเมินบุคคลใหม่ (New Individual KPI)"}
        width="max-w-lg"
      >
        <form onSubmit={handleSaveInd} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-[#111f42] uppercase tracking-wider mb-2">
                รหัสดัชนีชี้วัดส่วนบุคคล (KPI Code) *
              </label>
              <input
                type="text"
                value={indForm.kpiCode}
                onChange={(e) => setIndForm(p => ({ ...p, kpiCode: e.target.value }))}
                placeholder="เช่น KPI-IND-010"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#111f42] uppercase tracking-wider mb-2">
                ช่วงประเมิน (Period) *
              </label>
              <select
                value={indForm.period}
                onChange={(e) => setIndForm(p => ({ ...p, period: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              >
                <option value="2026-Q1">2026-Q1</option>
                <option value="2026-Q2">2026-Q2</option>
                <option value="2026-Q3">2026-Q3</option>
                <option value="2026-Q4">2026-Q4</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#111f42] uppercase tracking-wider mb-2">
              ผู้รับการประเมิน (Link Employee Directory) *
            </label>
            <select
              value={indForm.employeeName}
              onChange={(e) => {
                const nameSelected = e.target.value;
                const matchObj = employees.find(x => x.name === nameSelected);
                setIndForm(p => ({
                  ...p,
                  employeeName: nameSelected,
                  employeeId: matchObj ? matchObj.employeeId : '',
                  department: matchObj ? matchObj.department : 'Human Resources'
                }));
              }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
            >
              <option value="">เลือกพนักงานจากสารบบ...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.name}>
                  {emp.name} ({emp.department} • {emp.position})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#111f42] uppercase tracking-wider mb-2">
              ชื่อวัตถุประสงค์งานวัดผล (KPI Target Title) *
            </label>
            <input
              type="text"
              value={indForm.name}
              onChange={(e) => setIndForm(p => ({ ...p, name: e.target.value }))}
              placeholder="ระบุชื่อเป้าข้อตกลง ตัวอย่าง ประสิทธิภาพคีย์ความเร็ว"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-[#111f42] uppercase tracking-wider mb-2">
                ค่าน้ำหนักหัวข้อ (Weight %) *
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={indForm.weight}
                onChange={(e) => setIndForm(p => ({ ...p, weight: Number(e.target.value) }))}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#111f42] uppercase tracking-wider mb-2">
                ระดับการเข้าถึงความคืบหน้า (Progress %)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={indForm.progress}
                onChange={(e) => setIndForm(p => ({ ...p, progress: Number(e.target.value) }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-[#111f42] uppercase tracking-wider mb-2">
                เป้ากำหนด (Target Value)
              </label>
              <input
                type="text"
                placeholder="เช่น 100% หรือ 2 แผนงาน"
                value={indForm.targetValue}
                onChange={(e) => setIndForm(p => ({ ...p, targetValue: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#111f42] uppercase tracking-wider mb-2">
                ผลผลิตที่วัดจริงได้ (Actual Value)
              </label>
              <input
                type="text"
                placeholder="เช่น 95% หรือ 3 แผนงาน"
                value={indForm.actualValue}
                onChange={(e) => setIndForm(p => ({ ...p, actualValue: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#111f42] uppercase tracking-wider mb-2">
              สรุปเกณฑ์ความบรรลุ (Evaluation Status) *
            </label>
            <select
              value={indForm.status}
              onChange={(e) => setIndForm(p => ({ ...p, status: e.target.value as any }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
            >
              <option value="Pending">Pending (ระหว่างรอบคอยสรุป)</option>
              <option value="Met">Met (บรรลุผ่านเป้าหมาย)</option>
              <option value="Not Met">Not Met (หลุดเป้าหมายมาตรฐาน)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#111f42] uppercase tracking-wider mb-2">
              หมายเหตุระบุลายลักษณ์ (Notes / Description)
            </label>
            <textarea
              rows={3}
              value={indForm.description}
              onChange={(e) => setIndForm(p => ({ ...p, description: e.target.value }))}
              placeholder="ระบุกฎเกณฑ์ชี้ชัดสำหรับพนักงาน..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsIndModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#475569] font-black uppercase text-xs tracking-wider rounded-xl transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-xs tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isLoading ? "จัดเก็บลงชีต..." : "ยืนยันการตั้งเป้า"}
            </button>
          </div>

        </form>
      </DraggableModal>

      {/* MODAL: EXCEL/CSV BULK IMPORT SYSTEM */}
      <DraggableModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title={activeTab === 'department' ? "นำเข้าข้อมูล KPI ฝ่ายงานจำนวนมาก" : "นำเข้าข้อมูล KPI รายบุคคลผ่านไฟล์"}
        width="max-w-xl"
      >
        <div className="p-6">
          <CsvUpload
            onUpload={handleBulkImport}
            requiredHeaders={
              activeTab === 'department' 
                ? ['kpiCode', 'name', 'department', 'weight', 'targetValue', 'actualValue', 'progress', 'period', 'status']
                : ['kpiCode', 'employeeName', 'department', 'name', 'weight', 'targetValue', 'actualValue', 'progress', 'period', 'status']
            }
            instructions={[
              "อัพโหลดไฟล์สกุล .xlsx หรือ .csv เท่านั้น",
              "ชื่อหัวคอลัมน์แถวแรกสุด (Headers) จะต้องสะกดตรงกับรูปแบบคั่นด้วยเครื่องหมายจุลภาค",
              "ระบบฐานข้อมูลเชื่อมโยง Google Sheets จะอัปเดตสเกลอัตโนมัติเมื่อตรวจสอบพบหัวคอลัมน์ใหม่"
            ]}
          />
        </div>
      </DraggableModal>

      </div>
    </div>
  );
}
