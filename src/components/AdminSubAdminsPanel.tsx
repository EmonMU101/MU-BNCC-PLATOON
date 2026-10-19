import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  UserPlus,
  Trash2,
  Crown,
  RefreshCw,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Shield,
} from 'lucide-react';
import {
  AdminUserRecord,
  AdminRole,
  SUPER_ADMIN_EMAIL,
  isSuperAdminEmail,
  fetchAdminUsers,
  approveSubAdmin,
  revokeSubAdmin,
  deleteSubAdmin,
  createPreApprovedSubAdmin,
} from '../services/adminAccessService';

interface AdminSubAdminsPanelProps {
  currentOfficerEmail?: string;
  onNotification?: (msg: string) => void;
  onUpdatePendingCount?: (count: number) => void;
}

export const AdminSubAdminsPanel: React.FC<AdminSubAdminsPanelProps> = ({
  currentOfficerEmail,
  onNotification,
  onUpdatePendingCount,
}) => {
  const [admins, setAdmins] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Form for pre-approving a new sub-admin
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('Sub-Admin');
  const [newNotes, setNewNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCurrentSuperAdmin = isSuperAdminEmail(currentOfficerEmail);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const records = await fetchAdminUsers();
      setAdmins(records);
      const pending = records.filter(
        (a) => a.status === 'pending' && !a.isSuperAdmin && !isSuperAdminEmail(a.email)
      ).length;
      onUpdatePendingCount?.(pending);
    } catch (err) {
      console.error('Error fetching admin records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleApprove = async (user: AdminUserRecord) => {
    if (!isCurrentSuperAdmin) {
      onNotification?.('Only Super Admin (rahadahmedemon11@gmail.com) can approve sub-admins.');
      return;
    }

    setActionLoadingId(user.id);
    try {
      await approveSubAdmin(user.id, currentOfficerEmail || SUPER_ADMIN_EMAIL);
      onNotification?.(`Sub-Admin access APPROVED for ${user.displayName} (${user.email}).`);
      await loadAdmins();
    } catch (err: any) {
      onNotification?.(err.message || 'Failed to approve sub-admin.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRevoke = async (user: AdminUserRecord) => {
    if (!isCurrentSuperAdmin) {
      onNotification?.('Only Super Admin (rahadahmedemon11@gmail.com) can revoke sub-admin access.');
      return;
    }

    if (user.isSuperAdmin || isSuperAdminEmail(user.email)) {
      onNotification?.('Super Admin root access cannot be revoked.');
      return;
    }

    if (!window.confirm(`Revoke administrative access for ${user.displayName} (${user.email})?`)) {
      return;
    }

    setActionLoadingId(user.id);
    try {
      await revokeSubAdmin(user.id, currentOfficerEmail || SUPER_ADMIN_EMAIL);
      onNotification?.(`Sub-Admin access REVOKED for ${user.email}.`);
      await loadAdmins();
    } catch (err: any) {
      onNotification?.(err.message || 'Failed to revoke sub-admin.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (user: AdminUserRecord) => {
    if (!isCurrentSuperAdmin) {
      onNotification?.('Only Super Admin (rahadahmedemon11@gmail.com) can delete records.');
      return;
    }

    if (user.isSuperAdmin || isSuperAdminEmail(user.email)) {
      onNotification?.('Super Admin record cannot be deleted.');
      return;
    }

    if (!window.confirm(`Permanently remove sub-admin record for ${user.email}?`)) {
      return;
    }

    setActionLoadingId(user.id);
    try {
      await deleteSubAdmin(user.id, currentOfficerEmail || SUPER_ADMIN_EMAIL);
      onNotification?.(`Sub-Admin record deleted for ${user.email}.`);
      await loadAdmins();
    } catch (err: any) {
      onNotification?.(err.message || 'Failed to delete record.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAddSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newEmail.trim() || !newEmail.includes('@')) {
      setFormError('Please provide a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPreApprovedSubAdmin(
        {
          email: newEmail.trim(),
          displayName: newName.trim() || newEmail.split('@')[0],
          role: newRole,
          notes: newNotes.trim(),
        },
        currentOfficerEmail || SUPER_ADMIN_EMAIL
      );

      onNotification?.(`Sub-Admin authorized & approved: ${newEmail.trim()}`);
      setNewEmail('');
      setNewName('');
      setNewNotes('');
      setShowAddModal(false);
      await loadAdmins();
    } catch (err: any) {
      setFormError(err.message || 'Failed to authorize sub-admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingRequests = admins.filter(
    (a) => a.status === 'pending' && !a.isSuperAdmin && !isSuperAdminEmail(a.email)
  );

  const approvedSubAdmins = admins.filter(
    (a) => a.status === 'approved' && !a.isSuperAdmin && !isSuperAdminEmail(a.email)
  );

  const revokedSubAdmins = admins.filter(
    (a) => a.status === 'revoked' && !a.isSuperAdmin && !isSuperAdminEmail(a.email)
  );

  return (
    <div className="space-y-6">
      {/* SECTION HEADER & SUPER ADMIN BADGE */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Crown className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Sub-Admin Authority & Officer Access
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Root administrative control. All subordinate officers and sub-admins must be verified and approved by the Super Admin.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAdmins}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {isCurrentSuperAdmin && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Authorize Sub-Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* ROOT SUPER ADMIN BANNER */}
        <div className="rounded-xl border border-amber-300/80 dark:border-amber-700/60 bg-gradient-to-r from-amber-50 via-amber-100/40 to-amber-50 dark:from-amber-950/40 dark:via-amber-900/20 dark:to-amber-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm shrink-0">
              <Crown className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-sm font-bold uppercase text-slate-900 dark:text-amber-100">
                  Rahad Ahmed Emon
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-amber-500 text-slate-950 tracking-wider">
                  Super Admin (Root)
                </span>
              </div>
              <p className="text-xs font-mono text-amber-900 dark:text-amber-300/90">
                {SUPER_ADMIN_EMAIL}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:self-center">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full Approver Rights</span>
            </span>
          </div>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Root Authority
            </div>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              1 Super Admin
            </div>
            <div className="text-[11px] text-slate-500 truncate">{SUPER_ADMIN_EMAIL}</div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Approved Sub-Admins
            </div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {approvedSubAdmins.length} Active
            </div>
            <div className="text-[11px] text-slate-500">Authorized platoon officers</div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Pending Approvals
            </div>
            <div className="text-lg font-bold text-red-600 dark:text-red-400 mt-0.5 flex items-center gap-2">
              <span>{pendingRequests.length}</span>
              {pendingRequests.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-red-100 text-red-700 animate-pulse font-mono">
                  Action Required
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500">Awaiting Super Admin clearance</div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Demo Access Status
            </div>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500" />
              <span>Removed</span>
            </div>
            <div className="text-[11px] text-slate-500">Credentials strictly enforced</div>
          </div>
        </div>
      </div>

      {/* PENDING APPROVAL QUEUE */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950 text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold uppercase text-slate-900 dark:text-white">
                Pending Sub-Admin Approvals ({pendingRequests.length})
              </h4>
              <p className="text-[11px] text-slate-500">
                Accounts registered or requesting subordinate administrative privileges
              </p>
            </div>
          </div>
        </div>

        {pendingRequests.length > 0 ? (
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {req.displayName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {req.role}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      <Clock className="w-3 h-3" />
                      Pending Super Admin Approval
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {req.email}
                    </span>
                    <span>Requested: {new Date(req.requestedAt).toLocaleDateString()}</span>
                  </div>
                  {req.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                      Note: "{req.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleApprove(req)}
                    disabled={actionLoadingId === req.id || !isCurrentSuperAdmin}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors disabled:opacity-50"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Approve Sub-Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(req)}
                    disabled={actionLoadingId === req.id || !isCurrentSuperAdmin}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
                    title="Dismiss Request"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Dismiss</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
            <span>No pending sub-admin requests. All officer accounts are verified.</span>
          </div>
        )}
      </div>

      {/* ACTIVE & AUTHORIZED SUB-ADMINS DIRECTORY */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm space-y-0">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="font-heading text-sm font-bold uppercase text-slate-900 dark:text-white">
              Authorized Sub-Admins Directory
            </h4>
            <p className="text-[11px] text-slate-500">
              Platoon officers with administrative clearance granted by the Super Admin
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Officer / Administrator</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Approved By</th>
                <th className="py-3 px-4 text-right whitespace-nowrap min-w-[180px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Permanent Super Admin Row */}
              <tr className="bg-amber-50/50 dark:bg-amber-950/20 font-medium">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Rahad Ahmed Emon</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                          ROOT
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">{SUPER_ADMIN_EMAIL}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500 text-slate-950">
                    Super Admin
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" />
                    Permanent Root
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                  System Master
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="text-[11px] text-slate-400 italic">Non-Revocable</span>
                </td>
              </tr>

              {/* Sub-Admins Rows */}
              {approvedSubAdmins.length > 0 ? (
                approvedSubAdmins.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{sub.displayName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{sub.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {sub.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        Approved
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-600 dark:text-slate-400">
                      <div>{sub.approvedBy || SUPER_ADMIN_EMAIL}</div>
                      {sub.approvedAt && (
                        <div className="text-[10px] font-mono text-slate-400">
                          {new Date(sub.approvedAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap min-w-[180px]">
                      <div className="flex flex-row items-center justify-end gap-1.5 flex-nowrap">
                        <button
                          type="button"
                          onClick={() => handleRevoke(sub)}
                          disabled={actionLoadingId === sub.id || !isCurrentSuperAdmin}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-xs font-semibold shadow-2xs transition-colors shrink-0 disabled:opacity-50"
                          title="Revoke / Suspend Sub-Admin privileges"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(sub)}
                          disabled={actionLoadingId === sub.id || !isCurrentSuperAdmin}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold shadow-2xs transition-colors shrink-0 disabled:opacity-50"
                          title="Delete sub-admin record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 font-mono text-xs">
                    No additional sub-admins currently approved. Use the "Authorize Sub-Admin" button above to grant officer privileges.
                  </td>
                </tr>
              )}

              {/* Revoked Sub-Admins */}
              {revokedSubAdmins.map((sub) => (
                <tr key={sub.id} className="bg-rose-50/20 dark:bg-rose-950/10 opacity-75">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-700 dark:text-slate-300 line-through">
                      {sub.displayName}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">{sub.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-600">
                      {sub.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                      <UserX className="w-3 h-3" />
                      Revoked
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-400 font-mono">
                    Suspended by Super Admin
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex flex-row items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleApprove(sub)}
                        disabled={actionLoadingId === sub.id || !isCurrentSuperAdmin}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Re-Authorize</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(sub)}
                        disabled={actionLoadingId === sub.id || !isCurrentSuperAdmin}
                        className="p-1 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AUTHORIZE NEW SUB-ADMIN MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <ShieldCheck className="w-5 h-5 text-red-600" />
                <h3 className="font-heading font-bold uppercase tracking-wider text-sm">
                  Authorize & Pre-Approve Sub-Admin
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubAdmin} className="space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Officer Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. officer@metrouni.edu.bd"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Full Name / Officer Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PUO Abu Yusuf Musa"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Sub-Admin Role *
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AdminRole)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600 font-medium"
                >
                  <option value="Sub-Admin">Sub-Admin (Standard Operator)</option>
                  <option value="Platoon Commander">Platoon Commander (PUO / Officer)</option>
                  <option value="Army Staff Instructor">Army Staff Instructor (CPL / SGT)</option>
                  <option value="Cadet Under Officer">Cadet Under Officer (CUO)</option>
                  <option value="Training Officer">Training Officer (Drill & Parade)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Authorization Notes / Appointment Order
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Authorized to verify intake applications and manage parade schedules."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold uppercase tracking-wider shadow-sm transition-colors disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Authorizing...' : 'Authorize Sub-Admin'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
