import React, { useState, useEffect } from 'react';
import {
  Shield,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  UserCheck,
  LogOut,
  Mail,
  KeyRound,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Heart,
  MessageSquare,
  Send,
  Camera,
  Image,
  Sparkles,
  Phone,
  Droplet,
  GraduationCap,
  Medal,
  Activity,
  Flame,
  X,
  Target,
  FileText,
  User,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  CalendarDays,
  Eye,
  EyeOff,
  Briefcase,
  Share2,
  ExternalLink,
  Globe,
  Facebook,
  Linkedin,
  Twitter,
  Instagram,
  Github,
  ClipboardList,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { EventsCalendar } from '../components/EventsCalendar';
import { VisitorStoryModal } from '../components/VisitorStoryModal';
import { SocialShareModal } from '../components/SocialShareModal';
import { CadetLeaderboard } from '../components/CadetLeaderboard';
import {
  CadetProfileData,
  ServiceHonorEntry,
  CadetStoryItem,
  CadetBlogItem,
  ManualAttendanceEntry,
  authenticateCadetWithId,
  resetCadetPasswordByEmailAndId,
  registerNewCadet,
  updateCadetProfile,
  addServiceHonor,
  deleteServiceHonor,
  addManualAttendanceLog,
  subscribeStories,
  createStory,
  toggleReactStory,
  subscribeBlogs,
  createBlog,
  toggleReactBlog,
  addBlogComment,
  INITIAL_CADETS,
} from '../services/cadetPortalService';
import { BnccCrest } from '../components/BnccCrest';
import { useLanguage } from '../context/LanguageContext';
import { SEOHead } from '../components/SEOHead';
import {
  logCadetLogin,
  logCadetRegistration,
  logCadetProfileUpdate,
} from '../services/analyticsService';

export const CadetDashboardPage: React.FC = () => {
  const { t, isBn } = useLanguage();

  // Cadet Auth State
  const [activeCadet, setActiveCadet] = useState<CadetProfileData | null>(() => {
    const saved = localStorage.getItem('mu_bncc_active_cadet');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginCadetId, setLoginCadetId] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Forgot / Reset Password Modal State
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetCadetId, setResetCadetId] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  // Visitor Story Modal State (Every visitor can share a story without being a cadet)
  const [isVisitorStoryOpen, setIsVisitorStoryOpen] = useState(false);

  // Registration Form State (Empty initial values with transparent placeholders)
  const [regForm, setRegForm] = useState({
    cadetId: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    emergencyContact: '',
    bloodGroup: 'B+',
    department: 'Computer Science & Engineering',
    currentSemester: '',
    currentRank: 'Cadet',
    cadetType: 'cadet' as 'cadet' | 'excadet',
    height: '',
    weight: '',
    profilePicture: '',
  });

  // Active Tab & Collapsible Navigation
  const [activeTab, setActiveTab] = useState<'profile' | 'attendance' | 'honors' | 'stories' | 'blogs' | 'events'>('attendance');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    training: true,
    engagement: true,
    schedule: true,
  });

  const toggleDropdown = (key: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getCadetTabInfo = (tab: typeof activeTab) => {
    switch (tab) {
      case 'attendance':
        return { group: 'Cadet Record & Training', label: 'Attendance & Drill Logs' };
      case 'profile':
        return { group: 'Cadet Record & Training', label: 'Cadet Dossier & Profile' };
      case 'honors':
        return { group: 'Cadet Record & Training', label: 'Service Honors & Awards' };
      case 'stories':
        return { group: 'Engagement & Stories', label: 'Share Your Story' };
      case 'blogs':
        return { group: 'Engagement & Stories', label: 'Cadet Experience Blog' };
      case 'events':
        return { group: 'Platoon Schedule', label: 'Events & Training Calendar' };
      default:
        return { group: 'Cadet Portal', label: 'Dashboard' };
    }
  };

  const [notification, setNotification] = useState<string | null>(null);

  // Module 1: Attendance & Drill Logs State
  const [attendanceSubTab, setAttendanceSubTab] = useState<'my-logs' | 'leaderboard'>('my-logs');
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [submittingAttendance, setSubmittingAttendance] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({
    paradeType: 'Morning Drill & Physical Training',
    drillDate: new Date().toISOString().split('T')[0],
    durationHours: 3,
    location: 'Metropolitan University Central Parade Ground',
    commandingOfficer: 'Platoon Commander & CUO',
    notes: 'Mandatory weekend turnout session completed with full squad gear.',
  });

  // Phase 4 Module 2: Honors State
  const [isHonorModalOpen, setIsHonorModalOpen] = useState(false);
  const [honorForm, setHonorForm] = useState<{
    title: string;
    category: ServiceHonorEntry['category'];
    awardingBody: string;
    year: string;
    citation: string;
  }>({
    title: '',
    category: 'Medal',
    awardingBody: 'Mainamati Regiment',
    year: '2026',
    citation: '',
  });

  // Phase 4 Module 3: Stories State
  const [stories, setStories] = useState<CadetStoryItem[]>([]);
  const [newStoryContent, setNewStoryContent] = useState('');
  const [submittingStory, setSubmittingStory] = useState(false);

  // Phase 4 Module 4: Blogs State
  const [blogs, setBlogs] = useState<CadetBlogItem[]>([]);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [blogForm, setBlogForm] = useState({
    title: '',
    category: 'Regimental Camp',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  });

  // Edit Profile Modal
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [shareModalConfig, setShareModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    url: string;
    description: string;
  }>({
    isOpen: false,
    title: '',
    url: '',
    description: '',
  });

  const [editProfileForm, setEditProfileForm] = useState({
    fullName: '',
    phone: '',
    emergencyContact: '',
    department: '',
    currentSemester: '',
    currentRank: '',
    cadetType: 'cadet' as 'cadet' | 'excadet',
    bloodGroup: '',
    height: '',
    weight: '',
    profilePicture: '',
    socialLinks: {
      facebook: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      github: '',
    },
  });

  // Subscribe to live Stories and Blogs
  useEffect(() => {
    const unsubStories = subscribeStories(setStories);
    const unsubBlogs = subscribeBlogs(setBlogs);
    return () => {
      unsubStories();
      unsubBlogs();
    };
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Login handler with Cadet ID and Email Verification
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);

    try {
      const res = await authenticateCadetWithId(loginCadetId, loginEmail, loginPassword);
      if (res.success && res.cadet) {
        setActiveCadet(res.cadet);
        localStorage.setItem('mu_bncc_active_cadet', JSON.stringify(res.cadet));
        showToast(`Welcome back, ${res.cadet.currentRank} ${res.cadet.fullName}!`);
        logCadetLogin(res.cadet.cadetId, res.cadet.fullName);
      } else {
        setAuthError(res.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred during authentication.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Password Reset handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('New passwords do not match. Please re-enter carefully.');
      return;
    }

    if (resetNewPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }

    setResetSubmitting(true);
    try {
      const res = await resetCadetPasswordByEmailAndId(
        resetCadetId.trim(),
        resetEmail.trim(),
        resetNewPassword
      );

      if (res.success) {
        setResetSuccess(res.message || 'Password reset successfully! You can now sign in.');
        showToast('Password updated! You can now sign in with your new password.');
        // Prefill login form
        setLoginCadetId(resetCadetId.trim());
        setLoginEmail(resetEmail.trim());
        setLoginPassword(resetNewPassword);
        // Clear modal form after brief delay
        setTimeout(() => {
          setIsForgotPasswordOpen(false);
          setResetSuccess(null);
        }, 2200);
      } else {
        setResetError(res.error || 'Password reset failed. Please check your credentials.');
      }
    } catch (err: any) {
      setResetError(err.message || 'An error occurred while resetting password.');
    } finally {
      setResetSubmitting(false);
    }
  };



  // Registration handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (regForm.password !== regForm.confirmPassword) {
      setAuthError('Passwords do not match. Please verify your password entry.');
      return;
    }

    // Enforce format X.Y for currentSemester (supports tri-semester system e.g. 3.3)
    const semesterRegex = /^[1-5]\.[1-3]$/;
    if (!semesterRegex.test(regForm.currentSemester.trim())) {
      setAuthError(
        'Current Semester must adhere to the format X.Y (e.g., 3.3 representing 3rd year, 3rd semester in the university tri-semester system).'
      );
      return;
    }

    setAuthSubmitting(true);
    try {
      const res = await registerNewCadet(
        {
          cadetId: regForm.cadetId.trim(),
          fullName: regForm.fullName.trim(),
          email: regForm.email.trim(),
          phone: regForm.phone.trim(),
          emergencyContact: regForm.emergencyContact.trim(),
          bloodGroup: regForm.bloodGroup,
          department: regForm.department,
          currentSemester: regForm.currentSemester.trim(),
          currentRank: regForm.currentRank,
          cadetType: regForm.cadetType,
          height: regForm.height.trim(),
          weight: regForm.weight.trim(),
          profilePicture:
            regForm.profilePicture.trim() ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        },
        regForm.password
      );

      if (res.success && res.cadet) {
        setActiveCadet(res.cadet);
        localStorage.setItem('mu_bncc_active_cadet', JSON.stringify(res.cadet));
        showToast(
          'Dossier submitted! Your profile is currently PENDING approval before appearing on the public About Us page.'
        );
        logCadetRegistration(res.cadet.cadetId, res.cadet.fullName, res.cadet.department);
      } else {
        setAuthError(res.error || 'Registration failed.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Registration error.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mu_bncc_active_cadet');
    setActiveCadet(null);
    showToast('Logged out of cadet portal.');
  };


  // Module 1: Add Manual Attendance Log
  const handleSaveAttendanceLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCadet) return;
    setSubmittingAttendance(true);
    try {
      const entry = {
        date: attendanceForm.drillDate,
        drillDate: attendanceForm.drillDate,
        segmentType: attendanceForm.paradeType,
        paradeType: attendanceForm.paradeType,
        durationHours: Number(attendanceForm.durationHours) || 3,
        location: attendanceForm.location.trim(),
        commandingOfficer: attendanceForm.commandingOfficer.trim(),
        reportingOfficer: attendanceForm.commandingOfficer.trim(),
        status: 'Attended' as const,
        verifiedStatus: 'Verified',
        notes: attendanceForm.notes.trim(),
        remarks: attendanceForm.notes.trim(),
      };
      const created = await addManualAttendanceLog(activeCadet.uid, entry);
      const updatedAttendance = [created, ...(activeCadet.manualAttendance || [])];
      const updatedHours = (activeCadet.trainingHours || 0) + entry.durationHours;
      const updated = {
        ...activeCadet,
        manualAttendance: updatedAttendance,
        trainingHours: updatedHours,
      };
      setActiveCadet(updated);
      localStorage.setItem('mu_bncc_active_cadet', JSON.stringify(updated));
      setIsAttendanceModalOpen(false);
      showToast(`Logged ${entry.durationHours} hours for ${entry.paradeType}!`);
    } catch {
      showToast('Could not record attendance log.');
    } finally {
      setSubmittingAttendance(false);
    }
  };

  // Phase 4 Module 2: Add Service Honor
  const handleSaveHonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCadet || !honorForm.title.trim()) return;

    try {
      const newHonor = await addServiceHonor(activeCadet.uid, honorForm);
      const updated = {
        ...activeCadet,
        serviceHonors: [newHonor, ...(activeCadet.serviceHonors || [])],
      };
      setActiveCadet(updated);
      localStorage.setItem('mu_bncc_active_cadet', JSON.stringify(updated));
      setIsHonorModalOpen(false);
      showToast(`Added honor "${honorForm.title}" to portfolio!`);
    } catch {
      showToast('Could not save service honor.');
    }
  };

  const handleDeleteHonor = async (honorId: string) => {
    if (!activeCadet || !window.confirm('Remove this honor entry from your portfolio?')) return;
    await deleteServiceHonor(activeCadet.uid, honorId);
    const updated = {
      ...activeCadet,
      serviceHonors: (activeCadet.serviceHonors || []).filter((h) => h.id !== honorId),
    };
    setActiveCadet(updated);
    localStorage.setItem('mu_bncc_active_cadet', JSON.stringify(updated));
    showToast('Honor entry removed.');
  };

  // Phase 4 Module 3: Share Story Post
  const handlePublishStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCadet || !newStoryContent.trim()) return;

    setSubmittingStory(true);
    try {
      await createStory({
        cadetId: activeCadet.cadetId,
        authorName: activeCadet.fullName,
        authorRank: activeCadet.currentRank,
        authorAvatar: activeCadet.profilePicture,
        content: newStoryContent.trim(),
      });
      setNewStoryContent('');
      showToast('Story update broadcasted to the cadet feed!');
    } catch {
      showToast('Could not publish story update.');
    } finally {
      setSubmittingStory(false);
    }
  };

  const handleToggleStoryReaction = async (storyId: string) => {
    const userId = activeCadet?.uid || 'guest-visitor';
    const res = await toggleReactStory(storyId, userId);
    setStories((prev) =>
      prev.map((s) => {
        if (s.id === storyId) {
          const reacted = s.reactedUserIds.includes(userId);
          const updatedIds = reacted
            ? s.reactedUserIds.filter((u) => u !== userId)
            : [...s.reactedUserIds, userId];
          return {
            ...s,
            reactionsCount: res.reactionsCount,
            reactedUserIds: updatedIds,
          };
        }
        return s;
      })
    );
  };

  // Phase 4 Module 4: Blog Post & Comment
  const handlePublishBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCadet || !blogForm.title.trim() || !blogForm.content.trim()) return;

    try {
      await createBlog({
        cadetId: activeCadet.cadetId,
        authorName: activeCadet.fullName,
        authorRank: activeCadet.currentRank,
        authorAvatar: activeCadet.profilePicture,
        title: blogForm.title.trim(),
        category: blogForm.category,
        content: blogForm.content.trim(),
        coverImage: blogForm.coverImage,
      });
      setIsBlogModalOpen(false);
      setBlogForm({
        title: '',
        category: 'Regimental Camp',
        content: '',
        coverImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      });
      showToast('Experience blog published to the platoon portal!');
    } catch {
      showToast('Could not publish blog post.');
    }
  };

  const handleToggleBlogReaction = async (blogId: string) => {
    const userId = activeCadet?.uid || 'guest-visitor';
    const res = await toggleReactBlog(blogId, userId);
    setBlogs((prev) =>
      prev.map((b) => {
        if (b.id === blogId) {
          const reacted = b.reactedUserIds.includes(userId);
          const updatedIds = reacted
            ? b.reactedUserIds.filter((u) => u !== userId)
            : [...b.reactedUserIds, userId];
          return {
            ...b,
            reactionsCount: res.reactionsCount,
            reactedUserIds: updatedIds,
          };
        }
        return b;
      })
    );
  };

  const handleAddComment = async (blogId: string) => {
    const text = commentInputs[blogId]?.trim();
    if (!text || !activeCadet) return;

    try {
      const newComment = await addBlogComment(blogId, {
        authorId: activeCadet.uid,
        authorName: activeCadet.fullName,
        authorRank: activeCadet.currentRank,
        content: text,
      });

      setBlogs((prev) =>
        prev.map((b) => (b.id === blogId ? { ...b, comments: [...(b.comments || []), newComment] } : b))
      );
      setCommentInputs((prev) => ({ ...prev, [blogId]: '' }));
      showToast('Comment posted!');
    } catch {
      showToast('Failed to post comment.');
    }
  };

  // Edit Profile
  const handleOpenEditProfile = () => {
    if (!activeCadet) return;
    setEditProfileForm({
      fullName: activeCadet.fullName,
      phone: activeCadet.phone || '',
      emergencyContact: activeCadet.emergencyContact || '',
      department: activeCadet.department,
      currentSemester: activeCadet.currentSemester,
      currentRank: activeCadet.currentRank,
      cadetType: activeCadet.cadetType || 'cadet',
      bloodGroup: activeCadet.bloodGroup,
      height: activeCadet.height || '',
      weight: activeCadet.weight || '',
      profilePicture: activeCadet.profilePicture || '',
      socialLinks: {
        facebook: activeCadet.socialLinks?.facebook || '',
        linkedin: activeCadet.socialLinks?.linkedin || '',
        twitter: activeCadet.socialLinks?.twitter || '',
        instagram: activeCadet.socialLinks?.instagram || '',
        github: activeCadet.socialLinks?.github || '',
      },
    });
    setIsEditProfileModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCadet) return;

    // Enforce format X.Y for currentSemester (supports tri-semester system e.g. 3.3)
    const semesterRegex = /^[1-5]\.[1-3]$/;
    if (!semesterRegex.test(editProfileForm.currentSemester.trim())) {
      alert('Current Semester must adhere to the format X.Y (e.g., 3.3 representing 3rd year, 3rd semester in the university tri-semester system).');
      return;
    }

    try {
      const updated = await updateCadetProfile(activeCadet.uid, {
        fullName: editProfileForm.fullName.trim(),
        phone: editProfileForm.phone.trim(),
        emergencyContact: editProfileForm.emergencyContact.trim(),
        department: editProfileForm.department,
        currentSemester: editProfileForm.currentSemester.trim(),
        currentRank: editProfileForm.currentRank,
        cadetType: editProfileForm.cadetType,
        bloodGroup: editProfileForm.bloodGroup,
        height: editProfileForm.height.trim(),
        weight: editProfileForm.weight.trim(),
        profilePicture: editProfileForm.profilePicture,
        socialLinks: {
          facebook: editProfileForm.socialLinks.facebook.trim(),
          linkedin: editProfileForm.socialLinks.linkedin.trim(),
          twitter: editProfileForm.socialLinks.twitter.trim(),
          instagram: editProfileForm.socialLinks.instagram.trim(),
          github: editProfileForm.socialLinks.github.trim(),
        },
      });
      setActiveCadet(updated);
      localStorage.setItem('mu_bncc_active_cadet', JSON.stringify(updated));
      setIsEditProfileModalOpen(false);
      showToast('Cadet dossier and social media links updated successfully.');
      logCadetProfileUpdate(activeCadet.cadetId, editProfileForm.fullName.trim());
    } catch {
      showToast('Could not save profile updates.');
    }
  };

  // Image upload simulation helper (converts to base64 data url)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'reg' | 'edit') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        if (target === 'reg') {
          setRegForm((prev) => ({ ...prev, profilePicture: base64Url }));
        } else {
          setEditProfileForm((prev) => ({ ...prev, profilePicture: base64Url }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================
  // UNATHENTICATED STATE: CADET ID + PASSWORD LOGIN / REGISTER
  // ==========================================
  if (!activeCadet) {
    return (
      <div className="py-12 sm:py-20 px-4 max-w-xl mx-auto space-y-8">
        <SEOHead
          title="Cadet Portal Authentication | Metropolitan University BNCC"
          titleBn="ক্যাডেট পোর্টাল লগইন | মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি"
          description="Authenticate with your unique Cadet ID and password to access the MU BNCC Cadet Portal."
          path="/cadet-portal"
        />

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BnccCrest size="lg" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
              Cadet Operations Hub
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold uppercase text-slate-900 dark:text-white mt-1">
              Cadet Member Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              Log in with your official Cadet ID to manage service honors, share stories, and write experience blogs.
            </p>

            {/* Direct Open Access: Visitors do not need to be a cadet to share a story */}
            <div className="pt-3">
              <button
                type="button"
                onClick={() => setIsVisitorStoryOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-red-700/20 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Not a Cadet? Share Your Story as a Visitor</span>
              </button>
              <span className="block text-[11px] text-slate-400 mt-1">
                Every visitor, student, guardian, or supporter of MU BNCC is welcome to post their experience!
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Toggle Login / Register */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                authMode === 'login'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cadet ID Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                authMode === 'register'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Register New Cadet
            </button>
          </div>

          {authError && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 p-3.5 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Cadet ID (Primary Identifier) *
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 25071762"
                    value={loginCadetId}
                    onChange={(e) => setLoginCadetId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Verified Cadet Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahadahmedemon11@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Double verification: your email must match the registered address for your Cadet ID.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetCadetId(loginCadetId);
                      setResetEmail(loginEmail);
                      setResetError(null);
                      setResetSuccess(null);
                      setResetNewPassword('');
                      setResetConfirmPassword('');
                      setIsForgotPasswordOpen(true);
                    }}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-10 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    title={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 hover:bg-red-800 text-white py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{authSubmitting ? 'Authenticating Cadet ID...' : 'Enter Cadet Dashboard'}</span>
              </button>
            </form>
          ) : (
            /* REGISTRATION FORM (Phase 3 Complete Schema) */
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              {/* CADET CATEGORY: CADET OR EX-CADET */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Cadet Status / Category *
                  </label>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {regForm.cadetType === 'excadet' ? 'Alumni / Veteran Member' : 'Active Regular Platoon'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRegForm({ ...regForm, cadetType: 'cadet' })}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                      regForm.cadetType === 'cadet'
                        ? 'bg-red-700 text-white border-red-700 shadow-xs ring-2 ring-red-600/30'
                        : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-red-500 hover:bg-red-50/40 dark:hover:bg-red-950/20'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="font-bold">Cadet (ক্যাডেট)</div>
                      <div className="text-[10px] font-normal opacity-80">Regular / Active Platoon</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegForm({ ...regForm, cadetType: 'excadet' })}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                      regForm.cadetType === 'excadet'
                        ? 'bg-amber-700 text-white border-amber-700 shadow-xs ring-2 ring-amber-600/30'
                        : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-amber-500 hover:bg-amber-50/40 dark:hover:bg-amber-950/20'
                    }`}
                  >
                    <Award className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="font-bold">Ex-Cadet (প্রাক্তন ক্যাডেট)</div>
                      <div className="text-[10px] font-normal opacity-80">Alumni / Former Veteran</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Cadet ID (Primary Identifier) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 25071762"
                    value={regForm.cadetId}
                    onChange={(e) => setRegForm({ ...regForm, cadetId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahad Ahmed Emon"
                    value={regForm.fullName}
                    onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter secure password"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 pl-4 pr-10 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title={showRegPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Confirm password"
                      value={regForm.confirmPassword}
                      onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 pl-4 pr-10 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahadahmedemon11@gmail.com"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +880 1700-000000"
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +880 1800-000000 (Parent / Guardian)"
                    value={regForm.emergencyContact}
                    onChange={(e) => setRegForm({ ...regForm, emergencyContact: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Blood Group *
                  </label>
                  <select
                    value={regForm.bloodGroup}
                    onChange={(e) => setRegForm({ ...regForm, bloodGroup: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Academic Department *
                  </label>
                  <select
                    value={regForm.department}
                    onChange={(e) => setRegForm({ ...regForm, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                  >
                    {[
                      'Computer Science & Engineering',
                      'Software Engineering',
                      'Electrical & Electronic Engineering',
                      'Business Administration',
                      'English Literature',
                      'Department of Law',
                      'Economics',
                    ].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Current Semester (Format X.Y, e.g. 3.3) *
                  </label>
                  <input
                    type="text"
                    required
                    pattern="^[1-5]\.[1-3]$"
                    placeholder="e.g. 3.3"
                    value={regForm.currentSemester}
                    onChange={(e) => setRegForm({ ...regForm, currentSemester: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Tri-semester format (e.g. 3.3 = 3rd Year, 3rd Semester)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    {regForm.cadetType === 'excadet' ? 'Rank *' : 'Current Rank *'}
                  </label>
                  <select
                    value={regForm.currentRank}
                    onChange={(e) => setRegForm({ ...regForm, currentRank: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                  >
                    {[
                      'Cadet Under Officer',
                      'Cadet Sergeant',
                      'Cadet Corporal',
                      'Cadet Lance Corporal',
                      'Cadet',
                    ].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Height *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5' 8&quot;"
                    value={regForm.height}
                    onChange={(e) => setRegForm({ ...regForm, height: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Weight *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 65 kg"
                    value={regForm.weight}
                    onChange={(e) => setRegForm({ ...regForm, weight: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                  />
                </div>
              </div>

              {/* Profile Picture Upload support */}
              <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 space-y-2">
                <label className="block font-semibold">Profile Picture (Image Upload Support)</label>
                <div className="flex items-center gap-3">
                  {regForm.profilePicture ? (
                    <img
                      src={regForm.profilePicture}
                      alt="Preview"
                      className="w-12 h-12 rounded-full object-cover border border-red-600 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-300 dark:border-slate-700 shrink-0">
                      <Camera className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                  <div className="space-y-1 flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, 'reg')}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    />
                    <div className="text-[10px] text-slate-400">Or paste image URL below:</div>
                    <input
                      type="url"
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                      value={regForm.profilePicture}
                      onChange={(e) => setRegForm({ ...regForm, profilePicture: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>You will be verified very soon.</span>
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 hover:bg-red-800 text-white py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors disabled:opacity-50 active:scale-95"
              >
                <UserCheck className="w-4 h-4" />
                <span>{authSubmitting ? 'Registering Dossier...' : 'Submit Cadet Registration'}</span>
              </button>
            </form>
          )}
        </div>

        {/* FORGOT / RESET PASSWORD MODAL */}
        {isForgotPasswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Reset Cadet Password
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Verify your Cadet ID and registered email
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordOpen(false);
                    setResetError(null);
                    setResetSuccess(null);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {resetError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Cadet ID *
                  </label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 25071762"
                      value={resetCadetId}
                      onChange={(e) => setResetCadetId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 pl-9 pr-3 py-2.5 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Registered Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahadahmedemon11@gmail.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Must match the email address registered on your cadet dossier.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    New Password *
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter at least 6 characters"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 pl-9 pr-10 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showResetConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter new password"
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 pl-9 pr-10 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showResetConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordOpen(false);
                      setResetError(null);
                      setResetSuccess(null);
                    }}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-5 py-2.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resetSubmitting ? 'animate-spin' : ''}`} />
                    <span>{resetSubmitting ? 'Resetting...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VISITOR STORY MODAL */}
        <VisitorStoryModal
          isOpen={isVisitorStoryOpen}
          onClose={() => setIsVisitorStoryOpen(false)}
          onStoryPublished={(story) => {
            setStories((prev) => [story, ...prev]);
            showToast('Thank you! Your story has been posted to the community feed.');
          }}
        />
      </div>
    );
  }

  // ==========================================
  // AUTHENTICATED CADET DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-900 dark:text-slate-100">
      <SEOHead
        title={`${activeCadet.fullName} | Cadet Operational Portal`}
        titleBn={`${activeCadet.fullName} | ক্যাডেট পোর্টাল`}
        description="Official Cadet Member Dashboard for Metropolitan University BNCC Platoon."
        path="/cadet-portal"
        noindex={true}
      />

      {/* MOBILE BACKDROP OVERLAY */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* COLLAPSIBLE SIDEBAR NAVIGATION (DESKTOP & MOBILE DRAWER) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 md:static flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out shrink-0 ${
          isMobileSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${isSidebarCollapsed ? 'md:w-20' : 'md:w-68'}`}
      >
        {/* Sidebar Brand / Cadet Info Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <BnccCrest size="sm" />
            {!isSidebarCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-heading text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white truncate">
                  Cadet HQ
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400 truncate">
                  {activeCadet.cadetId}
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items with Nested Dropdowns */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-none">
          {/* GROUP 1: CADET RECORD & TRAINING */}
          <div className="space-y-1">
            {!isSidebarCollapsed ? (
              <button
                type="button"
                onClick={() => toggleDropdown('training')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <span>Cadet Record & Training</span>
                {openDropdowns.training ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
            )}

            {(openDropdowns.training || isSidebarCollapsed) && (
              <div className="space-y-1">
                {/* Attendance & Drills */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('attendance');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'attendance'
                      ? 'bg-red-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={isSidebarCollapsed ? `Attendance & Drills (${activeCadet.manualAttendance?.length || 4})` : undefined}
                >
                  <ClipboardList className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between truncate">
                      <span className="truncate">Attendance & Drills</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        activeTab === 'attendance' ? 'bg-red-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {activeCadet.attendanceRate || 88}%
                      </span>
                    </div>
                  )}
                </button>

                {/* Cadet Dossier & Profile */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('profile');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'profile'
                      ? 'bg-red-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={isSidebarCollapsed ? 'Cadet Dossier & Profile' : undefined}
                >
                  <User className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && (
                    <span className="truncate">Cadet Dossier & Profile</span>
                  )}
                </button>

                {/* Service Honors & Awards */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('honors');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'honors'
                      ? 'bg-red-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={isSidebarCollapsed ? `Service Honors (${activeCadet.serviceHonors?.length || 0})` : undefined}
                >
                  <Medal className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between truncate">
                      <span className="truncate">Service Honors</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        activeTab === 'honors' ? 'bg-red-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {activeCadet.serviceHonors?.length || 0}
                      </span>
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* GROUP 2: ENGAGEMENT & STORIES */}
          <div className="space-y-1">
            {!isSidebarCollapsed ? (
              <button
                type="button"
                onClick={() => toggleDropdown('engagement')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <span>Engagement & Stories</span>
                {openDropdowns.engagement ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
            )}

            {(openDropdowns.engagement || isSidebarCollapsed) && (
              <div className="space-y-1">
                {/* Share Your Story */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('stories');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'stories'
                      ? 'bg-red-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={isSidebarCollapsed ? `Share Your Story (${stories.length})` : undefined}
                >
                  <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                  {!isSidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between truncate">
                      <span className="truncate">Share Your Story</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        activeTab === 'stories' ? 'bg-red-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {stories.length}
                      </span>
                    </div>
                  )}
                </button>

                {/* Cadet Experience Blog */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('blogs');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'blogs'
                      ? 'bg-red-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={isSidebarCollapsed ? `Experience Blog (${blogs.length})` : undefined}
                >
                  <FileText className="w-4 h-4 shrink-0 text-blue-500" />
                  {!isSidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between truncate">
                      <span className="truncate">Experience Blog</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        activeTab === 'blogs' ? 'bg-red-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {blogs.length}
                      </span>
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* GROUP 3: PLATOON SCHEDULE */}
          <div className="space-y-1">
            {!isSidebarCollapsed ? (
              <button
                type="button"
                onClick={() => toggleDropdown('schedule')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <span>Platoon Schedule</span>
                {openDropdowns.schedule ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
            )}

            {(openDropdowns.schedule || isSidebarCollapsed) && (
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('events');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'events'
                      ? 'bg-red-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={isSidebarCollapsed ? 'Events & Training Calendar' : undefined}
                >
                  <CalendarDays className="w-4 h-4 shrink-0 text-emerald-500" />
                  {!isSidebarCollapsed && (
                    <span className="truncate">Events & Calendar</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Sidebar Footer: Cadet Status & Regimental Standing */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
          {!isSidebarCollapsed ? (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Status</span>
                {activeCadet.isVerified ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                    <ShieldAlert className="w-3 h-3" />
                    <span>Pending</span>
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {activeCadet.currentRank}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {activeCadet.department}
              </p>
            </div>
          ) : (
            <div className="flex justify-center p-1" title={`${activeCadet.fullName} (${activeCadet.currentRank})`}>
              {activeCadet.isVerified ? (
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-500" />
              )}
            </div>
          )}
        </div>
      </aside>

      {/* MAIN VIEWPORT WITH STICKY TOP HEADER & BREADCRUMBS */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header Bar with Global Actions & Breadcrumb Trail */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle + Breadcrumb Trail */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>

            {/* Dedicated Breadcrumb Trail */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
              <span
                className="hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer transition-colors"
                onClick={() => setActiveTab('attendance')}
              >
                Cadet HQ
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="hidden sm:inline text-slate-600 dark:text-slate-400">
                {getCadetTabInfo(activeTab).group}
              </span>
              <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-bold text-slate-900 dark:text-white truncate font-mono text-[11px] sm:text-xs">
                {getCadetTabInfo(activeTab).label}
              </span>
            </nav>
          </div>

          {/* Right: Global Actions (Verification Badge, Share, Edit Profile, User Pill & Sign Out) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Verification Badge */}
            {activeCadet.isVerified ? (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Cadet</span>
              </span>
            ) : (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Verification Pending</span>
              </span>
            )}

            {/* Share Portal Button */}
            <button
              type="button"
              onClick={() =>
                setShareModalConfig({
                  isOpen: true,
                  title: 'Metropolitan University BNCC Platoon',
                  url: window.location.origin,
                  description: 'Official Cadet Member Portal for Metropolitan University BNCC Platoon.',
                })
              }
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Share portal"
            >
              <Share2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Edit Profile Button */}
            <button
              type="button"
              onClick={handleOpenEditProfile}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Edit Profile"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Profile</span>
            </button>

            {/* User Profile Pill & Sign Out */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                  {activeCadet.fullName}
                </span>
                <span className="text-[10px] font-mono text-slate-500 truncate">
                  {activeCadet.currentRank}
                </span>
              </div>
              <img
                src={activeCadet.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={activeCadet.fullName}
                className="w-8 h-8 rounded-full object-cover border border-red-600 shadow-xs shrink-0"
              />
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* MAIN SCROLLABLE CONTENT VIEWPORT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto min-w-0">
          {/* Notification Toast */}
          {notification && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {/* VERIFICATION ADVISORY BANNER IF UNVERIFIED */}
          {!activeCadet.isVerified && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold uppercase tracking-wider">Awaiting Platoon Leadership Verification</h4>
                <p className="leading-relaxed">
                  Your cadet profile is currently under review by the Platoon Commander and Senior NCOs. While unverified, your profile remains hidden from the public roster on the About Us page. Once approved, your masked details (Name, Cadet ID, Rank, Department, Semester, Blood Group) will appear automatically.
                </p>
              </div>
            </div>
          )}

          {/* COMPACT CADET PROFILE SUMMARY CARD */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={activeCadet.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={activeCadet.fullName}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-red-600 shadow-xs"
                />
                <span className="absolute bottom-0 right-0 p-0.5 rounded-full bg-slate-900 border border-slate-700 text-white">
                  <Shield className="w-3 h-3 text-amber-400" />
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900">
                    {activeCadet.cadetId}
                  </span>
                  {activeCadet.cadetType === 'excadet' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      <Award className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>Alumni</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                      <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span>Active</span>
                    </span>
                  )}
                </div>
                <h1 className="font-heading text-xl sm:text-2xl font-extrabold uppercase text-slate-900 dark:text-white">
                  {activeCadet.fullName}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="text-amber-700 dark:text-amber-400 font-bold">{activeCadet.currentRank}</span>
                  <span>·</span>
                  <span>{activeCadet.department}</span>
                  <span>·</span>
                  <span className="font-mono">Sem {activeCadet.currentSemester}</span>
                  <span>·</span>
                  <span className="text-rose-600 font-bold font-mono">Blood: {activeCadet.bloodGroup}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
              <div className="text-center px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Attendance</span>
                <span className="font-mono font-bold text-sm text-emerald-600">{activeCadet.attendanceRate || 88}%</span>
              </div>
              <div className="text-center px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Honors</span>
                <span className="font-mono font-bold text-sm text-amber-600">{activeCadet.serviceHonors?.length || 0}</span>
              </div>
              <div className="text-center px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Stories</span>
                <span className="font-mono font-bold text-sm text-blue-600">{stories.length}</span>
              </div>
            </div>
          </div>

      {/* ======================================================== */}
      {/* MODULE 1: ATTENDANCE SYSTEM & DATA TABLE */}
      {/* ======================================================== */}
      {activeTab === 'attendance' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top KPI Summary & Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>Parade Attendance</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {activeCadet.attendanceRate || 88}%
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span>✓ Meets 80% Regimental Mandate</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>Logged Drills</span>
                <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {activeCadet.manualAttendance?.length || 4} Parades
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Regular & ceremonial turnouts
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>Total Drill Hours</span>
                <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {activeCadet.trainingHours || 60} Hrs
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                Contributes to Merit Promotion
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Attendance Action
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Record individual squad or camp session
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAttendanceModalOpen(true)}
                className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 hover:bg-red-800 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Log Drill Turnout</span>
              </button>
            </div>
          </div>

          {/* Sub-Tabs: My Attendance Records vs Platoon Leaderboard */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setAttendanceSubTab('my-logs')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  attendanceSubTab === 'my-logs'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                My Drill Attendance Records
              </button>
              <button
                type="button"
                onClick={() => setAttendanceSubTab('leaderboard')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  attendanceSubTab === 'leaderboard'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Platoon Merit Leaderboard
              </button>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Policy standard: <strong className="text-slate-800 dark:text-slate-200">80% Minimum Attendance</strong> required for camp nominations
            </div>
          </div>

          {/* VIEW 1: MY DRILL ATTENDANCE DATA TABLE */}
          {attendanceSubTab === 'my-logs' ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white uppercase">
                    Official Parade & Training Roster Log
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Verified roll calls and field training hours credited to Cadet ID <strong className="font-mono text-red-600 dark:text-red-400">{activeCadet.cadetId}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAttendanceModalOpen(true)}
                  className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl bg-red-700 hover:bg-red-800 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Record Drill Session</span>
                </button>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse min-w-[760px]">
                  <thead>
                    <tr className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <th className="py-3 px-4 font-mono">Date</th>
                      <th className="py-3 px-4">Parade Type & Directives</th>
                      <th className="py-3 px-4 text-center">Duration</th>
                      <th className="py-3 px-4">Parade Square / Location</th>
                      <th className="py-3 px-4">Officer in Charge</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {((activeCadet.manualAttendance && activeCadet.manualAttendance.length > 0)
                      ? activeCadet.manualAttendance
                      : ([
                          {
                            id: 'att-1',
                            date: '2026-03-12',
                            drillDate: '2026-03-12',
                            segmentType: 'Morning Drill & Physical Fitness Test (PFT)',
                            paradeType: 'Morning Drill & Physical Fitness Test (PFT)',
                            durationHours: 3,
                            location: 'Metropolitan University Parade Square',
                            commandingOfficer: 'Captain Md. Aminul Islam & CUO',
                            reportingOfficer: 'Captain Md. Aminul Islam & CUO',
                            status: 'Attended',
                            verifiedStatus: 'Verified',
                            notes: 'Squad turnout 100%; inspection passed without penalty.',
                            remarks: 'Squad turnout 100%; inspection passed without penalty.',
                            createdAt: '2026-03-12T07:00:00Z',
                          },
                          {
                            id: 'att-2',
                            date: '2026-03-05',
                            drillDate: '2026-03-05',
                            segmentType: 'Ceremonial Guard of Honor Rehearsal',
                            paradeType: 'Ceremonial Guard of Honor Rehearsal',
                            durationHours: 4,
                            location: 'Sylhet Regimental HQ Grounds',
                            commandingOfficer: 'Major T. Rahman, Adjutant',
                            reportingOfficer: 'Major T. Rahman, Adjutant',
                            status: 'Attended',
                            verifiedStatus: 'Verified',
                            notes: 'Precision marching and sword drill rehearsal for Convocation.',
                            remarks: 'Precision marching and sword drill rehearsal for Convocation.',
                            createdAt: '2026-03-05T08:30:00Z',
                          },
                          {
                            id: 'att-3',
                            date: '2026-02-26',
                            drillDate: '2026-02-26',
                            segmentType: 'Tactical Route March & Compass Navigation (10KM)',
                            paradeType: 'Tactical Route March & Compass Navigation (10KM)',
                            durationHours: 5,
                            location: 'Khadimnagar Outer Tactical Perimeter',
                            commandingOfficer: 'Sergeant Instructor & Platoon NCOs',
                            reportingOfficer: 'Sergeant Instructor & Platoon NCOs',
                            status: 'Attended',
                            verifiedStatus: 'Verified',
                            notes: 'Section navigation, map reading, and emergency evacuation drills.',
                            remarks: 'Section navigation, map reading, and emergency evacuation drills.',
                            createdAt: '2026-02-26T06:00:00Z',
                          },
                          {
                            id: 'att-4',
                            date: '2026-02-18',
                            drillDate: '2026-02-18',
                            segmentType: 'Arms Handling & Stripping/Assembly Inspection',
                            paradeType: 'Arms Handling & Stripping/Assembly Inspection',
                            durationHours: 3,
                            location: 'BNCC Platoon Armory Hall',
                            commandingOfficer: 'BMA Qualified Weapon Master',
                            reportingOfficer: 'BMA Qualified Weapon Master',
                            status: 'Attended',
                            verifiedStatus: 'Verified',
                            notes: 'BD 08 rifle breakdown, maintenance, and safety verification.',
                            remarks: 'BD 08 rifle breakdown, maintenance, and safety verification.',
                            createdAt: '2026-02-18T10:00:00Z',
                          },
                        ] as ManualAttendanceEntry[])
                    ).map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {att.drillDate || att.date}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{att.paradeType || att.segmentType}</div>
                          {(att.notes || att.remarks) && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                              {att.notes || att.remarks}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-red-600 dark:text-red-400">
                          {att.durationHours} hrs
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          {att.location || 'Parade Ground'}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {att.commandingOfficer || att.reportingOfficer || 'Platoon Officer'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{att.verifiedStatus || att.status || 'Verified'}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* VIEW 2: PLATOON LEADERBOARD COMPONENT */
            <CadetLeaderboard currentCadet={activeCadet} />
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* PHASE 4 MODULE 2: SERVICE HONORS & AWARDS PORTFOLIO */}
      {/* ======================================================== */}
      {activeTab === 'honors' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white uppercase">
                Service Honors & Medals Portfolio
              </h3>
              <p className="text-xs text-slate-500">
                Add, manage, and proudly display your achievements, service honors, and medals earned during camps and university drills.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsHonorModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Honor / Medal</span>
            </button>
          </div>

          {activeCadet.serviceHonors && activeCadet.serviceHonors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCadet.serviceHonors.map((h) => (
                <div
                  key={h.id}
                  className="rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-950/20 dark:to-slate-900 p-5 space-y-3 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div className="rounded-xl p-2.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                      <Medal className="w-6 h-6" />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteHonor(h.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete honor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      {h.category} · {h.year}
                    </span>
                    <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white uppercase mt-0.5">
                      {h.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold">{h.awardingBody}</p>
                  </div>

                  {h.citation && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic border-t border-amber-100 dark:border-amber-900/30 pt-2">
                      "{h.citation}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <Medal className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No service honors or medals added yet.</p>
              <button
                type="button"
                onClick={() => setIsHonorModalOpen(true)}
                className="text-xs text-red-600 font-bold uppercase tracking-wider underline"
              >
                Click here to add your first distinction
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* PHASE 4 MODULE 3: SHARE YOUR STORY (MICRO-POSTS) */}
      {/* ======================================================== */}
      {activeTab === 'stories' && (
        <div className="space-y-6 animate-in fade-in duration-150 max-w-3xl mx-auto">
          {/* Post Statement Form */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={activeCadet.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={activeCadet.fullName}
                className="w-10 h-10 rounded-full object-cover border border-red-600"
              />
              <div>
                <span className="font-heading font-bold text-xs uppercase text-slate-900 dark:text-white block">
                  Share Your Story & Field Update
                </span>
                <span className="text-[10px] text-slate-400">
                  Posting as {activeCadet.currentRank} {activeCadet.fullName} ({activeCadet.cadetId})
                </span>
              </div>
            </div>

            <form onSubmit={handlePublishStory} className="space-y-3">
              <textarea
                required
                rows={3}
                placeholder="Share a brief statement or drill update with your platoon fellows (e.g. Completed 10km tactical route march with Section 2 today!)..."
                value={newStoryContent}
                onChange={(e) => setNewStoryContent(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Statements include an interactive "React" button for other cadets to salute.
                </span>
                <button
                  type="submit"
                  disabled={submittingStory || !newStoryContent.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-700 hover:bg-red-800 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingStory ? 'Posting...' : 'Broadcast Story'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Stories Feed */}
          <div className="space-y-4">
            {stories.map((story) => {
              const hasReacted = story.reactedUserIds?.includes(activeCadet.uid);

              return (
                <div
                  key={story.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={story.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt={story.authorName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                          <span>{story.authorName}</span>
                          {story.authorProfession && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                              <Briefcase className="w-2.5 h-2.5" />
                              {story.authorProfession}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {story.authorRank || story.authorRole || 'Community Contributor'}
                          {story.authorInstitution && ` · ${story.authorInstitution}`}
                          {story.cadetId && story.cadetId !== 'COMMUNITY' && story.cadetId !== 'VISITOR' && ` · ${story.cadetId}`}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {story.content}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleStoryReaction(story.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        hasReacted
                          ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-bold border border-red-200 dark:border-red-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${hasReacted ? 'fill-current text-red-600' : ''}`} />
                      <span>{hasReacted ? 'Saluted 🫡' : 'React / Salute'}</span>
                      <span className="font-mono ml-1 font-bold">({story.reactionsCount || 0})</span>
                    </button>

                    <span className="text-[11px] text-slate-400 font-mono">
                      MU BNCC Micro-Update
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PHASE 4 MODULE 4: CADET EXPERIENCE BLOG */}
      {/* ======================================================== */}
      {activeTab === 'blogs' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white uppercase">
                Cadet Experience Blog & Essays
              </h3>
              <p className="text-xs text-slate-500">
                Write and publish detailed posts about your training camps, drill reflections, flood relief, and ISSB journey. Each post includes React and Comment features.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsBlogModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Experience Blog</span>
            </button>
          </div>

          {/* Blog Feed */}
          <div className="space-y-6">
            {blogs.map((b) => {
              const hasReacted = b.reactedUserIds?.includes(activeCadet.uid);

              return (
                <article
                  key={b.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs space-y-4 p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={b.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt={b.authorName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          {b.authorName}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {b.authorRank} · {b.cadetId}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400">
                        {b.category}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading text-xl font-bold uppercase text-slate-900 dark:text-white">
                      {b.title}
                    </h3>
                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-2 whitespace-pre-line">
                      {b.content}
                    </div>
                  </div>

                  {/* Reaction & Comments Section */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleBlogReaction(b.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          hasReacted
                            ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-bold border border-red-200 dark:border-red-900'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${hasReacted ? 'fill-current text-red-600' : ''}`} />
                        <span>{hasReacted ? 'Reacted 🫡' : 'React'}</span>
                        <span className="font-mono ml-1 font-bold">({b.reactionsCount || 0})</span>
                      </button>

                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{b.comments?.length || 0} Comments</span>
                      </span>
                    </div>

                    {/* Existing Comments */}
                    {b.comments && b.comments.length > 0 && (
                      <div className="space-y-2 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        {b.comments.map((comm) => (
                          <div key={comm.id} className="text-xs space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {comm.authorName} {comm.authorRank ? `(${comm.authorRank})` : ''}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(comm.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300">{comm.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Write a comment as logged-in cadet..."
                        value={commentInputs[b.id] || ''}
                        onChange={(e) =>
                          setCommentInputs({ ...commentInputs, [b.id]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddComment(b.id);
                          }
                        }}
                        className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(b.id)}
                        disabled={!commentInputs[b.id]?.trim()}
                        className="rounded-xl bg-red-700 hover:bg-red-800 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-40 shadow-sm transition-all active:scale-95"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: CADET DOSSIER PROFILE INSPECTOR */}
      {/* ======================================================== */}
      {activeTab === 'profile' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-heading font-bold text-lg uppercase text-slate-900 dark:text-white">
                Official Cadet Dossier & Training Record
              </h3>
              <p className="text-xs text-slate-500">
                Primary identifier: <span className="font-mono font-bold text-red-600">{activeCadet.cadetId}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenEditProfile}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Update Dossier
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block uppercase text-[10px]">Full Name</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">{activeCadet.fullName}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block uppercase text-[10px]">
                {activeCadet.cadetType === 'excadet' ? 'Rank' : 'Current Rank'}
              </span>
              <span className="font-bold text-amber-700 dark:text-amber-400">{activeCadet.currentRank}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block uppercase text-[10px]">Cadet Status / Category</span>
              <span className={`font-bold inline-flex items-center gap-1.5 ${
                activeCadet.cadetType === 'excadet'
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-blue-700 dark:text-blue-400'
              }`}>
                {activeCadet.cadetType === 'excadet' ? (
                  <>
                    <Award className="w-3.5 h-3.5" />
                    <span>Ex-Cadet (প্রাক্তন ক্যাডেট · Alumni)</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Cadet (নিয়মিত ক্যাডেট · Active)</span>
                  </>
                )}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block uppercase text-[10px]">Academic Department</span>
              <span className="font-bold text-slate-900 dark:text-white">{activeCadet.department}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block uppercase text-[10px]">Current Semester (X.Y)</span>
              <span className="font-mono font-bold text-red-600">{activeCadet.currentSemester}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block uppercase text-[10px]">Blood Group</span>
              <span className="font-bold text-rose-600 font-mono">{activeCadet.bloodGroup}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block uppercase text-[10px]">Physical Measurements</span>
              <span className="font-mono font-bold">
                Height: {activeCadet.height || 'N/A'} · Weight: {activeCadet.weight || 'N/A'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block uppercase text-[10px]">Email Address</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 truncate block">{activeCadet.email}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block uppercase text-[10px]">Phone Number</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{activeCadet.phone || 'N/A'}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block uppercase text-[10px]">Emergency Contact</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{activeCadet.emergencyContact || 'N/A'}</span>
            </div>
          </div>

          {/* Public Profile Link & Social Share Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent border border-red-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="font-heading font-bold text-sm uppercase text-slate-900 dark:text-white">
                  Public Cadet Profile & Dossier
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold uppercase">
                  Publicly Accessible
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Anyone visiting the website can view your verified rank, service honors, and social media links via{' '}
                <span className="font-mono text-red-600 font-semibold">/cadet/{activeCadet.cadetId}</span>.
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                🔒 Security Guarantee: Your phone number and emergency contacts are strictly hidden and redacted from public view.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                to={`/cadet/${activeCadet.cadetId}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Public Profile</span>
              </Link>

              <button
                type="button"
                onClick={() =>
                  setShareModalConfig({
                    isOpen: true,
                    title: `${activeCadet.fullName} (${activeCadet.currentRank}) - MU BNCC Cadet Profile`,
                    url: `${window.location.origin}/cadet/${activeCadet.cadetId}`,
                    description: `Check out ${activeCadet.fullName}'s official cadet profile and service records in the Metropolitan University BNCC Platoon.`,
                  })
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5 text-red-600" />
                <span>Share My Profile</span>
              </button>
            </div>
          </div>

          {/* Connected Social Profiles Grid */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                Connected Social Profiles
              </span>
              <button
                type="button"
                onClick={handleOpenEditProfile}
                className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline"
              >
                + Edit Social Links
              </button>
            </div>

            {activeCadet.socialLinks &&
            (activeCadet.socialLinks.facebook ||
              activeCadet.socialLinks.linkedin ||
              activeCadet.socialLinks.twitter ||
              activeCadet.socialLinks.instagram ||
              activeCadet.socialLinks.github) ? (
              <div className="flex flex-wrap items-center gap-2.5">
                {activeCadet.socialLinks.facebook && (
                  <a
                    href={activeCadet.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 text-xs font-semibold hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <Facebook className="w-3.5 h-3.5 text-blue-600" />
                    <span>Facebook</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
                {activeCadet.socialLinks.linkedin && (
                  <a
                    href={activeCadet.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900/50 text-xs font-semibold hover:bg-sky-600 hover:text-white transition-all"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-sky-600" />
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
                {activeCadet.socialLinks.twitter && (
                  <a
                    href={activeCadet.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-black hover:text-white transition-all"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    <span>X / Twitter</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
                {activeCadet.socialLinks.instagram && (
                  <a
                    href={activeCadet.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-900/50 text-xs font-semibold hover:bg-pink-600 hover:text-white transition-all"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-600" />
                    <span>Instagram</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
                {activeCadet.socialLinks.github && (
                  <a
                    href={activeCadet.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-950 hover:text-white transition-all"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No personal social media profiles linked yet. Click "Update Dossier" or "Edit Social Links" to add your Facebook, LinkedIn, X, or Instagram.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CADET TRAINING & OFFICIAL EVENTS CALENDAR */}
      {/* ======================================================== */}
      {activeTab === 'events' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <EventsCalendar
            showHeading={true}
            cadetSession={{
              cadetId: activeCadet.cadetId,
              fullName: activeCadet.fullName,
              rank: activeCadet.currentRank,
            }}
          />
        </div>
      )}


      {/* MODAL: LOG DRILL ATTENDANCE */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base uppercase text-slate-900 dark:text-white">
                    Record Drill & Parade Attendance
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Cadet ID: {activeCadet.cadetId} · Log will be submitted for verification
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAttendanceModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAttendanceLog} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Parade / Drill Type *
                </label>
                <select
                  value={attendanceForm.paradeType}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, paradeType: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                >
                  <option value="Morning Drill & Physical Training">Morning Drill & Physical Training (PFT)</option>
                  <option value="Ceremonial Guard of Honor Rehearsal">Ceremonial Guard of Honor Rehearsal</option>
                  <option value="Weapons Safety & Drill Assembly">Weapons Safety & Drill Assembly</option>
                  <option value="Tactical Field Exercise & March">Tactical Field Exercise & March</option>
                  <option value="Regimental Camp Attendance">Regimental Camp Attendance</option>
                  <option value="Flag Hoisting & National Holiday Parade">Flag Hoisting & National Holiday Parade</option>
                  <option value="Disaster Response Drill & Voluntary Operation">Disaster Response Drill & Voluntary Operation</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Drill Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={attendanceForm.drillDate}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, drillDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Hours) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={attendanceForm.durationHours}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, durationHours: Number(e.target.value) || 3 })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Parade Square / Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metropolitan University Central Parade Ground"
                  value={attendanceForm.location}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, location: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Commanding Officer / NCO *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Platoon Commander / Cadet Under Officer"
                  value={attendanceForm.commandingOfficer}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, commandingOfficer: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Turnout Notes / Directives (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Uniform turnout grade, equipment inspected, or special roles assigned..."
                  value={attendanceForm.notes}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-5 py-2.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAttendance}
                  className="rounded-xl bg-red-700 hover:bg-red-800 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  {submittingAttendance ? 'Saving...' : 'Record Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SERVICE HONOR */}
      {isHonorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-heading font-bold text-base uppercase text-slate-900 dark:text-white">
                Register Service Honor / Medal
              </h3>
              <button
                type="button"
                onClick={() => setIsHonorModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHonor} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Honor / Medal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Best Firer Medal / Guard of Honor Trophy"
                  value={honorForm.title}
                  onChange={(e) => setHonorForm({ ...honorForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={honorForm.category}
                    onChange={(e) =>
                      setHonorForm({
                        ...honorForm,
                        category: e.target.value as ServiceHonorEntry['category'],
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                  >
                    <option value="Medal">Medal</option>
                    <option value="Distinction">Distinction</option>
                    <option value="Award">Award</option>
                    <option value="Camp Honor">Camp Honor</option>
                    <option value="Best Turnout">Best Turnout</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Year Awarded *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="2026"
                    value={honorForm.year}
                    onChange={(e) => setHonorForm({ ...honorForm, year: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Awarding Body *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mainamati Regiment / Metropolitan University"
                  value={honorForm.awardingBody}
                  onChange={(e) => setHonorForm({ ...honorForm, awardingBody: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Citation / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Reason for honor, parade occasion, or distinguished service..."
                  value={honorForm.citation}
                  onChange={(e) => setHonorForm({ ...honorForm, citation: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsHonorModalOpen(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-5 py-2.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-700 hover:bg-red-800 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95"
                >
                  Save Honor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PUBLISH BLOG */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-heading font-bold text-base uppercase text-slate-900 dark:text-white">
                Publish Cadet Experience Blog
              </h3>
              <button
                type="button"
                onClick={() => setIsBlogModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishBlog} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Blog Post Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lessons in Squad Brotherhood during Flood Relief"
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Topic / Category *
                </label>
                <select
                  value={blogForm.category}
                  onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                >
                  <option value="Regimental Camp">Regimental Camp (CATC / Central Camp)</option>
                  <option value="ISSB Journey">Defense ISSB Journey & Commissions</option>
                  <option value="Parade Experience">Parade & Ceremonial Flag Drills</option>
                  <option value="Flood Relief">Disaster Relief & Voluntary Operations</option>
                  <option value="University Life & Discipline">University Life & Discipline Balance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Essay Content *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write in detail about your experiences, challenges overcome, and takeaways..."
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-3.5 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={blogForm.coverImage}
                  onChange={(e) => setBlogForm({ ...blogForm, coverImage: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-5 py-2.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-700 hover:bg-red-800 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95"
                >
                  Publish Blog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CADET PROFILE */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-heading font-bold text-base uppercase text-slate-900 dark:text-white">
                Update Cadet Profile
              </h3>
              <button
                type="button"
                onClick={() => setIsEditProfileModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editProfileForm.fullName}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              {/* Cadet Status / Category Selector */}
              <div>
                <label className="block font-semibold mb-1">Cadet Status / Category *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditProfileForm({ ...editProfileForm, cadetType: 'cadet' })}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-bold transition-all ${
                      editProfileForm.cadetType === 'cadet'
                        ? 'bg-red-700 text-white border-red-700 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-red-500'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Cadet (Active)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditProfileForm({ ...editProfileForm, cadetType: 'excadet' })}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-bold transition-all ${
                      editProfileForm.cadetType === 'excadet'
                        ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-amber-500'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Ex-Cadet (Alumni)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">
                    {editProfileForm.cadetType === 'excadet' ? 'Rank *' : 'Current Rank *'}
                  </label>
                  <select
                    value={editProfileForm.currentRank}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, currentRank: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    {[
                      'Cadet Under Officer',
                      'Cadet Sergeant',
                      'Cadet Corporal',
                      'Cadet Lance Corporal',
                      'Cadet',
                    ].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Current Semester (Format X.Y) *</label>
                  <input
                    type="text"
                    required
                    pattern="^[1-5]\.[1-3]$"
                    value={editProfileForm.currentSemester}
                    onChange={(e) =>
                      setEditProfileForm({ ...editProfileForm, currentSemester: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">e.g. 3.3 (Tri-Semester)</span>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Blood Group *</label>
                  <select
                    value={editProfileForm.bloodGroup}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, bloodGroup: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editProfileForm.phone}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Emergency Contact</label>
                  <input
                    type="tel"
                    value={editProfileForm.emergencyContact}
                    onChange={(e) =>
                      setEditProfileForm({ ...editProfileForm, emergencyContact: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Height</label>
                  <input
                    type="text"
                    value={editProfileForm.height}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, height: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Weight</label>
                  <input
                    type="text"
                    value={editProfileForm.weight}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, weight: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Profile Picture (Image Upload)</label>
                <div className="flex items-center gap-3">
                  <img
                    src={editProfileForm.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt="Current"
                    className="w-12 h-12 rounded-full object-cover border border-red-600"
                  />
                  <div className="space-y-1 flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, 'edit')}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700"
                    />
                    <input
                      type="url"
                      placeholder="Or image URL..."
                      value={editProfileForm.profilePicture}
                      onChange={(e) =>
                        setEditProfileForm({ ...editProfileForm, profilePicture: e.target.value })
                      }
                      className="w-full p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Social Media Links */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                      Personal Social Media Profiles
                    </label>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Shown on your public cadet dossier
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                      <Facebook className="w-3.5 h-3.5 text-blue-600" />
                      <span>Facebook Profile</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://facebook.com/username"
                      value={editProfileForm.socialLinks.facebook}
                      onChange={(e) =>
                        setEditProfileForm({
                          ...editProfileForm,
                          socialLinks: { ...editProfileForm.socialLinks, facebook: e.target.value },
                        })
                      }
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                      <Linkedin className="w-3.5 h-3.5 text-sky-600" />
                      <span>LinkedIn Profile</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={editProfileForm.socialLinks.linkedin}
                      onChange={(e) =>
                        setEditProfileForm({
                          ...editProfileForm,
                          socialLinks: { ...editProfileForm.socialLinks, linkedin: e.target.value },
                        })
                      }
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                      <Twitter className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                      <span>X / Twitter</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://x.com/username"
                      value={editProfileForm.socialLinks.twitter}
                      onChange={(e) =>
                        setEditProfileForm({
                          ...editProfileForm,
                          socialLinks: { ...editProfileForm.socialLinks, twitter: e.target.value },
                        })
                      }
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5 text-pink-600" />
                      <span>Instagram</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/username"
                      value={editProfileForm.socialLinks.instagram}
                      onChange={(e) =>
                        setEditProfileForm({
                          ...editProfileForm,
                          socialLinks: { ...editProfileForm.socialLinks, instagram: e.target.value },
                        })
                      }
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-slate-800 dark:text-slate-200" />
                      <span>GitHub (Optional)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/username"
                      value={editProfileForm.socialLinks.github}
                      onChange={(e) =>
                        setEditProfileForm({
                          ...editProfileForm,
                          socialLinks: { ...editProfileForm.socialLinks, github: e.target.value },
                        })
                      }
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold uppercase tracking-wider"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </main>
      </div>

      {/* VISITOR STORY MODAL */}
      <VisitorStoryModal
        isOpen={isVisitorStoryOpen}
        onClose={() => setIsVisitorStoryOpen(false)}
        onStoryPublished={(story) => {
          setStories((prev) => [story, ...prev]);
          showToast('Thank you! Your story has been posted to the community feed.');
        }}
      />

      {/* SOCIAL SHARING MODAL FOR CADETS */}
      <SocialShareModal
        isOpen={shareModalConfig.isOpen}
        onClose={() => setShareModalConfig((prev) => ({ ...prev, isOpen: false }))}
        title={shareModalConfig.title}
        url={shareModalConfig.url}
        description={shareModalConfig.description}
      />
    </div>
  );
};
