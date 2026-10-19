import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  Search,
  HelpCircle,
  Shield,
  Clock,
  Compass,
  Award,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface FaqItem {
  id: string;
  category: 'membership' | 'training' | 'activities' | 'career';
  questionEn: string;
  questionBn: string;
  answerEn: string;
  answerBn: string;
  highlightsEn?: string[];
  highlightsBn?: string[];
}

export const FAQ_DATA: FaqItem[] = [
  {
    id: 'eligibility',
    category: 'membership',
    questionEn: 'Who is eligible to apply for MU BNCC Platoon?',
    questionBn: 'কারা মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি প্লাটুনে আবেদনের যোগ্য?',
    answerEn:
      'All regular undergraduate students of Metropolitan University (both male and female wings) enrolled in their 1st, 2nd, or 3rd semester are eligible to apply. Applicants must possess good physical fitness, meet the minimum height requirement (5 ft 4 in for male, 5 ft 0 in for female), and maintain a clean academic and disciplinary record.',
    answerBn:
      'মেট্রোপলিটন ইউনিভার্সিটির ১ম, ২য় বা ৩য় সেমিস্টারের যেকোনো নিয়মিত স্নাতক শিক্ষার্থী (ছাত্র ও ছাত্রী উভয়ের জন্য) আবেদনের যোগ্য। প্রার্থীদের সুস্বাস্থ্যের অধিকারী হতে হবে, ন্যূনতম শারীরিক উচ্চতা (ছাত্রদের জন্য ৫ ফুট ৪ ইঞ্চি, ছাত্রীদের জন্য ৫ ফুট) থাকতে হবে এবং বিশ্ববিদ্যালয়ে কোনো শৃঙ্খলাভঙ্গের রেকর্ড থাকা চলবে না।',
    highlightsEn: [
      'Open to 1st, 2nd, and 3rd semester undergraduate students',
      'Minimum height: 5\'4" (Male) · 5\'0" (Female)',
      'Valid Metropolitan University student registration required',
    ],
    highlightsBn: [
      '১ম, ২য় ও ৩য় সেমিস্টারের স্নাতক শিক্ষার্থীদের জন্য উন্মুক্ত',
      'ন্যূনতম উচ্চতা: ৫ ফুট ৪ ইঞ্চি (ছাত্র) · ৫ ফুট ০ ইঞ্চি (ছাত্রী)',
      'মেট্রোপলিটন ইউনিভার্সিটির বৈধ শিক্ষার্থী পরিচয়পত্র আবশ্যক',
    ],
  },
  {
    id: 'commitment-academics',
    category: 'training',
    questionEn: 'What is the weekly training commitment? Will it interfere with my studies?',
    questionBn: 'সাপ্তাহিক প্রশিক্ষণের সময়সূচি কেমন? এটি কি বিশ্ববিদ্যালয় পড়াশোনায় ব্যাঘাত ঘটাবে?',
    answerEn:
      'Platoon parades are scheduled twice weekly (typically Sunday and Wednesday mornings from 06:45 AM to 08:30 AM) at the university central sports ground before regular lecture schedules begin. Training is structured to complement university studies by instilling focus, time management, and physical endurance rather than conflicting with exams or class commitments.',
    answerBn:
      'প্লাটুনের নিয়মিত প্যারেড সপ্তাহে দুদিন (সাধারণত রবিবার ও বুধবার সকাল ০৬:৪৫ থেকে ০৮:৩০ পর্যন্ত) বিশ্ববিদ্যালয়ের কেন্দ্রীয় খেলার মাঠে অনুষ্ঠিত হয়, যা নিয়মিত ক্লাসের আগেই শেষ হয়। এই সময়সূচি এমনভাবে সাজানো হয়েছে যাতে শিক্ষার্থীদের পরীক্ষা বা ক্লাসের ক্ষতি না করে বরং সময়ানুবর্তিতা এবং মানসিক একাগ্রতা বৃদ্ধি পায়।',
    highlightsEn: [
      'Two morning parade sessions per week (06:45 AM - 08:30 AM)',
      'Completed before university lecture blocks start',
      'Exam leave and academic attendance coordination provided',
    ],
    highlightsBn: [
      'সপ্তাহে ২টি সকালের প্যারেড সেশন (সকাল ০৬:৪৫ - ০৮:৩০)',
      'বিশ্ববিদ্যালয়ের মূল ক্লাস শুরুর আগেই সমাপ্ত হয়',
      'পরীক্ষার সময় বিশেষ সমন্বয় ও প্রস্তুতি ছুটি প্রদান করা হয়',
    ],
  },
  {
    id: 'female-cadets',
    category: 'membership',
    questionEn: 'Are female students eligible to join the platoon?',
    questionBn: 'ছাত্রীরা কি এই প্লাটুনে যোগদানের যোগ্য?',
    answerEn:
      'Yes, absolutely. The MU BNCC Platoon is a combined unit with an active Female Wing led by female cadet non-commissioned officers (NCOs). Female cadets receive identical military training in drill, rifle marksmanship, unarmed combat (UAC), map reading, and disaster relief, and regularly participate in national parades and camps.',
    answerBn:
      'হ্যাঁ, সম্পূর্ণভাবে। মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি প্লাটুন একটি সম্মিলিত প্লাটুন যাতে ছাত্রীদের জন্য একটি অত্যন্ত সক্রিয় ফিমেল উইং রয়েছে। নারী ক্যাডেটরা ড্রিল, রাইফেল ফায়ারিং, আনআর্মড কম্ব্যাট (UAC), ম্যাপ রিডিং এবং দুর্যোগ ব্যবস্থাপনায় সমান প্রশিক্ষণ পান এবং জাতীয় কুচকাওয়াজ ও ক্যাম্পে অংশ নেন।',
    highlightsEn: [
      'Dedicated Female Wing led by female Cadet NCOs',
      'Equal access to all firing, tactical, and leadership camps',
      'Specialized self-defense & unarmed combat (UAC) modules',
    ],
    highlightsBn: [
      'নারী ক্যাডেট এনসিওদের নেতৃত্বে স্বতন্ত্র ফিমেল উইং',
      'সব ধরনের ফায়ারিং, ফিল্ড ও নেতৃত্ব ক্যাম্পে সমান সুযোগ',
      'আত্মরক্ষা ও বিশেষায়িত আনআর্মড কম্ব্যাট (UAC) প্রশিক্ষণ',
    ],
  },
  {
    id: 'uniform-equipment',
    category: 'activities',
    questionEn: 'Is the military uniform and tactical equipment provided to cadets?',
    questionBn: 'ক্যাডেটদের কি সামরিক পোশাক এবং সরঞ্জাম সরবরাহ করা হয়?',
    answerEn:
      'Yes. Official uniform kit items—including the Olive Green Working Dress, DMS Boots, Beret Cap with BNCC Monogram, Web Belt, and Rank Badges—are issued through BNCC Headquarters and Platoon Command upon successful completion of recruit screening and formal oath of allegiance.',
    answerBn:
      'হ্যাঁ। রিক্রুট প্রাথমিক যাচাই এবং আনুগত্যের শপথ গ্রহণের পর বিএনসিসি সদর দপ্তর ও প্লাটুনের মাধ্যমে ক্যাডেটদের ওয়ার্কিং ড্রেস (অলিভ গ্রিন), ডিএমএস বুট, বিএনসিসি মনোগ্রামযুক্ত ব্যারেট ক্যাপ, ওয়েব বেল্ট এবং পদমর্যাদা ব্যাজ সরবরাহ করা হয়।',
    highlightsEn: [
      'Official BNCC Working Dress & ceremonial uniforms provided',
      'DMS boots, berets, crest badges, and field web gear included',
      'Zero equipment purchase cost for enrolled cadets',
    ],
    highlightsBn: [
      'অফিসিয়াল বিএনসিসি ওয়ার্কিং ড্রেস ও প্যারেড পোশাক প্রদান',
      'ডিএমএস বুট, ব্যারেট, মনোগ্রাম ব্যাজ ও ফিল্ড গিয়ার অন্তর্ভুক্ত',
      'নিবন্ধিত ক্যাডেটদের জন্য কোনো সরঞ্জাম ক্রয় খরচ নেই',
    ],
  },
  {
    id: 'training-activities',
    category: 'activities',
    questionEn: 'What core activities and tactical subjects do cadets learn?',
    questionBn: 'ক্যাডেটরা মূলত কী ধরনের কার্যক্রম ও সামরিক বিষয়াবলি শেখে?',
    answerEn:
      'Cadets undergo comprehensive military training covering squad and ceremonial drill, weapons handling and marksmanship (.22 & 7.62mm rifles), prismatic compass navigation, topographical map reading, field craft, first aid and crisis evacuation, university quarter guard ceremonial duties, and civic voluntary disaster response.',
    answerBn:
      'ক্যাডেটরা স্কোয়াড ও সেরিমোনিয়াল ড্রিল, অস্ত্র পরিচালনা ও ফায়ারিং (.২২ ও ৭.৬২ মিমি রাইফেল), প্রিজম্যাটিক কম্পাস ও ম্যাপ রিডিং, ফিল্ড ক্রাফট, প্রাথমিক চিকিৎসা ও দুর্যোগ উদ্ধার, বিশ্ববিদ্যালয়ের ভিআইপি গার্ড অফ অনার এবং সামাজিক স্বেচ্ছাসেবায় সার্বিক প্রশিক্ষণ লাভ করে।',
    highlightsEn: [
      'Military squad drill & ceremonial guard of honor',
      'Live weapons classification & rifle marksmanship',
      'Prismatic compass navigation & field craft tactics',
      'Civic disaster relief & emergency search-and-rescue',
    ],
    highlightsBn: [
      'সামরিক স্কোয়াড ড্রিল ও গার্ড অফ অনার প্যারেড',
      'লাইভ রাইফেল মার্কসম্যানশিপ ও ফায়ারিং রেঞ্জ অনুশীলন',
      'প্রিজম্যাটিক কম্পাস নেভিগেশন ও ফিল্ড ক্রাফট কৌশল',
      'নাগরিক দুর্যোগ মোকাবিলা ও জরুরি উদ্ধার কার্যক্রম',
    ],
  },
  {
    id: 'camps-deployments',
    category: 'activities',
    questionEn: 'What training camps and external deployment opportunities are available?',
    questionBn: 'ক্যাডেটদের জন্য কী ধরনের ক্যাম্প ও বহিঃনিয়োগের সুযোগ রয়েছে?',
    answerEn:
      'Active cadets participate in the Battalion Training Camp (BTC), Moinamati Regiment Annual Training Camp (ATC), and the National Central Training Camp (CTC) in Savar. High-performing cadets are selected for the prestigious Youth Exchange Program (YEP), travelling abroad as Bangladesh youth ambassadors to India, Sri Lanka, the Maldives, and Nepal.',
    answerBn:
      'সক্রিয় ক্যাডেটরা ৭ ব্যাটালিয়ন ট্রেনিং ক্যাম্প (BTC), ময়নামতি রেজিমেন্ট অ্যানুয়াল ট্রেনিং ক্যাম্প (ATC) এবং সাভারে অনুষ্ঠিত সেন্ট্রাল ট্রেনিং ক্যাম্পে (CTC) অংশ নেন। শ্রেষ্ঠ ক্যাডেটরা মর্যাদাপূর্ণ যুব বিনিময় প্রোগ্রামের (YEP) মাধ্যমে ভারত, শ্রীলঙ্কা, মালদ্বীপ ও নেপালে বাংলাদেশের যুব রাষ্ট্রদূত হিসেবে সফরের সুযোগ পান।',
    highlightsEn: [
      'Annual Battalion & Regimental Training Camps (BTC & ATC)',
      'National Central Camp (CTC) with inter-regiment competitions',
      'International Youth Exchange Program (YEP) overseas visits',
    ],
    highlightsBn: [
      'বার্ষিক ব্যাটালিয়ন ও রেজিমেন্টাল ট্রেনিং ক্যাম্প (BTC ও ATC)',
      'আন্তঃরেজিমেন্ট প্রতিযোগিতাসহ জাতীয় সেন্ট্রাল ট্রেনিং ক্যাম্প',
      'আন্তর্জাতিক যুব বিনিময় প্রোগ্রামের (YEP) মাধ্যমে বিদেশ সফর',
    ],
  },
  {
    id: 'career-benefits',
    category: 'career',
    questionEn: 'How does BNCC membership benefit military and civilian careers?',
    questionBn: 'বিএনসিসি সদস্যপদ কীভাবে সামরিক ও বেসামরিক কর্মজীবনে সহায়তা করে?',
    answerEn:
      'BNCC cadets gain significant advantages in Bangladesh Army, Navy, and Air Force recruitment, with special preference and direct ISSB eligibility for certain commission branches. In civilian careers, public service (BCS) boards and corporate employers value BNCC veterans for their proven leadership, stress resilience, punctuality, and team discipline.',
    answerBn:
      'বাংলাদেশ সেনা, নৌ ও বিমান বাহিনীতে অফিসার ক্যাডেট নির্বাচনে বিএনসিসি ক্যাডেটরা বিশেষ অগ্রাধিকার এবং কিছু ক্ষেত্রে সরাসরি আইএসএসবি (ISSB) সুবিধা পান। এছাড়া বিসিএস ভাইভা এবং শীর্ষস্থানীয় করপোরেট চাকুরিক্ষেত্রেও ক্যাডেটদের নেতৃত্ব, সততা, মানসিক দৃঢ়তা এবং শৃঙ্খলার কারণে বিশেষ মূল্যায়ন করা হয়।',
    highlightsEn: [
      'Direct ISSB privileges & Armed Forces recruitment preference',
      'Institutional leadership credentials signed by Armed Forces officers',
      'Strong advantage in BCS civil service and multinational corporate hiring',
    ],
    highlightsBn: [
      'সরাসরি আইএসএসবি সুবিধা ও সশস্ত্র বাহিনী নিয়োগে বিশেষ অগ্রাধিকার',
      'সামরিক কর্মকর্তাদের স্বাক্ষরিত নেতৃত্ব ও ক্যাম্প প্রশংসাপত্র',
      'বিসিএস প্রশাসন ও শীর্ষ বহুজাতিক কোম্পানিতে নিয়োগে বিশেষ সুবিধা',
    ],
  },
  {
    id: 'costs-fees',
    category: 'membership',
    questionEn: 'Is there any registration fee or financial cost involved?',
    questionBn: 'ভর্তি হতে বা ক্যাডেট হিসেবে থাকতে কোনো প্রকার ফি বা খরচ দিতে হয়?',
    answerEn:
      'No. BNCC enrollment and participation are completely free of charge. The Ministry of Defence, Government of Bangladesh, and Metropolitan University fully sponsor training operations, parade uniforms, equipment, camp accommodations, travel logistics, and daily food rations during deployments.',
    answerBn:
      'না। বিএনসিসিতে যোগদানে কোনো প্রকার আবেদন ফি, রেজিস্ট্রেশন ফি বা মাসিক চাঁদা নেই। বাংলাদেশ সরকারের প্রতিরক্ষা মন্ত্রণালয় এবং মেট্রোপলিটন ইউনিভার্সিটি যৌথভাবে ক্যাডেটদের প্রশিক্ষণ, প্যারেড ড্রেস, ক্যাম্পিং খরচ, যাতায়াত এবং দৈনিক খাদ্য ভাতা বহন করে থাকে।',
    highlightsEn: [
      '100% free enrollment · No application or subscription fee',
      'Camp accommodations, travel, and food allowances provided',
      'Jointly sponsored by Ministry of Defence and Metropolitan University',
    ],
    highlightsBn: [
      'সম্পূর্ণ বিনামূল্যে যোগদান · কোনো আবেদন বা সাবস্ক্রিপশন ফি নেই',
      'ক্যাম্প আবাসন, যাতায়াত ও দৈনিক খাদ্য ভাতা সরকার কর্তৃক প্রদত্ত',
      'প্রতিরক্ষা মন্ত্রণালয় ও বিশ্ববিদ্যালয়ের অর্থায়নে পরিচালিত',
    ],
  },
];

