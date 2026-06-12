import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';
import * as Icons from 'lucide-react';
import { Database, RefreshCw, Settings2, ShieldAlert, Play, Clock, Activity, CheckCircle2, XCircle } from 'lucide-react';
import UserGuideButton from '../../components/shared/UserGuideButton';
import { SyncStatusBadge, SyncState } from '../../components/shared/SyncStatusBadge';

function UserGuidePanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <>
      <div className={`fixed inset-0 z-[190] bg-[#212c46]/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed inset-y-0 right-0 z-[200] w-full md:w-[500px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col border-l-4 border-[#b7a159] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="bg-[#212c46] px-8 py-5 flex justify-between items-center text-white shrink-0 border-b border-[#414757] shadow-sm relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white shadow-inner border border-white/20"><Icons.BookOpen size={20} /></div>
            <div>
              <h3 className="text-xl font-black flex items-center gap-2 uppercase tracking-widest leading-none mb-1 drop-shadow-sm font-sans">USER GUIDE</h3>
              <p className="text-[10px] font-bold text-white/85 uppercase tracking-widest leading-none mt-1 drop-shadow-sm font-sans">AUTO-SYNC GUIDE</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all text-white/70 hover:text-white cursor-pointer"><Icons.X size={20}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8 text-[#414757] text-[12px] leading-relaxed custom-scrollbar bg-white">
          {/* Section 3: Recommendations */}
          <section className="animate-fadeIn animate-duration-300">
            <div className="space-y-4 text-[12px] font-medium leading-relaxed text-left">
              <p className="text-[#414757] font-semibold">คำแนะนำสำหรับการดูแลทรัพยากร API ของแอปพลิเคชัน:</p>
              <ul className="space-y-4 text-[#414757] pl-1">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#b7a159] text-base leading-none translate-y-[-2px]">•</span>
                  <div>
                    <strong className="text-[#212c46] font-bold">Employees / SystemConfig</strong>{' '}
                    แนะนำให้สวิตช์ Toggle ON ไว้เสมอเพื่อหลีกเลี่ยงความล่าช้าในการดึงข้อมูลหลักและค่ากำหนดทางธุรกรรม
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#b7a159] text-base leading-none translate-y-[-2px]">•</span>
                  <div>
                    <strong className="text-[#212c46] font-bold">ProductionRecords / QualityMetrics</strong>{' '}
                    หากระบบไม่ได้ใช้กลุ่มงานผลิตหรือคิวโปรดักชั่นเป็นประจำ สามารถเลือกปิดซิงค์เพื่อลดภาระงานเขียนแผ่นสเปรดชีตและประหยัด API Limit ของทางฝั่ง Google Cloud ได้
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4: Sync Interval Settings */}
          <section className="animate-fadeIn animate-duration-300 border-t border-[#eaeaec] pt-6" style={{ animationDelay: '0.1s' }}>
            <h4 className="text-[14px] font-black text-[#212c46] mb-4 uppercase flex items-center gap-2.5 tracking-wider font-mono">
              <Icons.Clock size={16} className="text-purple-600 shrink-0"/> 4. SYNC INTERVAL SETTINGS
            </h4>
            <div className="space-y-4 text-[12px] font-medium leading-relaxed text-left">
              <p className="text-[#414757]">กำหนดความถี่ที่ระบบจะทำงานตรวจสอบและเชื่อมข้อมูลโดยอัตโนมัติ:</p>
              <ul className="space-y-3.5 text-[#414757] pl-1">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#b7a159] text-base leading-none translate-y-[-2px]">•</span>
                  <div>
                    <strong className="text-[#212c46] font-bold">30 Mins:</strong>{' '}
                    เหมาะสำหรับเวลาทำการปกติที่มีการเคลื่อนไหวของธุรกรรมสูง
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#b7a159] text-base leading-none translate-y-[-2px]">•</span>
                  <div>
                    <strong className="text-[#212c46] font-bold">Hourly:</strong>{' '}
                    ระดับพื้นฐาน แนะนำสำหรับระบบที่มีผู้ใช้น้อยลง
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#b7a159] text-base leading-none translate-y-[-2px]">•</span>
                  <div>
                    <strong className="text-[#212c46] font-bold">Daily:</strong>{' '}
                    สำหรับข้อมูลประเภทเก็บถาวรหรือระบบสำรองเท่านั้น
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5: Conflict Resolution */}
          <section className="animate-fadeIn animate-duration-300 border-t border-[#eaeaec] pt-6" style={{ animationDelay: '0.2s' }}>
            <h4 className="text-[14px] font-black text-[#212c46] mb-4 uppercase flex items-center gap-2.5 tracking-wider font-mono">
              <Icons.AlertTriangle size={16} className="text-amber-500 shrink-0"/> 5. CONFLICT RESOLUTION
            </h4>
            <div className="space-y-4 text-[12px] font-medium leading-relaxed text-left">
              <p className="text-[#414757]">เมื่อพบว่ามีการแก้ไขข้อมูลที่จุดเดียวกัน ทั้งบนเว็บแอปพลิเคชันและใน Google Sheets ระบบจะแสดงรายการข้อขัดแย้ง (Data Conflicts) เพื่อให้คุณตัดสินใจเลือก:</p>
              <ul className="space-y-3.5 text-[#414757] pl-1">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#b7a159] text-base leading-none translate-y-[-2px]">•</span>
                  <div>
                    <strong className="text-[#212c46] font-bold">Keep Local:</strong>{' '}
                    บังคับใช้ข้อมูลบนเว็บนี้ และไปเขียนทับแผ่นงานบน Sheets
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#b7a159] text-base leading-none translate-y-[-2px]">•</span>
                  <div>
                    <strong className="text-[#212c46] font-bold">Overwrite:</strong>{' '}
                    ดึงข้อมูลดั้งเดิมจาก Sheets มาเขียนทับประวัติที่ขัดแย้งบนเว็บ
                  </div>
                </li>
              </ul>
            </div>
          </section>
        </div>
        
        <div className="p-5 bg-[#f8f9fa] border-t border-[#eaeaec] flex justify-between items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">SYSTEM MANUAL V4.0</span>
          <button onClick={onClose} className="px-7 py-2.5 bg-[#212c46] hover:bg-[#3f809e] text-white font-black rounded-lg uppercase text-[11px] transition-all shadow-md tracking-[0.1em] cursor-pointer">รับทราบ (Got it)</button>
        </div>
      </div>
    </>,
    document.body
  );
}

const formatSyncTime = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const h = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${h}:${m}:${s}`;
};

