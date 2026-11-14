const fs = require('fs');

const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
}
const base = (env.NASA_APPEARS_BASE_URL || 'https://appeears.earthdatacloud.nasa.gov/api').replace(/\/$/, '');

(async () => {
  const basic = Buffer.from(`${env.NASA_EARTHDATA_USERNAME}:${env.NASA_EARTHDATA_PASSWORD}`).toString('base64');
  const loginRes = await fetch(`${base}/login`, { method: 'POST', headers: { Authorization: `Basic ${basic}` } });
  const { token } = await loginRes.json();

  const variants = [
    'MOD13Q1.061',
    'MOD13Q1/061',
    'MOD13Q1',
    'VNP13A1.002',
    '20',
  ];
  for (const v of variants) {
    const url = `${base}/product/${v}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const text = await res.text();
    console.log(`\n${v} -> ${res.status} ${text.slice(0, 240)}`);
    if (res.status === 200) {
      try {
        const json = JSON.parse(text);
        const layers = json?.DataProductLayers || [];
        console.log('  layers:', layers.map(l => l.Layer).join(', ').slice(0, 800));
      } catch {}
    }
  }

  const q = await fetch(`${base}/product?product=MOD13Q1&version=061`, { headers: { Authorization: `Bearer ${token}` } });
  console.log('\nquery ->', q.status, (await q.text()).slice(0, 200));
})().catch(e => { console.error('ERROR', e); process.exit(1); });
