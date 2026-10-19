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
  console.warn('Firestore Operation Info:', JSON.stringify(errInfo));
}

export interface PlatoonHighlightItem {
  id: string;
  title: string;
  titleBn?: string;
  description: string;
  descriptionBn?: string;
  badge?: string;
  badgeBn?: string;
  category?: string;
  categoryBn?: string;
  metricValue?: string;
  metricValueBn?: string;
  iconName?: string;
  imageUrl?: string;
  order?: number;
}

export interface FieldRecordItem {
  id: string;
  label: string;
  labelBn?: string;
  value: number;
  suffix?: string;
  note?: string;
  noteBn?: string;
  category?: string;
  iconName?: string;
  imageUrl?: string;
  order?: number;
}

export interface PlatoonMilestoneItem {
  id: string;
  title: string;
  titleBn?: string;
  date: string;
  dateBn?: string;
  category: string;
  categoryBn?: string;
  description: string;
  descriptionBn?: string;
  location?: string;
  locationBn?: string;
  badge?: string;
  badgeBn?: string;
  imageUrl?: string;
  isDeployed: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegimentalHonorItem {
  id: string;
  title: string;
  titleBn?: string;
  recipientOrPlatoon: string;
  recipientOrPlatoonBn?: string;
  awardYear: string;
  awardYearBn?: string;
  conferredBy: string;
  conferredByBn?: string;
  citation: string;
  citationBn?: string;
  medalType: string;
  badge?: string;
  badgeBn?: string;
  imageUrl?: string;
  isDeployed: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_HIGHLIGHTS: PlatoonHighlightItem[] = [
  {
    id: 'highlight-1',
    title: 'National Cadet Corps Day Parade Excellence',
    titleBn: 'জাতীয় ক্যাডেট কোর দিবস কুচকাওয়াজ গৌরব',
    category: 'Parade & Ceremony',
    categoryBn: 'প্যারেড ও কুচকাওয়াজ',
    description: 'Metropolitan University BNCC Platoon secured 1st Runner-Up in the Regional Drill & March-past Competition among 18 universities.',
    descriptionBn: '১৮টি বিশ্ববিদ্যালয়ের মধ্যে আঞ্চলিক ড্রিল ও মার্চ-পাস্ট প্রতিযোগিতায় মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি প্লাটুন ১ম রানার্স-আপ অর্জন করে।',
    badge: 'Regimental Honor',
    badgeBn: 'রেজিমেন্ট সম্মাননা',
    metricValue: '1st Runner-Up',
    metricValueBn: '১ম রানার্স-আপ',
    iconName: 'Trophy',
    order: 1,
  },
  {
    id: 'highlight-2',
    title: 'Flood Rescue & Humanitarian Relief Mobilization',
    titleBn: 'বন্যা উদ্ধার ও মানবিক ত্রাণ তৎপরতা',
    category: 'Voluntary Service',
    categoryBn: 'স্বেচ্ছাসেবা',
    description: 'Cadets deployed to Sylhet and Sunamganj flash-flood zones, distributing 1,200 food packs and emergency drinking water purification units.',
    descriptionBn: 'সিলেট ও সুনামগঞ্জ বন্যাপীড়িত অঞ্চলে ১,২০০ প্যাকেট জরুরি খাদ্য ও পানি বিশুদ্ধকরণ ট্যাবলেট বিতরণ সম্পন্ন।',
    badge: 'Disaster Response',
    badgeBn: 'দুর্যোগ তৎপরতা',
    metricValue: '1,200+ Kits',
    metricValueBn: '১,২০০+ প্যাকেট',
    iconName: 'HeartHandshake',
    order: 2,
  },
  {
    id: 'highlight-3',
    title: 'Annual Central Combined Training Camp (CCTC)',
    titleBn: 'বার্ষিক কেন্দ্রীয় যৌথ প্রশিক্ষণ ক্যাম্প (সিসিটিসি)',
    category: 'Tactical Training',
    categoryBn: 'কৌশলগত প্রশিক্ষণ',
    description: 'Complete platoon delegation participated in advanced obstacle course, survival navigation, and marksmanship firing drills at BNCC Academy Baizid.',
    descriptionBn: 'বিএনসিসি একাডেমি বায়োজিদে বাধা অতিক্রম, সারভাইভাল নেভিগেশন ও নিশানা ফায়ারিংয়ে পূর্ণ প্লাটুন অংশ নেয়।',
    badge: 'Field Training',
    badgeBn: 'ফিল্ড প্রশিক্ষণ',
    metricValue: '100% Qualified',
    metricValueBn: '১০০% যোগ্য',
    iconName: 'Target',
    order: 3,
  },
];

export const DEFAULT_FIELD_RECORDS: FieldRecordItem[] = [
  {
    id: 'rec-1',
    label: 'Cadets Enrolled & Active',
    labelBn: 'সক্রিয় ক্যাডেট সদস্য',
    value: 65,
    suffix: '+',
    category: 'Muster Roll',
    note: 'Rigorous standing roster across undergraduate programs',
    noteBn: 'বিভিন্ন আন্ডারগ্র্যাজুয়েট বিভাগের সক্রিয় ক্যাডেট',
    iconName: 'Users',
    order: 1,
  },
  {
    id: 'rec-2',
    label: 'Drill Sessions Held',
    labelBn: 'সম্পন্ন ড্রিল ও প্যারেড',
    value: 140,
    suffix: '+',
    category: 'Physical Training',
    note: 'Regular physical fitness, weapon training, and marching',
    noteBn: 'নিয়মিত শারীরিক কসরত, অস্ত্র পরিচালনা ও মার্চিং',
    iconName: 'Compass',
    order: 2,
  },
  {
    id: 'rec-3',
    label: 'Community & Relief Drives',
    labelBn: 'ত্রাণ ও মানবিক মিশন',
    value: 28,
    suffix: '+',
    category: 'Civic Engagement',
    note: 'Disaster response, tree plantation, blood donation',
    noteBn: 'দুর্যোগ সহায়তা, রক্তদান ও বৃক্ষরোপণ কর্মসূচি',
    iconName: 'ShieldCheck',
    order: 3,
  },
  {
    id: 'rec-4',
    label: 'Service Honors Earned',
    labelBn: 'অর্জিত সম্মাননা ও মেডেল',
    value: 36,
    suffix: '',
    category: 'Awards & Distinctions',
    note: 'Battalion decorations, commander citations, sports trophies',
    noteBn: 'ব্যাটালিয়ন মেডেল, কমান্ডিং অফিসার সম্মাননা ও ট্রফি',
    iconName: 'Award',
    order: 4,
  },
];

export const DEFAULT_MILESTONES: PlatoonMilestoneItem[] = [
  {
    id: 'ms-1',
    title: 'Sanctioning & Raising of MU BNCC Platoon',
    titleBn: 'মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি প্লাটুনের আনুষ্ঠানিক অনুমোদন ও প্রতিষ্ঠা',
    date: '31 July 2025',
    dateBn: '৩১ জুলাই ২০২৫',
    category: 'Establishment',
    categoryBn: 'প্রতিষ্ঠা',
    description: 'Officially sanctioned under 2 BNCC Battalion, Mainamati Regiment, Sylhet Sector, commencing collegiate military training at Metropolitan University.',
    descriptionBn: 'ময়নামতি রেজিমেন্ট, ২ বিএনসিসি ব্যাটালিয়নের অধীনে সিলেট সেক্টরে মেট্রোপলিটন ইউনিভার্সিটিতে ক্যাডেট প্লাটুন আনুষ্ঠানিকভাবে অনুমোদিত ও প্রতিষ্ঠিত হয়।',
    location: 'Metropolitan University, Bateshwar, Sylhet',
    locationBn: 'মেট্রোপলিটন ইউনিভার্সিটি, বটেশ্বর, সিলেট',
    badge: 'Historic Landmark',
    badgeBn: 'ঐতিহাসিক মাইলফলক',
    isDeployed: true,
    order: 1,
  },
  {
    id: 'ms-2',
    title: 'Inaugural Cadet Induction & Working Dress Badging',
    titleBn: 'প্রথম ক্যাডেট ব্যাচ ইনডাকশন ও ওয়ার্কিং ড্রেস ব্যাজিং',
    date: '12 September 2025',
    dateBn: '১২ সেপ্টেম্বর ২০২৫',
    category: 'Induction',
    categoryBn: 'ইনডাকশন',
    description: 'First batch of 65 male and female cadet recruits completed physical muster, obstacle trials, and received official Olive Green working uniform credentials.',
    descriptionBn: '৬৫ জন ছাত্র ও ছাত্রী ক্যাডেট নিয়োগ পরীক্ষা, প্রাথমিক শারীরিক ড্রিল সফলভাবে সম্পন্ন করে ইউনিফর্ম পরিধানের গৌরব অর্জন করে।',
    location: 'MU Central Sports Ground',
    locationBn: 'এমইউ কেন্দ্রীয় খেলার মাঠ',
    badge: 'Muster Roll',
    badgeBn: 'মাস্টার রোল',
    isDeployed: true,
    order: 2,
  },
  {
    id: 'ms-3',
    title: 'Combined Annual Training Camp (CATC) Qualification',
    titleBn: 'যৌথ বার্ষিক প্রশিক্ষণ ক্যাম্প (সিএটিসি) সফল সমাপ্তি',
    date: '18-28 October 2025',
    dateBn: '১৮-২৮ অক্টোবর ২০২৫',
    category: 'Tactical Camp',
    categoryBn: 'কৌশলগত ক্যাম্প',
    description: 'Platoon contingent completed 10-day rigorous tactical training, section attack drills, .22 rifle range firing, and field survival at BNCC regional grounds.',
    descriptionBn: '১০ দিনের পূর্ণাঙ্গ ট্যাকটিক্যাল ড্রিল, সেকশন আক্রমণ মহড়া ও রাইফেল ফায়ারিং সফলভাবে সম্পন্ন করে ১০০% ক্যাডেট যোগ্যতা সনদ অর্জন করে।',
    location: 'Mainamati Regiment Camp Grounds',
    locationBn: 'ময়নামতি রেজিমেন্ট ক্যাম্প প্রাঙ্গণ',
    badge: 'Combat Readiness',
    badgeBn: 'যুদ্ধপ্রস্তুতি',
    isDeployed: true,
    order: 3,
  },
  {
    id: 'ms-4',
    title: 'Rapid Mobilization - Sylhet Flash Flood Relief',
    titleBn: 'সিলেট আকস্মিক বন্যা উদ্ধার ও মানবিক ত্রাণ তৎপরতা',
    date: '14 November 2025',
    dateBn: '১৪ নভেম্বর ২০২৫',
    category: 'Humanitarian',
    categoryBn: 'মানবিক সহায়তা',
    description: 'Emergency deployment across Gowainghat and Companyganj, delivering over 1,200 emergency rations, saline kits, and assisting senior citizens during flood surges.',
    descriptionBn: 'গোয়াইনঘাট ও কোম্পানীগঞ্জ প্লাবিত চরাঞ্চলে ১,২০০ পরিবারের কাছে জরুরি শুকনো খাবার ও জীবনরক্ষাকারী ওষুধ দ্রুততম সময়ে পৌঁছে দেওয়া হয়।',
    location: 'Gowainghat & Surma Basin, Sylhet',
    locationBn: 'গোয়াইনঘাট ও সুরমা অববাহিকা, সিলেট',
    badge: 'Civic Duty',
    badgeBn: 'নাগরিক দায়িত্ব',
    isDeployed: true,
    order: 4,
  },
  {
    id: 'ms-5',
    title: 'Victory Day Ceremonial Guard of Honor',
    titleBn: 'বিজয় দিবস রাষ্ট্রীয় কুচকাওয়াজে গার্ড অব অনার প্রদান',
    date: '16 December 2025',
    dateBn: '১৬ ডিসেম্বর ২০২৫',
    category: 'Ceremonial',
    categoryBn: 'রাষ্ট্রীয় কুচকাওয়াজ',
    description: 'Presented ceremonial Guard of Honor at University Shaheed Minar and led university contingents in the Sylhet divisional march-past.',
    descriptionBn: 'বিশ্ববিদ্যালয় শহীদ বেদীতে গার্ড অব অনার সালাম প্রদর্শন এবং সিলেট বিভাগীয় বিজয় র্যালিতে বর্ণাঢ্য মার্চ-পাস্টে পুরো প্লাটুন নেতৃত্ব প্রদান করে।',
    location: 'University Monument & Sylhet Stadium',
    locationBn: 'বিশ্ববিদ্যালয় শহীদ মিনার ও জেলা স্টেডিয়াম',
    badge: 'Regimental Pride',
    badgeBn: 'রেজিমেন্ট গৌরব',
    isDeployed: true,
    order: 5,
  },
];

export const DEFAULT_HONORS: RegimentalHonorItem[] = [
  {
    id: 'hn-1',
    title: '1st Runner-Up · Regional Drill & March-Past Championship',
    titleBn: '১ম রানার্স-আপ · আঞ্চলিক ড্রিল ও মার্চ-পাস্ট প্রতিযোগিতা',
    recipientOrPlatoon: 'Metropolitan University Platoon Squad (Led by PUO Abu Yusuf Musa)',
    recipientOrPlatoonBn: 'মেট্রোপলিটন ইউনিভার্সিটি প্লাটুন স্কোয়াড (নেতৃত্বে: পিইউও আবু ইউসুফ মুসা)',
    awardYear: '2025',
    awardYearBn: '২০২৫',
    conferredBy: 'Commanding Officer, 2 BNCC Battalion, Mainamati Regiment',
    conferredByBn: 'অধিনায়ক, ২ বিএনসিসি ব্যাটালিয়ন, ময়নামতি রেজিমেন্ট',
    citation: 'Conferred for outstanding precision march-past, weapon drill, and squad unison among 18 competing collegiate platoons.',
    citationBn: '১৮টি কলেজ ও বিশ্ববিদ্যালয়ের প্লাটুনের মধ্যে নিখুঁত প্যারেড শৃঙ্খলা ও ঐক্যবদ্ধ মার্চ-পাস্টের জন্য প্রদত্ত।',
    medalType: 'Championship Trophy',
    badge: 'Regimental Honor',
    badgeBn: 'রেজিমেন্ট সম্মাননা',
    isDeployed: true,
    order: 1,
  },
  {
    id: 'hn-2',
    title: 'Commanding Officer Commendation for Humanitarian Service',
    titleBn: 'মানবিক দেশসেবায় অধিনায়ক বিশেষ কমান্ড্যান্ট সম্মাননা',
    recipientOrPlatoon: 'MU BNCC Disaster Relief Contingent (Sylhet Flank)',
    recipientOrPlatoonBn: 'এমইউ বিএনসিসি দুর্যোগ সহায়তা দল (সিলেট ফ্ল্যাঙ্ক)',
    awardYear: '2025',
    awardYearBn: '২০২৫',
    conferredBy: 'Commander, Mainamati Regiment HQ, Cumilla Cantonment',
    conferredByBn: 'কমান্ডার, ময়নামতি রেজিমেন্ট সদর দপ্তর, কুমিল্লা সেনানিবাস',
    citation: 'Recognized for selfless volunteerism, logistics coordination, and risking flood currents to protect stranded river basin families.',
    citationBn: 'বন্যাদুর্গত পানিবন্দী মানুষের সহায়তায় সাহসিকতা এবং সুসংগঠিত ত্রাণ বিতরণের স্বীকৃতিস্বরূপ বিশেষ প্রশংসা পদক।',
    medalType: 'Silver Service Medal',
    badge: 'Command Commendation',
    badgeBn: 'বিশেষ প্রশংসা পদক',
    isDeployed: true,
    order: 2,
  },
  {
    id: 'hn-3',
    title: 'Marksmanship & Weapon Handling Distinction',
    titleBn: 'নিশানা ফায়ারিং ও অস্ত্র পরিচালনা বিশেষ মেধা সনদ',
    recipientOrPlatoon: 'Cadet Corporal Jewel & Range Squad Delegation',
    recipientOrPlatoonBn: 'ক্যাডেট করপোরাল জুয়েল ও রেঞ্জ স্কোয়াড ডেলিগেশন',
    awardYear: '2025',
    awardYearBn: '২০২৫',
    conferredBy: 'Chief Range Instructor, BNCC Firing Academy Baizid',
    conferredByBn: 'প্রধান ফায়ারিং প্রশিক্ষক, বিএনসিসি রেঞ্জ একাডেমি',
    citation: 'Awarded for scoring 94% bullseye grouping on .22 standard range classification trials during the Central Camp.',
    citationBn: 'কেন্দ্রীয় প্রশিক্ষণ ক্যাম্পে .২২ রাইফেল ফায়ারিং টেস্টে ৯৪% নিশানা স্কোর অর্জনের স্বীকৃতিস্বরূপ।',
    medalType: 'Marksmanship Ribbon',
    badge: 'Marksman',
    badgeBn: 'মার্কসম্যান',
    isDeployed: true,
    order: 3,
  },
  {
    id: 'hn-4',
    title: 'Vice Chancellor Special Citation for Campus Protocol Excellence',
    titleBn: 'ক্যাম্পাস প্রটোকল ও শৃঙ্খলা রক্ষায় উপাচার্য বিশেষ সম্মাননা',
    recipientOrPlatoon: 'Metropolitan University BNCC Standing Platoon',
    recipientOrPlatoonBn: 'মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি পূর্ণাঙ্গ প্লাটুন',
    awardYear: '2025',
    awardYearBn: '২০২৫',
    conferredBy: 'Vice Chancellor & Pro-VC, Metropolitan University Sylhet',
    conferredByBn: 'উপাচার্য ও উপ-উপাচার্য, মেট্রোপলিটন ইউনিভার্সিটি সিলেট',
    citation: 'Honoring impeccable campus discipline, organizing blood donation drives, and VIP ceremonial security during convocation and academic summits.',
    citationBn: 'বিশ্ববিদ্যালয় কনভোকেশন ও জাতীয় দিবসে সর্বোচ্চ শৃঙ্খলা, রক্তদান কর্মসূচি ও প্রটোকল পরিচালনার জন্য বিশেষ স্বীকৃতি।',
    medalType: 'Institutional Plaque',
    badge: 'Campus Honor',
    badgeBn: 'বিশ্ববিদ্যালয় স্মারক',
    isDeployed: true,
    order: 4,
  },
];

const HIGHLIGHTS_COL = 'highlights';
const FIELD_RECORDS_COL = 'field_records';
const MILESTONES_COL = 'milestones';
const REGIMENTAL_HONORS_COL = 'regimental_honors';

// ============================================================================
// 1. PLATOON HIGHLIGHTS (DEBUGGED & ROBUST UPSERT)
// ============================================================================

export const seedInitialHighlights = async (): Promise<void> => {
  try {
    for (const h of DEFAULT_HIGHLIGHTS) {
      await setDoc(doc(db, HIGHLIGHTS_COL, h.id), h, { merge: true });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, HIGHLIGHTS_COL);
  }
};

export const subscribeHighlights = (callback: (items: PlatoonHighlightItem[]) => void) => {
  try {
    const colRef = collection(db, HIGHLIGHTS_COL);
    return onSnapshot(
      colRef,
      (snap) => {
        if (snap.empty) {
          callback(DEFAULT_HIGHLIGHTS);
        } else {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<PlatoonHighlightItem, 'id'>),
          }));
          list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
          callback(list);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, HIGHLIGHTS_COL);
        callback(DEFAULT_HIGHLIGHTS);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, HIGHLIGHTS_COL);
    callback(DEFAULT_HIGHLIGHTS);
    return () => {};
  }
};

