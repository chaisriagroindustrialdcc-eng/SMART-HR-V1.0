import React, { useState, useEffect } from 'react';
import { DraggableModal } from './DraggableModal';
import { Printer, Eye, Info, RefreshCw, Layers, ShieldCheck, Download, Sliders } from 'lucide-react';

interface PrintSection {
  id: string;
  label: string;
  defaultVisible?: boolean;
}

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  documentId?: string;
  contentId?: string; // HTML element ID to grab content from
  children?: React.ReactNode; // Or direct React children to render inside paper
  defaultWatermark?: 'CONFIDENTIAL' | 'DRAFT' | 'OFFICIAL' | 'NONE' | 'CUSTOM';
  sections?: PrintSection[];
}

export function PrintPreviewModal({
  isOpen,
  onClose,
  title,
  documentId = 'TAI-REP-8888',
  contentId,
  children,
  defaultWatermark = 'CONFIDENTIAL',
  sections
}: PrintPreviewModalProps) {
  const [watermark, setWatermark] = useState<'CONFIDENTIAL' | 'DRAFT' | 'OFFICIAL' | 'NONE' | 'CUSTOM'>(defaultWatermark);
  const [customWatermarkText, setCustomWatermarkText] = useState<string>('VERIFIED KEY');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pageSize, setPageSize] = useState<'A4' | 'LETTER' | 'LEGAL'>('A4');
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>({});
  const [clonedHtml, setClonedHtml] = useState<string>('');
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);

  // Initialize section visibility from prop
  useEffect(() => {
    if (sections) {
      const initial: Record<string, boolean> = {};
      sections.forEach(s => {
        initial[s.id] = s.defaultVisible !== false;
      });
      setSectionVisibility(initial);
    }
  }, [sections]);

  // Active watermark based on toggled inputs
  const activeWatermarkText = watermark === 'NONE'
    ? ''
    : (watermark === 'CUSTOM' ? (customWatermarkText || 'CONFIDENTIAL') : watermark);

  // When contentId is specified, fetch the HTML content from DOM
  useEffect(() => {
    if (isOpen && contentId) {
      // Small timeout to allow target DOM to fully render
      const timer = setTimeout(() => {
        const targetEl = document.getElementById(contentId);
        if (targetEl) {
          // Clean cloned HTML slightly by removing interactive elements or scrollbars if any
          let html = targetEl.innerHTML;
          // Filter out buttons from cloned preview to keep it clean
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          const interactiveElements = tempDiv.querySelectorAll('button, input[type="button"], .no-print');
          interactiveElements.forEach(el => el.remove());
          setClonedHtml(tempDiv.innerHTML);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, contentId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    // Add watermark class to body before printing
    if (activeWatermarkText) {
      document.body.setAttribute('data-print-watermark', activeWatermarkText);
      document.body.classList.add('has-print-watermark');
    } else {
      document.body.removeAttribute('data-print-watermark');
      document.body.classList.remove('has-print-watermark');
    }

    // Trigger Print
    window.print();

    // Clean up
    setTimeout(() => {
      document.body.removeAttribute('data-print-watermark');
      document.body.classList.remove('has-print-watermark');
    }, 100);
  };

  const handleDownloadPDF = () => {
    setIsPdfDownloading(true);
    
    const element = document.getElementById('printable-preview-area');
    if (!element) {
      setIsPdfDownloading(false);
      return;
    }
    
    // Check if html2pdf is loaded, otherwise load it dynamically
    const runExport = () => {
      const opt = {
        margin:       [10, 15, 10, 15], // 10mm margins
        filename:     `${title.replace(/[^a-z0-9ก-๙]/gi, '_') || 'report'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: pageSize.toLowerCase(), orientation: orientation }
      };
      
      // Temporary apply the watermark attribute if active
      if (activeWatermarkText) {
        document.body.setAttribute('data-print-watermark', activeWatermarkText);
        document.body.classList.add('has-print-watermark');
      }
      
      (window as any).html2pdf().from(element).set(opt).save().then(() => {
        setIsPdfDownloading(false);
        // clean up
        document.body.removeAttribute('data-print-watermark');
        document.body.classList.remove('has-print-watermark');
      }).catch((err: any) => {
        console.error("PDF download error:", err);
        setIsPdfDownloading(false);
      });
    };

    if ((window as any).html2pdf) {
      runExport();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        runExport();
      };
      script.onerror = () => {
        alert("Failed to load PDF generation library. Please try standard print action.");
        setIsPdfDownloading(false);
      };
      document.body.appendChild(script);
    }
  };

  const getPaperDimensions = () => {
    if (pageSize === 'LETTER') {
      return orientation === 'portrait' 
        ? { width: '216mm', minHeight: '279mm', maxWidth: '216mm' }
        : { width: '279mm', minHeight: '216mm', maxWidth: '279mm' };
    }
    if (pageSize === 'LEGAL') {
      return orientation === 'portrait' 
        ? { width: '216mm', minHeight: '356mm', maxWidth: '216mm' }
        : { width: '356mm', minHeight: '216mm', maxWidth: '356mm' };
    }
    // A4
    return orientation === 'portrait' 
      ? { width: '210mm', minHeight: '297mm', maxWidth: '210mm' }
      : { width: '297mm', minHeight: '210mm', maxWidth: '297mm' };
  };

  const dimensions = getPaperDimensions();

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-[#b58c4f]" />
          <span className="font-sans font-black uppercase text-[11px] tracking-wider text-[#212c46]">
            Print Preview & Export PDF Control System
          </span>
        </div>
      }
      width="max-w-4xl"
    >
      {/* Inject print properties dynamically for standard print action */}
      <style>{`
        @media print {
          @page {
            size: ${pageSize.toLowerCase()} ${orientation};
            margin: 10mm;
          }
        }
      `}</style>

      {/* Dynamic section visibility stylesheet block */}
      {sections && (
        <style dangerouslySetInnerHTML={{ __html: `
          ${sections
            .filter(sec => !sectionVisibility[sec.id])
            .map(sec => `
              #${sec.id}, .section-${sec.id}, [data-section="${sec.id}"], .section-toggle-${sec.id} {
                display: none !important;
              }
            `).join('\n')
          }
        ` }} />
      )}

      <div className="flex-1 overflow-y-auto p-8 bg-[#1f2a44]/5 custom-scrollbar text-[#212c46] flex flex-col items-center">
        
        {/* Controls Bar */}
        <div className="w-full max-w-[210mm] bg-white border border-slate-200/80 p-5 rounded-2xl mb-5 flex flex-col gap-4 no-print shadow-sm">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <Sliders size={14} className="text-[#b58c4f]" />
            <span className="text-[10px] font-black uppercase text-[#212c46] tracking-widest">
              Print-Specific Configurations / การกำหนดค่าก่อนพิมพ์
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
            {/* 1. Watermark Type */}
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-[#7a8b95] uppercase tracking-wider font-mono">
                Watermark Type / รูปแบบลายน้ำ
              </span>
              <select
                value={watermark}
                onChange={(e) => setWatermark(e.target.value as any)}
                className="mt-1.5 text-[11px] font-bold text-[#212c46] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#b58c4f] cursor-pointer"
              >
                <option value="CONFIDENTIAL">CONFIDENTIAL (ความลับ)</option>
                <option value="DRAFT">DRAFT (ฉบับร่าง)</option>
                <option value="OFFICIAL">OFFICIAL (เอกสารหลัก)</option>
                <option value="CUSTOM">CUSTOM TEXT (พิมพ์เอง)</option>
                <option value="NONE">NONE (ไม่มีลายน้ำ)</option>
              </select>
            </div>

            {/* 2. Custom Watermark Input */}
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-[#7a8b95] uppercase tracking-wider font-mono">
                Custom Watermark Text / ข้อความลายน้ำ
              </span>
              <input
                type="text"
                value={customWatermarkText}
                onChange={(e) => setCustomWatermarkText(e.target.value.toUpperCase())}
                disabled={watermark !== 'CUSTOM'}
                placeholder="e.g. SECRET COPY"
                className="mt-1.5 text-[11px] font-bold text-[#212c46] bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#b58c4f]"
              />
            </div>

            {/* 3. Orientation */}
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-[#7a8b95] uppercase tracking-wider font-mono">
                Orientation / แนววางหน้ากระดาษ
              </span>
              <div className="mt-1.5 flex gap-1 bg-slate-50 p-0.5 border border-slate-200 rounded-lg">
                <button
                  onClick={() => setOrientation('portrait')}
                  className={`flex-1 text-[10px] py-1 font-black rounded uppercase tracking-wider transition-all duration-300 ${orientation === 'portrait' ? 'bg-[#212c46] text-white shadow-xs' : 'text-[#7a8b95] hover:text-[#212c46]'}`}
                >
                  Portrait
                </button>
                <button
                  onClick={() => setOrientation('landscape')}
                  className={`flex-1 text-[10px] py-1 font-black rounded uppercase tracking-wider transition-all duration-300 ${orientation === 'landscape' ? 'bg-[#212c46] text-white shadow-xs' : 'text-[#7a8b95] hover:text-[#212c46]'}`}
                >
                  Landscape
                </button>
              </div>
            </div>

            {/* 4. Page Size */}
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-[#7a8b95] uppercase tracking-wider font-mono">
                Paper Size / ขนาดหน้ากระดาษ
              </span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as any)}
                className="mt-1.5 text-[11px] font-bold text-[#212c46] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#b58c4f] cursor-pointer"
              >
                <option value="A4">A4 (210 x 297 mm)</option>
                <option value="LETTER">Letter (8.5 x 11 in)</option>
                <option value="LEGAL">Legal (8.5 x 14 in)</option>
              </select>
            </div>
          </div>

          {/* Optional Sections Checklist */}
          {sections && sections.length > 0 && (
            <div className="w-full mt-2 pt-3 border-t border-slate-100 text-left animate-fadeIn">
              <span className="text-[8px] font-black text-[#7a8b95] uppercase tracking-wider font-mono">
                Included Report Sections / เลือกหมวดหมู่ข้อมูลที่รวมพิมพ์
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2.5 mt-2">
                {sections.map(sec => (
                  <label key={sec.id} className="flex items-center gap-2.5 text-[11px] font-bold text-slate-700 cursor-pointer hover:text-[#212c46] select-none">
                    <input 
                      type="checkbox"
                      checked={!!sectionVisibility[sec.id]}
                      onChange={(e) => setSectionVisibility(prev => ({
                        ...prev,
                        [sec.id]: e.target.checked
                      }))}
                      className="w-3.5 h-3.5 rounded text-[#b58c4f] border-slate-300 focus:ring-0 focus:ring-offset-0 accent-[#b58c4f] cursor-pointer"
                    />
                    <span>{sec.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-1 pt-3.5 border-t border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 font-mono">
              SIMULATED DEVICE RESOLUTION: {pageSize} {orientation.toUpperCase()}
            </span>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleDownloadPDF}
                disabled={isPdfDownloading}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#4d87a8] hover:bg-[#212c46] disabled:bg-slate-300 text-white transition-all rounded-xl text-[11px] font-black uppercase tracking-widest cursor-pointer shadow-md active:scale-95 animate-fadeIn"
              >
                <Download size={14} />
                {isPdfDownloading ? 'Saving PDF...' : 'Download PDF'}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#b58c4f] hover:bg-[#212c46] text-white transition-all rounded-xl text-[11px] font-black uppercase tracking-widest cursor-pointer shadow-md active:scale-95 animate-fadeIn"
              >
                <Printer size={14} />
                Print System
              </button>
            </div>
          </div>
        </div>

        {/* Paper Container Mock (A4/Letter/Legal Dimension Simulation standard padding) */}
        <div
          id="printable-preview-area"
          className="bg-white p-12 rounded-2xl border border-slate-200 shadow-xl relative flex flex-col justify-between print:shadow-none print:border-none print:p-0 print:m-0"
          style={{ 
            fontFamily: "'Inter', sans-serif",
            width: dimensions.width,
            minHeight: dimensions.minHeight,
            maxWidth: dimensions.maxWidth
          }}
        >
          {/* On-Screen Watermark Layer */}
          {activeWatermarkText && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-[5]">
              <span className="text-[75px] font-black text-rose-800/[0.035] uppercase tracking-widest font-mono transform rotate-[-45deg] scale-125 whitespace-nowrap select-none">
                {activeWatermarkText}
              </span>
            </div>
          )}

          {/* Standardized Header */}
          <div className="print-layout-header flex flex-col w-full border-b-[3px] border-double border-slate-900 pb-2.5 mb-6 text-black bg-white select-none z-10">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-[#212c46] rounded-xl flex items-center justify-center text-[#b58c4f] font-black text-lg shadow-md border border-[#b58c4f]/30">
                  TAI
                </div>
                <div className="text-left">
                  <h1 className="text-xs font-black tracking-tight leading-none uppercase text-slate-900 font-sans">
                    T All Intelligence Co., Ltd. / บริษัท ที ออลล์ อินเทลลิเจนซ์ จำกัด
                  </h1>
                  <h2 className="text-[8.5px] font-extrabold tracking-wide mt-1 text-slate-700 leading-snug">
                    สำนักงานใหญ่ : 46 หมู่ที่ 5 ตำบลคลองสี่ อำเภอคลองหลวง จังหวัดปทุมธานี 12120<br />
                    Head Office : 46 Moo 5, Klong 4, Klong Luang, Pathumthani Thailand 12120
                  </h2>
                  <span className="text-[7.5px] font-bold text-[#b58c4f] uppercase tracking-widest mt-1 block font-mono">
                    TAX ID : 0-1055-57149-33-2 • OFFICIAL SYSTEM REPORTING & COMPLIANCE
                  </span>
                </div>
              </div>
              <div className="text-right flex flex-col shrink-0">
                <span className="text-[7px] font-black text-slate-400 tracking-widest leading-none">DOCUMENT ID / รหัสพัสดุรายงาน</span>
                <span className="text-[9.5px] font-black uppercase text-slate-800 tracking-wider mt-0.5 leading-none font-mono">
                  {documentId}
                </span>
                <span className="text-[7.5px] font-extrabold text-[#508660] mt-1 flex items-center gap-1 justify-end">
                  <span className="w-1 h-1 rounded-full bg-[#508660]"></span> COMPLIANT SECURE
                </span>
              </div>
            </div>

            <div className="mt-2.5 border-t border-slate-200 pt-2 flex flex-col w-full text-left">
              <span className="text-[8px] font-black text-slate-400 tracking-widest leading-none uppercase">OFFICIAL CLASSIFIED REPORT TITLE / หัวข้อรายงาน</span>
              <h3 className="text-xs font-black text-slate-900 font-sans tracking-tight mt-0.5 uppercase">
                {title}
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-200 w-full text-left font-sans text-[9px]">
              <div>
                <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">PRINT DATE / เวลาพิมพ์</span>
                <p className="font-extrabold text-slate-800 mt-0.5">{new Date().toLocaleDateString('th-TH')} - {new Date().toLocaleTimeString('th-TH', {hour12: false})}</p>
              </div>
              <div>
                <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">CLASSIFICATION</span>
                <p className="font-extrabold text-[#932c2e] mt-0.5 uppercase tracking-wider">{activeWatermarkText || 'CONFIDENTIAL'}</p>
              </div>
              <div>
                <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">SECURITY PROTOCOL</span>
                <p className="font-extrabold text-slate-800 mt-0.5">TAI/ERP/HRM-v3.5</p>
              </div>
            </div>
          </div>

          {/* Standardized Content Container */}
          <div className="flex-1 text-[11px] text-slate-800 overflow-visible z-15 text-left w-full">
            {clonedHtml ? (
              <div 
                className="print-layout-content whitespace-normal overflow-visible break-words" 
                dangerouslySetInnerHTML={{ __html: clonedHtml }} 
              />
            ) : (
              <div className="print-layout-content whitespace-normal overflow-visible break-words">
                {children}
              </div>
            )}
          </div>

          {/* Standardized Footer with Configurable/AutoQR Placeholder */}
          <div className="print-layout-footer border-t border-slate-300 pt-3 mt-8 flex items-center justify-between w-full select-none text-[8.5px] font-mono leading-none text-slate-500 z-10">
            <div className="flex items-center gap-2">
              {/* Auto-generated QR code placeholder */}
              <div className="w-[32px] h-[32px] bg-white border border-slate-300 rounded flex items-center justify-center p-0.5 shrink-0 select-none">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-800">
                  <path d="M0 0h35v35H0zm10 10h15v15H10zm55-10h35v35H65zm10 10h15v15H75zM0 65h35v35H0zm10 10h15v15H10zm50-10h10v10H60zm15 0h10v10H75zm15 0h10v10H90zm-30 15h10v10H60zm30 0h10v10H90zm-15 15h10v10H75z" fill="currentColor"/>
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-black uppercase tracking-wider text-slate-500 text-[8px]">
                  T All Intelligence ERP Suite
                </span>
                <span className="text-[6.5px] text-[#b58c4f] font-bold uppercase mt-0.5 tracking-wider">
                  Scan for verification
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 font-bold uppercase text-slate-400">
              <span className="text-[7px]">System Code: TAI/ERP/HRM-v3.5</span>
              <span>Timestamp: {new Date().toLocaleDateString('th-TH')} {new Date().toLocaleTimeString('th-TH', {hour12: false})}</span>
            </div>
            <div className="font-bold text-slate-600 uppercase tracking-wider flex items-center text-[8.5px]">
              Page 1 of 1 (PDF Verified Copy)
            </div>
          </div>

        </div>

        {/* Safety Tip */}
        <p className="text-[10px] text-slate-400 mt-4 leading-none flex items-center gap-1">
          <Info size={11} className="text-[#b58c4f]"/> Tip: Ensure "Background Graphics" is enabled in browser print dialog for background colors to render beautifully on physical paper.
        </p>

      </div>
    </DraggableModal>
  );
}
