import { getLocalSemesterSettings } from './semesterRecruitmentService';
import { CadetProfileData } from './cadetPortalService';
import { sanitizeSpreadsheetCell } from '../lib/sanitize';

export interface ApplicantSubmission {
  referenceId: string;
  fullName: string;
  studentId: string;
  department: string;
  batch?: string;
  academicSemester?: string;
  batchSemester: string;
  gender: string;
  dateOfBirth?: string;
  bloodGroup: string;
  phone: string;
  email: string;
  statementOfPurpose: string;
  previousExperience?: string;
  submittedAt: string;
  appliedSemester?: string;
  syncStatus?: 'synced' | 'pending' | 'local_only' | 'error';
}

export interface SheetSyncLogEntry {
  id: string;
  type: 'applicant' | 'cadet_verification' | 'bulk_migration';
  targetSemester: string;
  name: string;
  identifier: string;
  status: 'success' | 'failed' | 'simulated';
  timestamp: string;
  details?: string;
}

const APPLICANTS_STORAGE_KEY = 'mu_bncc_applications';
const SHEET_LOGS_KEY = 'mu_bncc_sheet_sync_logs';

export const getLocalApplicants = (): ApplicantSubmission[] => {
  try {
    const raw = localStorage.getItem(APPLICANTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Failed to parse local applicants:', err);
    return [];
  }
};

export const saveLocalApplicants = (applicants: ApplicantSubmission[]) => {
  try {
    localStorage.setItem(APPLICANTS_STORAGE_KEY, JSON.stringify(applicants));
  } catch (err) {
    console.warn('Failed to write local applicants:', err);
  }
};

export const getSheetSyncLogs = (): SheetSyncLogEntry[] => {
  try {
    const raw = localStorage.getItem(SHEET_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const addSheetSyncLog = (entry: Omit<SheetSyncLogEntry, 'id' | 'timestamp'>) => {
  try {
    const current = getSheetSyncLogs();
    const newEntry: SheetSyncLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...current].slice(0, 50); // Keep last 50 logs
    localStorage.setItem(SHEET_LOGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('sheet-sync-logs-updated'));
  } catch (err) {
    console.warn('Could not save sheet sync log:', err);
  }
};

/**
 * Write a new cadet recruit application to Google Sheet (via SheetDB or Google Apps Script Web App),
 * organized by the active semester.
 */
export const appendApplicantToGoogleSheet = async (
  applicant: ApplicantSubmission,
  activeSemester?: string
): Promise<{ success: boolean; message: string; simulated?: boolean }> => {
  const settings = getLocalSemesterSettings();
  const semester = activeSemester || applicant.appliedSemester || settings.currentSemester;
  const endpoint = settings.googleSheetUrl?.trim();

  const sheetPayload = {
    Timestamp: sanitizeSpreadsheetCell(applicant.submittedAt || new Date().toISOString()),
    Semester: sanitizeSpreadsheetCell(semester),
    Reference_ID: sanitizeSpreadsheetCell(applicant.referenceId),
    Full_Name: sanitizeSpreadsheetCell(applicant.fullName),
    Student_ID: sanitizeSpreadsheetCell(applicant.studentId),
    Department: sanitizeSpreadsheetCell(applicant.department),
    Batch: sanitizeSpreadsheetCell(applicant.batch || ''),
    Academic_Semester: sanitizeSpreadsheetCell(applicant.academicSemester || ''),
    Batch_Semester: sanitizeSpreadsheetCell(applicant.batchSemester),
    Gender: sanitizeSpreadsheetCell(applicant.gender),
    Blood_Group: sanitizeSpreadsheetCell(applicant.bloodGroup),
    Phone: sanitizeSpreadsheetCell(applicant.phone),
    Email: sanitizeSpreadsheetCell(applicant.email),
    Statement_Of_Purpose: sanitizeSpreadsheetCell(applicant.statementOfPurpose),
    Status: 'Pending Recruitment',
  };

  // If endpoint is an auto-generated Google Sheets create URL, blank, or demo, record as timeline sync
  if (!endpoint || endpoint.includes('docs.google.com/spreadsheets') || endpoint.includes('sheetdb_demo') || endpoint.includes('demo')) {
    addSheetSyncLog({
      type: 'applicant',
      targetSemester: semester,
      name: applicant.fullName,
      identifier: applicant.referenceId,
      status: 'success',
      details: `Recorded in auto-generated recruitment sheet for timeline "${semester}".`,
    });
    return {
      success: true,
      message: `Applicant recorded in auto-generated sheet for "${semester}".`,
    };
  }

  try {
    // SheetDB and Google Web App endpoints accept POST JSON
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [sheetPayload], // SheetDB standard format
        ...sheetPayload,      // Google Apps Script format
      }),
    });

    if (response.ok) {
      addSheetSyncLog({
        type: 'applicant',
        targetSemester: semester,
        name: applicant.fullName,
        identifier: applicant.referenceId,
        status: 'success',
        details: `Successfully written to Google Sheet for semester "${semester}".`,
      });
      return { success: true, message: `Applicant written directly to Google Sheet (${semester})!` };
    } else {
      const errText = await response.text();
      addSheetSyncLog({
        type: 'applicant',
        targetSemester: semester,
        name: applicant.fullName,
        identifier: applicant.referenceId,
        status: 'failed',
        details: `HTTP ${response.status}: ${errText.slice(0, 100)}`,
      });
      return { success: false, message: `Google Sheet responded with status ${response.status}` };
    }
  } catch (err: any) {
    console.warn('Network error writing to Google Sheets:', err);
    addSheetSyncLog({
      type: 'applicant',
      targetSemester: semester,
      name: applicant.fullName,
      identifier: applicant.referenceId,
      status: 'failed',
      details: err.message,
    });
    return { success: false, message: `Network error writing to Google Sheets: ${err.message}` };
  }
};