export const getHighlights = async (): Promise<PlatoonHighlightItem[]> => {
  try {
    const snap = await getDocs(collection(db, HIGHLIGHTS_COL));
    if (snap.empty) {
      return DEFAULT_HIGHLIGHTS;
    }
    const list = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<PlatoonHighlightItem, 'id'>),
    }));
    list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, HIGHLIGHTS_COL);
    return DEFAULT_HIGHLIGHTS;
  }
};

export const createHighlight = async (item: Omit<PlatoonHighlightItem, 'id'>): Promise<string> => {
  try {
    const colRef = collection(db, HIGHLIGHTS_COL);
    const docRef = await addDoc(colRef, item);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, HIGHLIGHTS_COL);
    throw err;
  }
};

/**
 * Robust Upsert: Uses setDoc with merge:true instead of updateDoc
 * Prevents "No document to update" errors if the document wasn't yet seeded in Firestore.
 */
export const updateHighlight = async (id: string, updates: Partial<PlatoonHighlightItem>): Promise<void> => {
  try {
    const docRef = doc(db, HIGHLIGHTS_COL, id);
    await setDoc(docRef, updates, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${HIGHLIGHTS_COL}/${id}`);
    throw err;
  }
};

export const deleteHighlight = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, HIGHLIGHTS_COL, id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${HIGHLIGHTS_COL}/${id}`);
    throw err;
  }
};

