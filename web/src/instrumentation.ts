export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || !process.env.SENTRY_DSN) return;
  const Sentry = await import('@sentry/nextjs');
  const { scrubMonitoringEvent, privateMonitoringCollection } = await import('@/lib/monitoring');
  Sentry.init({ dsn: process.env.SENTRY_DSN, dataCollection: privateMonitoringCollection, defaultIntegrations: false, tracesSampleRate: 0, beforeSend: scrubMonitoringEvent, beforeSendTransaction: () => null, beforeBreadcrumb: () => null });
}

export async function onRequestError() {
  // Never forward the Next request/error objects: they may contain thought text.
  if (process.env.NEXT_RUNTIME !== 'nodejs' || !process.env.SENTRY_DSN) return;
  const { recordOperationalError } = await import('@/lib/monitoring');
  recordOperationalError('request_failed');
}
