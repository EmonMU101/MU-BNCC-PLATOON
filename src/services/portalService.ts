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
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { EventItem, UPCOMING_EVENTS } from '../data/siteData';

export type NoticeCategory = 'Emergency' | 'General' | 'Training Update';

export interface NoticeRecord {
  id: string;
  text: string;
  category?: NoticeCategory;
  isActive: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_URGENT_NOTICE =
  '*** URGENT NOTICE: MU BNCC Platoon Intake 2025–2026 application dossiers are currently under review. Candidates must report with original Student ID and physical training sportswear for preliminary fitness screening at the MU Central Sports Ground. Regular university parade drills scheduled every Sunday & Wednesday at 06:45 AM sharp. ***';

export const DEFAULT_NOTICE_CATEGORY: NoticeCategory = 'Emergency';

// ==========================================
// NOTICES SERVICE (REAL-TIME PROPAGATION)
// ==========================================

export const subscribeActiveNotice = (
  callback: (
    noticeText: string | null,
    category?: NoticeCategory,
    record?: NoticeRecord | null
  ) => void
) => {
  try {
    const noticesRef = collection(db, 'notices');
    const q = query(noticesRef, where('isActive', '==', true));

    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          // Sort active notices by newest updatedAt or createdAt
          const docs = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<NoticeRecord, 'id'>),
          }));

          docs.sort((a, b) => {
            const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
            const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
            return timeB - timeA;
          });

          const activeRecord = docs[0];
          callback(
            activeRecord.text || null,
            activeRecord.category || 'Emergency',
            activeRecord
          );
        } else {
          // If no active notice exists, serve the default broadcast notice
          callback(DEFAULT_URGENT_NOTICE, DEFAULT_NOTICE_CATEGORY, null);
        }
      },
      (error) => {
        console.warn('Real-time notice snapshot listener error:', error);
        callback(DEFAULT_URGENT_NOTICE, DEFAULT_NOTICE_CATEGORY, null);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to notices:', err);
    callback(DEFAULT_URGENT_NOTICE, DEFAULT_NOTICE_CATEGORY, null);
    return () => {};
  }
};

export const getAllNotices = async (): Promise<NoticeRecord[]> => {
  try {
    const noticesRef = collection(db, 'notices');
    const snapshot = await getDocs(noticesRef);
    if (snapshot.empty) {
      return [
        {
          id: 'default-notice',
          text: DEFAULT_URGENT_NOTICE,
          isActive: true,
          author: 'PUO Abu Yusuf Musa',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    const items = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<NoticeRecord, 'id'>),
    }));

    // Sort descending by date
    items.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return items;
  } catch (error) {
    console.error('Error getting all notices:', error);
    return [];
  }
};

