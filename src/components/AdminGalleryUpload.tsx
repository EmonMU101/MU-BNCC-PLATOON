import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  RefreshCw,
  X,
  Calendar,
  MapPin,
  Tag,
  Shield,
  Layers,
  Sparkles,
  Maximize2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import {
  subscribeGalleryPhotos,
  createGalleryPhoto,
  updateGalleryPhoto,
  deleteGalleryPhoto,
  purgeMockGalleryPhotos,
  GalleryPhotoItem,
} from '../services/galleryService';
import { GALLERY_CATEGORIES } from '../data/galleryData';
import { useLanguage } from '../context/LanguageContext';

export const AdminGalleryUpload: React.FC = () => {
  const { isBn } = useLanguage();

  const [photos, setPhotos] = useState<GalleryPhotoItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [category, setCategory] = useState<string>('drill');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [locationBn, setLocationBn] = useState('');
  const [platoonOrSquad, setPlatoonOrSquad] = useState('MU BNCC Combined Platoon');
  const [caption, setCaption] = useState('');
  const [captionBn, setCaptionBn] = useState('');
  const [tagsInput, setTagsInput] = useState('#BNCC, #MetropolitanUniversity');
  const [featured, setFeatured] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'portrait' | 'square'>('landscape');

  // File Upload State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editing existing photo
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeGalleryPhotos((livePhotos) => {
      setPhotos(livePhotos);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMsg('Please choose a valid image file (PNG, JPG, WebP).', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showMsg('Image size exceeds 15MB limit. Please choose a smaller image.', 'error');
      return;
    }

    setSelectedFile(file);

    // Read image as Data URL for preview and storage
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);

      // Auto-detect aspect ratio
      const img = new Image();
      img.onload = () => {
        if (img.width > img.height * 1.2) {
          setAspectRatio('landscape');
        } else if (img.height > img.width * 1.2) {
          setAspectRatio('portrait');
        } else {
          setAspectRatio('square');
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Reset form
  const handleResetForm = () => {
    setTitle('');
    setTitleBn('');
    setCategory('drill');
    setDate(new Date().toISOString().split('T')[0]);
    setLocation('');
    setLocationBn('');
    setPlatoonOrSquad('MU BNCC Combined Platoon');
    setCaption('');
    setCaptionBn('');
    setTagsInput('#BNCC, #MetropolitanUniversity');
    setFeatured(false);
    setImagePreview(null);
    setSelectedFile(null);
    setEditingPhotoId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Populate form for editing
  const handleStartEdit = (photo: GalleryPhotoItem) => {
    setEditingPhotoId(photo.id);
    setTitle(photo.title);
    setTitleBn(photo.titleBn || '');
    setCategory(photo.category);
    setDate(photo.date || new Date().toISOString().split('T')[0]);
    setLocation(photo.location);
    setLocationBn(photo.locationBn || '');
    setPlatoonOrSquad(photo.platoonOrSquad || '');
    setCaption(photo.caption || '');
    setCaptionBn(photo.captionBn || '');
    setTagsInput(photo.tags ? photo.tags.join(', ') : '');
    setFeatured(photo.featured || false);
    setAspectRatio(photo.aspectRatio || 'landscape');
    setImagePreview(photo.imageUrl);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showMsg('Photo title is required.', 'error');
      return;
    }

    if (!imagePreview && !editingPhotoId) {
      showMsg('Please select an image file to upload.', 'error');
      return;
    }

    setIsUploading(true);

    try {
      const parsedYear = new Date(date).getFullYear() || new Date().getFullYear();
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .map((t) => (t.startsWith('#') ? t : `#${t}`));

      const matchedCategory = GALLERY_CATEGORIES.find((c) => c.id === category);
      const categoryLabel = matchedCategory?.label || category;
      const categoryLabelBn = matchedCategory?.labelBn || category;

      // Optional Backend Upload endpoint ping
      let uploadedImageUrl = imagePreview!;
      try {
        if (selectedFile) {
          const res = await fetch('/api/gallery/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: selectedFile.name,
              fileType: selectedFile.type,
              base64Data: imagePreview,
              title,
              category,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.url) uploadedImageUrl = data.url;
          }
        }
      } catch {
        // Fallback to storing optimized base64 image
      }

      if (editingPhotoId) {
        await updateGalleryPhoto(editingPhotoId, {
          title,
          titleBn,
          category,
          categoryLabel,
          categoryLabelBn,
          date,
          displayDate: new Date(date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          year: parsedYear,
          location,
          locationBn,
          platoonOrSquad,
          caption,
          captionBn,
          tags,
          featured,
          aspectRatio,
          imageUrl: uploadedImageUrl,
          thumbnailUrl: uploadedImageUrl,
        });
        showMsg('Gallery photo successfully updated in Firestore archives.');
      } else {
        await createGalleryPhoto({
          title,
          titleBn,
          category,
          categoryLabel,
          categoryLabelBn,
          date,
          displayDate: new Date(date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          year: parsedYear,
          location,
          locationBn,
          imageUrl: uploadedImageUrl,
          thumbnailUrl: uploadedImageUrl,
          caption,
          captionBn,
          platoonOrSquad,
          tags,
          aspectRatio,
          featured,
        });
        showMsg('New photo successfully uploaded and published to the live Photo Gallery!');
      }

      handleResetForm();
    } catch (err: any) {
      showMsg(`Upload failed: ${err.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (id: string, photoTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete the photograph "${photoTitle}"?`)) {
      return;
    }

    try {
      await deleteGalleryPhoto(id);
      showMsg('Photograph removed from gallery archives.');
    } catch (err: any) {
      showMsg(`Delete failed: ${err.message}`, 'error');
    }
  };

  const handlePurgeMockPhotos = async () => {
    if (
      !window.confirm(
        'Safely purge and strip all mock Unsplash demo photos from Firestore database and local cache?'
      )
    ) {
      return;
    }

    try {
      const purged = await purgeMockGalleryPhotos();
      showMsg(`Successfully purged mock photos (${purged} records deleted from database).`);
    } catch (err: any) {
      showMsg(`Purge error: ${err.message}`, 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
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
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          )}
          <span className="font-medium">{notification.text}</span>
        </div>
      )}

      {/* Header Bar with Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h2 className="font-heading text-lg font-bold uppercase text-slate-900 dark:text-white">
              {isBn ? 'ফটো গ্যালারি আপলোড ও ম্যানেজমেন্ট' : 'Photo Gallery Media Management'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            {isBn
              ? 'বিগত ট্রেনিং সেশন, কুচকাওয়াজ ও ক্যাম্পের ছবি সরাসরি আপলোড করুন এবং লাইভ গ্যালারিতে প্রকাশ করুন।'
              : 'Upload real photographs of drills, camps, and ceremonies directly to live Firestore.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePurgeMockPhotos}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold uppercase tracking-wider transition-colors border border-rose-200 dark:border-rose-900/40"
            title="Cleanse all mock/unsplash photos from Firestore"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isBn ? 'মক ফটো ডেটা মুছুন' : 'Purge Mock Photos'}</span>
          </button>
        </div>
      </div>

      {/* Upload / Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
              Media Dossier
            </span>
            <h3 className="font-heading text-lg font-bold uppercase text-slate-900 dark:text-white">
              {editingPhotoId ? 'Edit Photograph Record' : 'Upload New Platoon Photograph'}
            </h3>
          </div>

          {editingPhotoId && (
            <button
              type="button"
              onClick={handleResetForm}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-mono"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel Edit</span>
            </button>
          )}
        </div>

        {/* Image File Picker & Preview Area */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
            Photograph File <span className="text-red-500">*</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Upload Drag/Click Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/40 flex flex-col items-center justify-center min-h-[200px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="p-3.5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isBn ? 'কম্পিউটার থেকে ছবি সিলেক্ট করুন' : 'Click to Browse or Drag Image File'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Supports PNG, JPG, JPEG, WebP (Max 15MB)
              </p>
              {selectedFile && (
                <span className="mt-3 px-2.5 py-1 rounded-md text-[11px] font-mono bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              )}
            </div>

            {/* Preview Box */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 overflow-hidden flex flex-col items-center justify-center min-h-[200px] relative aspect-[4/3]">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-950/80 text-white backdrop-blur-md border border-slate-700">
                      {aspectRatio.toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 shadow-md"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <Camera className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs font-mono">No image selected for preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
              Photo Title (English) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Combined Annual Training Camp Ceremonial Parade"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
              Photo Title (Bengali / বাংলা)
            </label>
            <input
              type="text"
              value={titleBn}
              onChange={(e) => setTitleBn(e.target.value)}
              placeholder="যেমন: ময়নামতি বার্ষিক ক্যাম্পে সম্মিলিত রেজিমেন্টাল কুচকাওয়াজ"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Category, Date & Squad Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              {GALLERY_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label} ({cat.labelBn})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
              Training Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
              Squad / Contingent Unit
            </label>
            <input
              type="text"
              value={platoonOrSquad}
              onChange={(e) => setPlatoonOrSquad(e.target.value)}
              placeholder="e.g. MU Ceremonial Guard Squad"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Location Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
              Location (English)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Jalalabad Cantonment Firing Range, Sylhet"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
              Location (Bengali / বাংলা)
            </label>
            <input
              type="text"
              value={locationBn}
              onChange={(e) => setLocationBn(e.target.value)}
              placeholder="যেমন: জালালাবাদ সেনানিবাস ফায়ারিং রেঞ্জ, সিলেট"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Captions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
              Caption / Description (English)
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Short description of the event or exercise..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
              Caption / Description (Bengali)
            </label>
            <textarea
              rows={3}
              value={captionBn}
              onChange={(e) => setCaptionBn(e.target.value)}
              placeholder="ইভেন্ট বা সামরিক প্রশিক্ষণের সারসংক্ষেপ..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Tags & Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="#CATC2026, #MainamatiRegiment, #ParadeDiscipline"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-6 pt-5">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
              />
              <span className="font-mono">Featured Photo on Homepage Carousel</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {editingPhotoId && (
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-red-900/20"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Uploading to Archives...</span>
              </>
            ) : editingPhotoId ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Publish to Live Gallery</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Uploaded Photos Archive Listing */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
              Live Registry
            </span>
            <h3 className="font-heading text-lg font-bold uppercase text-slate-900 dark:text-white">
              Published Gallery Photographs ({photos.length})
            </h3>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs font-mono text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-red-500" />
            Loading uploaded photographs...
          </div>
        ) : photos.length === 0 ? (
          <div className="py-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 space-y-2">
            <Camera className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No photos published yet
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              Upload your first military training or ceremonial photograph using the form above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 overflow-hidden flex flex-col justify-between hover:border-red-500/40 transition-colors shadow-xs"
              >
                <div className="space-y-3">
                  <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                    <img
                      src={photo.thumbnailUrl || photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase bg-slate-900/80 text-white backdrop-blur-md border border-slate-700">
                        {photo.category}
                      </span>
                      {photo.year && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-red-950/80 text-red-300 border border-red-800">
                          {photo.year}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {photo.title}
                    </h4>
                    {photo.location && (
                      <p className="text-[10px] text-slate-500 font-sans truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{photo.location}</span>
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 font-mono">
                      Date: {photo.date}
                    </p>
                  </div>
                </div>

                <div className="p-3 pt-0 flex items-center justify-end gap-2 border-t border-slate-200/50 dark:border-slate-800/50 mt-2">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(photo)}
                    className="p-1.5 rounded-lg bg-slate-200/60 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                    title="Edit photograph details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(photo.id, photo.title)}
                    className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/70 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 transition-colors"
                    title="Delete photograph"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