// ============================================================================
// 2. FIELD RECORDS & OPERATIONAL STAT COUNTERS (DEBUGGED & ROBUST UPSERT)
// ============================================================================

export const seedInitialFieldRecords = async (): Promise<void> => {
  try {
    for (const r of DEFAULT_FIELD_RECORDS) {
      await setDoc(doc(db, FIELD_RECORDS_COL, r.id), r, { merge: true });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, FIELD_RECORDS_COL);
  }
};

export const subscribeFieldRecords = (callback: (items: FieldRecordItem[]) => void) => {
  try {
    const colRef = collection(db, FIELD_RECORDS_COL);
    return onSnapshot(
      colRef,
      (snap) => {
        if (snap.empty) {
          callback(DEFAULT_FIELD_RECORDS);
        } else {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<FieldRecordItem, 'id'>),
          }));
          list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
          callback(list);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, FIELD_RECORDS_COL);
        callback(DEFAULT_FIELD_RECORDS);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, FIELD_RECORDS_COL);
    callback(DEFAULT_FIELD_RECORDS);
    return () => {};
  }
};

export const getFieldRecords = async (): Promise<FieldRecordItem[]> => {
  try {
    const snap = await getDocs(collection(db, FIELD_RECORDS_COL));
    if (snap.empty) {
      return DEFAULT_FIELD_RECORDS;
    }
    const list = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<FieldRecordItem, 'id'>),
    }));
    list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, FIELD_RECORDS_COL);
    return DEFAULT_FIELD_RECORDS;
  }
};

