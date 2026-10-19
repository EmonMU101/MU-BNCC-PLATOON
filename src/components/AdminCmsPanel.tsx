import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Target,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  RefreshCw,
  X,
  Compass,
  Users,
  HeartHandshake,
  ShieldCheck,
  Award,
  Star,
  Activity,
  Flame,
  Shield,
  Layers,
  Globe,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  Medal,
  Flag,
  AlertCircle,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Paperclip,
} from 'lucide-react';
import {
  PlatoonHighlightItem,
  FieldRecordItem,
  PlatoonMilestoneItem,
  RegimentalHonorItem,
  subscribeHighlights,
  subscribeFieldRecords,
  subscribeMilestones,
  subscribeRegimentalHonors,
  createHighlight,
  updateHighlight,
  deleteHighlight,
  createFieldRecord,
  updateFieldRecord,
  deleteFieldRecord,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  toggleDeployMilestone,
  deployAllMilestones,
  createRegimentalHonor,
  updateRegimentalHonor,
  deleteRegimentalHonor,
  toggleDeployRegimentalHonor,
  deployAllRegimentalHonors,
  seedInitialHighlights,
  seedInitialFieldRecords,
  seedInitialMilestones,
  seedInitialHonors,
} from '../services/platoonCmsService';

const ImageAttachmentField: React.FC<{
  label: string;
  value?: string;
  onChange: (val: string) => void;
}> = ({ label, value, onChange }) => {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
      <label className="block font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {value ? (
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0 bg-slate-900">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-1 right-1 p-0.5 rounded bg-black/70 text-white hover:bg-red-600"
              title="Remove Image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 text-slate-400">
            <ImageIcon className="w-6 h-6" />
          </div>
        )}
        <div className="space-y-2 flex-1 w-full">
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 dark:file:bg-red-950 dark:file:text-red-300"
          />
          <input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or enter image URL (https://...)"
            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px]"
          />
        </div>
      </div>
    </div>
  );
};

