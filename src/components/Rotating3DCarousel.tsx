import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, RefreshCw, X, Maximize2, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Rotating3DCarouselProps {
  webAppUrl?: string;
  className?: string;
}

// Curated high-resolution fallback BNCC military and cadet training images
// Ensures carousel is immediately visual and resilient against network latency
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1579208575657-c595a053b9b7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
];

export const Rotating3DCarousel: React.FC<Rotating3DCarouselProps> = ({
  webAppUrl = 'https://script.google.com/macros/s/AKfycbwfliWwCsGvpsBvrYddWutXpqiefiJN7lKN0hiLTwFmVWspKJi92Veh7giepH08hmqw/exec',
  className = '',
}) => {
  const { t, isBn } = useLanguage();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetch(webAppUrl)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          const valid = data.filter((item) => typeof item === 'string' && item.startsWith('http'));
          if (valid.length > 0) {
            setImages(valid);
            setLoading(false);
            return;
          }
        }
        setImages(FALLBACK_IMAGES);
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setImages(FALLBACK_IMAGES);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [webAppUrl]);

  const total = images.length;
  const anglePerCard = total > 0 ? 360 / total : 0;
  const cardWidth = 220;
  // Calculate dynamic 3D radius based on photo count as specified
  const zTranslation =
    total > 0
      ? Math.max(
          Math.round(cardWidth / 2 / Math.tan(Math.PI / total)) + 34,
          240
        )
      : 240;

  return (
    <div
      className={`relative w-full overflow-hidden py-10 flex flex-col items-center justify-center select-none ${className}`}
      style={{ perspective: '896px' }}
    >
      {/* Gallery Header Badge */}
      <div className="mb-8 flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 py-1.5 shadow-xs backdrop-blur-sm z-20">
        <Sparkles className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          {t('gallery.badge') || (isBn ? 'প্লাটুন ফিল্ড চিত্রমালা' : 'Platoon Field Visuals')}
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      {/* 3D Stage Container */}
      <div className="relative w-full flex items-center justify-center min-h-[380px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin text-red-600" />
            <span>{t('gallery.loading') || (isBn ? 'গ্যালারির ছবি লোড হচ্ছে...' : 'Loading Gallery Visuals...')}</span>
          </div>
        ) : (
          <div
            className="carousel-track-3d"
            title={isBn ? 'ঘূর্ণন থামাতে কার্সার রাখুন · বড় করে দেখতে ছবিতে ক্লিক করুন' : 'Hover to pause rotation · Click image to expand'}
          >
            {images.map((url, index) => {
              const currentAngle = anglePerCard * index;
              const delay = (25 / total) * index;

              return (
                <div
                  key={`${url}-${index}`}
                  className="carousel-card-item cursor-pointer group"
                  style={{
                    transform: `translate(-50%, -50%) rotateY(${currentAngle}deg) translateZ(${zTranslation}px)`,
                    animationDelay: `-${delay}s`,
                  }}
                  onClick={() => setPreviewImage(url)}
                >
                  <img
                    src={url}
                    alt={`MU BNCC Field Moment ${index + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Subtle expand icon overlay on hover */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-6 h-6 text-white drop-shadow-md" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Instructions / caption below carousel */}
      <div className="mt-4 flex flex-col items-center gap-3 z-10">
        <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 text-center tracking-wider uppercase">
          {t('gallery.caption') || (isBn ? 'ঘূর্ণন থামাতে কার্সার রাখুন · বড় করে দেখতে যেকোনো ছবিতে ক্লিক করুন' : 'Hover to pause 3D rotation · Click any slide to inspect')}
        </p>

        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 dark:bg-slate-800/90 hover:bg-red-700 dark:hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs hover:shadow-md border border-slate-700/60 hover:border-red-600"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{isBn ? 'সব ব্লগ ও গল্প পড়ুন' : 'Explore Blog & Stories'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Lightbox Modal for enlarged image preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors z-10"
              aria-label={t('gallery.closePreview') || (isBn ? 'প্রিভিউ বন্ধ করুন' : 'Close preview')}
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Enlarged field moment"
              className="w-full h-full object-contain max-h-[85vh] rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Rotating3DCarousel;
