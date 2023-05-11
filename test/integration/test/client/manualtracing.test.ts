import { getMultipleSentryEnvelopeRequests } from './utils/helpers';
import { test, expect } from '@playwright/test';
import { Event } from '@sentry/types';

test('should report a manually created / finished transaction.', async ({ page }) => {
  const envelopes = await getMultipleSentryEnvelopeRequests<Event>(page, 2, {
    url: '/manual-tracing/0',
  });

  const [manualTransactionEnvelope, pageloadEnvelope] = envelopes;

  expect(manualTransactionEnvelope.transaction).toBe('test_transaction_1');
  expect(manualTransactionEnvelope.sdk?.name).toBe('sentry.javascript.remix');
  expect(manualTransactionEnvelope.start_timestamp).toBeDefined();
  expect(manualTransactionEnvelope.timestamp).toBeDefined();

  expect(pageloadEnvelope.contexts?.trace?.op).toBe('pageload');
  expect(pageloadEnvelope.tags?.['routing.instrumentation']).toBe('remix-router');
  expect(pageloadEnvelope.type).toBe('transaction');
  expect(pageloadEnvelope.transaction).toBe('routes/manual-tracing/$id');
});
