import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  Share2,
  Calendar,
  MapPin,
  Shield,
  Info,
  Check,
  Tag,
  RotateCcw,
} from 'lucide-react';
import { GalleryPhoto } from '../data/galleryData';
import { useLanguage } from '../context/LanguageContext';

interface PhotoLightboxProps {
  isOpen: boolean;
  photos: GalleryPhoto[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  isOpen,
  photos,
  currentIndex,
  onClose,
  onNavigate,
}) => {
  const { isBn } = useLanguage();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailStripRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const currentPhoto = photos[currentIndex];

  // Reset zoom on photo change
  useEffect(() => {
    setZoomLevel(1);
    setImageLoaded(false);
  }, [currentIndex]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailStripRef.current && showThumbnails) {
      const activeThumb = thumbnailStripRef.current.children[currentIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIndex, showThumbnails]);

  const handlePrev = useCallback(() => {
    if (photos.length <= 1) return;
    const nextIdx = (currentIndex - 1 + photos.length) % photos.length;
    onNavigate(nextIdx);
  }, [currentIndex, photos.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (photos.length <= 1) return;
    const nextIdx = (currentIndex + 1) % photos.length;
    onNavigate(nextIdx);
  }, [currentIndex, photos.length, onNavigate]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleShare = async () => {
    if (!currentPhoto) return;
    const url = window.location.href;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!currentPhoto) return;
    const link = document.createElement('a');
    link.href = currentPhoto.imageUrl;
    link.download = `${currentPhoto.id}-${currentPhoto.title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const diff = touchStartXRef.current - touchEndXRef.current;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !currentPhoto) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md text-white select-none animate-in fade-in duration-200"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Controls Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 bg-slate-900/80 border-b border-slate-800/80 z-20">
        <div className="flex items-center gap-3">
          {/* Photo Counter */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700/80 text-xs font-mono font-bold text-red-400">
            <span>{currentIndex + 1}</span>
            <span className="text-slate-500">/</span>
            <span>{photos.length}</span>
          </div>

          {/* Category Badge */}
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-950/80 border border-red-800/70 text-red-300">
            {isBn ? currentPhoto.categoryLabelBn : currentPhoto.categoryLabel}
          </span>
        </div>

        {/* Toolbar Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isBn ? 'বড় করুন (+)' : 'Zoom in (+)'}
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isBn ? 'ছোট করুন (-)' : 'Zoom out (-)'}
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Reset Zoom */}
          {zoomLevel > 1 && (
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-2 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-200 transition-colors"
              title={isBn ? 'রিসেট (০)' : 'Reset zoom (0)'}
              aria-label="Reset zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Details Toggle */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className={`p-2 rounded-lg transition-colors ${
              showDetails ? 'bg-red-900/60 text-red-200' : 'bg-slate-800/70 hover:bg-slate-700 text-slate-300'
            }`}
            title={showDetails ? (isBn ? 'বিবরণ লুকান' : 'Hide details') : (isBn ? 'বিবরণ দেখুন' : 'Show details')}
            aria-label="Toggle details"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden sm:inline-flex p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isBn ? 'ফুলস্ক্রিন (F)' : 'Fullscreen (F)'}
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Share / Copy Link */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors relative"
            title={isBn ? 'লিংক কপি করুন' : 'Share / Copy link'}
            aria-label="Share"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Download Original */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isBn ? 'ছবি ডাউনলোড করুন' : 'Download original'}
            aria-label="Download image"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Close Lightbox */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors ml-1"
            title={isBn ? 'বন্ধ করুন (Esc)' : 'Close lightbox (Esc)'}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Center Image Stage */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-6">
        {/* Previous Button */}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 rounded-full bg-slate-900/80 hover:bg-red-600 border border-slate-700/80 text-white shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-red-500 hover:scale-105 active:scale-95"
            aria-label="Previous photo"
            title={isBn ? 'পূর্ববর্তী ছবি (←)' : 'Previous photo (Left arrow)'}
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Next Button */}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 rounded-full bg-slate-900/80 hover:bg-red-600 border border-slate-700/80 text-white shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-red-500 hover:scale-105 active:scale-95"
            aria-label="Next photo"
            title={isBn ? 'পরবর্তী ছবি (→)' : 'Next photo (Right arrow)'}
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* High Resolution Image Container with Zoom & Pan */}
        <div
          className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${zoomLevel})`,
            cursor: zoomLevel > 1 ? 'grab' : 'default',
          }}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-10 h-10 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
            </div>
          )}

          <img
            key={currentPhoto.id}
            src={currentPhoto.imageUrl}
            alt={isBn ? currentPhoto.titleBn : currentPhoto.title}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              // Fallback to placeholder if network error
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80';
              setImageLoaded(true);
            }}
            className={`max-w-[90vw] max-h-[68vh] sm:max-h-[72vh] object-contain rounded-xl shadow-2xl transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        {/* Floating Zoom Indicator Pill */}
        {zoomLevel > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-xs font-mono font-bold text-amber-300">
            {Math.round(zoomLevel * 100)}%
          </div>
        )}
      </div>

      {/* Expandable Image Details Panel */}
      {showDetails && (
        <div className="bg-slate-900/90 border-t border-slate-800/80 px-4 py-3 sm:px-6 sm:py-4 z-20 transition-all max-h-48 sm:max-h-56 overflow-y-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-6">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-heading font-bold text-base sm:text-lg text-white uppercase tracking-wide">
                  {isBn ? currentPhoto.titleBn : currentPhoto.title}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {isBn ? currentPhoto.captionBn : currentPhoto.caption}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {currentPhoto.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 text-[10px] font-mono text-slate-400"
                  >
                    <Tag className="w-2.5 h-2.5 text-red-400" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Metadata Badges */}
            <div className="shrink-0 flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs text-slate-400 font-sans">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-200">
                <Calendar className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="font-mono text-[11px]">{isBn ? currentPhoto.displayDateBn : currentPhoto.displayDate}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-200">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px] truncate max-w-xs">{isBn ? currentPhoto.locationBn : currentPhoto.location}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-200">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[11px]">{isBn ? currentPhoto.platoonOrSquadBn : currentPhoto.platoonOrSquad}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Thumbnail Strip Carousel */}
      {showThumbnails && photos.length > 1 && (
        <div className="bg-slate-950/90 border-t border-slate-900 px-4 py-2.5 z-20 overflow-x-auto scrollbar-thin">
          <div
            ref={thumbnailStripRef}
            className="flex items-center gap-2 max-w-7xl mx-auto overflow-x-auto py-1"
          >
            {photos.map((photo, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => onNavigate(idx)}
                  className={`relative shrink-0 rounded-lg overflow-hidden border-2 transition-all focus:outline-none ${
                    isActive
                      ? 'border-red-500 scale-105 shadow-lg shadow-red-950/50 ring-2 ring-red-400/50'
                      : 'border-transparent opacity-50 hover:opacity-100 hover:border-slate-600'
                  }`}
                  style={{ width: '64px', height: '44px' }}
                  title={isBn ? photo.titleBn : photo.title}
                >
                  <img
                    src={photo.thumbnailUrl}
                    alt={isBn ? photo.titleBn : photo.title}
                    className="w-full h-full object-cover"
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-red-600/10 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
