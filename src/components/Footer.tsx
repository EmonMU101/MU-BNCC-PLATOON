import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BnccCrest } from './BnccCrest';
import { MapPin, Phone, Mail, Shield, ExternalLink, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { DmcaPolicyModal } from './DmcaPolicyModal';

export const Footer: React.FC = () => {
  const { t, isBn } = useLanguage();
  const [isDmcaOpen, setIsDmcaOpen] = useState(false);

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-900 text-slate-300 dark:bg-slate-950 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: Platoon Info & University Affiliation (2 cols wide) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <BnccCrest size="md" />
              <div>
                <span className="font-heading text-xl font-bold uppercase tracking-wider text-white">
                  {t('brand.name')}
                </span>
                <p className="text-xs font-mono uppercase tracking-widest text-red-400">
                  {t('brand.estd')}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {t('footer.tagline')}
            </p>

            <div className="rounded-lg border border-slate-800 bg-slate-800/50 p-3 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('footer.affiliationTitle')}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {t('footer.affiliationDesc')}
              </p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
              {t('footer.quickNav')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/how-to-join" className="text-slate-400 hover:text-white transition-colors">
                  {t('nav.howToJoin')}
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-slate-400 hover:text-white transition-colors">
                  {t('nav.events')}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-slate-400 hover:text-white transition-colors">
                  {isBn ? 'ব্লগ ও গল্প সম্ভার' : 'Blog & Stories'}
                </Link>
              </li>
              <li>
                <Link to="/frameworks/benefits" className="text-slate-400 hover:text-white transition-colors">
                  {t('nav.benefits')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Frameworks & Guidelines */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
              {t('footer.directives')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/frameworks/guidelines" className="text-slate-400 hover:text-white transition-colors">
                  {t('nav.guidelines')}
                </Link>
              </li>
              <li>
                <Link to="/frameworks/guidelines" className="text-slate-400 hover:text-white transition-colors">
                  {t('footer.rankHierarchy')}
                </Link>
              </li>
              <li>
                <Link to="/frameworks/guidelines" className="text-slate-400 hover:text-white transition-colors">
                  {t('footer.uniformStandard')}
                </Link>
              </li>
              <li>
                <Link to="/frameworks/policies" className="text-slate-400 hover:text-white transition-colors">
                  {t('footer.ethics')}
                </Link>
              </li>
              <li>
                <Link to="/frameworks/policies" className="text-slate-400 hover:text-white transition-colors">
                  {t('footer.attendancePolicy')}
                </Link>
              </li>
              <li>
                <Link to="/frameworks/policies" className="text-slate-400 hover:text-white transition-colors">
                  {t('footer.antiRagging')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Campus Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
              {t('footer.contactTitle')}
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>
                  {t('footer.contactAddress')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <span className="font-mono text-[11px]">{t('footer.contactEmail')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <span className="font-mono text-[11px]">{t('footer.contactPhone')}</span>
              </div>
              <div className="pt-2">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">
                  {t('footer.paradeHoursLabel')}
                </span>
                <span className="text-slate-300 text-xs">
                  {t('footer.paradeHoursValue')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>{t('footer.copyright')}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a
              href="https://metrouni.edu.bd"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors inline-flex items-center gap-1"
            >
              <span>{t('footer.muPortal')}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span aria-hidden="true">·</span>
            <Link to="/frameworks/policies" className="hover:text-white transition-colors">
              {t('footer.terms')}
            </Link>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsDmcaOpen(true)}
              className="hover:text-white transition-colors underline underline-offset-2 decoration-slate-600"
            >
              {isBn ? 'ডিএমসিএ পলিসি' : 'DMCA & Content Takedown'}
            </button>
            <span aria-hidden="true">·</span>
            <Link to="/admin" className="hover:text-red-400 transition-colors inline-flex items-center gap-1 font-mono text-[11px]">
              <Shield className="w-3 h-3 text-red-500" />
              <span>{t('footer.officerLogin')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* DMCA & Safe Harbor Legal Notice Modal */}
      <DmcaPolicyModal isOpen={isDmcaOpen} onClose={() => setIsDmcaOpen(false)} />
    </footer>
  );
};
