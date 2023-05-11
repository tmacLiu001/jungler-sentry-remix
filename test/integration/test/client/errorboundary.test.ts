import { getMultipleSentryEnvelopeRequests } from './utils/helpers';
import { test, expect } from '@playwright/test';
import { Event } from '@sentry/types';

test('should capture React component errors.', async ({ page }) => {
  const envelopes = await getMultipleSentryEnvelopeRequests<Event>(page, 2, {
    url: '/error-boundary-capture/0',
  });

  const [pageloadEnvelope, errorEnvelope] = envelopes;

  expect(pageloadEnvelope.contexts?.trace.op).toBe('pageload');
  expect(pageloadEnvelope.tags?.['routing.instrumentation']).toBe('remix-router');
  expect(pageloadEnvelope.type).toBe('transaction');
  expect(pageloadEnvelope.transaction).toBe('routes/error-boundary-capture/$id');

  expect(errorEnvelope.level).toBe('error');
  expect(errorEnvelope.sdk?.name).toBe('sentry.javascript.remix');
  expect(errorEnvelope.exception?.values).toMatchObject([
    {
      type: 'React ErrorBoundary Error',
      value: 'Sentry React Component Error',
      stacktrace: { frames: expect.any(Array) },
    },
    {
      type: 'Error',
      value: 'Sentry React Component Error',
      stacktrace: { frames: expect.any(Array) },
      mechanism: { type: 'generic', handled: true },
    },
  ]);
});
