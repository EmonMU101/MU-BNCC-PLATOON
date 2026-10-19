import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export const SUPER_ADMIN_EMAIL = 'rahadahmedemon11@gmail.com';

export type AdminRole =
  | 'Super Admin'
  | 'Sub-Admin'
  | 'Platoon Commander'
  | 'Army Staff Instructor'
  | 'Cadet Under Officer'
  | 'Training Officer';

export type AdminAccessStatus = 'approved' | 'pending' | 'revoked';

export interface AdminUserRecord {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  status: AdminAccessStatus;
  isSuperAdmin: boolean;
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  notes?: string;
}

const STORAGE_KEY = 'mu_bncc_admin_users';

export const SUPER_ADMIN_RECORD: AdminUserRecord = {
  id: 'super-admin-rahad',
  email: SUPER_ADMIN_EMAIL,
  displayName: 'Rahad Ahmed Emon',
  role: 'Super Admin',
  status: 'approved',
  isSuperAdmin: true,
  requestedAt: '2025-01-01T00:00:00.000Z',
  approvedAt: '2025-01-01T00:00:00.000Z',
  approvedBy: 'System Master Authority',
  notes: 'Permanent Root Super Admin of Metropolitan University BNCC Platoon',
};

/**
 * Normalizes email address for consistent comparison
 */
export const normalizeEmail = (email?: string | null): string => {
  return (email || '').trim().toLowerCase();
};

/**
 * Verifies if given email belongs to the Root Super Admin
 */
export const isSuperAdminEmail = (email?: string | null): boolean => {
  return normalizeEmail(email) === normalizeEmail(SUPER_ADMIN_EMAIL);
};

/**
 * Cryptographic SHA-256 hash of the unique strong Super Admin master password.
 * The plaintext password is never stored or exposed anywhere in the client code.
 */
const SUPER_ADMIN_PASSWORD_HASH = '4895cb48f2b2893e225ed39230a7f611ad0fc61f71f5764b8d62bf4c2512e0c8';

/**
 * Verifies if the provided password matches the cryptographic SHA-256 hash
 * of the Super Admin master password without exposing plaintext.
 */
export const verifySuperAdminPassword = async (inputPassword?: string): Promise<boolean> => {
  if (!inputPassword) return false;
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(inputPassword.trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex === SUPER_ADMIN_PASSWORD_HASH;
  } catch (err) {
    console.error('Super Admin password verification failed:', err);
    return false;
  }
};

/**
 * Retrieves cached admin users from localStorage
 */
export const getStoredAdminUsers = (): AdminUserRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const users: AdminUserRecord[] = raw ? JSON.parse(raw) : [];

    // Ensure Super Admin is always present
    const superAdminExists = users.some(
      (u) => normalizeEmail(u.email) === normalizeEmail(SUPER_ADMIN_EMAIL)
    );

    if (!superAdminExists) {
      users.unshift(SUPER_ADMIN_RECORD);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }

    return users;
  } catch (err) {
    console.warn('Failed to parse local admin users:', err);
    return [SUPER_ADMIN_RECORD];
  }
};

/**
 * Saves admin users list to localStorage
 */
export const saveStoredAdminUsers = (users: AdminUserRecord[]): void => {
  try {
    // Ensure Super Admin cannot be removed or demoted
    const cleaned = users.filter(
      (u) => normalizeEmail(u.email) !== normalizeEmail(SUPER_ADMIN_EMAIL)
    );
    cleaned.unshift(SUPER_ADMIN_RECORD);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
  } catch (err) {
    console.warn('Failed to save admin users to localStorage:', err);
  }
};

/**
 * Fetches all admin users from Firestore with localStorage fallback
 */
export const fetchAdminUsers = async (): Promise<AdminUserRecord[]> => {
  const localUsers = getStoredAdminUsers();
  try {
    const adminsRef = collection(db, 'admins');
    const snapshot = await getDocs(adminsRef);

    if (snapshot.empty) {
      // Seed Firestore with the Super Admin record if empty
      try {
        await setDoc(doc(db, 'admins', 'super-admin-rahad'), SUPER_ADMIN_RECORD);
      } catch (seedErr) {
        console.warn('Could not seed Super Admin to Firestore:', seedErr);
      }
      return localUsers;
    }

    const firestoreUsers: AdminUserRecord[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        email: data.email || '',
        displayName: data.displayName || data.email || 'Platoon Officer',
        role: data.role || 'Sub-Admin',
        status: data.status || 'pending',
        isSuperAdmin: Boolean(data.isSuperAdmin || isSuperAdminEmail(data.email)),
        requestedAt: data.requestedAt || new Date().toISOString(),
        approvedAt: data.approvedAt,
        approvedBy: data.approvedBy,
        notes: data.notes,
      };
    });

    // Merge Firestore with Local Users
    const mergedMap = new Map<string, AdminUserRecord>();

    localUsers.forEach((u) => {
      mergedMap.set(normalizeEmail(u.email), u);
    });

    firestoreUsers.forEach((u) => {
      mergedMap.set(normalizeEmail(u.email), u);
    });

    // Always enforce Super Admin record
    mergedMap.set(normalizeEmail(SUPER_ADMIN_EMAIL), SUPER_ADMIN_RECORD);

    const mergedList = Array.from(mergedMap.values());
    saveStoredAdminUsers(mergedList);
    return mergedList;
  } catch (err) {
    console.warn('Error fetching admin users from Firestore, using cached records:', err);
    return localUsers;
  }
};

