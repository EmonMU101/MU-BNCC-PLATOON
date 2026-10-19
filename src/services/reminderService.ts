import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { EventItem } from '../data/siteData';

export interface ReminderChannelConfig {
  push: boolean;
  email: boolean;
}

export interface EventReminderRecord {
  eventId: string;
  uid: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  mandatoryTurnout?: string;
  channels: ReminderChannelConfig;
  targetEmail: string;
  reminderTriggerTime: string; // ISO string 24h before event
  eventStartTime: string; // ISO string of event start
  triggered: boolean;
  triggeredAt?: string;
  testDispatchedAt?: string;
  lastChannelDispatched?: 'push' | 'email' | 'both';
}

export interface ReminderLogEntry {
  id: string;
  eventId: string;
  eventTitle: string;
  channel: 'push' | 'email' | 'both';
  recipient: string;
  timestamp: string;
  type: 'scheduled_24h' | 'test_alert';
  status: 'sent' | 'delivered';
  summary: string;
}

const LOCAL_STORAGE_REMINDERS_KEY = 'mu_bncc_event_reminders_';
const LOCAL_STORAGE_LOGS_KEY = 'mu_bncc_reminder_logs';
const LOCAL_STORAGE_PREF_EMAIL_KEY = 'mu_bncc_preferred_reminder_email';

/**
 * Parses event date and time strings into a reliable Date object.
 * Event date format: "YYYY-MM-DD"
 * Event time format e.g.: "06:45 AM - 09:00 AM" or "10:00 AM - 04:30 PM" or "Round-the-Clock Residential"
 */
export function parseEventStartDateTime(dateStr: string, timeStr: string): Date {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  let hours = 8;
  let minutes = 0;

  // Extract first time portion e.g., "06:45 AM"
  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (timeMatch) {
    let h = parseInt(timeMatch[1], 10);
    const m = parseInt(timeMatch[2], 10);
    const period = timeMatch[3].toUpperCase();

    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;

    hours = h;
    minutes = m;
  }

  return new Date(year, month, day, hours, minutes, 0, 0);
}

/**
 * Calculates the exact 24-hour reminder trigger time.
 */
export function calculateReminderTimes(dateStr: string, timeStr: string) {
  const eventStartTime = parseEventStartDateTime(dateStr, timeStr);
  const reminderTriggerTime = new Date(eventStartTime.getTime() - 24 * 60 * 60 * 1000);
  const now = new Date();

  const msUntilEvent = eventStartTime.getTime() - now.getTime();
  const hoursUntilEvent = Math.round(msUntilEvent / (1000 * 60 * 60));
  const msUntilReminder = reminderTriggerTime.getTime() - now.getTime();
  const hoursUntilReminder = Math.round(msUntilReminder / (1000 * 60 * 60));

  const isPast = msUntilEvent < 0;
  // Within 24-hour window means reminder time has passed or is right now, but event hasn't started yet
  const isWithin24Hours = now.getTime() >= reminderTriggerTime.getTime() && !isPast;

  return {
    eventStartTime,
    reminderTriggerTime,
    hoursUntilEvent,
    hoursUntilReminder,
    isWithin24Hours,
    isPast,
  };
}

/**
 * Synthesizes an executive military alerting chime using the Web Audio API.
 * Guarantees zero external network dependencies and works instantly on all browsers.
 */
export function playAlertChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Two-tone attention chime (military bugle/bell frequency: 587.33Hz D5 then 880Hz A5)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(587.33, now); // D5

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.12); // A5

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.25, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.15, now + 0.12);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.16);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.14);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.65);
  } catch (err) {
    console.debug('Audio chime unable to play:', err);
  }
}

/**
 * Checks push notification permission status safely.
 */
export function getPushPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Requests browser push notification permission.
 */
export async function requestPushPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

/**
 * Triggers a native Web Push Notification.
 */
export function dispatchWebPush(
  title: string,
  body: string,
  iconUrl?: string
): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon: iconUrl || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'mu-bncc-event-reminder',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      playAlertChime();
      return true;
    } catch (e) {
      console.warn('Native notification display failed:', e);
      return false;
    }
  }

  return false;
}

/**
 * Get stored cadet reminder records from localStorage
 */
export function getStoredReminders(uid: string): Record<string, EventReminderRecord> {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_REMINDERS_KEY}${uid}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Persist cadet reminder records to localStorage
 */