export const createFieldRecord = async (item: Omit<FieldRecordItem, 'id'>): Promise<string> => {
  try {
    const colRef = collection(db, FIELD_RECORDS_COL);
    const docRef = await addDoc(colRef, item);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, FIELD_RECORDS_COL);
    throw err;
  }
};

/**
 * Robust Upsert: Uses setDoc with merge:true instead of updateDoc
 */
export const updateFieldRecord = async (id: string, updates: Partial<FieldRecordItem>): Promise<void> => {
  try {
    const docRef = doc(db, FIELD_RECORDS_COL, id);
    await setDoc(docRef, updates, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${FIELD_RECORDS_COL}/${id}`);
    throw err;
  }
};

export const deleteFieldRecord = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, FIELD_RECORDS_COL, id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${FIELD_RECORDS_COL}/${id}`);
    throw err;
  }
};

// ============================================================================
// 3. KEY PLATOON MILESTONES (CRUD & DEPLOY TO FRONTEND)
// ============================================================================

export const seedInitialMilestones = async (): Promise<void> => {
  try {
    for (const m of DEFAULT_MILESTONES) {
      await setDoc(doc(db, MILESTONES_COL, m.id), m, { merge: true });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, MILESTONES_COL);
  }
};

export const subscribeMilestones = (
  callback: (items: PlatoonMilestoneItem[]) => void,
  onlyDeployed: boolean = false
) => {
  try {
    const colRef = collection(db, MILESTONES_COL);
    return onSnapshot(
      colRef,
      (snap) => {
        if (snap.empty) {
          const filtered = onlyDeployed
            ? DEFAULT_MILESTONES.filter((m) => m.isDeployed)
            : DEFAULT_MILESTONES;
          callback(filtered);
        } else {
          let list = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<PlatoonMilestoneItem, 'id'>),
          }));
          if (onlyDeployed) {
            list = list.filter((m) => m.isDeployed);
          }
          list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
          callback(list);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, MILESTONES_COL);
        const filtered = onlyDeployed
          ? DEFAULT_MILESTONES.filter((m) => m.isDeployed)
          : DEFAULT_MILESTONES;
        callback(filtered);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, MILESTONES_COL);
    callback(DEFAULT_MILESTONES);
    return () => {};
  }
};

