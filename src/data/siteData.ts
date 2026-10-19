export interface QuickAccessItem {
  id: string;
  title: string;
  titleBn?: string;
  subtitle: string;
  subtitleBn?: string;
  description: string;
  descriptionBn?: string;
  href: string;
  category: string;
  categoryBn?: string;
  iconName: string;
  badgeText: string;
  badgeTextBn?: string;
}

export interface BenefitItem {
  id: string;
  title: string;
  titleBn?: string;
  shortDesc: string;
  shortDescBn?: string;
  longDesc: string;
  longDescBn?: string;
  category: 'Career & Defense' | 'Skill & Leadership' | 'National Exposure' | 'Academic & Community';
  categoryBn?: string;
  icon: string;
  bulletPoints: string[];
  bulletPointsBn?: string[];
}

export interface GuidelineItem {
  id: string;
  title: string;
  titleBn?: string;
  category: 'Training Syllabus' | 'Rank Structure' | 'Uniform Code' | 'Parade Protocol';
  categoryBn?: string;
  summary: string;
  summaryBn?: string;
  details: string[];
  detailsBn?: string[];
  scheduleOrRequirement?: string;
  scheduleOrRequirementBn?: string;
}

export interface PolicyItem {
  id: string;
  section: string;
  sectionBn?: string;
  title: string;
  titleBn?: string;
  content: string;
  contentBn?: string;
  subrules: string[];
  subrulesBn?: string[];
  enforcement: string;
  enforcementBn?: string;
}

export interface EventItem {
  id: string;
  title: string;
  titleBn?: string;
  category: 'Training' | 'Campus Duty' | 'Camp / Parade' | 'Community Service';
  categoryBn?: string;
  date: string; // ISO date string
  displayDate: string;
  displayDateBn?: string;
  time: string;
  timeBn?: string;
  venue: string;
  venueBn?: string;
  description: string;
  descriptionBn?: string;
  instructorOrLead: string;
  instructorOrLeadBn?: string;
  mandatoryTurnout: string;
  mandatoryTurnoutBn?: string;
  spotsOrAttendance: string;
  spotsOrAttendanceBn?: string;
  isUpcoming: boolean;
}

export interface RankItem {
  title: string;
  abbr: string;
  insignia: string;
  responsibility: string;
  eligibility: string;
}

export const PLATOON_STATS = [
  { label: 'Cadets Enrolled & Active', value: 75, suffix: '+', note: 'Male & Female Cadets' },
  { label: 'Drill Sessions Held', value: 120, suffix: '+', note: 'Bi-weekly University Parades' },
  { label: 'Community & Relief Drives', value: 18, suffix: '', note: 'Flood Relief, Blood Camps & Security' },
  { label: 'Regimental Camps Attended', value: 12, suffix: '', note: 'Mainamati Regiment Camps' },
];

export const QUICK_ACCESS_HUB: QuickAccessItem[] = [
  {
    id: 'how-to-join',
    title: 'How to Join',
    titleBn: 'যোগদানের নিয়মাবলী',
    subtitle: 'Recruitment & Induction Sequence',
    subtitleBn: 'নিয়োগ ও অন্তর্ভুক্তি প্রক্রিয়া',
    description: 'Check physical & academic eligibility, review intake requirements, and submit your online candidate dossier for the next recruitment intake.',
    descriptionBn: 'শারীরিক ও শিক্ষাগত যোগ্যতা যাচাই করুন, প্রয়োজনীয় কাগজপত্র পর্যালোচনা করুন এবং পরবর্তী ইনটেকের জন্য অনলাইন আবেদন জমা দিন।',
    href: '/how-to-join',
    category: 'Recruitment',
    categoryBn: 'নিয়োগ ও অন্তর্ভুক্তি',
    iconName: 'UserCheck',
    badgeText: 'Intake 2025-26 Open',
    badgeTextBn: 'ইনটেক ২০২৫-২৬ চলমান',
  },
  {
    id: 'benefits',
    title: 'Benefits of BNCC',
    titleBn: 'বিএনসিসির সুবিধাসমূহ',
    subtitle: 'Leadership & Armed Forces Advantage',
    subtitleBn: 'নেতৃত্ব ও সামরিক বাহিনীতে অগ্রাধিকার',
    description: 'Discover how BNCC service accelerates defense service commissions (ISSB), builds crisis leadership, provides youth exchange tours, and awards academic prestige.',
    descriptionBn: 'জানুন কীভাবে বিএনসিসি প্রশিক্ষণ সামরিক বাহিনীতে অফিসার পদ (আইএসএসবি), দুর্যোগকালীন নেতৃত্ব, যুব বিনিময় সফর এবং সম্মাননা অর্জনে সহায়তা করে।',
    href: '/frameworks/benefits',
    category: 'Advancement',
    categoryBn: 'উন্নয়ন ও সুবিধা',
    iconName: 'Award',
    badgeText: 'Defense & Career Advantage',
    badgeTextBn: 'প্রতিরক্ষা ও ক্যারিয়ার সুবিধা',
  },
  {
    id: 'policies',
    title: 'Policies & Regulations',
    titleBn: 'নীতিমালা ও আচরণবিধি',
    subtitle: 'Code of Honor & Conduct',
    subtitleBn: 'সম্মান ও শৃঙ্খলা বিধিমালা',
    description: 'The standard operating procedures covering 80% drill attendance, discipline expectations, uniform dignity, anti-ragging mandates, and chain of command.',
    descriptionBn: '৮০% ড্রিল উপস্থিতি, শৃঙ্খলা প্রত্যাশা, ইউনিফর্মের মর্যাদা, র‍্যাগিং বিরোধী অনুশাসন ও চেইন অব কমান্ড সম্পর্কিত এসওপি।',
    href: '/frameworks/policies',
    category: 'Governance',
    categoryBn: 'শৃঙ্খলা ও অনুশাসন',
    iconName: 'ShieldAlert',
    badgeText: 'Official Directive',
    badgeTextBn: 'অফিসিয়াল নির্দেশনা',
  },
  {
    id: 'guidelines',
    title: 'Guideline of BNCC',
    titleBn: 'ক্যাডেট নির্দেশিকা ও সিলেবাস',
    subtitle: 'Training Syllabus & Rank Ladder',
    subtitleBn: 'প্রশিক্ষণ সিলেবাস ও পদমর্যাদা বিন্যাস',
    description: 'Explore the complete cadet syllabus: military drill, obstacle course, weapon safety basics, field craft, first aid, and progressive promotion milestones.',
    descriptionBn: 'সম্পূর্ণ ক্যাডেট সিলেবাস দেখুন: ফুট ড্রিল, অবস্ট্যাকল কোর্স, অস্ত্র পরিচালনার প্রাথমিক জ্ঞান, ফিল্ড ক্রাফট ও পদোন্নতির ধাপসমূহ।',
    href: '/frameworks/guidelines',
    category: 'Curriculum',
    categoryBn: 'প্রশিক্ষণ সিলেবাস',
    iconName: 'BookOpen',
    badgeText: 'Standard Syllabus',
    badgeTextBn: 'স্ট্যান্ডার্ড সিলেবাস',
  },
  {
    id: 'events',
    title: 'Upcoming Events',
    titleBn: 'আসন্ন ইভেন্ট ও প্যারেড',
    subtitle: 'Parades, Camps & Campus Duties',
    subtitleBn: 'প্যারেড, ক্যাম্প ও বিশ্ববিদ্যালয় ডিউটি',
    description: 'Stay updated with scheduled university flag parades, regimental training camps, national day observances, blood donation campaigns, and bootcamps.',
    descriptionBn: 'বিশ্ববিদ্যালয়ের নিয়মিত জাতীয় পতাকা উত্তোলন, রেজিমেন্টাল ক্যাম্প, রক্তদান কর্মসূচি ও বিশেষ প্রশিক্ষণ শিবিরের সর্বশেষ সময়সূচি।',
    href: '/events',
    category: 'Schedule',
    categoryBn: 'সময়সূচি ও ক্যালেন্ডার',
    iconName: 'Calendar',
    badgeText: 'Active Calendar',
    badgeTextBn: 'সক্রিয় ক্যালেন্ডার',
  },
];

