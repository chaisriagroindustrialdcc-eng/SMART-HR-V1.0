/**
 * Central utility tracker for key HR activities within the SystemLogs modules.
 * Records actions like salary updates, disciplinary letters, or permission changes.
 */
export const registerHrLog = (
  moduleName: string,
  actionName: string,
  details: string,
  status: 'Success' | 'Warning' | 'Failed' = 'Success'
) => {
  try {
    // 1. Get current logged in user details
    const userRaw = localStorage.getItem('user') || localStorage.getItem('smart_hr_user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const username = (user?.name || user?.employeeId || 'DEMO ADMIN').toUpperCase();
    const role = (user?.role || 'DEVELOPER').toUpperCase();

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logId = `LOG-HR${Math.floor(10000 + Math.random() * 90000)}`;

    const logItem = {
      id: logId,
      timestamp,
      user: username,
      role,
      ip: '192.168.1.' + Math.floor(10 + Math.random() * 240),
      module: moduleName,
      action: actionName,
      status,
      details,
      userAgent: navigator.userAgent
    };

    // 2. Add to central 'local_system_logs' list in localStorage so it reflects inside the SystemLogs view immediately
    const existingLogsRaw = localStorage.getItem('local_system_logs');
    const logs = existingLogsRaw ? JSON.parse(existingLogsRaw) : [];
    logs.unshift(logItem);
    localStorage.setItem('local_system_logs', JSON.stringify(logs));

    console.log(`[HrLogger] Registered audit log for module [${moduleName}] action [${actionName}] by user [${username}]`);
    
    // Dispatch a custom event so reactive components can live-reload logs
    window.dispatchEvent(new CustomEvent('new-system-log', { detail: logItem }));

  } catch (err) {
    console.error('[HrLogger] Failed to log HR action:', err);
  }
};
