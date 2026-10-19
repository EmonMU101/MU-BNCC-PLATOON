import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface FeaturedCadetDoc {
  id: string;
  semester: string; // e.g. "Spring 2026", "Fall 2025"
  semesterBn?: string; // e.g. "স্প্রিং ২০২৬", "ফল ২০২৫"
  month?: string; // Kept for backwards compatibility
  monthBn?: string;
  fullName: string;
  fullNameBn?: string;
  rank: string;
  rankBn?: string;
  rankAbbr?: string;
  rankAbbrBn?: string;
  cadetNumber: string;
  department: string;
  departmentBn?: string;
  batch?: string;
  batchBn?: string;
  section: string; // Section (Renamed from Platoon/Wing)
  sectionBn?: string;
  photoUrl: string;
  quote?: string;
  quoteBn?: string;
  citation?: string;
  citationBn?: string;
  achievementSummary: string; // Simplified brief description for Cadet of the Semester
  achievementSummaryBn?: string;
  trainingHours?: number;
  communityHours?: number;
  attendanceRate?: number;
  meritScore?: number;
  distinctionBadge?: string;
  distinctionBadgeBn?: string;
  isCurrent?: boolean;
  publishedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// User explicitly requested to remove mock cadet of the month/semester data
export const INITIAL_FEATURED_CADETS: FeaturedCadetDoc[] = [];

// Local cache key for offline resilience and fast loads
const LOCAL_STORAGE_KEY = 'mu_bncc_cadet_of_the_semester';

const getLocalCadets = (): FeaturedCadetDoc[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveLocalCadets = (items: FeaturedCadetDoc[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Could not cache featured cadets in localStorage:', e);
  }
};

/**
 * Fetch featured cadets from Firestore with local fallback
 */
export const getFeaturedCadets = async (): Promise<FeaturedCadetDoc[]> => {
  try {
    const featuredRef = collection(db, 'featured_cadets');
    const snapshot = await getDocs(featuredRef);

    if (snapshot.empty) {
      const local = getLocalCadets();
      return local;
    }

    const cadets: FeaturedCadetDoc[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        semester: data.semester || data.month || 'Current Semester',
        semesterBn: data.semesterBn || data.monthBn || 'চলতি সেমিস্টার',
        month: data.month || data.semester,
        monthBn: data.monthBn || data.semesterBn,
        fullName: data.fullName || '',
        fullNameBn: data.fullNameBn || '',
        rank: data.rank || 'Cadet',
        rankBn: data.rankBn || '',
        rankAbbr: data.rankAbbr || 'CDT',
        rankAbbrBn: data.rankAbbrBn || '',
        cadetNumber: data.cadetNumber || '',
        department: data.department || '',
        departmentBn: data.departmentBn || '',
        batch: data.batch || '',
        batchBn: data.batchBn || '',
        section: data.section || 'Platoon 1',
        sectionBn: data.sectionBn || '',
        photoUrl: data.photoUrl || '',
        quote: data.quote || '',
        quoteBn: data.quoteBn || '',
        citation: data.citation || '',
        citationBn: data.citationBn || '',
        achievementSummary: data.achievementSummary || '',
        achievementSummaryBn: data.achievementSummaryBn || '',
        trainingHours: Number(data.trainingHours || 0),
        communityHours: Number(data.communityHours || 0),
        attendanceRate: Number(data.attendanceRate || 0),
        meritScore: Number(data.meritScore || 0),
        distinctionBadge: data.distinctionBadge || 'Exemplary Service',
        distinctionBadgeBn: data.distinctionBadgeBn || '',
        isCurrent: Boolean(data.isCurrent),
        publishedBy: data.publishedBy || '',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    });

    // Filter out any legacy mock entries if still present
    const cleanCadets = cadets.filter(
      (c) => !['tanvir-oct-2026', 'nusrat-sep-2026', 'fahim-aug-2026'].includes(c.id)
    );

    // Sort: isCurrent first, then newest createdAt
    cleanCadets.sort((a, b) => {
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    saveLocalCadets(cleanCadets);
    return cleanCadets;
  } catch (error) {
    console.warn('Error fetching featured cadets from Firestore:', error);
    return getLocalCadets();
  }
};

/**
 * Subscribe to live updates of featured cadets from Firestore
 */
export const subscribeFeaturedCadets = (
  callback: (cadets: FeaturedCadetDoc[]) => void
): (() => void) => {
  try {
    const featuredRef = collection(db, 'featured_cadets');

    return onSnapshot(
      featuredRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const cadets: FeaturedCadetDoc[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              semester: data.semester || data.month || 'Current Semester',
              semesterBn: data.semesterBn || data.monthBn || 'চলতি সেমিস্টার',
              month: data.month || data.semester,
              monthBn: data.monthBn || data.semesterBn,
              fullName: data.fullName || '',
              fullNameBn: data.fullNameBn || '',
              rank: data.rank || 'Cadet',
              rankBn: data.rankBn || '',
              rankAbbr: data.rankAbbr || 'CDT',
              rankAbbrBn: data.rankAbbrBn || '',
              cadetNumber: data.cadetNumber || '',
              department: data.department || '',
              departmentBn: data.departmentBn || '',
              batch: data.batch || '',
              batchBn: data.batchBn || '',
              section: data.section || 'Platoon 1',
              sectionBn: data.sectionBn || '',
              photoUrl: data.photoUrl || '',
              quote: data.quote || '',
              quoteBn: data.quoteBn || '',
              citation: data.citation || '',
              citationBn: data.citationBn || '',
              achievementSummary: data.achievementSummary || '',
              achievementSummaryBn: data.achievementSummaryBn || '',
              trainingHours: Number(data.trainingHours || 0),
              communityHours: Number(data.communityHours || 0),
              attendanceRate: Number(data.attendanceRate || 0),
              meritScore: Number(data.meritScore || 0),
              distinctionBadge: data.distinctionBadge || 'Exemplary Service',
              distinctionBadgeBn: data.distinctionBadgeBn || '',
              isCurrent: Boolean(data.isCurrent),
              publishedBy: data.publishedBy || '',
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
            };
          });

          // Filter out legacy mock data
          const cleanCadets = cadets.filter(
            (c) => !['tanvir-oct-2026', 'nusrat-sep-2026', 'fahim-aug-2026'].includes(c.id)
          );

          cleanCadets.sort((a, b) => {
            if (a.isCurrent && !b.isCurrent) return -1;
            if (!a.isCurrent && b.isCurrent) return 1;
            const timeA = new Date(a.createdAt || 0).getTime();
            const timeB = new Date(b.createdAt || 0).getTime();
            return timeB - timeA;
          });

          saveLocalCadets(cleanCadets);
          callback(cleanCadets);
        } else {
          saveLocalCadets([]);
          callback([]);
        }
      },
      (error) => {
        console.warn('Featured cadets snapshot listener error:', error);
        callback(getLocalCadets());
      }
    );
  } catch (err) {
    console.warn('Error setting up featured cadets snapshot listener:', err);
    callback(getLocalCadets());
    return () => {};
  }
};

