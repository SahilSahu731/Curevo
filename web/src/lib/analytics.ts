'use client';

export const ANALYTICS_CONSENT_KEY = 'curevo-analytics';
export const ANALYTICS_EVENTS = ['checkin_started', 'emotion_selected', 'cause_selected', 'checkin_completed', 'mirror_viewed', 'same_clicked', 'thought_saved', 'thought_shared', 'share_opened', 'signup_started', 'signup_completed', 'humanity_search', 'outcome_completed', 'curevo_now_joined'] as const;
export type AnalyticsEvent = typeof ANALYTICS_EVENTS[number];

// No text, emotion, query, email, URL, properties, autocapture or replay.
export function track(event: string) {
  try {
    if (!ANALYTICS_EVENTS.includes(event as AnalyticsEvent) || localStorage.getItem(ANALYTICS_CONSENT_KEY) !== 'yes' || navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;
    void fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event, consent: true }), keepalive: true }).catch(() => {});
  } catch { /* Analytics must never interfere with the product. */ }
}