export const AdminCmsPanel: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'milestones' | 'honors' | 'highlights' | 'records'>('milestones');
  const [highlights, setHighlights] = useState<PlatoonHighlightItem[]>([]);
  const [fieldRecords, setFieldRecords] = useState<FieldRecordItem[]>([]);
  const [milestones, setMilestones] = useState<PlatoonMilestoneItem[]>([]);
  const [honors, setHonors] = useState<RegimentalHonorItem[]>([]);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Highlight Form Modal
  const [isHlModalOpen, setIsHlModalOpen] = useState(false);
  const [editingHlId, setEditingHlId] = useState<string | null>(null);
  const [hlForm, setHlForm] = useState<Omit<PlatoonHighlightItem, 'id'>>({
    title: '',
    titleBn: '',
    description: '',
    descriptionBn: '',
    badge: 'Regimental Honor',
    category: 'Operational Excellence',
    metricValue: '',
    iconName: 'Trophy',
    imageUrl: '',
    order: 1,
  });

  // 2. Field Record Form Modal
  const [isFrModalOpen, setIsFrModalOpen] = useState(false);
  const [editingFrId, setEditingFrId] = useState<string | null>(null);
  const [frForm, setFrForm] = useState<Omit<FieldRecordItem, 'id'>>({
    label: '',
    labelBn: '',
    value: 0,
    suffix: '+',
    note: '',
    noteBn: '',
    category: 'Muster Roll',
    iconName: 'Users',
    imageUrl: '',
    order: 1,
  });

  // 3. Milestone Form Modal
  const [isMsModalOpen, setIsMsModalOpen] = useState(false);
  const [editingMsId, setEditingMsId] = useState<string | null>(null);
  const [msForm, setMsForm] = useState<Omit<PlatoonMilestoneItem, 'id'>>({
    title: '',
    titleBn: '',
    date: '',
    dateBn: '',
    category: 'Establishment',
    categoryBn: '',
    description: '',
    descriptionBn: '',
    location: 'Metropolitan University, Sylhet',
    locationBn: '',
    badge: 'Milestone',
    badgeBn: '',
    imageUrl: '',
    isDeployed: true,
    order: 1,
  });

  // 4. Regimental Honor Form Modal
  const [isHnModalOpen, setIsHnModalOpen] = useState(false);
  const [editingHnId, setEditingHnId] = useState<string | null>(null);
  const [hnForm, setHnForm] = useState<Omit<RegimentalHonorItem, 'id'>>({
    title: '',
    titleBn: '',
    recipientOrPlatoon: 'Metropolitan University Platoon Squad',
    recipientOrPlatoonBn: '',
    awardYear: new Date().getFullYear().toString(),
    awardYearBn: '',
    conferredBy: 'Commanding Officer, 2 BNCC Battalion',
    conferredByBn: '',
    citation: '',
    citationBn: '',
    medalType: 'Championship Trophy',
    badge: 'Regimental Honor',
    badgeBn: '',
    imageUrl: '',
    isDeployed: true,
    order: 1,
  });

  // Subscriptions to real-time Firestore collections
  useEffect(() => {
    const unsubHl = subscribeHighlights(setHighlights);
    const unsubFr = subscribeFieldRecords(setFieldRecords);
    const unsubMs = subscribeMilestones(setMilestones);
    const unsubHn = subscribeRegimentalHonors(setHonors);

    return () => {
      unsubHl();
      unsubFr();
      unsubMs();
      unsubHn();
    };
  }, []);

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // ==========================================
  // HANDLERS: MILESTONES (CRUD & DEPLOY)
  // ==========================================
  const handleOpenNewMilestone = () => {
    setEditingMsId(null);
    setMsForm({
      title: '',
      titleBn: '',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      dateBn: '',
      category: 'Operational',
      categoryBn: '',
      description: '',
      descriptionBn: '',
      location: 'Metropolitan University, Bateshwar, Sylhet',
      locationBn: '',
      badge: 'Historic Milestone',
      badgeBn: '',
      imageUrl: '',
      isDeployed: true,
      order: milestones.length + 1,
    });
    setIsMsModalOpen(true);
  };

  const handleEditMilestone = (item: PlatoonMilestoneItem) => {
    setEditingMsId(item.id);
    setMsForm({
      title: item.title,
      titleBn: item.titleBn || '',
      date: item.date,
      dateBn: item.dateBn || '',
      category: item.category || 'Operational',
      categoryBn: item.categoryBn || '',
      description: item.description,
      descriptionBn: item.descriptionBn || '',
      location: item.location || '',
      locationBn: item.locationBn || '',
      badge: item.badge || '',
      badgeBn: item.badgeBn || '',
      imageUrl: item.imageUrl || '',
      isDeployed: item.isDeployed ?? true,
      order: item.order || 1,
    });
    setIsMsModalOpen(true);
  };

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msForm.title.trim()) return;

    setIsSaving(true);
    try {
      if (editingMsId) {
        await updateMilestone(editingMsId, msForm);
        showMsg(`Milestone "${msForm.title}" updated and synced.`);
      } else {
        await createMilestone(msForm);
        showMsg(`New Milestone "${msForm.title}" created successfully.`);
      }
      setIsMsModalOpen(false);
    } catch (err: any) {
      console.error('Save milestone error:', err);
      showMsg(`Failed to save milestone: ${err.message || 'Unknown database error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMilestone = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete milestone "${title}"?`)) return;
    try {
      await deleteMilestone(id);
      showMsg(`Milestone deleted.`);
    } catch (err: any) {
      showMsg(`Delete failed: ${err.message}`, 'error');
    }
  };

  const handleToggleDeployMilestone = async (item: PlatoonMilestoneItem) => {
    try {
      await toggleDeployMilestone(item.id, item.isDeployed);
      showMsg(
        item.isDeployed
          ? `Milestone "${item.title}" moved to draft (hidden from public).`
          : `Milestone "${item.title}" deployed live to frontend!`
      );
    } catch (err: any) {
      showMsg(`Deploy toggle failed: ${err.message}`, 'error');
    }
  };

  const handleDeployAllMilestones = async () => {
    try {
      await deployAllMilestones(milestones);
      showMsg('All Platoon Milestones published and deployed live to frontend!');
    } catch (err: any) {
      showMsg(`Batch deploy failed: ${err.message}`, 'error');
    }
  };

  // ==========================================
  // HANDLERS: REGIMENTAL HONORS (CRUD & DEPLOY)
  // ==========================================
  const handleOpenNewHonor = () => {
    setEditingHnId(null);
    setHnForm({
      title: '',
      titleBn: '',
      recipientOrPlatoon: 'Metropolitan University Platoon Squad',
      recipientOrPlatoonBn: '',
      awardYear: new Date().getFullYear().toString(),
      awardYearBn: '',
      conferredBy: 'Commanding Officer, 2 BNCC Battalion, Mainamati Regiment',
      conferredByBn: '',
      citation: '',
      citationBn: '',
      medalType: 'Championship Trophy',
      badge: 'Regimental Honor',
      badgeBn: '',
      imageUrl: '',
      isDeployed: true,
      order: honors.length + 1,
    });
    setIsHnModalOpen(true);
  };

  const handleEditHonor = (item: RegimentalHonorItem) => {
    setEditingHnId(item.id);
    setHnForm({
      title: item.title,
      titleBn: item.titleBn || '',
      recipientOrPlatoon: item.recipientOrPlatoon || '',
      recipientOrPlatoonBn: item.recipientOrPlatoonBn || '',
      awardYear: item.awardYear || new Date().getFullYear().toString(),
      awardYearBn: item.awardYearBn || '',
      conferredBy: item.conferredBy || '',
      conferredByBn: item.conferredByBn || '',
      citation: item.citation || '',
      citationBn: item.citationBn || '',
      medalType: item.medalType || 'Trophy',
      badge: item.badge || 'Honor',
      badgeBn: item.badgeBn || '',
      imageUrl: item.imageUrl || '',
      isDeployed: item.isDeployed ?? true,
      order: item.order || 1,
    });
    setIsHnModalOpen(true);
  };

  const handleSaveHonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hnForm.title.trim()) return;

    setIsSaving(true);
    try {
      if (editingHnId) {
        await updateRegimentalHonor(editingHnId, hnForm);
        showMsg(`Regimental Honor "${hnForm.title}" updated and synced.`);
      } else {
        await createRegimentalHonor(hnForm);
        showMsg(`New Regimental Honor "${hnForm.title}" created successfully.`);
      }
      setIsHnModalOpen(false);
    } catch (err: any) {
      console.error('Save honor error:', err);
      showMsg(`Failed to save honor: ${err.message || 'Unknown database error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHonor = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete honor "${title}"?`)) return;
    try {
      await deleteRegimentalHonor(id);
      showMsg(`Honor deleted.`);
    } catch (err: any) {
      showMsg(`Delete failed: ${err.message}`, 'error');
    }
  };

  const handleToggleDeployHonor = async (item: RegimentalHonorItem) => {
    try {
      await toggleDeployRegimentalHonor(item.id, item.isDeployed);
      showMsg(
        item.isDeployed
          ? `Honor "${item.title}" moved to draft (hidden from public).`
          : `Honor "${item.title}" deployed live to frontend!`
      );
    } catch (err: any) {
      showMsg(`Deploy toggle failed: ${err.message}`, 'error');
    }
  };

  const handleDeployAllHonors = async () => {
    try {
      await deployAllRegimentalHonors(honors);
      showMsg('All Regimental Honors deployed live to frontend!');
    } catch (err: any) {
      showMsg(`Batch deploy failed: ${err.message}`, 'error');
    }
  };

  // ==========================================
  // HANDLERS: HIGHLIGHTS (DEBUGGED & ROBUST)
  // ==========================================
  const handleOpenNewHighlight = () => {
    setEditingHlId(null);
    setHlForm({
      title: '',
      titleBn: '',
      description: '',
      descriptionBn: '',
      badge: 'Honor',
      category: 'Excellence',
      metricValue: '',
      iconName: 'Trophy',
      imageUrl: '',
      order: highlights.length + 1,
    });
    setIsHlModalOpen(true);
  };

  const handleEditHighlight = (item: PlatoonHighlightItem) => {
    setEditingHlId(item.id);
    setHlForm({
      title: item.title,
      titleBn: item.titleBn || '',
      description: item.description,
      descriptionBn: item.descriptionBn || '',
      badge: item.badge || '',
      category: item.category || 'Excellence',
      metricValue: item.metricValue || '',
      iconName: item.iconName || 'Trophy',
      imageUrl: item.imageUrl || '',
      order: item.order || 1,
    });
    setIsHlModalOpen(true);
  };

  const handleSaveHighlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hlForm.title.trim()) return;

    setIsSaving(true);
    try {
      if (editingHlId) {
        await updateHighlight(editingHlId, hlForm);
        showMsg(`Highlight "${hlForm.title}" updated successfully in database.`);
      } else {
        await createHighlight(hlForm);
        showMsg(`Highlight "${hlForm.title}" created successfully.`);
      }
      setIsHlModalOpen(false);
    } catch (err: any) {
      console.error('Save highlight error:', err);
      showMsg(`Database save error: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHighlight = async (id: string, title: string) => {
    if (!window.confirm(`Delete highlight "${title}"?`)) return;
    try {
      await deleteHighlight(id);
      showMsg(`Highlight deleted.`);
    } catch (err: any) {
      showMsg(`Delete error: ${err.message}`, 'error');
    }
  };

  // ==========================================
  // HANDLERS: FIELD RECORDS (DEBUGGED & ROBUST)
  // ==========================================
  const handleOpenNewFieldRecord = () => {
    setEditingFrId(null);
    setFrForm({
      label: '',
      labelBn: '',
      value: 10,
      suffix: '+',
      note: '',
      noteBn: '',
      category: 'Parade',
      iconName: 'Users',
      imageUrl: '',
      order: fieldRecords.length + 1,
    });
    setIsFrModalOpen(true);
  };

  const handleEditFieldRecord = (item: FieldRecordItem) => {
    setEditingFrId(item.id);
    setFrForm({
      label: item.label,
      labelBn: item.labelBn || '',
      value: item.value || 0,
      suffix: item.suffix || '',
      note: item.note || '',
      noteBn: item.noteBn || '',
      category: item.category || 'Muster Roll',
      iconName: item.iconName || 'Users',
      imageUrl: item.imageUrl || '',
      order: item.order || 1,
    });
    setIsFrModalOpen(true);
  };

  const handleSaveFieldRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frForm.label.trim()) return;

    setIsSaving(true);
    try {
      if (editingFrId) {
        await updateFieldRecord(editingFrId, frForm);
        showMsg(`Field Record "${frForm.label}" updated successfully in database.`);
      } else {
        await createFieldRecord(frForm);
        showMsg(`Field Record "${frForm.label}" created successfully.`);
      }
      setIsFrModalOpen(false);
    } catch (err: any) {
      console.error('Save field record error:', err);
      showMsg(`Database save error: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFieldRecord = async (id: string, label: string) => {
    if (!window.confirm(`Delete field record stat "${label}"?`)) return;
    try {
      await deleteFieldRecord(id);
      showMsg(`Field Record deleted.`);
    } catch (err: any) {
      showMsg(`Delete error: ${err.message}`, 'error');
    }
  };

  // Fast reset/seeding of all regimental defaults
  const handleResetDefaults = async () => {
    if (
      !window.confirm(
        'Synchronize and seed all platoon archives (Milestones, Regimental Honors, Highlights, Field Records) to regimental defaults in Firestore?'
      )
    )
      return;

    setIsSaving(true);
    try {
      await Promise.all([
        seedInitialMilestones(),
        seedInitialHonors(),
        seedInitialHighlights(),
        seedInitialFieldRecords(),
      ]);
      showMsg('All platoon records and military archives successfully seeded into Firestore.');
    } catch (err: any) {
      showMsg(`Seeding error: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 animate-in fade-in duration-150 ${
            notification.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              : 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span className="font-medium">{notification.text}</span>
        </div>
      )}

      {/* Top Header & Navigation Sub-Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* TAB 1: MILESTONES */}
          <button
            type="button"
            onClick={() => setActiveSection('milestones')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeSection === 'milestones'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Key Milestones ({milestones.length})</span>
          </button>

          {/* TAB 2: REGIMENTAL HONORS */}
          <button
            type="button"
            onClick={() => setActiveSection('honors')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeSection === 'honors'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Medal className="w-3.5 h-3.5" />
            <span>Regimental Honors ({honors.length})</span>
          </button>

          {/* TAB 3: HIGHLIGHTS */}
          <button
            type="button"
            onClick={() => setActiveSection('highlights')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeSection === 'highlights'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Highlights ({highlights.length})</span>
          </button>

          {/* TAB 4: FIELD RECORDS */}
          <button
            type="button"
            onClick={() => setActiveSection('records')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeSection === 'records'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Field Records ({fieldRecords.length})</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {activeSection === 'milestones' && (
            <>
              <button
                type="button"
                onClick={handleDeployAllMilestones}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold uppercase tracking-wider transition-colors"
                title="Publish and deploy all milestones live to the frontend"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>Deploy All Live</span>
              </button>
              <button
                type="button"
                onClick={handleOpenNewMilestone}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Milestone</span>
              </button>
            </>
          )}

          {activeSection === 'honors' && (
            <>
              <button
                type="button"
                onClick={handleDeployAllHonors}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold uppercase tracking-wider transition-colors"
                title="Publish and deploy all regimental honors live to the frontend"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>Deploy All Live</span>
              </button>
              <button
                type="button"
                onClick={handleOpenNewHonor}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Regimental Honor</span>
              </button>
            </>
          )}

          {activeSection === 'highlights' && (
            <button
              type="button"
              onClick={handleOpenNewHighlight}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Highlight</span>
            </button>
          )}

          {activeSection === 'records' && (
            <button
              type="button"
              onClick={handleOpenNewFieldRecord}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Field Record</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isSaving}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Seed/Reset all four regimental databases in Firestore to default standards"
          >
            <RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 1: KEY PLATOON MILESTONES (NEW MODULE & DEPLOY ENGINE)        */}
      {/* ==================================================================== */}
      {activeSection === 'milestones' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Key Platoon Milestones Engine:</strong> Edit, organize, and deploy official platoon timeline entries. Published items display live on the Home page and About Platoon sections.
              </span>
            </div>
            <div className="text-[11px] font-mono text-amber-700 dark:text-amber-300 font-semibold shrink-0">
              {milestones.filter((m) => m.isDeployed).length} / {milestones.length} Deployed
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones.map((ms) => (
              <div
                key={ms.id}
                className={`rounded-2xl border p-5 space-y-3.5 relative transition-all ${
                  ms.isDeployed
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
                    : 'border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 opacity-80'
                }`}
              >
                {/* Status bar */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        ms.isDeployed
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {ms.isDeployed ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-amber-600" />}
                      {ms.isDeployed ? 'Live on Frontend' : 'Draft / Hidden'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Order #{ms.order}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleDeployMilestone(ms)}
                      className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${
                        ms.isDeployed
                          ? 'border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                      title={ms.isDeployed ? 'Unpublish to draft' : 'Publish live to frontend'}
                    >
                      {ms.isDeployed ? 'Unpublish' : 'Deploy Live'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditMilestone(ms)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                      title="Edit milestone"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMilestone(ms.id, ms.title)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600"
                      title="Delete milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{ms.date}</span>
                    {ms.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono uppercase">
                        {ms.badge}
                      </span>
                    )}
                  </div>

                  <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white mt-1">
                    {ms.title}
                  </h4>
                  {ms.titleBn && <p className="text-xs text-slate-500 font-medium">{ms.titleBn}</p>}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {ms.description}
                </p>

                {ms.location && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{ms.location}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 2: REGIMENTAL HONORS & DISTINCTIONS (NEW MODULE & DEPLOY)    */}
      {/* ==================================================================== */}
      {activeSection === 'honors' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-900 dark:text-red-200">
            <div className="flex items-center gap-2">
              <Medal className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong>Regimental Honors & Citations:</strong> Manage official military commendations, runner-up trophies, medals, and university citations.
              </span>
            </div>
            <div className="text-[11px] font-mono text-red-700 dark:text-red-300 font-semibold shrink-0">
              {honors.filter((h) => h.isDeployed).length} / {honors.length} Deployed
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {honors.map((hn) => (
              <div
                key={hn.id}
                className={`rounded-2xl border p-5 space-y-3.5 relative transition-all ${
                  hn.isDeployed
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
                    : 'border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 opacity-80'
                }`}
              >
                {/* Status Bar */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        hn.isDeployed
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {hn.isDeployed ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-amber-600" />}
                      {hn.isDeployed ? 'Live on Frontend' : 'Draft / Hidden'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Order #{hn.order}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleDeployHonor(hn)}
                      className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${
                        hn.isDeployed
                          ? 'border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                      title={hn.isDeployed ? 'Unpublish to draft' : 'Publish live to frontend'}
                    >
                      {hn.isDeployed ? 'Unpublish' : 'Deploy Live'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditHonor(hn)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                      title="Edit honor"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteHonor(hn.id, hn.title)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600"
                      title="Delete honor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-bold text-red-600 dark:text-red-400">
                      Year {hn.awardYear}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-semibold">
                      {hn.medalType}
                    </span>
                  </div>

                  <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white mt-1.5">
                    {hn.title}
                  </h4>
                  {hn.titleBn && <p className="text-xs text-slate-500 font-medium">{hn.titleBn}</p>}
                </div>

                <div className="space-y-1 text-xs">
                  <div className="text-slate-700 dark:text-slate-300 font-medium">
                    <strong className="text-slate-500 font-mono text-[11px] uppercase">Awardee: </strong>
                    {hn.recipientOrPlatoon}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    <strong className="text-slate-400 font-mono uppercase">Authority: </strong>
                    {hn.conferredBy}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  "{hn.citation}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 3: PLATOON HIGHLIGHTS (DEBUGGED & ROBUST CMS)                 */}
      {/* ==================================================================== */}
      {activeSection === 'highlights' && (
        <div className="space-y-4">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>All records below sync live to the Home page "Platoon Highlights & Field Record" section.</span>
            <span>{highlights.length} Active Records</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlights.map((hl) => (
              <div
                key={hl.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 relative group shadow-sm hover:border-red-500/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400">
                      {hl.category || 'Honor'}
                    </span>
                    <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white mt-1.5">
                      {hl.title}
                    </h4>
                    {hl.titleBn && (
                      <p className="text-xs text-slate-500 font-medium">{hl.titleBn}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditHighlight(hl)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Edit highlight"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteHighlight(hl.id, hl.title)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 transition-colors"
                      title="Delete highlight"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {hl.description}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-red-600">{hl.metricValue || 'Featured'}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Order #{hl.order}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 4: FIELD RECORDS & NUMERICAL STAT COUNTERS                    */}
      {/* ==================================================================== */}
      {activeSection === 'records' && (
        <div className="space-y-4">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Quantitative operational metrics displayed in animated counter meters on the Home page.</span>
            <span>{fieldRecords.length} Active Metrics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {fieldRecords.map((fr) => (
              <div
                key={fr.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2 relative group shadow-sm hover:border-red-500/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    {fr.category || 'Metric'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditFieldRecord(fr)}
                      className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Edit metric"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFieldRecord(fr.id, fr.label)}
                      className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 transition-colors"
                      title="Delete metric"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
                  {fr.value}
                  <span className="text-red-600">{fr.suffix}</span>
                </div>

                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {fr.label}
                </div>
                {fr.labelBn && <div className="text-[11px] text-slate-500">{fr.labelBn}</div>}

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {fr.note}
                </p>
                <div className="text-[10px] font-mono text-slate-400 pt-1">
                  Order #{fr.order}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: CREATE / EDIT MILESTONE                                      */}
      {/* ==================================================================== */}
      {isMsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-600" />
                <h3 className="font-heading text-lg font-bold uppercase text-slate-900 dark:text-white">
                  {editingMsId ? 'Edit Platoon Milestone' : 'Record New Platoon Milestone'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMilestone} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Milestone Title (English) *</label>
                <input
                  type="text"
                  required
                  value={msForm.title}
                  onChange={(e) => setMsForm({ ...msForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  placeholder="e.g. Sanctioning of MU BNCC Platoon"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Milestone Title (Bengali)</label>
                <input
                  type="text"
                  value={msForm.titleBn}
                  onChange={(e) => setMsForm({ ...msForm, titleBn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  placeholder="e.g. প্লাটুনের আনুষ্ঠানিক অনুমোদন ও প্রতিষ্ঠা"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Date / Period (English) *</label>
                  <input
                    type="text"
                    required
                    value={msForm.date}
                    onChange={(e) => setMsForm({ ...msForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    placeholder="e.g. 31 July 2025"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Date (Bengali)</label>
                  <input
                    type="text"
                    value={msForm.dateBn}
                    onChange={(e) => setMsForm({ ...msForm, dateBn: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    placeholder="e.g. ৩১ জুলাই ২০২৫"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={msForm.category}
                    onChange={(e) => setMsForm({ ...msForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    placeholder="Establishment / Camp"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={msForm.badge}
                    onChange={(e) => setMsForm({ ...msForm, badge: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    placeholder="Landmark"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Order #</label>
                  <input
                    type="number"
                    value={msForm.order}
                    onChange={(e) => setMsForm({ ...msForm, order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Location / Venue</label>
                <input
                  type="text"
                  value={msForm.location}
                  onChange={(e) => setMsForm({ ...msForm, location: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  placeholder="e.g. Metropolitan University, Bateshwar, Sylhet"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Detailed Description (English) *</label>
                <textarea
                  required
                  rows={3}
                  value={msForm.description}
                  onChange={(e) => setMsForm({ ...msForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  placeholder="Official chronicle of this milestone event..."
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Detailed Description (Bengali)</label>
                <textarea
                  rows={2}
                  value={msForm.descriptionBn}
                  onChange={(e) => setMsForm({ ...msForm, descriptionBn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  placeholder="মাইলফলকের বিস্তারিত বাংলা বিবরণ..."
                />
              </div>

              <ImageAttachmentField
                label="Milestone Photo / Document Image"
                value={msForm.imageUrl}
                onChange={(val) => setMsForm({ ...msForm, imageUrl: val })}
              />

              {/* Deploy switch */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <input
                  type="checkbox"
                  id="ms-deploy-chk"
                  checked={msForm.isDeployed}
                  onChange={(e) => setMsForm({ ...msForm, isDeployed: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="ms-deploy-chk" className="cursor-pointer">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Deploy Live Immediately</span>
                  <span className="text-[11px] text-slate-500">
                    If checked, this milestone will be published live to the public frontend upon save.
                  </span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingMsId ? 'Save Updates' : 'Publish Milestone'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: CREATE / EDIT REGIMENTAL HONOR                               */}
      {/* ==================================================================== */}
      {isHnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Medal className="w-5 h-5 text-red-600" />
                <h3 className="font-heading text-lg font-bold uppercase text-slate-900 dark:text-white">
                  {editingHnId ? 'Edit Regimental Honor' : 'Confer New Regimental Honor'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHnModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHonor} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Honor / Trophy Title (English) *</label>
                <input
                  type="text"
                  required
                  value={hnForm.title}
                  onChange={(e) => setHnForm({ ...hnForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  placeholder="e.g. 1st Runner-Up · Regional Drill & March-Past Championship"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Honor Title (Bengali)</label>
                <input
                  type="text"
                  value={hnForm.titleBn}
                  onChange={(e) => setHnForm({ ...hnForm, titleBn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  placeholder="e.g. ১ম রানার্স-আপ · আঞ্চলিক ড্রিল ও মার্চ-পাস্ট প্রতিযোগিতা"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Recipient / Squad *</label>
                  <input
                    type="text"
                    required
                    value={hnForm.recipientOrPlatoon}
                    onChange={(e) => setHnForm({ ...hnForm, recipientOrPlatoon: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    placeholder="e.g. Metropolitan University Platoon Squad"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Recipient (Bengali)</label>
                  <input
                    type="text"
                    value={hnForm.recipientOrPlatoonBn}
                    onChange={(e) => setHnForm({ ...hnForm, recipientOrPlatoonBn: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    placeholder="e.g. এমইউ প্লাটুন স্কোয়াড"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Award Year *</label>
                  <input
                    type="text"
                    required
                    value={hnForm.awardYear}
                    onChange={(e) => setHnForm({ ...hnForm, awardYear: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    placeholder="2025"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Medal / Trophy Type</label>
                  <input
                    type="text"
                    value={hnForm.medalType}
                    onChange={(e) => setHnForm({ ...hnForm, medalType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    placeholder="Championship Trophy / Silver Medal"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Order #</label>
                  <input
                    type="number"
                    value={hnForm.order}
                    onChange={(e) => setHnForm({ ...hnForm, order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Conferred By (Authority)</label>
                <input
                  type="text"
                  value={hnForm.conferredBy}
                  onChange={(e) => setHnForm({ ...hnForm, conferredBy: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  placeholder="e.g. Commanding Officer, 2 BNCC Battalion, Mainamati Regiment"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Citation Statement (English) *</label>
                <textarea
                  required
                  rows={3}
                  value={hnForm.citation}
                  onChange={(e) => setHnForm({ ...hnForm, citation: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  placeholder="Official commendation citation read during presentation..."
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Citation Statement (Bengali)</label>
                <textarea
                  rows={2}
                  value={hnForm.citationBn}
                  onChange={(e) => setHnForm({ ...hnForm, citationBn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  placeholder="প্রশংসাপত্রের বাংলা উদ্ধৃতি..."
                />
              </div>

              <ImageAttachmentField
                label="Honor / Trophy / Certificate Image"
                value={hnForm.imageUrl}
                onChange={(val) => setHnForm({ ...hnForm, imageUrl: val })}
              />

              {/* Deploy switch */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <input
                  type="checkbox"
                  id="hn-deploy-chk"
                  checked={hnForm.isDeployed}
                  onChange={(e) => setHnForm({ ...hnForm, isDeployed: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="hn-deploy-chk" className="cursor-pointer">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Deploy Live Immediately</span>
                  <span className="text-[11px] text-slate-500">
                    If checked, this honor will appear live in the frontend platoon awards & citations showcase.
                  </span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsHnModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingHnId ? 'Save Updates' : 'Publish Honor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: CREATE / EDIT HIGHLIGHT (DEBUGGED)                          */}
      {/* ==================================================================== */}
      {isHlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-heading text-lg font-bold uppercase text-slate-900 dark:text-white">
                {editingHlId ? 'Edit Platoon Highlight' : 'Create Platoon Highlight'}
              </h3>
              <button
                type="button"
                onClick={() => setIsHlModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHighlight} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Highlight Title (English) *</label>
                <input
                  type="text"
                  required
                  value={hlForm.title}
                  onChange={(e) => setHlForm({ ...hlForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  placeholder="e.g. National Cadet Corps Day Parade Excellence"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Highlight Title (Bengali)</label>
                <input
                  type="text"
                  value={hlForm.titleBn}
                  onChange={(e) => setHlForm({ ...hlForm, titleBn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  placeholder="e.g. জাতীয় ক্যাডেট কোর দিবস কুচকাওয়াজ গৌরব"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={hlForm.category}
                    onChange={(e) => setHlForm({ ...hlForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    placeholder="e.g. Operational Excellence"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={hlForm.badge}
                    onChange={(e) => setHlForm({ ...hlForm, badge: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    placeholder="e.g. Regimental Honor"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Metric / Impact Value</label>
                  <input
                    type="text"
                    value={hlForm.metricValue}
                    onChange={(e) => setHlForm({ ...hlForm, metricValue: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    placeholder="e.g. 1st Runner-Up / 1,200+ Kits"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Display Order</label>
                  <input
                    type="number"
                    value={hlForm.order}
                    onChange={(e) => setHlForm({ ...hlForm, order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Full Description (English) *</label>
                <textarea
                  required
                  rows={3}
                  value={hlForm.description}
                  onChange={(e) => setHlForm({ ...hlForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  placeholder="Detailed summary of the operational achievement..."
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Full Description (Bengali)</label>
                <textarea
                  rows={2}
                  value={hlForm.descriptionBn}
                  onChange={(e) => setHlForm({ ...hlForm, descriptionBn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  placeholder="অর্জনের বিস্তারিত বিবরণ..."
                />
              </div>

              <ImageAttachmentField
                label="Highlight Photo / Visual Attachment"
                value={hlForm.imageUrl}
                onChange={(val) => setHlForm({ ...hlForm, imageUrl: val })}
              />

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsHlModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingHlId ? 'Save Updates' : 'Create Highlight'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: CREATE / EDIT FIELD RECORD (DEBUGGED)                       */}
      {/* ==================================================================== */}
      {isFrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-heading text-lg font-bold uppercase text-slate-900 dark:text-white">
                {editingFrId ? 'Edit Field Record' : 'Create Field Record Stat'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFrModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFieldRecord} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Metric Label (English) *</label>
                <input
                  type="text"
                  required
                  value={frForm.label}
                  onChange={(e) => setFrForm({ ...frForm, label: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  placeholder="e.g. Cadets Enrolled & Active"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Metric Label (Bengali)</label>
                <input
                  type="text"
                  value={frForm.labelBn}
                  onChange={(e) => setFrForm({ ...frForm, labelBn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  placeholder="e.g. তালিকাভুক্ত ও সক্রিয় ক্যাডেট"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Count Value *</label>
                  <input
                    type="number"
                    required
                    value={frForm.value}
                    onChange={(e) => setFrForm({ ...frForm, value: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Suffix (e.g. +, %, /10)</label>
                  <input
                    type="text"
                    value={frForm.suffix}
                    onChange={(e) => setFrForm({ ...frForm, suffix: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    placeholder="+"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Short Note / Subtitle (English)</label>
                <input
                  type="text"
                  value={frForm.note}
                  onChange={(e) => setFrForm({ ...frForm, note: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  placeholder="e.g. Male & Female Cadets across all departments"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Short Note / Subtitle (Bengali)</label>
                <input
                  type="text"
                  value={frForm.noteBn}
                  onChange={(e) => setFrForm({ ...frForm, noteBn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  placeholder="e.g. বিশ্ববিদ্যালয়ের সকল বিভাগের ছাত্র ও ছাত্রী ক্যাডেট"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category / Tag</label>
                  <input
                    type="text"
                    value={frForm.category}
                    onChange={(e) => setFrForm({ ...frForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    placeholder="e.g. Muster Roll, Parade, Relief"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Order</label>
                  <input
                    type="number"
                    value={frForm.order}
                    onChange={(e) => setFrForm({ ...frForm, order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <ImageAttachmentField
                label="Field Record Graphic / Proof Image"
                value={frForm.imageUrl}
                onChange={(val) => setFrForm({ ...frForm, imageUrl: val })}
              />

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFrModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingFrId ? 'Save Changes' : 'Create Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