/**
 * Publish / Create a new Cadet of the Semester from the Admin Portal
 */
export const createCadetOfTheSemester = async (
  input: Omit<FeaturedCadetDoc, 'id'>
): Promise<FeaturedCadetDoc> => {
  const timestamp = new Date().toISOString();
  const docId = `semester-${Date.now()}`;

  const newDoc: FeaturedCadetDoc = {
    ...input,
    id: docId,
    month: input.month || input.semester,
    monthBn: input.monthBn || input.semesterBn,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  // If set as current, unset previous current honorees
  if (newDoc.isCurrent) {
    try {
      const existing = await getDocs(collection(db, 'featured_cadets'));
      for (const d of existing.docs) {
        if (d.data().isCurrent) {
          await updateDoc(doc(db, 'featured_cadets', d.id), { isCurrent: false });
        }
      }
    } catch (e) {
      console.warn('Could not reset previous isCurrent flag in Firestore:', e);
    }
  }

  // Save to Firestore
  try {
    await setDoc(doc(db, 'featured_cadets', docId), newDoc);
  } catch (error) {
    console.warn('Error saving cadet of the semester to Firestore:', error);
  }

  // Update local cache
  const local = getLocalCadets();
  const updatedLocal = newDoc.isCurrent
    ? local.map((c) => ({ ...c, isCurrent: false }))
    : [...local];
  updatedLocal.unshift(newDoc);
  saveLocalCadets(updatedLocal);

  return newDoc;
};

/**
 * Update an existing Cadet of the Semester record
 */
export const updateCadetOfTheSemester = async (
  id: string,
  updates: Partial<FeaturedCadetDoc>
): Promise<void> => {
  const timestamp = new Date().toISOString();
  const docUpdates = {
    ...updates,
    updatedAt: timestamp,
  };

  if (updates.semester && !updates.month) {
    docUpdates.month = updates.semester;
  }
  if (updates.semesterBn && !updates.monthBn) {
    docUpdates.monthBn = updates.semesterBn;
  }

  if (updates.isCurrent) {
    try {
      const existing = await getDocs(collection(db, 'featured_cadets'));
      for (const d of existing.docs) {
        if (d.id !== id && d.data().isCurrent) {
          await updateDoc(doc(db, 'featured_cadets', d.id), { isCurrent: false });
        }
      }
    } catch (e) {
      console.warn('Could not reset previous isCurrent flag:', e);
    }
  }

  try {
    await updateDoc(doc(db, 'featured_cadets', id), docUpdates);
  } catch (error) {
    console.warn('Error updating cadet of the semester in Firestore:', error);
  }

  const local = getLocalCadets();
  const updatedLocal = local.map((item) => {
    if (item.id === id) {
      return { ...item, ...docUpdates };
    }
    if (updates.isCurrent) {
      return { ...item, isCurrent: false };
    }
    return item;
  });
  saveLocalCadets(updatedLocal);
};

/**
 * Delete a Cadet of the Semester record
 */
export const deleteCadetOfTheSemester = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'featured_cadets', id));
  } catch (error) {
    console.warn('Error deleting cadet of the semester from Firestore:', error);
  }

  const local = getLocalCadets().filter((c) => c.id !== id);
  saveLocalCadets(local);
};