export const BENEFITS_DATA: BenefitItem[] = [
  {
    id: 'armed-forces',
    title: 'Armed Forces Commission Advantage',
    titleBn: 'সশস্ত্র বাহিনীতে কমিশন প্রাপ্তির বিশেষ সুযোগ',
    shortDesc: 'Preferential assessment and specialized coaching for the Inter-Services Selection Board (ISSB) for Bangladesh Army, Navy, and Air Force.',
    shortDescBn: 'বাংলাদেশ সেনাবাহিনী, নৌবাহিনী ও বিমানবাহিনীর আইএসএসবি (ISSB) পরীক্ষায় অগ্রাধিকার ও বিশেষ প্রশিক্ষণ সুবিধা।',
    longDesc: 'BNCC Cadets hold an officially recognized defense quota and high priority in Bangladesh Army, Navy, and Air Force officer selection processes. Experienced cadets undergo simulated ISSB tasks, psychological tests, and ground obstacle drills.',
    longDescBn: 'বিএনসিসি ক্যাডেটরা প্রতিরক্ষা মন্ত্রণালয়ের সার্কুলার অনুযায়ী বাংলাদেশ সেনা, নৌ ও বিমানবাহিনীতে অফিসার নিয়োগে সরকারি অগ্রাধিকার ও কোটা সুবিধা পান। ক্যাডেটরা আইএসএসবি-এর পিজিটি, এইচজিটি, কমান্ড টাস্ক ও মনস্তাত্ত্বিক পরীক্ষার বাস্তব প্রশিক্ষণ পান।',
    category: 'Career & Defense',
    categoryBn: 'ক্যারিয়ার ও প্রতিরক্ষা',
    icon: 'ShieldCheck',
    bulletPoints: [
      'Direct orientation with retired & serving armed forces instructors',
      'Exclusive ISSB grooming covering PGT, HGT, Command Task, and Viva',
      'Quota advantages under Ministry of Defence recruitment circulars',
      'Physical endurance conditioning meeting officer entry benchmarks',
    ],
    bulletPointsBn: [
      'সশস্ত্র বাহিনীর অভিজ্ঞ ও অবসরপ্রাপ্ত প্রশিক্ষকদের সরাসরি দিকনির্দেশনা',
      'আইএসএসবি-র পিজিটি, এইচজিটি, কমান্ড টাস্ক ও ভাইভার বিশেষ প্রস্তুতি',
      'প্রতিরক্ষা মন্ত্রণালয়ের নীতিমালা অনুযায়ী নিয়োগে অগ্রাধিকার ও কোটা',
      'সামরিক অফিসার নিয়োগের মানদণ্ড অনুযায়ী শারীরিক সক্ষমতা অর্জন',
    ],
  },
  {
    id: 'leadership',
    title: 'Executive Leadership & Command Ability',
    titleBn: 'কার্যকর নেতৃত্ব ও কমান্ড পরিচালনার দক্ষতা',
    shortDesc: 'Practical command of squads and platoons under high-pressure scenarios, instilling confidence and organizational mastery.',
    shortDescBn: 'কঠিন পরিস্থিতিতে স্কোয়াড ও প্লাটুন পরিচালনার বাস্তব অভিজ্ঞতা, যা আত্মবিশ্বাস ও দলীয় নেতৃত্ব তৈরি করে।',
    longDesc: 'Cadets rotate through command positions such as Squad Commander, Sergeant, and Cadet Under Officer (CUO). They learn time management, team delegation, crisis response, and decisive problem-solving.',
    longDescBn: 'ক্যাডেটরা স্কোয়াড কমান্ডার, সার্জেন্ট ও ক্যাডেট আন্ডার অফিসার (CUO) এর মতো কমান্ড পদে দায়িত্ব পালনের মাধ্যমে সময়ানুবর্তিতা, দায়িত্ব অর্পণ, সংকট নিরসন এবং দ্রুত সিদ্ধান্ত গ্রহণের দক্ষতা অর্জন করেন।',
    category: 'Skill & Leadership',
    categoryBn: 'দক্ষতা ও নেতৃত্ব',
    icon: 'Compass',
    bulletPoints: [
      'Real-world command of 30+ peer cadets during ceremonial parades',
      'Crisis decision-making and operational planning techniques',
      'Public speaking and instruction delivery during briefing sessions',
      'Conflict resolution and peer mentoring framework',
    ],
    bulletPointsBn: [
      'আনুষ্ঠানিক কুচকাওয়াজে ৩০+ ক্যাডেটের সরাসরি কমান্ড পরিচালনা',
      'সংকটময় মুহূর্তে সিদ্ধান্ত গ্রহণ ও কৌশলগত পরিকল্পনার কৌশল',
      'ব্রিফিং সেশনে সাবলীল বক্তব্য ও দিকনির্দেশনা প্রদানের দক্ষতা',
      'দ্বন্দ্ব নিরসন ও সহপাঠীদের মেন্টরিং করার মানসিকতা গঠন',
    ],
  },
  {
    id: 'national-camps',
    title: 'National & International Youth Camps',
    titleBn: 'জাতীয় ও আন্তর্জাতিক ইয়ুথ ক্যাম্পিংয়ের সুযোগ',
    shortDesc: 'Fully funded participation in Central Annual Training Camps (CATC), Winter Camps, and International Youth Exchange Programs (YEP).',
    shortDescBn: 'রেজিমেন্টাল কেন্দ্রীয় প্রশিক্ষণ ক্যাম্প (CATC) এবং আন্তর্জাতিক যুব বিনিময় প্রোগ্রামে (YEP) সম্পূর্ণ সরকারি খরচে অংশগ্রহণের সুযোগ।',
    longDesc: 'Outstanding cadets earn invitations to national military training facilities in Mainamati, Savar, and Bhatiary. Top-performing cadets represent Bangladesh in foreign youth exchange tours to partner nations like India, Sri Lanka, and Nepal.',
    longDescBn: 'সেরা ক্যাডেটরা ময়নামতি, সাভার ও ভাটিয়ারির জাতীয় সামরিক প্রশিক্ষণ একাডেমিতে বিশেষ প্রশিক্ষণ পান। শীর্ষ পারফরমাররা ভারত, শ্রীলঙ্কা ও নেপালের মতো বন্ধুরাষ্ট্রে যুব প্রতিনিধি হিসেবে বাংলাদেশের প্রতিনিধিত্ব করার সুযোগ পান।',
    category: 'National Exposure',
    categoryBn: 'জাতীয় ও আন্তর্জাতিক অভিজ্ঞতা',
    icon: 'Globe',
    bulletPoints: [
      'Central Annual Training Camp (CATC) at Regimental Headquarters',
      'Bilateral Youth Exchange Programme (YEP) opportunities abroad',
      'Joint exercises with tri-services personnel and allied cadets',
      'Official certificates issued under Ministry of Defence Bangladesh',
    ],
    bulletPointsBn: [
      'রেজিমেন্টাল সদর দপ্তরে কেন্দ্রীয় বার্ষিক প্রশিক্ষণ ক্যাম্প (CATC)',
      'বিদেশে দ্বিপাক্ষিক যুব বিনিময় কর্মসূচিতে (YEP) অংশগ্রহণের সুযোগ',
      'ত্রি-বাহিনীর অফিসার ও অন্যান্য ক্যাডেটদের সাথে যৌথ মহড়া',
      'বাংলাদেশ প্রতিরক্ষা মন্ত্রণালয়ের অধীনে অফিসিয়াল প্রশংসাপত্র লাভ',
    ],
  },
  {
    id: 'physical-tactical',
    title: 'Physical Conditioning & Survival Mastery',
    titleBn: 'শারীরিক সক্ষমতা ও দুর্যোগ সারভাইভাল প্রশিক্ষণ',
    shortDesc: 'Rigorous conditioning including obstacle courses, compass navigation, unarmed combat, and disaster relief operations.',
    shortDescBn: 'অবস্ট্যাকল কোর্স অতিক্রম, কম্পাস নেভিগেশন, আনআর্মড কম্ব্যাট এবং দুর্যোগে উদ্ধার অভিযানের কঠোর শারীরিক প্রশিক্ষণ।',
    longDesc: 'Every cadet undergoes progressive physical fitness training designed to build cardiovascular stamina, core strength, and agility. Specialized classes teach first aid, rescue operations, map reading, and knot tying.',
    longDescBn: 'প্রতিটি ক্যাডেটকে কার্ডিওভাসকুলার স্ট্যামিনা, পেশিশক্তি ও ক্ষিপ্রতা বৃদ্ধির জন্য শারীরিক প্রশিক্ষণ প্রদান করা হয়। বিশেষ ক্লাসে প্রাথমিক চিকিৎসা (First Aid), রেসকিউ অপারেশন, সামরিক ম্যাপ রিডিং ও গিঁট বাঁধার কলাকৌশল শেখানো হয়।',
    category: 'Skill & Leadership',
    categoryBn: 'দক্ষতা ও নেতৃত্ব',
    icon: 'Activity',
    bulletPoints: [
      'Obstacle course crossing and field endurance drills',
      'Military map reading, prismatic compass orientation, and grid references',
      'Certified First Aid and CPR training with Fire Service & Civil Defence',
      'Disaster search and rescue techniques for riverine and urban environments',
    ],
    bulletPointsBn: [
      'অবস্ট্যাকল কোর্স অতিক্রম ও ফিল্ড অ্যান্ডুরেন্স ড্রিল',
      'সামরিক ম্যাপ রিডিং, প্রিজমেটিক কম্পাস পর্যবেক্ষণ ও গ্রিড রেফারেন্স',
      'ফায়ার সার্ভিস ও সিভিল ডিফেন্সের সাথে সার্টিফাইড ফার্স্ট এইড ও সিপিআর প্রশিক্ষণ',
      'নদীমাতৃক ও শহরাঞ্চলে দুর্যোগকালীন সন্ধান ও উদ্ধার কৌশল',
    ],
  },
  {
    id: 'academic-prestige',
    title: 'University & Academic Distinction',
    titleBn: 'বিশ্ববিদ্যালয়ে সম্মান ও একাডেমিক স্বীকৃতি',
    shortDesc: 'Official leadership recognition at Metropolitan University with privileged ambassadorial roles during VIP campus visits.',
    shortDescBn: 'মেট্রোপলিটন ইউনিভার্সিটিতে আনুষ্ঠানিক সম্মান, সমাবর্তন ও ভিআইপি প্রটোকলে গার্ড অব অনার প্রদানের সুযোগ।',
    longDesc: 'MU BNCC cadets serve as the ceremonial guard of honor for Chancellor visits, Convocation ceremonies, International Conferences, and Independence Day commemorations.',
    longDescBn: 'এমইউ বিএনসিসি ক্যাডেটরা চ্যান্সেলর আগমন, সমাবর্তন উৎসব, আন্তর্জাতিক সম্মেলন এবং জাতীয় দিবসে গার্ড অব অনার প্রদান করে বিশ্ববিদ্যালয়ের প্রতিনিধিত্ব করেন, যা কর্পোরেট ও উচ্চশিক্ষায় বিশেষ মূল্যায়িত হয়।',
    category: 'Academic & Community',
    categoryBn: 'একাডেমিক ও সামাজিক সম্মান',
    icon: 'GraduationCap',
    bulletPoints: [
      'Ceremonial Guard of Honor for Vice-Chancellor & State Dignitaries',
      'High-impact resume credential valued by corporate and multinational recruiters',
      'Metropolitan University co-curricular leadership certificate',
      'Special consideration for university voluntary leadership honors',
    ],
    bulletPointsBn: [
      'উপাচার্য ও রাষ্ট্রীয় বিশিষ্টজনদের জন্য গার্ড অব অনার প্রদান',
      'কর্পোরেট ও বহুজাতিক কোম্পানিতে অগ্রাধিকারপ্রাপ্ত অভিজ্ঞতার সনদ',
      'মেট্রোপলিটন ইউনিভার্সিটির সহশিক্ষা নেতৃত্ব প্রশংসাপত্র লাভ',
      'বিশ্ববিদ্যালয়ের বার্ষিক নেতৃত্ব ও স্বেচ্ছাসেবা সম্মাননায় অগ্রাধিকার',
    ],
  },
  {
    id: 'humanitarian-service',
    title: 'Humanitarian & National Service',
    titleBn: 'মানবিক সহায়তা ও দেশসেবায় আত্মনিয়োগ',
    shortDesc: 'At the frontline of community welfare, disaster relief, blood donation campaigns, and campus environmental stewardship.',
    shortDescBn: 'বন্যা ও দুর্যোগে ত্রাণ কার্যক্রম, স্বেচ্ছায় রক্তদান ক্যাম্পেইন এবং সামাজিক সুরক্ষায় প্রথম সারিতে অংশগ্রহণ।',
    longDesc: 'True to the BNCC motto of Voluntary Service, the platoon operates rapid mobilization teams during floods in Sylhet division, runs seasonal blood drives, and manages university security protocols.',
    longDescBn: 'বিএনসিসির মূলমন্ত্র "স্বেচ্ছাসেবা" বাস্তবায়নে সিলেট বিভাগে বন্যা দুর্যোগে উদ্ধার ও ত্রাণ দল পরিচালনা, বিশ্ববিদ্যালয়ে জরুরি রক্তের রেজিস্ট্রি বজায় রাখা এবং সবুজ ক্যাম্পাস অভিযানে ক্যাডেটরা অগ্রণী ভূমিকা পালন করেন।',
    category: 'Academic & Community',
    categoryBn: 'একাডেমিক ও সামাজিক সম্মান',
    icon: 'HeartHandshake',
    bulletPoints: [
      'Sylhet Division flood relief mobilization and ration distribution',
      'Regular voluntary blood registry maintaining campus emergency donors',
      'Traffic awareness and civic safety campaigns in Metropolitan areas',
      'Green campus afforestation and environmental cleanliness projects',
    ],
    bulletPointsBn: [
      'সিলেট বিভাগীয় বন্যা দুর্যোগে জরুরি ত্রাণ ও খাদ্যসামগ্রী বিতরণ',
      'ক্যাম্পাসে নিয়মিত স্বেচ্ছায় রক্তদান ও রক্তদাতাদের রেজিস্ট্রি পরিচালনা',
      'মেট্রোপলিটন এলাকায় ট্রাফিক সচেতনতা ও নাগরিক নিরাপত্তা ক্যাম্পেইন',
      'সবুজ ক্যাম্পাস গড়ে তুলতে বৃক্ষরোপণ ও পরিবেশ পরিচ্ছন্নতা কার্যক্রম',
    ],
  },
];

