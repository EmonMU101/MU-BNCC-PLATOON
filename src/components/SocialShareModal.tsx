import React, { useState } from 'react';
import {
  Share2,
  Check,
  Copy,
  X,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url?: string;
  summary?: string;
  description?: string;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  title,
  url,
  summary,
  description,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = url || window.location.href;
  const shareSummary = description || summary || title;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(shareSummary);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareNetworks = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      shareLink: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'bg-slate-900 dark:bg-slate-800 hover:bg-black text-white',
      shareLink: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-sky-700 hover:bg-sky-800 text-white',
      shareLink: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      shareLink: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm uppercase tracking-wide text-slate-900 dark:text-white">
                Share to Social Media
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                {title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Network Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          {shareNetworks.map((net) => {
            const Icon = net.icon;
            return (
              <a
                key={net.name}
                href={net.shareLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-xs ${net.color}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{net.name}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            );
          })}
        </div>

        {/* Copy Link Input */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Page / Profile Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-slate-700 dark:text-slate-300 truncate"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors shrink-0 shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
