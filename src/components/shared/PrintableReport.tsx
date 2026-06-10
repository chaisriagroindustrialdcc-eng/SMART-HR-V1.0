import React from 'react';

interface PrintableReportProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  documentId?: string;
  companyName?: string;
  companyAddress?: string;
  taxId?: string;
  showFooter?: boolean;
  className?: string;
}

export function PrintableReport({
  children,
  title,
  subtitle,
  documentId = 'TAI-REP-9999',
  companyName = 'บริษัท ที ออลล์ อินเทลลิเจนซ์ จำกัด / T All Intelligence Co., Ltd.',
  companyAddress = '46 หมู่ที่ 5 ตำบลคลองสี่ อำเภอคลองหลวง จังหวัดปทุมธานี 12120 / 46 Moo 5, Klong 4, Klong Luang, Pathumthani 12120',
  taxId = '0-1055-57149-33-2',
  showFooter = true,
  className = '',
  ...props
}: PrintableReportProps) {
  return (
    <div 
      className={`print-layout-wrapper bg-white p-10 max-w-[210mm] mx-auto relative flex flex-col justify-between font-sans print:p-0 print:m-0 print:shadow-none print:border-none ${className}`}
      {...props}
    >
      {/* Printable Header */}
      <div className="print-layout-header flex flex-col w-full border-b-[3px] border-double border-slate-900 pb-2.5 mb-6 text-black bg-white select-none">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-[#212c46] rounded-xl flex items-center justify-center text-[#b58c4f] font-black text-lg shadow-md border border-[#b58c4f]/30">
              TAI
            </div>
            <div className="text-left">
              <h1 className="text-xs font-black tracking-tight leading-none uppercase text-slate-900">
                {companyName}
              </h1>
              <h2 className="text-[8.5px] font-extrabold tracking-wide mt-1 text-slate-700 leading-snug">
                {companyAddress}
              </h2>
              {taxId && (
                <span className="text-[7.5px] font-bold text-[#b58c4f] uppercase tracking-widest mt-1 block font-mono">
                  TAX ID : {taxId} • OFFICIAL SYSTEM REPORTING & COMPLIANCE
                </span>
              )}
            </div>
          </div>
          <div className="text-right flex flex-col shrink-0">
            <span className="text-[7px] font-black text-slate-400 tracking-widest leading-none">DOCUMENT ID</span>
            <span className="text-[9.5px] font-black uppercase text-slate-800 tracking-wider mt-0.5 leading-none font-mono">
              {documentId}
            </span>
            <span className="text-[7.5px] font-extrabold text-[#508660] mt-1 flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-[#508660]"></span> COMPLIANT SECURE
            </span>
          </div>
        </div>

        <div className="mt-2.5 border-t border-slate-200 pt-2 flex flex-col w-full text-left">
          <span className="text-[8px] font-black text-slate-400 tracking-widest leading-none uppercase">OFFICIAL CLASSIFIED REPORT TITLE</span>
          <h3 className="text-xs font-black text-slate-900 tracking-tight mt-0.5 uppercase">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[9px] text-[#7a8b95] font-bold mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-200 w-full text-left font-sans text-[9px]">
          <div>
            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">PRINT DATE</span>
            <p className="font-extrabold text-slate-800 mt-0.5">
              {new Date().toLocaleDateString('th-TH')} - {new Date().toLocaleTimeString('th-TH', {hour12: false})}
            </p>
          </div>
          <div>
            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">CLASSIFICATION</span>
            <p className="font-extrabold text-[#932c2e] mt-0.5 uppercase tracking-wider">CONFIDENTIAL</p>
          </div>
          <div>
            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">SECURITY PROTOCOL</span>
            <p className="font-extrabold text-slate-800 mt-0.5">TAI/ERP/HRM-v3.5</p>
          </div>
        </div>
      </div>

      {/* Main Print Content (Injected with table and data block styles) */}
      <div className="print-layout-content flex-1 text-[11px] text-slate-800 overflow-visible text-left w-full">
        {children}
      </div>

      {/* Printable Footer */}
      {showFooter && (
        <div className="print-layout-footer border-t border-slate-300 pt-3 mt-8 flex items-center justify-between w-full select-none text-[8.5px] font-mono leading-none text-slate-500">
          <div className="flex items-center gap-2">
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
      )}
    </div>
  );
}
