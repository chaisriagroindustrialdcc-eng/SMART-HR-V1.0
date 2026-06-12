import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';
import * as Icons from 'lucide-react';
import { dbSync } from '../../services/dbSync';
import { DraggableModal } from '../../components/shared/DraggableModal';
import UserGuideButton from '../../components/shared/UserGuideButton';

// Styling Configuration
const THEME = {
  primary: '#b22026', // Red
  secondary: '#3f809e', // Blue
  accent: '#b58c4f', // Gold/Sand
  bgMain: 'transparent',
  textMain: '#2f2926',
  palette: {
    navy: '#212c46',
    charcoal: '#414757',
    sand: '#b7a159',
    gold: '#b58c4f',
    forest: '#508660',
    rose: '#ab7d82',
    slate: '#748b9e',
    cream: '#f3f3f1'
  }
};

const INITIAL_EXTERNAL_ACTIVITIES = [
  {
    id: 'EXT-2026-001',
    title: 'โครงการปลูกป่าทดแทนชายเลนและปล่อยพันธุ์ปลาฉลามกบ',
    category: 'CSR',
    date: '2026-06-12',
    budget: 45000,
    participants: 50,
    status: 'Planned',
    partner: 'สำนักงานทรัพยากรทางทะเลและชายฝั่งที่ 3',
    deliverable: 'ปลูกต้นโกงกาง 300 ต้น และปล่อยพันธุ์ปลา/ปูฟื้นฟูระบบนิเวศน์ทางทะเล จังหวัดเพชรบุรี'
  },
  {
    id: 'EXT-2026-002',
    title: 'เวทีแลกเปลี่ยนนวัตกรรมความยั่งยืนในอุตสาหกรรม (Industry Alliance Forum)',
    category: 'INDUSTRY ALLIANCE',
    date: '2026-07-20',
    budget: 85000,
    participants: 120,
    status: 'Planned',
    partner: 'สภาอุตสาหกรรมแห่งประเทศไทย (FTI)',
    deliverable: 'ลงนามความร่วมมือ MOU เพื่อลดการปล่อยคาร์บอนในโรงงานอุตสาหกรรมเขตภาคตะวันตก'
  },
  {
    id: 'EXT-2026-003',
    title: 'โครงการปั้นเยาวชนเทคนิคป้อนสู่วิศวกรรมซ่อมบำรุงโรงงาน',
    category: 'UNIVERSITY RELATIONS',
    date: '2026-05-18',
    budget: 30000,
    participants: 35,
    status: 'Completed',
    partner: 'วิทยาลัยเทคนิคสมุทรสงคราม',
    deliverable: 'มอบทุนการศึกษา และเปิดโควต้ารับนักศึกษาฝึกงานเข้าสัมผัสเครื่องจักรไฮดรอลิคจริง'
  }
];

