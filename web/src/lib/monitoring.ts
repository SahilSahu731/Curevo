import * as Sentry from '@sentry/nextjs';

export const privateMonitoringCollection: Sentry.DataCollection = { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [], urlQueryParams: false, graphQL: { document: false, variables: false }, genAI: { inputs: false, outputs: false }, databaseQueryData: false, queues: false, stackFrameVariables: false, frameContextLines: 0 };

export function recordOperationalError(code: 'realtime_publish' | 'request_failed' | 'database_unavailable' | 'auth_unavailable') {
  if (!process.env.SENTRY_DSN) return;
  Sentry.captureMessage(`Curevo operational error: ${code}`, 'error');
}

// Return a deliberately new event. Never send requests, breadcrumbs, users,
// exception messages/frames, URLs, cookies, form values, or extra context.
export function scrubMonitoringEvent(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
  const allowed = ['realtime_publish', 'request_failed', 'database_unavailable', 'auth_unavailable'];
  const code = event.message?.replace('Curevo operational error: ', '');
  return { type: undefined, event_id: event.event_id, timestamp: event.timestamp, level: event.level || 'error', platform: 'javascript', message: 'Curevo application error', tags: { surface: 'application', code: code && allowed.includes(code) ? code : 'unhandled' } };
}