export const getMilestones = async (onlyDeployed: boolean = false): Promise<PlatoonMilestoneItem[]> => {
  try {
    const snap = await getDocs(collection(db, MILESTONES_COL));
    if (snap.empty) {
      return onlyDeployed ? DEFAULT_MILESTONES.filter((m) => m.isDeployed) : DEFAULT_MILESTONES;
    }
    let list = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<PlatoonMilestoneItem, 'id'>),
    }));
    if (onlyDeployed) {
      list = list.filter((m) => m.isDeployed);
    }
    list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, MILESTONES_COL);
    return DEFAULT_MILESTONES;
  }
};

export const createMilestone = async (
  item: Omit<PlatoonMilestoneItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const colRef = collection(db, MILESTONES_COL);
    const now = new Date().toISOString();
    const docRef = await addDoc(colRef, {
      ...item,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, MILESTONES_COL);
    throw err;
  }
};

export const updateMilestone = async (
  id: string,
  updates: Partial<PlatoonMilestoneItem>
): Promise<void> => {
  try {
    const docRef = doc(db, MILESTONES_COL, id);
    await setDoc(
      docRef,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${MILESTONES_COL}/${id}`);
    throw err;
  }
};

export const deleteMilestone = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, MILESTONES_COL, id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${MILESTONES_COL}/${id}`);
    throw err;
  }
};

