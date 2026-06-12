import { GASService } from './GoogleAppsScriptService';

export interface SchemaAwareRecord {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

/**
 * Frontend client service that delegates data saving to the Google Sheets backend.
 * Features auto-provisioning detection and fallback to local persistent storage (localStorage)
 * if VITE_APPS_SCRIPT_URL is not set.
 */
export const SchemaAwareDataService = {
  /**
   * Saves a record to a specified Google Sheet.
   * If the sheet does not exist, the backend automatically provisions it,
   * extracts the headers from the record keys, sets frozen row 1, and applies #e6b8af header background.
   */
  async save(sheetName: string, record: SchemaAwareRecord): Promise<{ status: 'success' | 'error'; message: string; data?: any }> {
    const freshRecord = {
      ...record,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    if (!freshRecord.createdAt) {
      freshRecord.createdAt = freshRecord.updatedAt;
    }

    console.log(`[Schema-Aware Service] Initiating Save on '${sheetName}' for ID '${freshRecord.id}'`);
    console.log(`[Schema-Aware Service] Fields mapped for headers:`, Object.keys(freshRecord));

    try {
      // Check if API is configured
      const scriptUrl = localStorage.getItem('cfg_apps_script_url') || import.meta.env.VITE_APPS_SCRIPT_URL;
      if (!scriptUrl) {
        console.warn(`[Schema-Aware Service] VITE_APPS_SCRIPT_URL is not configured. Falling back to LocalStorage.`);
        // LocalStorage Fallback
        const storageKey = `gas_fallback_sheet_${sheetName}`;
        const existingDataRaw = localStorage.getItem(storageKey);
        const list: SchemaAwareRecord[] = existingDataRaw ? JSON.parse(existingDataRaw) : [];
        
        const existingIndex = list.findIndex(r => r.id === freshRecord.id);
        if (existingIndex !== -1) {
          list[existingIndex] = freshRecord;
        } else {
          list.push(freshRecord);
        }
        localStorage.setItem(storageKey, JSON.stringify(list));

        // Create a simulated print/audit log to preserve trace
        this.logToSystemLogs(`Saved (Local Fallback) record in '${sheetName}'`, 'SAVE_RECORD');

        return {
          status: 'success',
          message: `Successfully saved to LocalStorage Fallback for sheet: ${sheetName}`,
          data: freshRecord
        };
      }

      // If online, perform lookup first to decide if write (insert) or update
      let exists = false;
      try {
        const lookupResult = await GASService.lookup(sheetName, { id: freshRecord.id });
        if (lookupResult && lookupResult.status === 'success' && lookupResult.data && lookupResult.data.length > 0) {
          exists = true;
        }
      } catch (err) {
        // If lookup fails because sheet does not exist, it's expected and we proceed to write (which auto-provisions)
        console.log(`[Schema-Aware Service] Sheet or record not found, proceed to auto-provision during write.`);
      }

      let response;
      if (exists) {
        console.log(`[Schema-Aware Service] Record exists. Executing UPDATE command on Google Sheet.`);
        response = await GASService.update(sheetName, freshRecord);
      } else {
        console.log(`[Schema-Aware Service] Record is new. Executing WRITE (Insert) command on Google Sheet.`);
        response = await GASService.write(sheetName, freshRecord);
      }

      this.logToSystemLogs(`Saved (Google Sheets) record in '${sheetName}' with ID ${freshRecord.id}`, 'SAVE_RECORD');
      return {
        status: 'success',
        message: response.message || `Successfully integrated and saved into Google Sheet: ${sheetName}`,
        data: freshRecord
      };
    } catch (error: any) {
      console.error(`[Schema-Aware Service] Error saving to ${sheetName}:`, error);
      return {
        status: 'error',
        message: error.message || `Failed to save record to ${sheetName}`
      };
    }
  },

  /**
   * Retrieves all records from a specified list/sheet.
   */
  async getAll(sheetName: string, defaultData: any[] = []): Promise<any[]> {
    try {
      const scriptUrl = localStorage.getItem('cfg_apps_script_url') || import.meta.env.VITE_APPS_SCRIPT_URL;
      if (!scriptUrl) {
        const storageKey = `gas_fallback_sheet_${sheetName}`;
        const existingDataRaw = localStorage.getItem(storageKey);
        return existingDataRaw ? JSON.parse(existingDataRaw) : defaultData;
      }

      const response = await GASService.read(sheetName);
      if (response && response.status === 'success' && Array.isArray(response.data)) {
        return response.data;
      }
      return defaultData;
    } catch (error) {
      console.warn(`[Schema-Aware Service] Error reading from GAS, using default data:`, error);
      const storageKey = `gas_fallback_sheet_${sheetName}`;
      const existingDataRaw = localStorage.getItem(storageKey);
      return existingDataRaw ? JSON.parse(existingDataRaw) : defaultData;
    }
  },

  /**
   * Helper to write an action to the central SystemLogs sheet or localStorage logs list
   */
  logToSystemLogs(details: string, action: string = 'SAVE_RECORD') {
    try {
      const userRaw = localStorage.getItem('user') || localStorage.getItem('smart_hr_user');
      const user = userRaw ? JSON.parse(userRaw) : { name: 'SYSTEM / USER' };
      
      const newLog = {
        id: `LOG-SA${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: (user.name || user.employeeId || 'CURRENT USER').toUpperCase(),
        role: (user.role || 'USER').toUpperCase(),
        ip: '192.168.1.' + Math.floor(10 + Math.random() * 200),
        module: 'Schema-Aware Save',
        action: action,
        status: 'Success',
        details: details,
        userAgent: navigator.userAgent
      };

      const existingLogs = localStorage.getItem('system_logs_backup');
      const list = existingLogs ? JSON.parse(existingLogs) : [];
      list.unshift(newLog);
      localStorage.setItem('system_logs_backup', JSON.stringify(list));
    } catch (err) {
      console.error('Failed to log schema-aware save activity:', err);
    }
  }
};
