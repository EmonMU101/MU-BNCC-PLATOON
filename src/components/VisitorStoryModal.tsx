import React, { useState } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Heart,
  User,
  Sparkles,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { createStory, CadetStoryItem } from '../services/cadetPortalService';
import { useLanguage } from '../context/LanguageContext';

interface VisitorStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryPublished?: (story: CadetStoryItem) => void;
}

export const VisitorStoryModal: React.FC<VisitorStoryModalProps> = ({
  isOpen,
  onClose,
  onStoryPublished,
}) => {
  const { isBn } = useLanguage();

  const [authorName, setAuthorName] = useState('');
  const [visitorRole, setVisitorRole] = useState('Visitor / Supporter');
  const [profession, setProfession] = useState('Student');
  const [customProfession, setCustomProfession] = useState('');
  const [institution, setInstitution] = useState('');
  const [avatarOption, setAvatarOption] = useState<string>('avatar-1');
  const [storyContent, setStoryContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasAgreedToCopyright, setHasAgreedToCopyright] = useState(false);

  if (!isOpen) return null;

  const PROFESSIONS = [
    { id: 'Student', en: 'Student (University / College)', bn: 'শিক্ষার্থী (বিশ্ববিদ্যালয় / কলেজ)' },
    { id: 'Software Engineer', en: 'Software Engineer / IT Professional', bn: 'সফটওয়্যার প্রকৌশলী / আইটি' },
    { id: 'Teacher / Professor', en: 'Teacher / Professor / Academic', bn: 'শিক্ষক / অধ্যাপক / শিক্ষাবিদ' },
    { id: 'Doctor / Healthcare', en: 'Doctor / Medical Professional', bn: 'চিকিৎসক / স্বাস্থ্যকর্মী' },
    { id: 'Banker / Finance', en: 'Banker / Finance Professional', bn: 'ব্যাংকার / অর্থ বিভাগ' },
    { id: 'Armed Forces / Police', en: 'Armed Forces / Police / Defense', bn: 'প্রতিরক্ষা ও পুলিশ বাহিনী' },
    { id: 'Government Official', en: 'Government Official / Civil Service', bn: 'সরকারি কর্মকর্তা' },
    { id: 'Lawyer / Legal', en: 'Lawyer / Legal Professional', bn: 'আইনজীবী / আইনবিদ' },
    { id: 'Journalist / Media', en: 'Journalist / Media Professional', bn: 'সাংবাদিক / গণমাধ্যম' },
    { id: 'Business / Entrepreneur', en: 'Businessperson / Entrepreneur', bn: 'ব্যবসায়ী / উদ্যোক্তা' },
    { id: 'NGO / Social Worker', en: 'NGO / Social Worker', bn: 'এনজিও / সমাজকর্মী' },
    { id: 'Ex-Cadet / Alumni', en: 'Ex-Cadet / Alumni Veteran', bn: 'প্রাক্তন ক্যাডেট / অ্যালামনাই' },
    { id: 'Active Cadet', en: 'Active BNCC Cadet', bn: 'বর্তমান বিএনসিসি ক্যাডেট' },
    { id: 'Defense & BNCC Aspirant', en: 'Defense & BNCC Aspirant', bn: 'প্রতিরক্ষা ও বিএনসিসি প্রত্যাশী' },
    { id: 'Freelancer / Creative', en: 'Freelancer / Creative Professional', bn: 'ফ্রিল্যান্সার / ক্রিয়েটিভ' },
    { id: 'Homemaker', en: 'Homemaker', bn: 'গৃহিণী' },
    { id: 'Other', en: 'Other Profession', bn: 'অন্যান্য পেশা' },
  ];

  const AVATAR_OPTIONS = [
    {
      id: 'avatar-1',
      name: 'Professional',
      url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: 'avatar-2',
      name: 'Student',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: 'avatar-3',
      name: 'Scholar',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: 'avatar-4',
      name: 'Friend',
      url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: 'avatar-5',
      name: 'Leader',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!authorName.trim()) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : 'Please enter your name.');
      return;
    }

    if (!storyContent.trim()) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে আপনার গল্প বা বার্তা লিখুন।' : 'Please enter your story or experience.');
      return;
    }

    if (!hasAgreedToCopyright) {
      setErrorMessage(
        isBn
          ? 'অনুগ্রহ করে মেধা স্বত্ব ও কপিরাইট অনুমতি নিশ্চিতকরণ বক্সে টিক দিন।'
          : 'Please confirm that you own or have permission to share this content/image.'
      );
      return;
    }

    const selectedAvatar =
      AVATAR_OPTIONS.find((a) => a.id === avatarOption)?.url ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

    const resolvedProfession =
      profession === 'Other' && customProfession.trim()
        ? customProfession.trim()
        : profession;

    const finalRole =
      visitorRole === 'Other' ? resolvedProfession : visitorRole;

    setIsSubmitting(true);
    try {
      const created = await createStory({
        authorName: authorName.trim(),
        authorRank: resolvedProfession,
        authorRole: finalRole,
        authorProfession: resolvedProfession,
        authorInstitution: institution.trim() || undefined,
        authorAvatar: selectedAvatar,
        content: storyContent.trim(),
        cadetId: 'COMMUNITY',
      });

      setSuccessMessage(true);
      if (onStoryPublished) {
        onStoryPublished(created);
      }

      setTimeout(() => {
        setAuthorName('');
        setStoryContent('');
        setCustomProfession('');
        setInstitution('');
        setSuccessMessage(false);
        setIsSubmitting(false);
        onClose();
      }, 1800);
    } catch {
      setErrorMessage(
        isBn
          ? 'গল্প প্রকাশে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
          : 'Failed to share story. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-400 flex items-center justify-center shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {isBn ? 'আপনার বিএনসিসি গল্প শেয়ার করুন' : 'Share Your Story with BNCC'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isBn
                  ? 'ক্যাডেট হওয়ার প্রয়োজন নেই — প্রতিটি দর্শনার্থী ও শুভাকাঙ্ক্ষী মুক্তভাবে মতামত প্রকাশ করতে পারেন'
                  : "You don't need to be a cadet — every visitor can share their story & respect"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Community Open Banner */}
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-3 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <Heart className="w-4 h-4 text-red-500 fill-red-500 shrink-0 mt-0.5" />
          <span>
            {isBn ? (
              <>
                <strong>মুক্ত প্ল্যাটফর্ম:</strong> আপনি মেট্রোপলিটন ইউনিভার্সিটির শিক্ষার্থী, অভিভাবক,
                শিক্ষক বা একজন শুভাকাঙ্ক্ষী — বিএনসিসিকে নিয়ে আপনার যেকোনো অনুপ্রেরণামূলক স্মৃতি,
                জাতীয় দিবসের অভিজ্ঞতা বা শুভেচ্ছা প্রকাশ করুন!
              </>
            ) : (
              <>
                <strong>Open to Everyone:</strong> Whether you are a university student, teacher, alumni,
                family member, or general supporter — write about seeing the platoon in action, drill
                memories, or voluntary services!
              </>
            )}
          </span>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isBn
                ? 'আপনার গল্প সফলভাবে প্রকাশিত হয়েছে! ধন্যবাদ।'
                : 'Your story has been broadcasted to the community feed! Thank you.'}
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'আপনার নাম *' : 'Your Name *'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder={isBn ? 'উদা: সাদিয়া চৌধুরী' : 'e.g. Sadia Chowdhury'}
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'আপনার ভূমিকা / সম্পর্ক *' : 'Your Relation to BNCC *'}
              </label>
              <select
                value={visitorRole}
                onChange={(e) => setVisitorRole(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 font-semibold"
              >
                <option value="Visitor / Supporter">
                  {isBn ? 'দর্শনার্থী / শুভাকাঙ্ক্ষী' : 'Visitor / Supporter'}
                </option>
                <option value="MU University Student">
                  {isBn ? 'মেট্রোপলিটন ইউনিভার্সিটির শিক্ষার্থী' : 'MU University Student'}
                </option>
                <option value="Alumni / Ex-Cadet">
                  {isBn ? 'প্রাক্তন শিক্ষার্থী / প্রাক্তন ক্যাডেট' : 'Alumni / Ex-Cadet'}
                </option>
                <option value="Faculty / Teacher">
                  {isBn ? 'শিক্ষক / কর্মকর্তা' : 'Faculty / Teacher'}
                </option>
                <option value="Parent / Guardian">
                  {isBn ? 'অভিভাবক' : 'Parent / Guardian'}
                </option>
                <option value="Active Cadet">
                  {isBn ? 'বর্তমান ক্যাডেট' : 'Active Cadet'}
                </option>
                <option value="Other">{isBn ? 'অন্যান্য' : 'Other'}</option>
              </select>
            </div>
          </div>

          {/* CURRENT PROFESSION FIELD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'আপনার বর্তমান পেশা *' : 'Current Profession *'}
              </label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 font-medium"
              >
                {PROFESSIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {isBn ? p.bn : p.en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'প্রতিষ্ঠান / কর্মস্থল / বিশ্ববিদ্যালয়' : 'Institution / Workplace / University'}
              </label>
              <input
                type="text"
                placeholder={isBn ? 'উদা: মেট্রোপলিটন ইউনিভার্সিটি / টেক ফার্ম' : 'e.g. Metropolitan University / Tech Firm'}
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          {profession === 'Other' && (
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'আপনার পেশা নির্দিষ্ট করুন *' : 'Specify Your Profession *'}
              </label>
              <input
                type="text"
                required
                placeholder={isBn ? 'উদা: আর্কিটেক্ট / ফটোগ্রাফার' : 'e.g. Architect / Photographer'}
                value={customProfession}
                onChange={(e) => setCustomProfession(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          )}

          {/* Select Avatar Illustration */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              {isBn ? 'একটি অবতার নির্বাচন করুন' : 'Choose Your Display Avatar'}
            </label>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setAvatarOption(av.id)}
                  className={`p-1 rounded-full border-2 transition-all shrink-0 ${
                    avatarOption === av.id
                      ? 'border-red-600 scale-105 shadow-md ring-2 ring-red-400/40'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={av.url}
                    alt={av.name}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Story Content */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'আপনার গল্প, স্মৃতি বা বার্তা *' : 'Your Story, Memory or Thoughts on BNCC *'}
            </label>
            <textarea
              required
              rows={4}
              placeholder={
                isBn
                  ? 'এমইউ বিএনসিসির প্যারেড দেখা, স্বাধীনতা দিবস বা বিজয় দিবসের কুচকাওয়াজ, রক্তদান কার্যক্রম, বন্যার্তদের সাহায্য কিংবা আপনার অনুপ্রেরণামূলক কথা লিখুন...'
                  : 'Write about watching the MU BNCC drill, national day parades, voluntary blood drives, flood relief efforts, or your personal encouragement for our cadets...'
              }
              value={storyContent}
              onChange={(e) => setStoryContent(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 leading-relaxed"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              {isBn
                ? 'আপনার বার্তাটি সরাসরি বিএনসিসি কমিউনিটি স্টোরিজ ফিডে প্রকাশিত হবে এবং অন্যরা সেলুট বা রিঅ্যাক্ট করতে পারবে।'
                : 'Your post will appear instantly in the community story feed where members and visitors can salute & react.'}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !storyContent.trim() || !authorName.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? (isBn ? 'পোস্ট হচ্ছে...' : 'Publishing...') : isBn ? 'গল্প প্রকাশ করুন' : 'Share Story'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
