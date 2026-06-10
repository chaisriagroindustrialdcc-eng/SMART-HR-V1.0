import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DraggableModal } from '../../components/shared/DraggableModal';
import { useLanguage } from '../../context/LanguageContext';
import { getStatusPrintClass, PRINT_STATUS_STYLES } from '../../utils/printUtils';

// --- Modular Sub-Components Imports ---
import OjtTrendChart from './components/OjtTrendChart';
import OjtSkillHeatmap from './components/OjtSkillHeatmap';
import SkillRecommender from './components/SkillRecommender';
import TraineeSkillTimeline from './components/TraineeSkillTimeline';
import RecertificationAlerts from './components/RecertificationAlerts';
import { useAuth } from '../../context/AuthContext';
import { addSystemLog } from '../../services/logger';
import { printService, PRINT_TABLE_STYLES } from '../../services/printService';

// --- Theme Configuration (Synced with Home & Permissions Theme) ---
const THEME = {
  bgMain: '#f3f3f1',
  primary: '#212c46',
  primaryLight: '#4d87a8',
  accent: '#a94228',
  gold: '#b58c4f',
  brightGold: '#b7a159',
  success: '#657f4d',
  danger: '#932c2e',
  skyBlue: '#3f809e',
  dustyBlue: '#7a8b95'
};

interface SkillItem {
  name: string;
  mastered: boolean;
  category?: 'Technical' | 'Compliance' | 'Soft Skills';
  acquiredDate?: string;
  expirationDate?: string;
  status?: 'Active' | 'Expired' | 'Needs Recertification';
}

interface Learner {
  id: string;
  employeeName: string;
  employeeId: string;
  dept: string;
  role: string;
  trainerName: string;
  trainerDept: string;
  hoursCompleted: number;
  totalHours: number;
  status: 'Pending' | 'Active' | 'Completed';
  lastMeetingDate: string;
  gradeScore?: number; // scale of 10
  skills?: SkillItem[];
}

interface CoachingLog {
  id: string;
  learnerId: string;
  learnerName: string;
  subject: string;
  trainerName: string;
  date: string;
  durationMinutes: number;
  rating: number; // scale of 5.0
  notes: string;
}

const INITIAL_LEARNERS: Learner[] = [
  { 
    id: 'OJT-001', 
    employeeName: 'ธนา พงษ์สิทธิ์ (Thana)', 
    employeeId: 'EMP-2026-032', 
    dept: 'Property Management', 
    role: 'Operations Assistant', 
    trainerName: 'คุณสุรชัย วชิระประภา', 
    trainerDept: 'Operations Mgr', 
    hoursCompleted: 45, 
    totalHours: 60, 
    status: 'Active', 
    lastMeetingDate: '2026-06-05', 
    gradeScore: 8.5,
    skills: [
      { name: 'Introduction to Central ERP Platform', mastered: true },
      { name: 'On-Site Facility Standard Audits', mastered: true },
      { name: 'Procurement Request Workflows', mastered: true },
      { name: 'Tenancy Regulatory Code Check', mastered: true },
      { name: 'Operations Incident Dispatching', mastered: false }
    ]
  },
  { 
    id: 'OJT-002', 
    employeeName: 'ปิยาภรณ์ จิตตระการ (Piyaporn)', 
    employeeId: 'EMP-2026-041', 
    dept: 'Marketing Dept', 
    role: 'Social Media Officer', 
    trainerName: 'คุณอุบลรัตน์ พลพาณิชย์', 
    trainerDept: 'Design Lead', 
    hoursCompleted: 60, 
    totalHours: 60, 
    status: 'Completed', 
    lastMeetingDate: '2026-06-01', 
    gradeScore: 9.6,
    skills: [
      { name: 'Brand Voice Sync Guidelines', mastered: true },
      { name: 'Lead Conversion Retargeting', mastered: true },
      { name: 'Social Editorial Orchestration', mastered: true },
      { name: 'Dynamic Banner Creation Standard', mastered: true },
      { name: 'Performance Analytics Auditing', mastered: true }
    ]
  },
  { 
    id: 'OJT-003', 
    employeeName: 'สันติ นเรศวรรณ (Santi)', 
    employeeId: 'EMP-2026-045', 
    dept: 'Finance & Accounts', 
    role: 'Junior Accountant', 
    trainerName: 'คุณประพันธ์ กิจโกศล', 
    trainerDept: 'CFO Office', 
    hoursCompleted: 15, 
    totalHours: 60, 
    status: 'Active', 
    lastMeetingDate: '2026-06-08', 
    gradeScore: 7.2,
    skills: [
      { name: 'General Ledger Balancing Controls', mastered: true },
      { name: 'Corporate Tax Invoice Filings', mastered: true },
      { name: 'Automated Bank Reconciliations', mastered: false },
      { name: 'Direct Cost Allocations Matrix', mastered: false },
      { name: 'Corporate Audit Safeguards', mastered: false }
    ]
  },
  { 
    id: 'OJT-004', 
    employeeName: 'ลลิตา รวงทอง (Lalita)', 
    employeeId: 'EMP-2026-050', 
    dept: 'Legal & Procurement', 
    role: 'Compliance Officer', 
    trainerName: 'คุณสรวิชญ์ พัฒนวร', 
    trainerDept: 'Legal VP', 
    hoursCompleted: 0, 
    totalHours: 60, 
    status: 'Pending', 
    lastMeetingDate: 'N/A', 
    gradeScore: 0,
    skills: [
      { name: 'Contract Taxonomy Frameworks', mastered: false },
      { name: 'Vendor Compliance Screening', mastered: false },
      { name: 'Data Privacy Impact Assessments', mastered: false },
      { name: 'Standard NDA Execution Check', mastered: false },
      { name: 'Arbitration Case Briefing Rules', mastered: false }
    ]
  }
];

const INITIAL_LOGS: CoachingLog[] = [
  { id: 'LOG-301', learnerId: 'OJT-001', learnerName: 'ธนา พงษ์สิทธิ์ (Thana)', subject: 'อบรมระบบพอร์ทัลบริหารพัสดุและจัดซื้อกลาง (Property Central ERP)', trainerName: 'คุณสุรชัย วชิระประภา', date: '2026-06-02', durationMinutes: 180, rating: 4.5, notes: 'เรียนรู้ระบบและการเปิดใบขอเสนอจัดซื้อวัสดุหน้างานได้ดี มีทัศนคติเรียนรู้เร็วมาก' },
  { id: 'LOG-302', learnerId: 'OJT-001', learnerName: 'ธนา พงษ์สิทธิ์ (Thana)', subject: 'เรียนรู้สัญญาเช่าข้อบังคับพนักงานกลุ่มเป้าหมาย (Operations Code)', trainerName: 'คุณสุรชัย วชิระประภา', date: '2026-06-05', durationMinutes: 120, rating: 4.0, notes: 'มีความแม่นยำในการระบุข้อกำหนดสิทธิค้ำประกันและอัตราค่าปรับอาคาร' },
  { id: 'LOG-303', learnerId: 'OJT-002', learnerName: 'ปิยาภรณ์ จิตตระการ (Piyaporn)', subject: 'วางกลยุทธ์แคมเปญอสังหาฯ และสร้างวิจารณ์คอนสตรัคชั่นเสร็จสิ้น', trainerName: 'คุณอุบลรัตน์ พลพาณิชย์', date: '2026-06-01', durationMinutes: 240, rating: 5.0, notes: 'สอบประเมินภาคปฏิบัติดีเลิศ นำเสนอบทเรียนได้ครบถ้วน แนะนำพ้นโปรได้ทันที' }
];

const LocalKpiCard = ({ icon, value, label, colorAccent, colorValue, desc }: any) => {
  const IconComponent = Icons[icon as keyof typeof Icons] || Icons.Circle;
  return (
    <div className="bg-white px-6 py-5 rounded-2xl border border-[#eaeaec] shadow-sm flex-1 min-w-[200px] relative overflow-hidden group hover:border-[#b7a159] transition-all min-h-[110px] flex flex-col justify-between animate-fadeIn font-sans">
      <div className="absolute -right-4 -bottom-6 opacity-[0.05] transform group-hover:scale-110 transition-transform duration-700 pointer-events-none">
        <IconComponent size={100} style={{ color: colorAccent }} />
      </div>
      <div className="relative z-10 flex justify-between items-start w-full">
        <p className="text-[10px] font-black text-[#7a8b95] uppercase tracking-[0.1em] drop-shadow-sm">{label}</p>
        <div className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:rotate-6" style={{backgroundColor: `${colorAccent}15`, borderColor: `${colorAccent}25`, color: colorAccent}}>
          <IconComponent size={16} strokeWidth={2.5} />
        </div>
      </div>
      <div className="relative z-10 mt-2 flex items-baseline justify-between">
        <p className="text-[24px] font-black leading-none text-[#212c46]" style={{color: colorValue}}>
          {value}
        </p>
        {desc && (
          <span className="text-[10px] font-bold text-[#4d87a8] uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span> {desc}
          </span>
        )}
      </div>
    </div>
  );
};