/**
 * Checks whether an account has authorized access to the administrative portal
 */
export const checkAdminAccess = async (
  email?: string | null
): Promise<{
  hasAccess: boolean;
  isSuperAdmin: boolean;
  status: AdminAccessStatus | 'none';
  role: AdminRole;
  userRecord?: AdminUserRecord;
}> => {
  if (!email) {
    return {
      hasAccess: false,
      isSuperAdmin: false,
      status: 'none',
      role: 'Sub-Admin',
    };
  }

  const cleanEmail = normalizeEmail(email);

  // 1. Root Super Admin is ALWAYS authorized
  if (cleanEmail === normalizeEmail(SUPER_ADMIN_EMAIL)) {
    return {
      hasAccess: true,
      isSuperAdmin: true,
      status: 'approved',
      role: 'Super Admin',
      userRecord: SUPER_ADMIN_RECORD,
    };
  }

  // 2. Check local/cached records first for instant response
  const localList = getStoredAdminUsers();
  const localMatch = localList.find((u) => normalizeEmail(u.email) === cleanEmail);

  if (localMatch && localMatch.status === 'approved') {
    return {
      hasAccess: true,
      isSuperAdmin: false,
      status: 'approved',
      role: localMatch.role,
      userRecord: localMatch,
    };
  }

  // 3. Check Firestore for latest verification
  try {
    const docId = cleanEmail.replace(/[^a-z0-9]/g, '_');
    const docRef = doc(db, 'admins', docId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as AdminUserRecord;
      const status = data.status || 'pending';
      const record: AdminUserRecord = {
        ...data,
        id: snap.id,
      };

      // Update local storage
      const updatedList = localList.filter((u) => normalizeEmail(u.email) !== cleanEmail);
      updatedList.push(record);
      saveStoredAdminUsers(updatedList);

      return {
        hasAccess: status === 'approved',
        isSuperAdmin: false,
        status: status,
        role: data.role || 'Sub-Admin',
        userRecord: record,
      };
    }
  } catch (err) {
    console.warn('Firestore admin verification error:', err);
  }

  if (localMatch) {
    return {
      hasAccess: localMatch.status === 'approved',
      isSuperAdmin: false,
      status: localMatch.status,
      role: localMatch.role,
      userRecord: localMatch,
    };
  }

  return {
    hasAccess: false,
    isSuperAdmin: false,
    status: 'none',
    role: 'Sub-Admin',
  };
};

/**
 * Requests sub-admin access for a newly signed up user
 */
export const requestSubAdminAccess = async (data: {
  email: string;
  displayName?: string;
  role?: AdminRole;
  notes?: string;
}): Promise<AdminUserRecord> => {
  const cleanEmail = normalizeEmail(data.email);
  const isSuper = cleanEmail === normalizeEmail(SUPER_ADMIN_EMAIL);
  const docId = cleanEmail.replace(/[^a-z0-9]/g, '_');

  const newRecord: AdminUserRecord = {
    id: docId,
    email: cleanEmail,
    displayName: data.displayName || cleanEmail.split('@')[0],
    role: isSuper ? 'Super Admin' : data.role || 'Sub-Admin',
    status: isSuper ? 'approved' : 'pending',
    isSuperAdmin: isSuper,
    requestedAt: new Date().toISOString(),
    approvedAt: isSuper ? new Date().toISOString() : undefined,
    approvedBy: isSuper ? 'Self (Super Admin)' : undefined,
    notes: data.notes || '',
  };

  // Save to Firestore
  try {
    await setDoc(doc(db, 'admins', docId), newRecord);
  } catch (err) {
    console.warn('Failed to write sub-admin request to Firestore:', err);
  }

  // Save to local storage
  const users = getStoredAdminUsers().filter(
    (u) => normalizeEmail(u.email) !== cleanEmail
  );
  users.push(newRecord);
  saveStoredAdminUsers(users);

  return newRecord;
};

/**
 * Super Admin approves a Sub-Admin request
 */
