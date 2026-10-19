import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface ManualAttendanceEntry {
  id: string;
  date: string;
  drillDate?: string;
  segmentType: string;
  paradeType?: string;
  durationHours: number;
  location?: string;
  commandingOfficer?: string;
  reportingOfficer?: string;
  remarks?: string;
  notes?: string;
  verifiedStatus?: string;
  status: 'Attended' | 'Late' | 'Excused' | string;
  createdAt: string;
}

export interface ServiceHonorEntry {
  id: string;
  title: string;
  category: 'Medal' | 'Distinction' | 'Award' | 'Camp Honor' | 'Best Turnout';
  awardingBody: string;
  year: string;
  citation?: string;
  badgeIcon?: string;
  createdAt: string;
}

export interface CadetStoryItem {
  id: string;
  cadetId?: string; // Optional for site visitors, or 'VISITOR' / Cadet ID e.g. MU-BNCC-001
  authorName: string;
  authorRank?: string; // 'Visitor' / 'Guest Supporter' / 'Alumni' or military cadet rank
  authorAvatar?: string;
  authorRole?: string; // e.g. 'Site Visitor', 'University Student', 'Cadet', 'Parent', 'Faculty'
  authorProfession?: string; // Current profession selected by visitor/cadet (e.g. 'Software Engineer', 'Student', 'Teacher')
  authorInstitution?: string; // Optional workplace, university or institution
  authorDepartment?: string;
  category?: string;
  tags?: string[];
  content: string;
  reactionsCount: number;
  reactedUserIds: string[];
  comments?: BlogComment[];
  createdAt: string;
}

export interface BlogComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRank?: string;
  content: string;
  createdAt: string;
}

export interface CadetBlogItem {
  id: string;
  cadetId: string;
  authorName: string;
  authorRank: string;
  authorAvatar?: string;
  title: string;
  category: string;
  content: string;
  coverImage?: string;
  reactionsCount: number;
  reactedUserIds: string[];
  comments: BlogComment[];
  createdAt: string;
}

export interface CadetSocialLinks {
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  github?: string;
}

export interface CadetProfileData {
  uid: string;
  cadetId: string; // Primary Unique Identifier e.g. MU-BNCC-001
  password?: string;
  fullName: string;
  email: string;
  phone: string;
  emergencyContact: string;
  bloodGroup: string;
  department: string;
  currentSemester: string; // Formatted X.Y e.g. '3.1'
  currentRank: string;
  cadetType?: 'cadet' | 'excadet'; // Active Cadet or Ex-Cadet
  height: string;
  weight: string;
  profilePicture: string;
  isVerified: boolean;
  socialLinks?: CadetSocialLinks;
  manualAttendance: ManualAttendanceEntry[];
  serviceHonors: ServiceHonorEntry[];
  attendanceRate?: number;
  trainingHours?: number;
  meritScore?: number;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// RANK HIERARCHY & SORTING MATRIX
// ==========================================

export const RANK_HIERARCHY_WEIGHT: Record<string, number> = {
  'professor under officer': 100,
  'platoon commander': 100,
  'puo': 100,
  'cadet under officer': 90,
  'cuo': 90,
  'cadet sergeant': 80,
  'c/sgt': 80,
  'sgt': 80,
  'sergeant': 80,
  'cadet corporal': 70,
  'c/cpl': 70,
  'cpl': 70,
  'corporal': 70,
  'cadet lance corporal': 60,
  'c/lcpl': 60,
  'lcpl': 60,
  'lance corporal': 60,
  'cadet': 50,
  'cdt': 50,
};

export const getRankWeight = (rank: string = ''): number => {
  const norm = rank.toLowerCase().trim();
  if (norm.includes('professor') || norm.includes('puo') || norm.includes('platoon commander')) return 100;
  if (norm.includes('under officer') || norm.includes('cuo')) return 90;
  if (norm.includes('sergeant') || norm.includes('sgt')) return 80;
  if (norm.includes('lance corporal') || norm.includes('lcpl') || norm.includes('l/cpl')) return 60;
  if (norm.includes('corporal') || norm.includes('cpl')) return 70;
  if (norm.includes('cadet') || norm.includes('cdt')) return 50;
  return 50;
};

export const sortCadetsByHierarchy = (cadets: CadetProfileData[]): CadetProfileData[] => {
  return [...cadets].sort((a, b) => {
    const weightA = getRankWeight(a.currentRank);
    const weightB = getRankWeight(b.currentRank);

    // Primary Sort: Rank Hierarchy from highest commanders down to lowest
    if (weightA !== weightB) {
      return weightB - weightA;
    }

    // Secondary Sort: For members holding baseline rank or same rank,
    // sort sequentially by their Cadet ID (e.g. MU-BNCC-001, MU-BNCC-002, etc.)
    return a.cadetId.localeCompare(b.cadetId, undefined, { numeric: true, sensitivity: 'base' });
  });
};

// ==========================================
// PRE-SEEDED OFFICIAL CADET ROSTER
// ==========================================

export const INITIAL_CADETS: CadetProfileData[] = [];

export const INITIAL_STORIES: CadetStoryItem[] = [];

export const INITIAL_BLOGS: CadetBlogItem[] = [];

// LocalStorage caching keys
const LOCAL_STORAGE_CADETS_KEY = 'mu_bncc_cadets_roster_cache';
const LOCAL_STORAGE_STORIES_KEY = 'mu_bncc_cadet_stories_cache';
const LOCAL_STORAGE_BLOGS_KEY = 'mu_bncc_cadet_blogs_cache';

export const getCachedCadets = (): CadetProfileData[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CADETS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_CADETS;
  } catch {
    return INITIAL_CADETS;
  }
};