export const GUIDELINES_DATA: GuidelineItem[] = [
  {
    id: 'drill-syllabus',
    title: 'Parade & Drill Training Syllabus',
    titleBn: 'প্যারেড ও কুচকাওয়াজ প্রশিক্ষণ সিলেবাস',
    category: 'Training Syllabus',
    categoryBn: 'প্রশিক্ষণ সিলেবাস',
    summary: 'The systematic progression from stationary squad movements to ceremonial armed drills and march-pasts.',
    summaryBn: 'স্থির স্কোয়াড ড্রিল থেকে শুরু করে আনুষ্ঠানিক সশস্ত্র কুচকাওয়াজ ও মার্চ-পাস্টের সুশৃঙ্খল সিলেবাস।',
    details: [
      'Foot Drill: Attention (Savdhan), Stand-at-Ease (Vishram), Stand Easy (Aaram Se), Turning by numbers (Dahine/Baayein/Peeche Mur).',
      'Marching Drill: Quick March (Tez Chal), Halt (Tham), Marking Time (Kadam Taal), Paces changing and dress formation (Khuli Line / Nikat Line Chalo).',
      'Ceremonial Protocol: Salami Shastra (Present Arms), Guard of Honor formation, March Past review by Chief Guest.',
      'Sword & Cane Drill: Specialized weapon and pace-stick handling for Cadet Under Officers and Sergeants.',
    ],
    detailsBn: [
      'পদব্রজে ড্রিল: সাবধান, বিশ্রাম, আরাম সে, ডাইনে মোড়, বাঁয়ে মোড় ও পিছে মোড় চালনা।',
      'মার্চিং ড্রিল: তেজ চল, থম, কদম তাল, চাল বদল এবং লাইন সজ্জা (খুলি লাইন ও নিকট লাইন চল)।',
      'আনুষ্ঠানিক প্রটোকল: জাতীয় সালাম ও सलामी শাস্ত্র, গার্ড অব অনার গঠন ও প্রধান অতিথির মার্চ পাস্ট পরিদর্শন।',
      'সোর্ড ও ক্যান ড্রিল: ক্যাডেট আন্ডার অফিসার এবং সিনিয়র সার্জেন্টদের জন্য বিশেষায়িত পেস-স্টিক ও সোর্ড চালনা।',
    ],
    scheduleOrRequirement: 'Every Sunday & Wednesday: 06:45 AM - 08:30 AM at MU Central Campus Ground.',
    scheduleOrRequirementBn: 'প্রতি রবিবার ও বুধবার: সকাল ০৬:৪৫ - ০৮:৩০, এমইউ কেন্দ্রীয় ক্যাম্পাস মাঠ।',
  },
  {
    id: 'rank-ladder',
    title: 'Cadet Rank Hierarchy & Promotion Matrix',
    titleBn: 'ক্যাডেট পদমর্যাদা ক্রমবিন্যাস ও পদোন্নতি নীতিমালা',
    category: 'Rank Structure',
    categoryBn: 'পদমর্যাদা কাঠামো',
    summary: 'Merit-based promotion standards governed by attendance, exam scores, physical tests, and camp evaluations.',
    summaryBn: 'প্যারেড উপস্থিতি, লিখিত পরীক্ষা, শারীরিক সক্ষমতা এবং রেজিমেন্টাল ক্যাম্প মূল্যায়নের ভিত্তিতে পদোন্নতি।',
    details: [
      'Cadet (Cdt): Basic inducted rank upon completing 3-month foundation training and 80% attendance.',
      'Cadet Lance Corporal (L/Cpl): Awarded to cadets demonstrating exceptional drill precision and squad leadership.',
      'Cadet Corporal (Cpl): Section second-in-command responsible for inspecting cadet turnout and equipment readiness.',
      'Cadet Sergeant (Sgt): Platoon drill instructor; leads university morning parades and manages cadet rosters.',
      'Cadet Under Officer (CUO): The highest cadet rank in the university platoon; acts as the primary cadet liaison to the Platoon Commander (PUO) and University Administration.',
    ],
    detailsBn: [
      'ক্যাডেট (CDT): ৩ মাসের মৌলিক প্রশিক্ষণ ও ন্যূনতম ৮০% উপস্থিতি সফলভাবে সম্পন্ন করার পর প্রাথমিক পদবী।',
      'ক্যাডেট ল্যান্স কর্পোরাল (L/CPL): ড্রিল পারদর্শিতা ও স্কোয়াড পরিচালনায় নৈপুণ্য প্রদর্শনকারী ক্যাডেটদের পদোন্নতি।',
      'ক্যাডেট কর্পোরাল (CPL): সেকশন সেকেন্ড-ইন-কমান্ড; ক্যাডেটদের টার্নআউট ও ইউনিফর্ম প্রস্তুত রাখা নিশ্চিত করেন।',
      'ক্যাডেট সার্জেন্ট (SGT): প্লাটুনের প্রধান ড্রিল প্রশিক্ষক; সকালের বিশ্ববিদ্যালয়ের প্যারেড ও উপস্থিতি রেজিস্ট্রি নিয়ন্ত্রণ করেন।',
      'ক্যাডেট আন্ডার অফিসার (CUO): বিশ্ববিদ্যালয়ের প্লাটুনের সর্বোচ্চ ক্যাডেট পদবী; প্লাটুন কমান্ডার (PUO) ও বিশ্ববিদ্যালয় প্রশাসনের প্রধান প্রতিনিধি।',
    ],
    scheduleOrRequirement: 'Bi-annual promotion assessment exams held in March and September.',
    scheduleOrRequirementBn: 'মার্চ ও সেপ্টেম্বর মাসে অনুষ্ঠিত দ্বি-বার্ষিক পদোন্নতি মূল্যায়ন পরীক্ষা।',
  },
  {
    id: 'uniform-code',
    title: 'Uniform, Accoutrements & Turnout Regulations',
    titleBn: 'ইউনিফর্ম, ব্যাজ পরিধান ও টার্নআউট বিধিমালা',
    category: 'Uniform Code',
    categoryBn: 'ইউনিফর্ম কোড',
    summary: 'Strict turnout expectations to preserve military dignity and university pride.',
    summaryBn: 'সামরিক গাম্ভীর্য ও বিশ্ববিদ্যালয়ের ভাবমূর্তি রক্ষায় ইউনিফর্ম পরিধানের কঠোর নিয়মাবলী।',
    details: [
      'Working Dress: Olive green / Khaki trousers and shirt with epaulets, ironed with razor-sharp center creases.',
      'Beret & Hackle: Deep green / navy beret pinned with the official BNCC crest positioned 1 inch above left eyebrow; platoon hackle securely fastened.',
      'Belt & Buckle: Regulation web belt with brass buckle polished to mirror shine using Brasso; no tarnishing permitted.',
      'Footwear: High-ankle DMS boots with parade gloss polish; black socks pulled tight.',
      'Grooming: Clean-shaven face (or neatly trimmed regulation beard), short tapered military haircut for male cadets; hair neatly tucked in bun with black hairnet for female cadets.',
    ],
    detailsBn: [
      'ওয়ার্কিং ড্রেস: নিখুঁতভাবে ইস্ত্রি করা জলপাই সবুজ (Olive Green) শার্ট ও ট্রাউজার এবং এপোলেট।',
      'বেরেট ও হ্যাকল: বাম চোখের ভ্রু-এর ১ ইঞ্চি উপরে বিএনসিসি ক্রেস্টযুক্ত সবুজ বেরেট এবং প্লাটুনের লাল হ্যাকল।',
      'বেল্ট ও বাকল: ব্রাসো দিয়ে চকচকে পালিশকৃত পিতলের বাকলযুক্ত সামরিক ওয়েব বেল্ট।',
      'পাদুকা: হাই-অ্যাঙ্কেল ডিএমএস (DMS) বুট জুতা প্যারেড গ্লস পলিশ সহকারে এবং আঁটসাঁট কালো মোজা।',
      'ব্যক্তিগত পরিচ্ছন্নতা: ছেলেদের ক্ষেত্রে মিলিটারি হেয়ারকাট ও ক্লিন শেভড চেহারা; মেয়েদের ক্ষেত্রে খোঁপা ও কালো হেয়ারনেট পরিধান বাধ্যতামূলক।',
    ],
    scheduleOrRequirement: 'Mandatory uniform inspection at 06:45 AM before stepping on the parade ground.',
    scheduleOrRequirementBn: 'প্যারেড গ্রাউন্ডে প্রবেশের পূর্বে সকাল ০৬:৪৫ মিনিটে টার্নআউট পরিদর্শন বাধ্যতামূলক।',
  },
  {
    id: 'camp-protocols',
    title: 'Field Craft, Navigation & Survival Protocols',
    titleBn: 'ফিল্ড ক্রাফট, কম্পাস নেভিগেশন ও সারভাইভাল প্রটোকল',
    category: 'Parade Protocol',
    categoryBn: 'মাঠ প্রটোকল ও ক্যাম্পিং',
    summary: 'Outdoor tactical exercises covering field camouflage, compass reading, shelter construction, and obstacle courses.',
    summaryBn: 'ক্যামোফ্লেজ, কম্পাস পর্যবেক্ষণ, অস্থায়ী তাঁবু স্থাপন ও অবস্ট্যাকল অতিক্রমের কৌশলগত প্রশিক্ষণ।',
    details: [
      'Map Reading: Conventional military signs, contours, bearing calculation using Silva & Prismatic compass.',
      'Field Craft: Judging distance by unit-of-measure and appearance methods; camouflage and concealment techniques.',
      'Obstacle Course: 6-foot wall scale, tiger jump, horizontal ropes, zig-zag balance, and low-crawl wire simulation.',
      'Disaster Camp: First aid triage, stretcher evacuation, water purification, and temporary bivouac pitching.',
    ],
    detailsBn: [
      'ম্যাপ রিডিং: প্রিজমেটিক কম্পাসের সাহায্যে বেয়ারিং নির্ণয়, কনভেনশনাল সাইন ও কন্টুর লাইন পাঠ।',
      'ফিল্ড ক্রাফট: দৃষ্টি ও একক পদ্ধতিতে দূরত্ব পরিমাপ, প্রাকৃতিক ছদ্মবেশ (Camouflage) ও আড়াল গ্রহণ।',
      'অবস্ট্যাকল কোর্স: ৬ ফুট উঁচু দেয়াল অতিক্রম, টাইগার জাম্প, রোপ ব্যালেন্সিং ও লো-ক্রলিং তারের নিচ দিয়ে অতিক্রম।',
      'দুর্যোগ ক্যাম্প: ফার্স্ট এইড ট্রায়াজ, স্ট্রেচারে আহত স্থানান্তর, পানি বিশুদ্ধকরণ ও ক্যাম্প স্থাপন।',
    ],
    scheduleOrRequirement: 'Conducted during the annual semester break 5-day field camp.',
    scheduleOrRequirementBn: 'বার্ষিক সেমিস্টার বিরতিতে ৫ দিনের ফিল্ড ক্যাম্পিংয়ের মাধ্যমে পরিচালিত।',
  },
];

