import React, { useState } from 'react';
import * as Icons from 'lucide-react';

interface SkillRecommenderProps {
  onAdoptSkill?: (skill: { name: string; category: 'Technical' | 'Compliance' | 'Soft Skills' }, learnerId: string) => void;
  learners: any[];
}

export default function SkillRecommender({ onAdoptSkill, learners }: SkillRecommenderProps) {
  const [jobTitle, setJobTitle] = useState('Operations Assistant');
  const [role, setRole] = useState('Operations Trainee');
  const [dept, setDept] = useState('Property Management');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedLearnerId, setSelectedLearnerId] = useState('');

  const handleSelectLearner = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedLearnerId(id);
    const matched = learners.find((l) => l.id === id);
    if (matched) {
      setJobTitle(matched.role || 'Apprentice');
      setRole(matched.role || 'Apprentice');
      setDept(matched.dept || 'Operations');
    }
  };

  const handleRecommend = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/skills-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, role, department: dept })
      });
      const data = await res.json();
      if (data && Array.isArray(data.recommendations)) {
        setResults(data.recommendations);
        setIsOffline(data.offline || false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#eaeaec] p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col">
      <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#b58c4f]/15 text-[#b58c4f] rounded-lg">
            <Icons.Cpu size={15} strokeWidth={2.5} className="animate-pulse" />
          </div>
          <div>
            <h4 className="text-[11.5px] font-black text-[#212c46] uppercase tracking-wider">
              AI OJT Skill Recommender
            </h4>
            <p className="text-[9px] text-[#7a8b95] font-bold uppercase tracking-widest leading-none mt-0.5">
              Gemini-Powered Training Curriculum Generator
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3.5 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Quick Prefill from Learner List */}
          <div>
            <label className="block text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Prefill From Active Apprentice Profile
            </label>
            <select
              value={selectedLearnerId}
              onChange={handleSelectLearner}
              className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-3 py-2 text-[11px] font-bold text-[#212c46] outline-none"
            >
              <option value="">-- Let's prefll employee profile --</option>
              {learners.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.employeeName} ({l.role})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-[#212c46]"
              />
            </div>
            <div>
              <label className="block text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Department
              </label>
              <input
                type="text"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-[#eaeaec] rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-[#212c46]"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleRecommend}
          disabled={isLoading}
          className="mt-4 w-full bg-[#212c46] hover:bg-[#b58c4f] text-white disabled:bg-slate-300 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Icons.Loader2 size={12} className="animate-spin" /> Suggesting Skills...
            </>
          ) : (
            <>
              <Icons.Sparkles size={12} /> Suggest Custom OJT Skills
            </>
          )}
        </button>

        {/* Results Stream */}
        <div className="mt-3 space-y-2.5">
          {results.length > 0 && (
            <div className="flex justify-between items-center text-[8.5px] font-black uppercase text-[#212c46] tracking-wider mb-1">
              <span>Suggested Syllabi:</span>
              {isOffline ? (
                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Offline Backups</span>
              ) : (
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Gemini Live</span>
              )}
            </div>
          )}

          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {results.map((r, i) => (
              <div
                key={i}
                className="p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl hover:border-[#b58c4f]/40 transition-colors text-left flex flex-col justify-between relative group"
              >
                <div className="flex justify-between items-start gap-1">
                  <span className="text-[11px] font-black text-[#212c46] leading-tight max-w-[200px]">
                    {r.name}
                  </span>
                  <span className={`text-[7px] font-black uppercase px-1 rounded-sm tracking-wider shrink-0 ${
                    r.category === 'Compliance' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-[#3f809e]/10 text-[#3f809e] border border-[#3f809e]/20'
                  }`}>
                    {r.category}
                  </span>
                </div>
                <p className="text-[9px] text-[#7a8b95] font-bold leading-normal mt-1 italic font-sans">
                  "{r.rationale}"
                </p>

                {onAdoptSkill && selectedLearnerId && (
                  <button
                    onClick={() => onAdoptSkill({ name: r.name, category: r.category }, selectedLearnerId)}
                    className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-1 bg-[#212c46] hover:bg-[#657f4d] rounded-md text-white transition-opacity cursor-pointer"
                    title="Adopt skill into checklist"
                  >
                    <Icons.Plus size={10} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
