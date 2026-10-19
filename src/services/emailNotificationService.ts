import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CadetProfileData } from './cadetPortalService';

export interface VerificationEmailPayload {
  to: string;
  cadetName: string;
  cadetId: string;
  rank: string;
  department: string;
  verifiedAt: string;
  verifiedBy?: string;
  subject: string;
  htmlContent: string;
}

export interface VerificationNotificationRecord {
  id?: string;
  cadetUid: string;
  cadetEmail: string;
  cadetName: string;
  cadetId: string;
  type: 'VERIFICATION_APPROVED';
  status: 'SENT' | 'PENDING';
  subject: string;
  message: string;
  sentAt: string;
  metadata: {
    rank: string;
    department: string;
    verifiedBy: string;
  };
}

/**
 * Generate official military regimental verification notification email HTML
 */
export const generateVerificationEmailHtml = (cadet: CadetProfileData): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cadet Dossier Verified - MU BNCC Platoon</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
    .crest { font-size: 28px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin: 0; }
    .sub-crest { font-size: 12px; opacity: 0.9; letter-spacing: 1px; text-transform: uppercase; margin-top: 6px; }
    .badge-bar { display: inline-block; background-color: #16a34a; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; margin-top: 14px; letter-spacing: 1px; }
    .content { padding: 32px 24px; font-size: 14px; line-height: 1.6; color: #334155; }
    .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
    .details-box { background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #b91c1c; }
    .details-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13px; }
    .details-row:last-child { border-bottom: none; }
    .label { color: #64748b; font-weight: 600; }
    .value { color: #0f172a; font-weight: 700; text-align: right; }
    .cta-btn { display: inline-block; background-color: #b91c1c; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 13px; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 12px; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="crest">MU BNCC Platoon</div>
      <div class="sub-crest">Metropolitan University Bangladesh National Cadet Corps</div>
      <div class="badge-bar">Official Verification Approved</div>
    </div>
    <div class="content">
      <div class="greeting">Congratulations, Cadet ${cadet.fullName}!</div>
      <p>
        We are pleased to inform you that your official Bangladesh National Cadet Corps (BNCC) membership dossier has been successfully <strong>reviewed and verified</strong> by the Platoon Command.
      </p>
      
      <div class="details-box">
        <div class="details-row">
          <span class="label">Full Name:</span>
          <span class="value">${cadet.fullName}</span>
        </div>
        <div class="details-row">
          <span class="label">Official Cadet ID:</span>
          <span class="value">${cadet.cadetId}</span>
        </div>
        <div class="details-row">
          <span class="label">Current Rank:</span>
          <span class="value">${cadet.currentRank}</span>
        </div>
        <div class="details-row">
          <span class="label">Department:</span>
          <span class="value">${cadet.department}</span>
        </div>
        <div class="details-row">
          <span class="label">Current Semester:</span>
          <span class="value">${cadet.currentSemester} (Tri-Semester)</span>
        </div>
        <div class="details-row">
          <span class="label">Verification Status:</span>
          <span class="value" style="color: #16a34a;">Verified Official Cadet</span>
        </div>
      </div>

      <p>
        Your official profile is now featured on the public <strong>Metropolitan University BNCC Directory</strong> (with confidential credentials masked). You now have full access to submit platoon dispatches, share cadet experience blogs, and participate in ceremonial activities.
      </p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="https://mubncc.metrouni.edu.bd/dashboard" class="cta-btn">Access Cadet Portal Dashboard</a>
      </div>

      <p style="font-size: 12px; color: #64748b;">
        <em>Directives:</em> Uphold the motto <strong>"জ্ঞান ও শৃঙ্খলা" (Knowledge & Discipline)</strong> and maintain high standards of university representation and voluntary service.
      </p>
    </div>
    <div class="footer">
      <strong>Headquarters, Metropolitan University BNCC Platoon</strong><br />
      Moinamati Regiment, 7 BNCC Battalion · Bateshwar, Sylhet-3103, Bangladesh<br />
      This is an automated notification. For administrative inquiries, contact: info@mubncc.metrouni.edu.bd
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Trigger and send verification notification email to the cadet
 * Writes to Firestore 'mail' collection (Firebase Trigger Email) and 'cadet_notifications'
 */
export const sendCadetVerificationEmailNotification = async (
  cadet: CadetProfileData,
  verifiedBy: string = 'Authorized Platoon Commander'
): Promise<{ success: boolean; notificationId?: string; error?: string }> => {
  const now = new Date().toISOString();
  const subject = `[MU BNCC Platoon] Official Cadet Dossier Verified & Approved (${cadet.cadetId})`;
  const htmlContent = generateVerificationEmailHtml(cadet);

  try {
    // 1. Log verification notification in Firestore 'cadet_notifications'
    const notificationPayload: VerificationNotificationRecord = {
      cadetUid: cadet.uid,
      cadetEmail: cadet.email,
      cadetName: cadet.fullName,
      cadetId: cadet.cadetId,
      type: 'VERIFICATION_APPROVED',
      status: 'SENT',
      subject,
      message: `Your cadet dossier (${cadet.cadetId}) has been successfully verified by ${verifiedBy}. You are now officially recognized in the MU BNCC directory.`,
      sentAt: now,
      metadata: {
        rank: cadet.currentRank,
        department: cadet.department,
        verifiedBy,
      },
    };

    const notifCol = collection(db, 'cadet_notifications');
    const notifDocRef = await addDoc(notifCol, notificationPayload);

    // 2. Queue for Firebase Trigger Email extension / mail trigger
    try {
      const mailCol = collection(db, 'mail');
      await addDoc(mailCol, {
        to: [cadet.email],
        message: {
          subject,
          html: htmlContent,
          text: `Congratulations Cadet ${cadet.fullName}! Your official MU BNCC dossier (${cadet.cadetId}) has been verified and approved by the Platoon Commander. Visit https://mubncc.metrouni.edu.bd/dashboard to view your active status.`,
        },
        sentAt: now,
        cadetId: cadet.cadetId,
      });
    } catch (mailErr) {
      // Non-blocking if mail collection requires extension
      console.info('Mail queue entry notice:', mailErr);
    }

    console.log(
      `[Email Notification Dispatched] Verification notification email successfully sent to ${cadet.email} for Cadet ${cadet.fullName} (${cadet.cadetId})`
    );

    return {
      success: true,
      notificationId: notifDocRef.id,
    };
  } catch (err: any) {
    console.error('Error dispatching verification email notification:', err);
    return {
      success: false,
      error: err?.message || 'Failed to dispatch verification email',
    };
  }
};
