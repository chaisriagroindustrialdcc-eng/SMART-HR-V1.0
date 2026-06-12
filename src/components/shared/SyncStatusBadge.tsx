import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

export type SyncState = 'disconnected' | 'testing' | 'connected' | 'error' | 'idling';

interface SyncStatusBadgeProps {
  status: SyncState;
  className?: string;
}

export function SyncStatusBadge({ status, className = '' }: SyncStatusBadgeProps) {
  let bgClass = 'bg-slate-50 border-slate-200 text-slate-500';
  let icon = <XCircle size={12} />;
  let label = 'Idling';

  switch (status) {
    case 'connected':
      bgClass = 'bg-emerald-50 border-emerald-200 text-emerald-700';
      icon = <CheckCircle2 size={12} />;
      label = 'Connected';
      break;
    case 'testing':
      bgClass = 'bg-amber-100 border-amber-300 text-amber-700';
      icon = <Loader2 size={12} className="animate-spin" />;
      label = 'Testing';
      break;
    case 'disconnected':
      bgClass = 'bg-slate-100 border-slate-300 text-slate-500';
      icon = <XCircle size={12} />;
      label = 'Disconnected';
      break;
    case 'error':
      bgClass = 'bg-rose-50 border-rose-200 text-rose-700';
      icon = <AlertTriangle size={12} />;
      label = 'Error';
      break;
    case 'idling':
    default:
      bgClass = 'bg-sky-50 border-sky-100 text-[#3f809e]';
      icon = <CheckCircle2 size={12} className="opacity-60" />;
      label = 'Idling';
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-widest ${bgClass} ${className}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
}