export const seedInitialNotice = async () => {
  try {
    const noticesRef = collection(db, 'notices');
    const noticeDoc = doc(noticesRef, 'default-notice');
    await setDoc(
      noticeDoc,
      {
        text: DEFAULT_URGENT_NOTICE,
        category: 'Emergency',
        isActive: true,
        author: 'PUO Abu Yusuf Musa',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Could not seed notice:', error);
  }
};

export const createNotice = async (
  text: string,
  author: string,
  makeActive: boolean = true,
  category: NoticeCategory = 'Emergency'
): Promise<string> => {
  const noticesRef = collection(db, 'notices');
  const now = new Date().toISOString();

  // If this new notice is to be active, deactivate all previous active notices first
  if (makeActive) {
    try {
      const q = query(noticesRef, where('isActive', '==', true));
      const activeSnapshot = await getDocs(q);
      const deactivations = activeSnapshot.docs.map((d) =>
        updateDoc(doc(db, 'notices', d.id), {
          isActive: false,
          updatedAt: now,
        })
      );
      await Promise.all(deactivations);
    } catch (err) {
      console.warn('Could not deactivate prior notices:', err);
    }
  }

  const newDocRef = await addDoc(noticesRef, {
    text: text.trim(),
    category: category || 'Emergency',
    isActive: makeActive,
    author: author || 'Platoon Leader',
    createdAt: now,
    updatedAt: now,
  });

  return newDocRef.id;
};

export const activateNotice = async (id: string): Promise<void> => {
  const noticesRef = collection(db, 'notices');
  const now = new Date().toISOString();

  // Deactivate all others
  const q = query(noticesRef, where('isActive', '==', true));
  const activeSnapshot = await getDocs(q);
  const deactivations = activeSnapshot.docs.map((d) => {
    if (d.id !== id) {
      return updateDoc(doc(db, 'notices', d.id), {
        isActive: false,
        updatedAt: now,
      });
    }
    return Promise.resolve();
  });
  await Promise.all(deactivations);

  // Activate target
  await updateDoc(doc(db, 'notices', id), {
    isActive: true,
    updatedAt: now,
  });
};

export const updateNotice = async (
  id: string,
  text: string,
  isActive: boolean,
  category?: NoticeCategory
): Promise<void> => {
  const now = new Date().toISOString();
  const updatePayload: Record<string, any> = {
    text: text.trim(),
    updatedAt: now,
  };
  if (category) {
    updatePayload.category = category;
  }

  if (isActive) {
    await activateNotice(id);
    await updateDoc(doc(db, 'notices', id), updatePayload);
  } else {
    updatePayload.isActive = false;
    await updateDoc(doc(db, 'notices', id), updatePayload);
  }
};

export const deleteNotice = async (id: string): Promise<void> => {
  const noticeDoc = doc(db, 'notices', id);
  await deleteDoc(noticeDoc);
};

// ==========================================
// EVENTS SERVICE (REAL-TIME PROPAGATION)
// ==========================================

export const subscribeEvents = (callback: (events: EventItem[]) => void) => {
  try {
    const eventsRef = collection(db, 'events');
    return onSnapshot(
      eventsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const eventsList = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<EventItem, 'id'>),
          }));

          // Sort chronologically
          eventsList.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          callback(eventsList);
        } else {
          // If empty, serve local defaults directly
          callback(UPCOMING_EVENTS);
        }
      },
      (error) => {
        console.warn('Real-time events snapshot listener error:', error);
        callback(UPCOMING_EVENTS);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to events:', err);
    callback(UPCOMING_EVENTS);
    return () => {};
  }
};

export const getAllEvents = async (): Promise<EventItem[]> => {
  try {
    const eventsRef = collection(db, 'events');
    const snapshot = await getDocs(eventsRef);
    if (snapshot.empty) {
      return UPCOMING_EVENTS;
    }

    const eventsList = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<EventItem, 'id'>),
    }));

    eventsList.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return eventsList;
  } catch (error) {
    console.error('Error getting events:', error);
    return UPCOMING_EVENTS;
  }
};

export const seedInitialEvents = async (): Promise<void> => {
  try {
    for (const evt of UPCOMING_EVENTS) {
      const docRef = doc(db, 'events', evt.id);
      await setDoc(docRef, evt, { merge: true });
    }
  } catch (error) {
    console.warn('Could not seed initial events:', error);
  }
};

