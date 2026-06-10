import React, { useState, useEffect, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { SchemaAwareDataService } from '../../services/schemaAwareDataService';
import { DraggableModal } from '../../components/shared/DraggableModal';
import KpiCard from '../../components/shared/KpiCard';
import { useLanguage } from '../../context/LanguageContext';
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

export default function PublicSeminar() {
  const { t } = useLanguage();
  const [seminars, setSeminars] = useState<PublicSeminar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Filter lists
  const filteredSeminars = useMemo(() => {
    return seminars.filter(s => {
      const matchSearch =
        s.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.organizer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'All' ? true : s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [seminars, searchTerm, statusFilter]);

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
    window.print();
  };

  return (
    <div className="flex-1 px-4 sm:px-8 py-6 bg-[#f3f3f1] font-sans text-left min-h-screen">
      {/* Header section */}
      <div className="pb-5 mb-5 border-b border-[#eaeaec] relative overflow-hidden">
        <div className="absolute right-[-5%] bottom-[-30%] opacity-10 pointer-events-none transform -rotate-12 text-[#212c46]">
          <Icons.BookmarkCheck size={150} />
        </div>
        <div className="relative z-10 text-left">
          <p className="text-[10px] text-[#b58c4f] font-black uppercase tracking-widest leading-none">PROFESSIONAL KNOWLEDGE ACCOMMODATION</p>
          <h1 className="text-2xl font-black tracking-tight uppercase mt-1 text-[#212c46]">PUBLIC & SEMINAR ENROLLMENT</h1>
          <p className="text-[#7a8b95] text-[11px] mt-1 uppercase tracking-widest font-bold">
            customized external courses, professional summits, and national compliance workshops
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

      {/* Control Panel */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-3 justify-between items-center mb-6">
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses, employee, or organizer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-80 pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            <Icons.Search size={14} className="absolute left-3 top-3 text-slate-400" />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="All">All statuses</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Attended">Attended</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            onClick={triggerPrintLogging}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-widest rounded-lg border border-slate-200 hover:bg-slate-200 cursor-pointer transition-colors"
          >
            <Icons.Printer size={13} />
            Print Report
          </button>

          <button
            onClick={() => {
              setCurrentSeminar({});
              setIsEditing(false);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-2.5 bg-[#212c46] text-[#b58c4f] font-extrabold uppercase text-[10px] tracking-widest rounded-lg border border-[#b58c4f]/20 hover:bg-[#b58c4f] hover:text-[#212c46] cursor-pointer transition-all shadow-md active:scale-95"
          >
            <Icons.Plus size={13} />
            Request Pass
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs">
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
    </div>
  );
}
