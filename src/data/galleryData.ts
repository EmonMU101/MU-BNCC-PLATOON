export interface GalleryPhoto {
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
}

export const GALLERY_CATEGORIES = [
  { id: 'all', label: 'All Photos', labelBn: 'সকল ছবি', icon: 'LayoutGrid' },
  { id: 'camp', label: 'Annual Camp (CATC)', labelBn: 'বার্ষিক ক্যাম্প (CATC)', icon: 'Tent' },
  { id: 'drill', label: 'Drill & Ceremonial Parade', labelBn: 'কুচকাওয়াজ ও প্যারেড', icon: 'Award' },
  { id: 'firing', label: 'Weapon & Firing Range', labelBn: 'অস্ত্র ও ফায়ারিং রেঞ্জ', icon: 'Crosshair' },
  { id: 'guard', label: 'Guard of Honor', labelBn: 'গার্ড অব অনার', icon: 'ShieldCheck' },
  { id: 'community', label: 'Community & Voluntary Service', labelBn: 'সমাজসেবা ও স্বেচ্ছাসেবা', icon: 'HeartHandshake' },
  { id: 'obstacle', label: 'Obstacle Course & PT', labelBn: 'বাধা অতিক্রম ও পিটি', icon: 'Flame' },
  { id: 'induction', label: 'Induction & Selection', labelBn: 'ভর্তি ও বাছাই পর্ব', icon: 'UserCheck' },
] as const;

// Stripped mock photos per Phase 2 requirement.
// Photos are uploaded dynamically through the Admin Dashboard and loaded from live Firestore.
export const GALLERY_PHOTOS: GalleryPhoto[] = [];
