// Bank of Thailand exchange rates via the AllRatesToday API.
const BASE = 'https://allratestoday.com/api/v1/central-bank/bot';
const KEY_HINT = 'An apiKey is required — get a free key at https://allratestoday.com/register (no credit card required).';

async function request(path, params, options) {
  const apiKey = options && options.apiKey;
  if (!apiKey) throw new Error(KEY_HINT);
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params || {})) {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  }
  const res = await fetch(url, { headers: { Authorization: 'Bearer ' + apiKey } });
  let body;
  try { body = await res.json(); } catch { body = {}; }
  if (!res.ok) {
    const err = new Error(body.error || ('Request failed: HTTP ' + res.status));
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

/** Latest published table (all plans, including free). */
export async function getLatestRates(options) {
  return request('/latest', {}, options);
}

/** Latest rate for one pair, e.g. getRate('USD', 'THB', { apiKey }). */
export async function getRate(source, target, options) {
  return request('/latest', { source, target }, options);
}

/** Published table for a date (YYYY-MM-DD). Paid plans. Weekends/holidays return the most recent published date. */
export async function getRatesForDate(date, options) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) throw new Error('date must be YYYY-MM-DD');
  return request('/' + date, options && options.source ? { source: options.source, target: options.target } : {}, options);
}

/** Daily time series. Pass { symbol } or { source, target }, optional from/to (YYYY-MM-DD). Paid plans. */
export async function getHistory(query, options) {
  const { symbol, source, target, from, to } = query || {};
  return request('/history', { symbol, source, target, from, to }, options);
}