export const POLICIES_DATA: PolicyItem[] = [
  {
    id: 'honor-code',
    section: 'Section 01',
    sectionBn: 'অনুচ্ছেদ ০১',
    title: 'Honor Code & Integrity Standards',
    titleBn: 'সম্মান কোড ও সততার মানদণ্ড',
    content: 'A Cadet of Metropolitan University does not lie, cheat, steal, or tolerate those who do. Moral integrity and personal responsibility form the bedrock of BNCC fellowship.',
    contentBn: 'মেট্রোপলিটন ইউনিভার্সিটির একজন ক্যাডেট কখনো মিথ্যা বলে না, প্রতারণা করে না, চুরি করে না এবং তা সহ্যও করে না। নৈতিক সততা ও ব্যক্তিগত দায়িত্ববোধই বিএনসিসি ভ্রাতৃত্বের মূল ভিত্তি।',
    subrules: [
      'Cadets must maintain respectful conduct with faculty members, peers, and junior cadets at all times.',
      'Academic dishonesty in university examinations will result in immediate discharge from the platoon.',
      'Misuse of the BNCC uniform or insignia for personal favors or political agitation is strictly prohibited.',
    ],
    subrulesBn: [
      'ক্যাডেটদের শিক্ষক, সহপাঠী এবং অনুজ ক্যাডেটদের সাথে সর্বদা শ্রদ্ধাপূর্ণ ও মার্জিত আচরণ বজায় রাখতে হবে।',
      'বিশ্ববিদ্যালয়ের পরীক্ষায় কোনো অসদুপায় অবলম্বন করলে তাৎক্ষণিকভাবে প্লাটুন থেকে স্থায়ী বহিষ্কার করা হবে।',
      'ব্যক্তিগত স্বার্থোদ্ধার বা রাজনৈতিক কর্মকাণ্ডে বিএনসিসির ইউনিফর্ম বা প্রতীক ব্যবহার সম্পূর্ণ নিষিদ্ধ।',
    ],
    enforcement: 'Immediate disciplinary inquiry convened by the Platoon Commander and University Proctorial Body.',
    enforcementBn: 'প্লাটুন কমান্ডার ও বিশ্ববিদ্যালয় প্রক্টরিয়াল বডি কর্তৃক গঠিত তদন্ত কমিটির মাধ্যমে তাৎক্ষণিক শাস্তিমূলক ব্যবস্থা।',
  },
  {
    id: 'attendance-policy',
    section: 'Section 02',
    sectionBn: 'অনুচ্ছেদ ০২',
    title: 'Parade Attendance & Punctuality Policy',
    titleBn: 'প্যারেড উপস্থিতি ও সময়ানুবর্তিতা নীতিমালা',
    content: 'Regular parade attendance is mandatory for maintaining active cadet status and qualifying for camp nominations or promotion exams.',
    contentBn: 'সক্রিয় ক্যাডেট পদমর্যাদা বজায় রাখা এবং ক্যাম্প মনোনয়ন বা পদোন্নতি পরীক্ষায় অংশ নিতে নিয়মিত প্যারেড উপস্থিতি বাধ্যতামূলক।',
    subrules: [
      'Minimum required attendance is 80% of all scheduled morning parades and ceremonial roll calls.',
      'Absence due to university examinations, lab duties, or medical illness requires written application 24 hours prior.',
      'Late arrival past the first roll call whistle (06:45 AM) incurs administrative penalty and loss of session credit.',
      'Three consecutive unexcused absences trigger an official show-cause notice.',
    ],
    subrulesBn: [
      'সকল নির্ধারিত সকালের প্যারেড ও রোল কলে ন্যূনতম ৮০% উপস্থিতি থাকা বাধ্যতামূলক।',
      'বিশ্ববিদ্যালয় পরীক্ষা, ল্যাব বা অসুস্থতার কারণে অনুপস্থিতির জন্য ২৪ ঘণ্টা পূর্বে লিখিত আবেদন জমা দিতে হবে।',
      'প্রথম হুইসেলের (সকাল ০৬:৪৫) পরে বিলম্বে উপস্থিত হলে সেশনের ক্রেডিট বাতিল এবং প্রশাসনিক শাস্তি প্রযোজ্য হবে।',
      'অনুমোদনহীন টানা ৩টি প্যারেডে অনুপস্থিত থাকলে আনুষ্ঠানিক কারণ দর্শানোর (Show-Cause) নোটিশ জারি করা হবে।',
    ],
    enforcement: 'Cadets failing the 80% threshold are debarred from Annual Training Camps and Rank promotions.',
    enforcementBn: '৮০% উপস্থিতি অর্জনে ব্যর্থ ক্যাডেটরা বার্ষিক প্রশিক্ষণ ক্যাম্প এবং পদোন্নতি পরীক্ষা থেকে সরাসরি বাদ পড়বেন।',
  },
  {
    id: 'anti-ragging',
    section: 'Section 03',
    sectionBn: 'অনুচ্ছেদ ০৩',
    title: 'Anti-Ragging & Harassment Zero-Tolerance Policy',
    titleBn: 'র‍্যাগিং ও হয়রানি বিরোধী জিরো-টলারেন্স নীতি',
    content: 'Metropolitan University BNCC enforces an uncompromised zero-tolerance stance against ragging, hazing, psychological intimidation, or harassment in any form.',
    contentBn: 'মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি যেকোনো ধরণের র‍্যাগিং, শারীরিক নির্যাতন, মানসিক ভীতি প্রদর্শন বা হয়রানির বিরুদ্ধে আপসহীন জিরো-টলারেন্স নীতি অনুসরণ করে।',
    subrules: [
      'Junior cadets must be treated with dignity, professional encouragement, and protective mentorship.',
      'No physical tasks or drills may be assigned outside authorized training hours under official instructor supervision.',
      'A confidential student grievance channel is maintained directly by the University Platoon Commander (PUO).',
    ],
    subrulesBn: [
      'জুনিয়র ক্যাডেটদের সর্বোচ্চ মর্যাদা, পেশাদার উৎসাহ এবং সুরক্ষামূলক মেন্টরশিপ প্রদান করতে হবে।',
      'অফিসিয়াল ট্রেইনারের তত্ত্বাবধান ব্যতিরেকে অনুমোদিত সময়ের বাইরে কোনো শারীরিক ড্রিল বা কাজ দেওয়া সম্পূর্ণ নিষিদ্ধ।',
      'যেকোনো অভিযোগ সরাসরি বিশ্ববিদ্যালয় প্লাটুন কমান্ডারের (PUO) কাছে জানাতে গোপনীয় অভিযোগ সেল চালু রয়েছে।',
    ],
    enforcement: 'Violators face immediate expulsion from BNCC, suspension from the university, and referral to law enforcement.',
    enforcementBn: 'লঙ্ঘনকারীকে তাৎক্ষণিকভাবে বিএনসিসি থেকে স্থায়ী বহিষ্কার, বিশ্ববিদ্যালয় থেকে বহিষ্কার এবং আইন প্রয়োগকারী সংস্থায় হস্তান্তর করা হবে।',
  },
  {
    id: 'chain-of-command',
    section: 'Section 04',
    sectionBn: 'অনুচ্ছেদ ০৪',
    title: 'Chain of Command & Operational Protocol',
    titleBn: 'চেইন অব কমান্ড ও কার্যপ্রণালী প্রটোকল',
    content: 'All communications, requests, leave applications, and incident reports must proceed strictly through authorized command channels.',
    contentBn: 'সকল যোগাযোগ, ছুটির আবেদন, প্রশাসনিক অনুরোধ এবং প্রতিবেদন অবশ্যই অনুমোদিত চেইন অব কমান্ডের মাধ্যমে প্রেরণ করতে হবে।',
    subrules: [
      'Cadet -> Section Corporal -> Platoon Sergeant -> Cadet Under Officer (CUO) -> Platoon Commander (PUO).',
      'Direct representations to the Vice-Chancellor or Battalion HQ without prior platoon clearance are prohibited.',
      'Emergency medical situations bypass normal channels straight to the Platoon Commander and Campus Medical Center.',
    ],
    subrulesBn: [
      'ক্যাডেট -> সেকশন কর্পোরাল -> প্লাটুন সার্জেন্ট -> ক্যাডেট আন্ডার অফিসার (CUO) -> প্লাটুন কমান্ডার (PUO)।',
      'প্লাটুনের অনুমোদন ছাড়া উপাচার্য মহোদয় বা ব্যাটালিয়ন সদর দপ্তরে সরাসরি যোগাযোগ করা শৃঙ্খলা পরিপন্থী।',
      'জরুরি চিকিৎসা বা স্বাস্থ্যগত পরিস্থিতিতে সাধারণ চেইন অব কমান্ড শিথিল করে সরাসরি প্লাটুন কমান্ডারকে অবহিত করা যাবে।',
    ],
    enforcement: 'Bypassing the chain of command results in formal reprimand on the cadet service book.',
    enforcementBn: 'চেইন অব কমান্ড লঙ্ঘন করলে ক্যাডেটের সার্ভিস বুকে আনুষ্ঠানিক সতর্কবার্তা ও ক্রেডিট কর্তন করা হবে।',
  },
  {
    id: 'social-media',
    section: 'Section 05',
    sectionBn: 'অনুচ্ছেদ ০৫',
    title: 'Social Media & Public Representation Directive',
    titleBn: 'সামাজিক যোগাযোগ মাধ্যম ও প্রকাশ্য প্রতিনিধিত্ব নির্দেশিকা',
    content: 'Cadets represent the dignity of Metropolitan University and the Bangladesh Armed Forces fraternity in digital spaces.',
    contentBn: 'অনলাইন ও ডিজিটাল মাধ্যমে ক্যাডেটরা মেট্রোপলিটন ইউনিভার্সিটি এবং বাংলাদেশ সশস্ত্র বাহিনী অঙ্গনের সম্মান ও গাম্ভীর্যের প্রতিনিধিত্ব করেন।',
    subrules: [
      'No publication of tactical camp locations, security drills, or sensitive university operations without approval.',
      'Photographs in uniform must reflect immaculate turnout with proper posture and dignity.',
      'Political debate or partisan commentary while displaying BNCC affiliation is strictly prohibited.',
    ],
    subrulesBn: [
      'অনুমোদন ব্যতিরেকে কোনো কৌশলগত ক্যাম্পের অবস্থান, নিরাপত্তা মহড়া বা সংবেদনশীল কার্যক্রমের ছবি প্রকাশ করা যাবে না।',
      'পোশাক পরিহিত ছবি প্রকাশের ক্ষেত্রে যথাযথ সামরিক ভঙ্গি, সঠিক টার্নআউট ও শালীনতা বজায় রাখা আবশ্যক।',
      'বিএনসিসি পরিচয় বা ইউনিফর্ম প্রদর্শন করে কোনো রাজনৈতিক বিতর্ক বা দলীয় পক্ষপাতমূলক মন্তব্য করা কঠোরভাবে নিষিদ্ধ।',
    ],
    enforcement: 'Content removal mandate and platoon administrative suspension for serious breaches.',
    enforcementBn: 'পোস্ট অপসারণের নির্দেশ এবং গুরুতর লঙ্ঘনের ক্ষেত্রে প্লাটুন থেকে সাময়িক বা স্থায়ী বহিষ্কারাদেশ প্রদান।',
  },
];