export const toggleDeployMilestone = async (id: string, currentlyDeployed: boolean): Promise<void> => {
  await updateMilestone(id, { isDeployed: !currentlyDeployed });
};

export const deployAllMilestones = async (milestones: PlatoonMilestoneItem[]): Promise<void> => {
  for (const m of milestones) {
    if (!m.isDeployed) {
      await updateMilestone(m.id, { isDeployed: true });
    }
  }
};

// ============================================================================
// 4. REGIMENTAL HONORS (CRUD & DEPLOY TO FRONTEND)
// ============================================================================

export const seedInitialHonors = async (): Promise<void> => {
  try {
    for (const h of DEFAULT_HONORS) {
      await setDoc(doc(db, REGIMENTAL_HONORS_COL, h.id), h, { merge: true });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, REGIMENTAL_HONORS_COL);
  }
};

export const subscribeRegimentalHonors = (
  callback: (items: RegimentalHonorItem[]) => void,
  onlyDeployed: boolean = false
) => {
  try {
    const colRef = collection(db, REGIMENTAL_HONORS_COL);
    return onSnapshot(
      colRef,
      (snap) => {
        if (snap.empty) {
          const filtered = onlyDeployed
            ? DEFAULT_HONORS.filter((h) => h.isDeployed)
            : DEFAULT_HONORS;
          callback(filtered);
        } else {
          let list = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<RegimentalHonorItem, 'id'>),
          }));
          if (onlyDeployed) {
            list = list.filter((h) => h.isDeployed);
          }
          list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
          callback(list);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, REGIMENTAL_HONORS_COL);
        const filtered = onlyDeployed
          ? DEFAULT_HONORS.filter((h) => h.isDeployed)
          : DEFAULT_HONORS;
        callback(filtered);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, REGIMENTAL_HONORS_COL);
    callback(DEFAULT_HONORS);
    return () => {};
  }
};