const setCachedCadets = (items: CadetProfileData[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_CADETS_KEY, JSON.stringify(items));
  } catch {}
};

const getCachedStories = (): CadetStoryItem[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_STORIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const clean = parsed.filter(
        (s: any) => !['story-1', 'story-2', 'story-community-1'].includes(s.id)
      );
      if (clean.length !== parsed.length) {
        localStorage.setItem(LOCAL_STORAGE_STORIES_KEY, JSON.stringify(clean));
      }
      return clean;
    }
    return [];
  } catch {
    return [];
  }
};

const setCachedStories = (items: CadetStoryItem[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_STORIES_KEY, JSON.stringify(items));
  } catch {}
};

const getCachedBlogs = (): CadetBlogItem[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BLOGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const clean = parsed.filter(
        (b: any) => !['blog-1', 'blog-2'].includes(b.id)
      );
      if (clean.length !== parsed.length) {
        localStorage.setItem(LOCAL_STORAGE_BLOGS_KEY, JSON.stringify(clean));
      }
      return clean;
    }
    return [];
  } catch {
    return [];
  }
};

const setCachedBlogs = (items: CadetBlogItem[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_BLOGS_KEY, JSON.stringify(items));
  } catch {}
};

// ==========================================
// CADET AUTHENTICATION & PROFILE METHODS
// ==========================================

/**
 * Authenticates a cadet using unique Cadet ID, registered Email verification, and Password
 */
export const authenticateCadetWithId = async (
  cadetId: string,
  email: string,
  pass: string
): Promise<{ success: boolean; cadet?: CadetProfileData; error?: string }> => {
  const cleanId = cadetId.trim();
  const cleanEmail = email.trim().toLowerCase();

  // 1. Try fetching from Firestore
  try {
    const colRef = collection(db, 'cadets');
    const q = query(colRef, where('cadetId', '==', cleanId));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const docData = snap.docs[0].data() as CadetProfileData;
      // Verify email matches the cadet record
      if (cleanEmail && docData.email && docData.email.trim().toLowerCase() !== cleanEmail) {
        return {
          success: false,
          error: 'Email does not match the registered record for this Cadet ID. Please enter your verified cadet email.',
        };
      }
      if (docData.password && docData.password !== pass) {
        return { success: false, error: 'Invalid password for this Cadet ID.' };
      }
      return { success: true, cadet: { ...docData, uid: snap.docs[0].id } };
    }
  } catch (err) {
    console.warn('Firestore auth query fallback:', err);
  }

  // 2. Fallback to cached/pre-seeded cadets
  const localList = getCachedCadets();
  const found = localList.find(
    (c) => c.cadetId.toLowerCase() === cleanId.toLowerCase()
  );

  if (!found) {
    return {
      success: false,
      error: `Cadet ID "${cleanId}" not found. Please register or check your regimental ID.`,
    };
  }

  // Verify email matches the cadet record
  if (cleanEmail && found.email && found.email.trim().toLowerCase() !== cleanEmail) {
    return {
      success: false,
      error: 'Email does not match the registered record for this Cadet ID. Please enter your verified cadet email.',
    };
  }

  if (found.password && found.password !== pass) {
    return { success: false, error: 'Incorrect password for this Cadet ID.' };
  }

  return { success: true, cadet: found };
};

/**
 * Reset cadet password using Cadet ID and registered Email verification
 */
