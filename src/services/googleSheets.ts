export const SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbx3DLqU1OH1AtUnZnRBzte6JaIiL5Yw29wVfUQDrXCuV17uTY4noGoaAO5sn4dvR-CHQg/exec';

const getActiveScriptUrl = () => {
  return localStorage.getItem('cfg_apps_script_url') || SCRIPT_URL;
};

export interface SheetResponse {
  status: 'success' | 'error';
  message: string;
}

export const googleSheetsService = {
  /**
   * สร้างชีตใหม่ (Tab) และกำหนด Header อัตโนมัติ
   * @param sheetName ชื่อชีต (เช่น 'Products', 'Users')
   * @param headers อาร์เรย์ของชื่อคอลัมน์ (เช่น ['ID', 'Name', 'Price'])
   */
  async createSheetWithHeaders(sheetName: string, headers: string[]): Promise<SheetResponse> {
    const url = getActiveScriptUrl();
    if (!url) {
      console.warn('VITE_APPS_SCRIPT_URL is not set in environment variables.');
      return { status: 'error', message: 'URL not configured' };
    }

    try {
      // ใช้ text/plain เพื่อหลีกเลี่ยง CORS preflight request
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'createSheet',
          sheetName,
          headers,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating sheet:', error);
      throw error;
    }
  },

  /**
   * เพิ่มข้อมูลแถวใหม่ลงในชีต
   * @param sheetName ชื่อชีต
   * @param rowData อาร์เรย์ของข้อมูลเรียงตามคอลัมน์
   */
  async appendRow(sheetName: string, rowData: any[]): Promise<SheetResponse> {
    const url = getActiveScriptUrl();
    if (!url) {
      console.warn('VITE_APPS_SCRIPT_URL is not set in environment variables.');
      return { status: 'error', message: 'URL not configured' };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'appendRow',
          sheetName,
          rowData,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error appending row:', error);
      throw error;
    }
  }
};