export const getRegimentalHonors = async (onlyDeployed: boolean = false): Promise<RegimentalHonorItem[]> => {
  try {
    const snap = await getDocs(collection(db, REGIMENTAL_HONORS_COL));
    if (snap.empty) {
      return onlyDeployed ? DEFAULT_HONORS.filter((h) => h.isDeployed) : DEFAULT_HONORS;
    }
    let list = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<RegimentalHonorItem, 'id'>),
    }));
    if (onlyDeployed) {
      list = list.filter((h) => h.isDeployed);
    }
    list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, REGIMENTAL_HONORS_COL);
    return DEFAULT_HONORS;
  }
};

export const createRegimentalHonor = async (
  item: Omit<RegimentalHonorItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const colRef = collection(db, REGIMENTAL_HONORS_COL);
    const now = new Date().toISOString();
    const docRef = await addDoc(colRef, {
      ...item,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, REGIMENTAL_HONORS_COL);
    throw err;
  }
};

export const updateRegimentalHonor = async (
  id: string,
  updates: Partial<RegimentalHonorItem>
): Promise<void> => {
  try {
    const docRef = doc(db, REGIMENTAL_HONORS_COL, id);
    await setDoc(
      docRef,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${REGIMENTAL_HONORS_COL}/${id}`);
    throw err;
  }
};

export const deleteRegimentalHonor = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, REGIMENTAL_HONORS_COL, id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${REGIMENTAL_HONORS_COL}/${id}`);
    throw err;
  }
};

