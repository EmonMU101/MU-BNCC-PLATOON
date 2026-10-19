import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  Award,
  Calendar,
  Share2,
  ChevronLeft,
  Droplet,
  GraduationCap,
  Medal,
  Activity,
  User,
  ExternalLink,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Github,
  Globe,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  CadetProfileData,
  fetchCadetPublicProfile,
} from '../services/cadetPortalService';
import { SocialShareModal } from '../components/SocialShareModal';
import { SEOHead } from '../components/SEOHead';
import { useLanguage } from '../context/LanguageContext';
import { BnccCrest } from '../components/BnccCrest';

export const PublicCadetProfilePage: React.FC = () => {
  const { cadetId } = useParams<{ cadetId: string }>();
  const { isBn } = useLanguage();

  const [cadet, setCadet] = useState<CadetProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    if (!cadetId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);
    fetchCadetPublicProfile(cadetId)
      .then((data) => {
        if (data) {
          // Additional safety guarantee: enforce security rule here as well
          data.phone = '';
          data.emergencyContact = '';
          setCadet(data);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [cadetId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-4">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
          Retrieving Cadet Dossier...
        </p>
      </div>
    );
  }

  if (notFound || !cadet) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-5 px-4 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-bold uppercase text-slate-900 dark:text-white">
            Cadet Profile Not Found
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The requested cadet identifier <span className="font-mono text-red-600 font-bold">"{cadetId}"</span> was not found in the verified platoon database or may be awaiting verification.
          </p>
        </div>
        <Link
          to="/about"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Return to Platoon Roster</span>
        </Link>
      </div>
    );
  }

  const social = cadet.socialLinks || {};
  const hasSocials = Boolean(
    social.facebook || social.linkedin || social.twitter || social.instagram || social.github
  );

  return (
    <>
      <SEOHead
        title={`${cadet.fullName} (${cadet.currentRank}) | MU BNCC Platoon`}
        description={`Official public profile and service record of ${cadet.currentRank} ${cadet.fullName} (${cadet.cadetId}) in the Metropolitan University BNCC Platoon.`}
        image={cadet.profilePicture}
      />

      <div className="min-h-screen py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/about"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to About Platoon & Cadets</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 transition-colors shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span>Share Profile</span>
          </button>
        </div>

        {/* Profile Dossier Hero Card */}
        <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-lg overflow-hidden space-y-8">
          {/* Background Decorative Crest Pattern */}
          <div className="absolute top-0 right-0 w-80 h-80 opacity-5 pointer-events-none transform translate-x-12 -translate-y-12">
            <BnccCrest />
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 relative z-10">
            {/* Cadet Portrait */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-800">
                <img
                  src={
                    cadet.profilePicture ||
                    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={cadet.fullName}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=400&q=80';
                  }}
                />
              </div>

              {/* Status Badge */}
              <div className="absolute -bottom-2 -right-2">
                {cadet.isVerified ? (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-600 text-white shadow-md border-2 border-white dark:border-slate-900"
                    title="Officially Verified Platoon Cadet"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500 text-white shadow-md border-2 border-white dark:border-slate-900">
                    Pending
                  </span>
                )}
              </div>
            </div>

            {/* Cadet Essential Identity Details */}
            <div className="space-y-3 text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60">
                  {cadet.cadetId}
                </span>

                <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                  {cadet.currentRank}
                </span>

                {cadet.cadetType === 'excadet' ? (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Ex-Cadet / Alumni
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                    Active Cadet
                  </span>
                )}
              </div>

              <h1 className="font-heading text-2xl sm:text-4xl font-extrabold uppercase tracking-wide text-slate-900 dark:text-white leading-tight">
                {cadet.fullName}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                Department of {cadet.department} · Semester {cadet.currentSemester}
              </p>

              {/* Social Media Links for Public View */}
              {hasSocials && (
                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1">
                    Connect:
                  </span>
                  {social.facebook && (
                    <a
                      href={social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-xs"
                      title="Facebook Profile"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {social.linkedin && (
                    <a
                      href={social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 hover:bg-sky-600 hover:text-white transition-all shadow-xs"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {social.twitter && (
                    <a
                      href={social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-black hover:text-white transition-all shadow-xs"
                      title="X / Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {social.instagram && (
                    <a
                      href={social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 hover:bg-pink-600 hover:text-white transition-all shadow-xs"
                      title="Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {social.github && (
                    <a
                      href={social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-950 hover:text-white transition-all shadow-xs"
                      title="GitHub"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Key Public Stats Grid (Phone number & Emergency contact STRICTLY excluded!) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                <span>Department</span>
              </div>
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                {cadet.department}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Semester</span>
              </div>
              <span className="font-mono font-bold text-xs sm:text-sm text-red-600">
                {cadet.currentSemester}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                <Droplet className="w-3.5 h-3.5 text-rose-500" />
                <span>Blood Group</span>
              </div>
              <span className="font-mono font-bold text-xs sm:text-sm text-rose-600">
                {cadet.bloodGroup || 'N/A'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                <span>Physical Stats</span>
              </div>
              <span className="font-mono font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                {cadet.height || 'N/A'} · {cadet.weight || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Service Honors & Distinctions Section */}
        {cadet.serviceHonors && cadet.serviceHonors.length > 0 && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Medal className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-heading text-lg font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                Service Honors & Badges
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cadet.serviceHonors.map((honor) => (
                <div
                  key={honor.id}
                  className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300">
                      {honor.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {honor.year}
                    </span>
                  </div>
                  <h4 className="font-heading text-sm font-bold uppercase text-slate-900 dark:text-white">
                    {honor.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Awarded by: {honor.awardingBody}
                  </p>
                  {honor.citation && (
                    <p className="text-[11px] italic text-slate-500 dark:text-slate-400 border-l-2 border-amber-500 pl-2 mt-1">
                      "{honor.citation}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Platoon Affiliation Notice */}
        <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-red-600 shrink-0" />
            <span>
              Official Cadet Member of Metropolitan University BNCC Platoon.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="inline-flex items-center gap-1.5 font-bold uppercase text-red-600 dark:text-red-400 hover:underline shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share This Dossier</span>
          </button>
        </div>
      </div>

      {/* Global Social Share Modal */}
      <SocialShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={`${cadet.fullName} (${cadet.currentRank}) - MU BNCC Cadet Profile`}
        url={window.location.href}
        summary={`View the official public cadet record of ${cadet.fullName} at Metropolitan University BNCC Platoon.`}
      />
    </>
  );
};
