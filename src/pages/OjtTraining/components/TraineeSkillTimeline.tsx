import React, { useState, useEffect, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

interface TraineeSkillTimelineProps {
  isOpen: boolean;
  onClose: () => void;
  learnerId: string | null;
  onTriggerRecertify?: (learner: any, skillName: string) => void;
}

export default function TraineeSkillTimeline({
  isOpen,
  onClose,
  learnerId,
  onTriggerRecertify
}: TraineeSkillTimelineProps) {
  const [learner, setLearner] = useState<Learner | null>(null);
  const [coachingLogs, setCoachingLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'all' | 'coaching' | 'skills' | 'warnings'>('all');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Fetch individual trainee history and data Reactively
  useEffect(() => {
    if (!learnerId || !isOpen) return;

    setLoading(true);
    setExpandedEventId(null);

    // Simulate reactive API fetch
    const timer = setTimeout(() => {
      try {
        const storedLearners = localStorage.getItem('local_ojt_learners');
        const storedLogs = localStorage.getItem('local_ojt_logs');

        const learnersList: Learner[] = storedLearners ? JSON.parse(storedLearners) : [];
        const logsListByTrainee: any[] = storedLogs ? JSON.parse(storedLogs) : [];

        const found = learnersList.find((l) => l.id === learnerId) || null;
        const traineeLogs = logsListByTrainee.filter((log) => log.learnerId === learnerId);

        setLearner(found);
        setCoachingLogs(traineeLogs);
      } catch (err) {
        console.error('Failed fetching individual training history:', err);
      } finally {
        setLoading(false);
      }
    }, 450); // Elegant small loading spinner to match high-standard systems

    return () => clearTimeout(timer);
  }, [learnerId, isOpen]);

  // Construct structured timeline events
  const timelineEvents = useMemo(() => {
    if (!learner) return [];

    const events: any[] = [];
    const skills = learner.skills || [];

    // 1. Mastered Skills events
    skills.forEach((s, idx) => {
      if (s.mastered) {
        events.push({
          id: `skill-mastery-${idx}`,
          type: 'skill_vetted',
          title: `Competency Mastered: ${s.name}`,
          date: s.acquiredDate || `2026-05-${12 + idx}`,
          category: s.category || 'Technical',
          badge: 'Mastered ✦',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          icon: Icons.Award,
          description: `Formally certified in "${s.name}". Standards cleared during division audits.`,
          skill: s
        });
      }

      // Check for expiration warning status
      const category = s.category || 'Technical';
      let expDate = s.expirationDate;
      if (s.mastered && category === 'Compliance' && !expDate) {
        expDate = `2026-07-04`;
      }

      if (expDate) {
        const today = new Date('2026-06-10');
        const exp = new Date(expDate);
        const diffDays = Math.round((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 30) {
          events.push({
            id: `skill-recertify-${idx}`,
            type: 'recertification_due',
            title: `RE-CERTIFICATION WARNING: ${s.name}`,
            date: expDate,
            category: 'Compliance',
            badge: 'Urgent Alert ⚠️',
            badgeClass: 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse',
            icon: Icons.AlertTriangle,
            description: `Compliance expiration due in less than 30 days. Action required immediately to renew certified status.`,
            skill: s
          });
        }
      }
    });

    // 2. Mentored session coaching events
    coachingLogs.forEach((log) => {
      events.push({
        id: `coaching-${log.id}`,
        type: 'coaching_session',
        title: `OJT Mentorship: ${log.subject}`,
        date: log.date,
        category: 'Learning Log',
        badge: 'Coaching Session',
        badgeClass: 'bg-sky-50 text-sky-700 border-sky-100',
        icon: Icons.BookOpenCheck,
        description: log.notes,
        trainer: log.trainerName,
        duration: log.durationMinutes,
        rating: log.rating || 4.5
      });
    });

    // Filter list
    return events
      .filter((ev) => {
        if (filterType === 'all') return true;
        if (filterType === 'coaching') return ev.type === 'coaching_session';
        if (filterType === 'skills') return ev.type === 'skill_vetted';
        if (filterType === 'warnings') return ev.type === 'recertification_due';
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [learner, coachingLogs, filterType]);

  // Compute stats
  const computedProgress = useMemo(() => {
    if (!learner) return 0;
    const skills = learner.skills || [];
    if (skills.length === 0) return 0;
    const mastered = skills.filter((s) => s.mastered).length;
    return Math.round((mastered / skills.length) * 100);
  }, [learner]);

  if (!isOpen) return null;

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${learner?.employeeName || 'Apprentice'} - Individual Learning Timeline`}
    >
      <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar flex flex-col bg-white max-w-xl text-left font-sans">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Icons.RotateCw className="w-10 h-10 animate-spin text-[#b58c4f] mb-3" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#7a8b95]">
              Fetching training history dossier...
            </span>
          </div>
        ) : !learner ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No trainee file found for ID "{learnerId}"
          </div>
        ) : (
          <div className="flex flex-col text-left">
            {/* Header Mini Dossier Card */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white relative overflow-hidden mb-6 shadow-md border-b-[3px] border-[#b58c4f]">
              <div className="absolute right-3 bottom-1.5 opacity-5 pointer-events-none transform rotate-12 scale-150 text-[#b58c4f]">
                <Icons.Activity size={120} />
              </div>
              <div className="relative z-10">
                <span className="text-[8.5px] bg-[#b58c4f] px-2 py-0.5 rounded text-white font-black uppercase tracking-[0.15em]">
                  Dossier Active: {learner.status}
                </span>
                
                <h3 className="text-[16px] font-black tracking-tight mt-2.5 leading-none">
                  {learner.employeeName}
                </h3>
                <p className="text-[10px] text-zinc-300 font-bold mt-1.5 uppercase font-mono tracking-wider">
                  {learner.role} &bull; {learner.dept}
                </p>

                <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-white/10 text-[10px] text-zinc-400">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-zinc-500 font-black uppercase text-[8px] tracking-wider">Assigned Coach</span>
                    <strong className="text-white text-[10.5px]">{learner.trainerName}</strong>
                  </div>
                  <div className="flex flex-col gap-0.5 text-right">
                    <span className="text-zinc-500 font-black uppercase text-[8px] tracking-wider">Completed Hours</span>
                    <strong className="text-[#b58c4f] text-[11px] font-mono">{learner.hoursCompleted} / {learner.totalHours} Hrs</strong>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[9px] text-zinc-300 font-bold mb-1">
                    <span>OJT Core Competency Mastery</span>
                    <span className="font-mono text-[#b58c4f]">{computedProgress}%</span>
                  </div>
                  <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#b58c4f] to-emerald-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${computedProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Toggle Row */}
            <div className="flex items-center justify-between gap-2 border-b border-dashed border-slate-100 pb-3 mb-5">
              <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider">
                Event Filters
              </span>
              <div className="flex items-center gap-1.5 bg-slate-50/70 p-1 border border-slate-100 rounded-lg">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 text-[8.5px] font-black uppercase rounded tracking-wider cursor-pointer transition-all ${filterType === 'all' ? 'bg-[#212c46] text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  All ({coachingLogs.length + (learner.skills?.filter(s => s.mastered).length || 0)})
                </button>
                <button
                  onClick={() => setFilterType('coaching')}
                  className={`px-2.5 py-1 text-[8.5px] font-black uppercase rounded tracking-wider cursor-pointer transition-all ${filterType === 'coaching' ? 'bg-[#212c46] text-[#3f809e]' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Sessions ({coachingLogs.length})
                </button>
                <button
                  onClick={() => setFilterType('skills')}
                  className={`px-2.5 py-1 text-[8.5px] font-black uppercase rounded tracking-wider cursor-pointer transition-all ${filterType === 'skills' ? 'bg-[#212c46] text-emerald-400' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Masteries
                </button>
                <button
                  onClick={() => setFilterType('warnings')}
                  className={`px-2.5 py-1 text-[8.5px] font-black uppercase rounded tracking-wider cursor-pointer transition-all ${filterType === 'warnings' ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'text-rose-500 hover:text-rose-900'}`}
                >
                  Alerts
                </button>
              </div>
            </div>

            {/* The Vertical Interactive Process Timeline Grid */}
            <div className="relative pl-6 border-l-2 border-slate-100 space-y-5">
              <div className="absolute -left-[5px] top-0.5 w-2 h-2 rounded-full bg-slate-400" />
              
              {timelineEvents.length === 0 ? (
                <div className="text-center py-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  No events found in this category
                </div>
              ) : (
                timelineEvents.map((ev) => {
                  const Icon = ev.icon;
                  const isExpanded = expandedEventId === ev.id;
                  return (
                    <div key={ev.id} className="relative group text-left">
                      {/* Event Bubble Marker */}
                      <div className="absolute -left-[32px] top-1 bg-white p-1 rounded-full border-2 border-slate-200 group-hover:border-[#b58c4f] group-hover:scale-110 transition-all text-slate-700">
                        <Icon size={10} strokeWidth={2.5} />
                      </div>

                      {/* Event Card Panel with clickable toggle */}
                      <div 
                        onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
                        className={`border rounded-xl p-3.5 hover:shadow-xs transition-all cursor-pointer text-left ${isExpanded ? 'bg-slate-50 border-[#b58c4f]/55 shadow-xs' : 'bg-white border-slate-100 hover:bg-slate-50/55'}`}
                      >
                        <div className="flex justify-between items-start gap-1 flex-wrap">
                          <span className={`text-[7.5px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${ev.badgeClass}`}>
                            {ev.badge}
                          </span>
                          <span className="text-[9px] font-bold font-mono text-slate-400 tracking-tight">
                            {ev.date}
                          </span>
                        </div>

                        <h4 className="text-[11.5px] font-black text-[#212c46] mt-2 group-hover:text-[#b58c4f] transition-colors leading-snug">
                          {ev.title}
                        </h4>

                        {/* Expandable detailed drawer */}
                        <div className="overflow-hidden transition-all">
                          {isExpanded ? (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-2.5 pt-2.5 border-t border-dashed border-slate-200 text-[10.5px] text-slate-500 leading-relaxed font-sans"
                            >
                              <p className="italic bg-white/70 p-2 border border-slate-100 rounded-lg">
                                "{ev.description || 'No assessor details recorded'}"
                              </p>
                              
                              {ev.trainer && (
                                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1.5 items-center justify-between text-[8.5px] text-[#212c46] font-bold uppercase tracking-wider">
                                  <span>Assigned Coach: <strong className="text-indigo-600">{ev.trainer}</strong></span>
                                  <span>Logged Duration: <strong className="text-zinc-600">{ev.duration} Mins</strong></span>
                                  <span>Training Score: <span className="text-emerald-600">★ {ev.rating} / 5.0</span></span>
                                </div>
                              )}

                              {ev.type === 'recertification_due' && onTriggerRecertify && (
                                <div className="mt-2.5 flex items-center justify-end">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onTriggerRecertify(learner, ev.skill.name);
                                      onClose();
                                    }}
                                    className="px-3 py-1 text-[8.5px] bg-[#932c2e] text-white hover:bg-[#a94228] font-black uppercase tracking-wider rounded-lg shadow-xs transition-colors cursor-pointer"
                                  >
                                    🚀 Renew Compliance Cert Now
                                  </button>
                                </div>
                              )}
                            </motion.div>
                          ) : (
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mt-1 text-right leading-none">
                              Click to expand feedback &bull; 📂
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-[10.5px] font-black uppercase tracking-widest transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        )}
      </div>
    </DraggableModal>
  );
}
