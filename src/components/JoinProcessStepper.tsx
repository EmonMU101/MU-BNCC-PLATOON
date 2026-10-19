import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  FileText,
  Activity,
  Award,
  Calendar,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface JoinProcessStepperProps {
  onOpenApply?: () => void;
  className?: string;
}

export interface ApplicationStage {
  id: number;
  stageCode: string;
  titleEn: string;
  titleBn: string;
  badgeEn: string;
  badgeBn: string;
  descriptionEn: string;
  descriptionBn: string;
  durationEn: string;
  durationBn: string;
  status: 'completed' | 'active' | 'upcoming';
  icon: React.ElementType;
  keyChecklistEn: string[];
  keyChecklistBn: string[];
  actionLabelEn?: string;
  actionLabelBn?: string;
  preparationAdviceEn: string;
  preparationAdviceBn: string;
}

const APPLICATION_STAGES: ApplicationStage[] = [
  {
    id: 1,
    stageCode: 'STAGE-01',
    titleEn: 'Eligibility & Criteria Check',
    titleBn: 'যোগ্যতা ও মাপকাঠি যাচাই',
    badgeEn: 'Pre-requisite',
    badgeBn: 'প্রাথমিক শর্তাবলী',
    descriptionEn: 'Confirm regular university enrollment, minimum CGPA (2.50+), physical height benchmarks (5ft 4in for male, 5ft 0in for female), and medical fitness.',
    descriptionBn: 'নিয়মিত বিশ্ববিদ্যালয়ের শিক্ষার্থী হওয়া, ন্যূনতম সিজিপিএ ২.৫০, শারীরিক উচ্চতা এবং স্বাস্থ্যগত সুস্থতা নিশ্চিতকরণ।',
    durationEn: 'Open Throughout Intake Cycle',
    durationBn: 'ভর্তি চক্রজুড়ে উন্মুক্ত',
    status: 'completed',
    icon: UserCheck,
    keyChecklistEn: [
      'Regular undergraduate student of Metropolitan University (Semesters 1-3)',
      'Minimum cumulative GPA / CGPA of 2.50 out of 4.00',
      'Male height ≥ 5 ft 4 in (162.5 cm) | Female height ≥ 5 ft 0 in (152.4 cm)',
      'Clean academic and university disciplinary record',
    ],
    keyChecklistBn: [
      'মেট্রোপলিটন ইউনিভার্সিটির নিয়মিত স্নাতক শিক্ষার্থী (১ম থেকে ৩য় সেমিস্টার)',
      'ন্যূনতম সিজিপিএ ২.৫০ (৪.০০ এর স্কেলে)',
      'পুরুষ প্রার্থীর উচ্চতা ≥ ৫ ফুট ৪ ইঞ্চি | নারী প্রার্থীর উচ্চতা ≥ ৫ ফুট ০ ইঞ্চি',
      'উপাধ্যক্ষ ও প্রক্টোরিয়াল কমিটির সন্তোষজনক রিপোর্ট ও পরিষ্কার আচরণ',
    ],
    preparationAdviceEn: 'Verify your latest semester grade sheet and ensure medical fitness before submitting the official dossier.',
    preparationAdviceBn: 'আবেদন করার পূর্বে নিজের সেমিস্টার গ্রেড শিট ও শারীরিক সুস্থতা নিশ্চিত করে নিন।',
  },
  {
    id: 2,
    stageCode: 'STAGE-02',
    titleEn: 'Online Dossier Submission',
    titleBn: 'অনলাইন ডসিয়ার / ফরম পূরণ',
    badgeEn: 'Current Open Cycle',
    badgeBn: 'বর্তমান আবেদন পর্যায়',
    descriptionEn: 'Submit candidate credentials, emergency contacts, blood group, and motivation statement via the official MU BNCC registration form.',
    descriptionBn: 'শিক্ষার্থী আইডি, যোগাযোগের ঠিকানা, রক্তের গ্রুপ ও বিএনসিসিতে যোগদানের লক্ষ্য উল্লেখ করে অফিসিয়াল নিবন্ধন ফরম পূরণ।',
    durationEn: 'Active Now (Intake 2025-2026)',
    durationBn: 'বর্তমানে চলমান (ইনটেক ২০২৫-২০২৬)',
    status: 'active',
    icon: FileText,
    actionLabelEn: 'Fill Online Dossier Now',
    actionLabelBn: 'অনলাইন ডসিয়ার পূরণ করুন',
    keyChecklistEn: [
      'Valid Metropolitan University Student ID (e.g. 25071762)',
      'Academic Department & Verified Student Email Address',
      'Verified Blood Group & Emergency Contact Information',
      'Concise Statement of Purpose / Reason for joining BNCC',
    ],
    keyChecklistBn: [
      'বৈধ মেট্রোপলিটন ইউনিভার্সিটি শিক্ষার্থী আইডি',
      'একাডেমিক বিভাগ ও বিশ্ববিদ্যালয়ের অফিসিয়াল ইমেইল',
      'রক্তের গ্রুপ ও জরুরি যোগাযোগের অভিভাবকের ফোন নম্বর',
      'বিএনসিসিতে যোগদানের লক্ষ্য সংবলিত সংক্ষিপ্ত বিবরণ',
    ],
    preparationAdviceEn: 'Have your student ID and guardian contact details ready. Upon submission, an instant Application Tracking Reference ID is issued.',
    preparationAdviceBn: 'আইডি কার্ড ও যোগাযোগের তথ্য প্রস্তুত রাখুন। ফরম জমার সাথে সাথে একটি ট্র্যাকিং রেফারেন্স নম্বর পাবেন।',
  },
  {
    id: 3,
    stageCode: 'STAGE-03',
    titleEn: 'Physical Endurance & Viva Voce',
    titleBn: 'শারীরিক সক্ষমতা পরীক্ষা ও ভাইভা',
    badgeEn: 'Selection Board',
    badgeBn: 'বাছাই বোর্ড পর্যায়',
    descriptionEn: 'Participate in the 1.6 km stamina trial, push-ups, and the formal interview conducted by the Platoon Commander and Senior NCO Board.',
    descriptionBn: 'শারীরিক সক্ষমতা পরীক্ষা (১.৬ কিমি দৌড়, পুশ-আপ) এবং নির্বাচন বোর্ড কর্তৃক ব্যক্তিগত মৌখিক পরীক্ষায় অংশগ্রহণ।',
    durationEn: 'Scheduled 7-10 Days After Application Deadline',
    durationBn: 'আবেদন শেষ হওয়ার ৭-১০ দিন পর',
    status: 'upcoming',
    icon: Activity,
    keyChecklistEn: [
      'Physical trials: 1.6 km timed run, push-ups, sit-ups & obstacle clearance',
      'Proper sports attire (running shoes, track pants, sports T-shirt)',
      'Original Metropolitan University Student ID Card',
      'General knowledge & national awareness personal interview',
    ],
    keyChecklistBn: [
      '১.৬ কিমি দৌড়, পুশ-আপ, সিট-আপ ও শারীরিক ক্ষিপ্রতা পরীক্ষা',
      'উপযুক্ত স্পোর্টস পোশাক (রানিং জুতো ও ট্র্যাকস্যুট)',
      'মূল স্টুডেন্ট আইডি কার্ড সাথে রাখা আবশ্যক',
      'দেশপ্রেম, সাধারণ জ্ঞান ও নেতৃত্ব গুণাবলীর ওপর মৌখিক পরীক্ষা',
    ],
    preparationAdviceEn: 'Begin moderate morning jogging and hydration routine at least 10 days before the physical screening date.',
    preparationAdviceBn: 'শারীরিক পরীক্ষার অন্তত ১০ দিন আগে থেকে নিয়মিত হালকা দৌড় ও স্ট্যামিনা বৃদ্ধির অনুশীলন শুরু করুন।',
  },
  {
    id: 4,
    stageCode: 'STAGE-04',
    titleEn: 'Induction & Recruit Drill Period',
    titleBn: 'শপথ গ্রহণ ও ৩ মাসের বুনিয়াদি ড্রিল',
    badgeEn: 'Final Inductions',
    badgeBn: 'চূড়ান্ত দীক্ষা পর্যায়',
    descriptionEn: 'Shortlisted candidates take the Cadet Oath of Allegiance, receive platoon beret and accoutrements, and complete 3 months of recruit parade training.',
    descriptionBn: 'নির্বাচিত ক্যাডেটদের শপথ গ্রহণ, প্লাটুনের অফিসিয়াল ক্যাপ ও সরঞ্জামাদি প্রদান এবং ৩ মাসের নিয়মিত কুচকাওয়াজ প্রশিক্ষণ।',
    durationEn: 'Semester Drill Schedule (Sun & Wed 06:45 AM)',
    durationBn: 'রবি ও বুধ সকাল ০৬:৪৫ মি.',
    status: 'upcoming',
    icon: Award,
    keyChecklistEn: [
      'Cadet Oath of Allegiance to the Constitution of Bangladesh',
      'Issuance of official platoon working uniform, belt & beret',
      'Mandatory weekly parade attendance (Minimum 80% turnout)',
      'Formal badge-pinning ceremony and graduation to active Cadet rank',
    ],
    keyChecklistBn: [
      'প্লাটুন কমান্ডারের সম্মুখে বিএনসিসি ক্যাডেট শপথ গ্রহণ',
      'অফিসিয়াল ওয়ার্কিং ড্রেস, বেল্ট ও ক্যাপ প্রদান',
      'সাপ্তাহিক সকালের ড্রিল প্যারেডে নিয়মিত অংশগ্রহণ',
      'বুনিয়াদি প্রশিক্ষণ সমাপনান্তে সম্মানসূচক ক্যাডেট ব্যাজ প্রদান',
    ],
    preparationAdviceEn: 'Selected recruits are mentored by Senior NCOs and assigned to Alpha, Bravo, or Female Wing sections.',
    preparationAdviceBn: 'নির্বাচিত ক্যাডেটদের আলফা, ব্রাভো অথবা নারী উইং সেকশনে অন্তর্ভুক্ত করে প্রশিক্ষণ দেওয়া হয়।',
  },
];

