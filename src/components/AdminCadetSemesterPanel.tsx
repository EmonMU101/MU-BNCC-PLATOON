import React, { useState, useEffect } from 'react';
import {
  Award,
  Crown,
  Medal,
  Star,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  RefreshCw,
  X,
  User,
  Image,
  Calendar,
  Sparkles,
  Shield,
  Clock,
  HeartHandshake,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  Eye,
} from 'lucide-react';
import {
  FeaturedCadetDoc,
  getFeaturedCadets,
  createCadetOfTheSemester,
  updateCadetOfTheSemester,
  deleteCadetOfTheSemester,
  setCurrentCadetOfTheSemester,
  purgeMockFeaturedCadets,
} from '../services/featuredCadetService';
import { getAllCadets, CadetProfileData } from '../services/cadetPortalService';
import { useLanguage } from '../context/LanguageContext';

export const AdminCadetSemesterPanel: React.FC = () => {
  const { isBn } = useLanguage();
  const [honorees, setHonorees] = useState<FeaturedCadetDoc[]>([]);
  const [registeredCadets, setRegisteredCadets] = useState<CadetProfileData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const initialFormState: Omit<FeaturedCadetDoc, 'id'> = {
    semester: 'Spring 2026',
    semesterBn: 'স্প্রিং ২০২৬',
    fullName: '',
    fullNameBn: '',
    rank: 'Cadet Sergeant',
    rankBn: 'ক্যাডেট সার্জেন্ট',
    rankAbbr: 'C/SGT',
    rankAbbrBn: 'সি/সার্জেন্ট',
    cadetNumber: '',
    department: 'Computer Science & Engineering',
    departmentBn: 'কম্পিউটার বিজ্ঞান ও প্রকৌশল',
    batch: '52nd Batch',
    batchBn: '৫২তম ব্যাচ',
    section: 'Platoon 1 (Alpha Section Commander)',
    sectionBn: 'প্লাটুন ১ (আলফা সেকশন কমান্ডার)',
    photoUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    quote: 'Discipline is not a restriction; it is the freedom to act decisively with unwavering honor.',
    quoteBn: 'শৃঙ্খলা কোনো সীমাবদ্ধতা নয়; এটি মাতৃভূমির সেবায় দ্বিধাহীন সম্মানের সাথে নির্ভীক সিদ্ধান্ত গ্রহণের স্বাধীনতা।',
    citation: 'Commanded the emergency rescue unit during university disaster relief operations and led platoon drills with distinction.',
    citationBn: 'বিশ্ববিদ্যালয় দুর্যোগ ত্রাণ কার্যক্রমে জরুরি উদ্ধারকারী ইউনিটের নেতৃত্ব দেন এবং শ্রেষ্ঠত্বের সাথে প্লাটুন ড্রিল পরিচালনা করেন।',
    achievementSummary: 'Regimental Gold Star · Best All-Round Cadet, Marksman First Class, and Platoon Commander Commendation.',
    achievementSummaryBn: 'রেজিমেন্টাল গোল্ড স্টার · সেরা সর্বাঙ্গীণ ক্যাডেট, ফার্স্ট ক্লাস মার্কসম্যান এবং প্লাটুন কমান্ডার বিশেষ প্রশংসা।',
    trainingHours: 120,
    communityHours: 45,
    attendanceRate: 95,
    meritScore: 340,
    distinctionBadge: 'Regimental Gold Star · Best All-Round Cadet',
    distinctionBadgeBn: 'রেজিমেন্টাল গোল্ড স্টার · সেরা সর্বাঙ্গীণ ক্যাডেট',
    isCurrent: true,
  };

  const [formData, setFormData] = useState<Omit<FeaturedCadetDoc, 'id'>>(initialFormState);

  const showMsg = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [honoreesList, cadetsList] = await Promise.all([
        getFeaturedCadets(),
        getAllCadets(),
      ]);
      setHonorees(honoreesList);
      setRegisteredCadets(cadetsList);
    } catch (e: any) {
      showMsg('Failed to load Cadet of the Semester data: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      ...initialFormState,
      isCurrent: honorees.length === 0, // default to true if first honoree
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cadet: FeaturedCadetDoc) => {
    setEditingId(cadet.id);
    setFormData({
      semester: cadet.semester || 'Spring 2026',
      semesterBn: cadet.semesterBn || 'স্প্রিং ২০২৬',
      fullName: cadet.fullName,
      fullNameBn: cadet.fullNameBn || '',
      rank: cadet.rank || 'Cadet',
      rankBn: cadet.rankBn || '',
      rankAbbr: cadet.rankAbbr || 'CDT',
      rankAbbrBn: cadet.rankAbbrBn || '',
      cadetNumber: cadet.cadetNumber,
      department: cadet.department || '',
      departmentBn: cadet.departmentBn || '',
      batch: cadet.batch || '',
      batchBn: cadet.batchBn || '',
      section: cadet.section || 'Platoon 1',
      sectionBn: cadet.sectionBn || '',
      photoUrl: cadet.photoUrl,
      quote: cadet.quote,
      quoteBn: cadet.quoteBn || '',
      citation: cadet.citation,
      citationBn: cadet.citationBn || '',
      achievementSummary: cadet.achievementSummary,
      achievementSummaryBn: cadet.achievementSummaryBn || '',
      trainingHours: cadet.trainingHours || 0,
      communityHours: cadet.communityHours || 0,
      attendanceRate: cadet.attendanceRate || 0,
      meritScore: cadet.meritScore || 300,
      distinctionBadge: cadet.distinctionBadge || 'Exemplary Service',
      distinctionBadgeBn: cadet.distinctionBadgeBn || '',
      isCurrent: Boolean(cadet.isCurrent),
    });
    setIsModalOpen(true);
  };

  // Helper to autofill when selecting from verified roster
  const handleAutoFillFromCadet = (cadetUid: string) => {
    if (!cadetUid) return;
    const selected = registeredCadets.find((c) => c.uid === cadetUid || c.cadetId === cadetUid);
    if (!selected) return;

    // Rank abbreviations mapping
    const rankMap: Record<string, string> = {
      'Cadet Under Officer': 'CUO',
      'Cadet Sergeant': 'C/SGT',
      'Cadet Corporal': 'C/CPL',
      'Cadet Lance Corporal': 'C/LCPL',
      Cadet: 'CDT',
    };

    const cRank = selected.currentRank || 'Cadet';
    const cRankAbbr = rankMap[cRank] || 'CDT';

    setFormData((prev) => ({
      ...prev,
      fullName: selected.fullName,
      cadetNumber: selected.cadetId || '',
      rank: cRank,
      rankAbbr: cRankAbbr,
      department: selected.department || prev.department,
      batch: selected.currentSemester ? `Semester ${selected.currentSemester}` : prev.batch,
      photoUrl: selected.profilePicture || prev.photoUrl,
      trainingHours: selected.trainingHours || prev.trainingHours,
      meritScore: selected.meritScore || prev.meritScore,
    }));
    showMsg(`Auto-filled credentials for ${selected.fullName} (${selected.cadetId})`);
  };

  const handleRankChange = (selectedRank: string) => {
    const rankMap: Record<string, { abbr: string; bn: string; abbrBn: string }> = {
      'Cadet Under Officer': { abbr: 'CUO', bn: 'ক্যাডেট আন্ডার অফিসার', abbrBn: 'সিইউও' },
      'Cadet Sergeant': { abbr: 'C/SGT', bn: 'ক্যাডেট সার্জেন্ট', abbrBn: 'সি/সার্জেন্ট' },
      'Cadet Corporal': { abbr: 'C/CPL', bn: 'ক্যাডেট কর্পোরাল', abbrBn: 'সি/কর্পোরাল' },
      'Cadet Lance Corporal': { abbr: 'C/LCPL', bn: 'ক্যাডেট ল্যান্স কর্পোরাল', abbrBn: 'সি/এলসিপিএল' },
      Cadet: { abbr: 'CDT', bn: 'ক্যাডেট', abbrBn: 'সিডিটি' },
    };

    const details = rankMap[selectedRank] || { abbr: 'CDT', bn: 'ক্যাডেট', abbrBn: 'সিডিটি' };
    setFormData((prev) => ({
      ...prev,
      rank: selectedRank,
      rankAbbr: details.abbr,
      rankBn: details.bn,
      rankAbbrBn: details.abbrBn,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.semester.trim()) {
      showMsg('Please provide full name and semester.', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateCadetOfTheSemester(editingId, formData);
        showMsg(`Cadet of the Semester for ${formData.semester} updated successfully!`);
      } else {
        await createCadetOfTheSemester(formData);
        showMsg(`Cadet of the Semester for ${formData.semester} published live to Homepage!`);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (e: any) {
      showMsg('Failed to publish honoree: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSetCurrent = async (id: string, name: string, sem: string) => {
    setLoading(true);
    try {
      await setCurrentCadetOfTheSemester(id);
      showMsg(`${name} set as current active Cadet of the Semester for ${sem}!`);
      await loadData();
    } catch (e: any) {
      showMsg('Failed to update active honoree: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the record for ${name}?`)) {
      return;
    }
    setLoading(true);
    try {
      await deleteCadetOfTheSemester(id);
      showMsg(`Removed honoree record for ${name}`);
      await loadData();
    } catch (e: any) {
      showMsg('Failed to delete: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePurgeMockData = async () => {
    if (!window.confirm('Purge all legacy mock Cadet of the Month data from Firestore and local cache?')) {
      return;
    }
    setLoading(true);
    try {
      const purged = await purgeMockFeaturedCadets();
      showMsg(`Purged legacy mock cadet data (${purged} records cleared). Database is clean!`);
      await loadData();
    } catch (e: any) {
      showMsg('Error purging mock data: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`rounded-2xl p-4 text-xs font-semibold flex items-center justify-between shadow-md transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
              : 'bg-red-50 dark:bg-red-950/80 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Action Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>Platoon Command Honors & Roll of Honor CMS</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase text-slate-900 dark:text-white">
              Cadet of the Semester Publishing Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
              Publish and officially announce the honoree for each academic semester. Honorees are showcased in the live homepage spotlight hero with command citations, leadership statements, and tactical achievements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handlePurgeMockData}
              title="Purge legacy mock cadet of the month entries from database"
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Purge Mock Data
            </button>

            <button
              type="button"
              onClick={loadData}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh live data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-800 hover:to-amber-800 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Honoree</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main List of Honorees */}
      {loading && honorees.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-red-600 border-t-transparent mx-auto" />
          <p className="text-xs font-mono uppercase tracking-wider text-slate-500">
            Querying Firestore for Cadet of the Semester records...
          </p>
        </div>
      ) : honorees.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700/60 bg-amber-50/40 dark:bg-amber-950/20 p-10 sm:p-14 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-xl font-bold uppercase text-slate-900 dark:text-white">
              No Cadet of the Semester Published Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              Mock Cadet of the Month data has been cleared. Platoon officers can now publish the authentic honoree for the current semester using the button below.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Publish First Cadet of the Semester</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {honorees.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                item.isCurrent
                  ? 'border-2 border-amber-400 dark:border-amber-500 bg-gradient-to-b from-amber-50/30 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="p-5 space-y-4">
                {/* Status Bar */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {item.semester}
                  </span>

                  {item.isCurrent ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-mono font-black uppercase tracking-wider shadow-xs">
                      <Star className="w-3 h-3 fill-slate-950" />
                      <span>Active Spotlight</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetCurrent(item.id, item.fullName, item.semester)}
                      className="text-[10px] font-mono font-bold text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors uppercase"
                    >
                      Set as Active
                    </button>
                  )}
                </div>

                {/* Cadet Profile Preview */}
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt={item.fullName}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <span className="text-[11px] font-mono font-bold text-red-600 dark:text-red-400 uppercase">
                      {item.rank} ({item.rankAbbr})
                    </span>
                    <h3 className="font-heading text-lg font-black uppercase text-slate-900 dark:text-white truncate">
                      {item.fullName}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono truncate">
                      {item.cadetNumber} · {item.department}
                    </p>
                  </div>
                </div>

                {/* Distinction Badge */}
                {item.distinctionBadge && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-100/70 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-[11px] font-mono font-bold text-amber-800 dark:text-amber-300 truncate max-w-full">
                    <Medal className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{item.distinctionBadge}</span>
                  </div>
                )}

                {/* Brief Description */}
                {item.achievementSummary && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                    {item.achievementSummary}
                  </p>
                )}

                {/* Section / Wing */}
                {item.section && (
                  <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Section:</span>
                    <span>{item.section}</span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Live'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Edit honoree"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.fullName)}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    title="Delete honoree"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <h3 className="font-heading text-xl sm:text-2xl font-bold uppercase text-slate-900 dark:text-white">
                  {editingId ? 'Edit Cadet of the Semester' : 'Publish Cadet of the Semester'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Autofill Option from Platoon Roster */}
            {registeredCadets.length > 0 && !editingId && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-2">
                <label className="block text-xs font-mono font-bold text-amber-900 dark:text-amber-300 uppercase">
                  Fast Autofill: Select from Platoon Roster
                </label>
                <select
                  onChange={(e) => handleAutoFillFromCadet(e.target.value)}
                  defaultValue=""
                  className="w-full text-xs rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 p-2.5 font-sans text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="" disabled>
                    -- Choose registered cadet to auto-populate fields --
                  </option>
                  {registeredCadets.map((c) => (
                    <option key={c.uid} value={c.uid}>
                      {c.fullName} ({c.cadetId}) — {c.currentRank || 'Cadet'} ({c.department})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 font-sans">
                  Selecting a cadet automatically pulls their Cadet ID, rank, batch, department, and training records.
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Semester & Session */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Academic Semester (e.g. Spring 2026, Fall 2025) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    placeholder="e.g. Spring 2026"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Semester (বাংলায়, e.g. স্প্রিং ২০২৬)
                  </label>
                  <input
                    type="text"
                    value={formData.semesterBn || ''}
                    onChange={(e) => setFormData({ ...formData, semesterBn: e.target.value })}
                    placeholder="যেমন: স্প্রিং ২০২৬"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Cadet Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Candidate Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Tanvir Hasan"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Full Name (বাংলায়)
                  </label>
                  <input
                    type="text"
                    value={formData.fullNameBn || ''}
                    onChange={(e) => setFormData({ ...formData, fullNameBn: e.target.value })}
                    placeholder="যেমন: তানভীর হাসান"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Rank & Cadet ID */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Cadet Rank *
                  </label>
                  <select
                    value={formData.rank}
                    onChange={(e) => handleRankChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="Cadet Under Officer">Cadet Under Officer (CUO)</option>
                    <option value="Cadet Sergeant">Cadet Sergeant (C/SGT)</option>
                    <option value="Cadet Corporal">Cadet Corporal (C/CPL)</option>
                    <option value="Cadet Lance Corporal">Cadet Lance Corporal (C/LCPL)</option>
                    <option value="Cadet">Cadet (CDT)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Cadet ID Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cadetNumber}
                    onChange={(e) => setFormData({ ...formData, cadetNumber: e.target.value })}
                    placeholder="e.g. MU-BNCC-2024-001"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Batch (e.g. 52nd Batch)
                  </label>
                  <input
                    type="text"
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    placeholder="e.g. 52nd Batch"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Department & Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Section
                  </label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    placeholder="e.g. Section 1 / Alpha Section"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Photo URL */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Honoree Portrait Photo URL *
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="url"
                    required
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white font-mono text-[11px]"
                  />
                  {formData.photoUrl && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-300 shrink-0 bg-slate-900">
                      <img
                        src={formData.photoUrl}
                        alt="Preview"
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Brief Description */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Brief Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.achievementSummary}
                  onChange={(e) => setFormData({ ...formData, achievementSummary: e.target.value })}
                  placeholder="Provide a brief description of the Cadet of the Semester (their leadership, performance, and contributions)..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                <input
                  type="checkbox"
                  id="isCurrentToggle"
                  checked={formData.isCurrent}
                  onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                  className="h-4 w-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                />
                <label
                  htmlFor="isCurrentToggle"
                  className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  Set as Current Active Spotlight Honoree on Homepage
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <span>Publishing...</span>
                  ) : (
                    <>
                      <Crown className="w-4 h-4" />
                      <span>{editingId ? 'Save Changes' : 'Publish Live to Homepage'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
