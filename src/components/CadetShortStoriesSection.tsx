import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Heart,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import {
  CadetStoryItem,
  INITIAL_STORIES,
  subscribeStories,
  toggleReactStory,
} from '../services/cadetPortalService';
import { useLanguage } from '../context/LanguageContext';
import { auth } from '../lib/firebase';

interface CadetShortStoriesSectionProps {
  className?: string;
  onOpenApply?: () => void;
}

export const CadetShortStoriesSection: React.FC<CadetShortStoriesSectionProps> = ({
  className = '',
}) => {
  const { isBn } = useLanguage();
  const [stories, setStories] = useState<CadetStoryItem[]>(INITIAL_STORIES);
  const [togglingStoryId, setTogglingStoryId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeStories((liveStories) => {
      if (liveStories && liveStories.length > 0) {
        setStories(liveStories);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleReaction = async (e: React.MouseEvent, storyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const uid = auth.currentUser?.uid || 'guest-visitor';
    setTogglingStoryId(storyId);
    try {
      const res = await toggleReactStory(storyId, uid);
      setStories((prev) =>
        prev.map((s) =>
          s.id === storyId
            ? {
                ...s,
                reactionsCount: res.reactionsCount,
                reactedUserIds: res.hasReacted
                  ? [...(s.reactedUserIds || []).filter((u) => u !== uid), uid]
                  : (s.reactedUserIds || []).filter((u) => u !== uid),
              }
            : s
        )
      );
    } finally {
      setTogglingStoryId(null);
    }
  };

  // Feature the top 3 recent / inspiring stories
  const featuredStories = stories.slice(0, 3);

  return (
    <section className={`space-y-6 ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isBn ? 'ক্যাডেট গল্প সম্ভার' : 'Cadet Short Stories'}</span>
          </div>
          <h3 className="font-heading text-2xl font-bold uppercase text-slate-900 dark:text-white mt-1">
            {isBn ? 'অনুপ্রেরণামূলক ফিল্ড ডেসপ্যাচ ও অভিজ্ঞতা' : 'Inspirational Field Dispatches & Stories'}
          </h3>
          <p className="text-xs text-slate-500 max-w-2xl mt-1">
            {isBn
              ? 'ক্যাম্প, কুচকাওয়াজ এবং বিশ্ববিদ্যালয় প্রাঙ্গণে এমইউ বিএনসিসি ক্যাডেটদের বাস্তব জীবনের আত্মত্যাগ ও নেতৃত্বের গল্প।'
              : 'Real moments of leadership, resilience, and squad camaraderie shared directly by Metropolitan University cadets.'}
          </p>
        </div>

        <Link
          to="/stories"
          className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline inline-flex items-center gap-1 font-mono uppercase tracking-wider shrink-0"
        >
          <span>{isBn ? 'সব গল্প ও ব্লগ পড়ুন' : 'Explore Blog & Stories'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featuredStories.map((story) => {
          const currentUid = auth.currentUser?.uid || 'guest-visitor';
          const hasReacted = story.reactedUserIds?.includes(currentUid) || false;

          return (
            <div
              key={story.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md transition-all hover:border-red-500/40 relative overflow-hidden"
            >
              {/* Category & Badge */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/40">
                    {story.category || 'Cadet Story'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(story.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Cadet Author Header */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0">
                    {story.authorAvatar ? (
                      <img
                        src={story.authorAvatar}
                        alt={story.authorName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                        {story.authorName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {story.authorName}
                    </div>
                    <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium truncate">
                      {story.authorRank || 'Cadet'} {story.authorDepartment || story.authorProfession ? `· ${story.authorDepartment || story.authorProfession}` : ''}
                    </div>
                  </div>
                </div>

                {/* Story Content Snippet */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic line-clamp-4 pt-1">
                  "{story.content}"
                </p>

                {/* Tags */}
                {story.tags && story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {story.tags.slice(0, 3).map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Reactions, Comments & Link */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-500">
                  <button
                    type="button"
                    onClick={(e) => handleReaction(e, story.id)}
                    disabled={togglingStoryId === story.id}
                    className={`inline-flex items-center gap-1 transition-colors ${
                      hasReacted ? 'text-red-600 dark:text-red-400 font-bold' : 'hover:text-red-600'
                    }`}
                    title="Inspiring story"
                  >
                    <Heart className={`w-3.5 h-3.5 ${hasReacted ? 'fill-current' : ''}`} />
                    <span>{story.reactionsCount || 0}</span>
                  </button>

                  <Link
                    to={`/stories?storyId=${story.id}`}
                    className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors"
                    title="View comments"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{story.comments?.length || 0}</span>
                  </Link>
                </div>

                <Link
                  to={`/stories?storyId=${story.id}`}
                  className="font-bold text-red-600 dark:text-red-400 hover:underline inline-flex items-center gap-1 text-[11px]"
                >
                  <span>{isBn ? 'বিস্তারিত পড়ুন' : 'Read Full Story'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sourced from Blog & Stories Banner Link */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white">
              {isBn ? 'এমইউ বিএনসিসি ব্লগ ও গল্প সম্ভার' : 'MU BNCC Blog & Stories Portal'}
            </div>
            <div className="text-slate-500 text-[11px]">
              {isBn
                ? 'ক্যাডেটদের লেখা সকল পূর্ণাঙ্গ ব্লগ আর্টিকেল ও ডেসপ্যাচ পড়তে আমাদের "Blog & Stories" বিভাগটি ভিজিট করুন।'
                : 'Browse full-length reflective camp articles, cadet stories, and reader discussions in our Blog & Stories section.'}
            </div>
          </div>
        </div>

        <Link
          to="/stories"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-red-700 text-white dark:bg-slate-800 dark:hover:bg-red-700 font-bold uppercase tracking-wider text-[11px] transition-colors shrink-0"
        >
          <span>{isBn ? 'ব্লগ ও গল্প পেইজে যান' : 'Go to Blog & Stories'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
};
