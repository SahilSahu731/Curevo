import * as Sentry from '@sentry/nextjs';
import { scrubMonitoringEvent, privateMonitoringCollection } from '@/lib/monitoring';

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    dataCollection: privateMonitoringCollection, defaultIntegrations: false,
    integrations: [Sentry.globalHandlersIntegration()],
    tracesSampleRate: 0, replaysSessionSampleRate: 0, replaysOnErrorSampleRate: 0,
    beforeSend: scrubMonitoringEvent, beforeSendTransaction: () => null, beforeBreadcrumb: () => null,
  });
}