export const resetCadetPasswordByEmailAndId = async (
  cadetId: string,
  email: string,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
  const cleanId = cadetId.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanId) {
    return { success: false, error: 'Cadet ID is required for verification.' };
  }
  if (!cleanEmail) {
    return { success: false, error: 'Registered Email is required for verification.' };
  }
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters.' };
  }

  const now = new Date().toISOString();

  // 1. Try finding in Firestore
  try {
    const colRef = collection(db, 'cadets');
    const q = query(colRef, where('cadetId', '==', cleanId));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const docSnap = snap.docs[0];
      const docData = docSnap.data() as CadetProfileData;

      if (!docData.email || docData.email.trim().toLowerCase() !== cleanEmail) {
        return {
          success: false,
          error: 'Verification failed: The provided email does not match our records for Cadet ID ' + cleanId + '.',
        };
      }

      await updateDoc(doc(db, 'cadets', docSnap.id), {
        password: newPassword,
        updatedAt: now,
      });

      // Update local roster cache as well
      const current = getCachedCadets();
      const updated = current.map((c) =>
        c.cadetId.toLowerCase() === cleanId.toLowerCase()
          ? { ...c, password: newPassword, updatedAt: now }
          : c
      );
      setCachedCadets(updated);

      return {
        success: true,
        message: 'Password reset successful! You can now sign in with your new password.',
      };
    }
  } catch (err) {
    console.warn('Firestore password reset fallback:', err);
  }

  // 2. Fallback to cached/pre-seeded cadets
  const localList = getCachedCadets();
  const cadetIndex = localList.findIndex(
    (c) => c.cadetId.toLowerCase() === cleanId.toLowerCase()
  );

  if (cadetIndex === -1) {
    return {
      success: false,
      error: `Cadet ID "${cleanId}" not found in platoon records.`,
    };
  }

  const cadet = localList[cadetIndex];
  if (!cadet.email || cadet.email.trim().toLowerCase() !== cleanEmail) {
    return {
      success: false,
      error: `Verification failed: The email does not match our records for Cadet ID ${cleanId}.`,
    };
  }

  // Update password in local list
  const updatedList = [...localList];
  updatedList[cadetIndex] = {
    ...cadet,
    password: newPassword,
    updatedAt: now,
  };
  setCachedCadets(updatedList);

  return {
    success: true,
    message: 'Password reset successful! You can now sign in with your new password.',
  };
};

/**
 * Register a new cadet with Cadet ID and Profile fields
 */