export const UPCOMING_EVENTS: EventItem[] = [
  {
    id: 'evt-01',
    title: 'Spring Semester Grand Parade & Turnout Inspection',
    titleBn: 'স্প্রিং সেমিস্টার গ্র্যান্ড প্যারেড ও টার্নআউট পরিদর্শন',
    category: 'Training',
    categoryBn: 'ড্রিল ও প্রশিক্ষণ',
    date: '2026-10-14',
    displayDate: 'Wednesday, 14 October 2026',
    displayDateBn: 'বুধবার, ১৪ অক্টোবর ২০২৬',
    time: '06:45 AM - 09:00 AM',
    timeBn: 'সকাল ০৬:৪৫ - ০৯:০০',
    venue: 'Metropolitan University Central Parade Ground, Bateshwar',
    venueBn: 'মেট্রোপলিটন ইউনিভার্সিটি কেন্দ্রীয় প্যারেড গ্রাউন্ড, বটেশ্বর',
    description: 'Comprehensive turnout inspection by Platoon Commander followed by squad drill rehearsals, baton handling, and ceremonial formation practice.',
    descriptionBn: 'প্লাটুন কমান্ডার কর্তৃক সার্বিক টার্নআউট পরিদর্শন, স্কোয়াড ড্রিল রিহার্সাল, ব্যাটন হ্যান্ডলিং এবং আনুষ্ঠানিক ফর্মেশন অনুশীলন।',
    instructorOrLead: 'Platoon Commander (PUO) & Senior Cadet Under Officer',
    instructorOrLeadBn: 'প্লাটুন কমান্ডার (PUO) ও সিনিয়র ক্যাডেট আন্ডার অফিসার',
    mandatoryTurnout: 'Working Dress (Olive Green), Polished DMS Boots, Beret with Badge',
    mandatoryTurnoutBn: 'ওয়ার্কিং ড্রেস (জলপাই সবুজ), পালিশকৃত ডিএমএস বুট, ব্যাজযুক্ত বেরেট',
    spotsOrAttendance: 'All active cadets (Platoon 1 & 2)',
    spotsOrAttendanceBn: 'সকল সক্রিয় ক্যাডেট (প্লাটুন ১ ও ২)',
    isUpcoming: true,
  },
  {
    id: 'evt-02',
    title: 'University Foundation Day Ceremonial Guard of Honor',
    titleBn: 'বিশ্ববিদ্যালয় প্রতিষ্ঠাবার্ষিকী আনুষ্ঠানিক গার্ড অব অনার',
    category: 'Campus Duty',
    categoryBn: 'ক্যাম্পাস ডিউটি',
    date: '2026-10-24',
    displayDate: 'Saturday, 24 October 2026',
    displayDateBn: 'শনিবার, ২৪ অক্টোবর ২০২৬',
    time: '09:30 AM - 01:00 PM',
    timeBn: 'সকাল ০৯:৩০ - দুপুর ০১:০০',
    venue: 'MU Administrative Auditorium & Main Gate Plaza',
    venueBn: 'এমইউ প্রশাসনিক অডিটোরিয়াম ও প্রধান ফটক প্লাজা',
    description: 'Providing ceremonial guard of honor for distinguished guests, Trustees, and the Vice-Chancellor during the annual university foundation commemoration.',
    descriptionBn: 'বার্ষিক বিশ্ববিদ্যালয় প্রতিষ্ঠা দিবস উপলক্ষ্যে ট্রাস্টি বোর্ডের সদস্যবৃন্দ, উপাচার্য ও বিশিষ্ট অতিথিবৃন্দকে আনুষ্ঠানিক গার্ড অব অনার প্রদান।',
    instructorOrLead: 'Cadet Under Officer (CUO) & Color Guard Squad',
    instructorOrLeadBn: 'ক্যাডেট আন্ডার অফিসার (CUO) ও কালার গার্ড স্কোয়াড',
    mandatoryTurnout: 'Ceremonial Full Dress, White Belts, Gloves, Gold Lanyards & Hackle',
    mandatoryTurnoutBn: 'সেরিমোনিয়াল ফুল ড্রেস, সাদা বেল্ট, গ্লাভস, গোল্ডেন ল্যানিয়ার্ড ও হ্যাকল',
    spotsOrAttendance: 'Selected 24-Cadet Guard Contingent',
    spotsOrAttendanceBn: 'নির্বাচিত ২৪ জন ক্যাডেটের গার্ড কন্টিনজেন্ট',
    isUpcoming: true,
  },
  {
    id: 'evt-03',
    title: 'Sylhet Division Voluntary Blood Donation & Emergency Camp',
    titleBn: 'সিলেট বিভাগীয় স্বেচ্ছায় রক্তদান ও জরুরি সহায়তা ক্যাম্প',
    category: 'Community Service',
    categoryBn: 'সামাজিক সেবা',
    date: '2026-11-04',
    displayDate: 'Wednesday, 04 November 2026',
    displayDateBn: 'বুধবার, ০৪ নভেম্বর ২০২৬',
    time: '10:00 AM - 04:30 PM',
    timeBn: 'সকাল ১০:০০ - বিকাল ০৪:৩০',
    venue: 'MU Student Centre & Plaza Area',
    venueBn: 'এমইউ স্টুডেন্ট সেন্টার ও প্লাজা চত্বর',
    description: 'Joint humanitarian initiative organized by MU BNCC in collaboration with Red Crescent Society Sylhet. Blood typing, emergency donation, and CPR demonstrations.',
    descriptionBn: 'রেড ক্রিসেন্ট সোসাইটি সিলেটের সহযোগিতায় এমইউ বিএনসিসির যৌথ মানবিক উদ্যোগ। ব্লাড গ্রুপিং, জরুরি রক্তদান এবং সিপিআর প্রশিক্ষণ প্রদর্শন।',
    instructorOrLead: 'MU BNCC Community Welfare Cell & Red Crescent Medical Team',
    instructorOrLeadBn: 'এমইউ বিএনসিসি সমাজকল্যাণ সেল ও রেড ক্রিসেন্ট মেডিকেল টিম',
    mandatoryTurnout: 'Platoon Polo T-Shirt / Uniform with ID Card',
    mandatoryTurnoutBn: 'প্লাটুন পোলো টি-শার্ট / ইউনিফর্ম ও আইডি কার্ড',
    spotsOrAttendance: 'Open to All Cadets & University Students',
    spotsOrAttendanceBn: 'সকল ক্যাডেট ও বিশ্ববিদ্যালয়ের শিক্ষার্থীদের জন্য উন্মুক্ত',
    isUpcoming: true,
  },
  {
    id: 'evt-04',
    title: 'Mainamati Regiment Central Annual Training Camp (CATC)',
    titleBn: 'ময়নামতি রেজিমেন্ট কেন্দ্রীয় বার্ষিক প্রশিক্ষণ ক্যাম্প (CATC)',
    category: 'Camp / Parade',
    categoryBn: 'ক্যাম্প ও কুচকাওয়াজ',
    date: '2026-11-18',
    displayDate: '18 Nov - 27 Nov 2026 (10 Days)',
    displayDateBn: '১৮ নভে - ২৭ নভে ২০২৬ (১০ দিন)',
    time: 'Round-the-Clock Residential',
    timeBn: 'পূর্ণ আবাসিক ক্যাম্প',
    venue: 'Mainamati Regiment Camp Grounds, Cumilla Cantonment',
    venueBn: 'ময়নামতি রেজিমেন্ট ক্যাম্প গ্রাউন্ড, কুমিল্লা সেনানিবাস',
    description: 'The pinnacle annual training event featuring 10 days of intensive weapon handling, firing range practice, tactical obstacle crossing, map reading, and cultural competitions.',
    descriptionBn: '১০ দিনের নিবিড় অস্ত্র প্রশিক্ষণ, ফায়ারিং রেঞ্জ অনুশীলন, রণকৌশল, অবস্ট্যাকল অতিক্রম, ম্যাপ রিডিং ও সাংস্কৃতিক প্রতিযোগিতায় রেজিমেন্টাল শীর্ষ ক্যাম্প।',
    instructorOrLead: 'Bangladesh Army Regimental Instructors & BNCC Staff Officers',
    instructorOrLeadBn: 'বাংলাদেশ সেনাবাহিনী রেজিমেন্টাল প্রশিক্ষক ও বিএনসিসি স্টাফ অফিসারবৃন্দ',
    mandatoryTurnout: 'Full Field Gear, Combat Kit, Bedding, Mess Gear & Documents',
    mandatoryTurnoutBn: 'সম্পূর্ণ ফিল্ড গিয়ার, কমব্যাট কিট, বিছানাপত্র, মেস গিয়ার ও সনদপত্র',
    spotsOrAttendance: 'Nominated Cadets based on 85%+ attendance ranking',
    spotsOrAttendanceBn: '৮৫%+ উপস্থিতি স্কোরের ভিত্তিতে মনোনীত ক্যাডেটবৃন্দ',
    isUpcoming: true,
  },
  {
    id: 'evt-05',
    title: 'Freshers Orientation & Induction Fitness Screening',
    titleBn: 'নবীন ক্যাডেট ওরিয়েন্টেশন ও প্রাথমিক শারীরিক বাছাই পরীক্ষা',
    category: 'Training',
    categoryBn: 'ড্রিল ও প্রশিক্ষণ',
    date: '2026-12-02',
    displayDate: 'Wednesday, 02 December 2026',
    displayDateBn: 'বুধবার, ০২ ডিসেম্বর ২০২৬',
    time: '03:00 PM - 05:30 PM',
    timeBn: 'বিকাল ০৩:০০ - ০৫:৩০',
    venue: 'MU Gymnasium & Sports Ground',
    venueBn: 'এমইউ জিমনেসিয়াম ও কেন্দ্রীয় খেলার মাঠ',
    description: 'Orientation session for newly applied students followed by 1.6 km run timing, push-ups, chin-ups, and height-weight verification.',
    descriptionBn: 'নবাগত আবেদনকারী শিক্ষার্থীদের ওরিয়েন্টেশন সেশন এবং ১.৬ কিমি দৌড়, পুশ-আপ, চিন-আপ এবং উচ্চতা-ওজন যাচাইকরণ।',
    instructorOrLead: 'Selection Board & Physical Training Instructors',
    instructorOrLeadBn: 'সিলেকশন বোর্ড ও ফিজিক্যাল ট্রেনিং প্রশিক্ষকবৃন্দ',
    mandatoryTurnout: 'Sports attire, running shoes, and original Student ID card',
    mandatoryTurnoutBn: 'স্পোর্টস ড্রেস, রানিং শু এবং মূল স্টুডেন্ট আইডি কার্ড',
    spotsOrAttendance: 'Registered Applicants for Intake 2025-26',
    spotsOrAttendanceBn: 'ইনটেক ২০২৫-২৬ এর নিবন্ধিত আবেদনকারীবৃন্দ',
    isUpcoming: true,
  },
];