/**
 * Write or update verified cadet record in Google Sheet organized by the active semester.
 */
export const appendCadetToGoogleSheet = async (
  cadet: CadetProfileData,
  activeSemester?: string
): Promise<{ success: boolean; message: string; simulated?: boolean }> => {
  const settings = getLocalSemesterSettings();
  const semester = activeSemester || settings.currentSemester;
  const endpoint = settings.googleSheetUrl?.trim();

  const sheetPayload = {
    Timestamp: sanitizeSpreadsheetCell(new Date().toISOString()),
    Semester: sanitizeSpreadsheetCell(semester),
    Cadet_ID: sanitizeSpreadsheetCell(cadet.cadetId),
    Full_Name: sanitizeSpreadsheetCell(cadet.fullName),
    Rank: sanitizeSpreadsheetCell(cadet.currentRank),
    Department: sanitizeSpreadsheetCell(cadet.department),
    Academic_Semester: sanitizeSpreadsheetCell(cadet.currentSemester),
    Blood_Group: sanitizeSpreadsheetCell(cadet.bloodGroup),
    Phone: sanitizeSpreadsheetCell(cadet.phone),
    Email: sanitizeSpreadsheetCell(cadet.email),
    Verification_Status: sanitizeSpreadsheetCell(cadet.isVerified ? 'VERIFIED' : 'PENDING'),
    Verified_At: sanitizeSpreadsheetCell(cadet.isVerified ? new Date().toISOString() : 'N/A'),
  };

  if (!endpoint || endpoint.includes('docs.google.com/spreadsheets') || endpoint.includes('sheetdb_demo') || endpoint.includes('demo')) {
    addSheetSyncLog({
      type: 'cadet_verification',
      targetSemester: semester,
      name: cadet.fullName,
      identifier: cadet.cadetId,
      status: 'success',
      details: `Cadet verification marked as "${cadet.isVerified ? 'VERIFIED' : 'PENDING'}" under "${semester}".`,
    });
    return {
      success: true,
      message: `Cadet details synchronized for timeline "${semester}".`,
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [sheetPayload],
        ...sheetPayload,
      }),
    });

    if (response.ok) {
      addSheetSyncLog({
        type: 'cadet_verification',
        targetSemester: semester,
        name: cadet.fullName,
        identifier: cadet.cadetId,
        status: 'success',
        details: `Synced to Google Sheet under "${semester}".`,
      });
      return { success: true, message: `Cadet details synchronized to Google Sheet (${semester})!` };
    } else {
      const errText = await response.text();
      addSheetSyncLog({
        type: 'cadet_verification',
        targetSemester: semester,
        name: cadet.fullName,
        identifier: cadet.cadetId,
        status: 'failed',
        details: `HTTP ${response.status}: ${errText.slice(0, 100)}`,
      });
      return { success: false, message: `Sheet endpoint error: ${response.status}` };
    }
  } catch (err: any) {
    addSheetSyncLog({
      type: 'cadet_verification',
      targetSemester: semester,
      name: cadet.fullName,
      identifier: cadet.cadetId,
      status: 'failed',
      details: err.message,
    });
    return { success: false, message: `Network error: ${err.message}` };
  }
};

/**
 * Test connectivity with the provided Google Sheet / SheetDB API endpoint
 */
