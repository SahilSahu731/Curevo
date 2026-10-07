export type ModerationDecision = { status: 'approved' | 'pending' | 'limited' | 'blocked'; reasons: string[]; safety: boolean; source: string };

// Deterministic filters are a first pass, never a substitute for review.
export function localModeration(text: string): ModerationDecision | null {
  const normalized = text.normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g, '');
  const selfHarm = /\b(kill myself|end my life|want to die|going to die by suicide|suicid(?:e|al)|hurt myself|self[- ]harm)\b/i;
  if (selfHarm.test(normalized)) return { status: 'limited', reasons: ['self-harm-support'], safety: true, source: 'local' };
  const threats = /\b(?:going to|will|want to|planning to)\s+(?:kill|shoot|stab|murder|rape)\b/i;
  if (threats.test(normalized)) return { status: 'blocked', reasons: ['credible-threat'], safety: true, source: 'local' };
  if (/\b(?:child|minor|underage|\d{1,2}[- ]year[- ]old)\b.{0,40}\b(?:porn|sex|nude)\b|\b(?:porn|nude)\b.{0,40}\b(?:child|minor|underage)\b/i.test(normalized)) return { status: 'blocked', reasons: ['sexual-safety'], safety: false, source: 'local' };
  const pii = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|(?:\+?\d[\s().-]*){9,}|\b\d{1,5}\s+(?:[\w'-]+\s+){0,4}(?:street|avenue|road|lane|drive|boulevard)\b/i;
  if (pii.test(normalized)) return { status: 'limited', reasons: ['personal-information'], safety: false, source: 'local' };
  if (/https?:\/\/|www\.|(.)\1{15,}|\b(?:buy now|crypto giveaway|free money|use my referral|join my telegram)\b/i.test(normalized)) return { status: 'pending', reasons: ['possible-spam'], safety: false, source: 'local' };
  return null;
}

export async function moderateText(text: string): Promise<ModerationDecision> {
  const local = localModeration(text);
  if (local) return local;
  const key = process.env.OPENAI_MODERATION_API_KEY || process.env.OPENAI_API_KEY;
  if (!key) return { status: 'pending', reasons: ['human-review-required'], safety: false, source: 'manual' };
  try {
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'omni-moderation-latest', input: text }), signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('Moderation provider unavailable');
    const body = await response.json() as { results?: { flagged: boolean; categories: Record<string, boolean> }[] };
    const result = body.results?.[0];
    if (!result || typeof result.flagged !== 'boolean' || !result.categories) throw new Error('Invalid moderation response');
    const categories = Object.entries(result.categories).filter(([, flagged]) => flagged).map(([category]) => category);
    const safety = categories.some(category => category.startsWith('self-harm') || category === 'violence');
    return { status: result.flagged ? (safety ? 'limited' : 'blocked') : 'approved', reasons: categories, safety, source: 'openai' };
  } catch {
    // Provider outages must never turn moderation into an approval bypass.
    return { status: 'pending', reasons: ['moderation-unavailable'], safety: false, source: 'manual' };
  }
}