export default function OjtTraining() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [learners, setLearners] = useState<Learner[]>([]);
  const [coachingLogs, setCoachingLogs] = useState<CoachingLog[]>([]);
  const [activeTab, setActiveTab] = useState<'learners' | 'logs'>('learners');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Drill-down Timeline and Recertification States
  const [selectedTimelineLearner, setSelectedTimelineLearner] = useState<Learner | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [recertifyPreselectedSkill, setRecertifyPreselectedSkill] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals
  const [learnerModal, setLearnerModal] = useState<{ isOpen: boolean; record: Learner | null }>({ isOpen: false, record: null });
  const [logModal, setLogModal] = useState<{ isOpen: boolean; record: CoachingLog | null }>({ isOpen: false, record: null });
  const [isSubmitRecordOpen, setIsSubmitRecordOpen] = useState(false);

  // Registry Settings Policy States
  const [requiredHours, setRequiredHours] = useState(() => localStorage.getItem('local_ojt_required_hours') || '60 Hrs');
  const [targetScore, setTargetScore] = useState(() => localStorage.getItem('local_ojt_target_score') || '8.0 / 10.0');
  const [trainerMandatory, setTrainerMandatory] = useState(() => localStorage.getItem('local_ojt_trainer_mandatory') || 'True (Admin Sign)');
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  // Initialization
  useEffect(() => {
    const savedLearners = localStorage.getItem('local_ojt_learners');
    const savedLogs = localStorage.getItem('local_ojt_logs');

    if (savedLearners) {
      try { setLearners(JSON.parse(savedLearners)); } catch (e) { setLearners(INITIAL_LEARNERS); }
    } else {
      setLearners(INITIAL_LEARNERS);
      localStorage.setItem('local_ojt_learners', JSON.stringify(INITIAL_LEARNERS));
    }

    if (savedLogs) {
      try { setCoachingLogs(JSON.parse(savedLogs)); } catch (e) { setCoachingLogs(INITIAL_LOGS); }
    } else {
      setCoachingLogs(INITIAL_LOGS);
      localStorage.setItem('local_ojt_logs', JSON.stringify(INITIAL_LOGS));
    }
  }, []);

  // Save triggers
  const saveLearners = (updated: Learner[]) => {
    setLearners(updated);
    localStorage.setItem('local_ojt_learners', JSON.stringify(updated));
  };

  const saveLogs = (updated: CoachingLog[]) => {
    setCoachingLogs(updated);
    localStorage.setItem('local_ojt_logs', JSON.stringify(updated));
  };

  const handleSavePolicy = (data: { requiredHours: string; targetScore: string; trainerMandatory: string }) => {
    setRequiredHours(data.requiredHours);
    setTargetScore(data.targetScore);
    setTrainerMandatory(data.trainerMandatory);
    localStorage.setItem('local_ojt_required_hours', data.requiredHours);
    localStorage.setItem('local_ojt_target_score', data.targetScore);
    localStorage.setItem('local_ojt_trainer_mandatory', data.trainerMandatory);
  };

  // KPI Computations
  const stats = useMemo(() => {
    const total = learners.length;
    const active = learners.filter(l => l.status === 'Active').length;
    const completed = learners.filter(l => l.status === 'Completed').length;
    const totalHours = learners.reduce((acc, curr) => acc + curr.hoursCompleted, 0);
    const avgScore = learners.filter(l => l.gradeScore && l.gradeScore > 0);
    const average = avgScore.length > 0 ? (avgScore.reduce((acc, curr) => acc + (curr.gradeScore ?? 0), 0) / avgScore.length).toFixed(1) : '0';

    return { total, active, completed, totalHours, average };
  }, [learners]);

  // Filters logic
  const filteredLearners = useMemo(() => {
    return learners.filter(l => {
      const matchSearch = l.employeeName.toLowerCase().includes(search.toLowerCase()) || 
                          l.employeeId.toLowerCase().includes(search.toLowerCase()) ||
                          l.trainerName.toLowerCase().includes(search.toLowerCase());
      const matchDept = filterDept === 'all' || l.dept === filterDept;
      const matchStatus = filterStatus === 'all' || l.status === filterStatus;
      return matchSearch && matchDept && matchStatus;
    });
  }, [learners, search, filterDept, filterStatus]);

  const filteredLogs = useMemo(() => {
    return coachingLogs.filter(log => {
      const matchSearch = log.learnerName.toLowerCase().includes(search.toLowerCase()) || 
                          log.subject.toLowerCase().includes(search.toLowerCase()) ||
                          log.trainerName.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [coachingLogs, search]);

  const departments = useMemo(() => {
    return Array.from(new Set(learners.map(l => l.dept)));
  }, [learners]);

  // Handlers for Learners
  const openLearnerEdit = (record: Learner | null = null) => {
    setLearnerModal({ isOpen: true, record });
  };

  const handleSaveLearner = (data: Learner) => {
    if (learnerModal.record) {
      const updated = learners.map(item => item.id === data.id ? data : item);
      saveLearners(updated);
    } else {
      const newElem = { ...data, id: 'OJT-' + Date.now().toString().slice(-3) };
      saveLearners([...learners, newElem]);
    }
    setLearnerModal({ isOpen: false, record: null });
  };

  const handleDeleteLearner = (id: string) => {
    if (confirm('ยืนยันระบบจัดการต้องการยกเลิกประวัติเทรนนิ่งข้อตกลง OJT นี้?')) {
      const filtered = learners.filter(item => item.id !== id);
      saveLearners(filtered);
    }
  };

  // Handlers for Logs
  const openLogEdit = (record: CoachingLog | null = null) => {
    setLogModal({ isOpen: true, record });
  };

  const handleSaveLog = (data: CoachingLog) => {
    if (logModal.record) {
      const updated = coachingLogs.map(item => item.id === data.id ? data : item);
      saveLogs(updated);
    } else {
      const newElem = { ...data, id: 'LOG-' + Date.now().toString().slice(-3) };
      saveLogs([...coachingLogs, newElem]);

      // side effect: auto add hours completed to learner if matching
      const targetLearner = learners.find(l => l.id === data.learnerId);
      if (targetLearner) {
        const addedHours = Math.round(data.durationMinutes / 60);
        const updatedHours = Math.min(targetLearner.hoursCompleted + addedHours, targetLearner.totalHours);
        const updatedStatus = updatedHours === targetLearner.totalHours ? 'Completed' : 'Active';
        const updatedLearners = learners.map(l => l.id === data.learnerId ? {
          ...l,
          hoursCompleted: updatedHours,
          status: updatedStatus as any,
          lastMeetingDate: data.date
        } : l);
        saveLearners(updatedLearners);
      }
    }
    setLogModal({ isOpen: false, record: null });
  };

  const handleDeleteLog = (id: string) => {
    if (confirm('ต้องการลบบันทึกประชามตินี้ออกใช่หรือไม่?')) {
      const filtered = coachingLogs.filter(item => item.id !== id);
      saveLogs(filtered);
    }
  };

  const handlePrintOjtReport = () => {
    // Role-based authorization check
    const userRole = user?.role || 'Guest';
    const isAuthorized = ['admin', 'manager', 'supervisor', 'vp', 'legal vp', 'cfo office', 'operations mgr'].includes(userRole.toLowerCase()) || user?.permissions?.canApprove || user?.permissions?.canVerify;
    
    if (!isAuthorized) {
      // Log Print Authorization Denied to SystemLogs
      addSystemLog(
        'OJT Training',
        'PRINT_FAIL',
        'Warning',
        `Print Authorization Denied: User "${user?.name || 'Guest'}" (${userRole}) attempted compiling/printing general OJT Trainee Progress report but lacked verification clearance.`,
        user?.name || 'Guest',
        user?.role || 'Guest'
      );
      alert('Access Denied: You do not have permissions to compile and print OJT reports. This incident has been logged.');
      return;
    }

    // Proceed in compiling & printing General OJT matrix
    const fields = [
      { label: 'Learner ID', key: 'id' },
      { label: 'Apprentice Name', key: 'employeeName' },
      { label: 'Assigned Coach', key: 'trainerName' },
      { label: 'OJT Hours completed', key: 'hoursCompleted' },
      { label: 'Status', key: 'status', type: 'status' as const }
    ];
    
    printService.printTable(
      'OJT Trainee Progress Report',
      fields,
      filteredLearners,
      { printedBy: user?.name || 'Authorized Supervisor', role: user?.role || 'Staff' }
    );
  };

  const handlePrintIndividualReport = (learner: Learner) => {
    // Role-based authorization check
    const userRole = user?.role || 'Guest';
    const isAuthorized = ['admin', 'manager', 'supervisor', 'vp', 'legal vp', 'cfo office', 'operations mgr'].includes(userRole.toLowerCase()) || user?.permissions?.canApprove || user?.permissions?.canVerify;
    
    if (!isAuthorized) {
      addSystemLog(
        'OJT Training',
        'PRINT_FAIL',
        'Warning',
        `Print Authorization Denied: User "${user?.name || 'Guest'}" (${userRole}) attempted exporting individual skill matrix booklet for apprentice "${learner.employeeName}" but lacked clearance.`,
        user?.name || 'Guest',
        user?.role || 'Guest'
      );
      alert('Access Denied: You do not have permissions to print this OJT Employee skill matrix. This incident has been logged.');
      return;
    }

    // Build individualized HTML report and trigger window.print
    const skillsList = learner.skills || [];
    const logsList = coachingLogs.filter(log => log.learnerId === learner.id);
    
    const formattedSkillsRows = skillsList.map((s, idx) => {
      const category = s.category || 'General';
      const status = s.mastered ? 'Mastered (Vetted)' : 'In Training';
      return `
        <tr>
          <td>${idx + 1}</td>
          <td style="font-weight: bold;">${s.name}</td>
          <td style="text-transform: uppercase; font-weight: bold; color: #4b5563;">${category}</td>
          <td><span class="print-badge ${s.mastered ? 'print-badge-completed' : 'print-badge-pending'}">${status}</span></td>
          <td style="font-family: monospace;">${s.acquiredDate || 'In Progress'}</td>
        </tr>
      `;
    }).join('');

    const formattedLogsRows = logsList.map((log) => `
      <tr>
        <td style="font-family: monospace; font-weight: bold;">${log.date}</td>
        <td style="font-weight: bold; color: #212c46;">${log.subject}</td>
        <td>${log.trainerName}</td>
        <td style="font-family: monospace;">${log.durationMinutes} mins</td>
        <td style="color: #4b5563; font-style: italic;">"${log.notes}"</td>
      </tr>
    `).join('');

    const docHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Skill Matrix & OJT Timeline Dossier - ${learner.employeeName}</title>
          <meta charset="utf-8">
          <style>
            ${PRINT_TABLE_STYLES}
            h2 {
              font-size: 11px;
              color: #212c46;
              border-left: 3px solid #b58c4f;
              padding-left: 8px;
              margin: 24px 0 12px 0;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-weight: 900;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="print-header">
              <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200" alt="Company Icon">
              <div class="print-header-text">
                <h1>Apprentice Skill Matrix Dossier</h1>
                <p>บริษัท ที ออลล์ อินเทลลิเจนซ์ จำกัด / 46 หมู่ที่ 5 ตำบลคลองสี่ อำเภอคลองหลวง จังหวัดปทุมธานี 12120</p>
              </div>
            </div>

            <div class="print-meta-grid">
              <div class="print-meta-item">
                <h5>Trainee Name</h5>
                <p>${learner.employeeName}</p>
                <p style="font-size: 9px; font-weight: normal; color: #7a8b95; margin-top: 2px;">
                  ID: ${learner.employeeId} &bull; ${learner.dept}
                </p>
              </div>
              <div class="print-meta-item">
                <h5>Assigned Coach</h5>
                <p>${learner.trainerName}</p>
                <p style="font-size: 9px; font-weight: normal; color: #7a8b95; margin-top: 2px;">
                  Role: ${learner.trainerDept}
                </p>
              </div>
              <div class="print-meta-item">
                <h5>Hours Progress & Status</h5>
                <p>${learner.hoursCompleted} / ${learner.totalHours} Hours</p>
                <p style="font-size: 9px; font-weight: bold; color: #b58c4f; margin-top: 2px; text-transform: uppercase;">
                  OJT STATUS: ${learner.status}
                </p>
              </div>
            </div>

            <h2>I. Competency Skill Matrix Checklist</h2>
            <table class="print-layout-table">
              <thead>
                <tr>
                  <th style="width: 8%;">No.</th>
                  <th style="width: 40%;">Assessed Skill/Competency Description</th>
                  <th style="width: 20%;">Category</th>
                  <th style="width: 17%;">Status</th>
                  <th style="width: 15%;">Training Date</th>
                </tr>
              </thead>
              <tbody>
                ${formattedSkillsRows || '<tr><td colspan="5" style="text-align: center; color: #9ca3af;">No skill items assigned to this apprentice</td></tr>'}
              </tbody>
            </table>

            <h2>II. Mentored Coaching Activity Logs</h2>
            <table class="print-layout-table">
              <thead>
                <tr>
                  <th style="width: 15%;">Date</th>
                  <th style="width: 25%;">Subject Curriculum</th>
                  <th style="width: 20%;">Trainer / Buddy</th>
                  <th style="width: 12%;">Duration</th>
                  <th style="width: 28%;">Trainer Assessor Notes & Feedback</th>
                </tr>
              </thead>
              <tbody>
                ${formattedLogsRows || '<tr><td colspan="5" style="text-align: center; color: #9ca3af;">No coaching activity logs recorded for this apprentice</td></tr>'}
              </tbody>
            </table>

            <div class="print-footer-signature" style="margin-top: 40px;">
              <div class="signature-box">
                <div class="signature-line"></div>
                <p>Trainee Signature</p>
                <p style="font-weight: bold; margin-top: 4px;">${learner.employeeName}</p>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <p>Division Supervisor Signature</p>
                <p style="font-weight: bold; margin-top: 4px;">${learner.trainerName}</p>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 600);
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker is preventing document export. Please allow popups.');
      return;
    }
    
    printWindow.document.write(docHtml);
    printWindow.document.close();

    // Log the successful print action
    addSystemLog(
      'OJT Training',
      'PRINT_JOB',
      'Success',
      `Printed individual skill matrix & OJT dossier for trainee "${learner.employeeName}"`,
      user?.name || 'Guest',
      user?.role || 'Guest'
    );
  };

  const handleTriggerRecertify = (learner: Learner, skillName: string) => {
    setRecertifyPreselectedSkill(skillName);
    // Find matching learner first
    const matched = learners.find(l => l.id === learner.id);
    if (matched) {
      setIsSubmitRecordOpen(true);
    }
  };

  return (
    <div className="flex flex-1 w-full flex-col animate-fadeIn bg-transparent space-y-4 px-4 sm:px-8 pb-12">
      
      {/* USER GUIDE FLOATING DRAWER TRIGGER */}
      {typeof document !== 'undefined' && createPortal(
        <button 
          onClick={() => setIsGuideOpen(true)} 
          className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#b58c4f] hover:text-white hover:border-[#b58c4f] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group cursor-pointer animate-fadeIn" 
          style={{ top: '150px' }}
        >
          <Icons.HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
          <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[11px]">
            {language === 'TH' ? 'คู่มือ OJT GUIDE' : 'OJT GUIDE'}
          </span>
        </button>,
        document.body
      )}

      {/* 2. Page Header - No Background Canvas design strictly following permissions layout */}
      <div className="h-14 flex flex-row items-center justify-between gap-4 z-20 shrink-0 mt-2">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center group cursor-default shrink-0">
            <div className="absolute inset-0 bg-[#b58c4f] blur-[15px] opacity-20 rounded-full group-hover:opacity-60 transition-all duration-700"></div>
            <div className="relative z-10 p-1.5 border border-[#b58c4f]/40 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
              <Icons.BookOpenCheck size={28} strokeWidth={2.5} className="text-[#b58c4f]" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none" style={{ fontSize: '24px' }}>
              OJT <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b58c4f] to-[#709654]">TRAINING</span> MODULE
            </h3>
            <p className="text-[11px] font-bold text-[#4d5a44] uppercase tracking-[0.2em] mt-0.5 opacity-80 leading-none">
              On-The-Job Professional Apprenticeship & Coaching Registry
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
          <div className="bg-white/50 p-1.5 rounded-xl border border-white/60 shadow-inner flex items-center gap-1">
            <button 
              onClick={() => setActiveTab('learners')} 
              className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'learners' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#b58c4f]'}`}
            >
              <Icons.Award size={13} /> Learners Matrix
            </button>
            <button 
              onClick={() => setActiveTab('logs')} 
              className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'logs' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#b58c4f]'}`}
            >
              <Icons.ClipboardList size={13} /> Coaching Logs
            </button>
          </div>

          <button 
            onClick={handlePrintOjtReport}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-[#212c46] rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm"
            title="Generate custom printed PDF report with unified header and footer"
          >
            <Icons.Printer size={13} className="text-[#b58c4f]" />
            Print OJT Report
          </button>

          <button 
            onClick={() => setIsSubmitRecordOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#657f4d] hover:bg-[#709654] text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-md"
            title="Submit training record with skills assessment"
          >
            <Icons.CheckSquare size={13} />
            Submit Record
          </button>

          <button 
            onClick={() => {
              if (activeTab === 'learners') openLearnerEdit();
              else openLogEdit();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#212c46] text-white hover:bg-[#b58c4f] rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-md"
          >
            <Icons.Plus size={13} className="text-[#657f4d]" strokeWidth={3}/> 
            {activeTab === 'learners' ? 'Add Learner' : 'Record Activity'}
          </button>
        </div>
      </div>

      {/* Recertification Alerts and Compliance Expiration Monitoring system */}
      <RecertificationAlerts 
        learners={learners} 
        onTriggerRecertify={handleTriggerRecertify} 
      />

      {/* 3. Standard KPI Dashboard Container matching Permissions Exactly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2 mb-3">
        <LocalKpiCard 
          icon="Users" 
          value={stats.total} 
          label="Total OJT Learners" 
          colorAccent={THEME.skyBlue} 
          colorValue="#212c46"
          desc="พนักงานลงทะเบียน OJT" 
        />
        <LocalKpiCard 
          icon="TrendingUp" 
          value={stats.active} 
          label="Active Coaching" 
          colorAccent={THEME.gold} 
          colorValue="#212c46"
          desc="อยู่ระหว่างเรียนรู้คู่หน้างาน" 
        />
        <LocalKpiCard 
          icon="CheckCircle" 
          value={stats.completed} 
          label="Graduated Learners" 
          colorAccent={THEME.success} 
          colorValue="#212c46"
          desc="สำเร็จผ่านประเมินมาตรฐาน" 
        />
        <LocalKpiCard 
          icon="Award" 
          value={stats.average} 
          label="Average Evaluation" 
          colorAccent={THEME.accent} 
          colorValue="#212c46"
          desc="คะแนนเฉลี่ยผลทดสอบ / 10.0" 
        />
      </div>

      {/* 5. Main Content Unified Grid Container */}
      <div className="bg-white rounded-2xl border border-[#eaeaec] shadow-sm overflow-hidden mb-8 font-sans">
        
        {/* Table Controls (Search & Filters) */}
        <div className="bg-slate-50/70 border-b border-[#eaeaec] p-4 sm:p-5 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#b58c4f] animate-pulse" />
            <span className="text-[11px] font-black text-[#212c46] uppercase tracking-widest leading-none">
              {activeTab === 'learners' ? 'APPRENTICESHIP REGISTRY' : 'COACHING LOG ENTRIES'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Icons.Search size={13} className="text-gray-400" />
              </span>
              <input 
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={language === 'TH' ? 'ค้นหาชื่อ, รหัส, วิทยากรพี่เลี้ยง...' : 'Search Name, ID, Trainer coach...'}
                className="w-full bg-white border border-[#eaeaec] rounded-xl pl-8.5 pr-3 py-1.5 text-[11px] font-bold text-[#212c46] shadow-xs outline-none focus:border-[#b58c4f]"
              />
            </div>

            {/* Department Filter (Only for Learners Tab) */}
            {activeTab === 'learners' && (
              <>
                <select
                  value={filterDept}
                  onChange={e => setFilterDept(e.target.value)}
                  className="bg-white border border-[#eaeaec] rounded-xl px-3 py-1.5 text-[11px] font-bold text-[#212c46] outline-none"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="bg-white border border-[#eaeaec] rounded-xl px-3 py-1.5 text-[11px] font-bold text-[#212c46] outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* Tab 1: Learners Grid */}
        {activeTab === 'learners' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[850px] text-[12px]">
              <thead className="bg-[#222b38] text-white">
                <tr className="border-b-2 border-[#b58c4f]">
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider w-[12%] font-mono text-left">Learner ID</th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-left w-[22%]">Assigned Apprentice</th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-left w-[22%]">Assigned Coach (PM)</th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-center w-[12%]">OJT Duration</th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-left w-[18%]">Progress Matrix</th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-center w-[14%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[12px] font-medium text-[#212c46]">
                {filteredLearners.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-[#7a8b95] font-bold uppercase tracking-widest text-[11px]">
                      <Icons.Inbox className="mx-auto w-7 h-7 opacity-30 mb-2"/>
                      No OJT Apprentices matched filter
                    </td>
                  </tr>
                ) : (
                  filteredLearners.map((learner) => {
                    const skillsList = learner.skills || [];
                    const skillsCount = skillsList.length || 5;
                    const masteredCount = skillsList.filter(s => s.mastered).length;
                    const computedProgress = skillsCount > 0 ? Math.min(Math.round((masteredCount / skillsCount) * 100), 100) : 0;
                    return (
                      <tr key={learner.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-400 text-[12px] truncate">{learner.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col truncate">
                            <span className="font-bold text-[#212c46] tracking-tight text-[12px]">{learner.employeeName}</span>
                            <span className="text-[11px] font-mono text-[#a94228] font-bold mt-0.5">{learner.dept} &bull; {learner.employeeId}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col truncate">
                            <span className="font-bold text-[#3f809e]/90 text-[12px]">{learner.trainerName}</span>
                            <span className="text-[11px] text-gray-400 font-bold tracking-widest mt-0.5 uppercase">{learner.trainerDept}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold font-mono text-[11.5px]">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200/40 rounded text-slate-600">
                            {learner.hoursCompleted} / {learner.totalHours} Hrs
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1 py-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className={`inline-flex items-center gap-1 px-1 py-0.2 rounded text-[10px] font-black uppercase tracking-wider ${
                                learner.status === 'Completed' ? 'bg-[#657f4d]/8 text-[#657f4d]' : learner.status === 'Active' ? 'bg-[#b58c4f]/8 text-[#b58c4f]' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {learner.status === 'Completed' ? 'Certified' : learner.status === 'Active' ? 'Coaching' : 'Pending'}
                              </span>
                              <span className="font-mono text-slate-700 font-bold">{computedProgress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/30">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  learner.status === 'Completed' ? 'bg-gradient-to-r from-[#657f4d] to-[#709654]' : learner.status === 'Active' ? 'bg-[#3f809e]' : 'bg-slate-300'
                                }`}
                                style={{ width: `${computedProgress}%` }}
                              />
                            </div>
                            <span className="text-[9.5px] font-bold text-gray-400 mt-0.5">
                              {masteredCount} of {skillsCount} Skills Mastered
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => { setSelectedTimelineLearner(learner); setIsTimelineOpen(true); }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#3f809e] hover:text-white hover:bg-[#3f809e] transition-colors cursor-pointer border border-[#3f809e]/30"
                              title="View Skill Timeline History"
                            >
                              <Icons.History size={11} strokeWidth={2.5}/>
                            </button>
                            <button 
                              onClick={() => handlePrintIndividualReport(learner)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#b58c4f] hover:text-white hover:bg-[#b58c4f] transition-colors cursor-pointer border border-[#b58c4f]/30"
                              title="Print Individual OJT Report Booklet"
                            >
                              <Icons.Printer size={11} strokeWidth={2.5}/>
                            </button>
                            <button 
                              onClick={() => openLearnerEdit(learner)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#212c46] transition-colors cursor-pointer border border-slate-200"
                              title="Edit Apprentice Details"
                            >
                              <Icons.Edit3 size={11} strokeWidth={2.5}/>
                            </button>
                            <button 
                              onClick={() => handleDeleteLearner(learner.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-700 transition-colors cursor-pointer border border-slate-200"
                              title="Delete Apprentice Entry"
                            >
                              <Icons.Trash2 size={11} strokeWidth={2.5}/>
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
        )}

        {/* Tab 2: Coaching Logs */}
        {activeTab === 'logs' && (
          <div className="overflow-x-auto animate-fadeIn">
            <table className="w-full text-left border-collapse table-fixed min-w-[850px] text-[12px]">
              <thead className="bg-[#222b38] text-white">
                <tr className="border-b-2 border-[#b58c4f]">
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider w-[12%] font-mono text-left">Log ID</th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-left w-[20%]">Apprentice Name</th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-left w-[36%]">OJT Activities / Curriculum</th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-left w-[14%]">Coached By</th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-center w-[10%]">Hours Logged</th>
                  <th className="py-4 px-4 text-[12px] font-black uppercase tracking-wider text-center w-[8%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[12px] font-medium text-[#212c46]">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-[#7a8b95] font-bold uppercase tracking-widest text-[11px]">
                      <Icons.Inbox className="mx-auto w-7 h-7 opacity-30 mb-2"/>
                      No coaching logs recorded
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-400 text-[12px] truncate">{log.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col truncate">
                          <span className="font-bold text-[#212c46] tracking-tight">{log.learnerName}</span>
                          <span className="text-[10px] font-mono text-[#b58c4f] font-bold mt-0.5">{log.date}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#212c46] text-[12px] leading-snug">{log.subject}</span>
                          {log.notes && <span className="text-[11px] text-gray-400 italic mt-0.5 mt-1 font-bold truncate max-w-[280px]">{log.notes}</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#3f809e]/90">{log.trainerName}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200/40 rounded text-slate-600 font-mono font-bold">
                          {(log.durationMinutes / 60).toFixed(1)} Hrs
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-[1px]">
                          <button 
                            onClick={() => openLogEdit(log)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#212c46] transition-colors cursor-pointer"
                            title="Edit Coaching Log"
                          >
                            <Icons.Edit3 size={11} strokeWidth={2.5}/>
                          </button>
                          <button 
                            onClick={() => handleDeleteLog(log.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-700 transition-colors cursor-pointer"
                            title="Remove Coaching Log"
                          >
                            <Icons.Trash2 size={11} strokeWidth={2.5}/>
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

      {/* Visual Analytics Bento Grid: Mastery Trend Line, Department Heatmap, AI Copilot Recommender & Policy Setup Pairs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pair 1, Col 1: OJT Mastery Progress Trend */}
        <div className="flex flex-col">
          <OjtTrendChart learners={learners} />
        </div>
        {/* Pair 1, Col 2: OJT Policy & Standards Configuration */}
        <div className="bg-[#f8f9fa] rounded-2xl border border-[#eaeaec] p-6 relative overflow-hidden font-sans flex flex-col justify-between h-full shadow-sm">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[12px] font-black text-[#212c46] uppercase tracking-widest flex items-center gap-2">
                <Icons.Sliders size={15} className="text-[#b58c4f]"/> ระบบนโยบายมาตรฐานการประเมิน (OJT Policy & Standards Configuration)
              </h4>
              <button 
                onClick={() => setIsPolicyModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#212c46] hover:bg-[#b58c4f] hover:text-white text-white rounded-lg text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs"
              >
                <Icons.Edit3 size={11} />
                {language === 'TH' ? 'แก้ไขนโยบาย' : 'Edit Policy Rules'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white p-3 rounded-xl border border-[#eaeaec]">
                <span className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">จำนวนชั่วโมง OJT ขั้นต่ำ (Required OJT Hours)</span>
                <div className="flex items-center justify-between font-sans">
                  <span className="text-[16px] font-black text-[#212c46] font-mono">{requiredHours}</span>
                  <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">Department Standard</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#eaeaec]">
                <span className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">เกรดผ่านประเมินเฉลี่ยขั้นต่ำ (Score Passing Grade)</span>
                <div className="flex items-center justify-between font-sans">
                  <span className="text-[16px] font-black text-[#212c46] font-mono">{targetScore}</span>
                  <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">Certified Cap</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#eaeaec]">
                <span className="block text-[10px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">การปิดรับรองผลบังคับ (Evaluator Sign-Off)</span>
                <div className="flex items-center justify-between font-sans">
                  <span className="text-[16px] font-black text-[#932c2e] font-mono">{trainerMandatory}</span>
                  <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-300">Verification Rule</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[9.5px] text-[#7a8b95] font-bold mt-4 leading-relaxed font-sans text-center">
            นโยบายมาตรฐานการประเมินได้รับการตั้งค่าและปรับสมดุลแบบดิจิทัลเพื่อใช้รับรองผลสภาวการณ์ฝึกงาน OJT ในระดับสากลภายในระบบ
          </p>
        </div>
      </div>

      {/* Pair 2: Recharts Department Mastery Spectrum paired with AI OJT Skill Recommender */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <OjtSkillHeatmap learners={learners} />
        <SkillRecommender 
          learners={learners} 
          onAdoptSkill={(recomSkill, learnerId) => {
            // Add recommended skill to current OJT learners in state
            const updated = learners.map(l => {
              if (l.id === learnerId) {
                const existingSkills = l.skills || [];
                if (!existingSkills.some(s => s.name === recomSkill.name)) {
                  return {
                    ...l,
                    skills: [...existingSkills, { 
                      name: recomSkill.name, 
                      mastered: false, 
                      category: recomSkill.category as any
                    }]
                  };
                }
              }
              return l;
            });
            saveLearners(updated);
          }} 
        />
      </div>

      {/* --- ALL DRAGGABLE ACTION MODALS --- */}

      {/* MODAL 1: Learner Detail / Edit */}
      {learnerModal.isOpen && (
        <EditLearnerModal 
          isOpen={learnerModal.isOpen}
          record={learnerModal.record}
          onClose={() => setLearnerModal({ isOpen: false, record: null })}
          onSave={handleSaveLearner}
        />
      )}

      {/* MODAL 2: Coaching Log Entry Creator */}
      {logModal.isOpen && (
        <EditLogModal 
          isOpen={logModal.isOpen}
          record={logModal.record}
          learnersList={learners}
          onClose={() => setLogModal({ isOpen: false, record: null })}
          onSave={handleSaveLog}
        />
      )}

      {/* MODAL 3: Policy Configuration Manager */}
      {isPolicyModalOpen && (
        <EditPolicyModal 
          isOpen={isPolicyModalOpen}
          initialData={{ requiredHours, targetScore, trainerMandatory }}
          onClose={() => setIsPolicyModalOpen(false)}
          onSave={handleSavePolicy}
        />
      )}

      {/* MODAL 5: Submit Training Record with Skills Assessment */}
      {isSubmitRecordOpen && (
        <SubmitTrainingRecordModal 
          isOpen={isSubmitRecordOpen}
          learnersList={learners}
          recertifyPreselectedSkill={recertifyPreselectedSkill}
          onClose={() => {
            setIsSubmitRecordOpen(false);
            setRecertifyPreselectedSkill('');
          }}
          onSave={(newLog: CoachingLog, updatedSkills: SkillItem[], targetLearnerId: string) => {
            const logId = 'LOG-' + Date.now().toString().slice(-3);
            const extendedLog = { ...newLog, id: logId };
            const nextLogs = [extendedLog, ...coachingLogs];
            saveLogs(nextLogs);

            const nextLearners = learners.map(l => {
              if (l.id === targetLearnerId) {
                const addedHours = Math.round(newLog.durationMinutes / 60);
                const nextHours = Math.min(l.hoursCompleted + addedHours, l.totalHours);

                // Add acquired dates and expiration dates on newly mastered skills!
                const markedSkills = updatedSkills.map(sk => {
                  const preSkill = (l.skills || []).find(ps => ps.name === sk.name);
                  if (sk.mastered && !preSkill?.mastered) {
                    const today = new Date().toISOString().split('T')[0];
                    const expDateObj = new Date();
                    expDateObj.setDate(expDateObj.getDate() + 90); // 90 days validity for compliance
                    const expStr = expDateObj.toISOString().split('T')[0];
                    return {
                      ...sk,
                      acquiredDate: today,
                      expirationDate: sk.category === 'Compliance' ? expStr : undefined,
                      status: 'Active' as const
                    };
                  }
                  return {
                    ...sk,
                    acquiredDate: sk.acquiredDate || preSkill?.acquiredDate,
                    expirationDate: sk.expirationDate || preSkill?.expirationDate,
                    status: sk.status || preSkill?.status
                  };
                });

                const allMastered = markedSkills.length > 0 && markedSkills.every(s => s.mastered);
                
                let nextStatus = l.status;
                if (allMastered) {
                  nextStatus = 'Completed';
                } else if (l.status === 'Pending' && nextHours > 0) {
                  nextStatus = 'Active';
                }

                return {
                  ...l,
                  skills: markedSkills,
                  hoursCompleted: nextHours,
                  status: nextStatus as any,
                  lastMeetingDate: newLog.date
                };
              }
              return l;
            });
            saveLearners(nextLearners);
            setIsSubmitRecordOpen(false);
            setRecertifyPreselectedSkill('');
          }}
        />
      )}

      {/* Trainee OJT Skill Timeline drill-down dialogue modal workspace */}
      {isTimelineOpen && selectedTimelineLearner && (
        <TraineeSkillTimeline
          isOpen={isTimelineOpen}
          learnerId={selectedTimelineLearner.id}
          onClose={() => {
            setIsTimelineOpen(false);
            setSelectedTimelineLearner(null);
          }}
          onTriggerRecertify={(learner, skillName) => {
            setIsTimelineOpen(false);
            handleTriggerRecertify(learner, skillName);
          }}
        />
      )}

      {/* MODAL 4: Sidebar Help Panels Standard Layout */}
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

    </div>
  );
}

// --- MODULE HELP PANEL DRAWER LAYOUT (PORTAL) ---

function UserGuidePanel({ isOpen, onClose }: any) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <>
      <div className={`fixed inset-0 z-[190] bg-[#212c46]/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose}/>
      <div className={`fixed inset-y-0 right-0 z-[200] w-full md:w-[500px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col border-l-2 border-[#b58c4f] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex justify-between items-center p-5 px-6 border-b-2 border-[#b58c4f] bg-[#212c46] text-white shrink-0">
          <div>
            <h3 className="font-black flex items-center gap-3 uppercase tracking-widest text-base"><Icons.BookOpen size={20} className="text-[#b58c4f]"/> OJT COACHING GUIDE</h3>
            <p className="text-[12px] font-bold text-[#d7d7d7] uppercase tracking-widest mt-1.5">Apprenticeship & On-The-Job Mentorship</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-[#932c2e] hover:bg-white/10 rounded-xl transition-colors cursor-pointer"><Icons.X size={22}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8 text-[#414757] text-[12px] leading-relaxed custom-scrollbar bg-white font-sans">
          
          <section className="animate-fadeIn">
            <h4 className="text-[14px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-[#d7d7d7] pb-2 font-mono">
              <Icons.Award size={18} className="text-[#b58c4f]"/> 1. แฟ้มสะสมประวัติ OJT
            </h4>
            <p className="text-[12px] mb-3">ลงบันทึกการเรียนรู้คู่หน้างานโดยละเอียดของพนักงานจัดเก็บแบบเรียลไทม์:</p>
            <ul className="list-none pl-0 space-y-3">
              <li className="flex items-start gap-2 bg-[#f8f9fa] p-3 rounded-xl border border-[#eaeaec]">
                <Icons.CheckCircle size={16} className="shrink-0 text-[#657f4d] mt-0.5"/> 
                <div><strong className="text-[#212c46]">Progress Tracking:</strong> ระบบคำนวณสัดส่วนชั่วโมงสะสมสุทธิตามนโยบายสโมรสร (Cap) เพื่อเปลี่ยนสถานะเป็น Certified อัตโนมัติ</div>
              </li>
              <li className="flex items-start gap-2 bg-[#f8f9fa] p-3 rounded-xl border border-[#eaeaec]">
                <Icons.Activity size={16} className="shrink-0 text-[#3f809e] mt-0.5"/> 
                <div><strong className="text-[#3f809e]">Instructor Link:</strong> ยืนยันผู้ควบคุมหลักสูตรระดับ VP / Manager เพื่อมอบหมายงานได้มีประสิทธิภาพ</div>
              </li>
            </ul>
          </section>

          <section className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <h4 className="text-[14px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-[#d7d7d7] pb-2 font-mono">
              <Icons.ClipboardList size={18} className="text-[#3f809e]"/> 2. สมุดบันทึกเซสชันคู่ปฏิบัติ
            </h4>
            <p className="text-[12px] mb-2">เมื่อจัดทำ coaching log เสร็จสิ้น ชั่วโมงการสอนจะถูก <strong className="text-[#a94228]">ป้อนสมทบ (auto-accumulated)</strong> ไปที่ตัวเลขประวัติของพนักงานทันที</p>
            <ul className="list-disc pl-5 space-y-1 text-[#5c6870]">
              <li>ชั่วโมงคำนวณจากระยะเวลาบันทึกนาทีเซสชันหารด้วย 60</li>
              <li>การบันทึกประเมินค่าความสามารถระดับดาว</li>
            </ul>
          </section>

          <section className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <h4 className="text-[14px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-[#d7d7d7] pb-2 font-mono">
              <Icons.RefreshCw size={18} className="text-[#657f4d]"/> 3. นโยบายความปลอดภัย
            </h4>
            <p className="text-[12px]">พารามิเตอร์การตั้งค่าช่วยป้องกันการทดลองงานของพนักงานตกหล่น ทั้งหมดซิงค์กับ Local Storage ดำเนินการแบบ Real-time บน Sandbox ของผู้ใช้งาน</p>
          </section>

        </div>
        
        <div className="p-4 bg-[#f8f9fa] border-t border-[#eaeaec] flex justify-end shrink-0">
          <button onClick={onClose} className="px-8 py-2.5 bg-[#212c46] text-white font-black rounded-xl uppercase text-[12px] hover:bg-[#414757] hover:text-white transition-all shadow-md tracking-[0.1em] cursor-pointer">รับทราบกฎเกณฑ์ / Got it</button>
        </div>
      </div>
    </>
    , document.body
  );
}

// --- SUB-DIALOG FORMS AND DETAILS MODAL ---

function EditLearnerModal({ isOpen, record, onClose, onSave }: any) {
  const [formData, setFormData] = useState<Learner>({
    id: '',
    employeeName: '',
    employeeId: '',
    dept: '',
    role: '',
    trainerName: '',
    trainerDept: '',
    hoursCompleted: 0,
    totalHours: 60,
    status: 'Active',
    lastMeetingDate: 'N/A',
    gradeScore: 8.0
  });

  useEffect(() => {
    if (record) {
      setFormData(record);
    } else {
      setFormData({
        id: '',
        employeeName: '',
        employeeId: 'EMP-2026-',
        dept: 'Property Management',
        role: 'Assistant Specialist',
        trainerName: '',
        trainerDept: 'Supervisor',
        hoursCompleted: 0,
        totalHours: 60,
        status: 'Active',
        lastMeetingDate: 'N/A',
        gradeScore: 0
      });
    }
  }, [record, isOpen]);

  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title={record ? "แก้ไขแฟ้มประวัติพนักงาน OJT" : "สร้างคำสั่งแฟ้มประวัติ OJT ใหม่"}>
      <div className="p-6 space-y-4 max-w-lg font-sans">
        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">ชื่อพนักงานใหม่ (Learner Name)</label>
          <input 
            type="text"
            value={formData.employeeName}
            onChange={e => setFormData({ ...formData, employeeName: e.target.value })}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none focus:border-[#b58c4f]"
            placeholder="เช่น ธนา พงษ์สิทธิ์"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">รหัสประจำตัวพนักงาน</label>
            <input 
              type="text"
              value={formData.employeeId}
              onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold text-[#212c46] outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">แผนก / สังกัดปฏิบัติ</label>
            <input 
              type="text"
              value={formData.dept}
              onChange={e => setFormData({ ...formData, dept: e.target.value })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold text-[#212c46]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">สายวิชาชีพ / ตำแหน่ง</label>
            <input 
              type="text"
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">ประเมินผลคะแนนเกรด (/ 10.0)</label>
            <input 
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={formData.gradeScore ?? 0}
              onChange={e => setFormData({ ...formData, gradeScore: Number(e.target.value) })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px]"
            />
          </div>
        </div>

        <div className="border-t border-dashed border-[#eaeaec] pt-4">
          <span className="block text-[10px] font-black text-[#b58c4f] uppercase tracking-widest mb-3">ผู้ฝึกสอนประกบผล (Coach Profile)</span>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">ชื่อพี่เลี้ยงเวิร์กชอป</label>
              <input 
                type="text"
                value={formData.trainerName}
                onChange={e => setFormData({ ...formData, trainerName: e.target.value })}
                className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-bold focus:border-[#709654]"
                placeholder="เช่น คุณสรวิชญ์ พัฒนวร"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">ตำแหน่งพี่เลี้ยง</label>
              <input 
                type="text"
                value={formData.trainerDept}
                onChange={e => setFormData({ ...formData, trainerDept: e.target.value })}
                className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px]"
                placeholder="เช่น Legal VP"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-dashed border-[#eaeaec] pt-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">สถานะปัจจุบันหลักสูตร</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 text-[12px] font-bold"
            >
              <option value="Pending">Pending</option>
              <option value="Active">Active / กำลังติวงาน</option>
              <option value="Completed">Completed / รับรองวิทยะ</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans font-bold">ชั่วโมงเก็บได้สะสม (Hrs)</label>
            <div className="flex gap-2">
              <input 
                type="number"
                value={formData.hoursCompleted}
                onChange={e => setFormData({ ...formData, hoursCompleted: Number(e.target.value) })}
                className="w-20 bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 text-[12px] font-mono font-bold"
              />
              <span className="text-gray-400 py-2 text-[12px] font-bold">Of {formData.totalHours} Hrs Total</span>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-2.5 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-[#eaeaec] text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#d7d7d7]/20 transition-all cursor-pointer">Cancel</button>
          <button type="button" onClick={() => onSave(formData)} className="bg-[#212c46] hover:bg-[#b58c4f] text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md transition-all flex items-center gap-2 cursor-pointer"><Icons.Save size={14}/> Save Apprentice</button>
        </div>
      </div>
    </DraggableModal>
  );
}

// COACHING LOG FORM WRAPPER
function EditLogModal({ isOpen, record, learnersList, onClose, onSave }: any) {
  const [formData, setFormData] = useState<CoachingLog>({
    id: '',
    learnerId: '',
    learnerName: '',
    subject: '',
    trainerName: '',
    date: '',
    durationMinutes: 120,
    rating: 5,
    notes: ''
  });

  useEffect(() => {
    if (record) {
      setFormData(record);
    } else {
      setFormData({
        id: '',
        learnerId: learnersList[0]?.id || '',
        learnerName: learnersList[0]?.employeeName || '',
        subject: '',
        trainerName: learnersList[0]?.trainerName || '',
        date: new Date().toISOString().split('T')[0],
        durationMinutes: 120,
        rating: 5,
        notes: ''
      });
    }
  }, [record, isOpen, learnersList]);

  const handleSelectLearner = (learnerId: string) => {
    const matched = learnersList.find((l: any) => l.id === learnerId);
    if (matched) {
      setFormData({
        ...formData,
        learnerId,
        learnerName: matched.employeeName,
        trainerName: matched.trainerName
      });
    }
  };

  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title={record ? "แก้ไขสมุดบันทึก OJT Session" : "บันทึกชั่วโมงการทำงานคู่ OJT ใหม่"}>
      <div className="p-6 space-y-4 max-w-lg font-sans">
        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">เลือกพนักงานเป้าหมายเรียนงาน</label>
          <select 
            value={formData.learnerId}
            onChange={e => handleSelectLearner(e.target.value)}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2.5 text-[12px] font-bold text-[#212c46]"
            disabled={!!record}
          >
            {learnersList.map((l: any) => (
              <option key={l.id} value={l.id}>{l.employeeName} ({l.id})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">หัวข้อ / ทักษะวิชาชีพหลักสูตรปฏิบัติการ (OJT Subject)</label>
          <input 
            type="text"
            value={formData.subject}
            onChange={e => setFormData({ ...formData, subject: e.target.value })}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-20 text-[12px] text-[#212c46] font-bold h-11"
            placeholder="เช่น วางรายงานข้อบังคับ แนะนำขั้นตอน PMS"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">ผู้สอยงาน (Coach / PM)</label>
            <input 
              type="text"
              value={formData.trainerName}
              onChange={e => setFormData({ ...formData, trainerName: e.target.value })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">ระยะเวลาระดมสมอง (นาที)</label>
            <input 
              type="number"
              step="30"
              value={formData.durationMinutes}
              onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px] font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">วันที่ติวสอน</label>
            <input 
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">คะแนนผลงาน (Rating 1.0 - 5.0)</label>
            <input 
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-4 py-2 text-[12px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5">บันทึกข้อแนะนำพฤติกรรม (Coaching Notes)</label>
          <textarea 
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg p-3 text-[12px] h-20 resize-none font-bold outline-none font-sans"
            placeholder="รายละเอียดและคะแนนพฤติกรรมระหว่างการประกบ..."
          />
        </div>

        <div className="pt-4 flex justify-end gap-2.5 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-[#eaeaec] text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#d7d7d7]/20 transition-all cursor-pointer">Cancel</button>
          <button type="submit" onClick={() => onSave(formData)} className="bg-[#212c46] hover:bg-[#b58c4f] text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md transition-all flex items-center gap-2 cursor-pointer"><Icons.Save size={14}/> Save Action Log</button>
        </div>
      </div>
    </DraggableModal>
  );
}

// POLICY MANAGEMENT DIALOG
function EditPolicyModal({ isOpen, onClose, initialData, onSave }: any) {
  const [requiredHours, setRequiredHours] = useState(initialData.requiredHours);
  const [targetScore, setTargetScore] = useState(initialData.targetScore);
  const [trainerMandatory, setTrainerMandatory] = useState(initialData.trainerMandatory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ requiredHours, targetScore, trainerMandatory });
    onClose();
  };

  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title="แก้ไขกฎนโยบาย OJT มาตรฐาน">
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-w-md font-sans">
        <p className="text-[11.5px] text-[#7a8b95] leading-relaxed">
          ความแม่นยำข้อกฎหมายปฐมนิเทศ และตัวเลขเป้าหมายทดสอบพนักงานกลุ่ม SMART LAW
        </p>

        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">จำนวนชั่วโมง OJT ขั้นต่ำ</label>
          <select 
            value={requiredHours} 
            onChange={e => setRequiredHours(e.target.value)}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2.5 text-[12px] font-bold"
          >
            <option value="40 Hrs">40 Hrs (Basic OJT)</option>
            <option value="60 Hrs">60 Hrs (Recommended standard)</option>
            <option value="120 Hrs">120 Hrs (Intensive Apprenticeship)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">อัตราผลคะแนนสอบประเมินขั้นตํ่า</label>
          <select 
            value={targetScore} 
            onChange={e => setTargetScore(e.target.value)}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2.5 text-[12px] font-bold"
          >
            <option value="7.0 / 10.0">7.0 / 10.0 (Satisfactory)</option>
            <option value="8.0 / 10.0">8.0 / 10.0 (Recommended Standard)</option>
            <option value="9.0 / 10.0">9.0 / 10.0 (Excellent Certification)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">การปิดรับรับรองเอกสารดิจิตอล</label>
          <select 
            value={trainerMandatory} 
            onChange={e => setTrainerMandatory(e.target.value)}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2.5 text-[12px] font-bold"
          >
            <option value="True (Admin Sign)">True (Admin Sign Mandatory)</option>
            <option value="False (Auto Sign)">False (No Sign-off required)</option>
          </select>
        </div>

        <div className="pt-4 flex justify-end gap-2.5 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-[#414757] font-bold rounded-lg uppercase text-[10.5px]">Cancel</button>
          <button type="submit" className="bg-[#212c46] hover:bg-[#b58c4f] text-white px-5 py-2 rounded-lg font-black text-[10.5px] uppercase tracking-widest shadow-md flex items-center gap-1"><Icons.Save size={13}/> Save Rules</button>
        </div>
      </form>
    </DraggableModal>
  );
}

// REGISTER SUBMIT TRAINING RECORD AND SKILLS COMPETENCY MODAL
function SubmitTrainingRecordModal({ isOpen, learnersList, recertifyPreselectedSkill, onClose, onSave }: any) {
  const [selectedLearnerId, setSelectedLearnerId] = useState(learnersList[0]?.id || '');
  const [trainerName, setTrainerName] = useState('');
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState(120);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rating, setRating] = useState(4.5);
  const [notes, setNotes] = useState('');
  const [skillCategoryFilter, setSkillCategoryFilter] = useState<'All' | 'Technical' | 'Compliance' | 'Soft Skills'>('All');
  
  // Local list of skill items of the selected apprentice
  const [skills, setSkills] = useState<SkillItem[]>([]);

  // Pre-fill subject and comments if the user triggers recertification for a specific skill
  useEffect(() => {
    if (isOpen && recertifyPreselectedSkill) {
      setSubject(`Recertify Compliance: ${recertifyPreselectedSkill}`);
      setNotes(`Recertification assessment session specifically triggered for the Compliance competency: "${recertifyPreselectedSkill}". Checked compliance requirements.`);
      setSkillCategoryFilter('Compliance');
    } else if (isOpen) {
      setSubject('');
      setNotes('');
      setSkillCategoryFilter('All');
    }
  }, [isOpen, recertifyPreselectedSkill]);

  // Sync details when selected learner changes
  useEffect(() => {
    const matched = learnersList.find((l: any) => l.id === selectedLearnerId);
    if (matched) {
      setTrainerName(matched.trainerName || '');
      // Fallback skills if not defined
      const defaultSkills = matched.skills || [
        { name: 'Introduction to Core Procedures', mastered: false, category: 'Technical' },
        { name: 'On-Job Technical Competence', mastered: false, category: 'Technical' },
        { name: 'Workflow Integration Standards', mastered: false, category: 'Compliance' },
        { name: 'Safety Compliance Regulations', mastered: false, category: 'Compliance' },
        { name: 'Final Performance Assessment', mastered: false, category: 'Soft Skills' }
      ];
      setSkills(defaultSkills);
    }
  }, [selectedLearnerId, learnersList]);

  // Resolve computed categories elegantly to group items in the UI dynamically
  const filteredSkills = useMemo(() => {
    return skills.map((s, idx) => {
      const defaultCategory = s.name.toLowerCase().includes('regulatory') ||
        s.name.toLowerCase().includes('code') ||
        s.name.toLowerCase().includes('compliance') ||
        s.name.toLowerCase().includes('safety') ||
        s.name.toLowerCase().includes('privacy') ||
        s.name.toLowerCase().includes('standards') ||
        s.name.toLowerCase().includes('standard') ||
        s.name.toLowerCase().includes('safeguard') ||
        s.name.toLowerCase().includes('audits') ||
        s.name.toLowerCase().includes('tax')
          ? 'Compliance'
          : s.name.toLowerCase().includes('brand') ||
            s.name.toLowerCase().includes('voice') ||
            s.name.toLowerCase().includes('introduction') ||
            s.name.toLowerCase().includes('voice') ||
            s.name.toLowerCase().includes('social') ||
            s.name.toLowerCase().includes('soft')
          ? 'Soft Skills'
          : 'Technical';

      const category = s.category || defaultCategory;
      return { ...s, category, origIndex: idx };
    }).filter(s => {
      if (skillCategoryFilter === 'All') return true;
      return s.category === skillCategoryFilter;
    });
  }, [skills, skillCategoryFilter]);

  const handleToggleSkill = (index: number) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], mastered: !updated[index].mastered };
    setSkills(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLearnerId) return;

    const matched = learnersList.find((l: any) => l.id === selectedLearnerId);
    
    const newLog: CoachingLog = {
      id: '',
      learnerId: selectedLearnerId,
      learnerName: matched ? matched.employeeName : 'Unknown',
      subject: subject || 'Competency Session & Assessment',
      trainerName,
      date,
      durationMinutes: duration,
      rating,
      notes: notes || 'Performance assessed.'
    };

    onSave(newLog, skills, selectedLearnerId);
  };

  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title="รับคำสั่งประเมินทักษะ & ส่งเสริม OJT (Submit Training Record)">
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-w-lg font-sans">
        <div>
          <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">
            เลือกพนักงานเข้ารับการประเมิน OJT (Trainee Apprentice)
          </label>
          <select
            value={selectedLearnerId}
            onChange={e => setSelectedLearnerId(e.target.value)}
            className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 text-[12px] font-bold text-[#212c46] outline-none"
          >
            {learnersList.map((l: any) => (
              <option key={l.id} value={l.id}>
                {l.employeeName} ({l.dept} &bull; {l.id})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">
              ชื่อผู้ตรวจสอบพี่เลี้ยง (Trainer / Coach)
            </label>
            <input
              type="text"
              required
              value={trainerName}
              onChange={e => setTrainerName(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 text-[12px] font-bold text-[#212c46]"
              placeholder="เช่น คุณวิทยากร"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">
              วันที่ทดสอบประเมิน (Assessment Date)
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 text-[12px] font-bold text-[#212c46]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">
              เวลาเรียนรู้งานเพิ่มเติม (นาที)
            </label>
            <select
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 text-[12px] font-bold text-[#212c46]"
            >
              <option value="30">30 นาที (0.5 ชม.)</option>
              <option value="60">60 นาที (1.0 ชม.)</option>
              <option value="120">120 นาที (2.0 ชม.)</option>
              <option value="180">180 นาที (3.0 ชม.)</option>
              <option value="240">240 นาที (4.0 ชม.)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">
              หัวข้อหลักสูตรประเมิน (Training Subject)
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="ระบุข้อกำหนดที่ฝึกสอนงาน..."
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 text-[12px] font-bold text-[#212c46]"
            />
          </div>
        </div>

        {/* Dynamic Skill Competency Checklist */}
        <div className="border border-[#eaeaec] bg-slate-50/50 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <span className="text-[10.5px] font-black text-[#b58c4f] uppercase tracking-widest flex items-center gap-1.5">
              <Icons.CheckSquare size={13} className="text-[#657f4d]"/> Competency Assessment
            </span>
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 bg-white border border-[#eaeaec] rounded-lg p-0.5 shrink-0">
              {(['All', 'Technical', 'Compliance', 'Soft Skills'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSkillCategoryFilter(cat)}
                  className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    skillCategoryFilter === cat 
                      ? 'bg-[#212c46] text-white' 
                      : 'text-slate-500 hover:text-[#b58c4f]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
            {filteredSkills.length === 0 ? (
              <div className="text-center py-6 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                No skills found in this category
              </div>
            ) : (
              filteredSkills.map((s) => (
                <label key={s.origIndex} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-[#eaeaec] cursor-pointer hover:border-[#b58c4f] transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={s.mastered}
                    onChange={() => handleToggleSkill(s.origIndex)}
                    className="rounded text-[#657f4d] focus:ring-[#657f4d] w-4 h-4"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[11.5px] font-bold text-[#212c46] leading-snug">{s.name}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-widest shrink-0 ${
                        s.category === 'Compliance' ? 'bg-red-50 text-red-700 border border-red-200' :
                        s.category === 'Soft Skills' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}>
                        {s.category}
                      </span>
                    </div>
                    <span className={`text-[9.5px] font-black uppercase mt-1 leading-none ${s.mastered ? 'text-[#657f4d]' : 'text-[#7a8b95]'}`}>
                      {s.mastered ? '★ Mastery Vetted' : '☉ In Coaching'}
                    </span>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">
              คะแนนประเมินศักยภาพ (Rating 1.0 - 5.0)
            </label>
            <input
              type="number"
              min="1.0"
              max="5.0"
              step="0.1"
              required
              value={rating}
              onChange={e => setRating(Number(e.target.value))}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-2 text-[12px] font-black text-[#212c46]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-[#7a8b95] uppercase tracking-widest mb-1.5 font-sans">
              บันทึกคะแนนคำติชม (Performance Feedback)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="ระบุคำแนะนำการเรียนรู้งานเพิ่มเติม..."
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-lg px-3 py-1.5 text-[12px] font-bold text-[#212c46] h-10 resize-none font-sans"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-2.5 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-[#eaeaec] text-[#414757] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#d7d7d7]/20 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#657f4d] hover:bg-[#709654] text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Icons.CheckSquare size={14} /> Submit Assessment
          </button>
        </div>
      </form>
    </DraggableModal>
  );
}
