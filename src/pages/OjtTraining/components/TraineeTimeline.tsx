import React from 'react';
import * as Icons from 'lucide-react';
import { DraggableModal } from '../../../components/shared/DraggableModal';

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

interface TraineeTimelineProps {
  isOpen: boolean;
  onClose: () => void;
  learner: any;
  coachingLogs: any[];
  onTriggerRecertify?: (learner: any, skillName: string) => void;
}

interface TimelineEvent {
  type: string;
  title: string;
  date: string;
  category: string;
  badgeColor: string;
  badge: string;
  icon: React.ComponentType<any>;
  skill?: SkillItem;
  log?: any;
}

export default function TraineeTimeline({
  isOpen,
  onClose,
  learner,
  coachingLogs,
  onTriggerRecertify
}: TraineeTimelineProps) {
  if (!learner) return null;

  // Filter logs for this specific learner
  const associatedLogs = coachingLogs
    .filter((log) => log.learnerId === learner.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Set default categories and dates on the fly for demonstration and full tracking depth
  const processedSkills: SkillItem[] = (learner.skills || []).map((skill, index) => {
    // Generate logical categories & dates if they aren't saved in database yet
    const category: 'Technical' | 'Compliance' | 'Soft Skills' =
      skill.category ||
      (skill.name.toLowerCase().includes('regulatory') ||
      skill.name.toLowerCase().includes('code') ||
      skill.name.toLowerCase().includes('compliance') ||
      skill.name.toLowerCase().includes('privacy') ||
      skill.name.toLowerCase().includes('standard')
        ? 'Compliance'
        : skill.name.toLowerCase().includes('introduction') ||
          skill.name.toLowerCase().includes('voice') ||
          skill.name.toLowerCase().includes('incident')
        ? 'Soft Skills'
        : 'Technical');

    const acquiredDate = skill.acquiredDate || (skill.mastered ? `2026-05-${10 + index}` : undefined);
    
    // Set some skills as "Needs Recertification" (e.g., expiring mid-July 2026)
    let expirationDate = skill.expirationDate;
    if (skill.mastered && category === 'Compliance' && !expirationDate) {
      expirationDate = `2026-07-04`; // Within 30 days of June 10, 2026!
    }

    // Determine status based on expirationDate
    let status: 'Active' | 'Expired' | 'Needs Recertification' = 'Active';
    if (expirationDate) {
      const today = new Date('2026-06-10'); // Unified focal system date
      const exp = new Date(expirationDate);
      const diffTime = exp.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) {
        status = 'Expired';
      } else if (diffDays <= 30) {
        status = 'Needs Recertification';
      }
    }

    return { ...skill, category, acquiredDate, expirationDate, status };
  });

  // Calculate timeline entries (Skills + Logs sorted chronologically)
  const timelineEvents: TimelineEvent[] = [
    ...processedSkills
      .filter((s) => s.mastered)
      .map((s) => ({
        type: 'skill_vetted',
        title: `Competency Mastered: ${s.name}`,
        date: s.acquiredDate || '2026-06-01',
        category: s.category || 'Technical',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        badge: 'MASTERED ✦',
        icon: Icons.Award,
        skill: s
      })),
    ...processedSkills
      .filter((s) => s.status === 'Needs Recertification' || s.status === 'Expired')
      .map((s) => ({
        type: 'recertification_due',
        title: `RE-CERTIFICATION REQUIRED: ${s.name}`,
        date: s.expirationDate || '2026-07-04',
        category: s.category || 'Compliance',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse',
        badge: 'RE-CERTIFY DUE ⚠️',
        icon: Icons.Clock,
        skill: s
      })),
    ...associatedLogs.map((log) => ({
      type: 'coaching_session',
      title: `OJT Coaching: ${log.subject}`,
      date: log.date,
      category: 'Technical',
      badgeColor: 'bg-[#3f809e]/15 text-[#3f809e] border-[#3f809e]/30',
      badge: 'SESSION ✍',
      icon: Icons.BookOpenCheck,
      log
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title={`${learner.employeeName} - Digital OJT Timeline & History`}>
      <div className="p-6 max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col bg-white max-w-lg font-sans text-left">
        {/* Trainee Card header */}
        <div className="bg-[#212c46] text-white p-4 rounded-xl mb-6 relative overflow-hidden">
          <div className="absolute right-[-10%] bottom-[-20%] opacity-15 pointer-events-none transform -rotate-12">
            <Icons.History size={140} />
          </div>
          <div className="relative z-10 text-left">
            <p className="text-[9px] text-[#b58c4f] font-black uppercase tracking-widest leading-none">APPRENTICESHIP FILE</p>
            <h3 className="text-[17px] font-black tracking-tight mt-1 leading-none">{learner.employeeName}</h3>
            <p className="text-[10px] text-zinc-300 font-medium tracking-wide mt-2">
              ID: {learner.employeeId} &bull; {learner.dept}
            </p>
            <p className="text-[10.5px] font-black text-[#b58c4f] mt-1 uppercase">
              Current Title: {learner.role}
            </p>
          </div>
        </div>

        {/* Vertical Timeline */}
        <div className="flex-1 text-left relative pl-5 border-l-2 border-slate-100 space-y-6">
          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#b58c4f] border-4 border-white shadow-sm" />
          
          <span className="block text-[8.5px] font-black text-[#7a8b95] uppercase tracking-widest leading-none mb-4">
            Curriculum Milestones & History Logs
          </span>

          {timelineEvents.length === 0 ? (
            <div className="text-center py-10 text-[#7a8b95] font-bold uppercase tracking-widest text-[9.5px]">
              <Icons.History className="mx-auto w-6 h-6 opacity-30 mb-2 animate-bounce" />
              No Learning Activities Logged Yet
            </div>
          ) : (
            timelineEvents.map((ev, index) => {
              const IconComponent = ev.icon;
              return (
                <div key={index} className="relative group">
                  {/* Event Marker */}
                  <div className="absolute -left-[29px] top-1.5 p-1 rounded-full bg-white border-2 border-slate-200 group-hover:border-[#b58c4f] group-hover:scale-110 transition-all text-[#212c46] shadow-2xs">
                    <IconComponent size={10} />
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 hover:shadow-2xs transition-shadow">
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <span className={`text-[7px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider border ${ev.badgeColor}`}>
                        {ev.badge}
                      </span>
                      <span className="text-[9.5px] font-bold font-mono text-slate-400">
                        {ev.date}
                      </span>
                    </div>

                    <h5 className="text-[11.5px] font-black text-[#212c46] mt-2 leading-tight">
                      {ev.title}
                    </h5>

                    {ev.skill && (
                      <div className="mt-2 flex items-center justify-between text-[9px]">
                        <span className="font-extrabold text-[#7a8b95] uppercase tracking-widest bg-gray-100 px-1.5 py-0.2 rounded">
                          🎨 {ev.category} Skill
                        </span>
                        
                        {(ev.skill.status === 'Needs Recertification' || ev.skill.status === 'Expired') && onTriggerRecertify && (
                          <button
                            onClick={() => {
                              onTriggerRecertify(learner, ev.skill.name);
                              onClose();
                            }}
                            className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-0.8 rounded text-[8.5px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Icons.RefreshCw size={8} /> Recertify
                          </button>
                        )}
                      </div>
                    )}

                    {ev.log && (
                      <div className="mt-2 text-[10px] text-[#7a8b95] leading-relaxed font-sans border-t border-slate-200/40 pt-2 italic">
                        "{ev.log.notes}"
                        <p className="not-italic text-[8.5px] text-[#212c46] font-bold mt-1 uppercase">
                          Coached by {ev.log.trainerName} &bull; {ev.log.durationMinutes} mins
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DraggableModal>
  );
}