export const ELIGIBILITY_CRITERIA = [
  {
    id: 'enrollment',
    label: 'University Enrollment',
    requirement: 'Must be a currently enrolled, regular student of Metropolitan University (Undergraduate or Masters).',
    detail: 'All departments (CSE, EEE, BBA, English, Law, Economics, etc.) are eligible.',
  },
  {
    id: 'cgpa',
    label: 'Academic Standing',
    requirement: 'Minimum cumulative GPA / CGPA of 2.50 out of 4.00 (or equivalent for 1st-semester students).',
    detail: 'Cadets must maintain satisfactory academic progression alongside training.',
  },
  {
    id: 'physical',
    label: 'Physical & Medical Fitness',
    requirement: 'Male: Minimum height 5 ft 4 in (162.5 cm). Female: Minimum height 5 ft 0 in (152.4 cm).',
    detail: 'Normal eyesight (glasses allowed within limits), sound cardiovascular health, no major chronic illness.',
  },
  {
    id: 'age',
    label: 'Age Limit',
    requirement: 'Between 18 and 24 years of age at the time of recruitment application.',
    detail: 'Valid NID card or Birth Registration Certificate required for verification.',
  },
  {
    id: 'attendance',
    label: 'Drill Commitment',
    requirement: 'Willingness to commit to bi-weekly morning parades (06:45 AM) and weekend voluntary events.',
    detail: 'Requires self-discipline, time management, and dedication to the platoon motto.',
  },
];

