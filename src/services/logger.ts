export interface SystemLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  ip: string;
  module: string;
  action: string;
  status: 'Success' | 'Failed' | 'Warning';
  details: string;
  userAgent: string;
}

export function addSystemLog(
  module: string,
  action: string,
  status: 'Success' | 'Failed' | 'Warning',
  details: string,
  userName?: string,
  userRole?: string
) {
  // Retrieve current logs or fallback
  const saved = localStorage.getItem('local_system_logs');
  let logs: SystemLog[] = [];
  if (saved) {
    try {
      logs = JSON.parse(saved);
    } catch (e) {
      logs = [];
    }
  }

  // Generate a random IP address similar to mock logs
  const ip = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  
  const newLog: SystemLog = {
    id: `LOG-${Date.now().toString().slice(-5)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    user: userName || 'SYSTEM',
    role: userRole || 'SYSTEM',
    ip,
    module,
    action,
    status,
    details,
    userAgent: navigator.userAgent || 'Mozilla/5.0'
  };

  const updatedLogs = [newLog, ...logs];
  localStorage.setItem('local_system_logs', JSON.stringify(updatedLogs));

  // Dispatch a custom event in case there is a live page looking for it
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('new-system-log', { detail: newLog }));
  }
}
