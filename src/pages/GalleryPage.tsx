import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  MessageSquare,
  Search,
  Calendar,
  Sparkles,
  RotateCcw,
  Plus,
  Heart,
  ChevronRight,
  X,
  CheckCircle2,
  Briefcase,
  Flame,
  ArrowRight,
} from 'lucide-react';
import {
  CadetStoryItem,
  CadetBlogItem,
  subscribeStories,
  subscribeBlogs,
  createStory,
  createBlog,
  toggleReactStory,
  toggleReactBlog,
  addBlogComment,
  addStoryComment,
} from '../services/cadetPortalService';
import { createPost } from '../services/postService';
import { CommentSection } from '../components/CommentSection';
import { SEOHead } from '../components/SEOHead';
import { useLanguage } from '../context/LanguageContext';
import { auth } from '../lib/firebase';

const BLOG_CATEGORIES = [
  'All',
  'Regimental Camp',
  'Weapon & Firing',
  'Leadership & Discipline',
  'Field Training & Drills',
  'University Life & Studies',
  'Humanitarian Relief',
];

const PROFESSIONS = [
  'Student / BNCC Cadet',
  'Software Engineer',
  'Teacher / Faculty',
  'Doctor / Healthcare',
  'Business Professional',
  'Armed Forces Aspirant',
  'Alumni / Ex-Cadet',
  'Parent / Guardian',
  'Other Supporter',
];

