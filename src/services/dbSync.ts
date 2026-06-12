import { doc, setDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './firebase';
import { GASService, GAS_WEB_APP_URL } from './GoogleAppsScriptService';
import { api } from './api';

/**
 * Sync mapping between Google Sheets and Firestore collections
 */
function getCollectionName(sheetName: string): string {
  const name = sheetName.toLowerCase();
  if (name === 'calendarevents' || name === 'calendar_events') {
    return 'calendar_events';
  }
  if (name === 'accesslogs' || name === 'access_logs' || name === 'system_logs' || name === 'systemlogs') {
    return 'system_logs';
  }
  if (name === 'users' || name === 'userpermissions') {
    return 'users';
  }
  if (name === 'systemconfig') {
    return 'system_config';
  }
  if (name === 'leaverequests' || name === 'leave_requests') {
    return 'leave_requests';
  }
  if (name === 'appraisals' || name === 'appraisal_requests') {
    return 'appraisals';
  }
  if (name === 'employees') {
    return 'employees';
  }
  if (name === 'companyholidays' || name === 'company_holidays' || name === 'holidays') {
    return 'company_holidays';
  }
  return sheetName;
}

export function updateLastSyncTimestamp() {
  const currentTimestamp = new Date().toISOString();
  try {
    localStorage.setItem('last_firebase_sync_time', currentTimestamp);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('firebase-synced', { detail: { timestamp: currentTimestamp } }));
    }
  } catch (err) {
    console.error('Failed to update sync timestamp:', err);
  }
}

