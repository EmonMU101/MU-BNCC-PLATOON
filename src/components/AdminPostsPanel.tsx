import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Calendar,
  User,
  Heart,
  Tag,
  Eye,
  FileText,
} from 'lucide-react';
import {
  PostItem,
  CreatePostInput,
  subscribePosts,
  createPost,
  updatePost,
  deletePost,
} from '../services/postService';
import { useLanguage } from '../context/LanguageContext';
import { auth } from '../lib/firebase';
import { checkAdminAccess, isSuperAdminEmail } from '../services/adminAccessService';
import { sanitizeText, sanitizeUrl } from '../lib/sanitize';

export const AdminPostsPanel: React.FC = () => {
  const { isBn } = useLanguage();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'blog' | 'story'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [authorRole, setAuthorRole] = useState('Cadet / Contributor');
  const [postType, setPostType] = useState<'blog' | 'story'>('blog');
  const [category, setCategory] = useState('Leadership & Discipline');
  const [coverImage, setCoverImage] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    const unsub = subscribePosts((livePosts) => {
      setPosts(livePosts);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const showMsg = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingPostId(null);
    setTitle('');
    setTitleBn('');
    setContent('');
    setAuthor('');
    setAuthorRole('Cadet / Contributor');
    setPostType('blog');
    setCategory('Leadership & Discipline');
    setCoverImage('');
    setTagsInput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: PostItem) => {
    setEditingPostId(p.id);
    setTitle(p.title);
    setTitleBn(p.titleBn || '');
    setContent(p.content);
    setAuthor(p.author);
    setAuthorRole(p.authorRole || 'Cadet / Contributor');
    setPostType(p.postType);
    setCategory(p.category || 'General');
    setCoverImage(p.coverImage || '');
    setTagsInput((p.tags || []).join(', '));
    setIsModalOpen(true);
  };

  const verifyAdminAuthorization = async (): Promise<boolean> => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      showMsg('Security Violation: You must be an authenticated administrator to modify posts.');
      return false;
    }
    const access = await checkAdminAccess(currentUser.email);
    if (!access.hasAccess) {
      showMsg('Access Denied: Your account does not have approved administrator privileges.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !author.trim()) {
      showMsg('Title, content, and author are required.');
      return;
    }

    const isAuthorized = await verifyAdminAuthorization();
    if (!isAuthorized) return;

    setSubmitting(true);

    // Sanitize all inputs against XSS and stored script injection
    const sanitizedTitle = sanitizeText(title, { maxLength: 200, allowMultiline: false });
    const sanitizedTitleBn = sanitizeText(titleBn, { maxLength: 200, allowMultiline: false });
    const sanitizedContent = sanitizeText(content, { maxLength: 20000, allowMultiline: true });
    const sanitizedAuthor = sanitizeText(author, { maxLength: 100, allowMultiline: false });
    const sanitizedAuthorRole = sanitizeText(authorRole, { maxLength: 80, allowMultiline: false });
    const sanitizedCoverImage = sanitizeUrl(coverImage);
    const sanitizedTags = tagsInput
      .split(',')
      .map((t) => sanitizeText(t, { maxLength: 40, allowMultiline: false }))
      .filter(Boolean);

    try {
      if (editingPostId) {
        await updatePost(editingPostId, {
          title: sanitizedTitle,
          titleBn: sanitizedTitleBn,
          content: sanitizedContent,
          author: sanitizedAuthor,
          authorRole: sanitizedAuthorRole,
          postType,
          category,
          coverImage: sanitizedCoverImage,
          tags: sanitizedTags,
        });
        showMsg('Post updated successfully in Firestore!');
      } else {
        const input: CreatePostInput = {
          title: sanitizedTitle,
          titleBn: sanitizedTitleBn,
          content: sanitizedContent,
          author: sanitizedAuthor,
          authorRole: sanitizedAuthorRole,
          postType,
          category,
          timestamp: new Date().toISOString(),
          published: true,
          coverImage: sanitizedCoverImage,
          tags: sanitizedTags,
        };
        await createPost(input);
        showMsg('New post published live to Firestore!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showMsg(`Error saving post: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, titleStr: string) => {
    const isAuthorized = await verifyAdminAuthorization();
    if (!isAuthorized) return;

    if (!window.confirm(`Permanently delete post "${titleStr}" from Firestore?`)) return;
    try {
      await deletePost(id);
      showMsg('Post deleted successfully.');
    } catch (err: any) {
      showMsg(`Delete error: ${err.message}`);
    }
  };

  const filteredPosts = posts.filter((p) => {
    const matchesType = filterType === 'all' || p.postType === filterType;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading uppercase tracking-wide">
                Blog & Short Story Posts CMS
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Firestore collection: <code className="text-red-600 dark:text-red-400 font-mono">posts</code> (Title, Content, Author, Timestamp)
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-red-700 hover:bg-red-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Post / Short Story</span>
        </button>
      </div>

      {notification && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3.5 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search posts by title, author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'all'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All ({posts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('blog')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'blog'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Blogs
            </button>
            <button
              type="button"
              onClick={() => setFilterType('story')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'story'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Stories
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Showing {filteredPosts.length} posts
        </span>
      </div>

      {/* Posts listing */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-red-600 mb-2" />
          <span className="text-xs text-slate-400">Loading Firestore posts...</span>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
          <FileText className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Posts Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No blog posts or short stories match your search criteria. Create one using the button above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.postType === 'blog'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {p.postType}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {p.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(p)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit Post"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.title)}
                      className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mb-1">
                  {p.title}
                </h3>
                {p.titleBn && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-serif line-clamp-1 mb-2">
                    {p.titleBn}
                  </p>
                )}

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                  {p.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {p.author}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(p.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-red-500" />
                    <span>{p.likesCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading uppercase mb-4">
              {editingPostId ? 'Edit Firestore Post' : 'Create New Post / Short Story'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Post Type *
                  </label>
                  <select
                    value={postType}
                    onChange={(e) => setPostType(e.target.value as 'blog' | 'story')}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600"
                  >
                    <option value="blog">Full Blog Article</option>
                    <option value="story">Short Field Story / Micro-post</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600"
                  >
                    <option value="Leadership & Discipline">Leadership & Discipline</option>
                    <option value="Regimental Camp">Regimental Camp</option>
                    <option value="Field Training & Drills">Field Training & Drills</option>
                    <option value="Weapon & Firing">Weapon & Firing</option>
                    <option value="University Life & Studies">University Life & Studies</option>
                    <option value="Humanitarian Relief">Humanitarian Relief</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enduring the 10km Tactical Route March"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title (Bangla Translation)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ১০ কিমি কৌশলগত রুট মার্চের অভিজ্ঞতা"
                  value={titleBn}
                  onChange={(e) => setTitleBn(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600 font-serif"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Author Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cadet Sergeant Tanvir Hasan"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Author Role / Rank
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cadet Corporal / English Dept"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Content / Narrative *
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Share the full experience, reflection, tactical drill insights, or squad story..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Drill, Camp, Mainamati, Leadership"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving to Firestore...' : editingPostId ? 'Update Post' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
