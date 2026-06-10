/**
 * Central utility tracker for PrintLogs activity within the SystemLogs modules.
 * Records every time a print-layout-table is invoked, logging the page, user, and timestamp.
 */
export const registerPrintLog = (pageName: string) => {
  try {
    // 1. Get current logged in user details
    const userRaw = localStorage.getItem('user') || localStorage.getItem('smart_hr_user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const username = (user?.name || user?.employeeId || 'DEMO ADMIN').toUpperCase();
    const role = (user?.role || 'DEVELOPER').toUpperCase();

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logId = `LOG-PR${Math.floor(1000 + Math.random() * 9000)}`;

    const printItem = {
      id: logId,
      timestamp,
      user: username,
      role,
      ip: '192.168.1.' + Math.floor(10 + Math.random() * 240),
      module: pageName,
      action: 'PRINT_JOB',
      status: 'Success',
      details: `Printed table layout form on page "${pageName}"`,
      userAgent: navigator.userAgent
    };

    // 2. Add to central 'local_system_logs' list in localStorage so it reflects inside the SystemLogs view immediately
    const existingLogsRaw = localStorage.getItem('local_system_logs');
    const logs = existingLogsRaw ? JSON.parse(existingLogsRaw) : [];
    logs.unshift(printItem);
    localStorage.setItem('local_system_logs', JSON.stringify(logs));

    // 3. Keep a separate 'print_logs_tracker' list as well for custom queries/rendering
    const existingPrintLogsRaw = localStorage.getItem('print_logs_tracker');
    const printLogs = existingPrintLogsRaw ? JSON.parse(existingPrintLogsRaw) : [];
    printLogs.unshift({
      id: logId,
      pageName,
      timestamp,
      user: username,
      role
    });
    localStorage.setItem('print_logs_tracker', JSON.stringify(printLogs));

    console.log(`[PrintLogger] Registered audit log for page [${pageName}] by user [${username}]`);
    
    // Dispatch a custom event so reactive components can live-reload logs
    window.dispatchEvent(new CustomEvent('new-system-log', { detail: printItem }));
    window.dispatchEvent(new CustomEvent('new-print-log', { detail: printItem }));

  } catch (err) {
    console.error('[PrintLogger] Failed to log print job:', err);
  }
};