export const createEvent = async (
  eventData: Omit<EventItem, 'id'>
): Promise<string> => {
  const eventsRef = collection(db, 'events');
  const docRef = await addDoc(eventsRef, {
    ...eventData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const updateEvent = async (
  id: string,
  eventData: Partial<EventItem>
): Promise<void> => {
  const docRef = doc(db, 'events', id);
  await updateDoc(docRef, {
    ...eventData,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteEvent = async (id: string): Promise<void> => {
  const docRef = doc(db, 'events', id);
  await deleteDoc(docRef);
};

// ==========================================
// EVENT RSVP & CADET ATTENDANCE SERVICE
// ==========================================

export type RsvpStatus = 'attending' | 'not_attending';

export interface EventRsvpRecord {
  eventId: string;
  uid: string;
  cadetName?: string;
  cadetRank?: string;
  status: RsvpStatus;
  updatedAt: string;
}

const getLocalRsvps = (uid: string): Record<string, RsvpStatus> => {
  try {
    const raw = localStorage.getItem(`mu_bncc_event_rsvps_${uid}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const setLocalRsvps = (uid: string, rsvps: Record<string, RsvpStatus>) => {
  try {
    localStorage.setItem(`mu_bncc_event_rsvps_${uid}`, JSON.stringify(rsvps));
  } catch {
    // Ignore storage issues in iframe
  }
};

/**
 * Subscribe to a cadet's RSVP status across events in real-time
 */
export const subscribeCadetRsvps = (
  uid: string,
  callback: (rsvps: Record<string, RsvpStatus>) => void
) => {
  // Emit initial local cache immediately
  const cached = getLocalRsvps(uid);
  callback(cached);

  try {
    const cadetRef = doc(db, 'cadets', uid);
    return onSnapshot(
      cadetRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const remoteRsvps: Record<string, RsvpStatus> = data?.eventRsvps || {};
          const merged = { ...getLocalRsvps(uid), ...remoteRsvps };
          setLocalRsvps(uid, merged);
          callback(merged);
        }
      },
      (error) => {
        console.warn('Real-time cadet RSVPs error:', error);
        callback(getLocalRsvps(uid));
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to cadet RSVPs:', err);
    callback(getLocalRsvps(uid));
    return () => {};
  }
};

/**
 * Subscribe to attendance count and attendees list for a specific event
 */
export const subscribeEventAttendees = (
  eventId: string,
  callback: (count: number, attendees: EventRsvpRecord[]) => void
) => {
  try {
    const rsvpsRef = collection(db, 'events', eventId, 'rsvps');
    return onSnapshot(
      rsvpsRef,
      (snapshot) => {
        const records: EventRsvpRecord[] = [];
        let attendingCount = 0;
        snapshot.forEach((d) => {
          const item = d.data() as EventRsvpRecord;
          records.push(item);
          if (item.status === 'attending') {
            attendingCount += 1;
          }
        });
        callback(attendingCount, records);
      },
      (err) => {
        console.warn(`Error subscribing to event ${eventId} attendees:`, err);
        callback(0, []);
      }
    );
  } catch (err) {
    console.warn(`Failed to listen to event ${eventId} attendees:`, err);
    callback(0, []);
    return () => {};
  }
};

/**
 * Toggle attendance RSVP for a cadet
 */
export const toggleEventRsvp = async (
  eventId: string,
  uid: string,
  currentStatus: RsvpStatus | undefined,
  cadetInfo?: { name?: string; rank?: string }
): Promise<RsvpStatus> => {
  const nextStatus: RsvpStatus = currentStatus === 'attending' ? 'not_attending' : 'attending';
  const now = new Date().toISOString();

  // 1. Update local storage cache immediately for optimistic UX
  const local = getLocalRsvps(uid);
  local[eventId] = nextStatus;
  setLocalRsvps(uid, local);

  // 2. Persist to cadet profile document
  try {
    const cadetRef = doc(db, 'cadets', uid);
    await setDoc(
      cadetRef,
      {
        eventRsvps: {
          [eventId]: nextStatus,
        },
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not persist RSVP to cadet profile doc:', err);
  }

  // 3. Persist to event subcollection
  try {
    const rsvpDocRef = doc(db, 'events', eventId, 'rsvps', uid);
    await setDoc(
      rsvpDocRef,
      {
        eventId,
        uid,
        status: nextStatus,
        cadetName: cadetInfo?.name || 'Cadet',
        cadetRank: cadetInfo?.rank || 'CDT',
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not persist RSVP to event subcollection:', err);
  }

  return nextStatus;
};

