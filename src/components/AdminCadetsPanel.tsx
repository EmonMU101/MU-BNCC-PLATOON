import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  X,
  Phone,
  Mail,
  Droplet,
  GraduationCap,
  Award,
  Calendar,
  Trash2,
  FileText,
} from 'lucide-react';
import {
  CadetProfileData,
  getAllCadets,
  setCadetVerificationStatus,
  sortCadetsByHierarchy,
  purgeMockCadetData,
  deleteCadet,
} from '../services/cadetPortalService';
import { sendCadetVerificationEmailNotification } from '../services/emailNotificationService';
import { appendCadetToGoogleSheet } from '../services/googleSheetsService';
import { getLocalSemesterSettings } from '../services/semesterRecruitmentService';
import { AdminCadetReportsPanel } from './AdminCadetReportsPanel';
import { logCadetVerification } from '../services/analyticsService';
import { auth } from '../lib/firebase';
import { checkAdminAccess } from '../services/adminAccessService';

export const AdminCadetsPanel: React.FC = () => {
  const [cadets, setCadets] = useState<CadetProfileData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'cadet' | 'excadet'>('all');
  const [selectedCadet, setSelectedCadet] = useState<CadetProfileData | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const list = await getAllCadets();
    setCadets(sortCadetsByHierarchy(list));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showMsg = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const verifyAdminClearance = async (): Promise<boolean> => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      showMsg('Security Block: You must be signed in as an administrator to execute cadet modifications.');
      return false;
    }
    const access = await checkAdminAccess(currentUser.email);
    if (!access.hasAccess) {
      showMsg('Security Block: Your account does not have approved administrative permissions.');
      return false;
    }
    return true;
  };

  const handlePurgeMockCadets = async () => {
    const isAuthorized = await verifyAdminClearance();
    if (!isAuthorized) return;

    if (
      !window.confirm(
        'Safely purge and strip all mock cadet profile records from Firestore database and local cache?'
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const purged = await purgeMockCadetData();
      await loadData();
      showMsg(`Successfully purged mock cadet data (${purged} records deleted from Firestore).`);
    } catch (err: any) {
      showMsg(`Purge error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (cadet: CadetProfileData) => {
    const isAuthorized = await verifyAdminClearance();
    if (!isAuthorized) return;

    const nextStatus = !cadet.isVerified;
    await setCadetVerificationStatus(cadet.uid, nextStatus);
    setCadets((prev) =>
      prev.map((c) => (c.uid === cadet.uid ? { ...c, isVerified: nextStatus } : c))
    );
    logCadetVerification(cadet.cadetId, cadet.fullName, nextStatus);

    if (nextStatus) {
      // Write verified cadet details directly to Google Sheets organized by active semester
      const activeSemester = getLocalSemesterSettings().currentSemester;
      appendCadetToGoogleSheet({ ...cadet, isVerified: true }, activeSemester).catch((sheetErr: any) => {
        console.warn('Could not sync verified cadet to Google Sheet:', sheetErr);
      });

      const emailResult = await sendCadetVerificationEmailNotification(cadet);
      if (emailResult.success) {
        showMsg(
          `Cadet ${cadet.fullName} (${cadet.cadetId}) has been VERIFIED & synced to Google Sheets (${activeSemester}). Email notification dispatched to ${cadet.email}!`
        );
      } else {
        showMsg(
          `Cadet ${cadet.fullName} (${cadet.cadetId}) has been VERIFIED & synced to Google Sheets (${activeSemester}).`
        );
      }
    } else {
      showMsg(
        `Cadet ${cadet.fullName} (${cadet.cadetId}) marked PENDING/UNVERIFIED. Hidden from public roster.`
      );
    }
  };

  const handleDeleteCadet = async (cadet: CadetProfileData) => {
    const isAuthorized = await verifyAdminClearance();
    if (!isAuthorized) return;

    const isPending = !cadet.isVerified;
    const confirmPrompt = isPending
      ? `Are you sure you want to REJECT and DELETE the pending cadet verification request for "${cadet.fullName}" (${cadet.cadetId})?`
      : `Are you sure you want to permanently DELETE the cadet record for "${cadet.fullName}" (${cadet.cadetId})?`;

    if (!window.confirm(confirmPrompt)) return;

    setLoading(true);
    try {
      await deleteCadet(cadet.uid);
      setCadets((prev) => prev.filter((c) => c.uid !== cadet.uid));
      if (selectedCadet?.uid === cadet.uid) {
        setSelectedCadet(null);
      }
      showMsg(
        isPending
          ? `Pending verification request for ${cadet.fullName} (${cadet.cadetId}) has been REJECTED and removed.`
          : `Cadet record for ${cadet.fullName} (${cadet.cadetId}) has been permanently deleted.`
      );
    } catch (err: any) {
      showMsg(`Failed to delete cadet: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredCadets = cadets.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.fullName.toLowerCase().includes(q) ||
      c.cadetId.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q) ||
      c.currentRank.toLowerCase().includes(q);

    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'verified'
        ? c.isVerified
        : !c.isVerified;

    const matchesType =
      typeFilter === 'all'
        ? true
        : typeFilter === 'excadet'
        ? c.cadetType === 'excadet'
        : c.cadetType !== 'excadet';

    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = cadets.filter((c) => !c.isVerified).length;
  const verifiedCount = cadets.filter((c) => c.isVerified).length;

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Top summary & controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white uppercase">
            Cadet Platoon Verification & Roster Control
          </h3>
          <p className="text-xs text-slate-500">
            Cadets must possess official administrative verification (<code className="text-red-600">isVerified: true</code>) before their profile and masked details appear in the public About Us directory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePurgeMockCadets}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 transition-colors"
            title="Cleanse all mock/demo cadet records from Firestore database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Purge Mock Cadets</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 transition-colors"
            title="Open official registered cadets census & printable report"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Cadet Census & Report</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Roster</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              filterStatus === 'all'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Cadets ({cadets.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('verified')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              filterStatus === 'verified'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Verified ({verifiedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              filterStatus === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Pending Verification ({pendingCount})
          </button>

          {/* Type Filter */}
          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors ${
                typeFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('cadet')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors ${
                typeFilter === 'cadet'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Cadets
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('excadet')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors ${
                typeFilter === 'excadet'
                  ? 'bg-amber-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Ex-Cadets
            </button>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Cadet ID, name, rank, dept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
      </div>

      {/* Cadets Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 font-mono">Cadet ID</th>
                <th className="py-3 px-4">Rank & Full Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 font-mono">Semester</th>
                <th className="py-3 px-4">Blood</th>
                <th className="py-3 px-4 text-center">Verification Status</th>
                <th className="py-3 px-4 text-center whitespace-nowrap min-w-[280px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCadets.length > 0 ? (
                filteredCadets.map((c) => (
                  <tr key={c.uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-red-600 dark:text-red-400">
                      {c.cadetId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{c.fullName}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                          {c.currentRank}
                        </span>
                        {c.cadetType === 'excadet' ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            Ex-Cadet
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            Cadet
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {c.department}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {c.currentSemester}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-rose-600 px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50">
                        {c.bloodGroup || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {c.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Pending Approval</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right min-w-[280px]">
                      <div className="flex flex-row items-center justify-end gap-1.5 flex-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedCadet(c)}
                          className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold shadow-2xs transition-colors shrink-0 whitespace-nowrap"
                          title="View Full Cadet Dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleVerification(c)}
                          className={`inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-white text-xs font-bold shadow-2xs transition-colors shrink-0 whitespace-nowrap ${
                            c.isVerified
                              ? 'bg-amber-600 hover:bg-amber-700'
                              : 'bg-emerald-600 hover:bg-emerald-700'
                          }`}
                          title={c.isVerified ? 'Revoke verification (Unverify)' : 'Verify cadet'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{c.isVerified ? 'Unverify' : 'Verify'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCadet(c)}
                          className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-lg border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-semibold shadow-2xs transition-colors shrink-0 whitespace-nowrap"
                          title={c.isVerified ? 'Delete cadet record' : 'Delete pending verification request'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No cadet records found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT CADET MODAL */}
      {selectedCadet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCadet.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={selectedCadet.fullName}
                  className="w-12 h-12 rounded-full object-cover border border-red-600"
                />
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white uppercase">
                    {selectedCadet.fullName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-bold text-red-600">
                      {selectedCadet.cadetId} · {selectedCadet.currentRank}
                    </span>
                    {selectedCadet.cadetType === 'excadet' ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        Ex-Cadet (Alumni)
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Cadet (Active)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCadet(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block">Cadet Category</span>
                  <span className={`font-bold ${selectedCadet.cadetType === 'excadet' ? 'text-amber-600' : 'text-blue-600'}`}>
                    {selectedCadet.cadetType === 'excadet' ? 'Ex-Cadet / Alumni' : 'Regular Active Cadet'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">
                    {selectedCadet.cadetType === 'excadet' ? 'Rank' : 'Current Rank'}
                  </span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">{selectedCadet.currentRank}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Department</span>
                  <span className="font-bold">{selectedCadet.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Current Semester</span>
                  <span className="font-mono font-bold">{selectedCadet.currentSemester}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Blood Group</span>
                  <span className="font-bold text-rose-600">{selectedCadet.bloodGroup}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Physical Stats</span>
                  <span className="font-mono">{selectedCadet.height || 'N/A'} · {selectedCadet.weight || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Email Address</span>
                  <span className="font-mono truncate block">{selectedCadet.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Phone / Mobile</span>
                  <span className="font-mono">{selectedCadet.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Emergency Contact</span>
                  <span className="font-mono">{selectedCadet.emergencyContact || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Verification Status</span>
                  <span className="font-bold text-emerald-600">
                    {selectedCadet.isVerified ? 'Verified Official' : 'Pending Verification'}
                  </span>
                </div>
              </div>

              {/* Honors and Accoutrements Summary */}

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="font-heading font-bold uppercase block text-slate-800 dark:text-slate-200">
                  Service Honors & Medals ({selectedCadet.serviceHonors?.length || 0})
                </span>
                {selectedCadet.serviceHonors && selectedCadet.serviceHonors.length > 0 ? (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {selectedCadet.serviceHonors.map((h) => (
                      <div key={h.id} className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40">
                        <div className="font-bold text-amber-900 dark:text-amber-200">{h.title} ({h.year})</div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">{h.awardingBody}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-[11px]">No service honors registered.</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleVerification(selectedCadet);
                      setSelectedCadet({ ...selectedCadet, isVerified: !selectedCadet.isVerified });
                    }}
                    className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-white ${
                      selectedCadet.isVerified ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {selectedCadet.isVerified ? 'Unverify' : 'Verify'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCadet(selectedCadet)}
                    className="px-3.5 py-2 rounded-lg font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 inline-flex items-center gap-1.5 transition-colors"
                    title="Delete cadet record or pending request"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCadet(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CADET CENSUS & REPORT MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
              <span className="font-heading text-sm font-bold uppercase text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-600" />
                <span>Official Registered Cadets Census & Roster Report</span>
              </span>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <AdminCadetReportsPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
