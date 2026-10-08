import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { test } from 'node:test';
import { ApiError, apiErrorResponse, assertSameOrigin, guestActorId, privateHash, RATE_RULES, trustedClientIp } from '../src/lib/security-core';
import { privateMonitoringCollection, scrubMonitoringEvent } from '../src/lib/monitoring';

test('writes require the exact configured origin and reject forged forwarded hosts', () => {
  const origin = 'https://curevo.example';
  assert.doesNotThrow(() => assertSameOrigin(new Request(`${origin}/api/checkins`, { method: 'POST', headers: { origin } }), origin));
  for (const headers of [{}, { origin: 'https://evil.example', host: 'curevo.example' }, { origin: 'null' }, { origin: `${origin}.evil.example`, 'x-forwarded-host': 'curevo.example' }, { origin, 'sec-fetch-site': 'cross-site' }]) {
    assert.throws(() => assertSameOrigin(new Request(`${origin}/api/checkins`, { method: 'POST', headers: headers as HeadersInit }), origin), (error: unknown) => error instanceof ApiError && error.status === 403);
  }
  assert.doesNotThrow(() => assertSameOrigin(new Request(`${origin}/api/pulse`), origin));
});

test('network identity ignores arbitrary forwarding headers without explicit trust', () => {
  const request = new Request('http://localhost/api', { headers: { 'x-forwarded-for': '198.51.100.1, 203.0.113.9', 'x-real-ip': '192.0.2.4' } });
  assert.equal(trustedClientIp(request, ''), 'untrusted-network');
  assert.equal(trustedClientIp(request, 'x-forwarded-for', 1), '203.0.113.9');
  assert.equal(trustedClientIp(request, 'x-forwarded-for', 2), '198.51.100.1');
  assert.equal(trustedClientIp(request, 'x-forwarded-for', 3), 'untrusted-network');
  assert.equal(trustedClientIp(request, 'x-forwarded-for', 0), 'untrusted-network');
  assert.equal(trustedClientIp(new Request('http://localhost', { headers: { 'x-real-ip': 'forged-value' } }), 'x-real-ip'), 'untrusted-network');
});

test('IPv6 addresses from one /64 use one rate-limit bucket', () => {
  const ip = (value: string) => trustedClientIp(new Request('http://localhost', { headers: { 'x-real-ip': value } }), 'x-real-ip');
  assert.equal(ip('2001:db8:abcd:1234::1'), ip('2001:0db8:abcd:1234:0:0:0:beef'));
  assert.notEqual(ip('2001:db8:abcd:1234::1'), ip('2001:db8:abcd:1235::1'));
});

test('guest actor IDs derive only from valid opaque random credentials', () => {
  const token = randomBytes(32).toString('base64url');
  assert.match(guestActorId(token)!, /^g_[a-f0-9]{64}$/);
  assert.equal(guestActorId(token), guestActorId(token));
  assert.notEqual(guestActorId(token), guestActorId(randomBytes(32).toString('base64url')));
  for (const invalid of ['', 'user123', 'g_' + 'a'.repeat(64), 'a'.repeat(42), '/'.repeat(43)]) assert.equal(guestActorId(invalid), null);
  assert.doesNotMatch(privateHash('198.51.100.9'), /198\.51\.100/);
});

test('rate-limit responses include retry timing; unknown errors never leak internals', async () => {
  const limited = apiErrorResponse(new ApiError('Pause before trying again.', 429, 20));
  assert.equal(limited.status, 429); assert.equal(limited.headers.get('retry-after'), '20');
  const unavailable = apiErrorResponse(new Error('mongodb://secret-password private thought'));
  assert.equal(unavailable.status, 503);
  assert.doesNotMatch(await unavailable.text(), /mongodb|secret|thought/);
  assert.deepEqual(RATE_RULES.checkin, { limit: 5, seconds: 600 });
  assert.deepEqual(RATE_RULES.report, { limit: 10, seconds: 3600 });
});

test('monitoring strips messages, requests, identities, breadcrumbs and attached text', () => {
  const result = scrubMonitoringEvent({ type: undefined, message: 'private thought', user: { email: 'private@example.com' }, request: { url: 'https://curevo.example/?q=private', data: { thought: 'private thought' }, cookies: { session: 'secret' } }, breadcrumbs: [{ message: 'private thought' }], extra: { thought: 'private thought' }, exception: { values: [{ value: 'private thought', stacktrace: { frames: [{ vars: { text: 'private thought' } }] } }] } });
  assert.doesNotMatch(JSON.stringify(result), /private|secret|email|cookies|breadcrumbs|exception/);
  assert.deepEqual(privateMonitoringCollection.httpBodies, []);
  assert.equal(privateMonitoringCollection.cookies, false);
  assert.equal(privateMonitoringCollection.databaseQueryData, false);
});