/**
 * Set a specific honoree as current active spotlight
 */
export const setCurrentCadetOfTheSemester = async (id: string): Promise<void> => {
  await updateCadetOfTheSemester(id, { isCurrent: true });
};

/**
 * Purge mock cadet records from Firestore and local cache
 */
export const purgeMockFeaturedCadets = async (): Promise<number> => {
  let count = 0;
  const mockIds = ['tanvir-oct-2026', 'nusrat-sep-2026', 'fahim-aug-2026'];

  try {
    for (const mockId of mockIds) {
      const docRef = doc(db, 'featured_cadets', mockId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        await deleteDoc(docRef);
        count++;
      }
    }

    // Also check if any other documents have mock markers
    const snapshot = await getDocs(collection(db, 'featured_cadets'));
    for (const d of snapshot.docs) {
      const data = d.data();
      if (
        mockIds.includes(d.id) ||
        data.fullName === 'Tanvir Hasan' ||
        data.fullName === 'Nusrat Jahan Sumona' ||
        data.fullName === 'Fahim Shahriar'
      ) {
        await deleteDoc(doc(db, 'featured_cadets', d.id));
        count++;
      }
    }
  } catch (e) {
    console.warn('Error purging mock featured cadets from Firestore:', e);
  }

  // Clear local mock entries
  const local = getLocalCadets().filter(
    (c) =>
      !mockIds.includes(c.id) &&
      !['Tanvir Hasan', 'Nusrat Jahan Sumona', 'Fahim Shahriar'].includes(c.fullName)
  );
  saveLocalCadets(local);

  return count;
};