// User Guide Panel
function UserGuidePanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <>
      <div className={`fixed inset-0 z-[190] bg-[#212c46]/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed inset-y-0 right-0 z-[200] w-full md:w-[480px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col border-l-4 border-[#b7a159] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="bg-[#212c46] px-6 py-5 flex justify-between items-center text-white shrink-0 border-b border-[#414757]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-white shadow-inner"><Icons.BookOpen size={18} /></div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest leading-none mb-1">EXTERNAL ACTIVITIES</h3>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">คู่มือกิจกรรมเชื่อมสัมพันธ์และงาน CSR</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all text-white/70 hover:text-white cursor-pointer"><Icons.X size={18} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-[#414757] text-[12px] leading-relaxed">
          <section className="animate-fadeIn">
            <h4 className="text-[13px] font-black text-[#212c46] mb-2 uppercase flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <Icons.Globe size={15} className="text-[#3f809e]" /> 1. วัตถุประสงค์โครงการภายนอก
            </h4>
            <p className="text-slate-600 font-semibold mb-2">เพื่อพัฒนาประสิทธิผลทางสังคม (Corporate Social Responsibility) สร้างแรงจูงใจในชุมชน และส่งเสริมความน่าเชื่อถือ:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500">
              <li><strong className="text-slate-700">CSR Projects:</strong> การบำเพ็ญสาธารณประโยชน์ สิ่งแวดล้อม และสวัสดิภาพสังคม</li>
              <li><strong className="text-slate-700">Industry Alliance:</strong> ความร่วมมือกับสภานายกสมาคมและคู่ค้าภายนอกเพื่อขยายตัวตน</li>
              <li><strong className="text-slate-700">University Relations:</strong> เชื่อมสัมพันธ์มหาวิทยาลัยและสถาบันอาชีวศึกษาเพื่อเฟ้นหาและเตรียมบุคลากรคุณภาพ</li>
            </ul>
          </section>

          <section className="animate-fadeIn">
            <h4 className="text-[13px] font-black text-[#212c46] mb-2 uppercase flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <Icons.ShieldCheck size={15} className="text-emerald-600" /> 2. การจัดสรรงบประมาณและการติดตามผล
            </h4>
            <p className="text-slate-600">วิเคราะห์ข้อมูลค่าใช้จ่ายโครงการ จำนวนผู้มีส่วนร่วม และขีดความสามารถการทำ Deliverables ร่วมกับพาร์ทเนอร์ภาครัฐและเอกชน ผ่านแผงบันทึกความขัดแย้งเชิงเวลาและตรวจสอบได้ทันที</p>
          </section>
        </div>
        
        <div className="p-4 bg-[#f8f9fa] border-t border-[#eaeaec] flex justify-between items-center">
          <span className="text-[9px] font-bold text-slate-400">VERSION 1.0</span>
          <button onClick={onClose} className="px-6 py-2 bg-[#212c46] hover:bg-[#3f809e] text-white font-black rounded-lg uppercase text-[10px] tracking-wider cursor-pointer">Got it</button>
        </div>
      </div>
    </>,
    document.body
  );
}

// KPI Dashboard Card
const KpiCard = ({ icon: Icon, value, label, subtitle, bgAccent, color }: any) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
    <div className={`absolute -right-4 -bottom-4 opacity-10 ${color} transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500`}>
      <Icon size={80} />
    </div>
    <div className="flex justify-between items-start">
      <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">{label}</span>
      <div className={`p-2.5 ${bgAccent} ${color} rounded-xl`}>
        <Icon size={18} />
      </div>
    </div>
    <div className="mt-4">
      <h3 className="text-xl sm:text-2xl font-black text-[#212c46] font-mono leading-none">{value}</h3>
      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-tight">{subtitle}</p>
    </div>
  </div>
);

export default function External() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('CSR');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formBudget, setFormBudget] = useState<number>(10000);
  const [formParticipants, setFormParticipants] = useState<number>(30);
  const [formStatus, setFormStatus] = useState('Planned');
  const [formPartner, setFormPartner] = useState('');
  const [formDeliverable, setFormDeliverable] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    loadActivitiesData();
  }, []);

  const loadActivitiesData = async () => {
    setLoading(true);
    try {
      const res = await dbSync.read('external_activities');
      if (res && res.status === 'success' && res.data && Array.isArray(res.data.items) && res.data.items.length > 0) {
        setActivities(res.data.items);
      } else {
        setActivities(INITIAL_EXTERNAL_ACTIVITIES);
        await dbSync.write('external_activities', INITIAL_EXTERNAL_ACTIVITIES);
      }
    } catch (err) {
      console.error('Failed to load external activities:', err);
      setActivities(INITIAL_EXTERNAL_ACTIVITIES);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditId(null);
    setFormTitle('');
    setFormCategory('CSR');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormBudget(10000);
    setFormParticipants(30);
    setFormStatus('Planned');
    setFormPartner('');
    setFormDeliverable('');
    setIsFormOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditId(item.id);
    setFormTitle(item.title || '');
    setFormCategory(item.category || 'CSR');
    setFormDate(item.date || '');
    setFormBudget(Number(item.budget) || 0);
    setFormParticipants(Number(item.participants) || 0);
    setFormStatus(item.status || 'Planned');
    setFormPartner(item.partner || '');
    setFormDeliverable(item.deliverable || '');
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPartner.trim()) {
      Swal.fire('ข้อผิดพลาด', 'กรุณาระบุชื่อโครงการ และองค์กรพันธมิตร', 'error');
      return;
    }

    const payload = {
      id: editId || `EXT-${Date.now()}`,
      title: formTitle,
      category: formCategory,
      date: formDate,
      budget: Number(formBudget),
      participants: Number(formParticipants),
      status: formStatus,
      partner: formPartner,
      deliverable: formDeliverable
    };

    let updatedList = [...activities];
    if (editId) {
      updatedList = updatedList.map(item => item.id === editId ? payload : item);
    } else {
      updatedList.unshift(payload);
    }

    setActivities(updatedList);
    setIsFormOpen(false);

    try {
      await dbSync.write('external_activities', updatedList);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'บันทึกข้อมูลกิจกรรมภายนอกสำเร็จ',
        showConfirmButton: false,
        timer: 2000
      });
    } catch (err) {
      console.error('Failed to sync external activities:', err);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'ต้องการลบกิจกรรมนี้?',
      text: 'การลบจะเป็นการนำบันทึกโครงการออกจากระบบโดยถาวร',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#b22026',
      cancelButtonColor: '#7a8b95',
      confirmButtonText: 'ต้องการลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      const updatedList = activities.filter(a => a.id !== id);
      setActivities(updatedList);
      try {
        await dbSync.write('external_activities', updatedList);
        Swal.fire('ลบข้อมูลแล้ว', 'ข้อมูลโครงการกิจกรรมถูกนำออกจากระบบแล้ว', 'success');
      } catch (err) {
        console.error('Failed to sync delete:', err);
      }
    }
  };

  // CSV Export Mechanism based on user rules
  const handleExportCSV = () => {
    try {
      let csvContent = '\uFEFF'; // BOM support for Thai language
      csvContent += 'ID,ชื่อโครงการ/กิจกรรม,หมวดหมู่,วันที่จัดโครงการ,งบประมาณโครงการ (THB),เป้าหมายผู้เข้าร่วม,สถานะโครงการ,หน่วยงานพาร์ทเนอร์ภายนอก,เป้าหมายความสำเร็จ\n';
      
      activities.forEach(item => {
        const row = [
          `"${item.id || ''}"`,
          `"${(item.title || '').replace(/"/g, '""')}"`,
          `"${item.category || ''}"`,
          `"${item.date || ''}"`,
          `"${item.budget || 0}"`,
          `"${item.participants || 0}"`,
          `"${item.status || ''}"`,
          `"${(item.partner || '').replace(/"/g, '""')}"`,
          `"${(item.deliverable || '').replace(/"/g, '""')}"`
        ];
        csvContent += row.join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `External_Activities_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      Swal.fire({
        icon: 'success',
        title: 'ส่งออกข้อมูลเสร็จสิ้น',
        text: `ส่งออกไฟล์รายงานกิจกรรมภายนอก (${activities.length} รายการ) เรียบร้อยแล้ว`,
        confirmButtonColor: '#212c46'
      });
    } catch (err) {
      console.error(err);
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถส่งออกข้อมูล CSV ได้', 'error');
    }
  };

  // Report Printing Mechanism as per standard: Logo, Company Name, Document Title
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalProjectBudget = activities.reduce((sum, item) => sum + (Number(item.budget) || 0), 0);
    const totalPeople = activities.reduce((sum, item) => sum + (Number(item.participants) || 0), 0);

    printWindow.document.write(`
      <html>
        <head>
          <title>EXTERNAL ACTIVITIES EXECUTIVE REPORT</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
            body { font-family: 'Sarabun', sans-serif; padding: 40px; color: #212c46; line-height: 1.5; }
            .header-container { display: flex; align-items: center; justify-between: space-between; border-bottom: 3px double #b22026; padding-bottom: 15px; margin-bottom: 30px; }
            .logo-placeholder { font-weight: 950; font-size: 24px; color: #b22026; text-transform: uppercase; letter-spacing: 1px; }
            .company-name { font-weight: 700; text-align: right; }
            .doc-title { text-align: center; font-size: 20px; font-weight: 700; text-transform: uppercase; color: #212c46; margin: 20px 0; }
            .stat-summary { display: flex; justify-content: space-around; background: #f8f9fa; border: 1px solid #eaeaec; padding: 15px; border-radius: 8px; margin-bottom: 25px; }
            .stat-box { text-align: center; }
            .stat-box h4 { margin: 0; font-size: 11px; color: #7a8b95; text-transform: uppercase; }
            .stat-box div { font-size: 18px; font-weight: 700; color: #212c46; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th { background-color: #212c46; color: white; padding: 10px; text-transform: uppercase; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #eaeaec; text-align: left; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
            .badge-completed { background-color: #e6f4ea; color: #137333; }
            .badge-planned { background-color: #fef7e0; color: #b06000; }
            .badge-ongoing { background-color: #e8f0fe; color: #1a73e8; }
            .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #7a8b95; border-top: 1px solid #eaeaec; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="logo-placeholder">Chaisri Agro</div>
            <div class="company-name">
              <div>บริษัท ชัยศรีอุตสาหกรรมเกษตร จำกัด</div>
              <div style="font-size: 11px; color:#7a8b95; font-weight: normal;">ฝ่ายแรงงานสัมพันธ์และการพัฒนาเพื่อความยั่งยืน</div>
            </div>
          </div>

          <div class="doc-title">สรุปรายงานแผนงานและกิจกรรมเพื่อสังคมภายนอกองค์กร (CSR & External Alliances)</div>

          <div class="stat-summary">
            <div class="stat-box">
              <h4>Total Projects / โครงการทั้งหมด</h4>
              <div>${activities.length} โครงการ</div>
            </div>
            <div class="stat-box">
              <h4>Total Invested Budget / งบประมาณจัดสรร</h4>
              <div>${totalProjectBudget.toLocaleString()} THB</div>
            </div>
            <div class="stat-box">
              <h4>Total Partners Involved / พันธมิตรผู้ร่วมงาน</h4>
              <div>${new Set(activities.map(a => a.partner)).size} องค์กร</div>
            </div>
            <div class="stat-box">
              <h4>Target Reach / กลุ่มเป้าหมายรับสิทธิ์</h4>
              <div>${totalPeople.toLocaleString()} คน</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 10%;">ID</th>
                <th style="width: 35%;">ชื่อโครงการ/กิจกรรม</th>
                <th style="width: 15%;">หมวดหมู่</th>
                <th style="width: 15%;">พาร์ทเนอร์ภายนอก</th>
                <th style="width: 15%;">งบประมาณจัดสรร</th>
                <th style="width: 10%;">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              ${activities.map(item => `
                <tr>
                  <td><strong>${item.id || ''}</strong></td>
                  <td>
                    <div><strong>${item.title || ''}</strong></div>
                    <div style="font-size: 10px; color: #7a8b95; margin-top: 3px;">${item.deliverable || ''}</div>
                  </td>
                  <td>${item.category || ''}</td>
                  <td>${item.partner || ''}</td>
                  <td>${(item.budget || 0).toLocaleString()} THB</td>
                  <td>
                    <span class="badge badge-${(item.status || '').toLowerCase()}">${item.status || ''}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            พิมพ์โดยฝ่ายบุคคลและดูแลผลประโยชน์เพื่อสังคม | วันที่พิมพ์รายงาน: ${new Date().toLocaleDateString('th-TH')} - ข้อมูลความปลอดภัยระดับสมาคม
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const openDetail = (item: any) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const filteredActivities = activities.filter(item => {
    const matchesSearch = 
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.partner || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.deliverable || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalBudgetSpent = activities.reduce((sum, item) => sum + (Number(item.budget) || 0), 0);
  const totalTargetParticipants = activities.reduce((sum, item) => sum + (Number(item.participants) || 0), 0);
  const activePartnersCount = new Set(activities.map(item => item.partner)).size;

  return (
    <div className="pt-6 pb-12 flex flex-col gap-6 animate-fadeIn px-4 sm:px-8 w-full max-w-7xl mx-auto text-[#2f2926]">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-4 border-b border-slate-100">
        <div className="text-left">
          <h1 className="text-2xl font-black text-[#212c46] tracking-tight uppercase flex items-center gap-3">
            <Icons.Globe size={28} className="text-[#3f809e] shrink-0 animate-pulse" />
            <span>EXTERNAL ACTIVITIES / กิจกรรมเพื่อสังคม CSR & เครือข่ายสัมพันธ์</span>
          </h1>
          <p className="text-xs text-[#7a8b95] font-bold uppercase tracking-normal mt-1">
            Build community trust and manage external public relationships, partnerships, and CSR events.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsGuideOpen(true)}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl hover:text-[#212c46] transition-all cursor-pointer border border-[#eaeaec] shrink-0"
            title="User Guide"
          >
            <Icons.HelpCircle size={18} />
          </button>
          
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[#212c46] px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0"
          >
            <Icons.Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[#212c46] px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0"
          >
            <Icons.Printer size={14} />
            <span>Print Report</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#212c46] hover:bg-[#3f809e] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
          >
            <Icons.Plus size={14} />
            <span>เพิ่มกิจกรรมพัฒนาสังคม</span>
          </button>
        </div>
      </div>

      {/* KPI Overviews Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Icons.Award}
          value={activities.length}
          label="Total Alliances"
          subtitle="โครงการ CSR & พาร์ทเนอร์ทั้งหมด"
          bgAccent="bg-blue-50"
          color="text-[#3f809e]"
        />
        <KpiCard
          icon={Icons.DollarSign}
          value={`${totalBudgetSpent.toLocaleString()} ฿`}
          label="Budget Allocated"
          subtitle="งบประมาณร่วมมือรวมที่ใช้จัดสรร"
          bgAccent="bg-emerald-50"
          color="text-[#508660]"
        />
        <KpiCard
          icon={Icons.HeartHandshake}
          value={activePartnersCount}
          label="Official Partners"
          subtitle="สมาคม & องค์การร่วมพัฒนาองค์กร"
          bgAccent="bg-amber-50"
          color="text-[#b58c4f]"
        />
        <KpiCard
          icon={Icons.Users}
          value={totalTargetParticipants.toLocaleString()}
          label="Beneficiary Reach"
          subtitle="เป้าหมายจำนวนผู้มีส่วนได้รับผลดี"
          bgAccent="bg-red-50"
          color="text-[#b22026]"
        />
      </div>

      {/* Filter Options */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/70 flex flex-col md:flex-row items-center gap-3 shadow-inner">
        <div className="relative w-full md:w-80">
          <Icons.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          <input
            type="text"
            placeholder="ค้นหาชื่อโครงการ พาร์ทเนอร์ ผลลัพธ์..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#b58c4f] focus:border-[#b58c4f] transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 items-center w-full md:w-auto">
          {['ALL', 'CSR', 'INDUSTRY ALLIANCE', 'UNIVERSITY RELATIONS', 'PUBLIC SEMINAR'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#212c46] text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-[#414757] border border-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'ประเภทโครงการทั้งหมด' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Layout */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Icons.Loader2 className="animate-spin text-[#3f809e]" size={36} />
          <p className="text-xs font-bold uppercase tracking-wider text-[#7a8b95]">กำลังโหลดข้อมูลาแผนกิจกรรมภายนอก...</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6">
          <Icons.Inbox size={48} className="text-slate-300 mb-3" />
          <p className="text-sm font-bold text-[#212c46] uppercase">ไม่พบรายการกิจกรรมแผนงาน</p>
          <p className="text-xs text-[#7a8b95] mt-1">ลองเปลี่ยนแปลงเงื่อนไขตัวกรองหรือเพิ่มโครงการด้านความรับผิดชอบภายนอกของคุณใหม่</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#212c46] text-white text-[10px] font-black uppercase tracking-wider">
                  <th className="py-3.5 px-5">ID</th>
                  <th className="py-3.5 px-5">โครงการ / รายละเอียดความสำเร็จ</th>
                  <th className="py-3.5 px-5">หมวดหมู่</th>
                  <th className="py-3.5 px-5">หน่วยพันธมิตรร่วมดำเนินงาน</th>
                  <th className="py-3.5 px-5">งบจัดสรร (THB)</th>
                  <th className="py-3.5 px-5">ผู้มีส่วนร่วมเป้าหมาย</th>
                  <th className="py-3.5 px-5">สถานะ</th>
                  <th className="py-3.5 px-5 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-semibold">
                {filteredActivities.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 text-[#3f809e] font-bold">{item.id}</td>
                    <td className="py-4 px-5 max-w-xs">
                      <div>
                        <span className="font-extrabold text-slate-800 hover:text-[#3f809e] transition-colors cursor-pointer" onClick={() => openDetail(item)}>
                          {item.title}
                        </span>
                        <p className="text-[10px] text-slate-400 font-normal mt-1 truncate">
                          {item.deliverable}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                        item.category === 'CSR' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                        item.category === 'INDUSTRY ALLIANCE' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                        'bg-blue-50 border-blue-100 text-blue-700'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-600 font-bold">{item.partner}</td>
                    <td className="py-4 px-5 font-mono text-[#508660] font-black">
                      {(Number(item.budget) || 0).toLocaleString()} ฿
                    </td>
                    <td className="py-4 px-5 text-slate-500 font-mono">
                      {(Number(item.participants) || 0).toLocaleString()} คน
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border ${
                        item.status === 'Completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                        item.status === 'In Progress' ? 'bg-sky-50 border-sky-100 text-sky-800' :
                        'bg-amber-50 border-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openDetail(item)}
                          className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 rounded text-[10px] text-[#3f809e] font-black uppercase flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Icons.Search size={12} />
                          ดูรายละเอียด
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded text-slate-500 hover:text-[#212c46] transition-all cursor-pointer"
                          title="แก้ไข"
                        >
                          <Icons.Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded text-rose-500 hover:text-rose-700 transition-all cursor-pointer"
                          title="ลบ"
                        >
                          <Icons.Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adding/Editing Modal form */}
      <DraggableModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editId ? '🛠️ แก้ไขข้อมูลกิจกรรมภายนอก CSR' : '🌱 เพิ่มโครงการกิจกรรมเพื่อสังคมใหม่'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">ชื่อโครงการภายนอก / Project Title</label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="โครงการมอบทุนการศึกษา หรือ ร่วมมือพัฒนาพาร์ทเนอร์คู่ค้า..."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-[#212c46] placeholder-slate-400 focus:outline-none focus:border-[#b58c4f]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">หมวดหมู่กลุ่มงาน / Project Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-[#212c46] focus:outline-none focus:border-[#b58c4f] cursor-pointer"
              >
                <option value="CSR">CSR (กิจกรรมความรับผิดชอบต่อสังคมและสิ่งแวดล้อม)</option>
                <option value="INDUSTRY ALLIANCE">INDUSTRY ALLIANCE (ความร่วมมือภาคอุตสาหกรรมสมาคม)</option>
                <option value="UNIVERSITY RELATIONS">UNIVERSITY RELATIONS (ความร่วมมือโรงเรียน/มหาวิทยาลัย)</option>
                <option value="PUBLIC SEMINAR">PUBLIC SEMINAR (งานสัมมนาและนิทรรศการสาธารณะ)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">วันที่จัด / Target Date</label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-[#212c46] focus:outline-none focus:border-[#b58c4f]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">งบประมาณโครงการ (บาท) / Budget</label>
              <input
                type="number"
                required
                value={formBudget}
                onChange={(e) => setFormBudget(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-[#212c46] focus:outline-none focus:border-[#b58c4f]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">กลุ่มเป้าหมายผู้ร่วม (ราย) / Target Reach</label>
              <input
                type="number"
                required
                value={formParticipants}
                onChange={(e) => setFormParticipants(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-[#212c46] focus:outline-none focus:border-[#b58c4f]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">สถานะโครงการ / Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-[#212c46] focus:outline-none focus:border-[#b58c4f] cursor-pointer"
              >
                <option value="Planned">Planned (วางแผนงาน)</option>
                <option value="In Progress">In Progress (กำลังดำเนินการ)</option>
                <option value="Completed">Completed (เสร็จสิ้น)</option>
                <option value="Cancelled">Cancelled (ยกเลิกแผนงาน)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">สมาคมพันธมิตรภายนอก / Partner Organization</label>
              <input
                type="text"
                required
                value={formPartner}
                onChange={(e) => setFormPartner(e.target.value)}
                placeholder="สภาอุตสาหกรรม, มหาวิทยาลัยเทคนิค, สมาคมวิศวกรรม..."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-[#212c46] placeholder-slate-400 focus:outline-none focus:border-[#b58c4f]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">เป้าหมายผลลัพธ์โครงการ / Deliverable Achievement</label>
            <textarea
              required
              rows={4}
              value={formDeliverable}
              onChange={(e) => setFormDeliverable(e.target.value)}
              placeholder="เป้าหมายดัชนีความสำเร็จสูงสุดที่โครงการต้องการสร้าง..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-[#212c46] focus:outline-none focus:border-[#b58c4f]"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#212c46] hover:bg-[#3f809e] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Icons.Save size={14} />
              <span>บันทึกโครงการ</span>
            </button>
          </div>
        </form>
      </DraggableModal>

      {/* Detailed Modal view */}
      <DraggableModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="🌱 รายละเอียดแผนกิจกรรมภายนอก CSR"
      >
        {selectedItem && (
          <div className="space-y-4 text-left text-slate-700">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-2 font-semibold">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PROJECT ID</span>
                <p className="text-sm font-mono font-black text-[#3f809e] uppercase">{selectedItem.id}</p>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">STATUS</span>
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border ${
                    selectedItem.status === 'Completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                    selectedItem.status === 'In Progress' ? 'bg-sky-50 border-sky-100 text-sky-800' :
                    'bg-amber-50 border-amber-100 text-amber-800'
                  }`}>
                    {selectedItem.status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-black text-[#212c46] leading-snug mb-2">
                {selectedItem.title}
              </h2>
              <span className="px-2.5 py-1 text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-100 rounded uppercase tracking-wider">
                {selectedItem.category}
              </span>
            </div>

            {/* Metrics List inside Detail modal */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                <span className="text-[9px] font-black text-slate-400 uppercase">TARGET DATE</span>
                <p className="text-xs font-black text-[#212c46] mt-0.5">{selectedItem.date}</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                <span className="text-[9px] font-black text-slate-400 uppercase">BUDGET ALLOCATED</span>
                <p className="text-xs font-mono font-black text-[#508660] mt-0.5">{(Number(selectedItem.budget) || 0).toLocaleString()} ฿</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                <span className="text-[9px] font-black text-slate-400 uppercase">REACH TARGET</span>
                <p className="text-xs font-mono font-black text-slate-700 mt-0.5">{(Number(selectedItem.participants) || 0).toLocaleString()} คน</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                <span className="text-[9px] font-black text-slate-400 uppercase">PARTNER</span>
                <p className="text-xs font-black text-slate-600 mt-0.5 truncate">{selectedItem.partner}</p>
              </div>
            </div>

            <div className="bg-blue-50/25 border border-blue-100 rounded-2xl p-4 text-left">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">เป้าหมายดัชนีความสำเร็จ (Deliverable Outcome)</span>
              <p className="text-xs leading-relaxed text-slate-700 font-medium">
                {selectedItem.deliverable}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-6 py-2.5 bg-[#212c46] hover:bg-[#3f809e] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                닫기 / Close Close
              </button>
            </div>
          </div>
        )}
      </DraggableModal>

      {/* FLOAT GUIDE PANEL */}
      <UserGuideButton onClick={() => setIsGuideOpen(true)} />
      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