export const FAQ_DATA = [
  {
    question: 'Can female students join MU BNCC?',
    answer: 'Absolutely yes! Metropolitan University BNCC strongly encourages female student leadership. We have dedicated female cadet squads, female cadet under officers, and specialized training programs with equal opportunities in all camps and defense recommendations.',
  },
  {
    question: 'Does joining BNCC interfere with university classes or exams?',
    answer: 'No. Training parades are scheduled early in the morning (06:45 AM - 08:30 AM) before regular university class slots begin. During mid-term and final examination weeks, parade activities are adjusted or excused so cadets can prioritize academic success.',
  },
  {
    question: 'Is there any monetary cost or fee to join?',
    answer: 'No application or membership fees are charged. Basic training uniforms, berets, badges, and camp allowances are sponsored under the official BNCC and university framework.',
  },
  {
    question: 'How does BNCC assist with ISSB and Armed Forces recruitment?',
    answer: 'BNCC cadets receive direct physical grooming, obstacle course familiarity, weapon handling orientation, and simulated psychological/command task preparation. Qualified cadets enjoy official defense quota considerations under Bangladesh Government regulations.',
  },
];

export interface TestimonialItem {
  id: string;
  name: string;
  nameBn?: string;
  rank: string;
  rankBn?: string;
  profession?: string; // Current profession for visitors/members (e.g. 'Software Engineer', 'Student', 'Teacher')
  professionBn?: string;
  isVisitor?: boolean;
  department: string;
  departmentBn?: string;
  batch: string;
  batchBn?: string;
  intake: string;
  intakeBn?: string;
  category: 'Senior NCOs' | 'Female Cadets Wing' | 'Intake 2025–26' | 'Alumni & Officers' | 'Community & Visitors';
  categoryBn?: string;
  quote: string;
  quoteBn?: string;
  keyTakeaway: string;
  keyTakeawayBn?: string;
  honorOrAchievement: string;
  honorOrAchievementBn?: string;
  avatarUrl: string;
  serviceYears: string;
  serviceYearsBn?: string;
  isFeatured?: boolean;
}

