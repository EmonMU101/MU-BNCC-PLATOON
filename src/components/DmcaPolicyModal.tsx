import React from 'react';
import { X, Shield, FileText, Mail, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface DmcaPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DmcaPolicyModal: React.FC<DmcaPolicyModalProps> = ({ isOpen, onClose }) => {
  const { isBn } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-heading text-lg font-bold uppercase tracking-tight text-slate-900 dark:text-white">
                {isBn ? 'ডিএমসিএ ও মেধা স্বত্ব প্রত্যাহার নীতিমালা' : 'DMCA & Content Takedown Policy'}
              </h3>
              <p className="text-[11px] font-mono text-slate-500">
                17 U.S.C. § 512 & Bangladesh Copyright Compliance
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Policy Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
          {/* Section 1 */}
          <div className="space-y-2">
            <h4 className="font-heading text-sm font-bold uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>1. Safe Harbor & Intellectual Property Statement</span>
            </h4>
            <p>
              The Metropolitan University Bangladesh National Cadet Corps (MU BNCC) Platoon respects the intellectual property rights of all content creators, photographers, cadets, and third parties. In accordance with the Digital Millennium Copyright Act (17 U.S.C. § 512), applicable digital copyright statutes, and the Copyright Act of Bangladesh, we maintain an expedited notice-and-takedown system for user-generated dispatches, testimonials, photo gallery entries, and media files.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h4 className="font-heading text-sm font-bold uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>2. User-Generated Content (UGC) Ownership & Warranties</span>
            </h4>
            <p>
              All cadets, alumni, and community supporters submitting stories, photos, or commentary warrant and confirm that:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400">
              <li>They own or hold express licensing permission to upload and publicly display the submitted material.</li>
              <li>The publication of such material does not infringe on copyright, trademark, privacy, or proprietary rights of any individual or entity.</li>
              <li>Unauthorized commercial media or copyright-infringing content will be removed immediately upon notification.</li>
            </ul>
          </div>

          {/* Section 3: Designated Agent */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>3. Designated DMCA & Legal Compliance Contact</span>
            </h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              If you believe in good faith that any photograph, article, or multimedia item hosted on the MU BNCC portal infringes upon your copyright, please forward a formal takedown notice to our designated contact:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[11px] font-mono">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="block text-[10px] text-slate-400 uppercase">Designated Email</span>
                <a href="mailto:mu.bncc@metrouni.edu.bd" className="font-bold text-red-600 dark:text-red-400 hover:underline">
                  mu.bncc@metrouni.edu.bd
                </a>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="block text-[10px] text-slate-400 uppercase">Supervisory Secretariat</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Metropolitan University BNCC Platoon
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>Platoon Headquarters, Metropolitan University Campus, Bateshwar, Sylhet-3103, Bangladesh</span>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h4 className="font-heading text-sm font-bold uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>4. Notice Requirements & Takedown Protocol</span>
            </h4>
            <p>
              Your notification must include: (a) physical or electronic signature of the copyright owner; (b) identification of the copyrighted work claimed to have been infringed; (c) the specific URL or portal location of the infringing material; (d) contact address, telephone number, and email; (e) a statement that you have a good faith belief the use is unauthorized; and (f) a statement under penalty of perjury that the information is accurate.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-3.5 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-mono text-slate-400">
            Last Updated: Fall Semester 2026
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
          >
            {isBn ? 'বুঝেছি' : 'Understood'}
          </button>
        </div>
      </div>
    </div>
  );
};