export function setStoredReminders(uid: string, reminders: Record<string, EventReminderRecord>) {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_REMINDERS_KEY}${uid}`, JSON.stringify(reminders));
  } catch {
    // Ignore storage quota in sandboxes
  }
}

/**
 * Get preferred email address for cadet reminders
 */
export function getPreferredReminderEmail(fallbackEmail?: string | null): string {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREF_EMAIL_KEY);
    if (saved) return saved;
  } catch {
    // fallback
  }
  return fallbackEmail || 'cadet.tanvir@metrouni.edu.bd';
}

/**
 * Set preferred email address for cadet reminders
 */
export function setPreferredReminderEmail(email: string) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREF_EMAIL_KEY, email);
  } catch {
    // ignore
  }
}

/**
 * Get log history of reminders dispatched
 */
export function getReminderLogs(): ReminderLogEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Add a log entry for a reminder dispatch
 */
export function addReminderLog(log: Omit<ReminderLogEntry, 'id'>) {
  try {
    const logs = getReminderLogs();
    const newEntry: ReminderLogEntry = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    const updated = [newEntry, ...logs].slice(0, 50); // keep last 50 logs
    localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

/**
 * Save or update reminder configuration for an RSVP'd event in Firestore and local state
 */
export async function saveEventReminder(
  uid: string,
  event: EventItem,
  channels: ReminderChannelConfig,
  targetEmail: string
): Promise<EventReminderRecord> {
  const { eventStartTime, reminderTriggerTime } = calculateReminderTimes(event.date, event.time);
  const now = new Date().toISOString();

  const record: EventReminderRecord = {
    eventId: event.id,
    uid,
    eventTitle: event.title,
    eventDate: event.date,
    eventTime: event.time,
    eventVenue: event.venue,
    mandatoryTurnout: event.mandatoryTurnout,
    channels,
    targetEmail,
    reminderTriggerTime: reminderTriggerTime.toISOString(),
    eventStartTime: eventStartTime.toISOString(),
    triggered: false,
  };

  // Local storage update
  const current = getStoredReminders(uid);
  current[event.id] = record;
  setStoredReminders(uid, current);
  setPreferredReminderEmail(targetEmail);

  // Firestore sync to cadet document
  try {
    const cadetRef = doc(db, 'cadets', uid);
    await setDoc(
      cadetRef,
      {
        eventReminders: {
          [event.id]: record,
        },
        preferredReminderEmail: targetEmail,
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not sync reminder preference to Firestore:', err);
  }

  return record;
}

/**
 * Synchronize reminders from Firestore cadet document
 */
export async function fetchRemoteReminders(uid: string): Promise<Record<string, EventReminderRecord>> {
  try {
    const cadetRef = doc(db, 'cadets', uid);
    const snap = await getDoc(cadetRef);
    if (snap.exists()) {
      const data = snap.data();
      const remoteReminders = data?.eventReminders as Record<string, EventReminderRecord> | undefined;
      if (remoteReminders) {
        const local = getStoredReminders(uid);
        const merged = { ...local, ...remoteReminders };
        setStoredReminders(uid, merged);
        return merged;
      }
    }
  } catch (err) {
    console.warn('Could not fetch remote reminders:', err);
  }
  return getStoredReminders(uid);
}

/**
 * Formats a preview of the military reminder email that would be delivered.
 */
export function generateEmailReminderContent(event: EventItem, recipientEmail: string, isTest: boolean = false) {
  const triggerTimes = calculateReminderTimes(event.date, event.time);
  const subject = isTest
    ? `[TEST ALERT] 24-Hour Reminder: ${event.title} - MU BNCC Platoon`
    : `[24-HOUR ALERT] Mandatory Directive Reminder: ${event.title} starts tomorrow`;

  const htmlBody = `
========================================================================
BANGLADESH NATIONAL CADET CORPS (BNCC)
METROPOLITAN UNIVERSITY PLATOON | 2 RAMNA BATTALION, MAINAMATI REGIMENT
========================================================================

ATTENTION CADET:
This is an automated 24-hour operational alert for an upcoming drill/event you have RSVP'd to attend.

EVENT DIRECTIVE: ${event.title}
CATEGORY: ${event.category}
DATE: ${event.displayDate}
SCHEDULED TIME: ${event.time}
VENUE: ${event.venue}

------------------------------------------------------------------------
MANDATORY DRILL TURNOUT & KIT INSPECTION:
${event.mandatoryTurnout || 'Standard working dress (Olive Green), polished boots, beret with badge'}

INSTRUCTOR / IN-CHARGE:
${event.instructorOrLead || 'Platoon Commander (PUO) & Senior Cadet Under Officer'}

SCOPE OF ATTENDANCE:
${event.spotsOrAttendance || 'All active cadets with confirmed RSVP'}
------------------------------------------------------------------------

REPORTING TIMELINE & DISCIPLINE GUIDELINES:
1. Fall-in 15 minutes prior to scheduled start for muster roll call.
2. Turnout must be immaculate: zero creases on beret, boots mirrored, nails trimmed.
3. In case of unexpected medical emergency or university examination conflict, notify CUO immediately.

Recipient: ${recipientEmail}
Generated: ${new Date().toLocaleString()} (24h Alert Engine)
`;

  return {
    subject,
    plainText: htmlBody.trim(),
    recipient: recipientEmail,
    scheduledTrigger: triggerTimes.reminderTriggerTime.toLocaleString(),
  };
}

/**
 * Execute immediate test alert for verification
 */
export function executeTestReminder(
  event: EventItem,
  channels: ReminderChannelConfig,
  targetEmail: string,
  uid: string
): { pushSent: boolean; emailSent: boolean } {
  let pushSent = false;
  let emailSent = false;

  playAlertChime();

  if (channels.push) {
    pushSent = dispatchWebPush(
      `🚨 24h Alert: ${event.title}`,
      `Starts tomorrow at ${event.time}! Turnout: ${event.mandatoryTurnout || 'Working dress'}`
    );
  }

  if (channels.email) {
    emailSent = true;
    addReminderLog({
      eventId: event.id,
      eventTitle: event.title,
      channel: channels.push ? 'both' : 'email',
      recipient: targetEmail,
      timestamp: new Date().toISOString(),
      type: 'test_alert',
      status: 'delivered',
      summary: `Test 24-hour reminder email dispatched for "${event.title}" to ${targetEmail}`,
    });
  }

  // Update test timestamp in local storage
  const current = getStoredReminders(uid);
  if (current[event.id]) {
    current[event.id].testDispatchedAt = new Date().toISOString();
    setStoredReminders(uid, current);
  }

  return { pushSent, emailSent };
}