export const toggleDeployRegimentalHonor = async (id: string, currentlyDeployed: boolean): Promise<void> => {
  await updateRegimentalHonor(id, { isDeployed: !currentlyDeployed });
};

export const deployAllRegimentalHonors = async (honors: RegimentalHonorItem[]): Promise<void> => {
  for (const h of honors) {
    if (!h.isDeployed) {
      await updateRegimentalHonor(h.id, { isDeployed: true });
    }
  }
};

export const platoonCmsService = {
  // Highlights
  subscribeHighlights,
  getHighlights,
  createHighlight,
  addHighlight: createHighlight,
  updateHighlight,
  deleteHighlight,
  seedInitialHighlights,
  resetHighlightsToDefault: seedInitialHighlights,

  // Field Records
  subscribeFieldRecords,
  getFieldRecords,
  createFieldRecord,
  addFieldRecord: createFieldRecord,
  updateFieldRecord,
  deleteFieldRecord,
  seedInitialFieldRecords,
  resetFieldRecordsToDefault: seedInitialFieldRecords,

  // Milestones
  subscribeMilestones,
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  toggleDeployMilestone,
  deployAllMilestones,
  seedInitialMilestones,

  // Regimental Honors
  subscribeRegimentalHonors,
  getRegimentalHonors,
  createRegimentalHonor,
  updateRegimentalHonor,
  deleteRegimentalHonor,
  toggleDeployRegimentalHonor,
  deployAllRegimentalHonors,
  seedInitialHonors,
};
