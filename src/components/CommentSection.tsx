import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Trash2,
  Lock,
  UserCheck,
  Shield,
  Award,
  AlertCircle,
  LogIn,
  CheckCircle2,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import {
  BlogComment,
  addBlogComment,
  addStoryComment,
  deleteBlogComment,
  deleteStoryComment,
  authenticateCadetWithId,
  getCachedCadets,
} from '../services/cadetPortalService';
import { auth } from '../lib/firebase';
import { useLanguage } from '../context/LanguageContext';

export interface CommentSectionProps {
  targetType: 'blog' | 'story';
  targetId: string;
  postTitle?: string;
  initialComments?: BlogComment[];
  onCommentCountChange?: (count: number, comments?: BlogComment[]) => void;
  className?: string;
}

interface ActiveUser {
  id: string;
  name: string;
  rank: string;
  role: string;
  avatar?: string;
  isCadet: boolean;
  cadetId?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  targetType,
  targetId,
  postTitle,
  initialComments = [],
  onCommentCountChange,
  className = '',
}) => {
  const { isBn } = useLanguage();

  const [comments, setComments] = useState<BlogComment[]>(() =>
    (initialComments || []).filter(Boolean)
  );
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Synchronize comments if initialComments update externally
  useEffect(() => {
    if (initialComments) {
      setComments((initialComments || []).filter(Boolean));
    }
  }, [initialComments]);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<ActiveUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'cadet' | 'supporter'>('cadet');

  // Cadet Auth Form
  const [cadetIdInput, setCadetIdInput] = useState('');
  const [cadetEmailInput, setCadetEmailInput] = useState('');
  const [cadetPassInput, setCadetPassInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Supporter Auth Form
  const [supporterName, setSupporterName] = useState('');
  const [supporterEmail, setSupporterEmail] = useState('');
  const [supporterRole, setSupporterRole] = useState('Supporter / Guest');

  // Check existing session on mount
  useEffect(() => {
    checkActiveSession();
  }, []);

  // Keep comments in sync if initialComments update
  useEffect(() => {
    if (initialComments) {
      setComments(initialComments);
    }
  }, [initialComments]);

  const checkActiveSession = () => {
    // 1. Check Cadet Session
    const savedCadet = localStorage.getItem('mu_bncc_active_cadet');
    if (savedCadet) {
      try {
        const cadet = JSON.parse(savedCadet);
        setCurrentUser({
          id: cadet.cadetId || cadet.uid || 'cadet-user',
          name: cadet.fullName || cadet.name || 'BNCC Cadet',
          rank: cadet.currentRank || cadet.rank || 'Cadet',
          role: 'Active BNCC Cadet',
          avatar: cadet.profilePicture,
          isCadet: true,
          cadetId: cadet.cadetId,
        });
        return;
      } catch {}
    }

    // 2. Check Officer/Admin Session
    const savedOfficer = localStorage.getItem('mu_bncc_officer_session');
    if (savedOfficer) {
      try {
        const officer = JSON.parse(savedOfficer);
        setCurrentUser({
          id: officer.uid || 'officer-user',
          name: officer.name || officer.email || 'Platoon Officer',
          rank: officer.role === 'admin' ? 'Platoon Commander' : 'Cadet Leader',
          role: 'Officer Command',
          avatar: officer.avatar,
          isCadet: true,
        });
        return;
      } catch {}
    }

    // 3. Check Reader Session
    const savedReader = localStorage.getItem('mu_bncc_comment_reader_user');
    if (savedReader) {
      try {
        const reader = JSON.parse(savedReader);
        setCurrentUser(reader);
        return;
      } catch {}
    }

    // 4. Check Firebase Auth
    if (auth.currentUser) {
      setCurrentUser({
        id: auth.currentUser.uid,
        name: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Cadet Reader',
        rank: 'Verified Member',
        role: 'Authenticated User',
        avatar: auth.currentUser.photoURL || undefined,
        isCadet: false,
      });
      return;
    }

    setCurrentUser(null);
  };

  const handleCadetLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cadetIdInput.trim()) {
      setAuthError(isBn ? 'ক্যাডেট আইডি প্রদান করুন।' : 'Please enter your Cadet ID.');
      return;
    }

    setIsAuthenticating(true);
    setAuthError('');

    try {
      const res = await authenticateCadetWithId(
        cadetIdInput.trim(),
        cadetEmailInput.trim(),
        cadetPassInput.trim()
      );

      if (res.success && res.cadet) {
        const userObj: ActiveUser = {
          id: res.cadet.cadetId,
          name: res.cadet.fullName,
          rank: res.cadet.currentRank,
          role: 'BNCC Cadet',
          avatar: res.cadet.profilePicture,
          isCadet: true,
          cadetId: res.cadet.cadetId,
        };
        localStorage.setItem('mu_bncc_active_cadet', JSON.stringify(res.cadet));
        setCurrentUser(userObj);
        setShowAuthModal(false);
        setFeedbackMsg({
          type: 'success',
          text: isBn ? `স্বাগতম, ${userObj.rank} ${userObj.name}!` : `Welcome, ${userObj.rank} ${userObj.name}!`,
        });
      } else {
        setAuthError(res.error || (isBn ? 'লগইন ব্যর্থ হয়েছে।' : 'Authentication failed. Please check credentials.'));
      }
    } catch {
      setAuthError(isBn ? 'লগইনে সমস্যা হয়েছে।' : 'An error occurred during authentication.');
    } finally {
      setIsAuthenticating(false);
    }
  };



  const handleSupporterLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supporterName.trim()) {
      setAuthError(isBn ? 'আপনার নাম লিখুন।' : 'Please enter your name.');
      return;
    }

    const userObj: ActiveUser = {
      id: `reader-${Date.now()}`,
      name: supporterName.trim(),
      rank: supporterRole,
      role: 'Registered Supporter',
      isCadet: false,
    };

    localStorage.setItem('mu_bncc_comment_reader_user', JSON.stringify(userObj));
    setCurrentUser(userObj);
    setShowAuthModal(false);
    setFeedbackMsg({
      type: 'success',
      text: isBn ? `স্বাগতম, ${userObj.name}!` : `Welcome, ${userObj.name}!`,
    });
  };

  const handleSignOut = () => {
    localStorage.removeItem('mu_bncc_comment_reader_user');
    // Note: don't clear officer or cadet if they want to keep portal login, but clear reader session
    setCurrentUser(null);
    setFeedbackMsg({
      type: 'success',
      text: isBn ? 'সফলভাবে সাইন আউট করা হয়েছে।' : 'Signed out from commenting.',
    });
  };

  // Submit comment to Firestore
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    const trimmed = commentText.trim();
    if (!trimmed || trimmed.length < 2) {
      setFeedbackMsg({
        type: 'error',
        text: isBn ? 'অনুগ্রহ করে ন্যূনতম ২ অক্ষরের মন্তব্য লিখুন।' : 'Comment must be at least 2 characters.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const commentPayload = {
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRank: currentUser.rank || 'Reader',
        content: trimmed,
      };

      let newComment: BlogComment;
      if (targetType === 'blog') {
        newComment = await addBlogComment(targetId, commentPayload);
      } else {
        newComment = await addStoryComment(targetId, commentPayload);
      }

      const updated = [...comments, newComment];
      setComments(updated);
      setCommentText('');
      if (onCommentCountChange) onCommentCountChange(updated.length, updated);

      setFeedbackMsg({
        type: 'success',
        text: isBn ? 'আপনার মন্তব্য সফলভাবে প্রকাশ করা হয়েছে।' : 'Comment posted successfully!',
      });
    } catch {
      setFeedbackMsg({
        type: 'error',
        text: isBn ? 'মন্তব্য প্রকাশ করতে ব্যর্থ হয়েছে।' : 'Failed to publish comment to database.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete comment from Firestore
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm(isBn ? 'আপনি কি নিশ্চিত যে এই মন্তব্যটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this comment?')) {
      return;
    }

    setDeletingCommentId(commentId);
    try {
      let success = false;
      if (targetType === 'blog') {
        success = await deleteBlogComment(targetId, commentId);
      } else {
        success = await deleteStoryComment(targetId, commentId);
      }

      if (success) {
        const updated = comments.filter((c) => c.id !== commentId);
        setComments(updated);
        if (onCommentCountChange) onCommentCountChange(updated.length, updated);
        setFeedbackMsg({
          type: 'success',
          text: isBn ? 'মন্তব্য মুছে ফেলা হয়েছে।' : 'Comment removed.',
        });
      }
    } catch {
      setFeedbackMsg({
        type: 'error',
        text: isBn ? 'মন্তব্য মুছতে ব্যর্থ হয়েছে।' : 'Failed to remove comment.',
      });
    } finally {
      setDeletingCommentId(null);
    }
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return isBn ? 'সম্প্রতি' : 'Recently';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return isBn ? 'এইমাত্র' : 'Just now';
      if (diffMins < 60) return isBn ? `${diffMins} মিনিট আগে` : `${diffMins}m ago`;
      if (diffHours < 24) return isBn ? `${diffHours} ঘন্টা আগে` : `${diffHours}h ago`;
      if (diffDays < 7) return isBn ? `${diffDays} দিন আগে` : `${diffDays}d ago`;

      return date.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Counter */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-white">
              {isBn ? 'পাঠক মন্তব্য ও প্রতিক্রিয়া' : 'Reader Comments & Feedback'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {postTitle ? (
                <span>
                  {isBn ? 'প্রবন্ধ:' : 'Discussion on:'} <strong className="text-slate-700 dark:text-slate-300 font-medium">"{postTitle}"</strong>
                </span>
              ) : (
                isBn ? 'আপনার গঠনমূলক মতামত ও শুভেচ্ছা জানান' : 'Direct feedback and reflections'
              )}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <span>{comments.length}</span>
          <span>{isBn ? 'মন্তব্য' : 'Comments'}</span>
        </span>
      </div>

      {/* Status / Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium animate-in fade-in duration-150 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Authenticated User Status or Lock Barrier */}
      {currentUser ? (
        <div className="bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-3">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover border border-red-500/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {currentUser.name}
                  </span>
                  {currentUser.isCadet && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                      <Award className="w-3 h-3" />
                      <span>{currentUser.cadetId || 'CADET'}</span>
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {currentUser.rank} • {currentUser.role}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs text-slate-400 hover:text-red-600 dark:hover:text-red-400 underline transition-colors"
            >
              {isBn ? 'লগআউট' : 'Switch account'}
            </button>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <div className="relative">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={600}
                rows={3}
                placeholder={
                  isBn
                    ? 'আপনার চিন্তাভাবনা, ক্যাডেটদের প্রতি শুভেচ্ছা বা মতামত সরাসরি লিখুন...'
                    : 'Write your reflection, encouragement, or constructive feedback directly on this post...'
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all resize-y"
              />
              <div className="absolute right-3 bottom-3 text-[10px] font-mono text-slate-400">
                {commentText.length}/600
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                {isBn ? 'মার্জিত ও সম্মানজনক ভাষা বজায় রাখুন।' : 'Military courtesy & respect requested.'}
              </span>

              <button
                type="submit"
                disabled={isSubmitting || !commentText.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-red-700 hover:bg-red-800 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 ml-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>{isBn ? 'পোস্ট হচ্ছে...' : 'Posting...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{isBn ? 'মন্তব্য প্রকাশ করুন' : 'Post Comment'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Authentication Required Card */
        <div className="rounded-2xl border border-dashed border-red-300/80 dark:border-red-900/60 bg-gradient-to-br from-red-50/50 via-white to-amber-50/30 dark:from-red-950/20 dark:via-slate-900 dark:to-slate-900/60 p-6 sm:p-7 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center shadow-xs">
            <Lock className="w-6 h-6" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h4 className="font-heading text-base sm:text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-white">
              {isBn ? 'মন্তব্য পোস্ট করতে সাইন ইন করুন' : 'Authentication Required to Post'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isBn
                ? 'প্লাটুন শৃঙ্খলা ও নিরাপত্তা বজায় রাখতে কেবল যাচাইকৃত ক্যাডেট, সাবেক শিক্ষার্থী এবং নিবন্ধিত পাঠকরা মন্তব্য প্রকাশ করতে পারেন।'
                : 'To maintain platoon discipline and respectful dialogue, only authenticated BNCC cadets and verified readers can post comments.'}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setAuthTab('cadet');
                setShowAuthModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-red-700 hover:bg-red-800 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-red-700/20 transition-all active:scale-95"
            >
              <Shield className="w-4 h-4" />
              <span>{isBn ? 'ক্যাডেট আইডি দিয়ে সাইন ইন' : 'Sign In with Cadet ID'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthTab('supporter');
                setShowAuthModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>{isBn ? 'পাঠক হিসেবে যোগ দিন' : 'Sign In as Reader'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4 pt-2">
        {comments.filter(Boolean).length > 0 ? (
          comments.filter(Boolean).map((comment) => {
            const isAuthor =
              currentUser &&
              (currentUser.id === comment.authorId ||
                currentUser.name.toLowerCase() === comment.authorName.toLowerCase());
            const isDeleting = deletingCommentId === comment.id;

            return (
              <div
                key={comment.id}
                className="group rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-3 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                      {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {comment.authorName}
                        </span>
                        {comment.authorRank && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-200/50 dark:border-red-800">
                            <Shield className="w-2.5 h-2.5" />
                            <span>{comment.authorRank}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                        {formatTimestamp(comment.createdAt)}
                      </span>
                    </div>
                  </div>

                  {isAuthor && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={isDeleting}
                      title={isBn ? 'মন্তব্য মুছুন' : 'Delete comment'}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors opacity-75 group-hover:opacity-100"
                    >
                      {isDeleting ? (
                        <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-12 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-6 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
              {isBn
                ? 'এখনো কোনো মন্তব্য নেই। প্রথম পাঠক হিসেবে আপনার অনুপ্রেরণা বা ভাবনা শেয়ার করুন!'
                : 'No reader comments yet. Be the first to share your reflection on this dispatch!'}
            </p>
          </div>
        )}
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950 text-red-600">
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading text-base font-bold uppercase text-slate-900 dark:text-white">
                    {isBn ? 'মন্তব্য যাচাইকরণ সাইন ইন' : 'Authenticate to Comment'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isBn ? 'ক্যাডেট আইডি অথবা পাঠক প্রোফাইল' : 'Cadet ID or Verified Reader'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthError('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            {/* Segmented Auth Selector */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('cadet');
                  setAuthError('');
                }}
                className={`py-2 rounded-lg transition-all ${
                  authTab === 'cadet'
                    ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isBn ? 'ক্যাডেট লগইন' : 'Cadet Sign In'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('supporter');
                  setAuthError('');
                }}
                className={`py-2 rounded-lg transition-all ${
                  authTab === 'supporter'
                    ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isBn ? 'পাঠক / ভিজিটর' : 'Reader / Supporter'}
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-xs border border-red-200 dark:border-red-900">
                {authError}
              </div>
            )}

            {authTab === 'cadet' ? (
              <form onSubmit={handleCadetLogin} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-500 mb-1">
                    {isBn ? 'ক্যাডেট আইডি (যেমন: MU-BNCC-001)' : 'Cadet ID (e.g. MU-BNCC-001)'}
                  </label>
                  <input
                    type="text"
                    value={cadetIdInput}
                    onChange={(e) => setCadetIdInput(e.target.value)}
                    placeholder="MU-BNCC-001"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white uppercase font-mono focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-500 mb-1">
                    {isBn ? 'রেজিস্টার্ড ইমেইল (ঐচ্ছিক)' : 'Registered Email (optional)'}
                  </label>
                  <input
                    type="email"
                    value={cadetEmailInput}
                    onChange={(e) => setCadetEmailInput(e.target.value)}
                    placeholder="cadet@example.com"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-500 mb-1">
                    {isBn ? 'পাসওয়ার্ড (ডিফল্ট: 123456)' : 'Password (default: 123456)'}
                  </label>
                  <input
                    type="password"
                    value={cadetPassInput}
                    onChange={(e) => setCadetPassInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full rounded-xl bg-red-700 hover:bg-red-800 text-white py-2.5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {isAuthenticating
                    ? (isBn ? 'যাচাই করা হচ্ছে...' : 'Verifying...')
                    : (isBn ? 'ক্যাডেট হিসেবে সাইন ইন' : 'Sign In as Cadet')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSupporterLogin} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-500 mb-1">
                    {isBn ? 'আপনার পূর্ণ নাম' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={supporterName}
                    onChange={(e) => setSupporterName(e.target.value)}
                    placeholder="e.g. Prof. Anisur Rahman"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-500 mb-1">
                    {isBn ? 'ইমেইল ঠিকানা' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={supporterEmail}
                    onChange={(e) => setSupporterEmail(e.target.value)}
                    placeholder="supporter@example.com"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-500 mb-1">
                    {isBn ? 'ভূমিকা / পরিচয়' : 'Reader Role / Identity'}
                  </label>
                  <select
                    value={supporterRole}
                    onChange={(e) => setSupporterRole(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                  >
                    <option value="University Faculty">University Faculty</option>
                    <option value="MU Alumni">MU Alumni / Ex-Cadet</option>
                    <option value="University Student">University Student</option>
                    <option value="Armed Forces Veteran">Armed Forces Veteran</option>
                    <option value="Community Supporter">Community Supporter</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-red-700 hover:bg-red-800 text-white py-2.5 text-xs font-bold uppercase tracking-wider transition-all"
                >
                  {isBn ? 'পাঠক হিসেবে যোগ দিন' : 'Continue to Comment'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