export const approveSubAdmin = async (
  idOrEmail: string,
  approverEmail: string
): Promise<AdminUserRecord> => {
  if (!isSuperAdminEmail(approverEmail)) {
    throw new Error('Only the Super Admin (rahadahmedemon11@gmail.com) can approve sub-admins.');
  }

  const users = getStoredAdminUsers();
  const index = users.findIndex(
    (u) => u.id === idOrEmail || normalizeEmail(u.email) === normalizeEmail(idOrEmail)
  );

  if (index === -1) {
    throw new Error('Sub-admin record not found.');
  }

  const target = users[index];
  const updated: AdminUserRecord = {
    ...target,
    status: 'approved',
    approvedAt: new Date().toISOString(),
    approvedBy: approverEmail,
  };

  users[index] = updated;
  saveStoredAdminUsers(users);

  try {
    const docId = target.id || normalizeEmail(target.email).replace(/[^a-z0-9]/g, '_');
    await setDoc(doc(db, 'admins', docId), updated, { merge: true });
  } catch (err) {
    console.warn('Failed to update approval status in Firestore:', err);
  }

  return updated;
};

/**
 * Super Admin revokes a Sub-Admin's access
 */
export const revokeSubAdmin = async (
  idOrEmail: string,
  approverEmail: string
): Promise<AdminUserRecord> => {
  if (!isSuperAdminEmail(approverEmail)) {
    throw new Error('Only the Super Admin (rahadahmedemon11@gmail.com) can revoke sub-admin access.');
  }

  if (isSuperAdminEmail(idOrEmail)) {
    throw new Error('Root Super Admin access cannot be revoked.');
  }

  const users = getStoredAdminUsers();
  const index = users.findIndex(
    (u) => u.id === idOrEmail || normalizeEmail(u.email) === normalizeEmail(idOrEmail)
  );

  if (index === -1) {
    throw new Error('Sub-admin record not found.');
  }

  const target = users[index];
  const updated: AdminUserRecord = {
    ...target,
    status: 'revoked',
  };

  users[index] = updated;
  saveStoredAdminUsers(users);

  try {
    const docId = target.id || normalizeEmail(target.email).replace(/[^a-z0-9]/g, '_');
    await setDoc(doc(db, 'admins', docId), updated, { merge: true });
  } catch (err) {
    console.warn('Failed to update revoked status in Firestore:', err);
  }

  return updated;
};

/**
 * Super Admin permanently deletes a sub-admin record
 */
export const deleteSubAdmin = async (
  idOrEmail: string,
  approverEmail: string
): Promise<void> => {
  if (!isSuperAdminEmail(approverEmail)) {
    throw new Error('Only the Super Admin (rahadahmedemon11@gmail.com) can delete sub-admin records.');
  }

  if (isSuperAdminEmail(idOrEmail)) {
    throw new Error('Root Super Admin record cannot be deleted.');
  }

  const users = getStoredAdminUsers();
  const target = users.find(
    (u) => u.id === idOrEmail || normalizeEmail(u.email) === normalizeEmail(idOrEmail)
  );

  const filtered = users.filter(
    (u) => u.id !== idOrEmail && normalizeEmail(u.email) !== normalizeEmail(idOrEmail)
  );
  saveStoredAdminUsers(filtered);

  if (target) {
    try {
      const docId = target.id || normalizeEmail(target.email).replace(/[^a-z0-9]/g, '_');
      await deleteDoc(doc(db, 'admins', docId));
    } catch (err) {
      console.warn('Failed to delete doc in Firestore:', err);
    }
  }
};

/**
 * Super Admin adds and pre-approves a new Sub-Admin directly
 */
export const createPreApprovedSubAdmin = async (
  data: {
    email: string;
    displayName: string;
    role: AdminRole;
    notes?: string;
  },
  approverEmail: string
): Promise<AdminUserRecord> => {
  if (!isSuperAdminEmail(approverEmail)) {
    throw new Error('Only the Super Admin can pre-approve sub-admins.');
  }

  const cleanEmail = normalizeEmail(data.email);
  if (!cleanEmail) {
    throw new Error('Email address is required.');
  }

  const docId = cleanEmail.replace(/[^a-z0-9]/g, '_');
  const record: AdminUserRecord = {
    id: docId,
    email: cleanEmail,
    displayName: data.displayName.trim() || cleanEmail.split('@')[0],
    role: data.role || 'Sub-Admin',
    status: 'approved',
    isSuperAdmin: isSuperAdminEmail(cleanEmail),
    requestedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: approverEmail,
    notes: data.notes || '',
  };

  const users = getStoredAdminUsers().filter(
    (u) => normalizeEmail(u.email) !== cleanEmail
  );
  users.push(record);
  saveStoredAdminUsers(users);

  try {
    await setDoc(doc(db, 'admins', docId), record);
  } catch (err) {
    console.warn('Failed to write pre-approved sub-admin to Firestore:', err);
  }

  return record;
};