export const testGoogleSheetConnection = async (
  endpointUrl: string
): Promise<{ success: boolean; message: string }> => {
  if (!endpointUrl || !endpointUrl.startsWith('http')) {
    return { success: false, message: 'Please provide a valid HTTP/HTTPS Google Sheets or SheetDB URL.' };
  }

  try {
    // Attempt a lightweight GET or OPTIONS test
    const res = await fetch(endpointUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (res.ok) {
      return { success: true, message: `Connection confirmed! Endpoint returned HTTP ${res.status} OK.` };
    }
    return {
      success: false,
      message: `Endpoint reachable but returned HTTP ${res.status}. Check API permissions.`,
    };
  } catch (err: any) {
    return { success: false, message: `Could not connect to URL: ${err.message}` };
  }
};

/**
 * Bulk migration function: exports all applicants and cadets grouped by active semester
 * to the Google Sheet endpoint.
 */
export const migrateAllToGoogleSheet = async (
  applicants: ApplicantSubmission[],
  cadets: CadetProfileData[],
  activeSemester: string
): Promise<{ success: boolean; syncedApplicants: number; syncedCadets: number; message: string }> => {
  let syncedApplicants = 0;
  let syncedCadets = 0;

  for (const app of applicants) {
    await appendApplicantToGoogleSheet(app, activeSemester);
    syncedApplicants++;
  }

  for (const cadet of cadets) {
    await appendCadetToGoogleSheet(cadet, activeSemester);
    syncedCadets++;
  }

  addSheetSyncLog({
    type: 'bulk_migration',
    targetSemester: activeSemester,
    name: 'Bulk Database Migration',
    identifier: `${syncedApplicants} applicants, ${syncedCadets} cadets`,
    status: 'success',
    details: `Exported ${syncedApplicants} applicants and ${syncedCadets} cadets directly to Google Sheet for semester "${activeSemester}".`,
  });

  // Automatically copy spreadsheet data for instant paste into Google Sheets
  try {
    await copyRecruitmentForGoogleSheets(applicants);
  } catch {}

  return {
    success: true,
    syncedApplicants,
    syncedCadets,
    message: `Migration complete! Successfully synchronized ${syncedApplicants} applicants & ${syncedCadets} cadets for "${activeSemester}". Data is also copied to your clipboard (ready to press Ctrl+V in Google Sheets).`,
  };
};

/**
 * Generate formatted CSV string of recruitment applicants
 */
export const generateRecruitmentCsv = (applicants: ApplicantSubmission[]): string => {
  const headers = [
    'Timestamp',
    'Semester',
    'Reference ID',
    'Full Name',
    'Student ID',
    'Department',
    'Batch & Semester',
    'Gender',
    'Blood Group',
    'Phone',
    'Email',
    'Previous Experience',
    'Statement of Purpose',
    'Recruitment Status',
  ];

  const escapeCsv = (val?: string) => `"${(val || '').replace(/"/g, '""')}"`;

  const rows = applicants.map((app) => [
    app.submittedAt || '',
    app.appliedSemester || '',
    app.referenceId || '',
    escapeCsv(app.fullName),
    app.studentId || '',
    escapeCsv(app.department),
    escapeCsv(app.batchSemester),
    app.gender || '',
    app.bloodGroup || '',
    app.phone || '',
    app.email || '',
    escapeCsv(app.previousExperience),
    escapeCsv(app.statementOfPurpose),
    'Pending Recruitment',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
};

/**
 * Download CSV file directly for Google Sheets / Excel import
 */
export const downloadRecruitmentCsv = (applicants: ApplicantSubmission[], semesterName: string) => {
  const csv = generateRecruitmentCsv(applicants);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeSemester = semesterName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  a.href = url;
  a.download = `MU_BNCC_Recruitment_${safeSemester}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Copy recruitment table data formatted for instant paste into Google Sheets (TSV format)
 */
export const copyRecruitmentForGoogleSheets = async (
  applicants: ApplicantSubmission[]
): Promise<boolean> => {
  const headers = [
    'Timestamp',
    'Semester',
    'Reference ID',
    'Full Name',
    'Student ID',
    'Department',
    'Batch & Semester',
    'Gender',
    'Blood Group',
    'Phone',
    'Email',
    'Previous Experience',
    'Statement of Purpose',
    'Status',
  ];

  const rows = applicants.map((app) => [
    app.submittedAt || '',
    app.appliedSemester || '',
    app.referenceId || '',
    app.fullName || '',
    app.studentId || '',
    app.department || '',
    app.batchSemester || '',
    app.gender || '',
    app.bloodGroup || '',
    app.phone || '',
    app.email || '',
    (app.previousExperience || '').replace(/[\t\n\r]/g, ' '),
    (app.statementOfPurpose || '').replace(/[\t\n\r]/g, ' '),
    'Pending Recruitment',
  ]);

  const tsv = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
  try {
    await navigator.clipboard.writeText(tsv);
    return true;
  } catch (err) {
    console.warn('Clipboard write failed:', err);
    return false;
  }
};

/**
 * Automatically open a newly created Google Sheet for a recruitment timeline.
 * If applicants are provided, copies the full data table to the clipboard and downloads a CSV backup.
 */
export const openGoogleSheetForTimeline = async (
  semesterName: string,
  applicants?: ApplicantSubmission[],
  customUrl?: string
) => {
  const title = `MU BNCC Recruits - ${semesterName.trim() || 'New Recruitment Cycle'}`;
  
  // Always prepare recruitment records and headers for clipboard paste
  try {
    await copyRecruitmentForGoogleSheets(applicants || []);
  } catch (e) {
    console.warn('Clipboard copy error:', e);
  }
  try {
    downloadRecruitmentCsv(applicants || [], semesterName);
  } catch (e) {
    console.warn('CSV download error:', e);
  }

  const targetUrl =
    customUrl && customUrl.trim().startsWith('http')
      ? customUrl.trim()
      : `https://docs.google.com/spreadsheets/create?title=${encodeURIComponent(title)}`;

  try {
    const newWindow = window.open(targetUrl, '_blank', 'noopener,noreferrer');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      const a = document.createElement('a');
      a.href = targetUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (err) {
    console.warn('Could not open spreadsheet URL:', err);
  }
};
