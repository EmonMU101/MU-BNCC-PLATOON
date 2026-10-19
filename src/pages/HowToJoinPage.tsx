import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  FileText,
  UserCheck,
  Activity,
  Award,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  Info,
  Calendar,
} from 'lucide-react';
import { ELIGIBILITY_CRITERIA, FAQ_DATA } from '../data/siteData';
import { useLanguage } from '../context/LanguageContext';
import { SEOHead } from '../components/SEOHead';
import { JoinProcessStepper } from '../components/JoinProcessStepper';

interface HowToJoinPageProps {
  onOpenApply: () => void;
}

export const HowToJoinPage: React.FC<HowToJoinPageProps> = ({ onOpenApply }) => {
  const { t, isBn } = useLanguage();
  // Eligibility checklist state (default some unchecked so user interacts)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    enrollment: true,
    cgpa: true,
    physical: false,
    age: true,
    attendance: false,
  });

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalCriteria = ELIGIBILITY_CRITERIA.length;
  const metCount = Object.values(checkedItems).filter(Boolean).length;
  const isFullyEligible = metCount === totalCriteria;

  const steps = [
    {
      step: '01',
      title: isBn ? 'যোগ্যতা যাচাইকরণ' : 'Eligibility Verification',
      desc: isBn
        ? 'মেট্রোপলিটন ইউনিভার্সিটির নিয়মিত শিক্ষার্থী হওয়া, ন্যূনতম সিজিপিএ (২.৫০+), উচ্চতার মাপকাঠি এবং শারীরিক সুস্থতা নিশ্চিত করুন।'
        : 'Verify that you meet Metropolitan University enrollment criteria, minimum CGPA (2.50+), height benchmarks, and medical fitness.',
      icon: UserCheck,
      details: isBn
        ? 'আবেদনপত্র জমা দেওয়ার পূর্বে নিচের ইন্টারঅ্যাকটিভ চেকার ব্যবহার করে যাচাই করুন।'
        : 'Check requirements using our interactive widget below before lodging your application.',
    },
    {
      step: '02',
      title: isBn ? 'অনলাইন ডসিয়ার / ফরম পূরণ' : 'Online Dossier Submission',
      desc: isBn
        ? 'শিক্ষার্থী আইডি, বিভাগ, রক্তের গ্রুপ ও বিএনসিসিতে যোগদানের লক্ষ্য উল্লেখ করে অফিসিয়াল নিবন্ধন ফরম পূরণ করুন।'
        : 'Complete the official online registration form with student credentials, department, blood group, and motivation statement.',
      icon: FileText,
      details: isBn
        ? 'ফরম জমা দিলে সাথে সাথে ইউনিক আবেদন রেফারেন্স আইডি (যেমন: MU-BNCC-2025-XXXX) পাবেন।'
        : 'You will receive a unique Application Reference ID (e.g. MU-BNCC-2025-XXXX) immediately.',
    },
    {
      step: '03',
      title: isBn ? 'শারীরিক পরীক্ষা ও ভাইভা' : 'Physical Screening & Viva',
      desc: isBn
        ? 'শারীরিক সক্ষমতা পরীক্ষা (১.৬ কিমি দৌড়, পুশ-আপ) ও নির্বাচন বোর্ড কর্তৃক মৌখিক পরীক্ষায় অংশ নিন।'
        : 'Attend physical endurance trials (1.6 km run, push-ups, chin-ups) followed by a personal interview by the Selection Board.',
      icon: Activity,
      details: isBn
        ? 'বিশ্ববিদ্যালয় কেন্দ্রীয় স্পোর্টস গ্রাউন্ডে অনুষ্ঠিত হবে। স্পোর্টস পোশাক ও মূল আইডি সাথে রাখুন।'
        : 'Held at the Metropolitan University Sports Complex. Bring sports attire and your original Student ID.',
    },
    {
      step: '04',
      title: isBn ? 'শপথ গ্রহণ ও রিক্রুট ড্রিল' : 'Induction & Recruit Training',
      desc: isBn
        ? 'নির্বাচিত ক্যাডেটরা প্লাটুনের শপথ গ্রহণ করবেন, সামরিক পোশাকের অনুষঙ্গ পাবেন এবং ৩ মাসের বুনিয়াদি ড্রিল সম্পন্ন করবেন।'
        : 'Shortlisted candidates take the Cadet Oath of Allegiance, receive platoon accoutrements, and enter 3 months of recruit drill.',
      icon: Award,
      details: isBn
        ? 'প্রতি রবিবার ও বুধবার সকাল ০৬:৪৫ মিনিটে নিয়মিত প্যারেড ও পরিশেষে সম্মানসূচক ব্যাজ প্রদান।'
        : 'Weekly parades on Sunday & Wednesday mornings (06:45 AM) leading to the formal badge-pinning parade.',
    },
  ];

  return (
    <div>
      <SEOHead
        title="How to Join | Cadet Recruitment & Eligibility Guide"
        titleBn="যোগদানের নিয়মাবলী | ক্যাডেট নিয়োগ ও যোগ্যতা নির্দেশিকা"
        description="Join Metropolitan University BNCC Platoon Intake 2025-2026. Review physical standards, minimum CGPA, 4-stage recruitment roadmap, and apply online."
        descriptionBn="এমইউ বিএনসিসি প্লাটুনে ভর্তির যোগ্যতা, উচ্চতা ও স্বাস্থ্যগত মাপকাঠি, ৪ ধাপের নিয়োগ রোডম্যাপ ও অনলাইন আবেদন প্রক্রিয়া।"
        path="/how-to-join"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How to Join Metropolitan University BNCC Platoon',
          description: 'A 4-stage roadmap to apply, undergo physical screening, and get inducted into MU BNCC Platoon.',
          step: [
            {
              '@type': 'HowToStep',
              name: 'Eligibility Verification',
              text: 'Check university enrollment, minimum 2.50 CGPA, height and medical benchmarks.',
            },
            {
              '@type': 'HowToStep',
              name: 'Online Dossier Submission',
              text: 'Complete the official registration form to obtain a unique application reference ID.',
            },
            {
              '@type': 'HowToStep',
              name: 'Physical Screening & Viva',
              text: 'Complete 1.6 km endurance trials and attend the Selection Board interview.',
            },
            {
              '@type': 'HowToStep',
              name: 'Induction & Recruit Training',
              text: 'Take the Cadet Oath and complete 3 months of recruit drill parade training.',
            },
          ],
        }}
      />

      {/* Header Banner */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-100 to-white dark:from-slate-900 dark:to-slate-950 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-50 dark:bg-red-950/40 px-3.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">
            <span>Intake 2025–2026</span>
            <span>·</span>
            <span>Sylhet Sector Battalion</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
            {t('join.title')}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('join.subtitle')}
          </p>

          <div className="pt-2">
            <button
              onClick={onOpenApply}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 hover:bg-red-800 text-white px-8 py-3 text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-red-700/20 transition-all active:scale-95"
            >
              <span>{t('join.applyButton')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16 sm:space-y-20">
        {/* Interactive Join Process Cycle Progress Stepper */}
        <JoinProcessStepper onOpenApply={onOpenApply} />

        {/* Step-by-Step Sequence */}
        <section className="space-y-8">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
              {isBn ? 'নিয়োগ ধারাবাহিকতা' : 'Recruitment Sequence'}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-slate-900 dark:text-white">
              {isBn ? '৪ ধাপের ভর্তি ও প্রশিক্ষণ রোডম্যাপ' : 'The 4-Stage Induction Roadmap'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-red-500/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xl font-black text-slate-300 dark:text-slate-700">
                        {s.step}
                      </span>
                      <div className="rounded-lg p-2 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    <h3 className="font-heading text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                      {s.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                    {s.details}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Interactive Eligibility Checker Widget */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
                {isBn ? 'স্ব-মূল্যায়ন টুল' : 'Self-Assessment Tool'}
              </span>
              <h3 className="font-heading text-2xl font-bold uppercase text-slate-900 dark:text-white">
                {isBn ? 'ইন্টারঅ্যাকটিভ যোগ্যতা যাচাইকারী' : 'Interactive Eligibility Checker'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {isBn
                  ? 'আপনার যোগ্যতা বিএনসিসি প্লাটুন বিধিমালার সাথে সামঞ্জস্যপূর্ণ কিনা তা যাচাই করতে প্রতিটি শর্ত টগল করুন।'
                  : 'Toggle each recruitment benchmark to verify whether your credentials align with BNCC Platoon regulations.'}
              </p>
            </div>

            {/* Score & Verdict Pill */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shrink-0 text-center sm:text-right">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                {isBn ? 'যোগ্যতার স্থিতি' : 'Qualification Status'}
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-2 mt-1">
                <span className="font-heading text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {metCount} / {totalCriteria}
                </span>
                {isFullyEligible ? (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isBn ? 'যোগ্য' : 'Eligible'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-100 dark:bg-amber-950 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                    {isBn ? 'অপেক্ষমাণ' : 'Pending'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-3">
            {ELIGIBILITY_CRITERIA.map((crit) => {
              const isChecked = checkedItems[crit.id] || false;
              let label = crit.label;
              let requirement = crit.requirement;
              let detail = crit.detail;

              if (isBn) {
                if (crit.id === 'enrollment') {
                  label = 'বিশ্ববিদ্যালয়ে ভর্তি';
                  requirement = 'মেট্রোপলিটন ইউনিভার্সিটির নিয়মিত স্নাতক বা স্নাতকোত্তর শিক্ষার্থী হতে হবে।';
                  detail = 'সকল বিভাগ (সিএসই, ইইই, বিবিএ, ইংরেজি, আইন, অর্থনীতি ইত্যাদি) আবেদনের যোগ্য।';
                } else if (crit.id === 'cgpa') {
                  label = 'একাডেমিক ফলাফল';
                  requirement = 'ন্যূনতম সিজিপিএ ২.৫০ (বা ১ম সেমিস্টারের ক্ষেত্রে সমমানের ফলাফল)।';
                  detail = 'প্রশিক্ষণের পাশাপাশি সন্তোষজনক একাডেমিক অগ্রগতি বজায় রাখা আবশ্যক।';
                } else if (crit.id === 'physical') {
                  label = 'শারীরিক ও স্বাস্থ্যগত সক্ষমতা';
                  requirement = 'ছাত্র: ন্যূনতম ৫ ফুট ৪ ইঞ্চি (১৬২.৫ সেমি)। ছাত্রী: ন্যূনতম ৫ ফুট ০ ইঞ্চি (১৫২.৪ সেমি)।';
                  detail = 'স্বাভাবিক দৃষ্টিশক্তি, সুস্থ কার্ডিওভাসকুলার স্বাস্থ্য এবং কোনো দীর্ঘস্থায়ী অসুস্থতা মুক্ত।';
                } else if (crit.id === 'age') {
                  label = 'বয়সসীমা';
                  requirement = 'আবেদনের সময় বয়স ১৮ থেকে ২৪ বছরের মধ্যে হতে হবে।';
                  detail = 'যাচাইয়ের জন্য জাতীয় পরিচয়পত্র (এনআইডি) বা জন্ম নিবন্ধন সনদ আবশ্যক।';
                } else if (crit.id === 'attendance') {
                  label = 'প্যারেড উপস্থিতি ও নিষ্ঠা';
                  requirement = 'সাপ্তাহিক সকালের ড্রিল (০৬:৪৫) এবং বিশেষ দিবসের কার্যক্রমে অংশগ্রহণের মানসিকতা।';
                  detail = 'আত্মশৃঙ্খলা, সময়ানুবর্তিতা এবং প্লাটুনের মূলমন্ত্রে অঙ্গীকারাবদ্ধ থাকা প্রয়োজন।';
                }
              }

              return (
                <div
                  key={crit.id}
                  onClick={() => toggleCheck(crit.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all flex items-start gap-4 select-none ${
                    isChecked
                      ? 'border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20 dark:border-emerald-800/60'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isChecked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {label}: {requirement}
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-slate-400">
                        {isChecked
                          ? (isBn ? 'শর্ত পূরণ হয়েছে' : 'Requirement Met')
                          : (isBn ? 'চেক করতে ক্লিক করুন' : 'Click to Check')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checker Result Outcome */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {isFullyEligible
                  ? (isBn ? 'যোগদানের জন্য প্রস্তুত! সকল ভর্তির শর্ত পূরণ হয়েছে।' : 'Ready to Join! All Recruitment Requirements Satisfied')
                  : (isBn ? `আপনার প্রস্তুতি নিশ্চিত করতে সকল ${totalCriteria}টি শর্ত চেক করুন।` : `Select all ${totalCriteria} checkmarks to verify your recruitment readiness.`)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? 'অনলাইন আবেদনে ৩ মিনিটেরও কম সময় লাগে। প্রথম দিকের প্রার্থীরা অগ্রাধিকার স্লট পাবেন।'
                  : 'Online applications take less than 3 minutes. Early applicants receive preferred screening slot batches.'}
              </p>
            </div>

            <button
              onClick={onOpenApply}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-red-700 hover:bg-red-800 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm shrink-0"
            >
              <span>{isBn ? 'আবেদনে অগ্রসর হোন' : 'Proceed to Application'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Recruitment FAQ */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
              {isBn ? 'সাধারণ জিজ্ঞাসা' : 'Frequently Asked Questions'}
            </span>
            <h2 className="font-heading text-2xl font-bold uppercase text-slate-900 dark:text-white">
              {isBn ? 'নিয়োগ সংক্রান্ত নির্দেশনা ও সাধারণ প্রশ্নাবলী' : 'Recruitment Directives & Common Inquiries'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQ_DATA.map((faq, i) => {
              let q = faq.question;
              let a = faq.answer;
              if (isBn) {
                if (i === 0) {
                  q = 'ছাত্রীরা কি এমইউ বিএনসিসিতে যোগ দিতে পারবে?';
                  a = 'অবশ্যই হ্যাঁ! মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি মহিলা ক্যাডেটদের সমান সুযোগ ও উৎসাহ প্রদান করে। আমাদের রয়েছে ডেডিকেটেড ফিমেল ক্যাডেট প্লাটুনের দল ও নেতৃত্ব।';
                } else if (i === 1) {
                  q = 'বিএনসিসি করলে কি বিশ্ববিদ্যালয়ের পড়াশোনা বা পরীক্ষায় সমস্যা হবে?';
                  a = 'না। ড্রিল প্যারেড সকাল ০৬:৪৫ থেকে ০৮:৩০ পর্যন্ত অনুষ্ঠিত হয়, যা নিয়মিত ক্লাসের আগেই শেষ হয়। পরীক্ষার সময় প্যারেড স্থগিত বা বিশেষ ছাড় দেওয়া হয়।';
                } else if (i === 2) {
                  q = 'যোগদানের জন্য কোনো ভর্তি ফি বা খরচ আছে কি?';
                  a = 'না, কোনো আবেদন ফি বা সদস্য ফি নেই। ক্যাডেটদের ড্রিল ইউনিফর্ম, বেরেট ক্যাপ ও ব্যাজ সরকারি ও বিশ্ববিদ্যালয় ব্যবস্থাপনায় বরাদ্দ করা হয়।';
                } else if (i === 3) {
                  q = 'বিএনসিসি কীভাবে আইএসএসবি ও সশস্ত্র বাহিনী নিয়োগে সহায়তা করে?';
                  a = 'ক্যাডেটরা সরাসরি সামরিক শারীরিক প্রস্তুতি, অবস্ট্যাকল কোর্স ও নেতৃত্ব বিকাশের প্রশিক্ষণ পান এবং প্রতিরক্ষা কোটায় অগ্রাধিকার উপভোগ করেন।';
                }
              }

              return (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2 shadow-xs"
                >
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {q}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                    {a}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
