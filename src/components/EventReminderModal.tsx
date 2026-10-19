import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Eye,
  X,
  Volume2,
  Calendar,
  Shield,
  RefreshCw,
  FileText,
  Radio,
} from 'lucide-react';
import { EventItem } from '../data/siteData';
import {
  EventReminderRecord,
  ReminderLogEntry,
  calculateReminderTimes,
  getPushPermissionStatus,
  requestPushPermission,
  executeTestReminder,
  getReminderLogs,
  generateEmailReminderContent,
  saveEventReminder,
  playAlertChime,
  setPreferredReminderEmail,
} from '../services/reminderService';
import { useLanguage } from '../context/LanguageContext';

interface EventReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  rsvpEvents: EventItem[];
  reminders: Record<string, EventReminderRecord>;
  onUpdateReminder: (eventId: string, record: EventReminderRecord) => void;
  cadetUid: string;
  defaultEmail: string;
}

export const EventReminderModal: React.FC<EventReminderModalProps> = ({
  isOpen,
  onClose,
  rsvpEvents,
  reminders,
  onUpdateReminder,
  cadetUid,
  defaultEmail,
}) => {
  const { isBn } = useLanguage();
  const [activeTab, setActiveTab] = useState<'reminders' | 'emailPreview' | 'logs'>('reminders');
  const [targetEmail, setTargetEmail] = useState<string>(defaultEmail || 'cadet.tanvir@metrouni.edu.bd');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>(
    getPushPermissionStatus()
  );
  const [previewEvent, setPreviewEvent] = useState<EventItem | null>(null);
  const [logs, setLogs] = useState<ReminderLogEntry[]>([]);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPermissionStatus(getPushPermissionStatus());
      setLogs(getReminderLogs());
      if (rsvpEvents.length > 0 && !previewEvent) {
        setPreviewEvent(rsvpEvents[0]);
      }
    }
  }, [isOpen, rsvpEvents]);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => {
      setActionFeedback(null);
    }, 4500);
  };

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const result = await requestPushPermission();
      setPermissionStatus(result);
      if (result === 'granted') {
        playAlertChime();
        showFeedback(isBn ? 'পুশ নোটিফিকেশন সফলভাবে সক্রিয় করা হয়েছে!' : 'Push Notifications successfully authorized!');
      } else if (result === 'denied') {
        showFeedback(
          isBn
            ? 'ব্রাউজারে পুশ নোটিফিকেশন ব্লক করা আছে। ব্রাউজার সেটিংসে গিয়ে অনুমতি দিন।'
            : 'Push notifications are blocked in your browser settings.'
        );
      }
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleTestChime = () => {
    playAlertChime();
    showFeedback(isBn ? 'সামরিক সতর্কতা সাউন্ড টেস্ট সফল!' : 'Military audio chime played successfully!');
  };

  const handleToggleChannel = async (evt: EventItem, channel: 'push' | 'email') => {
    const current = reminders[evt.id] || {
      channels: { push: true, email: true },
      targetEmail,
    };

    const nextChannels = {
      ...current.channels,
      [channel]: !current.channels[channel],
    };

    const updated = await saveEventReminder(cadetUid, evt, nextChannels, targetEmail);
    onUpdateReminder(evt.id, updated);
    showFeedback(
      isBn
        ? `"${evt.title}" এর জন্য ${channel === 'push' ? 'পুশ অ্যালার্ট' : 'ইমেইল অ্যালার্ট'} আপডেট করা হয়েছে।`
        : `Updated ${channel.toUpperCase()} alert preference for "${evt.title}".`
    );
  };

  const handleTriggerTestAlert = (evt: EventItem) => {
    const record = reminders[evt.id];
    const channels = record?.channels || { push: true, email: true };

    const result = executeTestReminder(evt, channels, targetEmail, cadetUid);
    setLogs(getReminderLogs());

    if (result.pushSent && result.emailSent) {
      showFeedback(
        isBn
          ? `সতর্কতা প্রেরণ সম্পন্ন: "${evt.title}" এর জন্য পুশ ও ইমেইল অ্যালার্ট পাঠানো হয়েছে!`
          : `Dispatched 24-hour test alert via both Push Notification & Email for "${evt.title}"!`
      );
    } else if (result.emailSent) {
      showFeedback(
        isBn
          ? `ইমেইল টেস্ট অ্যালার্ট পাঠানো হয়েছে: "${evt.title}" (${targetEmail})`
          : `Dispatched test email reminder for "${evt.title}" to ${targetEmail}!`
      );
    } else {
      showFeedback(
        isBn
          ? `সতর্কতা টেস্ট সম্পন্ন হয়েছে!`
          : `Test alert cycle executed for "${evt.title}".`
      );
    }
  };

  const handleSaveEmail = () => {
    if (!targetEmail || !targetEmail.includes('@')) {
      showFeedback(isBn ? 'সঠিক ইমেইল এড্রেস প্রদান করুন।' : 'Please enter a valid email address.');
      return;
    }
    setPreferredReminderEmail(targetEmail);
    // Update all existing reminders
    rsvpEvents.forEach(async (evt) => {
      const currentChannels = reminders[evt.id]?.channels || { push: true, email: true };
      const updated = await saveEventReminder(cadetUid, evt, currentChannels, targetEmail);
      onUpdateReminder(evt.id, updated);
    });
    showFeedback(isBn ? 'সতর্কতা প্রেরণের ইমেইল সংরক্ষিত হয়েছে!' : 'Preferred alert email saved successfully!');
  };

  const activeEmailContent = previewEvent
    ? generateEmailReminderContent(previewEvent, targetEmail, true)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl shadow-inner">
              <BellRing className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-mono text-emerald-300 font-semibold">
                  BNCC Automated Alert Engine
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  24-Hour Prior
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {isBn ? '২৪ ঘণ্টা পূর্ববর্তী পুশ ও ইমেইল রিমাইন্ডার সিস্টেম' : '24-Hour Push & Email Event Reminder System'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Alert / Feedback Banner */}
        {actionFeedback && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs md:text-sm font-medium flex items-center justify-between shadow-inner animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionFeedback}</span>
            </div>
            <button onClick={() => setActionFeedback(null)} className="text-white/80 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Channel Status Quick Bar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Push Status */}
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-slate-600 dark:text-slate-300">
                {isBn ? 'ব্রাউজার পুশ স্ট্যাটাস:' : 'Browser Push Status:'}
              </span>
              <span
                className={`font-semibold uppercase px-2 py-0.5 rounded-full text-[10px] ${
                  permissionStatus === 'granted'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : permissionStatus === 'denied'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                }`}
              >
                {permissionStatus}
              </span>
              {permissionStatus !== 'granted' && (
                <button
                  onClick={handleRequestPermission}
                  disabled={isRequestingPermission}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow transition-colors"
                >
                  {isRequestingPermission
                    ? isBn
                      ? 'অনুরোধ করা হচ্ছে...'
                      : 'Requesting...'
                    : isBn
                    ? 'অনুমতি দিন'
                    : 'Enable Push'}
                </button>
              )}
            </div>

            {/* Chime Test Button */}
            <button
              onClick={handleTestChime}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded transition-colors"
              title="Test audio chime"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isBn ? 'সাউন্ড টেস্ট' : 'Audio Chime'}</span>
            </button>
          </div>

          {/* Email Config Quick Input */}
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <input
              type="email"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              placeholder="cadet@metrouni.edu.bd"
              className="px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48 sm:w-56"
            />
            <button
              onClick={handleSaveEmail}
              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded transition-colors"
            >
              {isBn ? 'সংরক্ষণ' : 'Save'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 text-sm font-medium">
          <button
            onClick={() => setActiveTab('reminders')}
            className={`py-3 px-4 border-b-2 font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'reminders'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{isBn ? 'আরএসভিপি ইভেন্ট সতর্কতা' : 'RSVP Event Alerts'}</span>
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold">
              {rsvpEvents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('emailPreview')}
            className={`py-3 px-4 border-b-2 font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'emailPreview'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{isBn ? 'ইমেইল প্রিভিউ সিমুলেটর' : 'Email Alert Simulator'}</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-4 border-b-2 font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{isBn ? 'অ্যালার্ট প্রেরণ লগ' : 'Alert Dispatch History'}</span>
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {logs.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: RSVP EVENT REMINDERS */}
          {activeTab === 'reminders' && (
            <div className="space-y-4">
              {rsvpEvents.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {isBn ? 'কোনো ইভেন্টে আরএসভিপি নেই' : 'No Active Event RSVPs Found'}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    {isBn
                      ? '২৪ ঘণ্টা পূর্ববর্তী অ্যালার্ট পেতে যেকোনো ড্রিল বা প্যারেডের কার্ড থেকে "অংশগ্রহণ নিশ্চিত করুন" (RSVP) বাটনে ক্লিক করুন।'
                      : 'To schedule automated 24-hour Push and Email reminders, toggle RSVP (Attending) on any upcoming drill or parade in the events schedule.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {isBn
                        ? 'আপনার উপস্থিতি নিশ্চিত করা ইভেন্টসমূহ। ইভেন্ট শুরু হওয়ার ঠিক ২৪ ঘণ্টা পূর্বে অ্যালার্ট পাঠানো হবে।'
                        : 'Alerts are queued to dispatch exactly 24 hours prior to drill start time.'}
                    </p>
                    <span className="text-xs font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      Auto-Scheduler Active
                    </span>
                  </div>

                  {rsvpEvents.map((evt) => {
                    const times = calculateReminderTimes(evt.date, evt.time);
                    const record = reminders[evt.id];
                    const pushEnabled = record ? record.channels.push : true;
                    const emailEnabled = record ? record.channels.email : true;

                    return (
                      <div
                        key={evt.id}
                        className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
                      >
                        {/* Event Details */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              RSVP: Attending
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {evt.category}
                            </span>
                            {times.isWithin24Hours && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-300 animate-pulse">
                                🚨 Alert Window Active (&lt;24h)
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {isBn ? evt.titleBn || evt.title : evt.title}
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>{evt.displayDate}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                              <span>{evt.time}</span>
                            </div>
                          </div>

                          {/* Calculated Trigger Time Badge */}
                          <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 text-xs">
                            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-medium">
                              <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                              <span>
                                {isBn ? 'সতর্কতা প্রেরণের নির্ধারিত সময়:' : 'Exact 24-Hour Alert Trigger Time:'}
                              </span>
                              <span className="font-mono font-bold">
                                {times.reminderTriggerTime.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                              {times.isWithin24Hours
                                ? isBn
                                  ? 'এই ইভেন্টের ২৪ ঘণ্টার সময়সীমা শুরু হয়েছে। সতর্কতা সক্রিয়।'
                                  : 'Within 24-hour window: Alert is primed and active.'
                                : times.isPast
                                ? isBn
                                  ? 'ইভেন্ট সম্পন্ন হয়েছে।'
                                  : 'Event has concluded.'
                                : isBn
                                ? `ইভেন্ট শুরু হতে বাকি: প্রায় ${times.hoursUntilEvent} ঘণ্টা (অ্যালার্ট পাঠানো হবে ${times.hoursUntilReminder} ঘণ্টা পর)`
                                : `Starts in ~${times.hoursUntilEvent} hours. Automated alert triggers in ~${times.hoursUntilReminder} hours.`}
                            </div>
                          </div>
                        </div>

                        {/* Controls & Channel Toggles */}
                        <div className="flex flex-col gap-2.5 sm:w-72 shrink-0 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-3 md:pt-0 md:pl-4">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {isBn ? 'সতর্কতা চ্যানেল ও একশন:' : 'Alert Channels & Action:'}
                          </span>

                          <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200 dark:border-slate-700/60">
                            <div className="flex items-center gap-2">
                              <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                {isBn ? 'পুশ অ্যালার্ট' : 'Push Notification'}
                              </span>
                            </div>
                            <button
                              onClick={() => handleToggleChannel(evt, 'push')}
                              className={`w-9 h-5 rounded-full transition-colors relative flex items-center ${
                                pushEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                              }`}
                            >
                              <span
                                className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform ml-0.5 ${
                                  pushEnabled ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200 dark:border-slate-700/60">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                {isBn ? 'ইমেইল অ্যালার্ট' : 'Email Digest'}
                              </span>
                            </div>
                            <button
                              onClick={() => handleToggleChannel(evt, 'email')}
                              className={`w-9 h-5 rounded-full transition-colors relative flex items-center ${
                                emailEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                              }`}
                            >
                              <span
                                className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform ml-0.5 ${
                                  emailEnabled ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>

                          {/* Action Buttons: Test Now & View Email */}
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <button
                              onClick={() => handleTriggerTestAlert(evt)}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
                              title="Test alert immediately right now"
                            >
                              <Send className="w-3 h-3" />
                              <span>{isBn ? 'টেস্ট অ্যালার্ট' : 'Test Alert'}</span>
                            </button>

                            <button
                              onClick={() => {
                                setPreviewEvent(evt);
                                setActiveTab('emailPreview');
                              }}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                            >
                              <Eye className="w-3 h-3" />
                              <span>{isBn ? 'প্রিভিউ' : 'Preview'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EMAIL PREVIEW SIMULATOR */}
          {activeTab === 'emailPreview' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isBn ? 'সামরিক ইমেইল সতর্কতা সিমুলেটর' : 'Military Email Reminder Simulator'}</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {isBn
                      ? 'ক্যাডেটের নিবন্ধিত ইমেইলে স্বয়ংক্রিয়ভাবে যে ফরম্যাটে ২৪ ঘণ্টার ডাইরেক্টিভ পৌঁছায়।'
                      : 'High-discipline operational alert dispatched 24 hours prior to drill inspection.'}
                  </p>
                </div>

                {rsvpEvents.length > 1 && (
                  <select
                    value={previewEvent?.id || ''}
                    onChange={(e) => {
                      const found = rsvpEvents.find((x) => x.id === e.target.value);
                      if (found) setPreviewEvent(found);
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {rsvpEvents.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {previewEvent && activeEmailContent ? (
                <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-950 text-slate-100 overflow-hidden shadow-sm font-mono text-xs">
                  {/* Email Headers */}
                  <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold uppercase w-16 text-[11px]">From:</span>
                      <span className="text-emerald-400">
                        platoon.command@metrouni.edu.bd (BNCC Metropolitan University HQ)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold uppercase w-16 text-[11px]">To:</span>
                      <span className="text-white">{targetEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold uppercase w-16 text-[11px]">Subject:</span>
                      <span className="text-amber-300 font-bold">{activeEmailContent.subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold uppercase w-16 text-[11px]">Trigger:</span>
                      <span className="text-slate-300">T-24 Hours ({activeEmailContent.scheduledTrigger})</span>
                    </div>
                  </div>

                  {/* Email Plain Text Content */}
                  <div className="p-5 whitespace-pre-wrap leading-relaxed text-slate-300 max-h-[50vh] overflow-y-auto">
                    {activeEmailContent.plainText}
                  </div>

                  {/* Dispatch Bar */}
                  <div className="bg-slate-900/90 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      RFC 2822 / TLS Automated Dispatch Simulator
                    </span>
                    <button
                      onClick={() => handleTriggerTestAlert(previewEvent)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-sans text-xs font-semibold shadow transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isBn ? 'এই ইমেইলটি টেস্ট পাঠান' : 'Dispatch Test to Email'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-slate-500">
                  {isBn ? 'কোনো ইভেন্ট নির্বাচিত নেই।' : 'No event selected for email simulation.'}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DISPATCH LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {isBn ? 'সাম্প্রতিক অ্যালার্ট ডেলিভারি হিস্ট্রি' : 'Recent Alert Delivery History'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {isBn
                      ? 'সিস্টেম কর্তৃক পুশ ও ইমেইল মাধ্যমে প্রেরিত সমস্ত টেস্ট এবং শিডিউলড সতর্কতার রেকর্ড।'
                      : 'Audit log of test and scheduled 24h operational notifications.'}
                  </p>
                </div>
                <button
                  onClick={() => setLogs(getReminderLogs())}
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded"
                  title="Refresh logs"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-10 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-sm text-slate-500">
                  {isBn
                    ? 'এখনো কোনো অ্যালার্ট লগ জমা হয়নি। উপরে যেকোনো ইভেন্টে "টেস্ট অ্যালার্ট" চাপুন।'
                    : 'No notifications dispatched yet. Click "Test Alert" on any RSVP’d event to generate delivery records.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold uppercase text-[10px]">
                            {log.channel}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {log.eventTitle}
                          </span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            ({new Date(log.timestamp).toLocaleTimeString()})
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">{log.summary}</p>
                        <p className="text-[11px] text-slate-400">To: {log.recipient}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                        DELIVERED
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              {isBn
                ? 'প্লাটুন সিকিউরড অ্যালার্ট ইঞ্জিন • মিলিটারি গ্রেড শিডিউলিং'
                : 'Platoon Secured Alert Engine • Military Turnout Discipline'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            {isBn ? 'সম্পন্ন' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
