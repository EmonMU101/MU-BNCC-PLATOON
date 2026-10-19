import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface GalleryPhotoItem {
  id: string;
  title: string;
  titleBn?: string;
  category: string;
  categoryLabel?: string;
  categoryLabelBn?: string;
  date: string;
  displayDate?: string;
  displayDateBn?: string;
  year: number;
  location: string;
  locationBn?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  caption: string;
  captionBn?: string;
  platoonOrSquad?: string;
  platoonOrSquadBn?: string;
  tags: string[];
  aspectRatio: 'landscape' | 'portrait' | 'square';
  featured?: boolean;
  uploadedAt: string;
  uploadedBy?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path,
  };
  console.warn('Gallery Firestore Notice:', JSON.stringify(errInfo));
}

const GALLERY_COLLECTION = 'gallery_photos';
const LOCAL_STORAGE_KEY = 'mu_bncc_live_gallery_photos_cache';

const getCachedPhotos = (): GalleryPhotoItem[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const setCachedPhotos = (photos: GalleryPhotoItem[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(photos));
  } catch {}
};

/**
 * Subscribe in real-time to uploaded gallery photos from Firestore
 */
export const subscribeGalleryPhotos = (
  callback: (photos: GalleryPhotoItem[]) => void
): (() => void) => {
  // Immediately provide cached photos if available
  const initialCache = getCachedPhotos();
  callback(initialCache);

  try {
    const colRef = collection(db, GALLERY_COLLECTION);
    return onSnapshot(
      colRef,
      (snap) => {
        if (!snap.empty) {
          const list: GalleryPhotoItem[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<GalleryPhotoItem, 'id'>),
          }));
          // Sort newest uploaded first, then by photo date
          list.sort((a, b) => {
            const dateA = new Date(a.date || a.uploadedAt).getTime();
            const dateB = new Date(b.date || b.uploadedAt).getTime();
            return dateB - dateA;
          });
          setCachedPhotos(list);
          callback(list);
        } else {
          setCachedPhotos([]);
          callback([]);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, GALLERY_COLLECTION);
        callback(getCachedPhotos());
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, GALLERY_COLLECTION);
    callback(getCachedPhotos());
    return () => {};
  }
};

/**
 * Fetch all gallery photos once
 */
export const getGalleryPhotos = async (): Promise<GalleryPhotoItem[]> => {
  try {
    const colRef = collection(db, GALLERY_COLLECTION);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const list: GalleryPhotoItem[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<GalleryPhotoItem, 'id'>),
      }));
      list.sort((a, b) => {
        const dateA = new Date(a.date || a.uploadedAt).getTime();
        const dateB = new Date(b.date || b.uploadedAt).getTime();
        return dateB - dateA;
      });
      setCachedPhotos(list);
      return list;
    }
    return [];
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, GALLERY_COLLECTION);
    return getCachedPhotos();
  }
};

/**
 * Create/Upload a new gallery photo record in Firestore
 */
export const createGalleryPhoto = async (
  item: Omit<GalleryPhotoItem, 'id' | 'uploadedAt'>
): Promise<GalleryPhotoItem> => {
  const uploadedAt = new Date().toISOString();
  const photoPayload: Omit<GalleryPhotoItem, 'id'> = {
    ...item,
    uploadedAt,
    uploadedBy: auth.currentUser?.email || 'Platoon Administrator',
  };

  try {
    const colRef = collection(db, GALLERY_COLLECTION);
    const docRef = await addDoc(colRef, photoPayload);
    const created: GalleryPhotoItem = { id: docRef.id, ...photoPayload };

    const current = getCachedPhotos();
    setCachedPhotos([created, ...current]);
    return created;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, GALLERY_COLLECTION);
    // Offline / fallback cache creation
    const fallbackId = `gallery-${Date.now()}`;
    const created: GalleryPhotoItem = { id: fallbackId, ...photoPayload };
    const current = getCachedPhotos();
    setCachedPhotos([created, ...current]);
    return created;
  }
};

/**
 * Update an existing photo metadata
 */
export const updateGalleryPhoto = async (
  id: string,
  updates: Partial<GalleryPhotoItem>
): Promise<void> => {
  try {
    const docRef = doc(db, GALLERY_COLLECTION, id);
    await setDoc(docRef, updates, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${GALLERY_COLLECTION}/${id}`);
  }

  const current = getCachedPhotos();
  const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
  setCachedPhotos(updated);
};

/**
 * Delete a photo by ID from Firestore and local cache
 */
export const deleteGalleryPhoto = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, GALLERY_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${GALLERY_COLLECTION}/${id}`);
  }

  const current = getCachedPhotos();
  setCachedPhotos(current.filter((p) => p.id !== id));
};

/**
 * Cleanse & purge all mock or seeded demo photos from Firestore and local cache
 */
export const purgeMockGalleryPhotos = async (): Promise<number> => {
  let deletedCount = 0;
  try {
    const colRef = collection(db, GALLERY_COLLECTION);
    const snap = await getDocs(colRef);
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      // Identify mock records: starts with 'photo-' (e.g. photo-01..photo-12) or contains unsplash placeholder
      const isMock =
        docSnap.id.startsWith('photo-') ||
        (typeof data.imageUrl === 'string' && data.imageUrl.includes('unsplash.com/photo-'));
      if (isMock) {
        await deleteDoc(doc(db, GALLERY_COLLECTION, docSnap.id));
        deletedCount++;
      }
    }
  } catch (err) {
    console.warn('Error purging mock gallery photos:', err);
  }

  // Clear local storage cache
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  return deletedCount;
};