export const dbSync = {
  /**
   * Reads data. It first tries to read from Firestore (highly performant / cached),
   * and if Firestore fails or is empty, it falls back to Google Apps Script (Google Sheets),
   * then caches the Google Sheets data in Firestore to speed up subsequent loads.
   * If both fail, it falls back to LocalStorage with robust Seed fallback data.
   */
  async read(sheetName: string): Promise<any> {
    const colName = getCollectionName(sheetName);
    
    // 1. Try Firestore read
    try {
      console.log(`[dbSync] Attempting to read ${sheetName} from Firestore (${colName})...`);
      const colRef = collection(db, colName);
      
      // Implement a 5000ms timeout for Firestore read to prevent long hangs
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Firestore read timeout")), 5000)
      );
      
      const snapshot = await Promise.race([
        getDocs(colRef),
        timeoutPromise
      ]);
      
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        console.log(`[dbSync] Successfully read ${items.length} items from Firestore.`);
        updateLastSyncTimestamp();
        return { status: 'success', data: { items } };
      }
      
      console.log(`[dbSync] Firestore collection ${colName} is empty. Falling back to Google Apps Script...`);
    } catch (err) {
      if (err instanceof Error && (err.message.includes('permission') || err.message.includes('Permission') || (err as any).code === 'permission-denied')) {
        try {
          handleFirestoreError(err, OperationType.LIST, colName);
        } catch (jsonErr) {
          console.error('[dbSync] Firestore permission error logged. Propagating fallback:', jsonErr);
        }
      }
      console.warn(`[dbSync] Firestore read failed or timed out. Falling back to Google Apps Script:`, err);
    }

    // 2. Try Google Apps Script (GAS) read
    if (GAS_WEB_APP_URL && GAS_WEB_APP_URL !== "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE" && GAS_WEB_APP_URL.trim() !== "") {
      try {
        // Implement a 10000ms timeout for GAS read
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("GAS read timeout")), 10000)
        );
        
        const response = await Promise.race([
          GASService.read(sheetName),
          timeoutPromise
        ]);
        
        // Safely sync Google Sheets data back into Firestore in the background for next loads
        if (response && response.status === 'success' && response.data && Array.isArray(response.data.items)) {
          const items = response.data.items;
          console.log(`[dbSync] Syncing ${items.length} items from Google Sheets into Firestore in the background.`);
          this.backgroundSyncToFirestore(sheetName, items).catch(err => {
            console.error('[dbSync] Background sync to Firestore failed:', err);
          });
        }
        
        return response;
      } catch (err) {
        console.warn(`[dbSync] Google Apps Script read failed. Falling back to LocalStorage fallback...`, err);
      }
    } else {
      console.log(`[dbSync] GAS is unconfigured. Skipping read fallback for ${sheetName}.`);
    }

    // 3. LocalStorage Fallback read
    const localKey = `db_sync_fallback_${colName}`;
    try {
      const stored = localStorage.getItem(localKey);
      if (stored) {
        const items = JSON.parse(stored);
        console.log(`[dbSync] Successfully read ${items.length} items from LocalStorage fallback.`);
        return { status: 'success', data: { items } };
      }
    } catch (err) {
      console.error(`[dbSync] LocalStorage read failed:`, err);
    }

    // 4. Default Seed/Mock Data Seed if nothing exists
    let seedItems: any[] = [];
    if (colName === 'calendar_events') {
      seedItems = [
        {
          id: 'seed-event-1',
          date: '2026-06-05',
          title: 'Smart HR Copilot Alignment Session (ประชุมปรับแนวทางระบบผู้ช่วยงาน)',
          time: '11:00',
          type: 'Meeting',
          priority: 'Normal',
          status: 'Confirmed'
        },
        {
          id: 'seed-event-2',
          date: '2026-06-10',
          title: 'Quality Assurance Review (ตรวจสอบและควบคุมคุณภาพงานบุคคล)',
          time: '14:00',
          type: 'Quality',
          priority: 'Normal',
          status: 'Confirmed'
        },
        {
          id: 'seed-event-3',
          date: '2026-06-15',
          title: 'Supplier Audit - Vendor Evaluator (ตรวจประเมินโรงงานผู้บำรุงรักษาโรงงาน)',
          time: '10:00',
          type: 'Audit',
          priority: 'Critical',
          status: 'Scheduled'
        },
        {
          id: 'seed-event-4',
          date: '2026-06-25',
          title: 'Contract Renewal Review (ทบทวนและวางแผนสัญญารับพนักงานเหมาช่วงประจำปี)',
          time: '09:30',
          type: 'Contract',
          priority: 'High',
          status: 'Scheduled'
        }
      ];
    } else if (colName === 'system_config') {
      seedItems = [
        { id: 'cfg_1', key: 'compliance_target', value: '95', description: 'เป้าหมายความสอดคล้องตามกฎระเบียบบริษัท' },
        { id: 'cfg_2', key: 'alert_retention', value: '30', description: 'จำนวนวันในการเก็บประวัติบันทึกความลื่นไหลของระบบ' }
      ];
    } else if (colName === 'leave_requests') {
      seedItems = [
        {
          id: 'LR-001',
          employeeName: 'สมชาย รักดี (Somchai Rakdee)',
          type: 'Vacation',
          start: '2026-06-02',
          end: '2026-06-04',
          days: 3,
          status: 'Approved',
          department: 'Human Resources',
          reason: 'พักผ่อนประจำปีกับครอบครัวที่ต่างจังหวัด'
        },
        {
          id: 'LR-002',
          employeeName: 'วรรณพร สดใส (Wannaporn Sodsai)',
          type: 'Sick Leave',
          start: '2026-06-08',
          end: '2026-06-09',
          days: 2,
          status: 'Approved',
          department: 'Finance & Accounting',
          reason: 'เป็นไข้หวัดตัวร้อน พักรักษาตัวที่บ้าน'
        },
        {
          id: 'LR-003',
          employeeName: 'กิตติพงษ์ ยอดเยี่ยม (Kittipong Yodyiem)',
          type: 'Business Leave',
          start: '2026-06-12',
          end: '2026-06-12',
          days: 1,
          status: 'Pending HR Approval',
          department: 'Information Technology',
          reason: 'มีนัดหมายราชการทำธุรกรรมด้านบัตรประชาชนและที่ดิน'
        },
        {
          id: 'LR-004',
          employeeName: 'นภาลัย เรืองรอง (Napalai Ruangrong)',
          type: 'Vacation',
          start: '2026-06-16',
          end: '2026-06-19',
          days: 4,
          status: 'Approved',
          department: 'Production',
          reason: 'ลาพักผ่อนประจำปี เดินทางต่างประเทศ'
        },
        {
          id: 'LR-005',
          employeeName: 'วิชัย ว่องไว (Wichai Wongwai)',
          type: 'Business Leave',
          start: '2026-06-24',
          end: '2026-06-25',
          days: 2,
          status: 'Approved',
          department: 'Logistics',
          reason: 'ไปดูแลคุณพ่อคุณแม่เดินทางและทำธุระส่วนตัว'
        }
      ];
    } else if (colName === 'employees') {
      seedItems = [
        { 
          id: 1, staffId: 'EMP-24001', employeeId: 'EMP-24001', nameTh: 'สมชาย มุ่งมั่น', nameEn: 'Somchai Mungmun',
          name: 'สมชาย มุ่งมั่น (Somchai Mungmun)', nickName: 'ชาย (Chai)',
          image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
          avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
          office: 'Headquarters', dept: 'Information Technology', department: 'Information Technology',
          section: 'Software Dev', jobTitle: 'Senior Fullstack Developer', position: 'Senior Fullstack Developer',
          jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2020-01-15', hiringDate: '2020-01-15', hireDate: '2020-01-15',
          yos: '4 Yrs 3 Mos', idCard: '1100500123456', socialSec: 'Active', gender: 'Male', birthDate: '1990-05-20',
          age: 34, ageHiring: 30, nationality: 'Thai', religion: 'Buddhism', marital: 'Single', kids: 0, military: 'Exempted', driving: 'Car License',
          email: 'somchai.m@tamarindpro.com', phone: '081-234-5678', addressId: '123/45 Sukhumvit Rd., Bangkok', addressPres: 'Same as ID',
          emerContact: 'Somsri Mungmun (Mother)', emerPhone: '089-876-5432', blood: 'O', education: 'Bachelor Degree', major: 'Computer Engineering',
          bank: 'KBank', bankAcc: '012-3-45678-9', termination: '', reason: ''
        },
        { 
          id: 2, staffId: 'EMP-22045', employeeId: 'EMP-22045', nameTh: 'วิภาดา แสงงาม', nameEn: 'Wipada Saengngam',
          name: 'วิภาดา แสงงาม (Wipada Saengngam)', nickName: 'วิ (Wi)',
          image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
          office: 'Factory A', dept: 'Quality Assurance', department: 'Quality Assurance',
          section: 'QC Line', jobTitle: 'QA Manager', position: 'QA Manager',
          jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2018-08-01', hiringDate: '2018-08-01', hireDate: '2018-08-01',
          yos: '5 Yrs 8 Mos', idCard: '3100500987654', socialSec: 'Active', gender: 'Female', birthDate: '1985-11-10',
          age: 38, ageHiring: 33, nationality: 'Thai', religion: 'Buddhism', marital: 'Married', kids: 2, military: 'N/A', driving: 'Car License',
          email: 'wipada.s@tamarindpro.com', phone: '085-555-1234', addressId: '45 Phetchabun Rd., Phetchabun', addressPres: 'Same as ID',
          emerContact: 'Manop Saengngam (Husband)', emerPhone: '081-111-2222', blood: 'B', education: 'Master Degree', major: 'Food Science',
          bank: 'SCB', bankAcc: '987-6-54321-0', termination: '', reason: ''
        },
        { 
          id: 3, staffId: 'EMP-24003', employeeId: 'EMP-24003', nameTh: 'กิตติพงษ์ ยอดเยี่ยม', nameEn: 'Kittipong Yodyiem',
          name: 'กิตติพงษ์ ยอดเยี่ยม (Kittipong Yodyiem)', nickName: 'กิต (Kit)',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          office: 'Headquarters', dept: 'Information Technology', department: 'Information Technology',
          section: 'Infrastructure', jobTitle: 'IT Lead', position: 'IT Lead',
          jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2018-06-01', hiringDate: '2018-06-01', hireDate: '2018-06-01',
          yos: '6 Yrs', idCard: '1100500123403', socialSec: 'Active', gender: 'Male', birthDate: '1988-06-14',
          age: 38, ageHiring: 30, nationality: 'Thai', religion: 'Buddhism', marital: 'Married', kids: 1, military: 'Completed', driving: 'Car License',
          email: 'kittipong.y@chaisri.com', phone: '081-345-6789', addressId: '456/78 Rama 9 Rd., Bangkok', addressPres: 'Same as ID',
          emerContact: 'Nonglak Yodyiem (Wife)', emerPhone: '089-123-4567', blood: 'A', education: 'Bachelor Degree', major: 'Information Technology',
          bank: 'KBank', bankAcc: '012-3-55555-9', termination: '', reason: ''
        },
        { 
          id: 4, staffId: 'EMP-24004', employeeId: 'EMP-24004', nameTh: 'นภาลัย เรืองรอง', nameEn: 'Napalai Ruangrong',
          name: 'นภาลัย เรืองรอง (Napalai Ruangrong)', nickName: 'ฟ้า (Fah)',
          image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
          office: 'Factory A', dept: 'Production', department: 'Production',
          section: 'Quality Control', jobTitle: 'Quality Auditor', position: 'Quality Auditor',
          jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2022-06-25', hiringDate: '2022-06-25', hireDate: '2022-06-25',
          yos: '4 Yrs', idCard: '1100500123404', socialSec: 'Active', gender: 'Female', birthDate: '1992-06-18',
          age: 34, ageHiring: 30, nationality: 'Thai', religion: 'Buddhism', marital: 'Single', kids: 0, military: 'N/A', driving: 'Both',
          email: 'napalai.r@chaisri.com', phone: '082-456-7890', addressId: '789/12 Charoen Krung Rd., Bangkok', addressPres: 'Same as ID',
          emerContact: 'Patsorn Ruangrong (Sister)', emerPhone: '085-234-5678', blood: 'B', education: 'Bachelor Degree', major: 'Food Science',
          bank: 'SCB', bankAcc: '123-4-56789-0', termination: '', reason: ''
        },
        { 
          id: 5, staffId: 'EMP-24005', employeeId: 'EMP-24005', nameTh: 'วิชัย ว่องไว', nameEn: 'Wichai Wongwai',
          name: 'วิชัย ว่องไว (Wichai Wongwai)', nickName: 'ชัย (Chai)',
          image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
          office: 'Factory A', dept: 'Logistics', department: 'Logistics',
          section: 'Warehouse', jobTitle: 'Logistics Supervisor', position: 'Logistics Supervisor',
          jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2020-06-15', hiringDate: '2020-06-15', hireDate: '2020-06-15',
          yos: '6 Yrs', idCard: '1100500123405', socialSec: 'Active', gender: 'Male', birthDate: '1991-06-20',
          age: 35, ageHiring: 29, nationality: 'Thai', religion: 'Buddhism', marital: 'Married', kids: 1, military: 'Completed', driving: 'Car License',
          email: 'wichai.w@chaisri.com', phone: '083-567-8901', addressId: '101/23 Phaholyothin Rd., Bangkok', addressPres: 'Same as ID',
          emerContact: 'Pranee Wongwai (Mother)', emerPhone: '086-345-6789', blood: 'O', education: 'Bachelor Degree', major: 'Logistics Management',
          bank: 'BBL', bankAcc: '234-5-67890-1', termination: '', reason: ''
        },
        { 
          id: 6, staffId: 'EMP-24006', employeeId: 'EMP-24006', nameTh: 'สิรินทรา มีสุข', nameEn: 'Sirintra Meesook',
          name: 'สิรินทรา มีสุข (Sirintra Meesook)', nickName: 'สิ (Si)',
          image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
          office: 'Headquarters', dept: 'Human Resources', department: 'Human Resources',
          section: 'Recruitment', jobTitle: 'HR Recruiter', position: 'HR Recruiter',
          jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2023-06-12', hiringDate: '2023-06-12', hireDate: '2023-06-12',
          yos: '3 Yrs', idCard: '1100500123406', socialSec: 'Active', gender: 'Female', birthDate: '1994-07-02',
          age: 31, ageHiring: 28, nationality: 'Thai', religion: 'Buddhism', marital: 'Single', kids: 0, military: 'N/A', driving: 'Car License',
          email: 'sirintra.m@chaisri.com', phone: '084-678-9012', addressId: '202/34 Ladprao Rd., Bangkok', addressPres: 'Same as ID',
          emerContact: 'Santi Meesook (Father)', emerPhone: '087-456-7890', blood: 'AB', education: 'Bachelor Degree', major: 'Human Resources',
          bank: 'KBank', bankAcc: '012-3-67890-1', termination: '', reason: ''
        },
        { 
          id: 7, staffId: 'EMP-24007', employeeId: 'EMP-24007', nameTh: 'ชลวิทย์ เก่งกาจ', nameEn: 'Chonlawit Kengkarj',
          name: 'ชลวิทย์ เก่งกาจ (Chonlawit Kengkarj)', nickName: 'ชล (Chon)',
          image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
          office: 'Factory A', dept: 'Production', department: 'Production',
          section: 'Assembly Line', jobTitle: 'Production Engineer', position: 'Production Engineer',
          jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2017-06-20', hiringDate: '2017-06-20', hireDate: '2017-06-20',
          yos: '9 Yrs', idCard: '1100500123407', socialSec: 'Active', gender: 'Male', birthDate: '1987-06-28',
          age: 38, ageHiring: 29, nationality: 'Thai', religion: 'Buddhism', marital: 'Married', kids: 2, military: 'Completed', driving: 'Car License',
          email: 'chonlawit.k@chaisri.com', phone: '085-789-0123', addressId: '303/45 Vibhavadi Rd., Bangkok', addressPres: 'Same as ID',
          emerContact: 'Malee Kengkarj (Mother)', emerPhone: '088-567-8901', blood: 'O', education: 'Bachelor Degree', major: 'Industrial Engineering',
          bank: 'KBank', bankAcc: '012-3-78901-2', termination: '', reason: ''
        },
        { 
          id: 8, staffId: 'EMP-24008', employeeId: 'EMP-24008', nameTh: 'ธนพล มั่งคั่ง', nameEn: 'Thanaphol Mangkang',
          name: 'ธนพล มั่งคั่ง (Thanaphol Mangkang)', nickName: 'พล (Phol)',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
          office: 'Headquarters', dept: 'Finance & Accounting', department: 'Finance & Accounting',
          section: 'Treasury', jobTitle: 'Finance Director', position: 'Finance Director',
          jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2015-04-10', hiringDate: '2015-04-10', hireDate: '2015-04-10',
          yos: '11 Yrs', idCard: '1100500123408', socialSec: 'Active', gender: 'Male', birthDate: '1980-03-12',
          age: 46, ageHiring: 35, nationality: 'Thai', religion: 'Buddhism', marital: 'Married', kids: 3, military: 'Completed', driving: 'Car License',
          email: 'thanaphol.m@chaisri.com', phone: '086-890-1234', addressId: '404/56 Sukhumvit 101, Bangkok', addressPres: 'Same as ID',
          emerContact: 'Nipa Mangkang (Wife)', emerPhone: '089-678-9012', blood: 'A', education: 'Master Degree', major: 'Finance',
          bank: 'SCB', bankAcc: '123-4-78901-2', termination: '', reason: ''
        },
        { 
          id: 9, staffId: 'EMP-24009', employeeId: 'EMP-24009', nameTh: 'พิมพพรรณ สวยงาม', nameEn: 'Pimphan Suayngam',
          name: 'พิมพพรรณ สวยงาม (Pimphan Suayngam)', nickName: 'พิม (Pim)',
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          office: 'Headquarters', dept: 'Information Technology', department: 'Information Technology',
          section: 'Innovation Team', jobTitle: 'Software Engineer', position: 'Software Engineer',
          jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2024-01-10', hiringDate: '2024-01-10', hireDate: '2024-01-10',
          yos: '2 Yrs', idCard: '1100500123409', socialSec: 'Active', gender: 'Female', birthDate: '1998-09-05',
          age: 27, ageHiring: 25, nationality: 'Thai', religion: 'Buddhism', marital: 'Single', kids: 0, military: 'N/A', driving: 'None',
          email: 'pimphan.s@chaisri.com', phone: '087-901-2345', addressId: '505/67 Ramkhamhaeng Rd., Bangkok', addressPres: 'Same as ID',
          emerContact: 'Aree Suayngam (Mother)', emerPhone: '081-789-0123', blood: 'B', education: 'Bachelor Degree', major: 'Computer Science',
          bank: 'KBank', bankAcc: '012-3-89012-3', termination: '', reason: ''
        },
        { 
          id: 10, staffId: 'EMP-24010', employeeId: 'EMP-24010', nameTh: 'อัญชลี รักษ์ดี', nameEn: 'Anchalee Rakdee',
          name: 'อัญชลี รักษ์ดี (Anchalee Rakdee)', nickName: 'แอน (Ann)',
          image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=150&q=80',
          avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=150&q=80',
          office: 'Factory A', dept: 'Quality Assurance', department: 'Quality Assurance',
          section: 'QA Audit', jobTitle: 'QA Inspector', position: 'QA Inspector',
          jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2021-03-15', hiringDate: '2021-03-15', hireDate: '2021-03-15',
          yos: '5 Yrs', idCard: '1100500123410', socialSec: 'Active', gender: 'Female', birthDate: '1993-12-25',
          age: 32, ageHiring: 27, nationality: 'Thai', religion: 'Buddhism', marital: 'Single', kids: 0, military: 'N/A', driving: 'Car License',
          email: 'anchalee.r@chaisri.com', phone: '088-012-3456', addressId: '606/78 Srinakarin Rd., Bangkok', addressPres: 'Same as ID',
          emerContact: 'Prasert Rakdee (Father)', emerPhone: '082-890-1234', blood: 'O', education: 'Bachelor Degree', major: 'Biotechnology',
          bank: 'SCB', bankAcc: '123-4-89012-3', termination: '', reason: ''
        },
        { 
          id: 11, staffId: 'EMP-24011', employeeId: 'EMP-24011', nameTh: 'พงษ์ศักดิ์ ศรีสุข', nameEn: 'Pongsak Srisook',
          name: 'พงษ์ศักดิ์ ศรีสุข (Pongsak Srisook)', nickName: 'พงษ์ (Pong)',
          image: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=150&q=80',
          avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=150&q=80',
          office: 'Factory A', dept: 'Production', department: 'Production',
          section: 'Maintenance', jobTitle: 'Maintenance Supervisor', position: 'Maintenance Supervisor',
          jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2019-11-01', hiringDate: '2019-11-01', hireDate: '2019-11-01',
          yos: '6 Yrs 7 Mos', idCard: '1100500123411', socialSec: 'Active', gender: 'Male', birthDate: '1986-07-15',
          age: 39, ageHiring: 32, nationality: 'Thai', religion: 'Buddhism', marital: 'Married', kids: 1, military: 'Completed', driving: 'Both',
          email: 'pongsak.s@chaisri.com', phone: '089-123-4567', addressId: '707/89 Navamin Rd., Bangkok', addressPres: 'Same as ID',
          emerContact: 'Sunee Srisook (Mother)', emerPhone: '083-901-2345', blood: 'A', education: 'Bachelor Degree', major: 'Mechanical Engineering',
          bank: 'BBL', bankAcc: '234-5-89012-3', termination: '', reason: ''
        },
        { 
          id: 12, staffId: 'EMP-24012', employeeId: 'EMP-24012', nameTh: 'ศิริพร อุดมดี', nameEn: 'Siriporn Udomdee',
          name: 'ศิริพร อุดมดี (Siriporn Udomdee)', nickName: 'พร (Porn)',
          image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=150&q=80',
          avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=150&q=80',
          office: 'Headquarters', dept: 'Human Resources', department: 'Human Resources',
          section: 'Compensation', jobTitle: 'HR Specialist', position: 'HR Specialist',
          jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2022-09-01', hiringDate: '2022-09-01', hireDate: '2022-09-01',
          yos: '3 Yrs 9 Mos', idCard: '1100500123412', socialSec: 'Active', gender: 'Female', birthDate: '1991-02-18',
          age: 35, ageHiring: 31, nationality: 'Thai', religion: 'Buddhism', marital: 'Single', kids: 0, military: 'N/A', driving: 'Car License',
          email: 'siriporn.u@chaisri.com', phone: '081-456-7890', addressId: '808/90 Ratchadapisek Rd., Bangkok', addressPres: 'Same as ID',
          emerContact: 'Vichit Udomdee (Father)', emerPhone: '084-012-3456', blood: 'O', education: 'Bachelor Degree', major: 'Psychology',
          bank: 'KBank', bankAcc: '012-3-90123-4', termination: '', reason: ''
        },
        { 
          id: 13, staffId: 'EMP-24013', employeeId: 'EMP-24013', nameTh: 'เกรียงไกร มีพรพิพัฒน์', nameEn: 'Kriangkrai Meepornpipat',
          name: 'เกรียงไกร มีพรพิพัฒน์ (Kriangkrai Meepornpipat)', nickName: 'เกรียง (Krieng)',
          image: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=150&q=80',
          avatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=150&q=80',
          office: 'Headquarters', dept: 'Information Technology', department: 'Information Technology',
          section: 'Cyber Security', jobTitle: 'Security Analyst', position: 'Security Analyst',
          jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2023-01-15', hiringDate: '2023-01-15', hireDate: '2023-01-15',
          yos: '3 Yrs 5 Mos', idCard: '1100500123413', socialSec: 'Active', gender: 'Male', birthDate: '1995-10-30',
          age: 30, ageHiring: 27, nationality: 'Thai', religion: 'Buddhism', marital: 'Single', kids: 0, military: 'Completed', driving: 'Car License',
          email: 'kriangkrai.m@chaisri.com', phone: '082-567-8901', addressId: '909/11 Lat Phrao, Bangkok', addressPres: 'Same as ID',
          emerContact: 'Sudarat Meepornpipat (Sister)', emerPhone: '085-123-4567', blood: 'B', education: 'Bachelor Degree', major: 'Computer Engineering',
          bank: 'SCB', bankAcc: '123-4-90123-4', termination: '', reason: ''
        },
        { 
          id: 14, staffId: 'EMP-24014', employeeId: 'EMP-24014', nameTh: 'พัชราภรณ์ วงศ์สุวรรณ', nameEn: 'Patcharaporn Wongsuwan',
          name: 'พัชราภรณ์ วงศ์สุวรรณ (Patcharaporn Wongsuwan)', nickName: 'พัช (Pat)',
          image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
          office: 'Headquarters', dept: 'Finance & Accounting', department: 'Finance & Accounting',
          section: 'Accounts Payable', jobTitle: 'Junior Accountant', position: 'Junior Accountant',
          jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2025-02-01', hiringDate: '2025-02-01', hireDate: '2025-02-01',
          yos: '1 Yr 4 Mos', idCard: '1100500123414', socialSec: 'Active', gender: 'Female', birthDate: '2000-05-12',
          age: 26, ageHiring: 25, nationality: 'Thai', religion: 'Buddhism', marital: 'Single', kids: 0, military: 'N/A', driving: 'None',
          email: 'patcharaporn.w@chaisri.com', phone: '083-678-9012', addressId: '111/22 Sukhumvit Rd., Bangkok', addressPres: 'Same as ID',
          emerContact: 'Prasit Wongsuwan (Father)', emerPhone: '086-456-7890', blood: 'A', education: 'Bachelor Degree', major: 'Accounting',
          bank: 'SCB', bankAcc: '123-4-01234-5', termination: '', reason: ''
        },
        { 
          id: 15, staffId: 'EMP-24015', employeeId: 'EMP-24015', nameTh: 'สมชาย รักดี', nameEn: 'Somchai Rakdee',
          name: 'สมชาย รักดี (Somchai Rakdee)', nickName: 'สมชาย (Somchai)',
          image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
          office: 'Headquarters', dept: 'Human Resources', department: 'Human Resources',
          section: 'HR Operations', jobTitle: 'HR Manager', position: 'HR Manager',
          jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2019-06-15', hiringDate: '2019-06-15', hireDate: '2019-06-15',
          yos: '7 Yrs', idCard: '1100500123415', socialSec: 'Active', gender: 'Male', birthDate: '1990-06-05',
          age: 36, ageHiring: 29, nationality: 'Thai', religion: 'Buddhism', marital: 'Married', kids: 1, military: 'Completed', driving: 'Car License',
          email: 'somchai.r@chaisri.com', phone: '084-789-0123', addressId: '222/33 Rama 3 Rd., Bangkok', addressPres: 'Same as ID',
          emerContact: 'Somsri Rakdee (Wife)', emerPhone: '087-567-8901', blood: 'O', education: 'Bachelor Degree', major: 'Human Resource Management',
          bank: 'KBank', bankAcc: '012-3-01234-5', termination: '', reason: ''
        },
        { 
          id: 16, staffId: 'EMP-24016', employeeId: 'EMP-24016', nameTh: 'จิรายุ ทองแท้', nameEn: 'Jirayu Thongtae',
          name: 'จิรายุ ทองแท้ (Jirayu Thongtae)', nickName: 'เจ (Jay)',
          image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
          office: 'Factory A', dept: 'Production', department: 'Production',
          section: 'Assembly', jobTitle: 'Assembly Supervisor', position: 'Assembly Supervisor',
          jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2020-03-01', hiringDate: '2020-03-01', hireDate: '2020-03-01',
          yos: '6 Yrs 3 Mos', idCard: '1100500123416', socialSec: 'Active', gender: 'Male', birthDate: '1992-04-10',
          age: 34, ageHiring: 28, nationality: 'Thai', religion: 'Buddhism', marital: 'Married', kids: 1, military: 'Completed', driving: 'Car License',
          email: 'jirayu.t@chaisri.com', phone: '085-890-1234', addressId: '333/44 Suksawat Rd., Bangkok', addressPres: 'Same as ID',
          emerContact: 'Thongdee Thongtae (Father)', emerPhone: '088-678-9012', blood: 'B', education: 'High School', major: 'General Science',
          bank: 'BBL', bankAcc: '234-5-01234-5', termination: '', reason: ''
        },
        { 
          id: 17, staffId: 'EMP-24017', employeeId: 'EMP-24017', nameTh: 'อรทัย เจริญยิ่ง', nameEn: 'Orathai Charoenying',
          name: 'อรทัย เจริญยิ่ง (Orathai Charoenying)', nickName: 'ปลา (Pla)',
          image: 'https://images.unsplash.com/photo-1563306406-e66174fa3787?auto=format&fit=crop&w=150&q=80',
          avatar: 'https://images.unsplash.com/photo-1563306406-e66174fa3787?auto=format&fit=crop&w=150&q=80',
          office: 'Factory A', dept: 'Quality Assurance', department: 'Quality Assurance',
          section: 'QA Admin', jobTitle: 'QA Coordinator', position: 'QA Coordinator',
          jobStatus: 'Permanent', workStatus: 'Active', status: 'Active', effDate: '2024-05-15', hiringDate: '2024-05-15', hireDate: '2024-05-15',
          yos: '2 Yrs 1 Mo', idCard: '1100500123417', socialSec: 'Active', gender: 'Female', birthDate: '1997-08-22',
          age: 28, ageHiring: 26, nationality: 'Thai', religion: 'Buddhism', marital: 'Single', kids: 0, military: 'N/A', driving: 'Car License',
          email: 'orathai.c@chaisri.com', phone: '086-901-2345', addressId: '444/55 Charan Sanitwong Rd., Bangkok', addressPres: 'Same as ID',
          emerContact: 'Somboon Charoenying (Father)', emerPhone: '089-789-0123', blood: 'AB', education: 'Bachelor Degree', major: 'Food Chemistry',
          bank: 'SCB', bankAcc: '123-4-12345-6', termination: '', reason: ''
        }
      ];
    } else if (colName === 'appraisals') {
      seedItems = [
        {
          id: 'APR-001',
          employeeName: 'พิมพพรรณ สวยงาม (Pimphan Suayngam)',
          department: 'Innovation Team',
          position: 'Software Engineer',
          period: 'FY2026 Mid-Year',
          status: 'Pending HR Alignment',
          score: 93,
          grade: 'A',
          selfScore: 90,
          supervisorComments: 'ผลการทำงานมีคุณภาพสูงอย่างต่อเนื่อง ทุ่มเทและกระตือรือร้นในการทำงานร่วมทีมเป็นอย่างดี',
          date: '2026-06-01'
        },
        {
          id: 'APR-002',
          employeeName: 'ชลวิทย์ เก่งกาจ (Chonlawit Kengkarj)',
          department: 'Production',
          position: 'Production Engineer',
          period: 'FY2026 Mid-Year',
          status: 'Pending HR Alignment',
          score: 87,
          grade: 'B+',
          selfScore: 85,
          supervisorComments: 'มีความรับผิดชอบดีเด่น ควบคุมกระบวนการผลิตสอดคล้องตามมาตรฐาน ISO9001 ได้เรียบร้อยดี',
          date: '2026-06-02'
        }
      ];
    } else if (colName === 'company_holidays') {
      seedItems = [
        { id: 'hld-1', date: '2026-01-01', titleTh: 'วันขึ้นปีใหม่', titleEn: "New Year's Day", type: 'Public Holiday', description: 'วันหยุดขึ้นปีใหม่สากล' },
        { id: 'hld-2', date: '2026-03-03', titleTh: 'วันมาฆบูชา', titleEn: 'Makha Bucha Day', type: 'Religious Holiday', description: 'วันสำคัญทางพระพุทธศาสนา' },
        { id: 'hld-3', date: '2026-04-13', titleTh: 'วันสงกรานต์', titleEn: 'Songkran Festival Day 1', type: 'Public Holiday', description: 'วันขึ้นปีใหม่ไทย / วันผู้สูงอายุแห่งชาติ' },
        { id: 'hld-4', date: '2026-04-14', titleTh: 'วันสงกรานต์', titleEn: 'Songkran Festival Day 2', type: 'Public Holiday', description: 'วันครอบครัวไทย' },
        { id: 'hld-5', date: '2026-04-15', titleTh: 'วันสงกรานต์', titleEn: 'Songkran Festival Day 3', type: 'Public Holiday', description: 'วันเถลิงศกใหม่แบบไทย' },
        { id: 'hld-6', date: '2026-05-01', titleTh: 'วันแรงงานแห่งชาติ', titleEn: 'National Labour Day', type: 'Public Holiday', description: 'วันตระหนักสิทธิสตาฟฟ์และแรงงาน' },
        { id: 'hld-7', date: '2026-06-03', titleTh: 'วันเฉลิมพระชนมพรรษาสมเด็จพระราชินี', titleEn: "HM Queen's Birthday", type: 'Royal Holiday', description: 'วันเฉลิมพระชนมพรรษา สมเด็จพระนางเจ้าสุทิดาฯ' },
        { id: 'hld-8', date: '2026-07-28', titleTh: 'วันเฉลิมพระชนมพรรษา รัชกาลที่ 10', titleEn: "HM King's Birthday", type: 'Royal Holiday', description: 'วันเฉลิมพระชนมพรรษา พระบาทสมเด็จพระวชิรเกล้าเจ้าอยู่หัว' },
        { id: 'hld-9', date: '2026-08-12', titleTh: 'วันแม่แห่งชาติ', titleEn: "Mother's Day", type: 'Public Holiday', description: 'วันแม่แห่งชาติ / วันคล้ายวันพระราชสมภพ พระพันปีหลวง' },
        { id: 'hld-10', date: '2026-10-13', titleTh: 'วันคล้ายวันสวรรคต รัชกาลที่ 9', titleEn: 'King Bhumibol Memorial Day', type: 'Public Holiday', description: 'วันคล้ายวันสวรรคต พระบาทสมเด็จพระบรมชนกาธิเบศร มหาภูมิพลอดุลยเดชมหาราช บรมนาถบพิตร' },
        { id: 'hld-11', date: '2026-10-23', titleTh: 'วันปิยมหาราช', titleEn: 'Chulalongkorn Memorial Day', type: 'Public Holiday', description: 'วันระลึกและคล้ายวันสวรรคต พระบาทสมเด็จพระจุลจอมเกล้าเจ้าอยู่หัว' },
        { id: 'hld-12', date: '2026-12-05', titleTh: 'วันพ่อแห่งชาติ', titleEn: "Father's Day", type: 'Public Holiday', description: 'วันพ่อแห่งชาติ / วันชาติไทย' },
        { id: 'hld-13', date: '2026-12-31', titleTh: 'วันสิ้นปี', titleEn: "New Year's Eve", type: 'Public Holiday', description: 'วันหยุดสิ้นท้ายปีเก่าต้อนรับปีใหม่' }
      ];
    }

    // Save Seed items to LocalStorage
    try {
      localStorage.setItem(localKey, JSON.stringify(seedItems));
      console.log(`[dbSync] Seeded ${seedItems.length} items to LocalStorage fallback for ${colName}.`);
    } catch (err) {
      console.error(`[dbSync] Failed to store seed items in LocalStorage:`, err);
    }

    return { status: 'success', data: { items: seedItems } };
  },

  /**
   * Writes one or multiple rows to both Google Sheets and Firebase simultaneously.
   */
  async write(sheetName: string, data: any[]): Promise<any> {
    console.log(`[dbSync] Writing to ${sheetName} (dual persistence active)...`);
    const colName = getCollectionName(sheetName);
    
    // 1. Write to Google Sheets (GAS)
    let gasResponse;
    if (GAS_WEB_APP_URL && GAS_WEB_APP_URL !== "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE" && GAS_WEB_APP_URL.trim() !== "") {
      try {
        gasResponse = await GASService.write(sheetName, data);
      } catch (err) {
        console.warn(`[dbSync] GAS Write failed for ${sheetName}:`, err);
      }
    } else {
      console.log(`[dbSync] GAS is unconfigured. Skipping write for ${sheetName}.`);
    }

    // 2. Write to Firestore
    try {
      const batch = writeBatch(db);
      
      for (const item of data) {
        const idStr = String(item.id || item.employeeId || 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7));
        const docRef = doc(db, colName, idStr);
        
        batch.set(docRef, {
          ...item,
          id: idStr,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      
      await batch.commit();
      console.log(`[dbSync] Successfully wrote ${data.length} items to Firestore (${colName}).`);
      updateLastSyncTimestamp();
    } catch (err) {
      if (err instanceof Error && (err.message.includes('permission') || err.message.includes('Permission') || (err as any).code === 'permission-denied')) {
        handleFirestoreError(err, OperationType.CREATE, colName);
      }
      console.error(`[dbSync] Firestore Write failed for ${sheetName}:`, err);
    }

    // 3. Write to LocalStorage fallback
    try {
      const localKey = `db_sync_fallback_${colName}`;
      const stored = localStorage.getItem(localKey);
      let localItems: any[] = stored ? JSON.parse(stored) : [];
      for (const item of data) {
        const idStr = String(item.id || item.employeeId || 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7));
        const index = localItems.findIndex(x => String(x.id) === idStr);
        const newItem = {
          ...item,
          id: idStr,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        if (index >= 0) {
          localItems[index] = newItem;
        } else {
          localItems.push(newItem);
        }
      }
      localStorage.setItem(localKey, JSON.stringify(localItems));
      console.log(`[dbSync] Successfully wrote ${data.length} items to LocalStorage fallback.`);
    } catch (err) {
      console.error(`[dbSync] LocalStorage fallback write failed:`, err);
    }

    return gasResponse || { status: 'success', data: { message: 'Saved to Firestore and LocalStorage fallback only' } };
  },

  /**
   * Updates one or multiple rows in both Google Sheets and Firebase simultaneously.
   */
  async update(sheetName: string, data: any[]): Promise<any> {
    console.log(`[dbSync] Updating in ${sheetName} (dual persistence active)...`);
    const colName = getCollectionName(sheetName);
    
    // 1. Update in Google Sheets (GAS)
    let gasResponse;
    if (GAS_WEB_APP_URL && GAS_WEB_APP_URL !== "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE" && GAS_WEB_APP_URL.trim() !== "") {
      try {
        gasResponse = await GASService.update(sheetName, data);
      } catch (err) {
        console.warn(`[dbSync] GAS Update failed for ${sheetName}:`, err);
      }
    } else {
      console.log(`[dbSync] GAS is unconfigured. Skipping update for ${sheetName}.`);
    }

    // 2. Update in Firestore
    try {
      const batch = writeBatch(db);
      
      for (const item of data) {
        if (!item.id) {
          console.warn('[dbSync] Skip update for item missing "id" field:', item);
          continue;
        }
        const idStr = String(item.id);
        const docRef = doc(db, colName, idStr);
        
        batch.set(docRef, {
          ...item,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      
      await batch.commit();
      console.log(`[dbSync] Successfully updated ${data.length} items in Firestore (${colName}).`);
      updateLastSyncTimestamp();
    } catch (err) {
      if (err instanceof Error && (err.message.includes('permission') || err.message.includes('Permission') || (err as any).code === 'permission-denied')) {
        handleFirestoreError(err, OperationType.UPDATE, colName);
      }
      console.error(`[dbSync] Firestore Update failed for ${sheetName}:`, err);
    }

    // 3. Update in LocalStorage fallback
    try {
      const localKey = `db_sync_fallback_${colName}`;
      const stored = localStorage.getItem(localKey);
      if (stored) {
        let localItems: any[] = JSON.parse(stored);
        for (const item of data) {
          if (!item.id) continue;
          const index = localItems.findIndex(x => String(x.id) === String(item.id));
          if (index >= 0) {
            localItems[index] = {
              ...localItems[index],
              ...item,
              updatedAt: new Date().toISOString()
            };
          }
        }
        localStorage.setItem(localKey, JSON.stringify(localItems));
        console.log(`[dbSync] Successfully updated ${data.length} items in LocalStorage fallback.`);
      }
    } catch (err) {
      console.error(`[dbSync] LocalStorage fallback update failed:`, err);
    }

    return gasResponse || { status: 'success', data: { message: 'Updated in Firestore and LocalStorage fallback only' } };
  },

  /**
   * Deletes one or multiple rows in both Google Sheets and Firebase simultaneously.
   */
  async delete(sheetName: string, data: { id: string | number }[]): Promise<any> {
    console.log(`[dbSync] Deleting from ${sheetName} (dual persistence active)...`);
    const colName = getCollectionName(sheetName);
    
    // 1. Delete from Google Sheets (GAS)
    let gasResponse;
    if (GAS_WEB_APP_URL && GAS_WEB_APP_URL !== "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE" && GAS_WEB_APP_URL.trim() !== "") {
      try {
        gasResponse = await GASService.delete(sheetName, data);
      } catch (err) {
        console.warn(`[dbSync] GAS Delete failed for ${sheetName}:`, err);
      }
    } else {
      console.log(`[dbSync] GAS is unconfigured. Skipping delete for ${sheetName}.`);
    }

    // 2. Delete from Firestore
    try {
      const batch = writeBatch(db);
      
      for (const item of data) {
        const idStr = String(item.id);
        const docRef = doc(db, colName, idStr);
        batch.delete(docRef);
      }
      
      await batch.commit();
      console.log(`[dbSync] Successfully deleted ${data.length} items from Firestore (${colName}).`);
      updateLastSyncTimestamp();
    } catch (err) {
      if (err instanceof Error && (err.message.includes('permission') || err.message.includes('Permission') || (err as any).code === 'permission-denied')) {
        handleFirestoreError(err, OperationType.DELETE, colName);
      }
      console.error(`[dbSync] Firestore Delete failed for ${sheetName}:`, err);
    }

    // 3. Delete from LocalStorage fallback
    try {
      const localKey = `db_sync_fallback_${colName}`;
      const stored = localStorage.getItem(localKey);
      if (stored) {
        let localItems: any[] = JSON.parse(stored);
        const idsToDelete = data.map(item => String(item.id));
        localItems = localItems.filter(item => !idsToDelete.includes(String(item.id)));
        localStorage.setItem(localKey, JSON.stringify(localItems));
        console.log(`[dbSync] Successfully deleted ${data.length} items from LocalStorage fallback.`);
      }
    } catch (err) {
      console.error(`[dbSync] LocalStorage fallback delete failed:`, err);
    }

    return gasResponse || { status: 'success', data: { message: 'Deleted from Firestore and LocalStorage fallback only' } };
  },

  /**
   * Background sync helper to seed Firestore when reading from Sheets
   */
  async backgroundSyncToFirestore(sheetName: string, items: any[]): Promise<void> {
    const colName = getCollectionName(sheetName);
    const batch = writeBatch(db);
    
    // Sync first 100 items to avoid batch size limits (Firestore writeBatch limits to 500 ops)
    const limitedItems = items.slice(0, 450);
    
    for (const item of limitedItems) {
      const idStr = String(item.id || item.employeeId || 'synced_' + Math.random().toString(36).substring(2, 7));
      const docRef = doc(db, colName, idStr);
      batch.set(docRef, {
        ...item,
        id: idStr,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString()
      }, { merge: true });
    }
    
    await batch.commit();
    console.log(`[dbSync] Background sync complete. ${limitedItems.length} items synced to Firestore.`);
    updateLastSyncTimestamp();
  }
};
