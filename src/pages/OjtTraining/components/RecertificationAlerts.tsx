import React, { useMemo } from 'react';
import * as Icons from 'lucide-react';

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
  skills?: SkillItem[];
  [key: string]: any;
}

interface RecertificationAlertsProps {
  learners: Learner[];
  onTriggerRecertify: (learner: Learner, skillName: string) => void;
}

export default function RecertificationAlerts({ learners, onTriggerRecertify }: RecertificationAlertsProps) {
  const alerts = useMemo(() => {
    const list: any[] = [];
    const today = new Date('2026-06-10'); // Focal system date

    learners.forEach((l) => {
      const skills = l.skills || [];
      skills.forEach((s, index) => {
        // Enforce the standard expiration dates for Compliance skills to seed the alerts
        const category = s.category ||
          (s.name.toLowerCase().includes('regulatory') ||
          s.name.toLowerCase().includes('code') ||
          s.name.toLowerCase().includes('compliance') ||
          s.name.toLowerCase().includes('privacy') ||
          s.name.toLowerCase().includes('standard')
            ? 'Compliance'
            : 'Technical');

        let expDate = s.expirationDate;
        if (s.mastered && category === 'Compliance' && !expDate) {
          // Mocking deterministic expiring date
          expDate = index % 2 === 0 ? '2026-07-04' : '2026-06-22'; 
        }

        if (expDate) {
          const exp = new Date(expDate);
          const diffTime = exp.getTime() - today.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

          // 30 Days expiration look-ahead trigger rule to send alert
          if (diffDays > 0 && diffDays <= 30 && category === 'Compliance') {
            list.push({
              learner: l,
              skillName: s.name,
              category,
              expirationDate: expDate,
              daysLeft: diffDays
            });
          }
        }
      });
    });

    return list.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [learners]);

  if (alerts.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-[#932c2e]/[0.02] to-[#a94228]/[0.02] border-2 border-dashed border-[#932c2e]/20 p-4.5 rounded-2xl relative overflow-hidden flex flex-col gap-3 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#932c2e]/10 text-[#932c2e] rounded-lg animate-pulse">
            <Icons.AlertOctagon size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="text-[12px] font-black text-[#932c2e] uppercase tracking-wide">
              COMPLIANCE AUDIT WARNING — RECERTIFICATION DUE ({alerts.length})
            </h4>
            <p className="text-[9px] text-[#7a8b95] font-bold uppercase tracking-widest mt-0.5 leading-none">
              In-app notification dispatched to line managers and trainees 30 days before expiration
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-[8.5px] font-black uppercase text-amber-600 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-full">
          ⚡ ACTION PRE-LINKABLE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
        {alerts.map((al, idx) => (
          <div 
            key={idx} 
            className="flex items-center justify-between p-3.5 bg-white border border-[#932c2e]/15 hover:border-[#a94228]/50 rounded-xl hover:shadow-2xs transition-all text-xs"
          >
            <div className="min-w-0 pr-3">
              <span className="block text-[10.5px] font-extrabold text-[#212c46] leading-snug truncate">
                {al.learner.employeeName} — {al.skillName}
              </span>
              <p className="text-[8.5px] font-bold text-[#7a8b95] uppercase tracking-wide mt-1">
                ⚠️ Compliance Expiry: <span className="font-mono text-rose-600 font-extrabold">{al.daysLeft} Days Left</span> (Dates: {al.expirationDate})
              </p>
            </div>
            
            <button
              onClick={() => onTriggerRecertify(al.learner, al.skillName)}
              className="bg-[#932c2e] hover:bg-[#a94228] text-white px-3 py-1.5 rounded-xl text-[8.5px] font-black uppercase tracking-widest leading-none shadow-sm hover:shadow transition-all shrink-0 cursor-pointer flex items-center gap-1"
            >
              <Icons.ShieldAlert size={10} /> Recertify
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
