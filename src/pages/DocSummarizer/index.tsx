import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import Swal from 'sweetalert2';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

const THEME = {
  primary: '#212c46',
  gold: '#b58c4f',
  brightGold: '#b7a159',
  bgMain: '#f3f3f1',
  success: '#657f4d',
};

interface SummaryResult {
  title: string;
  keyTakeaways: string[];
  risks: string[];
  actionItems: string[];
}

function UserGuidePanel({ isOpen, onClose }: any) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <>
      <div className={`fixed inset-0 z-[190] bg-[#212c46]/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose}/>
      <div className={`fixed inset-y-0 right-0 z-[200] w-full md:w-[500px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col border-l-2 border-[${THEME.gold}] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-5 px-6 border-b-2 border-[#b7a159] bg-[#212c46] text-white shrink-0">
          <div>
            <h3 className="font-black flex items-center gap-3 uppercase tracking-widest text-lg"><Icons.Scale size={22} className="text-[#b7a159]"/> AI DOCUMENT SUMMARIZER GUIDE</h3>
            <p className="text-[12px] font-bold text-[#d7d7d7] uppercase tracking-widest mt-1.5">User Manual</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-[#932c2e] hover:bg-white/10 rounded-xl transition-colors"><Icons.X size={24}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-[#414757] text-[12px] leading-relaxed custom-scrollbar bg-white">
          <section className="animate-fadeIn">
            <h4 className="text-[14px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-[#d7d7d7] pb-2 font-mono">
              <Icons.FileText size={18} className="text-[#b7a159]"/> 1. การนำเข้าข้อมูล (Data Input)
            </h4>
            <p className="text-[12px] mb-3">AI สามารถช่วยคุณย่อยเนื้อหากฎหมายที่ซับซ้อนให้เข้าใจง่ายขึ้น:</p>
            <ul className="list-none pl-0 space-y-3">
                <li className="flex items-start gap-2 bg-[#f8f9fa] p-3 rounded-xl border border-[#eaeaec]">
                  <Icons.Copy size={16} className="shrink-0 text-[#4d87a8] mt-0.5"/> 
                  <div><strong className="text-[#4d87a8]">Paste Text:</strong> คัดลอกและวางเนื้อหาของประกาศหรือร่างข้อกำหนดที่ต้องการ</div>
                </li>
                <li className="flex items-start gap-2 bg-[#f8f9fa] p-3 rounded-xl border border-[#eaeaec]">
                  <Icons.FileSearch size={16} className="shrink-0 text-[#657f4d] mt-0.5"/> 
                  <div><strong className="text-[#657f4d]">Context Analysis:</strong> ระบบจะประมวลผลตามบริบทของกฎหมายไทย</div>
                </li>
            </ul>
          </section>

          <section className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <h4 className="text-[14px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-[#d7d7d7] pb-2 font-mono">
              <Icons.BrainCircuit size={18} className="text-[#d96245]"/> 2. การวิเคราะห์อัจฉริยะ (Smart Analysis)
            </h4>
            <p className="text-[12px] mb-3">ให้ AI เป็นผู้สรุปใจความสำคัญและระบุจุดที่ต้องระวัง:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-[12px]">
                <li><strong className="text-[#d96245]">Executive Summary:</strong> สรุปเนื้อหาสำคัญไม่ให้พลาดประเด็นหลัก</li>
                <li><strong className="text-[#212c46]">Risk Identification:</strong> ระบุจุดที่มีความเสี่ยงต่อการผิดข้อบังคับ</li>
                <li><strong className="text-[#657f4d]">Penalty Review:</strong> ตรวจสอบบทลงโทษและความรับผิดที่อาจเกิดขึ้น</li>
            </ul>
          </section>

          <section className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <h4 className="text-[14px] font-black text-[#212c46] mb-3 uppercase flex items-center gap-2 border-b-2 border-[#d7d7d7] pb-2 font-mono">
              <Icons.Zap size={18} className="text-[#3f809e]"/> 3. แนวทางการปฏิบัติ (Action Items)
            </h4>
            <p className="text-[12px] bg-[#3f809e]/10 p-3 rounded-xl border border-[#3f809e]/30 text-[#212c46]">ระบบจะเสนอแนะขั้นตอนถัดไป (Next Steps) เพื่อให้คุณนำไปปรับใช้ในองค์กรหรือแจ้งฝ่ายที่เกี่ยวข้องได้อย่างรวดเร็วและแม่นยำ</p>
          </section>
        </div>
        
        <div className="p-4 bg-[#f8f9fa] border-t border-[#eaeaec] flex justify-end shrink-0">
          <button onClick={onClose} className="px-8 py-2.5 bg-[#212c46] text-white font-black rounded-xl uppercase text-[12px] hover:bg-[#414757] hover:text-white transition-all shadow-md tracking-[0.1em]">เข้าใจแล้ว (Understood)</button>
        </div>
      </div>
    </>,
    document.body
  );
}

export default function DocSummarizer() {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const exportToCSV = () => {
    if (!result) return;
    try {
      const rows = [
        ['Category', 'Insight/Detail'],
        ['Document Title', result.title],
        ...result.keyTakeaways.map(t => ['Key Takeaway', t]),
        ...result.risks.map(r => ['Risks & Compliance Check', r]),
        ...result.actionItems.map(a => ['Recommended Action Item', a])
      ];

      // Safe character set encoding for Thai/Unicode strings
      const csvContent = "\uFEFF" + rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `SMART_HR_AI_Summary_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.fire({
        title: 'CSV Export Successful!',
        text: 'Document summary exported as CSV.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('CSV export failed:', err);
    }
  };

  const exportToPDF = () => {
    if (!result) return;
    
    const formattedTakeaways = result.keyTakeaways.map(t => `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; margin-bottom: 8px; font-size: 12px; font-family: 'Inter', 'Noto Sans Thai', sans-serif;">
        &bull; ${t}
      </div>
    `).join('');

    const formattedRisks = result.risks.map(r => `
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 8px; margin-bottom: 8px; font-size: 12px; color: #991b1b; font-weight: bold; font-family: 'Inter', 'Noto Sans Thai', sans-serif;">
        ⚠️ ${r}
      </div>
    `).join('');

    const formattedActions = result.actionItems.map(a => `
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 8px; margin-bottom: 8px; font-size: 12px; color: #166534; font-family: 'Inter', 'Noto Sans Thai', sans-serif;">
        ✔ ${a}
      </div>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${result.title}</title>
          <style>
            body { font-family: 'Inter', 'Noto Sans Thai', sans-serif; padding: 40px; color: #1e293b; background-color: #ffffff; }
            .header { display: flex; align-items: center; border-bottom: 3px double #212c46; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { width: 50px; height: 50px; border-radius: 5px; }
            .header-text { margin-left: 20px; flex-grow: 1; }
            .header-text h1 { font-size: 18px; font-weight: 950; margin: 0; color: #212c46; text-transform: uppercase; letter-spacing: 0.05em; }
            .header-text p { font-size: 10px; margin: 4px 0 0 0; color: #b58c4f; font-weight: bold; letter-spacing: 0.1em; }
            .section-title { font-size: 12px; font-weight: 900; text-transform: uppercase; color: #212c46; border-left: 4px solid #b58c4f; padding-left: 8px; margin-top: 30px; margin-bottom: 15px; letter-spacing: 0.05em; }
            .meta-info { display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200" class="logo" />
            <div class="header-text">
              <h1>${result.title}</h1>
              <p>บริษัท ที ออลล์ อินเทลลิเจนซ์ จำกัด / 46 หมู่ที่ 5 ตำบลคลองสี่ อำเภอคลองหลวง จังหวัดปทุมธานี 12120</p>
            </div>
          </div>
          <div class="meta-info">
            <div>Export Date: ${new Date().toISOString().substring(0, 10)} ${new Date().toLocaleTimeString()}</div>
            <div>Classification: CONFIDENTIAL &bull; INTERNAL STAFF RUNTIME</div>
          </div>

          <div class="section-title">I. Key Takeaways</div>
          ${formattedTakeaways}

          <div class="section-title">II. Risks & Compliance Controls</div>
          ${formattedRisks}

          <div class="section-title">III. Recommended Action Items</div>
          ${formattedActions}

          <div style="margin-top: 50px; border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 9px; text-align: center; color: #94a3b8;">
            Document synthesized programmatically by SMART-HR AI Services.
          </div>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 400);
            };
          </script>
        </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Pop-up blocker is preventing document export. Please allow popups.');
      return;
    }
    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  const handleSummarize = () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setResult(null);

    // Mock processing
    setTimeout(() => {
      setResult({
        title: "สรุปสาระสำคัญของข้อกฎหมาย",
        keyTakeaways: [
          "ผู้ประกอบกิจการต้องจัดทำรายงานการประเมินความเสี่ยงทุก 6 เดือน",
          "ต้องมีเจ้าหน้าที่ความปลอดภัย (จป.) ระดับวิชาชีพประจำสถานประกอบการ",
          "เอกสารหลักฐานต้องเก็บรักษาไว้อย่างน้อย 5 ปี"
        ],
        risks: [
          "บทลงโทษปรับสูงสุดไม่เกิน 200,000 บาท หากไม่จัดทำรายงาน",
          "ความเสี่ยงในการถูกระงับใบอนุญาตชั่วคราว"
        ],
        actionItems: [
          "ตรวจสอบรายชื่อ จป. ปัจจุบัน",
          "จัดพิกัดการเก็บเอกสารย้อนหลังให้เป็นระเบียบ",
          "กำหนดปฏิทินการส่งรายงานงวดถัดไป"
        ]
      });
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="flex flex-1 w-full flex-col pb-5 animate-fadeIn bg-transparent space-y-4">
      
      {/* USER GUIDE FLOATING TAB */}
      {typeof document !== 'undefined' && createPortal(
        <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#932c2e] hover:text-white hover:border-[#932c2e] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group" style={{ top: '80px' }}>
            <Icons.HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
            <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[11px]">USER GUIDE</span>
        </button>,
        document.body
      )}

      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* HEADER SECTION */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center group cursor-default shrink-0">
            <div className="absolute inset-0 bg-[#b7a159] blur-[15px] opacity-30 rounded-full group-hover:opacity-70 transition-all duration-700 animate-pulse-subtle"></div>
            <div className="relative z-10 p-1.5 border border-[#b7a159]/50 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden">
              <Icons.BookOpen size={28} strokeWidth={2.5} className="text-[#b58c4f]" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none flex items-center gap-2" style={{ fontSize: '24px' }}>
              AI DOCUMENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b58c4f] to-[#8e9141]">SUMMARIZER</span>
              <span className="bg-[#b58c4f] text-white text-[9px] px-2 py-0.5 rounded-full tracking-widest ml-1 shadow-sm font-mono">BETA</span>
            </h3>
            <p className="text-[11px] font-bold text-[#b58c4f] uppercase tracking-[0.2em] mt-0.5 opacity-90 leading-none">
              INTELLIGENT DOCUMENT DIGEST
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 w-full mt-[2px] pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Input Card */}
        <div className="bg-white/90 p-6 rounded-3xl shadow-lg border border-[#eaeaec] animate-fadeIn">
          <div className="flex items-center justify-between mb-4 border-b border-[#eaeaec] pb-3">
             <h4 className="text-[13px] font-black text-[#212c46] uppercase tracking-widest flex items-center gap-2">
               <Icons.FileText size={18} className="text-[#b58c4f]"/> Input Legal Text
             </h4>
             <button 
               onClick={() => setInputText('')}
               className="text-[10px] font-bold text-[#7a8b95] hover:text-[#932c2e] uppercase tracking-widest transition-colors"
             >
               Clear
             </button>
          </div>
          
          <div className="relative group">
            <textarea 
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               placeholder="วางข้อความกฎหมาย หรือประกาศที่ต้องการให้สรุปที่นี่..."
               className="w-full h-80 p-5 bg-[#f8f9fa] border border-[#eaeaec] rounded-2xl outline-none focus:border-[#b58c4f] focus:ring-2 focus:ring-[#b58c4f]/10 transition-all text-[#212c46] text-[14px] leading-relaxed resize-none"
            />
            {inputText.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-30">
                 <Icons.UploadCloud size={48} className="text-[#7a8b95] mb-2" />
                 <span className="text-[12px] font-bold tracking-widest uppercase text-[#7a8b95]">Paste Content Here</span>
              </div>
            )}
          </div>

          <button 
            onClick={handleSummarize}
            disabled={!inputText.trim() || isProcessing}
            className={`w-full mt-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] transition-all flex items-center justify-center gap-3 shadow-md ${(!inputText.trim() || isProcessing) ? 'bg-[#eaeaec] text-[#a0aec0] cursor-not-allowed' : 'bg-[#212c46] text-[#b7a159] hover:bg-[#b7a159] hover:text-[#212c46]'}`}
          >
            {isProcessing ? (
              <>
                <Icons.Loader2 size={18} className="animate-spin" /> Processing Legal Insights...
              </>
            ) : (
              <>
                <Icons.Sparkles size={18} /> Summarize Document
              </>
            )}
          </button>
        </div>

        {/* Result Card */}
        <div className="bg-[#1d2636] p-6 rounded-3xl shadow-xl border border-[#414757] animate-fadeIn min-h-[500px] flex flex-col">
           {!result && !isProcessing ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-6 group">
                   <Icons.FileSearch size={32} className="text-white/20 group-hover:text-[#b7a159] transition-colors" />
                </div>
                <h4 className="text-white font-black uppercase tracking-widest text-[14px] mb-2">Awaiting Analysis</h4>
                <p className="text-white/40 text-[11px] leading-relaxed max-w-xs font-bold uppercase tracking-wider">
                  Paste a legal text in the left panel to generate an intelligent summary and risk assessment.
                </p>
             </div>
           ) : isProcessing ? (
             <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                   <div className="w-16 h-16 border-4 border-[#b7a159]/20 border-t-[#b7a159] rounded-full animate-spin"></div>
                   <Icons.BrainCircuit size={24} className="text-[#b7a159] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <span className="text-white/60 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Deep Legal Processing...</span>
             </div>
           ) : (
             <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#b7a159] rounded-lg text-white">
                         <Icons.CheckCircle size={18} />
                      </div>
                      <div>
                        <h4 className="text-white font-black uppercase tracking-tighter text-[18px]">Analysis Complete</h4>
                        <p className="text-[#b7a159] text-[9px] font-black uppercase tracking-widest">Document Digest Result</p>
                      </div>
                   </div>
                    <div className="flex items-center gap-1.5 no-print">
                      <button 
                        onClick={exportToCSV}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-[#414757] rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                        title="Download CSV report"
                      >
                        <Icons.Download size={11} className="text-[#b7a159]" />
                        CSV
                      </button>
                      <button 
                        onClick={exportToPDF}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-[#b58c4f] hover:bg-[#b7a159] text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                        title="Print PDF dossier"
                      >
                        <Icons.Printer size={11} />
                        PDF
                      </button>
                    </div>
                </div>

                <div className="space-y-6">
                   <section>
                      <h5 className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Icons.LayoutList size={14} className="text-[#b7a159]"/> Key Takeaways
                      </h5>
                      <div className="space-y-2">
                        {result?.keyTakeaways.map((item, i) => (
                          <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-start gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-[#b7a159] mt-1.5 shrink-0" />
                             <span className="text-white/90 text-[13px] leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </div>
                   </section>

                   <section>
                      <h5 className="text-[11px] font-black text-[#d96245]/80 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Icons.AlertTriangle size={14} className="text-[#d96245]"/> Risks & Compliance Caps
                      </h5>
                      <div className="space-y-2">
                        {result?.risks.map((item, i) => (
                          <div key={i} className="bg-red-500/5 border border-red-500/20 p-3 rounded-xl flex items-start gap-3">
                             <Icons.ShieldAlert size={16} className="text-[#d96245] shrink-0 mt-0.5" />
                             <span className="text-white/90 text-[13px] leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </div>
                   </section>

                   <section>
                      <h5 className="text-[11px] font-black text-[#657f4d] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Icons.Zap size={14} className="text-[#657f4d]"/> Recommended Actions
                      </h5>
                      <div className="grid grid-cols-1 gap-2">
                        {result?.actionItems.map((item, i) => (
                          <div key={i} className="bg-[#657f4d]/10 border border-[#657f4d]/30 p-3 rounded-xl flex items-center gap-3">
                             <Icons.Check size={16} className="text-[#657f4d] shrink-0" />
                             <span className="text-white/90 text-[13px]">{item}</span>
                          </div>
                        ))}
                      </div>
                   </section>
                </div>
             </div>
           )}
        </div>
        </div>

        {/* Document Distribution Bar Chart (Relocated from Home) */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-[#eaeaec] mt-6 animate-fadeIn">
           <div className="flex items-center justify-between border-b border-[#eaeaec] pb-3 mb-4">
             <div className="flex items-center gap-2">
               <div className="p-2 bg-amber-50 text-[#b58c4f] rounded-lg">
                 <Icons.FolderTree size={16} />
               </div>
               <div>
                 <h3 className="text-xs font-black text-[#212c46] uppercase tracking-wider">Document Distribution</h3>
                 <p className="text-[9px] text-[#748ea1] font-black uppercase tracking-widest mt-0.5">Database storage volumes by Document Category</p>
               </div>
             </div>
             <span className="text-[8px] font-black uppercase tracking-wider text-[#b58c4f] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 transition-all">
               Registry Stats
             </span>
           </div>
           <div className="h-44">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={[
                 { name: 'Policies', value: 12 },
                 { name: 'Contracts', value: 25 },
                 { name: 'NDAs', value: 8 },
                 { name: 'Tax / Compliance', value: 15 },
                 { name: 'Forms', value: 5 }
               ]} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                 <XAxis dataKey="name" stroke="#7a8b95" fontSize={10} tickLine={false} />
                 <YAxis stroke="#7a8b95" fontSize={10} tickLine={false} />
                 <Tooltip contentStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                 <Bar dataKey="value" fill="#b58c4f" radius={[4, 4, 0, 0]}>
                   {[
                     { name: 'Policies', value: 12 },
                     { name: 'Contracts', value: 25 },
                     { name: 'NDAs', value: 8 },
                     { name: 'Tax / Compliance', value: 15 },
                     { name: 'Forms', value: 5 }
                   ].map((entry, index) => {
                     const colors = ['#254268', '#b58c4f', '#5f7ab7', '#a73527', '#657f4d'];
                     return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                   })}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

      </div>
    </div>
  );
}