export const registerNewCadet = async (
  profile: Omit<CadetProfileData, 'uid' | 'createdAt' | 'updatedAt' | 'isVerified' | 'manualAttendance' | 'serviceHonors'>,
  password: string
): Promise<{ success: boolean; cadet?: CadetProfileData; error?: string }> => {
  // Validate Semester format X.Y e.g. 3.3 for Metropolitan University tri-semester system
  const semesterRegex = /^[1-5]\.[1-3]$/;
  if (!semesterRegex.test(profile.currentSemester.trim())) {
    return {
      success: false,
      error: 'Current Semester must adhere to the format X.Y (e.g., 3.3 representing 3rd year, 3rd semester in the university tri-semester system).',
    };
  }

  // Check unique Cadet ID
  const allCadets = await getAllCadets();
  const existing = allCadets.find(
    (c) => c.cadetId.toLowerCase() === profile.cadetId.trim().toLowerCase()
  );
  if (existing) {
    return {
      success: false,
      error: `Cadet ID "${profile.cadetId}" is already registered in the platoon database.`,
    };
  }

  const now = new Date().toISOString();
  const newCadetId = `cadet-${profile.cadetId.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  const newRecord: CadetProfileData = {
    ...profile,
    cadetType: profile.cadetType || 'cadet',
    uid: newCadetId,
    password,
    isVerified: false, // New registrations start as unverified until admin approval
    manualAttendance: [],
    serviceHonors: [],
    attendanceRate: 80,
    trainingHours: 0,
    meritScore: 50,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const docRef = doc(db, 'cadets', newCadetId);
    await setDoc(docRef, newRecord);
  } catch (err) {
    console.warn('Could not write cadet to Firestore:', err);
  }

  const cached = getCachedCadets();
  setCachedCadets([...cached, newRecord]);

  return { success: true, cadet: newRecord };
};

/**
 * Real-time subscription to verified cadets for Public About Us Directory
 */
export const subscribeVerifiedCadets = (
  callback: (cadets: CadetProfileData[]) => void
): (() => void) => {
  const cached = getCachedCadets().filter((c) => c.isVerified);
  callback(sortCadetsByHierarchy(cached));

  try {
    const colRef = collection(db, 'cadets');
    const q = query(colRef, where('isVerified', '==', true));

    return onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const list: CadetProfileData[] = snap.docs.map((d) => ({
            uid: d.id,
            ...(d.data() as Omit<CadetProfileData, 'uid'>),
          }));
          const sorted = sortCadetsByHierarchy(list);
          callback(sorted);
        } else {
          setCachedCadets([]);
          callback([]);
        }
      },
      (err) => {
        console.warn('Verified cadets subscription error:', err);
        const local = getCachedCadets().filter((c) => c.isVerified);
        callback(sortCadetsByHierarchy(local));
      }
    );
  } catch (err) {
    console.warn('Failed to listen to verified cadets:', err);
    const local = getCachedCadets().filter((c) => c.isVerified);
    callback(sortCadetsByHierarchy(local));
    return () => {};
  }
};

/**
 * Fetch all cadets (for admin verification panel)
 */
export const getAllCadets = async (): Promise<CadetProfileData[]> => {
  try {
    const colRef = collection(db, 'cadets');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const list = snap.docs.map((d) => ({
        uid: d.id,
        ...(d.data() as Omit<CadetProfileData, 'uid'>),
      }));
      setCachedCadets(list);
      return list;
    } else {
      return [];
    }
  } catch (err) {
    console.warn('Error fetching all cadets:', err);
    return getCachedCadets();
  }
};

/**
 * Toggle admin verification status for a cadet
 */
export const setCadetVerificationStatus = async (
  uid: string,
  isVerified: boolean
): Promise<void> => {
  const now = new Date().toISOString();
  try {
    const docRef = doc(db, 'cadets', uid);
    await updateDoc(docRef, { isVerified, updatedAt: now });
  } catch (err) {
    console.warn('Could not update cadet verification in Firestore:', err);
  }

  const current = getCachedCadets();
  const updated = current.map((c) => (c.uid === uid ? { ...c, isVerified, updatedAt: now } : c));
  setCachedCadets(updated);

  // If newly verified, trigger automated verification notification email
  if (isVerified) {
    const cadet = updated.find((c) => c.uid === uid);
    if (cadet) {
      try {
        const { sendCadetVerificationEmailNotification } = await import('./emailNotificationService');
        await sendCadetVerificationEmailNotification(cadet);
      } catch (emailErr) {
        console.warn('Could not dispatch verification email notification:', emailErr);
      }
    }
  }
};

/**
 * Update full cadet profile
 */
export const updateCadetProfile = async (
  uid: string,
  updates: Partial<CadetProfileData>
): Promise<CadetProfileData> => {
  const now = new Date().toISOString();
  try {
    const docRef = doc(db, 'cadets', uid);
    await updateDoc(docRef, { ...updates, updatedAt: now });
  } catch (err) {
    console.warn('Could not update profile in Firestore:', err);
  }

  const current = getCachedCadets();
  const updated = current.map((c) =>
    c.uid === uid ? { ...c, ...updates, updatedAt: now } : c
  );
  setCachedCadets(updated);
  return updated.find((c) => c.uid === uid)!;
};

/**
 * Delete / Reject a cadet verification request or remove a cadet record
 */
export const deleteCadet = async (uid: string): Promise<boolean> => {
  try {
    const docRef = doc(db, 'cadets', uid);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Could not delete cadet document in Firestore:', err);
  }

  // Remove from in-memory cache and localStorage
  const current = getCachedCadets();
  const updated = current.filter((c) => c.uid !== uid);
  setCachedCadets(updated);

  const activeRaw = localStorage.getItem('mu_bncc_active_cadet');
  if (activeRaw) {
    try {
      const active = JSON.parse(activeRaw);
      if (active.uid === uid) {
        localStorage.removeItem('mu_bncc_active_cadet');
      }
    } catch {
      // ignore
    }
  }

  return true;
};

/**
 * Fetch a cadet's public profile by Cadet ID or UID.
 * CRITICAL SECURITY ENFORCEMENT:
 * Cadet contact phone and emergency contact are STRICTLY redacted/hidden from public view!
 */
export const fetchCadetPublicProfile = async (
  cadetIdOrUid: string
): Promise<CadetProfileData | null> => {
  if (!cadetIdOrUid) return null;
  const normalized = cadetIdOrUid.trim().toLowerCase();

  // First check cached / in-memory list
  const all = await getAllCadets();
  const match = all.find(
    (c) =>
      c.cadetId.toLowerCase() === normalized ||
      c.uid.toLowerCase() === normalized
  );

  if (!match) {
    // Attempt Firestore direct get if not found in list
    try {
      const docRef = doc(db, 'cadets', cadetIdOrUid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const raw = snapshot.data() as CadetProfileData;
        return {
          ...raw,
          phone: '', // STRICT SECURITY: Redact phone number
          emergencyContact: '', // STRICT SECURITY: Redact emergency contact
        };
      }
    } catch (err) {
      console.warn('Could not fetch cadet document:', err);
    }
    return null;
  }

  // Return with phone and emergency contact strictly redacted
  return {
    ...match,
    phone: '', // STRICT SECURITY: Redact phone number
    emergencyContact: '', // STRICT SECURITY: Redact emergency contact
  };
};

/**
 * Seed initial cadet records to Firestore (no-op since mock data is stripped)
 */
export const seedInitialCadets = async (): Promise<void> => {
  try {
    for (const c of INITIAL_CADETS) {
      const docRef = doc(db, 'cadets', c.uid);
      await setDoc(docRef, c, { merge: true });
    }
  } catch (err) {
    console.warn('Error seeding initial cadets:', err);
  }
};

/**
 * Purge all mock cadet records from Firestore database and local storage
 */
export const purgeMockCadetData = async (): Promise<number> => {
  const MOCK_UIDS = [
    'cadet-tanvir-001',
    'cadet-fahimur-cuo',
    'cadet-sadia-002',
    'cadet-rafiq-003',
    'cadet-nusrat-004',
    'cadet-shahriar-005',
    'cadet-tasnim-006',
    'cadet-imran-007',
    'cadet-samin-excadet',
  ];
  let purgedCount = 0;
  try {
    for (const uid of MOCK_UIDS) {
      try {
        await deleteDoc(doc(db, 'cadets', uid));
        purgedCount++;
      } catch {}
    }
    const snap = await getDocs(collection(db, 'cadets'));
    for (const d of snap.docs) {
      if (d.id.startsWith('cadet-') || MOCK_UIDS.includes(d.id)) {
        try {
          await deleteDoc(doc(db, 'cadets', d.id));
          purgedCount++;
        } catch {}
      }
    }
  } catch (err) {
    console.warn('Error purging mock cadets:', err);
  }

  localStorage.removeItem(LOCAL_STORAGE_CADETS_KEY);
  return purgedCount;
};

// ==========================================
// PHASE 4 MODULE 1: MANUAL ATTENDANCE SYSTEM
// ==========================================

export const addManualAttendanceLog = async (
  cadetUid: string,
  entry: Omit<ManualAttendanceEntry, 'id' | 'createdAt'>
): Promise<ManualAttendanceEntry> => {
  const now = new Date().toISOString();
  const newEntry: ManualAttendanceEntry = {
    ...entry,
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now,
  };

  const allCadets = getCachedCadets();
  const cadet = allCadets.find((c) => c.uid === cadetUid);
  const updatedAttendance = [newEntry, ...(cadet?.manualAttendance || [])];
  const newHours = (cadet?.trainingHours || 0) + (entry.durationHours || 0);

  try {
    const docRef = doc(db, 'cadets', cadetUid);
    await updateDoc(docRef, {
      manualAttendance: updatedAttendance,
      trainingHours: newHours,
      updatedAt: now,
    });
  } catch (err) {
    console.warn('Could not save attendance log to Firestore:', err);
  }

  setCachedCadets(
    allCadets.map((c) =>
      c.uid === cadetUid
        ? { ...c, manualAttendance: updatedAttendance, trainingHours: newHours, updatedAt: now }
        : c
    )
  );

  return newEntry;
};

// ==========================================
// PHASE 4 MODULE 2: SERVICE HONORS & MEDALS PORTFOLIO
// ==========================================

export const addServiceHonor = async (
  cadetUid: string,
  honor: Omit<ServiceHonorEntry, 'id' | 'createdAt'>
): Promise<ServiceHonorEntry> => {
  const now = new Date().toISOString();
  const newHonor: ServiceHonorEntry = {
    ...honor,
    id: `hon-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now,
  };

  const allCadets = getCachedCadets();
  const cadet = allCadets.find((c) => c.uid === cadetUid);
  const updatedHonors = [newHonor, ...(cadet?.serviceHonors || [])];

  try {
    const docRef = doc(db, 'cadets', cadetUid);
    await updateDoc(docRef, {
      serviceHonors: updatedHonors,
      updatedAt: now,
    });
  } catch (err) {
    console.warn('Could not save service honor in Firestore:', err);
  }

  setCachedCadets(
    allCadets.map((c) =>
      c.uid === cadetUid ? { ...c, serviceHonors: updatedHonors, updatedAt: now } : c
    )
  );

  return newHonor;
};