export const GalleryPage: React.FC = () => {
  const { isBn } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Main Hub Tab: 'all' | 'blogs' | 'stories'
  const initialTabParam = searchParams.get('tab');
  const initialTab: 'all' | 'blogs' | 'stories' =
    initialTabParam === 'blogs' || initialTabParam === 'stories' ? initialTabParam : 'all';
  const [activeTab, setActiveTab] = useState<'all' | 'blogs' | 'stories'>(initialTab);

  // Synchronize URL search param when tab changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['all', 'blogs', 'stories'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl as 'all' | 'blogs' | 'stories');
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'all' | 'blogs' | 'stories') => {
    setActiveTab(tab);
    setSearchParams(tab === 'all' ? {} : { tab });
  };

  // ==========================================
  // DATA STATES
  // ==========================================
  const [blogs, setBlogs] = useState<CadetBlogItem[]>([]);
  const [stories, setStories] = useState<CadetStoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search & Sort
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');

  // Blog Category Filter
  const [selectedBlogCategory, setSelectedBlogCategory] = useState<string>('All');

  // Reader Modal State (Blogs & Stories)
  const [readingBlog, setReadingBlog] = useState<CadetBlogItem | null>(null);
  const [readingStory, setReadingStory] = useState<CadetStoryItem | null>(null);

  // Create Story / Blog Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createMode, setCreateMode] = useState<'story' | 'blog'>('story');
  const [notification, setNotification] = useState<string | null>(null);

  // New Story Form State
  const [storyAuthorName, setStoryAuthorName] = useState('');
  const [storyProfession, setStoryProfession] = useState(PROFESSIONS[0]);
  const [storyInstitution, setStoryInstitution] = useState('Metropolitan University, Sylhet');
  const [storyContent, setStoryContent] = useState('');
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);

  // New Blog Form State
  const [blogTitle, setBlogTitle] = useState('');
  const [blogAuthorName, setBlogAuthorName] = useState('');
  const [blogAuthorRank, setBlogAuthorRank] = useState('Cadet');
  const [blogCategory, setBlogCategory] = useState(BLOG_CATEGORIES[1]);
  const [blogCoverUrl, setBlogCoverUrl] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [isSubmittingBlog, setIsSubmittingBlog] = useState(false);

  // Real-time Firestore Subscriptions
  useEffect(() => {
    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount >= 2) setIsLoading(false);
    };

    const unsubStories = subscribeStories((liveStories) => {
      setStories(liveStories || []);
      checkLoaded();
    });

    const unsubBlogs = subscribeBlogs((liveBlogs) => {
      setBlogs(liveBlogs || []);
      checkLoaded();
    });

    return () => {
      unsubStories();
      unsubBlogs();
    };
  }, []);

  const showMsg = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtered Blogs
  const filteredBlogs = useMemo(() => {
    return blogs
      .filter((b) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          b.title.toLowerCase().includes(q) ||
          b.content.toLowerCase().includes(q) ||
          b.authorName.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q);

        const matchesCat =
          selectedBlogCategory === 'All' ||
          b.category.toLowerCase() === selectedBlogCategory.toLowerCase();

        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') {
          return (b.reactionsCount || 0) - (a.reactionsCount || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [blogs, searchQuery, selectedBlogCategory, sortBy]);

  // Filtered Stories
  const filteredStories = useMemo(() => {
    return stories
      .filter((s) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          !q ||
          s.content.toLowerCase().includes(q) ||
          s.authorName.toLowerCase().includes(q) ||
          (s.authorProfession && s.authorProfession.toLowerCase().includes(q)) ||
          (s.authorInstitution && s.authorInstitution.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'popular') {
          return (b.reactionsCount || 0) - (a.reactionsCount || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [stories, searchQuery, sortBy]);

  const totalEntries = blogs.length + stories.length;

  const handleResetFilters = () => {
    setSelectedBlogCategory('All');
    setSearchQuery('');
    setSortBy('newest');
  };

  // Reactions
  const handleReactStory = async (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation();
    const userUid =
      auth.currentUser?.uid ||
      'guest-user-' + (localStorage.getItem('guest_id') || Math.random().toString(36).slice(2, 8));
    localStorage.setItem('guest_id', userUid);
    const result = await toggleReactStory(storyId, userUid);
    setStories((prev) =>
      prev.map((s) =>
        s.id === storyId
          ? {
              ...s,
              reactionsCount: result.reactionsCount,
              reactedUserIds: result.hasReacted
                ? [...(s.reactedUserIds || []).filter((u) => u !== userUid), userUid]
                : (s.reactedUserIds || []).filter((u) => u !== userUid),
            }
          : s
      )
    );
    if (readingStory && readingStory.id === storyId) {
      setReadingStory((prev) =>
        prev
          ? {
              ...prev,
              reactionsCount: result.reactionsCount,
              reactedUserIds: result.hasReacted
                ? [...(prev.reactedUserIds || []).filter((u) => u !== userUid), userUid]
                : (prev.reactedUserIds || []).filter((u) => u !== userUid),
            }
          : null
      );
    }
  };

  const handleReactBlog = async (e: React.MouseEvent, blogId: string) => {
    e.stopPropagation();
    const userUid =
      auth.currentUser?.uid ||
      'guest-user-' + (localStorage.getItem('guest_id') || Math.random().toString(36).slice(2, 8));
    localStorage.setItem('guest_id', userUid);
    const result = await toggleReactBlog(blogId, userUid);
    setBlogs((prev) =>
      prev.map((b) =>
        b.id === blogId
          ? {
              ...b,
              reactionsCount: result.reactionsCount,
              reactedUserIds: result.hasReacted
                ? [...(b.reactedUserIds || []).filter((u) => u !== userUid), userUid]
                : (b.reactedUserIds || []).filter((u) => u !== userUid),
            }
          : b
      )
    );
    if (readingBlog && readingBlog.id === blogId) {
      setReadingBlog((prev) =>
        prev
          ? {
              ...prev,
              reactionsCount: result.reactionsCount,
              reactedUserIds: result.hasReacted
                ? [...(prev.reactedUserIds || []).filter((u) => u !== userUid), userUid]
                : (prev.reactedUserIds || []).filter((u) => u !== userUid),
            }
          : null
      );
    }
  };

  // Deep-link check for specific story or blog
  useEffect(() => {
    const sId = searchParams.get('storyId');
    const bId = searchParams.get('blogId');
    if (sId && stories.length > 0) {
      const match = stories.find((s) => s.id === sId);
      if (match) setReadingStory(match);
    }
    if (bId && blogs.length > 0) {
      const match = blogs.find((b) => b.id === bId);
      if (match) setReadingBlog(match);
    }
  }, [searchParams, stories, blogs]);

  // Submit Story
  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyAuthorName.trim() || !storyContent.trim()) {
      showMsg('Please fill in author name and story reflection.');
      return;
    }

    setIsSubmittingStory(true);
    try {
      await createStory({
        cadetId: 'VISITOR',
        authorName: storyAuthorName.trim(),
        authorRank: 'Visitor / Supporter',
        authorRole: 'Community Contributor',
        authorProfession: storyProfession,
        authorInstitution: storyInstitution.trim(),
        content: storyContent.trim(),
      });

      setStoryAuthorName('');
      setStoryContent('');
      setIsCreateModalOpen(false);
      showMsg('Your story reflection was shared successfully!');
    } catch {
      showMsg('Could not submit story reflection.');
    } finally {
      setIsSubmittingStory(false);
    }
  };

  // Submit Blog
  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogAuthorName.trim() || !blogContent.trim()) {
      showMsg('Please provide a title, author name, and article content.');
      return;
    }

    setIsSubmittingBlog(true);
    try {
      await createBlog({
        cadetId: 'MU-BNCC-CONTRIB',
        authorName: blogAuthorName.trim(),
        authorRank: blogAuthorRank,
        title: blogTitle.trim(),
        category: blogCategory,
        content: blogContent.trim(),
        coverImage: blogCoverUrl.trim() || undefined,
      });

      try {
        await createPost({
          title: blogTitle.trim(),
          content: blogContent.trim(),
          author: blogAuthorName.trim(),
          authorRole: blogAuthorRank || 'Cadet',
          postType: 'blog',
          category: blogCategory,
          coverImage: blogCoverUrl.trim() || undefined,
          timestamp: new Date().toISOString(),
          published: true,
          tags: [blogCategory, 'Blog'],
        });
      } catch (postSyncErr) {
        console.warn('Silent sync to posts notice:', postSyncErr);
      }

      setBlogTitle('');
      setBlogAuthorName('');
      setBlogContent('');
      setBlogCoverUrl('');
      setIsCreateModalOpen(false);
      showMsg('Cadet blog dispatch published successfully!');
    } catch {
      showMsg('Could not submit blog dispatch.');
    } finally {
      setIsSubmittingBlog(false);
    }
  };

  return (
    <>
      <SEOHead
        title={
          isBn
            ? 'ব্লগ ও গল্প সম্ভার · মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি'
            : 'Blog & Stories · Metropolitan University BNCC'
        }
        description={
          isBn
            ? 'মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি প্লাটুনের শিক্ষণীয় ব্লগ, মাঠপর্যায়ের রিপোর্ট এবং ক্যাডেট ও শুভাকাঙ্ক্ষীদের অনুপ্রেরণামূলক ছোট গল্প সম্ভার।'
            : 'Explore inspiring cadet dispatches, training chronicles, leadership articles, and micro-stories from Metropolitan University BNCC.'
        }
        keywords={[
          'MU BNCC Blog',
          'Cadet Stories',
          'BNCC Dispatches',
          'Cadet Articles',
          'Mainamati Regiment',
          'Sylhet BNCC Stories',
        ]}
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-20">
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-20 right-4 z-50 rounded-xl bg-emerald-600 text-white px-4 py-3 text-xs font-bold shadow-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* TOP HERO HEADER SECTION */}
        {/* ======================================================== */}
        <div className="relative border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/40 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 py-12 sm:py-16 overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-4 py-1.5 shadow-xs text-xs font-mono font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              <span className="h-2 w-2 rounded-full bg-red-600" />
              <span>{isBn ? 'ক্যাডেট ব্লগ ও গল্প সম্ভার' : 'Dispatches & Narratives Hub'}</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-slate-950 dark:text-white leading-tight">
                  {isBn ? 'ব্লগ ও' : 'Blog &'}{' '}
                  <span className="text-red-600 dark:text-red-500">
                    {isBn ? 'ক্যাডেট গল্প সম্ভার' : 'Stories'}
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  {isBn
                    ? 'মেট্রোপলিটন ইউনিভার্সিটি প্লাটুনের ক্যাডেটদের মাঠপর্যায়ের অভিজ্ঞতা, নেতৃত্ব ও শৃঙ্খলার স্মৃতিকথা এবং সকল শুভাকাঙ্ক্ষীদের বাস্তব জীবনের গল্প।'
                    : 'A dedicated hub for reflective articles, field drill dispatches, and authentic micro-stories shared directly by Metropolitan University cadets and supporters.'}
                </p>
              </div>

              {/* Statistics Badges & Primary Actions */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center min-w-[95px]">
                  <span className="block font-heading text-xl font-bold text-red-600 dark:text-red-400">
                    {blogs.length}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {isBn ? 'ব্লগ ও নিবন্ধ' : 'Blogs'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center min-w-[95px]">
                  <span className="block font-heading text-xl font-bold text-amber-500">
                    {stories.length}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {isBn ? 'ছোট গল্প' : 'Stories'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-700 hover:bg-red-800 text-white px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-red-700/20 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isBn ? 'গল্প / ব্লগ লিখুন' : 'Share Story / Blog'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* UNIFIED NAVIGATION TOOLBAR & DIRECTORY TABS */}
        {/* ======================================================== */}
        <div className="sticky top-16 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Main Hub Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => handleTabChange('all')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeTab === 'all'
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isBn ? `সকল পোস্ট (${totalEntries})` : `All Posts (${totalEntries})`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('blogs')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeTab === 'blogs'
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{isBn ? `ক্যাডেট ব্লগ (${blogs.length})` : `Cadet Blogs (${blogs.length})`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('stories')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeTab === 'stories'
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isBn ? `ছোট গল্প (${stories.length})` : `Short Stories (${stories.length})`}</span>
                </button>
              </div>

              {/* Global Search and Sort Controls */}
              <div className="flex items-center gap-2.5">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isBn ? 'ব্লগ বা গল্প খুঁজুন...' : 'Search blogs, stories...'
                    }
                    className="w-full pl-8 pr-7 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Sort Toggle */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setSortBy('newest')}
                    className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold uppercase transition-colors ${
                      sortBy === 'newest'
                        ? 'bg-red-700 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {isBn ? 'নতুন' : 'Latest'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy('popular')}
                    className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold uppercase transition-colors ${
                      sortBy === 'popular'
                        ? 'bg-red-700 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {isBn ? 'জনপ্রিয়' : 'Popular'}
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-Filters: Blog Categories (Shown in Blogs and All tabs) */}
            {(activeTab === 'blogs' || activeTab === 'all') && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
                <span className="text-[11px] font-mono font-bold uppercase text-slate-400 shrink-0">
                  {isBn ? 'ব্লগ বিভাগ:' : 'Category:'}
                </span>
                {BLOG_CATEGORIES.map((cat) => {
                  const isSelected = selectedBlogCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedBlogCategory(cat)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                        isSelected
                          ? 'bg-red-700 dark:bg-red-600 border-red-700 dark:border-red-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* MAIN CONTENT AREA */}
        {/* ======================================================== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12 sm:space-y-16">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                Loading live blogs & stories...
              </p>
            </div>
          ) : (
            <>
              {/* ======================================================== */}
              {/* 1. CADET BLOGS & FIELD DISPATCHES SECTION */}
              {/* ======================================================== */}
              {(activeTab === 'all' || activeTab === 'blogs') && (
                <section className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-heading text-lg sm:text-xl font-bold uppercase text-slate-900 dark:text-white">
                          {isBn ? 'ক্যাডেট ব্লগ ও প্রবন্ধ সম্ভার' : 'Cadet Experience Blogs & Articles'}
                        </h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {isBn
                            ? 'ক্যাম্প অভিজ্ঞতা, নেতৃত্ব বিকাশ ও সামরিক প্রশিক্ষণের বাস্তবধর্মী লেখা'
                            : 'In-depth reflections, camp survivals, weapon firing memories, and leadership lessons'}
                        </p>
                      </div>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold ml-2">
                        {filteredBlogs.length}
                      </span>
                    </div>

                    {activeTab === 'all' && (
                      <button
                        type="button"
                        onClick={() => handleTabChange('blogs')}
                        className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                      >
                        <span>{isBn ? 'সকল ব্লগ দেখুন' : 'View All Blogs'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {filteredBlogs.length === 0 ? (
                    <div className="py-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-6 space-y-3">
                      <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isBn ? 'কোনো ব্লগ পোস্ট পাওয়া যায়নি' : 'No blog posts match your criteria'}
                      </p>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{isBn ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredBlogs.map((blog) => (
                        <div
                          key={blog.id}
                          onClick={() => setReadingBlog(blog)}
                          className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:border-red-500/40 transition-colors flex flex-col justify-between cursor-pointer"
                        >
                          <div>
                            {blog.coverImage ? (
                              <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
                                <img
                                  src={blog.coverImage}
                                  alt={blog.title}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-3 left-3">
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900/85 text-white backdrop-blur-md border border-slate-700">
                                    {blog.category}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="h-3 bg-gradient-to-r from-red-600 to-amber-600" />
                            )}

                            <div className="p-5 space-y-3">
                              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>
                                  {new Date(blog.createdAt).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                                <span>•</span>
                                <span className="text-red-600 dark:text-red-400 font-semibold truncate">
                                  {blog.category}
                                </span>
                              </div>

                              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                {blog.title}
                              </h3>

                              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                                {blog.content}
                              </p>
                            </div>
                          </div>

                          <div className="p-5 pt-0">
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-700 dark:text-slate-300 shrink-0">
                                  {blog.authorName.charAt(0)}
                                </div>
                                <span className="font-bold text-slate-700 dark:text-slate-300 truncate">
                                  {blog.authorName}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => handleReactBlog(e, blog.id)}
                                  className="flex items-center gap-1 hover:text-red-600 transition-colors"
                                >
                                  <Heart
                                    className={`w-3.5 h-3.5 ${
                                      blog.reactionsCount > 0 ? 'fill-red-600 text-red-600' : ''
                                    }`}
                                  />
                                  <span>{blog.reactionsCount || 0}</span>
                                </button>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>{blog.comments ? blog.comments.length : 0}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* ======================================================== */}
              {/* 2. INSPIRATIONAL CADET SHORT STORIES SECTION */}
              {/* ======================================================== */}
              {(activeTab === 'all' || activeTab === 'stories') && (
                <section className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-heading text-lg sm:text-xl font-bold uppercase text-slate-900 dark:text-white">
                          {isBn ? 'ক্যাডেট গল্প ও স্মৃতিকথা সম্ভার' : 'Cadet Micro-Stories & Dispatches'}
                        </h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {isBn
                            ? 'ক্যাডেট, শুভাকাঙ্ক্ষী ও শিক্ষার্থীদের বাস্তব জীবনের অভিজ্ঞতা ও অনুপ্রেরণামূলক স্মৃতিকথা'
                            : 'Authentic reflections and inspiring micro-stories from active cadets and community supporters'}
                        </p>
                      </div>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold ml-2">
                        {filteredStories.length}
                      </span>
                    </div>

                    {activeTab === 'all' && (
                      <button
                        type="button"
                        onClick={() => handleTabChange('stories')}
                        className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <span>{isBn ? 'সকল গল্প দেখুন' : 'View All Stories'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {filteredStories.length === 0 ? (
                    <div className="py-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-6 space-y-3">
                      <MessageSquare className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isBn ? 'কোনো গল্প পাওয়া যায়নি' : 'No stories match your criteria'}
                      </p>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{isBn ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredStories.map((story) => (
                        <div
                          key={story.id}
                          onClick={() => setReadingStory(story)}
                          className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:border-red-500/40 transition-colors flex flex-col justify-between cursor-pointer space-y-4"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-red-600 text-white font-bold flex items-center justify-center text-xs shadow-sm overflow-hidden shrink-0">
                                {story.authorAvatar ? (
                                  <img src={story.authorAvatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  story.authorName.charAt(0)
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-heading text-sm font-bold text-slate-900 dark:text-white truncate">
                                  {story.authorName}
                                </h4>
                                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium truncate">
                                  {story.authorRank || 'Community Contributor'}
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed line-clamp-4 pl-3 border-l-2 border-amber-500">
                              "{story.content}"
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                            <span className="font-mono text-[10px]">
                              {new Date(story.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={(e) => handleReactStory(e, story.id)}
                                className="flex items-center gap-1 hover:text-rose-600 transition-colors"
                              >
                                <Heart
                                  className={`w-3.5 h-3.5 ${
                                    story.reactionsCount > 0 ? 'fill-rose-600 text-rose-600' : ''
                                  }`}
                                />
                                <span>{story.reactionsCount || 0}</span>
                              </button>

                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>{story.comments ? story.comments.length : 0}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* BLOG FULL READER MODAL */}
      {/* ======================================================== */}
      {readingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100 p-6 sm:p-8 space-y-6">
            <button
              type="button"
              onClick={() => setReadingBlog(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60">
                {readingBlog.category}
              </span>

              <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase text-slate-950 dark:text-white">
                {readingBlog.title}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="font-bold text-slate-900 dark:text-white">
                  By {readingBlog.authorName} ({readingBlog.authorRank})
                </span>
                <span>•</span>
                <span>
                  {new Date(readingBlog.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Cover Image */}
            {readingBlog.coverImage && (
              <div className="rounded-2xl overflow-hidden aspect-[16/9] w-full bg-slate-950 shadow-md">
                <img
                  src={readingBlog.coverImage}
                  alt={readingBlog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content Body */}
            <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300 font-sans">
              {readingBlog.content}
            </div>

            {/* Reactions & Comments Section */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => handleReactBlog(e, readingBlog.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 font-bold text-xs hover:bg-red-100 transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 ${readingBlog.reactionsCount > 0 ? 'fill-red-600' : ''}`}
                  />
                  <span>
                    {readingBlog.reactionsCount} {readingBlog.reactionsCount === 1 ? 'Reaction' : 'Reactions'}
                  </span>
                </button>

                <span className="text-xs font-mono text-slate-500">
                  {readingBlog.comments ? readingBlog.comments.length : 0} Comments
                </span>
              </div>

              {/* Reusable CommentSection Component */}
              <CommentSection
                targetType="blog"
                targetId={readingBlog.id}
                postTitle={readingBlog.title}
                initialComments={readingBlog.comments || []}
                onCommentCountChange={(_newCount, updatedList) => {
                  setBlogs((prev) =>
                    prev.map((b) => {
                      if (b.id === readingBlog.id) {
                        return {
                          ...b,
                          comments: updatedList || b.comments || [],
                        };
                      }
                      return b;
                    })
                  );
                  if (updatedList) {
                    setReadingBlog((prev) =>
                      prev ? { ...prev, comments: updatedList } : null
                    );
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STORY FULL READER & COMMENTS MODAL */}
      {/* ======================================================== */}
      {readingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100 p-6 sm:p-8 space-y-6">
            <button
              type="button"
              onClick={() => setReadingStory(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Author & Header */}
            <div className="flex items-start gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-red-600 text-white font-bold flex items-center justify-center text-base shadow-sm overflow-hidden shrink-0">
                {readingStory.authorAvatar ? (
                  <img src={readingStory.authorAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  readingStory.authorName.charAt(0)
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white truncate">
                    {readingStory.authorName}
                  </h3>
                  {readingStory.authorProfession && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60">
                      <Briefcase className="w-3 h-3" />
                      <span>{readingStory.authorProfession}</span>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono">
                  <span>{readingStory.authorRank || 'Community Contributor'}</span>
                  {readingStory.authorInstitution && (
                    <>
                      <span>•</span>
                      <span className="truncate">{readingStory.authorInstitution}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>
                    {new Date(readingStory.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Full Story Content */}
            <div className="p-6 rounded-2xl bg-amber-50/40 dark:bg-slate-950/80 border border-amber-200/50 dark:border-slate-800/80">
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-sans italic border-l-4 border-amber-500 pl-4">
                "{readingStory.content}"
              </p>
            </div>

            {/* Reactions & Engagement Stats */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <button
                type="button"
                onClick={(e) => handleReactStory(e, readingStory.id)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-colors"
              >
                <Heart
                  className={`w-4 h-4 ${
                    readingStory.reactionsCount > 0 ? 'fill-rose-600' : ''
                  }`}
                />
                <span>
                  {readingStory.reactionsCount} {readingStory.reactionsCount === 1 ? 'Reaction' : 'Reactions'}
                </span>
              </button>

              <span className="text-xs font-mono text-slate-500">
                {readingStory.comments ? readingStory.comments.length : 0} Reader Feedback
              </span>
            </div>

            {/* Reusable CommentSection Component */}
            <CommentSection
              targetType="story"
              targetId={readingStory.id}
              postTitle={readingStory.authorName + "'s BNCC Journey"}
              initialComments={readingStory.comments || []}
              onCommentCountChange={(_newCount, updatedList) => {
                setStories((prev) =>
                  prev.map((s) => {
                    if (s.id === readingStory.id) {
                      return {
                        ...s,
                        comments: updatedList || s.comments || [],
                      };
                    }
                    return s;
                  })
                );
                if (updatedList) {
                  setReadingStory((prev) =>
                    prev ? { ...prev, comments: updatedList } : null
                  );
                }
              }}
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE STORY / BLOG MODAL */}
      {/* ======================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-8 space-y-6">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Community Dispatches
              </span>
              <h3 className="font-heading text-xl font-bold uppercase text-slate-900 dark:text-white mt-1">
                Share With MU BNCC
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Publish a short reflective story or write a comprehensive regimental experience blog.
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                type="button"
                onClick={() => setCreateMode('story')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  createMode === 'story'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Short Story / Reflection
              </button>
              <button
                type="button"
                onClick={() => setCreateMode('blog')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  createMode === 'blog'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Cadet Experience Blog
              </button>
            </div>

            {/* Form: Story Mode */}
            {createMode === 'story' ? (
              <form onSubmit={handleCreateStory} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Syeda Fahmida Khan"
                    value={storyAuthorName}
                    onChange={(e) => setStoryAuthorName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Profession / Affiliation
                    </label>
                    <select
                      value={storyProfession}
                      onChange={(e) => setStoryProfession(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    >
                      {PROFESSIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Institution / Workplace
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Metropolitan University"
                      value={storyInstitution}
                      onChange={(e) => setStoryInstitution(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Your Story / Observation *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe a moment that inspired you during drills, camps, or visiting the MU BNCC platoon..."
                    value={storyContent}
                    onChange={(e) => setStoryContent(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingStory}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase tracking-wider shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmittingStory ? 'Publishing Reflection...' : 'Publish Micro-Story'}
                </button>
              </form>
            ) : (
              /* Form: Blog Mode */
              <form onSubmit={handleCreateBlog} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Surviving & Thriving in the 10-Day Regimental Training Camp"
                    value={blogTitle}
                    onChange={(e) => setBlogTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Author Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tanvir Hasan"
                      value={blogAuthorName}
                      onChange={(e) => setBlogAuthorName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Rank / Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cadet Sergeant / Faculty"
                      value={blogAuthorRank}
                      onChange={(e) => setBlogAuthorRank(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Category *
                    </label>
                    <select
                      value={blogCategory}
                      onChange={(e) => setBlogCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    >
                      {BLOG_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Cover Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={blogCoverUrl}
                      onChange={(e) => setBlogCoverUrl(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Article Content *
                  </label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Share your detailed experience, tactical lessons, drill guidance, or personal reflections..."
                    value={blogContent}
                    onChange={(e) => setBlogContent(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingBlog}
                  className="w-full py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold uppercase tracking-wider shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmittingBlog ? 'Publishing Dispatch...' : 'Publish Cadet Blog'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryPage;
