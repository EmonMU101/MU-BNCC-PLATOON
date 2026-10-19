import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ShieldAlert, ShieldCheck, RefreshCw, LogOut, Lock, Crown } from 'lucide-react';
import { auth } from '../lib/firebase';
import { BnccCrest } from './BnccCrest';
import {
  checkAdminAccess,
  isSuperAdminEmail,
  SUPER_ADMIN_EMAIL,
} from '../services/adminAccessService';

export interface AdminRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AdminRoute Guard:
 * Enforces Role-Based Access Control (RBAC):
 * - Super Admin (rahadahmedemon11@gmail.com) has unconditional root access.
 * - Sub-Admins must be approved by the Super Admin in the admin registry.
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children, fallback }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [hasAdminClaim, setHasAdminClaim] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [tokenClaims, setTokenClaims] = useState<Record<string, any>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const verifyClaims = async (currentUser: User) => {
    setClaimsLoading(true);
    setErrorMsg(null);
    try {
      const email = currentUser.email;
      if (!email) {
        setHasAdminClaim(false);
        setIsSuperAdmin(false);
        setClaimsLoading(false);
        return;
      }

      // 1. Force refresh token to get latest claims directly from Firebase Auth servers
      const tokenResult = await currentUser.getIdTokenResult(true);
      const claims = tokenResult.claims || {};
      setTokenClaims(claims);

      // Check if user has explicit custom claim set by Firebase Admin SDK
      const hasCustomAdminClaim = Boolean(
        claims.admin === true ||
        claims.role === 'admin' ||
        claims.super_admin === true
      );

      // 2. Root Super Admin Check:
      // Require email match AND email verification (or Google OAuth provider proof)
      // to eliminate unverified email spoofing attacks
      const isGoogleAuth = currentUser.providerData.some((p) => p.providerId === 'google.com');
      const isEmailVerified = currentUser.emailVerified || isGoogleAuth;

      if (isSuperAdminEmail(email) && isEmailVerified) {
        setIsSuperAdmin(true);
        setHasAdminClaim(true);
        setTokenClaims({
          role: 'Super Admin',
          admin: true,
          status: 'approved',
          verifiedEmail: true,
          ...claims,
        });
        return;
      }

      if (hasCustomAdminClaim) {
        setIsSuperAdmin(Boolean(claims.super_admin));
        setHasAdminClaim(true);
        return;
      }

      // 3. Sub-Admin Approval Verification against Firestore database directly
      const access = await checkAdminAccess(email);
      if (access.hasAccess && isEmailVerified) {
        setIsSuperAdmin(false);
        setHasAdminClaim(true);
        setTokenClaims({ role: access.role, admin: true, status: 'approved' });
        return;
      }

      setIsSuperAdmin(false);
      setHasAdminClaim(false);
    } catch (err: any) {
      console.error('Failed to verify security credentials:', err);
      setErrorMsg(err.message || 'Error checking admin clearance');
      setHasAdminClaim(false);
      setIsSuperAdmin(false);
    } finally {
      setClaimsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        await verifyClaims(currentUser);
      } else {
        // No unauthenticated access permitted: Never trust raw localStorage for route clearance!
        setIsSuperAdmin(false);
        setHasAdminClaim(false);
        setClaimsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (authLoading || claimsLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-red-600 border-t-transparent" />
        <p className="text-xs font-mono uppercase tracking-wider text-slate-500">
          Verifying 'admin' custom claim & RBAC clearance...
        </p>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return fallback ? <>{fallback}</> : (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <Lock className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold font-heading uppercase text-slate-900 dark:text-white">
          Authentication Required
        </h2>
        <p className="text-xs text-slate-500">
          Sign in to verify administrative credentials and custom claims.
        </p>
      </div>
    );
  }

  // Signed in but does NOT have 'admin' custom claim
  if (!hasAdminClaim) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <div className="rounded-3xl border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/30 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-red-600 text-white shrink-0 shadow-sm">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/80 text-red-700 dark:text-red-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                Sub-Admin Clearance Required · 403 Forbidden
              </span>
              <h2 className="text-2xl font-heading font-extrabold uppercase text-red-950 dark:text-red-200">
                Super Admin Approval Required
              </h2>
              <p className="text-xs text-red-800 dark:text-red-300/80 leading-relaxed">
                Management functions are strictly restricted. The authenticated account ({user?.email}) must be approved as a Sub-Admin by the Super Admin (<strong className="font-mono text-red-950 dark:text-red-100">{SUPER_ADMIN_EMAIL}</strong>).
              </p>
            </div>
          </div>

          {/* Claim Inspection Card */}
          <div className="rounded-2xl border border-red-200 dark:border-red-900/80 bg-white dark:bg-slate-900 p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-mono text-slate-400 uppercase text-[10px]">Security Claim Audit</span>
              <span className="font-mono font-bold text-red-600">CLAIM STATUS: MISSING</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">ACCOUNT EMAIL:</span>
                <span className="font-semibold">{user?.email || 'Authenticated User'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">USER UID:</span>
                <span className="font-mono text-[11px] truncate block">{user?.uid || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">VERIFIED CLAIMS:</span>
                <span className="font-mono text-[11px]">
                  {Object.keys(tokenClaims).length > 0
                    ? JSON.stringify(tokenClaims)
                    : '{ "admin": false }'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">REQUIRED CUSTOM CLAIM:</span>
                <span className="font-mono text-emerald-600 font-bold">{'{ "admin": true }'}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => user && verifyClaims(user)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Token Claims</span>
            </button>

            <button
              type="button"
              onClick={() => auth.signOut()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign In with Different Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authorized with 'admin' custom claim
  return <>{children}</>;
};

export default AdminRoute;
