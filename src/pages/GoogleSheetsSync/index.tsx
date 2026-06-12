import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { initGoogleAuth, googleSignIn, logoutGoogle } from '../../services/googleAuth';
import { 
  Database,
  Globe, 
  Key, 
  Save, 
  Loader2, 
  ShieldAlert, 
  Timer, 
  Info, 
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  UserCheck,
  RefreshCw
} from 'lucide-react';

export default function GoogleSheetsSync() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState(() => {
    return localStorage.getItem('cfg_target_spreadsheet_id') || '1L7smTyoFDIRaQk-NDivYTMwgQ52V4ezSfagWOIR6x0s';
  });
  const [isFormatting, setIsFormatting] = useState(false);
  const [formatLogs, setFormatLogs] = useState<string[]>([]);

  // --- Apps Script Web App Connection Override States ---
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(() => {
    return localStorage.getItem('cfg_apps_script_url') || 
           import.meta.env.VITE_APPS_SCRIPT_URL || 
           "https://script.google.com/macros/s/AKfycbx3DLqU1OH1AtUnZnRBzte6JaIiL5Yw29wVfUQDrXCuV17uTY4noGoaAO5sn4dvR-CHQg/exec";
  });

  const [appsScriptApiKey, setAppsScriptApiKey] = useState<string>(() => {
    return localStorage.getItem('cfg_apps_script_api_key') || 
           import.meta.env.VITE_API_KEY || 
           "your_secret_key_here";
  });

  // --- Session Timeout Control States ---
  const [cfgSessionDuration, setCfgSessionDuration] = useState<number>(() => {
    const saved = localStorage.getItem('cfg_session_duration_sec');
    return saved ? parseInt(saved, 10) : 3600; // default 1 hour
  });

  const [cfgWarnThreshold, setCfgWarnThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('cfg_warn_threshold_sec');
    return saved ? parseInt(saved, 10) : 120; // default 2 mins
  });

  // Observe and connect Google Account session and scope access token
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (authUser, token) => {
        setUser(authUser);
        setAuthToken(token);
      },
      () => {
        setUser(null);
        setAuthToken(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSaveAppsScriptConfig = () => {
    if (!appsScriptUrl.trim()) {
      Swal.fire('ข้อผิดพลาด', 'กรุณาระบุ Google Apps Script Web App URL ด้วยค่ะ', 'error');
      return;
    }
    localStorage.setItem('cfg_apps_script_url', appsScriptUrl.trim());
    localStorage.setItem('cfg_apps_script_api_key', appsScriptApiKey.trim());

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'บันทึกการตั้งค่า Apps Script Web App สำเร็จ!',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  };

  const handleUpdateSessionConfig = (newDuration: number, newThreshold: number) => {
    if (newThreshold >= newDuration) {
      Swal.fire({
        icon: 'error',
        title: 'กำหนดช่วงเวลาแจ้งเตือนไม่ถูกต้อง',
        text: 'หน้าต่างแจ้งเตือนเซสชันหมดอายุต้องสั้นกว่าเวลารวมเซสชันสูงสุดนะคะ',
        confirmButtonColor: '#932c2e'
      });
      return;
    }

    setCfgSessionDuration(newDuration);
    setCfgWarnThreshold(newThreshold);
    localStorage.setItem('cfg_session_duration_sec', String(newDuration));
    localStorage.setItem('cfg_warn_threshold_sec', String(newThreshold));

    // Notify same window of configuration change
    window.dispatchEvent(new Event('session-config-updated'));

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'บันทึกเซสชันความปลอดภัยเรียบร้อยแล้วค่ะ',
      showConfirmButton: false,
      timer: 2000,
      background: '#f8f9fa'
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAuthToken(result.accessToken);
        Swal.fire({
          title: 'Signed In Successfully',
          text: `Connected to Google Account: ${result.user.email}`,
          icon: 'success',
          confirmButtonColor: '#212c46'
        });
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      Swal.fire({
        title: 'Authentication Failed',
        text: error.message || 'Could not authenticate with Google.',
        icon: 'error',
        confirmButtonColor: '#932c2e'
      });
    }
  };

  const handleDisconnect = async () => {
    const result = await Swal.fire({
      title: 'Disconnect Google Account?',
      text: 'This will clear the current Google Sheets access token session.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#932c2e',
      cancelButtonColor: '#7a8b95',
      confirmButtonText: 'Yes, Disconnect'
    });

    if (result.isConfirmed) {
      await logoutGoogle();
      setUser(null);
      setAuthToken(null);
      Swal.fire('Disconnected', 'Successfully signed out from Google account.', 'success');
    }
  };

  const handleRunSetup = async () => {
    if (!spreadsheetId.trim()) {
      Swal.fire('Error', 'Please enter a valid Spreadsheet ID', 'error');
      return;
    }

    // Persist sheets spread ID
    localStorage.setItem('cfg_target_spreadsheet_id', spreadsheetId.trim());

    if (!authToken) {
      Swal.fire('Authentication Required', 'Please Sign in with Google first to authorize formatting.', 'warning');
      return;
    }

    const confirmed = await Swal.fire({
      title: 'Initialize Sheet Formatting?',
      text: 'This will construct table schemas, freeze headers, and apply layout styles to the target spreadsheet.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#b58c4f',
      cancelButtonColor: '#7a8b95',
      confirmButtonText: 'Confirm and Start'
    });

    if (!confirmed.isConfirmed) return;

    setIsFormatting(true);
    setFormatLogs(['Starting initialization flow...']);

    try {
      const log = (msg: string) => setFormatLogs(prev => [...prev, msg]);

      log('Fetching spreadsheet metadata details...');
      const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (!metaRes.ok) {
        throw new Error(`Invalid Spreadsheet ID or lacks permission: ${metaRes.statusText}`);
      }

      let meta = await metaRes.json();
      let existingSheets = meta.sheets || [];
      let existingSheetTitles = existingSheets.map((s: any) => s.properties.title);
      log(`Read spreadsheet: "${meta.properties?.title || 'SmartHR Database'}"`);
      log(`Found existing sheet tabs: [${existingSheetTitles.join(', ')}]`);

      const targetSheets = [
        { name: 'Employees', headers: ['ID', 'Employee ID', 'Name', 'Department', 'Position', 'Salary', 'Date Joined', 'Status', 'Avatar', 'Created At'] },
        { name: 'CalendarEvents', headers: ['id', 'date', 'title', 'time', 'type', 'priority', 'status', 'createdAt', 'updatedAt'] },
        { name: 'Leaves', headers: ['id', 'employeeName', 'type', 'startDate', 'endDate', 'days', 'reason', 'status', 'createdAt'] },
        { name: 'SystemConfig', headers: ['id', 'category', 'key', 'value', 'description', 'updatedAt'] }
      ];

      // Create missing sheets
      const addRequests: any[] = [];
      for (const target of targetSheets) {
        if (!existingSheetTitles.includes(target.name)) {
          log(`Adding missing tab section: ${target.name}`);
          addRequests.push({
            addSheet: {
              properties: {
                title: target.name
              }
            }
          });
        }
      }

      if (addRequests.length > 0) {
        const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ requests: addRequests })
        });
        if (!updateRes.ok) {
          throw new Error('Could not create missing tabs database.');
        }
        log('Created missing sheet tables successfully. Updating schema caches...');
        
        // Refresh metadata properties
        const updatedMetaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const updatedMeta = await updatedMetaRes.json();
        existingSheets = updatedMeta.sheets || [];
      }

      // Loop over sheets to clear, apply top-row headers, and decorate layout colors
      for (const target of targetSheets) {
        const sheetObj = existingSheets.find((s: any) => s.properties.title === target.name);
        if (!sheetObj) continue;
        const sheetId = sheetObj.properties.sheetId;

        log(`Formatting and injecting headers for tab: "${target.name}"`);

        // 1. Write the headers array at row index 0 (cell A1:Ix)
        const headerParams = {
          range: `${target.name}!A1:1`,
          valueInputOption: 'RAW',
        };
        const headerBody = {
          range: `${target.name}!A1:1`,
          majorDimension: 'ROWS',
          values: [target.headers]
        };

        const writeHeadersRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${target.name}!A1:1?valueInputOption=RAW`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(headerBody)
          }
        );

        if (!writeHeadersRes.ok) {
          throw new Error(`Failed to inject text headers in table ${target.name}: ${writeHeadersRes.statusText}`);
        }

        // 2. Decorate styles: freeze 1st row, paint cells background, and toggle bold text
        const decorateRequests = [
          // Clear styles / grids or set column alignments
          {
            updateSheetProperties: {
              properties: {
                sheetId: sheetId,
                gridProperties: {
                  frozenRowCount: 1
                }
              },
              fields: 'gridProperties.frozenRowCount'
            }
          },
          // Color formatting headers cells with (#304060 deep blue gradient alternative style)
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: target.headers.length
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 33/255,
                    green: 44/255,
                    blue: 70/255
                  },
                  textFormat: {
                    foregroundColor: {
                      red: 1.0,
                      green: 1.0,
                      blue: 1.0
                    },
                    fontSize: 10,
                    bold: true,
                    fontFamily: 'Arial'
                  },
                  horizontalAlignment: 'CENTER',
                  verticalAlignment: 'MIDDLE'
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
            }
          }
        ];

        const batchStyleRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ requests: decorateRequests })
        });

        if (!batchStyleRes.ok) {
          log(`⚠️ Styling decor notice: layout overrides on "${target.name}" warning.`);
        }
      }

      log('Sheet database initializing flow operations completed successfully!');
      Swal.fire({
        title: 'Initialization Succeeded',
        text: 'All missing system tables was instantiated and stylized on your target spreadsheet!',
        icon: 'success',
        confirmButtonColor: '#212c46'
      });
    } catch (err: any) {
      console.error(err);
      setFormatLogs(prev => [...prev, `❌ ERROR: ${err.message || 'Workflow exception process.'}`]);
      Swal.fire('Initialize Refused', err.message || 'General error code.', 'error');
    } finally {
      setIsFormatting(false);
    }
  };

  const activeAppScriptUrlStatus = useMemo(() => {
    return appsScriptUrl && appsScriptUrl.includes('/exec') ? 'ACTIVE' : 'PENDING';
  }, [appsScriptUrl]);

  return (
    <div className="pt-6 pb-12 flex flex-col gap-6 animate-fadeIn px-4 sm:px-8 w-full max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-4 border-b border-slate-100">
        <div className="text-left">
          <h1 className="text-2xl font-black text-[#212c46] tracking-tight uppercase flex items-center gap-3">
            <Database size={28} className="text-[#b58c4f] shrink-0" />
            <span>Google Sheets Sync Port / เครื่องมือเชื่อมโยงข้อมูล</span>
          </h1>
          <p className="text-xs text-slate-400 font-bold uppercase mt-1">
            Configure direct Google Apps Script micro-services and spreadsheet format templates.
          </p>
        </div>
        <button
          onClick={() => navigate('/settings/auto-sync')}
          className="flex items-center gap-2 bg-[#212c46] hover:bg-[#3f809e] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
        >
          <RefreshCw size={14} className="animate-pulse" />
          <span>Auto-Sync Status</span>
        </button>
      </div>

      {/* Standardized KPI Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white px-6 py-6 rounded-2xl border border-[#eaeaec] shadow-sm flex flex-col justify-between min-h-[120px] relative overflow-hidden group hover:border-[#b58c4f] transition-all">
          <div className="absolute -right-4 -bottom-4 opacity-[0.05] pointer-events-none transform group-hover:scale-105 transition-transform duration-700 text-[#212c46]">
            <Globe size={110} />
          </div>
          <div className="relative z-10 flex justify-between items-start">
            <p className="text-[11px] font-black text-[#7a8b95] uppercase tracking-wider">Apps Script Link Status</p>
            <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${activeAppScriptUrlStatus === 'ACTIVE' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
              <Globe size={18} />
            </div>
          </div>
          <div className="relative z-10 mt-3">
            <p className="text-2xl font-black text-[#212c46] leading-none">
              {activeAppScriptUrlStatus}
            </p>
            <p className="text-[10px] font-bold text-[#7a8b95] uppercase mt-1 tracking-wider">
              {appsScriptUrl ? 'URL custom configured' : 'Using default deployment'}
            </p>
          </div>
        </div>

        <div className="bg-white px-6 py-6 rounded-2xl border border-[#eaeaec] shadow-sm flex flex-col justify-between min-h-[120px] relative overflow-hidden group hover:border-[#b58c4f] transition-all">
          <div className="absolute -right-4 -bottom-4 opacity-[0.05] pointer-events-none transform group-hover:scale-105 transition-transform duration-700 text-[#b58c4f]">
            <UserCheck size={110} />
          </div>
          <div className="relative z-10 flex justify-between items-start">
            <p className="text-[11px] font-black text-[#7a8b95] uppercase tracking-wider">Google Authorization</p>
            <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${user ? 'bg-sky-50 border-sky-200 text-[#3f809e]' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              <UserCheck size={18} />
            </div>
          </div>
          <div className="relative z-10 mt-3">
            <p className="text-2xl font-black text-[#212c46] leading-none">
              {user ? 'AUTHENTICATED' : 'ANONYMOUS'}
            </p>
            <p className="text-[10px] font-bold text-[#7a8b95] uppercase mt-1 tracking-wider truncate max-w-xs">
              {user ? user.email : 'Click log in below to authorize setup'}
            </p>
          </div>
        </div>

        <div className="bg-white px-6 py-6 rounded-2xl border border-[#eaeaec] shadow-sm flex flex-col justify-between min-h-[120px] relative overflow-hidden group hover:border-[#b58c4f] transition-all">
          <div className="absolute -right-4 -bottom-4 opacity-[0.05] pointer-events-none transform group-hover:scale-105 transition-transform duration-700 text-[#3f809e]">
            <Lock size={110} />
          </div>
          <div className="relative z-10 flex justify-between items-start">
            <p className="text-[11px] font-black text-[#7a8b95] uppercase tracking-wider">Session Safety Duration</p>
            <div className="p-2.5 rounded-xl border bg-purple-50 border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
              <Lock size={18} />
            </div>
          </div>
          <div className="relative z-10 mt-3">
            <p className="text-2xl font-black text-[#212c46] leading-none">
              {(cfgSessionDuration / 60).toFixed(0)} MINS
            </p>
            <p className="text-[10px] font-bold text-[#7a8b95] uppercase mt-1 tracking-wider">
              Warning start point: {cfgWarnThreshold}s before expiry
            </p>
          </div>
        </div>
      </div>

      {/* Auto sync notice banner */}
      <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-fadeIn text-left">
        <div className="flex gap-3 items-start">
          <RefreshCw size={20} className="text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-black text-[#212c46] uppercase tracking-wider mb-0.5">ต้องการปรับตั้งค่าการซิงค์ข้อมูลเบื้องหลัง (Background Auto-Sync)?</h4>
            <p className="text-xs text-[#7a8b95] font-bold uppercase tracking-normal">คุณสามารถเปิด-ปิด การเชื่อมข้อมูลแยกตามตารางราย Module และทำการทดสอบคู่เชื่อมต่อสพาสชีตโดยตรงได้ง่ายดาย</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/settings/auto-sync')}
          className="flex items-center gap-2 bg-[#212c46] hover:bg-[#3f809e] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
        >
          <RefreshCw size={14} className="animate-spin" />
          <span>Auto-Sync Status Dashboard</span>
        </button>
      </div>

      {/* Main Core Form Block layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Column blocks */}
        <div className="space-y-6">
          {/* APPS SCRIPT CONNECTION CONFIGURATION */}
          <div className="bg-white p-8 rounded-2xl border border-[#eaeaec] shadow-sm space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-2xl text-[#3f809e] shrink-0 shadow-sm">
                <Globe size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-[18px] font-black text-[#212c46] uppercase tracking-wider flex items-center gap-2">
                  <span>Apps Script Web App Connection / ตั้งค่าเชื่อมโยง Apps Script</span>
                </h3>
                <p className="text-[12px] font-bold text-[#7a8b95] uppercase tracking-normal mt-1 leading-relaxed">
                  บันทึกและตั้งค่าลิงก์เชื่อมโยงไปยัง Apps Script Web App และคีย์ API เพื่อให้ระบบทำการสื่อสารข้อมูลและบันทึกกับ Google Sheets ได้อย่างต่อเนื่อง
                </p>
              </div>
            </div>
            
            <div className="space-y-4 bg-slate-50/50 p-6 rounded-2xl border border-[#eaeaec]/60">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block flex items-center gap-2">
                  <Globe size={14} className="text-[#3f809e]" />
                  <span>Apps Script Web App URL (ลิงก์หลักสคริปต์เว็บแอป)</span>
                </label>
                <input
                  type="text"
                  value={appsScriptUrl}
                  onChange={(e) => setAppsScriptUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full bg-white border border-[#eaeaec] rounded-xl px-4 py-3 text-xs font-bold font-mono outline-none focus:border-[#b58c4f] shadow-sm text-[#212c46]"
                />
                <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 leading-normal">
                  ลิงก์ Web App ที่ได้จากการ Deploy ในโปรเจกต์ Google Apps Script (ลงท้ายด้วย /exec)
                </span>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block flex items-center gap-2">
                  <Key size={14} className="text-[#b58c4f]" />
                  <span>Apps Script API Key (คีย์สำหรับการรักษาความปลอดภัยภายนอก)</span>
                </label>
                <input
                  type="text"
                  value={appsScriptApiKey}
                  onChange={(e) => setAppsScriptApiKey(e.target.value)}
                  placeholder="ระบุ API Key..."
                  className="w-full bg-white border border-[#eaeaec] rounded-xl px-4 py-3 text-xs font-semibold font-mono outline-none focus:border-[#b58c4f] shadow-sm text-[#212c46]"
                />
                <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 leading-normal">
                  คีย์ความปลอดภัยเพื่อตรวจสอบสิทธิ์สคริปต์ Google Sheets ในการบันทึกข้อมูลและดึงข้อมูล
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveAppsScriptConfig}
                  className="px-8 py-3 bg-[#212c46] hover:bg-[#3f809e] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md transition-all flex items-center gap-2 transform active:scale-95 duration-100 cursor-pointer"
                >
                  <Save size={16} />
                  <span>บันทึกการเชื่อมต่อ (Save Connection)</span>
                </button>
              </div>
            </div>
          </div>

          {/* SPREADSHEET INITIALIZATIONS */}
          <div className="bg-white p-8 rounded-2xl border border-[#eaeaec] shadow-sm space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-2xl text-[#b58c4f] shrink-0 shadow-sm">
                <FileSpreadsheet size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-[18px] font-black text-[#212c46] uppercase tracking-wider">
                  Spreadsheet Formation Control / ปรับปรุงโครงสร้างสเปรดชีต
                </h3>
                <p className="text-[12px] font-bold text-[#7a8b95] uppercase tracking-normal mt-1 leading-relaxed">
                  จัดเรียงโครงสร้าง หัวตารางคอลัมน์ แช่แข็งคอลัมน์ และเติมสีพื้นหลังในแต่ละแผ่นงานของ Spreadsheet หลักโดยไม่ต้องเขียนสไลดิ้งเอง
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block font-bold">
                  Spreadsheet Drive Document ID (รหัสเอกสารสเปรดชีต)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    disabled={isFormatting}
                    placeholder="Enter Google Spreadsheet ID..."
                    className="flex-1 bg-white border border-[#eaeaec] rounded-xl px-4 py-3 text-xs font-bold font-mono outline-none focus:border-[#b58c4f] shadow-sm text-[#212c46]"
                  />
                  <button
                    onClick={handleRunSetup}
                    disabled={isFormatting}
                    className="px-8 py-3 bg-[#b58c4f] hover:bg-[#a57c3f] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {isFormatting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Formatting...
                      </>
                    ) : (
                      'Run Setup'
                    )}
                  </button>
                </div>
              </div>
              
              {formatLogs.length > 0 && (
                <div className="bg-[#1e293b] text-slate-200 p-4 rounded-xl font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto border-2 border-slate-800 text-left">
                  {formatLogs.map((log, index) => (
                    <div key={index} className="flex gap-2 leading-relaxed">
                      <span className="text-emerald-400 font-bold">►</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column blocks */}
        <div className="space-y-6">
          {/* AUTHENTICATION SECTION */}
          <div className="bg-white p-8 rounded-2xl border border-[#eaeaec] shadow-sm space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600 shrink-0 shadow-sm">
                <UserCheck size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-[18px] font-black text-[#212c46] uppercase tracking-wider flex items-center gap-2">
                  <span>Google Developer Auth / ช่องทางสิทธิ์บัญชี Google</span>
                </h3>
                <p className="text-[12px] font-bold text-[#7a8b95] uppercase tracking-normal mt-1 leading-relaxed">
                  ลงชื่อเข้าใช้กับ Google Account เพื่อดึง OAuth Token เพื่ออนุญาตการจัดการโครงสร้างและสีของ Spreadsheet ปลายทางของคุณโดยตรง
                </p>
              </div>
            </div>
            
            <div className="p-6 border border-[#eaeaec] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-4">
                {user ? (
                  <>
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#b58c4f] shrink-0 shadow-sm bg-white">
                      <img src={user.photoURL || "https://lh3.googleusercontent.com/a/default-user=s96-c"} alt="User Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-sm text-[#212c46]">{user.displayName || "Advance Group DCC"}</p>
                      <p className="text-xs font-bold font-mono text-[#7a8b95]">{user.email || "advancegroup.dcc@gmail.com"}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#212c46]/5 border border-[#212c46]/10 flex items-center justify-center text-[#212c46]/40 text-sm font-black shrink-0 font-mono">
                      DCC
                    </div>
                    <div className="text-left">
                      <p className="font-black text-sm text-[#212c46]">No Account Connected</p>
                      <p className="text-xs font-bold font-mono text-[#7a8b95]">Click Sign in with Google to authorize formatting features.</p>
                    </div>
                  </>
                )}
              </div>

              <div>
                {user ? (
                  <button onClick={handleDisconnect} className="px-6 py-2.5 rounded-xl text-[#932c2e] hover:text-white border-2 border-[#932c2e]/40 hover:bg-[#932c2e] hover:border-[#932c2e] font-black text-[11px] uppercase tracking-wider transition-all duration-300 cursor-pointer">
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={handleGoogleSignIn}
                    className="flex items-center gap-3 px-6 py-2.5 bg-white hover:bg-slate-50 text-[#1f1f1f] font-black text-[11px] uppercase tracking-wider border-2 border-[#747775] rounded-xl hover:shadow-sm transition-all active:scale-95 duration-200 cursor-pointer"
                  >
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 block shrink-0">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SESSION SECURITY CONFIGURATION SECTION */}
          <div className="bg-white p-8 rounded-2xl border border-[#eaeaec] shadow-sm space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 shrink-0 shadow-sm">
                <ShieldAlert size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-[18px] font-black text-[#212c46] uppercase tracking-wider flex items-center gap-2">
                  <span>Session Security Control / สิทธิ์การรักษาความปลอดภัยเซสชัน</span>
                </h3>
                <p className="text-[12px] font-bold text-[#7a8b95] uppercase tracking-normal mt-1 leading-relaxed">
                  กำหนดเงื่อนไขเวลาความปลอดภัยของเซสชันผู้ใช้งานระบบ (Inactivity Session Expiry) เพื่อป้องกันสิทธิ์เข้าถึงข้อมูล Google Sheet ค้างในระบบ
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-[#eaeaec]/60">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block flex items-center gap-2">
                  <Timer size={14} className="text-[#4d87a8]" />
                  <span>Session Duration (เวลาก่อนเซสชันหมดอายุ)</span>
                </label>
                <select
                  value={cfgSessionDuration}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    handleUpdateSessionConfig(val, cfgWarnThreshold);
                  }}
                  className="w-full bg-white border border-[#eaeaec] rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#b58c4f] shadow-sm text-[#212c46] cursor-pointer"
                >
                  <option value="30">30 Seconds (ทดสอบความเร็ว / Fast 30s Demo)</option>
                  <option value="60">1 Minute (1 นาที)</option>
                  <option value="300">5 Minutes (5 นาที)</option>
                  <option value="900">15 Minutes (15 นาที - ทั่วไป)</option>
                  <option value="1800">30 Minutes (30 นาที)</option>
                  <option value="3600">1 Hour (1 ชั่วโมง)</option>
                </select>
                <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                  ระยะเวลาที่ระบบจะปล่อยให้เซสชันค้างอยู่โดยไม่มีความเคลื่อนไหว
                </span>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[11px] font-black text-[#212c46] uppercase tracking-widest block flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-600" />
                  <span>Warning Window (หน้าต่างเวลาแจ้งเตือนล่วงหน้า)</span>
                </label>
                <select
                  value={cfgWarnThreshold}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    handleUpdateSessionConfig(cfgSessionDuration, val);
                  }}
                  className="w-full bg-white border border-[#eaeaec] rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#b58c4f] shadow-sm text-[#212c46] cursor-pointer"
                >
                  <option value="10">10 Seconds (ทดสอบความเร็ว / Fast 10s Demo)</option>
                  <option value="30">30 Seconds (30 วินาที)</option>
                  <option value="60">60 Seconds (1 นาที)</option>
                  <option value="120">120 Seconds (2 นาที - แนะนำ)</option>
                  <option value="300">300 Seconds (5 นาที)</option>
                </select>
                <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                  จำนวนวินาทีย้อนกลับช่วงท้ายสำหรับเริ่มกะพริบลดเวลาแจ้งเตือน
                </span>
              </div>
            </div>

            <div className="bg-white border border-[#eaeaec] rounded-xl p-5 flex gap-3 text-xs leading-relaxed text-[#7a8b95] font-medium shadow-inner text-left">
              <Info size={16} className="text-[#3f809e] shrink-0 mt-0.5" />
              <div>
                <span className="block font-black text-[#212c46] uppercase mb-1 tracking-wider text-[10px]">Developer Guide / คำแนะนำในการทดสอบระบบแจ้งเตือนเซสชัน</span>
                คุณสามารถเลือกค่าเซสชันเป็น <strong className="text-[#212c46]">30 Seconds</strong> และหน้าต่างแจ้งเตือนเป็น <strong className="text-[#212c46]">10 Seconds</strong> จากนั้นทำการปล่อยระบบทิ้งไว้ประมาณ 20 วินาที ระบบจะดึงเสียงกะพริบแจ้งเตือนความปลอดภัย และแสดงกล่อง Pop-up แจ้งเตือนเพื่อให้ท่านตัดสินใจใช้งานต่อค่ะ
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