export const deleteServiceHonor = async (
  cadetUid: string,
  honorId: string
): Promise<void> => {
  const allCadets = getCachedCadets();
  const cadet = allCadets.find((c) => c.uid === cadetUid);
  const updatedHonors = (cadet?.serviceHonors || []).filter((h) => h.id !== honorId);

  try {
    const docRef = doc(db, 'cadets', cadetUid);
    await updateDoc(docRef, {
      serviceHonors: updatedHonors,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {}

  setCachedCadets(
    allCadets.map((c) =>
      c.uid === cadetUid ? { ...c, serviceHonors: updatedHonors } : c
    )
  );
};

// ==========================================
// PHASE 4 MODULE 3: SHARE YOUR STORY MICRO-POSTS
// ==========================================

export const subscribeStories = (
  callback: (stories: CadetStoryItem[]) => void
): (() => void) => {
  callback(getCachedStories());

  try {
    const colRef = collection(db, 'cadet_stories');
    return onSnapshot(
      colRef,
      (snap) => {
        if (!snap.empty) {
          const list: CadetStoryItem[] = snap.docs
            .map((d) => ({
              id: d.id,
              ...(d.data() as Omit<CadetStoryItem, 'id'>),
            }))
            .filter((s) => !['story-1', 'story-2', 'story-community-1'].includes(s.id));
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setCachedStories(list);
          callback(list);
        } else {
          setCachedStories([]);
          callback([]);
        }
      },
      (err) => {
        console.warn('Stories subscription error:', err);
        callback(getCachedStories());
      }
    );
  } catch (err) {
    callback(getCachedStories());
    return () => {};
  }
};

export const createStory = async (
  story: Omit<CadetStoryItem, 'id' | 'createdAt' | 'reactionsCount' | 'reactedUserIds' | 'comments'>
): Promise<CadetStoryItem> => {
  const now = new Date().toISOString();
  const newStoryData: Omit<CadetStoryItem, 'id'> = {
    ...story,
    reactionsCount: 0,
    reactedUserIds: [],
    comments: [],
    createdAt: now,
  };

  let id = `story-${Date.now()}`;
  try {
    const colRef = collection(db, 'cadet_stories');
    const docRef = await addDoc(colRef, newStoryData);
    id = docRef.id;
  } catch (err) {
    console.warn('Error saving story in Firestore:', err);
  }

  const created: CadetStoryItem = { id, ...newStoryData };
  const cached = getCachedStories();
  setCachedStories([created, ...cached]);
  return created;
};

export const toggleReactStory = async (
  storyId: string,
  userUid: string
): Promise<{ reactionsCount: number; hasReacted: boolean }> => {
  const stories = getCachedStories();
  const story = stories.find((s) => s.id === storyId);
  if (!story) return { reactionsCount: 0, hasReacted: false };

  const alreadyReacted = story.reactedUserIds.includes(userUid);
  const updatedReacted = alreadyReacted
    ? story.reactedUserIds.filter((u) => u !== userUid)
    : [...story.reactedUserIds, userUid];
  const updatedCount = updatedReacted.length;

  try {
    const docRef = doc(db, 'cadet_stories', storyId);
    await setDoc(
      docRef,
      {
        ...(story || {}),
        reactionsCount: updatedCount,
        reactedUserIds: updatedReacted,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Error saving story reaction to Firestore:', err);
  }

  const updatedStories = stories.map((s) =>
    s.id === storyId
      ? { ...s, reactionsCount: updatedCount, reactedUserIds: updatedReacted }
      : s
  );
  setCachedStories(updatedStories);

  return { reactionsCount: updatedCount, hasReacted: !alreadyReacted };
};

export const addStoryComment = async (
  storyId: string,
  comment: Omit<BlogComment, 'id' | 'createdAt'>
): Promise<BlogComment> => {
  const now = new Date().toISOString();
  const newComment: BlogComment = {
    ...comment,
    id: `comm-story-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now,
  };

  const stories = getCachedStories();
  const story = stories.find((s) => s.id === storyId);
  const updatedComments = [...(story?.comments || []), newComment];

  try {
    const docRef = doc(db, 'cadet_stories', storyId);
    await setDoc(
      docRef,
      {
        ...(story || {}),
        comments: updatedComments,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Error saving story comment to Firestore:', err);
  }

  const updatedStories = stories.map((s) =>
    s.id === storyId ? { ...s, comments: updatedComments } : s
  );
  setCachedStories(updatedStories);

  return newComment;
};

export const deleteStoryComment = async (
  storyId: string,
  commentId: string
): Promise<boolean> => {
  const stories = getCachedStories();
  const story = stories.find((s) => s.id === storyId);
  if (!story || !story.comments) return false;

  const updatedComments = story.comments.filter((c) => c.id !== commentId);

  try {
    const docRef = doc(db, 'cadet_stories', storyId);
    await setDoc(
      docRef,
      {
        ...(story || {}),
        comments: updatedComments,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Error deleting story comment from Firestore:', err);
  }

  const updatedStories = stories.map((s) =>
    s.id === storyId ? { ...s, comments: updatedComments } : s
  );
  setCachedStories(updatedStories);
  return true;
};

const seedInitialStories = async (): Promise<void> => {
  // Mock data stripped: stories are dynamically posted by verified cadets and visitors
};

// ==========================================
// PHASE 4 MODULE 4: CADET EXPERIENCE BLOG
// ==========================================

export const subscribeBlogs = (
  callback: (blogs: CadetBlogItem[]) => void
): (() => void) => {
  callback(getCachedBlogs());

  try {
    const colRef = collection(db, 'cadet_blogs');
    return onSnapshot(
      colRef,
      (snap) => {
        if (!snap.empty) {
          const list: CadetBlogItem[] = snap.docs
            .map((d) => ({
              id: d.id,
              ...(d.data() as Omit<CadetBlogItem, 'id'>),
            }))
            .filter((b) => !['blog-1', 'blog-2'].includes(b.id));
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setCachedBlogs(list);
          callback(list);
        } else {
          setCachedBlogs([]);
          callback([]);
        }
      },
      (err) => {
        console.warn('Blogs subscription error:', err);
        callback(getCachedBlogs());
      }
    );
  } catch (err) {
    callback(getCachedBlogs());
    return () => {};
  }
};

export const createBlog = async (
  blog: Omit<CadetBlogItem, 'id' | 'createdAt' | 'reactionsCount' | 'reactedUserIds' | 'comments'>
): Promise<CadetBlogItem> => {
  const now = new Date().toISOString();
  const newBlogData: Omit<CadetBlogItem, 'id'> = {
    ...blog,
    reactionsCount: 0,
    reactedUserIds: [],
    comments: [],
    createdAt: now,
  };

  let id = `blog-${Date.now()}`;
  try {
    const colRef = collection(db, 'cadet_blogs');
    const docRef = await addDoc(colRef, newBlogData);
    id = docRef.id;
  } catch (err) {
    console.warn('Error saving blog in Firestore:', err);
  }

  const created: CadetBlogItem = { id, ...newBlogData };
  const cached = getCachedBlogs();
  setCachedBlogs([created, ...cached]);
  return created;
};

export const toggleReactBlog = async (
  blogId: string,
  userUid: string
): Promise<{ reactionsCount: number; hasReacted: boolean }> => {
  const blogs = getCachedBlogs();
  const blog = blogs.find((b) => b.id === blogId);
  if (!blog) return { reactionsCount: 0, hasReacted: false };

  const alreadyReacted = blog.reactedUserIds.includes(userUid);
  const updatedReacted = alreadyReacted
    ? blog.reactedUserIds.filter((u) => u !== userUid)
    : [...blog.reactedUserIds, userUid];
  const updatedCount = updatedReacted.length;

  try {
    const docRef = doc(db, 'cadet_blogs', blogId);
    await setDoc(
      docRef,
      {
        ...(blog || {}),
        reactionsCount: updatedCount,
        reactedUserIds: updatedReacted,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Error saving blog reaction to Firestore:', err);
  }

  const updatedBlogs = blogs.map((b) =>
    b.id === blogId
      ? { ...b, reactionsCount: updatedCount, reactedUserIds: updatedReacted }
      : b
  );
  setCachedBlogs(updatedBlogs);

  return { reactionsCount: updatedCount, hasReacted: !alreadyReacted };
};

export const addBlogComment = async (
  blogId: string,
  comment: Omit<BlogComment, 'id' | 'createdAt'>
): Promise<BlogComment> => {
  const now = new Date().toISOString();
  const newComment: BlogComment = {
    ...comment,
    id: `comm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now,
  };

  const blogs = getCachedBlogs();
  const blog = blogs.find((b) => b.id === blogId);
  const updatedComments = [...(blog?.comments || []), newComment];

  try {
    const docRef = doc(db, 'cadet_blogs', blogId);
    await setDoc(
      docRef,
      {
        ...(blog || {}),
        comments: updatedComments,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Error saving blog comment to Firestore:', err);
  }

  const updatedBlogs = blogs.map((b) =>
    b.id === blogId ? { ...b, comments: updatedComments } : b
  );
  setCachedBlogs(updatedBlogs);

  return newComment;
};

export const deleteBlogComment = async (
  blogId: string,
  commentId: string
): Promise<boolean> => {
  const blogs = getCachedBlogs();
  const blog = blogs.find((b) => b.id === blogId);
  if (!blog || !blog.comments) return false;

  const updatedComments = blog.comments.filter((c) => c.id !== commentId);

  try {
    const docRef = doc(db, 'cadet_blogs', blogId);
    await setDoc(
      docRef,
      {
        ...(blog || {}),
        comments: updatedComments,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Error deleting blog comment from Firestore:', err);
  }

  const updatedBlogs = blogs.map((b) =>
    b.id === blogId ? { ...b, comments: updatedComments } : b
  );
  setCachedBlogs(updatedBlogs);
  return true;
};

// ==========================================
// COMPATIBILITY EXPORTS FOR LEADERBOARD & EVENT PAGES
// ==========================================

export type CadetMemberData = CadetProfileData & {
  cadetNumber?: string;
  rank?: string;
  rankAbbr?: string;
  batch?: string;
  intakeBatch?: string;
  platoonSection?: string;
  paradesAttended?: number;
  totalParades?: number;
  physicalFitnessGrade?: string;
  weaponQualification?: string;
  nextRankTarget?: string;
  promotionEligibility?: boolean;
  communityServiceHours?: number;
  communityServiceEvents?: number;
  voluntaryActivities?: any[];
  distinctionBadge?: string;
  modules?: any[];
  assignedDuties?: any[];
  achievements?: { title: string; event: string; year: string }[];
};

export const DEFAULT_CADET_PROFILES = INITIAL_CADETS as unknown as CadetMemberData[];

export const getCadetProfile = async (
  uid: string,
  fallbackEmail?: string
): Promise<CadetProfileData | null> => {
  const cadets = await getAllCadets();
  return (
    cadets.find(
      (c) =>
        c.uid === uid ||
        (fallbackEmail && c.email.toLowerCase() === fallbackEmail.toLowerCase())
    ) ||
    cadets[0] ||
    null
  );
};

export const calculateMeritScore = (
  trainingHours: number = 0,
  communityServiceHours: number = 0,
  attendanceRate: number = 80
): number => {
  return Math.round(
    trainingHours * 1.5 + communityServiceHours * 2.0 + (attendanceRate / 100) * 50
  );
};

export const getLeaderboardCadets = async (): Promise<CadetMemberData[]> => {
  const list = await getAllCadets();
  return list.map((c) => ({
    ...c,
    cadetNumber: c.cadetId,
    rank: c.currentRank,
    rankAbbr: c.currentRank,
    platoonSection: 'Platoon 1',
    communityServiceHours: 15,
    communityServiceEvents: 4,
    meritScore: calculateMeritScore(c.trainingHours || 60, 15, c.attendanceRate || 90),
  })) as unknown as CadetMemberData[];
};

export const subscribeLeaderboardCadets = (
  callback: (cadets: CadetMemberData[]) => void
): (() => void) => {
  return subscribeVerifiedCadets((list) => {
    const formatted = list.map((c) => ({
      ...c,
      cadetNumber: c.cadetId,
      rank: c.currentRank,
      rankAbbr: c.currentRank,
      platoonSection: 'Platoon 1',
      communityServiceHours: 15,
      communityServiceEvents: 4,
      meritScore: calculateMeritScore(c.trainingHours || 60, 15, c.attendanceRate || 90),
    })) as unknown as CadetMemberData[];
    callback(formatted);
  });
};

export const logCadetCommunityService = async (
  uid: string,
  eventDataOrTitle: string | { title?: string; category?: string; hours?: number; date?: string; verifiedBy?: string },
  hoursOrCadet?: number | CadetMemberData,
  fallbackCadet?: CadetMemberData
): Promise<CadetMemberData> => {
  const hours = typeof eventDataOrTitle === 'object' ? (eventDataOrTitle.hours || 4) : (typeof hoursOrCadet === 'number' ? hoursOrCadet : 4);
  const all = getCachedCadets();
  const c = all.find((item) => item.uid === uid) || (typeof hoursOrCadet === 'object' ? hoursOrCadet : fallbackCadet) || INITIAL_CADETS[0];
  const updatedHours = ((c && 'trainingHours' in c ? c.trainingHours : 0) || 0) + hours;
  if (c) {
    await updateCadetProfile(uid, {
      trainingHours: updatedHours,
    });
  }
  const current = (c || INITIAL_CADETS[0]) as CadetMemberData;
  return {
    ...current,
    cadetNumber: current.cadetId,
    rank: current.currentRank,
    rankAbbr: current.currentRank,
    trainingHours: updatedHours,
    communityServiceHours: ((current.communityServiceHours || 0) + hours),
    meritScore: calculateMeritScore(updatedHours, (current.communityServiceHours || 0) + hours, current.attendanceRate || 90),
  };
};

export const logCadetTrainingHours = async (
  uid: string,
  _moduleTitle: string,
  hours: number,
  _category?: string,
  currentCadet?: CadetMemberData
): Promise<CadetMemberData> => {
  const all = getCachedCadets();
  const c = all.find((item) => item.uid === uid) || currentCadet || INITIAL_CADETS[0];
  const updatedHours = (c.trainingHours || 0) + hours;
  return {
    ...c,
    cadetNumber: c.cadetId,
    rank: c.currentRank,
    rankAbbr: c.currentRank,
    trainingHours: updatedHours,
    meritScore: calculateMeritScore(updatedHours, 15, c.attendanceRate || 90),
  } as CadetMemberData;
};

const seedInitialBlogs = async (): Promise<void> => {
  // Mock data stripped: articles and blogs are dynamically published by cadets
};