export const JoinProcessStepper: React.FC<JoinProcessStepperProps> = ({
  onOpenApply,
  className = '',
}) => {
  const { isBn } = useLanguage();
  const [selectedStageId, setSelectedStageId] = useState<number>(2); // Default to current open stage

  const currentStage = APPLICATION_STAGES.find((s) => s.id === selectedStageId) || APPLICATION_STAGES[1];
  const progressPercent = Math.round((2 / APPLICATION_STAGES.length) * 100); // Stage 2 is currently active (50%)

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Component Title & Cycle Overview Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
              <Sparkles className="w-4 h-4" />
              <span>{isBn ? 'নিয়োগ পর্যায় ট্র্যাকার' : 'Recruitment Cycle Tracker'}</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase text-slate-900 dark:text-white">
              {isBn ? 'আবেদন ও ভর্তি প্রক্রিয়ার লাইভ রোডম্যাপ' : 'Join Process Status Stepper'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              {isBn
                ? 'মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি প্লাটুনে যোগদানের প্রতিটি ধাপ ও আপনার বর্তমান পর্যায় যাচাই করুন।'
                : 'Track the 4 progressive milestones from candidate self-assessment to the ceremonial Cadet Oath and recruit parade training.'}
            </p>
          </div>

          {/* Current Cycle Overall Status Card */}
          <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/40 text-left sm:text-right shrink-0">
            <div className="text-[10px] font-mono uppercase tracking-wider text-red-700 dark:text-red-300 font-bold">
              {isBn ? 'বর্তমান সক্রিয় ধাপ' : 'Active Cycle Phase'}
            </div>
            <div className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center sm:justify-end gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span>{isBn ? 'ধাপ ০২: অনলাইন আবেদন গ্রহণ' : 'Stage 02: Online Dossier Submission'}</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
              {isBn ? 'ইনটেক ২০২৫–২০২৬' : 'Intake 2025–2026 Batch'}
            </div>
          </div>
        </div>

        {/* Global Progress Bar (Visual Connector) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {isBn ? 'ইনটেক রোডম্যাপ অগ্রগতি' : 'Application Cycle Progress'}
            </span>
            <span className="font-bold text-red-600 dark:text-red-400">
              {progressPercent}% {isBn ? 'পর্যায় সম্পন্ন' : 'Phases Progressed'}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-700 via-amber-600 to-emerald-600 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Responsive Stepper Nodes Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {APPLICATION_STAGES.map((stage) => {
            const Icon = stage.icon;
            const isSelected = selectedStageId === stage.id;
            const isCompleted = stage.status === 'completed';
            const isActive = stage.status === 'active';

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setSelectedStageId(stage.id)}
                className={`relative text-left p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-red-600 bg-red-50/50 dark:bg-red-950/30 ring-2 ring-red-600/30 shadow-xs'
                    : isActive
                    ? 'border-amber-400 dark:border-amber-700 bg-amber-50/20 dark:bg-amber-950/10 hover:border-red-400'
                    : isCompleted
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10 hover:border-slate-300 dark:hover:border-slate-700'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 opacity-75 hover:opacity-100'
                }`}
              >
                {/* Node Header: Stage Number & Status Badge */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    {stage.stageCode}
                  </span>

                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{isBn ? 'সম্পন্ন' : 'Completed'}</span>
                    </span>
                  ) : isActive ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 animate-pulse">
                      <Clock className="w-3 h-3" />
                      <span>{isBn ? 'চলমান' : 'Active'}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {isBn ? 'আসন্ন' : 'Upcoming'}
                    </span>
                  )}
                </div>

                {/* Node Icon & Stage Title */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-xs'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-heading text-sm font-bold uppercase text-slate-900 dark:text-white leading-tight">
                      {isBn ? stage.titleBn : stage.titleEn}
                    </h4>
                    <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                      {isBn ? stage.durationBn : stage.durationEn}
                    </span>
                  </div>
                </div>

                {/* Selected Stage Active Marker */}
                {isSelected && (
                  <div className="text-[10px] font-mono font-bold uppercase text-red-600 dark:text-red-400 inline-flex items-center gap-1 pt-1 border-t border-red-200 dark:border-red-900/60">
                    <span>{isBn ? 'বিস্তারিত দেখুন' : 'Viewing Stage Details'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Panel */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/40">
                  {currentStage.stageCode}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {isBn ? currentStage.durationBn : currentStage.durationEn}
                </span>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold uppercase text-slate-900 dark:text-white">
                {isBn ? currentStage.titleBn : currentStage.titleEn}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl">
                {isBn ? currentStage.descriptionBn : currentStage.descriptionEn}
              </p>
            </div>

            {/* Quick Action Button for this Stage */}
            {onOpenApply && (
              <button
                type="button"
                onClick={onOpenApply}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 hover:bg-red-800 text-white px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition-all shrink-0 active:scale-95"
              >
                <span>
                  {currentStage.actionLabelEn
                    ? isBn
                      ? currentStage.actionLabelBn
                      : currentStage.actionLabelEn
                    : isBn
                    ? 'আবেদন ডসিয়ার খুলুন'
                    : 'Open Application Dossier'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Checklist & Preparation Guidelines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Mandatory Checklist */}
            <div className="space-y-3">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-red-600" />
                <span>{isBn ? 'এই ধাপের আবশ্যকীয় চেকলিস্ট' : 'Mandatory Milestones & Checklist'}</span>
              </h4>
              <ul className="space-y-2">
                {(isBn ? currentStage.keyChecklistBn : currentStage.keyChecklistEn).map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Preparation Advice & Directive */}
            <div className="space-y-3">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>{isBn ? 'কমান্ডের প্রস্তুতি ও নির্দেশনা' : 'Command Preparation Advice'}</span>
              </h4>
              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 text-xs text-slate-700 dark:text-slate-300 space-y-3">
                <p className="leading-relaxed">
                  {isBn ? currentStage.preparationAdviceBn : currentStage.preparationAdviceEn}
                </p>
                <div className="flex items-center gap-2 pt-2 border-t border-amber-200/80 dark:border-amber-900/40 font-mono text-[11px] text-amber-900 dark:text-amber-300">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {isBn
                      ? 'যেকোনো জিজ্ঞাসায় যোগাযোগ: info@mubncc.metrouni.edu.bd'
                      : 'Helpdesk Support: info@mubncc.metrouni.edu.bd'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