const formatFullDate = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = pad(date.getDate());
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const h = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${day} ${month} ${year}, ${h}:${m}:${s}`;
};

export default function BackgroundAutoSync() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [syncConfig, setSyncConfig] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('cfg_sync_toggles');
    return saved ? JSON.parse(saved) : {
      'Employees': true,
      'CalendarEvents': true,
      'Leaves': true,
      'SystemConfig': true,
      'ProductionRecords': false,
      'QualityMetrics': false
    };
  });

  const [sheetStatuses, setSheetStatuses] = useState<Record<string, SyncState>>({});
  const [activityLogs, setActivityLogs] = useState<{ id: string; sheet: string; status: 'success' | 'failure'; timestamp: Date }[]>([
      { id: 'mock-1', sheet: 'Employees', status: 'success', timestamp: new Date(Date.now() - 1000 * 60 * 5) }
  ]);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());
  const [pendingItemsCount, setPendingItemsCount] = useState(3);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  // Sync automated intervals state
  const [activeInterval, setActiveInterval] = useState<string>(() => {
    return localStorage.getItem('cfg_sync_interval') || '30m';
  });
  const [customTime, setCustomTime] = useState<string>(() => {
    return localStorage.getItem('cfg_sync_custom_time') || '08:00';
  });
  const [nextSyncTimeDisplay, setNextSyncTimeDisplay] = useState<string>('');

  // Data Conflicts state definition
  const [conflicts, setConflicts] = useState<Array<{
    id: string;
    module: string;
    recordKey: string;
    recordName: string;
    field: string;
    localValue: string;
    cloudValue: string;
    status: 'pending' | 'resolved-local' | 'resolved-cloud';
    resolving: boolean;
  }>>([
    {
      id: 'conflict-1',
      module: 'Employees',
      recordKey: 'EMP-1024',
      recordName: 'Sompong Jaidee (สมพงษ์ ใจดี)',
      field: 'Base Salary',
      localValue: '45,000 THB',
      cloudValue: '42,500 THB',
      status: 'pending',
      resolving: false
    },
    {
      id: 'conflict-2',
      module: 'Leaves',
      recordKey: 'LV-449',
      recordName: 'Anong Srisai (อนงค์ ศรีใส)',
      field: 'Leave Balance (Annual)',
      localValue: '8 days',
      cloudValue: '10 days',
      status: 'pending',
      resolving: false
    },
    {
      id: 'conflict-3',
      module: 'SystemConfig',
      recordKey: 'SYS-CFG',
      recordName: 'OT System Limit Flag',
      field: 'Weekly Max OT Limit',
      localValue: '36 hours',
      cloudValue: '48 hours',
      status: 'pending',
      resolving: false
    }
  ]);

  useEffect(() => {
    calculateNextSync();
  }, [activeInterval, customTime, lastSyncTime]);

  const calculateNextSync = () => {
    const now = new Date();
    if (activeInterval === '15m') {
      const next = new Date(now.getTime() + 15 * 60 * 1000);
      setNextSyncTimeDisplay(formatSyncTime(next));
    } else if (activeInterval === '30m') {
      const next = new Date(now.getTime() + 30 * 60 * 1000);
      setNextSyncTimeDisplay(formatSyncTime(next));
    } else if (activeInterval === '1h') {
      const next = new Date(now.getTime() + 60 * 60 * 1000);
      setNextSyncTimeDisplay(formatSyncTime(next));
    } else if (activeInterval === 'daily') {
      const [hours, minutes] = customTime.split(':').map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);
      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1);
      }
      setNextSyncTimeDisplay(formatFullDate(target));
    }
  };

  const handleSaveIntervalSetting = (interval: string, timeVal?: string) => {
    const selectedInt = interval;
    const timeToSave = timeVal !== undefined ? timeVal : customTime;
    
    setActiveInterval(selectedInt);
    localStorage.setItem('cfg_sync_interval', selectedInt);
    
    if (timeVal !== undefined) {
      setCustomTime(timeVal);
      localStorage.setItem('cfg_sync_custom_time', timeVal);
    }

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Automated sync interval updated successfully',
      showConfirmButton: false,
      timer: 2000,
      background: '#f8f9fa'
    });
  };

  const handleResolveConflict = (conflictId: string, resolution: 'keep-local' | 'overwrite') => {
    setConflicts(prev => prev.map(c => {
      if (c.id === conflictId) {
        return { ...c, resolving: true };
      }
      return c;
    }));

    setTimeout(() => {
      setConflicts(prev => prev.map(c => {
        if (c.id === conflictId) {
          return {
            ...c,
            resolving: false,
            status: resolution === 'keep-local' ? 'resolved-local' : 'resolved-cloud'
          };
        }
        return c;
      }));

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: resolution === 'keep-local'
          ? 'Completed! Maintained local Web database revision.'
          : 'Completed! Overwrote local revision with Google Sheets value.',
        showConfirmButton: false,
        timer: 3000,
        background: '#f8f9fa'
      });
    }, 1200);
  };

  const handleRefreshAll = () => {
    setIsRefreshingAll(true);
    let delays = 0;
    
    Object.keys(syncConfig).forEach((sheetName, index) => {
      setTimeout(() => {
        handleTestConnection(sheetName);
      }, delays);
      delays += 800; // stagger the checks
    });

    setTimeout(() => {
       setIsRefreshingAll(false);
    }, delays + 1500);
  };

  const handleToggleSync = (sheetName: string, value: boolean) => {
    const newConfig = { ...syncConfig, [sheetName]: value };
    setSyncConfig(newConfig);
    localStorage.setItem('cfg_sync_toggles', JSON.stringify(newConfig));
    
    if (!value) {
        setSheetStatuses(prev => ({ ...prev, [sheetName]: 'disconnected' }));
    }

    // Optional notification
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: value ? 'success' : 'info',
      title: `${value ? 'Enabled' : 'Disabled'} auto-sync for ${sheetName}`,
      showConfirmButton: false,
      timer: 2000,
      background: '#f8f9fa'
    });
  };

  const handleTestConnection = (sheetName: string) => {
    setSheetStatuses(prev => ({ ...prev, [sheetName]: 'testing' }));
    
    setTimeout(() => {
      const isSuccess = Math.random() > 0.2; // 80% chance of success for demo
      setSheetStatuses(prev => ({ ...prev, [sheetName]: isSuccess ? 'connected' : 'error' }));
      
      setActivityLogs(prev => [{
        id: Math.random().toString(36).substring(2, 9),
        sheet: sheetName,
        status: isSuccess ? 'success' : 'failure',
        timestamp: new Date()
      }, ...prev].slice(0, 10)); // keep last 10
      
      if (isSuccess) {
         setLastSyncTime(new Date());
         setPendingItemsCount(prev => Math.max(0, prev - 1));
      }
    }, 1500);
  };


  return (
    <div className="pt-4 pb-8 flex flex-col space-y-4 animate-fadeIn px-4 sm:px-8 w-full">
      {/* USER GUIDE FLOATING TAB */}
      <UserGuideButton onClick={() => setIsGuideOpen(true)} />

      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Title Header */}
      <div className="flex flex-row justify-between items-center py-2 min-h-14">
        <div className="text-left">
          <h1 className="text-2xl font-black text-[#212c46] tracking-tight uppercase flex items-center gap-3">
            <RefreshCw size={28} className="text-emerald-600 shrink-0" />
            <span>Background Auto-Sync / การซิงค์อัตโนมัติ</span>
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase mt-1 text-left">
            MANAGE BACKGROUND AUTOMATION AND DATA SYNCHRONIZATION SCHEDULES.
          </p>
        </div>
        <button 
           onClick={handleRefreshAll}
           disabled={isRefreshingAll}
           className="hidden sm:flex items-center gap-2 bg-[#1d2636] hover:bg-[#3f809e] text-white px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
           <RefreshCw size={14} className={isRefreshingAll ? "animate-spin" : ""} />
           {isRefreshingAll ? "Syncing..." : "Refresh All"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white px-6 py-6 rounded-2xl border border-[#eaeaec] shadow-sm flex flex-col justify-between min-h-[120px] relative overflow-hidden group hover:border-emerald-500 transition-all md:col-span-1 text-left">
          <div className="absolute -right-4 -bottom-4 opacity-[0.05] pointer-events-none transform group-hover:scale-105 transition-transform duration-700 text-emerald-600">
            <RefreshCw size={110} />
          </div>
          <div className="relative z-10 flex justify-between items-start">
            <p className="text-[11px] font-black text-[#7a8b95] uppercase tracking-wider">Configured Modules</p>
            <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 bg-emerald-50 border-emerald-200 text-emerald-600`}>
              <Database size={18} />
            </div>
          </div>
          <div className="relative z-10 mt-3">
            <p className="text-2xl font-black text-[#212c46] leading-none">
              {Object.keys(syncConfig).length}
            </p>
            <p className="text-[10px] font-bold text-[#7a8b95] uppercase mt-1 tracking-wider">
              Total Sheets Configured
            </p>
          </div>
        </div>

        <div className="bg-white px-6 py-6 rounded-2xl border border-[#eaeaec] shadow-sm flex flex-col justify-between min-h-[120px] relative overflow-hidden group hover:border-[#b58c4f] transition-all md:col-span-1">
            <div className="absolute -right-4 -bottom-4 opacity-[0.05] pointer-events-none transform group-hover:scale-105 transition-transform duration-700 text-[#b58c4f]">
              <Clock size={110} />
            </div>
            <div className="relative z-10 flex justify-between items-start">
              <p className="text-[11px] font-black text-[#7a8b95] uppercase tracking-wider">Last Sync Time</p>
              <div className="p-2.5 rounded-xl border flex items-center justify-center shrink-0 bg-amber-50 border-amber-200 text-amber-600">
                <Clock size={18} />
              </div>
            </div>
            <div className="relative z-10 mt-3 text-left">
              <p className="text-xl font-black text-[#212c46] leading-none">
                {lastSyncTime ? formatSyncTime(lastSyncTime) : '--:--:--'}
              </p>
              <p className="text-[10px] font-bold text-[#7a8b95] uppercase mt-1 tracking-wider max-w-sm">
                System Time UTC+7
              </p>
            </div>
        </div>

        <div className="bg-white px-6 py-6 rounded-2xl border border-[#eaeaec] shadow-sm flex flex-col justify-between min-h-[120px] relative overflow-hidden group hover:border-[#3f809e] transition-all md:col-span-1">
            <div className="absolute -right-4 -bottom-4 opacity-[0.05] pointer-events-none transform group-hover:scale-105 transition-transform duration-700 text-[#3f809e]">
              <Activity size={110} />
            </div>
            <div className="relative z-10 flex justify-between items-start">
              <p className="text-[11px] font-black text-[#7a8b95] uppercase tracking-wider">Pending Items</p>
              <div className="p-2.5 rounded-xl border flex items-center justify-center shrink-0 bg-blue-50 border-blue-200 text-[#3f809e]">
                <Activity size={18} />
              </div>
            </div>
            <div className="relative z-10 mt-3 text-left">
              <p className="text-xl font-black text-[#212c46] leading-none">
                {pendingItemsCount} queues
              </p>
              <p className="text-[10px] font-bold text-[#7a8b95] uppercase mt-1 tracking-wider max-w-sm">
                Awaiting Next Cycle
              </p>
            </div>
        </div>
      </div>

      {/* AUTOSYNC CONFIGURATION & TOGGLES SPLIT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        
        {/* LEFT COLUMN: CUSTOM AUTOMATED INTERVAL CONFIGURATION */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#eaeaec] shadow-sm space-y-5 lg:col-span-1 text-left flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[#b58c4f] shrink-0 shadow-sm">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-[14px] sm:text-[16px] font-black text-[#212c46] uppercase tracking-wider">
                  Automated Interval
                </h3>
                <p className="text-[11px] font-bold text-[#7a8b95] mt-0.5 uppercase">
                  กำหนดรอบเวลาอัปเดตข้อมูลอัตโนมัติ
                </p>
              </div>
            </div>

            <p className="text-xs text-[#414757] leading-relaxed">
              เลือกความถี่ที่ต้องการให้ระบบหลักติดต่อและดึงข้อมูลจาก Google Sheets ของคุณ เพื่อรักษาเสถียรภาพและไม่ให้ติดโควต้า API ของผู้ใช้งานอื่น
            </p>

            <div className="space-y-2 mt-2">
              {[
                { key: '15m', label: 'Every 15 Minutes', th: 'ทุก ๆ 15 นาที' },
                { key: '30m', label: 'Every 30 Minutes', th: 'ทุก ๆ 30 นาที' },
                { key: '1h', label: 'Hourly', th: 'ทุก ๆ 1 ชั่วโมง' },
                { key: 'daily', label: 'Daily (Custom Time)', th: 'ซิงค์รายวัน (กำหนดเวลา)' }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleSaveIntervalSetting(item.key)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    activeInterval === item.key
                      ? 'bg-emerald-50/60 border-emerald-500 text-emerald-900 font-extrabold shadow-sm'
                      : 'bg-white border-[#eaeaec] text-[#414757] hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${activeInterval === item.key ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'}`}>
                      {activeInterval === item.key && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider leading-none mb-0.5">{item.label}</p>
                      <p className="text-[10px] text-[#7a8b95] font-semibold">{item.th}</p>
                    </div>
                  </div>
                  {item.key === 'daily' && <Icons.CalendarClock size={16} className={`${activeInterval === 'daily' ? 'text-emerald-600' : 'text-slate-300'}`} />}
                </button>
              ))}
            </div>

            {/* Custom Time Selector (Time-picker component) */}
            {activeInterval === 'daily' && (
              <div className="pt-3 border-t border-dashed border-[#eaeaec] animate-fadeIn">
                <label className="block text-[10px] font-black text-[#212c46] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Icons.Timer size={12} className="text-[#b58c4f]" />
                  Select Daily Sync Time / กำหนดเวลาซิงค์รายวัน
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Icons.Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input 
                      type="time" 
                      value={customTime} 
                      onChange={(e) => handleSaveIntervalSetting('daily', e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-[#eaeaec]/80 rounded-xl text-xs font-mono font-bold text-[#212c46] bg-white transition-all hover:border-[#b58c4f] focus:outline-none focus:ring-1 focus:ring-[#b58c4f] cursor-pointer"
                    />
                  </div>
                </div>
                <p className="text-[9px] text-[#7a8b95] mt-1 font-bold uppercase">ระบุเวลาสเก็ตจูเลอร์ (GMT+7) แนะนำเป็นเวลาพักเที่ยงหรือหลังเลิกงาน</p>
              </div>
            )}
          </div>

          {/* Next Scheduled Sync indicators */}
          <div className="pt-4 border-t border-[#eaeaec] mt-5">
            <div className="bg-[#1d2636] text-white p-4 rounded-xl flex items-start gap-3 shadow-inner">
              <Icons.ShieldCheck size={20} className="text-emerald-400 mt-1 shrink-0 animate-pulse" />
              <div className="text-left">
                <p className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">Next Run Scheduled At</p>
                <p className="text-[13px] font-mono font-bold tracking-tight mt-1">{nextSyncTimeDisplay}</p>
                <p className="text-[9px] font-bold text-[#7a8b95] uppercase mt-1 leading-normal">
                  AUTOMATED MICRO-JOB SCHEDULER ACTIVE
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BACKGROUND TOGGLES & TEST BLOCK (Span 2) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#eaeaec] shadow-sm space-y-4 lg:col-span-2 text-left">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 shrink-0 shadow-sm">
              <RefreshCw size={20} />
            </div>
            <div>
              <h3 className="text-[14px] sm:text-[16px] font-black text-[#212c46] uppercase tracking-wider flex items-center gap-2">
                <span>Background Auto-Sync</span>
              </h3>
              <p className="text-[12px] font-bold text-[#7a8b95] mt-1 leading-relaxed">
                การตั้งค่าแผนงานเชื่อมโยงไปยัง Google Sheets ราย Module
              </p>
            </div>
          </div>
          
          <div className="bg-slate-50/50 p-4 rounded-xl border border-[#eaeaec]/60">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(syncConfig).map(([sheetName, isEnabled]) => {
                const status = sheetStatuses[sheetName];
                return (
                  <div key={sheetName} className="flex flex-col gap-3 p-4 bg-white border border-[#eaeaec] rounded-xl shadow-sm transition-all hover:border-[#b58c4f]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Database size={16} className={isEnabled ? "text-emerald-500" : "text-slate-300"} />
                        <span className={`text-[12px] font-black uppercase tracking-wider ${isEnabled ? "text-[#212c46]" : "text-slate-400"}`}>
                          {sheetName}
                        </span>
                        
                        {/* Status Badges */}
                        <SyncStatusBadge status={status || 'idling'} className="hidden sm:inline-flex" />
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={isEnabled}
                          onChange={(e) => handleToggleSync(sheetName, e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <button 
                        onClick={() => handleTestConnection(sheetName)} 
                        disabled={status === 'testing'}
                        className="text-[10px] font-bold uppercase tracking-widest text-[#3f809e] hover:text-white border-[#3f809e] border hover:bg-[#3f809e] transition-all flex items-center gap-1.5 px-3 py-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                         {status === 'testing' ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
                         Test Connection
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sync Activity Log Table */}
      <div className="mt-4 bg-white rounded-2xl border border-[#eaeaec] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#eaeaec] text-left">
          <h3 className="text-[14px] sm:text-[16px] font-black text-[#212c46] uppercase tracking-wider flex items-center gap-2">
             <Activity size={18} className="text-[#3f809e]" />
             <span>Sync Activity Log</span>
          </h3>
          <p className="text-[12px] font-bold text-[#7a8b95] uppercase mt-1">ประวัติการซิงโครไนซ์ข้อมูลล่าสุด</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#eaeaec]">
                <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-[#7a8b95]">Timestamp</th>
                <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-[#7a8b95]">Sheet / Module</th>
                <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-[#7a8b95]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaec] bg-white">
              {activityLogs.length > 0 ? (
                activityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 whitespace-nowrap text-[12px] font-bold text-[#414757]">
                      {formatFullDate(log.timestamp)}
                    </td>
                    <td className="py-3 px-5 whitespace-nowrap text-[12px] font-bold text-[#212c46]">
                      {log.sheet}
                    </td>
                    <td className="py-3 px-5 whitespace-nowrap">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 border border-emerald-100 text-emerald-700 uppercase tracking-widest">
                          <CheckCircle2 size={12} /> Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 border border-rose-100 text-rose-700 uppercase tracking-widest">
                          <XCircle size={12} /> Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-[12px] font-bold text-[#7a8b95] uppercase tracking-widest">
                    No activity logs recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sync Data Conflicts Board */}
      <div className="mt-4 bg-white rounded-2xl border border-[#eaeaec] shadow-sm overflow-hidden text-left animate-fadeIn">
        <div className="p-5 border-b border-[#eaeaec] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-[14px] sm:text-[16px] font-black text-[#212c46] uppercase tracking-wider flex items-center gap-2">
               <ShieldAlert size={18} className="text-amber-500" />
               <span>Sync Data Conflicts Board / กระดานตรวจสอบสิทธิ์เขียนทับ</span>
            </h3>
            <p className="text-[12px] font-bold text-[#7a8b95] uppercase mt-1">พบค่าความขัดแย้งของข้อมูลระหว่างเว็บไคลเอนต์และ Google Sheets</p>
          </div>
          <span className="bg-amber-50 text-amber-800 border border-amber-200 uppercase font-black text-[10px] py-1 px-3 rounded-md tracking-wider">
            {conflicts.filter(c => c.status === 'pending').length} pending conflicts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#eaeaec]">
                <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-[#7a8b95]">Module & Primary Key</th>
                <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-[#7a8b95]">Conflicting Field</th>
                <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-[#7a8b95]">Web Revision (Local)</th>
                <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-[#7a8b95]">Sheets Revision (Cloud)</th>
                <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-[#7a8b95] text-center">Resolution Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaec] bg-white">
              {conflicts.map((conflict) => (
                <tr key={conflict.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-5 text-[12px] font-bold text-[#212c46]">
                    <div className="flex flex-col">
                      <span className="uppercase text-[9px] text-[#7a8b95] font-bold tracking-wider leading-none mb-1">{conflict.module}</span>
                      <span className="text-[#3f809e] font-black text-[11px] leading-tight">{conflict.recordKey}</span>
                      <span className="text-slate-500 text-[11px] font-medium leading-normal">{conflict.recordName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-[11px] font-mono font-bold text-[#b7a159] uppercase whitespace-nowrap">
                    {conflict.field}
                  </td>
                  <td className="py-4 px-5 text-[12px] font-bold text-emerald-700 bg-emerald-50/20 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Icons.CheckCircle size={14} className="text-emerald-500 shrink-0" />
                      <span>{conflict.localValue}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-[12px] font-bold text-[#4d87a8] bg-[#d7d7d7]/10 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Icons.Cloud size={14} className="text-[#3f809e] shrink-0" />
                      <span>{conflict.cloudValue}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    {conflict.status === 'pending' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          disabled={conflict.resolving}
                          onClick={() => handleResolveConflict(conflict.id, 'keep-local')}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                          {conflict.resolving ? <Icons.RotateCw size={12} className="animate-spin" /> : <Icons.ShieldAlert size={12} />}
                          Keep Local
                        </button>
                        <button
                          disabled={conflict.resolving}
                          onClick={() => handleResolveConflict(conflict.id, 'overwrite')}
                          className="px-3 py-1.5 bg-[#212c46] hover:bg-[#3f809e] text-white rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                          {conflict.resolving ? <Icons.RotateCw size={12} className="animate-spin" /> : <Icons.CloudUpload size={12} />}
                          Overwrite
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        {conflict.status === 'resolved-local' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Icons.CheckCircle2 size={12} /> Local Kept
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-[#212c46] border border-blue-200">
                            <Icons.CloudCheck size={12} /> Overwritten with Cloud
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
