import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  limit,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface PostItem {
  id: string;
  title: string;
  titleBn?: string;
  content: string;
  author: string;
  authorRole?: string;
  authorAvatar?: string;
  postType: 'blog' | 'story';
  category: string;
  timestamp: string; // ISO 8601 string
  createdAt: string;
  updatedAt?: string;
  published: boolean;
  coverImage?: string;
  likesCount: number;
  tags?: string[];
  commentsCount?: number;
}

export type CreatePostInput = Omit<PostItem, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'> & {
  id?: string;
  likesCount?: number;
};

export type UpdatePostInput = Partial<Omit<PostItem, 'id'>>;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operation: OperationType;
  path: string;
  authInfo: {
    userId: string | null;
    email: string | null;
  };
}

function handleFirestoreError(error: unknown, operation: OperationType, path: string): never {
  const errObj = error as { message?: string; code?: string };
  const info: FirestoreErrorInfo = {
    error: errObj?.message || String(error),
    operation,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
    },
  };
  console.error(`Firestore error at [${operation}] ${path}:`, info);
  throw new Error(JSON.stringify(info));
}

const COLLECTION_NAME = 'posts';

// Clean authentic posts collection: dynamically published by platoon commanders and cadets
export const INITIAL_POSTS: PostItem[] = [];

// ==========================================
// FIRESTORE CRUD OPERATIONS FOR 'posts'
// ==========================================

/**
 * 1. CREATE: Add a new post record to 'posts'
 */
export const createPost = async (input: CreatePostInput): Promise<PostItem> => {
  const postsCol = collection(db, COLLECTION_NAME);
  const now = new Date().toISOString();
  const postData: Omit<PostItem, 'id'> = {
    title: input.title,
    titleBn: input.titleBn || '',
    content: input.content,
    author: input.author,
    authorRole: input.authorRole || 'Contributor',
    authorAvatar: input.authorAvatar || '',
    postType: input.postType || 'blog',
    category: input.category || 'General',
    timestamp: input.timestamp || now,
    createdAt: now,
    updatedAt: now,
    published: input.published !== undefined ? input.published : true,
    coverImage: input.coverImage || '',
    likesCount: input.likesCount || 0,
    tags: input.tags || [],
    commentsCount: 0,
  };

  try {
    if (input.id) {
      const docRef = doc(db, COLLECTION_NAME, input.id);
      await setDoc(docRef, postData, { merge: true });
      return { id: input.id, ...postData };
    } else {
      const docRef = await addDoc(postsCol, postData);
      return { id: docRef.id, ...postData };
    }
  } catch (err) {
    return handleFirestoreError(err, OperationType.CREATE, COLLECTION_NAME);
  }
};

/**
 * 2. READ: Get a single post by ID
 */
export const getPostById = async (id: string): Promise<PostItem | null> => {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return null;
    }
    const data = snap.data();
    return {
      id: snap.id,
      ...data,
    } as PostItem;
  } catch (err) {
    return handleFirestoreError(err, OperationType.GET, path);
  }
};

/**
 * 3. READ: Get all posts (with optional filtering)
 */
export const getAllPosts = async (postType?: 'blog' | 'story'): Promise<PostItem[]> => {
  try {
    const postsCol = collection(db, COLLECTION_NAME);
    let q = query(postsCol, orderBy('timestamp', 'desc'));
    if (postType) {
      q = query(postsCol, where('postType', '==', postType), orderBy('timestamp', 'desc'));
    }

    const snap = await getDocs(q);
    if (snap.empty) {
      return [];
    }

    const legacyMockIds = [
      'post-regimental-camp-1',
      'post-story-monsoon-drill',
      'post-software-discipline',
      'post-story-wall-scale',
    ];

    return snap.docs
      .map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      .filter((p: any) => !legacyMockIds.includes(p.id)) as PostItem[];
  } catch (err) {
    console.warn('Error fetching all posts:', err);
    return [];
  }
};

/**
 * 4. UPDATE: Modify an existing post
 */
export const updatePost = async (id: string, updates: UpdatePostInput): Promise<void> => {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
};

/**
 * 5. DELETE: Remove a post by ID
 */
export const deletePost = async (id: string): Promise<void> => {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

/**
 * 6. SUBSCRIBE: Real-time listener for posts
 */
export const subscribePosts = (
  callback: (posts: PostItem[]) => void,
  postType?: 'blog' | 'story'
): (() => void) => {
  try {
    const legacyMockIds = [
      'post-regimental-camp-1',
      'post-story-monsoon-drill',
      'post-software-discipline',
      'post-story-wall-scale',
    ];

    const postsCol = collection(db, COLLECTION_NAME);
    const unsubscribe = onSnapshot(
      postsCol,
      (snap) => {
        if (snap.empty) {
          callback([]);
          return;
        }
        const items = snap.docs
          .map((d) => ({
            id: d.id,
            ...d.data(),
          }))
          .filter((p: any) => !legacyMockIds.includes(p.id)) as PostItem[];

        // Sort by timestamp desc
        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        if (postType) {
          callback(items.filter((p) => p.postType === postType));
        } else {
          callback(items);
        }
      },
      (err) => {
        console.warn('Posts real-time listener error:', err);
        callback([]);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to attach subscribePosts listener:', err);
    callback([]);
    return () => {};
  }
};

/**
 * 7. TOGGLE LIKE: Increment / decrement like count
 */
export const togglePostLike = async (id: string, increment: boolean = true): Promise<void> => {
  try {
    const current = await getPostById(id);
    if (!current) return;
    const currentLikes = current.likesCount || 0;
    const nextLikes = increment ? currentLikes + 1 : Math.max(0, currentLikes - 1);
    await updatePost(id, { likesCount: nextLikes });
  } catch (err) {
    console.warn('Error updating post like:', err);
  }
};