interface FaqAccordionProps {
  lang?: 'en' | 'bn';
  className?: string;
}

export const FaqAccordion: React.FC<FaqAccordionProps> = ({
  lang: propLang,
  className = '',
}) => {
  const { language: globalLang } = useLanguage();
  const lang = propLang || globalLang;
  const [openIds, setOpenIds] = useState<string[]>(['eligibility', 'commitment-academics']);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExpandAll = () => {
    if (openIds.length === filteredFaqs.length) {
      setOpenIds([]);
    } else {
      setOpenIds(filteredFaqs.map((f) => f.id));
    }
  };

  const categories = [
    { id: 'all', labelEn: 'All Questions', labelBn: 'সকল প্রশ্ন' },
    { id: 'membership', labelEn: 'Membership & Eligibility', labelBn: 'সদস্যপদ ও যোগ্যতা' },
    { id: 'training', labelEn: 'Training & Commitment', labelBn: 'প্রশিক্ষণ ও সময়' },
    { id: 'activities', labelEn: 'Platoon Activities & Camps', labelBn: 'কার্যক্রম ও ক্যাম্প' },
    { id: 'career', labelEn: 'Career & Benefits', labelBn: 'ক্যারিয়ার ও সুবিধাসমূহ' },
  ];

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.category === activeCategory;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        item.questionEn.toLowerCase().includes(q) ||
        item.questionBn.toLowerCase().includes(q) ||
        item.answerEn.toLowerCase().includes(q) ||
        item.answerBn.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-red-600 dark:text-red-400 block mb-1">
            {lang === 'en' ? 'Direct Cadet Inquiries' : 'ক্যাডেট সরাসরি প্রশ্নোত্তর'}
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-slate-900 dark:text-white">
            {lang === 'en'
              ? 'Frequently Asked Questions'
              : 'সাধারণ জিজ্ঞাসাসমূহ (FAQ)'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {lang === 'en'
              ? 'Everything you need to know about joining Metropolitan University BNCC Platoon, training routines, field camps, and military benefits.'
              : 'মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি প্লাটুনে যোগদান, প্যারেডের সময়সূচি, ক্যাম্পিং এবং সামরিক সুবিধাসমূহ সম্পর্কিত যাবতীয় তথ্য।'}
          </p>
        </div>

        {/* Search Input & Expand All Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExpandAll}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap"
          >
            {openIds.length === filteredFaqs.length
              ? lang === 'en'
                ? 'Collapse All'
                : 'সব বন্ধ করুন'
              : lang === 'en'
              ? 'Expand All'
              : 'সব খুলুন'}
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Interactive Filter Controls */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-red-700 dark:text-red-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {lang === 'en' ? cat.labelEn : cat.labelBn}
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'en' ? 'Search questions...' : 'প্রশ্ন খুঁজুন...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
      </div>

      {/* Accordion Questions List */}
      {filteredFaqs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center space-y-2">
          <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {lang === 'en'
              ? 'No questions matched your search query.'
              : 'আপনার অনুসন্ধানের সাথে কোনো প্রশ্ন মেলেনি।'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
          >
            {lang === 'en' ? 'Reset filters' : 'ফিল্টার রিসেট করুন'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            const question = lang === 'en' ? faq.questionEn : faq.questionBn;
            const answer = lang === 'en' ? faq.answerEn : faq.answerBn;
            const highlights = lang === 'en' ? faq.highlightsEn : faq.highlightsBn;

            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-900 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        isOpen
                          ? 'bg-red-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {faq.category === 'membership' && <Shield className="w-4 h-4" />}
                      {faq.category === 'training' && <Clock className="w-4 h-4" />}
                      {faq.category === 'activities' && <Compass className="w-4 h-4" />}
                      {faq.category === 'career' && <Award className="w-4 h-4" />}
                    </div>

                    <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {question}
                    </h3>
                  </div>

                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ${
                      isOpen
                        ? 'rotate-180 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Collapsible Answer Body */}
                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-150">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal pt-4">
                      {answer}
                    </p>

                    {/* Bullet Points Highlights */}
                    {highlights && highlights.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {highlights.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 font-medium"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FaqAccordion;
