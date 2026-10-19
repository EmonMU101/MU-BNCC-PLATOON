import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export interface SEOHeadProps {
  title?: string;
  titleBn?: string;
  description?: string;
  descriptionBn?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  keywords?: string[];
  noindex?: boolean;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  titleBn,
  description,
  descriptionBn,
  path,
  image,
  type = 'website',
  keywords,
  noindex = false,
  jsonLd,
}) => {
  const { language, isBn } = useLanguage();
  const location = useLocation();

  const currentPath = path || location.pathname;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mubncc.metrouni.edu.bd';
  const canonicalUrl = `${baseUrl}${currentPath === '/' ? '' : currentPath}`;

  // Default brand titles
  const defaultTitleEn = 'MU BNCC Platoon | Metropolitan University Cadet Corps';
  const defaultTitleBn = 'এমইউ বিএনসিসি প্লাটুন | মেট্রোপলিটন ইউনিভার্সিটি ক্যাডেট কোর';

  // Selected title based on language
  const chosenTitle = isBn
    ? titleBn || title || defaultTitleBn
    : title || defaultTitleEn;

  // Format title with brand suffix if not home
  const finalTitle =
    currentPath === '/'
      ? chosenTitle
      : `${chosenTitle} · ${isBn ? 'এমইউ বিএনসিসি' : 'MU BNCC'}`;

  // Selected description
  const defaultDescEn =
    'Official web portal of Metropolitan University Bangladesh National Cadet Corps (MU BNCC) Platoon under Moinamati Regiment, 7 BNCC Battalion. Grooming future leaders through academic excellence, discipline, and voluntary service.';
  const defaultDescBn =
    'মেট্রোপলিটন ইউনিভার্সিটি বাংলাদেশ ন্যাশনাল ক্যাডেট কোর (এমইউ বিএনসিসি) প্লাটুনের অফিসিয়াল ওয়েব পোর্টাল। ময়নামতি রেজিমেন্ট ও ৭ বিএনসিসি ব্যাটালিয়নের অধীনে শৃঙ্খলা, জ্ঞান ও স্বেচ্ছাসেবার মাধ্যমে ভবিষ্যৎ নেতৃত্ব গঠন।';

  const finalDesc = isBn
    ? descriptionBn || description || defaultDescBn
    : description || defaultDescEn;

  const defaultImage = `${baseUrl}/bncc_logo.svg`;
  const ogImage = image || defaultImage;

  // Organization Schema JSON-LD
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Metropolitan University BNCC Platoon',
    alternateName: ['MU BNCC', 'এমইউ বিএনসিসি প্লাটুন'],
    url: baseUrl,
    logo: `${baseUrl}/bncc_logo.svg`,
    description: defaultDescEn,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Metropolitan University Campus, Bateshwar',
      addressLocality: 'Sylhet',
      postalCode: '3103',
      addressCountry: 'BD',
    },
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      name: 'Metropolitan University, Sylhet',
      url: 'https://metrouni.edu.bd',
    },
    slogan: 'Knowledge · Discipline · Voluntary Service',
  };

  const defaultKeywords = [
    'MU BNCC',
    'Metropolitan University BNCC',
    'Bangladesh National Cadet Corps',
    'Moinamati Regiment',
    '7 BNCC Battalion',
    'Sylhet Cadet Platoon',
    'University Drill',
    'Military Training',
    'ISSB Defense Quota',
    'Voluntary Service',
    'এমইউ বিএনসিসি',
  ];

  const keywordsString = (keywords || defaultKeywords).join(', ');

  return (
    <Helmet>
      {/* HTML Language attribute */}
      <html lang={language} />

      {/* Page Title */}
      <title>{finalTitle}</title>

      {/* Standard Meta Tags */}
      <meta name="description" content={finalDesc} />
      <meta name="keywords" content={keywordsString} />
      <meta name="author" content="Metropolitan University BNCC Platoon" />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* OpenGraph Social Card Metadata */}
      <meta property="og:site_name" content={isBn ? 'মেট্রোপলিটন ইউনিভার্সিটি বিএনসিসি' : 'Metropolitan University BNCC Platoon'} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={isBn ? 'bn_BD' : 'en_US'} />

      {/* Twitter / X Social Card Metadata */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={ogImage} />

      {/* Base Organization Schema */}
      <script type="application/ld+json">
        {JSON.stringify(orgSchema)}
      </script>

      {/* Additional Custom Schema.org JSON-LD (e.g., FAQPage, Event, WebApplication) */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};
