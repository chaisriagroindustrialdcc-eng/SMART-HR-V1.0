/// <reference types="vite/client" />
import { ApiResponse } from '../types';

const SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbx3DLqU1OH1AtUnZnRBzte6JaIiL5Yw29wVfUQDrXCuV17uTY4noGoaAO5sn4dvR-CHQg/exec';

// Output setup status for easy debugging
console.log('App initialization - GAS Backend URL configured:', !!SCRIPT_URL);

// Cache utility for static data
export const cache = {
  get: (key: string) => {
    const item = localStorage.getItem(`wms_cache_${key}`);
    if (!item) return null;
    const parsed = JSON.parse(item);
    if (Date.now() > parsed.expiry) {
      localStorage.removeItem(`wms_cache_${key}`);
      return null;
    }
    return parsed.data;
  },
  set: (key: string, data: any, ttlMinutes: number = 60) => {
    const expiry = Date.now() + ttlMinutes * 60 * 1000;
    localStorage.setItem(`wms_cache_${key}`, JSON.stringify({ data, expiry }));
  },
  clear: (key?: string) => {
    if (key) localStorage.removeItem(`wms_cache_${key}`);
    else {
      Object.keys(localStorage)
        .filter(k => k.startsWith('wms_cache_'))
        .forEach(k => localStorage.removeItem(k));
    }
  }
};

export const api = {
  post: async <T = any>(action: string, sheet?: string, data?: any, params?: { limit?: number, offset?: number }): Promise<ApiResponse<T>> => {
    // Intercept mock logins for DEMO, DEV001, and U001 so they can always log in even if not present in Google Sheets yet
    if (action === 'login' && data) {
      const empId = data.employeeId;
      const iCard = data.idCard;
      if (
        (empId === 'DEMO' && iCard === 'DEMO123456789') || 
        (empId === 'U001' && iCard === 'ADMIN12345678') ||
        (empId === 'DEV001' && iCard === '1234567890123')
      ) {
        console.log('Intercepting login with built-in development credentials:', empId);
        return mockResponse(action, data);
      }
    }

    const activeUrl = localStorage.getItem('cfg_apps_script_url') || 
                      import.meta.env.VITE_APPS_SCRIPT_URL || 
                      'https://script.google.com/macros/s/AKfycbx3DLqU1OH1AtUnZnRBzte6JaIiL5Yw29wVfUQDrXCuV17uTY4noGoaAO5sn4dvR-CHQg/exec';

    if (!activeUrl) {
      console.warn('Google Apps Script URL is not configured. Using mock response.');
      return mockResponse(action, data);
    }
    
    try {
      const activeApiKey = localStorage.getItem('cfg_apps_script_api_key') || 
                           import.meta.env.VITE_API_KEY || 
                           'your_secret_key_here';

      const response = await fetch(activeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ 
          action, 
          sheet, 
          data, 
          apiKey: activeApiKey,
          ...params 
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

// Mock response for development if URL is not set or bypassed
async function mockResponse(action: string, data: any): Promise<ApiResponse> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (action === 'login') {
    if ((data.employeeId === 'DEMO' && data.idCard === 'DEMO123456789') || 
        (data.employeeId === 'U001' && data.idCard === 'ADMIN12345678') ||
        (data.employeeId === 'DEV001' && data.idCard === '1234567890123')) {
      const isOperator = data.employeeId === 'DEMO';
      const isSuperAdmin = data.employeeId === 'DEV001';
      return {
        status: 'success',
        data: {
          id: isOperator ? '3' : (isSuperAdmin ? '1' : '2'),
          employeeId: data.employeeId,
          name: isOperator ? 'Demo Operator' : (isSuperAdmin ? 'Super Admin' : 'Demo Admin'),
          role: isOperator ? 'Viewer' : (isSuperAdmin ? 'Developer' : 'Administrator'),
          isDev: isSuperAdmin,
          avatar: 'https://drive.google.com/thumbnail?id=1Z_fRbN9S4aA7OkHb3mlim_t60wIT4huY&sz=w400',
          permissions: {
            canCreate: !isOperator,
            canEdit: !isOperator,
            canApprove: !isOperator,
            canVerify: !isOperator,
          }
        }
      };
    }
    return { status: 'error', message: 'Invalid credentials' };
  }
  
  return { status: 'success', data: [] };
}