export const CADET_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'fahmida-khan-visitor',
    name: 'Syeda Fahmida Khan',
    nameBn: 'সৈয়দা ফাহমিদা খান',
    rank: 'Visitor / Community Member',
    rankBn: 'দর্শনার্থী ও শুভাকাঙ্ক্ষী',
    profession: 'Software Engineer',
    professionBn: 'সফটওয়্যার প্রকৌশলী',
    isVisitor: true,
    department: 'Metropolitan University Supporter',
    departmentBn: 'মেট্রোপলিটন ইউনিভার্সিটি শুভাকাঙ্ক্ষী',
    batch: 'Visitor Community',
    batchBn: 'কমিউনিটি শুভাকাঙ্ক্ষী',
    intake: 'Community Contributor',
    intakeBn: 'কমিউনিটি কণ্ঠস্বর',
    category: 'Community & Visitors',
    categoryBn: 'কমিউনিটি ও দর্শনার্থী',
    quote:
      'Witnessing the MU BNCC platoon lead the National Victory Day guard of honor with immaculate drill precision was breathtaking. You do not need to wear the uniform to feel proud of the discipline and patriotic dedication these young cadets embody!',
    quoteBn:
      'জাতীয় বিজয় দিবসে মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি প্লাটুনের শৃঙ্খলাবদ্ধ মার্চ-পাস্ট সরাসরি দেখার অভিজ্ঞতা ছিল অবিস্মরণীয়। ইউনিফর্ম পরিহিত না হয়েও এই তরুণ ক্যাডেটদের দেশপ্রেম ও নিষ্ঠা দেখে যে কেউ গর্ববোধ করবে!',
    keyTakeaway:
      'Inspirational community youth leadership & patriotic discipline.',
    keyTakeawayBn:
      'যুব সমাজের নেতৃত্ব বিকাশ ও অনুপ্রাণিত দেশপ্রেমের অনন্য উদাহরণ।',
    honorOrAchievement: 'Community Respect & Well-wisher Award',
    honorOrAchievementBn: 'কমিউনিটি সম্মাননা ও শুভেচ্ছা',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    serviceYears: 'Community Voice',
    serviceYearsBn: 'কমিউনিটি কণ্ঠস্বর',
    isFeatured: false,
  },
  {
    id: 'tanvir-hasan',
    name: 'Cadet Sergeant Tanvir Hasan',
    nameBn: 'ক্যাডেট সার্জেন্ট তানভীর হাসান',
    rank: 'Cadet Sergeant (C/SGT)',
    rankBn: 'ক্যাডেট সার্জেন্ট (সি/সার্জেন্ট)',
    department: 'Computer Science & Engineering',
    departmentBn: 'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং',
    batch: '52nd Batch',
    batchBn: '৫২তম ব্যাচ',
    intake: 'Intake 2024–25',
    intakeBn: 'ইনটেক ২০২৪–২৫',
    category: 'Senior NCOs',
    categoryBn: 'সিনিয়র এনসিও',
    quote:
      'Before BNCC, I struggled with public speaking and early-morning discipline. Leading 40 cadets at 06:45 AM drill under rain or shine completely transformed my mental toughness. The defense aptitude grooming gave me an unshakeable confidence during my ISSB screening.',
    quoteBn:
      'বিএনসিসিতে যোগদানের পূর্বে আমি সকালের নিয়মানুবর্তিতা এবং সবার সামনে কথা বলতে দ্বিধাবোধ করতাম। কিন্তু বৈরী আবহাওয়া উপেক্ষা করে সকাল ০৬:৪৫ এর ভোরে ৪০ জন ক্যাডেটকে ড্রিল পরিচালনা আমার মানসিক শক্তি ও নেতৃত্বগুণকে পুরোপুরি বদলে দিয়েছে। এই প্রশিক্ষণ আমাকে আইএসএসবি বাছাইয়ের জন্য অটুট আত্মবিশ্বাস জুগিয়েছে।',
    keyTakeaway: 'Built commanding presence and mental toughness under pressure.',
    keyTakeawayBn: 'চাপের মুখে কমান্ডিং ব্যক্তিত্ব ও মানসিক দৃঢ়তা অর্জন।',
    honorOrAchievement: 'Best Turnout Award · Annual Training Camp 2025',
    honorOrAchievementBn: 'সেরা টার্নআউট পুরস্কার · বার্ষিক প্রশিক্ষণ ক্যাম্প ২০২৫',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    serviceYears: '2024 – Present',
    serviceYearsBn: '২০২৪ – বর্তমান',
    isFeatured: true,
  },
  {
    id: 'nusrat-jahan',
    name: 'Cadet Corporal Nusrat Jahan Sumona',
    nameBn: 'ক্যাডেট কর্পোরাল নুসরাত জাহান সুমনা',
    rank: 'Cadet Corporal (C/CPL)',
    rankBn: 'ক্যাডেট কর্পোরাল (সি/কর্পোরাল)',
    department: 'English Literature',
    departmentBn: 'ইংরেজি সাহিত্য',
    batch: '54th Batch',
    batchBn: '৫৪তম ব্যাচ',
    intake: 'Intake 2024–25',
    intakeBn: 'ইনটেক ২০২৪–২৫',
    category: 'Female Cadets Wing',
    categoryBn: 'ছাত্রী ক্যাডেট উইং',
    quote:
      'Standing on the MU parade ground in full Olive Green uniform with the red beret gives you an unshakeable sense of purpose. As a female cadet, the unarmed combat and field leadership training shattered every limitation I thought I had.',
    quoteBn:
      'লাল ব্রে ও পূর্ণাঙ্গ অলিভ গ্রিন ইউনিফর্মে এমইউ প্যারেড গ্রাউন্ডে দাঁড়ানো এক অভূতপূর্ব গর্ব ও উদ্দেশ্যবোধ তৈরি করে। একজন নারী ক্যাডেট হিসেবে আনআর্মড কমব্যাট এবং মাঠপর্যায়ের নেতৃত্ব প্রশিক্ষণ আমার সকল দ্বিধা ও জড়তা ভেঙে দিয়েছে।',
    keyTakeaway: 'Proved that women lead from the front with equal discipline.',
    keyTakeawayBn: 'প্রমাণ করেছে যে সমান শৃঙ্খলায় নারীরা সামনের সারিতে নেতৃত্ব দিতে পারে।',
    honorOrAchievement: 'Guard of Honor Commander · MU Independence Day 2025',
    honorOrAchievementBn: 'গার্ড অব অনার কমান্ডার · এমইউ স্বাধীনতা দিবস ২০২৫',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    serviceYears: '2024 – Present',
    serviceYearsBn: '২০২৪ – বর্তমান',
    isFeatured: true,
  },
  {
    id: 'fahimur-rahman',
    name: 'CUO Fahimur Rahman (Alumnus)',
    nameBn: 'সিইউও ফাহিমুর রহমান (সাবেক ক্যাডেট)',
    rank: 'Former Cadet Under Officer (CUO)',
    rankBn: 'সাবেক ক্যাডেট আন্ডার অফিসার (সিইউও)',
    department: 'BBA Alumni',
    departmentBn: 'বিবিএ এলামনাই',
    batch: '48th Batch',
    batchBn: '৪৮তম ব্যাচ',
    intake: 'Pioneer Batch',
    intakeBn: 'অগ্রদূত ব্যাচ',
    category: 'Alumni & Officers',
    categoryBn: 'প্রাক্তন ও কর্মকর্তা',
    quote:
      'Corporate interviewers didn’t just review my academic CGPA—they spent 15 minutes asking about my command leadership in BNCC. The poise, voice projection, and crisis management you build in this platoon stay with you in boardroom meetings for life.',
    quoteBn:
      'চাকরির ইন্টারভিউতে শুধু আমার সিজিপিএ দেখা হয়নি—তারা প্রায় ১৫ মিনিট আমার বিএনসিসি কমান্ড লিডারশিপ নিয়ে আলোচনা করেন। এই প্লাটুনে গড়ে ওঠা ব্যক্তিত্ব, স্পষ্ট কণ্ঠ এবং সঙ্কট ব্যবস্থাপনার দক্ষতা কর্মজীবনে আজীবন কাজে দেয়।',
    keyTakeaway: 'Direct career advantage in corporate leadership and executive presence.',
    keyTakeawayBn: 'কর্পোরেট নেতৃত্ব ও নির্বাহী ব্যক্তিত্বে সরাসরি ক্যারিয়ার সুবিধা।',
    honorOrAchievement: 'Commissioned Platoon Pioneer · 7 BNCC Bn Affiliation',
    honorOrAchievementBn: 'কমিশন্ড প্লাটুন অগ্রদূত · ৭ বিএনসিসি ব্যাটালিয়ন অধিভুক্তি',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    serviceYears: 'Alumnus Veteran',
    serviceYearsBn: 'সাবেক বর্ষীয়ান ক্যাডেট',
    isFeatured: false,
  },
  {
    id: 'mahdi-al-amin',
    name: 'Cadet Lance Corporal Mahdi Al-Amin',
    nameBn: 'ক্যাডেট ল্যান্স কর্পোরাল মাহদী আল-আমিন',
    rank: 'Cadet Lance Corporal (C/LCPL)',
    rankBn: 'ক্যাডেট ল্যান্স কর্পোরাল (সি/এলসিপিএল)',
    department: 'Software Engineering',
    departmentBn: 'সফটওয়্যার ইঞ্জিনিয়ারিং',
    batch: '56th Batch',
    batchBn: '৫৬তম ব্যাচ',
    intake: 'Intake 2025–26',
    intakeBn: 'ইনটেক ২০২৫–২৬',
    category: 'Intake 2025–26',
    categoryBn: 'ইনটেক ২০২৫–২৬',
    quote:
      'Balancing heavy software engineering sprint deadlines with two weekly morning drills taught me ruthless time prioritization. Volunteering during the Sylhet flood relief mission alongside Bangladesh Army personnel showed me what true selfless service looks like.',
    quoteBn:
      'সফটওয়্যার ইঞ্জিনিয়ারিংয়ের প্রকল্পের পাশাপাশি সপ্তাহে দুদিন সকালের ড্রিল আমাকে সময়ের সুনির্দিষ্ট ব্যবহার শিখিয়েছে। সিলেট বন্যা ত্রাণে বাংলাদেশ সেনাবাহিনীর পাশে স্বেচ্ছাসেবী হিসেবে কাজ করে আমি নিঃস্বার্থ সেবার প্রকৃত রূপ দেখেছি।',
    keyTakeaway: 'Mastered time management and executed high-stakes disaster relief.',
    keyTakeawayBn: 'সময় ব্যবস্থাপনায় দক্ষতা এবং দুর্যোগকালীন মানবিক দায়িত্ব পালন।',
    honorOrAchievement: 'Sylhet Sector Flood Relief Voluntary Commendation 2025',
    honorOrAchievementBn: 'সিলেট সেক্টর বন্যা ত্রাণ স্বেচ্ছাসেবা প্রশংসা ২০২৫',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    serviceYears: '2025 – Present',
    serviceYearsBn: '২০২৫ – বর্তমান',
    isFeatured: false,
  },
  {
    id: 'anika-tahsin',
    name: 'Cadet Anika Tahsin',
    nameBn: 'ক্যাডেট আনিকা তাহসিন',
    rank: 'Cadet (Section 2 Recruit)',
    rankBn: 'ক্যাডেট (সেকশন ২ রিক্রুট)',
    department: 'Department of Law',
    departmentBn: 'আইন বিভাগ',
    batch: '57th Batch',
    batchBn: '৫৭তম ব্যাচ',
    intake: 'Intake 2025–26',
    intakeBn: 'ইনটেক ২০২৫–২৬',
    category: 'Female Cadets Wing',
    categoryBn: 'ছাত্রী ক্যাডেট উইং',
    quote:
      'I joined wondering if I could endure the physical fitness drills. Within three months, I progressed from struggling with 1 km runs to completing a 5 km tactical march with my squad cheering me on every step of the way.',
    quoteBn:
      'শুরুতে ভেবেছিলাম আমি হয়তো কঠিন শারীরিক ড্রিল সহ্য করতে পারব না। কিন্তু তিন মাসের মধ্যে ১ কিমি দৌড়াতে হিমশিম খাওয়া থেকে পুরো স্কোয়াডের সাথে ৫ কিমি কৌশলগত মার্চ সম্পন্ন করতে পেরেছি।',
    keyTakeaway: 'Unmatched platoon camaraderie and physical endurance leap.',
    keyTakeawayBn: 'অতুলনীয় সহযোদ্ধা সৌহার্দ্য এবং শারীরিক সক্ষমতার উল্লেখযোগ্য অগ্রগতি।',
    honorOrAchievement: 'Marksman Qualification · 0.22 Target Practice',
    honorOrAchievementBn: 'মার্কসম্যান যোগ্যতা · ০.২২ রাইফেল টার্গেট প্র্যাকটিস',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    serviceYears: '2025 – Present',
    serviceYearsBn: '২০২৫ – বর্তমান',
    isFeatured: false,
  },
  {
    id: 'rayhan-ahmed',
    name: 'Cadet Rayhan Ahmed',
    nameBn: 'ক্যাডেট রায়হান আহমেদ',
    rank: 'Cadet Corporal (C/CPL)',
    rankBn: 'ক্যাডেট কর্পোরাল (সি/কর্পোরাল)',
    department: 'Electrical & Electronic Engineering',
    departmentBn: 'ইলেকট্রিক্যাল অ্যান্ড ইলেকট্রনিক ইঞ্জিনিয়ারিং',
    batch: '55th Batch',
    batchBn: '৫৫তম ব্যাচ',
    intake: 'Intake 2024–25',
    intakeBn: 'ইনটেক ২০২৪–২৫',
    category: 'Senior NCOs',
    categoryBn: 'সিনিয়র এনসিও',
    quote:
      'The military ethos "জ্ঞান, শৃঙ্খলা, স্বেচ্ছাসেবা" (Knowledge, Discipline, Voluntary Service) isn’t just inscribed on a crest—it becomes your personal operating code. The bond inside the squad barracks is a brotherhood unlike anything in normal university life.',
    quoteBn:
      'সামরিক মূলমন্ত্র "জ্ঞান, শৃঙ্খলা, স্বেচ্ছাসেবা" কেবল মনোগ্রামেই সীমাবদ্ধ নয়—এটি জীবনের অপরিহার্য নীতিতে পরিণত হয়। প্লাটুনের সাথীদের মধ্যকার ভ্রাতৃত্ববোধ সাধারণ বিশ্ববিদ্যালয় জীবনের অন্য যেকোনো অভিজ্ঞতার চেয়ে অনন্য।',
    keyTakeaway: 'Ingrained military ethos as a lifelong operating standard.',
    keyTakeawayBn: 'সামরিক নীতিবোধকে জীবনের স্থায়ী আদর্শ হিসেবে গ্রহণ।',
    honorOrAchievement: 'National Day Parade Platoon Representative · Mainamati Regiment',
    honorOrAchievementBn: 'জাতীয় দিবস প্যারেড প্লাটুন প্রতিনিধি · ময়নামতি রেজিমেন্ট',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    serviceYears: '2024 – Present',
    serviceYearsBn: '২০২৪ – বর্তমান',
    isFeatured: false,
  },
];

