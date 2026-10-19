import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, FileText, Download, Printer } from 'lucide-react';
import { BnccCrest } from './BnccCrest';
import { useLanguage } from '../context/LanguageContext';
import { getLocalSemesterSettings } from '../services/semesterRecruitmentService';
import { appendApplicantToGoogleSheet, ApplicantSubmission } from '../services/googleSheetsService';
import { logRecruitSubmission } from '../services/analyticsService';
import { sanitizeText } from '../lib/sanitize';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDepartment?: string;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  defaultDepartment = 'Computer Science & Engineering (CSE)',
}) => {
  const { isBn, t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    department: defaultDepartment,
    batch: '',
    academicSemester: '',
    gender: 'Male',
    dateOfBirth: '',
    bloodGroup: 'B+',
    phone: '',
    email: '',
    statementOfPurpose: '',
    previousExperience: 'None',
    hasAgreedToDrill: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    referenceId: string;
    submittedAt: string;
    appliedSemester: string;
    batch?: string;
    academicSemester?: string;
    syncMessage?: string;
  } | null>(null);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    } else if (formData.studentId.trim().length < 6) {
      newErrors.studentId = 'Enter valid MU Student ID (e.g. 241-115-101)';
    }
    if (!formData.batch.trim()) {
      newErrors.batch = 'Batch is required (e.g. Batch 60)';
    }
    if (!formData.academicSemester.trim()) {
      newErrors.academicSemester = 'Semester is required e.g. 1.3 (1st year 3rd semester)';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+8801|01)[3-9]\d{8}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Enter a valid Bangladeshi mobile number';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'University / Personal email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (formData.statementOfPurpose.trim().length < 30) {
      newErrors.statementOfPurpose = 'Please provide at least 30 characters explaining your motivation.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const activeSettings = getLocalSemesterSettings();
    const activeSemester = activeSettings.currentSemester || 'Fall 2026';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const refCode = `MU-BNCC-${activeSemester.replace(/\s+/g, '-')}-${randomSuffix}`;
    const timestamp = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const fullBatchSemester = `${sanitizeText(formData.batch, { maxLength: 50, allowMultiline: false })} · ${sanitizeText(formData.academicSemester, { maxLength: 50, allowMultiline: false })}`;
    const newApplicant: ApplicantSubmission = {
      referenceId: refCode,
      fullName: sanitizeText(formData.fullName, { maxLength: 120, allowMultiline: false }),
      studentId: sanitizeText(formData.studentId, { maxLength: 40, allowMultiline: false }),
      department: sanitizeText(formData.department, { maxLength: 100, allowMultiline: false }),
      batch: sanitizeText(formData.batch, { maxLength: 50, allowMultiline: false }),
      academicSemester: sanitizeText(formData.academicSemester, { maxLength: 50, allowMultiline: false }),
      batchSemester: fullBatchSemester,
      gender: sanitizeText(formData.gender, { maxLength: 20, allowMultiline: false }),
      dateOfBirth: sanitizeText(formData.dateOfBirth, { maxLength: 30, allowMultiline: false }),
      bloodGroup: sanitizeText(formData.bloodGroup, { maxLength: 10, allowMultiline: false }),
      phone: sanitizeText(formData.phone, { maxLength: 30, allowMultiline: false }),
      email: sanitizeText(formData.email, { maxLength: 100, allowMultiline: false }),
      statementOfPurpose: sanitizeText(formData.statementOfPurpose, { maxLength: 2500, allowMultiline: true }),
      previousExperience: sanitizeText(formData.previousExperience || 'None', { maxLength: 1000, allowMultiline: true }),
      submittedAt: new Date().toISOString(),
      appliedSemester: activeSemester,
      syncStatus: 'pending',
    };

    // Write directly to Google Sheets organized by active semester
    let syncMsg = '';
    try {
      const sheetResult = await appendApplicantToGoogleSheet(newApplicant, activeSemester);
      newApplicant.syncStatus = sheetResult.success ? 'synced' : 'local_only';
      syncMsg = sheetResult.message;
    } catch (err: any) {
      console.warn('Google Sheet append error:', err);
      newApplicant.syncStatus = 'local_only';
    }

    // Persist to local storage for candidate tracking
    try {
      const stored: ApplicantSubmission[] = JSON.parse(
        localStorage.getItem('mu_bncc_applications') || '[]'
      );
      stored.unshift(newApplicant);
      localStorage.setItem('mu_bncc_applications', JSON.stringify(stored));
      window.dispatchEvent(new CustomEvent('applicant-submitted', { detail: newApplicant }));
      logRecruitSubmission(newApplicant.fullName, newApplicant.studentId, activeSemester);
    } catch (err) {
      console.error('Storage error', err);
    }

    setSubmittedData({
      referenceId: refCode,
      submittedAt: timestamp,
      appliedSemester: activeSemester,
      batch: formData.batch.trim(),
      academicSemester: formData.academicSemester.trim(),
      syncMessage: syncMsg,
    });
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setSubmittedData(null);
    setFormData({
      fullName: '',
      studentId: '',
      department: defaultDepartment,
      batch: '',
      academicSemester: '',
      gender: 'Male',
      dateOfBirth: '',
      bloodGroup: 'B+',
      phone: '',
      email: '',
      statementOfPurpose: '',
      previousExperience: 'None',
      hasAgreedToDrill: true,
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <BnccCrest size="sm" />
            <div>
              <h2 id="modal-headline" className="font-heading text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {isBn ? 'ক্যাডেট নিয়োগ আবেদন ফরম' : 'Cadet Recruitment Application'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn ? 'এমইউ বিএনসিসি প্লাটুন ইনটেক ২০২৫–২০২৬' : 'MU BNCC Platoon Intake 2025-2026'}
              </p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {submittedData ? (
            /* Success confirmation */
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-heading uppercase text-slate-900 dark:text-white">
                  {isBn ? 'আবেদন সফলভাবে গৃহীত হয়েছে!' : 'Application Submitted Successfully!'}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {isBn
                    ? 'আপনার ক্যাডেট প্রার্থী ডসিয়ার এমইউ বিএনসিসি প্লাটুন সচিবালয়ে সফলভাবে নথিভুক্ত হয়েছে।'
                    : 'Your candidate application has been officially logged with the MU BNCC Platoon Secretariat.'}
                </p>
              </div>

              {/* Official Receipt Card */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 text-left space-y-3 font-mono text-sm">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-xs uppercase text-slate-500 font-sans font-semibold">
                    {isBn ? 'রেফারেন্স আইডি:' : 'Reference ID:'}
                  </span>
                  <span className="font-bold text-red-600 dark:text-red-400 text-base">{submittedData.referenceId}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-sans">{isBn ? 'আবেদনকারী:' : 'Applicant:'}</span>{' '}
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{formData.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans">{isBn ? 'শিক্ষার্থী আইডি:' : 'Student ID:'}</span>{' '}
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{formData.studentId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans">{isBn ? 'বিভাগ:' : 'Department:'}</span>{' '}
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{formData.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans">{isBn ? 'ব্যাচ:' : 'Batch:'}</span>{' '}
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{formData.batch}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans">{isBn ? 'সেমিস্টার:' : 'Semester:'}</span>{' '}
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{formData.academicSemester}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans">{isBn ? 'রক্তের গ্রুপ:' : 'Blood Group:'}</span>{' '}
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{formData.bloodGroup}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 font-sans">{isBn ? 'জমার সময়:' : 'Submitted On:'}</span>{' '}
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{submittedData.submittedAt}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-slate-500 font-sans">{isBn ? 'সক্রিয় সেমিস্টার:' : 'Intake Semester:'}</span>{' '}
                      <span className="font-bold text-red-600 dark:text-red-400">{submittedData.appliedSemester}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      Google Sheets Sync
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 font-sans border-t border-slate-200 dark:border-slate-800">
                  <strong>{isBn ? 'পরবর্তী করণীয়:' : 'Next Step:'}</strong>{' '}
                  {isBn
                    ? 'বুধবার সকালে মূল শিক্ষার্থী পরিচয়পত্র ও স্পোর্টস পোশাক পরে ১.৬ কিমি দৌড় ও প্রাথমিক মৌখিক পরীক্ষার জন্য এমইউ স্পোর্টস কমপ্লেক্সে উপস্থিত থাকুন।'
                    : 'Report to the MU Sports Complex on Wednesday morning with your original Student ID Card and physical sportswear for the 1.6 km run & preliminary interview.'}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  {isBn ? 'রসিদ প্রিন্ট / সংরক্ষণ করুন' : 'Print / Save Receipt'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-red-700 text-white px-6 py-2.5 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-red-600 transition-colors"
                >
                  {isBn ? 'সম্পন্ন ও পোর্টালে ফিরুন' : 'Done & Return to Portal'}
                </button>
              </div>
            </div>
          ) : (
            /* Application Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {isBn
                    ? 'দয়া করে সঠিক একাডেমিক ও শারীরিক তথ্য প্রদান করুন। নির্বাচিত প্রার্থীদের এসএমএস/ইমেলের মাধ্যমে শারীরিক সক্ষমতা পরীক্ষা ও ভাইভার জন্য ডাকা হবে।'
                    : 'Please provide authentic academic and medical details. Shortlisted candidates will be summoned via SMS/Email for physical fitness trials and viva at Metropolitan University campus.'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'পূর্ণ নাম *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    placeholder={isBn ? 'উদা: রাহাত আহমেদ ইমন' : 'e.g. Rahad Ahmed Emon'}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 ${
                      errors.fullName ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>

                {/* Student ID */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'শিক্ষার্থী আইডি *' : 'Student ID *'}
                  </label>
                  <input
                    type="text"
                    placeholder={isBn ? 'উদা: ২৪১-১১৫-১০১' : 'e.g. 241-115-101'}
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 ${
                      errors.studentId ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                  {errors.studentId && <p className="text-xs text-red-500 mt-1">{errors.studentId}</p>}
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'বিভাগ *' : 'Department *'}
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="Computer Science & Engineering (CSE)">Computer Science & Engineering (CSE)</option>
                  <option value="Electrical & Electronic Engineering (EEE)">Electrical & Electronic Engineering (EEE)</option>
                  <option value="Software Engineering (SWE)">Software Engineering (SWE)</option>
                  <option value="Business Administration (BBA)">Business Administration (BBA)</option>
                  <option value="Department of English">Department of English</option>
                  <option value="Department of Law & Justice">Department of Law & Justice</option>
                  <option value="Department of Economics">Department of Economics</option>
                </select>
              </div>

              {/* Batch and Semester in separate distinct boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Batch Box */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'ব্যাচ *' : 'Batch *'}
                  </label>
                  <input
                    type="text"
                    placeholder={isBn ? 'উদা: ৬০তম ব্যাচ' : 'e.g. Batch 60'}
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600 ${
                      errors.batch ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                  {errors.batch ? (
                    <p className="text-xs text-red-500 mt-1">{errors.batch}</p>
                  ) : (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {isBn ? 'উদা: ৬০তম ব্যাচ' : 'e.g. Batch 60'}
                    </p>
                  )}
                </div>

                {/* Semester Box */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'সেমিস্টার *' : 'Semester *'}
                  </label>
                  <input
                    type="text"
                    placeholder={isBn ? 'উদা: ১.৩ (১ম বর্ষ ৩য় সেমিস্টার)' : 'e.g. 1.3 (1st year 3rd semester)'}
                    value={formData.academicSemester}
                    onChange={(e) => setFormData({ ...formData, academicSemester: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600 ${
                      errors.academicSemester ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                  {errors.academicSemester ? (
                    <p className="text-xs text-red-500 mt-1">{errors.academicSemester}</p>
                  ) : (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {isBn ? 'উদা: ১.৩ (১ম বর্ষ ৩য় সেমিস্টার)' : 'e.g. 1.3 (1st year 3rd semester)'}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'লিঙ্গ *' : 'Gender *'}
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="Male">{isBn ? 'ছাত্র ক্যাডেট উইং' : 'Male Cadet Wing'}</option>
                    <option value="Female">{isBn ? 'ছাত্রী ক্যাডেট উইং' : 'Female Cadet Wing'}</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'জন্ম তারিখ *' : 'Date of Birth *'}
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600 ${
                      errors.dateOfBirth ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                  {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>}
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'রক্তের গ্রুপ *' : 'Blood Group *'}
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="A+">A+ (Positive)</option>
                    <option value="A-">A- (Negative)</option>
                    <option value="B+">B+ (Positive)</option>
                    <option value="B-">B- (Negative)</option>
                    <option value="O+">O+ (Positive)</option>
                    <option value="O-">O- (Negative)</option>
                    <option value="AB+">AB+ (Positive)</option>
                    <option value="AB-">AB- (Negative)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'সক্রিয় মোবাইল / হোয়াটসঅ্যাপ *' : 'Active Phone / WhatsApp *'}
                  </label>
                  <input
                    type="tel"
                    placeholder="017XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600 ${
                      errors.phone ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'বিশ্ববিদ্যালয় / ব্যক্তিগত ইমেল *' : 'University / Personal Email *'}
                  </label>
                  <input
                    type="email"
                    placeholder="student@metrouni.edu.bd"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600 ${
                      errors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Statement of Purpose */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'উদ্দেশ্যের বিবরণ (কেন যোগ দিতে চান?) *' : 'Statement of Purpose *'}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    isBn
                      ? 'আপনি কেন এমইউ বিএনসিসিতে যোগ দিতে চান? শৃঙ্খলা, শারীরিক প্রস্তুতি ও স্বেচ্ছাসেবার প্রতি আপনার অঙ্গীকার সংক্ষেপে লিখুন...'
                      : 'Why do you aspire to join MU BNCC? Mention your commitment to discipline, physical readiness, and voluntary service...'
                  }
                  value={formData.statementOfPurpose}
                  onChange={(e) => setFormData({ ...formData, statementOfPurpose: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600 ${
                    errors.statementOfPurpose ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {errors.statementOfPurpose && (
                  <p className="text-xs text-red-500 mt-1">{errors.statementOfPurpose}</p>
                )}
              </div>

              {/* Prior Scout / Sports Experience */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  {isBn
                    ? 'পূর্ববর্তী স্কাউট / রেড ক্রিসেন্ট / খেলাধুলার অভিজ্ঞতা (ঐচ্ছিক)'
                    : 'Previous Scouting / Red Crescent / Sports Background (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={isBn ? 'উদা: রোভার স্কাউট সদস্য, ১০০মি দৌড়বিদ, মার্শাল আর্ট' : 'e.g. Rover Scout member, Athletics 100m runner, Martial arts'}
                  value={formData.previousExperience}
                  onChange={(e) => setFormData({ ...formData, previousExperience: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              {/* Drill commitment checkbox */}
              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="drillAgreement"
                  checked={formData.hasAgreedToDrill}
                  onChange={(e) => setFormData({ ...formData, hasAgreedToDrill: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="drillAgreement" className="text-xs text-slate-600 dark:text-slate-400">
                  {isBn
                    ? 'আমি অঙ্গীকার করছি যে অন্তত ৮০% প্যারেড উপস্থিতি বজায় রাখব, সামরিক শৃঙ্খলা মানব, সম্মানবিধি মেনে চলব এবং মেট্রোপলিটন ইউনিভার্সিটির সম্মান সমুন্নত রাখব।'
                    : 'I pledge to maintain at least 80% parade attendance, observe military discipline, adhere to the Honor Code, and proudly uphold the prestige of Metropolitan University.'}
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.hasAgreedToDrill}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-700 hover:bg-red-800 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {isBn ? 'আবেদন নথিভুক্ত হচ্ছে...' : 'Logging Application...'}
                    </>
                  ) : (
                    isBn ? 'ক্যাডেট আবেদন জমা দিন' : 'Submit Cadet Application'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
