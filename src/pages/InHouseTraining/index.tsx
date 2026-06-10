import React, { useState, useEffect, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { SchemaAwareDataService } from '../../services/schemaAwareDataService';
import { DraggableModal } from '../../components/shared/DraggableModal';
import KpiCard from '../../components/shared/KpiCard';
import { useLanguage } from '../../context/LanguageContext';
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

export default function InHouseTraining() {
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<InHouseSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchSearch = 
        s.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.trainerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'All' ? true : s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [sessions, searchTerm, statusFilter]);

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
    window.print();
  };

  return (
    <div className="flex-1 px-4 sm:px-8 py-6 bg-[#f3f3f1] font-sans text-left min-h-screen">
      {/* Header section representing the executive style */}
      <div className="pb-5 mb-5 border-b border-[#eaeaec] relative overflow-hidden">
        <div className="absolute right-[-5%] bottom-[-30%] opacity-10 pointer-events-none transform -rotate-12 text-[#212c46]">
          <Icons.GraduationCap size={150} />
        </div>
        <div className="relative z-10">
          <p className="text-[10px] text-[#b58c4f] font-black uppercase tracking-widest leading-none">TALENT DEVELOPMENT SUITE</p>
          <h1 className="text-2xl font-black tracking-tight uppercase mt-1 text-[#212c46]">IN-HOUSE TRAINING DIRECTORY</h1>
          <p className="text-[#7a8b95] text-[11px] mt-1 uppercase tracking-widest font-bold">
            internal capability coaching, safety certifications & organizational workshops
          </p>
        </div>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

      {/* Control bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-3 justify-between items-center mb-6">
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by course name or trainer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-80 pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#212c46]/20 focus:border-[#212c46]"
            />
            <Icons.Search size={14} className="absolute left-3 top-3 text-slate-400" />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            onClick={triggerPrintLogging}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-widest rounded-lg border border-slate-200 hover:bg-slate-200 select-all cursor-pointer transition-colors"
          >
            <Icons.Printer size={13} />
            Print Report
          </button>
          
          <button
            onClick={() => {
              setCurrentSession({});
              setIsEditing(false);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-2.5 bg-[#212c46] text-[#b58c4f] font-extrabold uppercase text-[10px] tracking-widest rounded-lg border border-[#b58c4f]/20 hover:bg-[#b58c4f] hover:text-[#212c46] cursor-pointer transition-all shadow-md active:scale-95"
          >
            <Icons.Plus size={13} />
            Add Session (Auto-Provision)
          </button>
        </div>
      </div>

      {/* Main training table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs">
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
    </div>
  );
}
