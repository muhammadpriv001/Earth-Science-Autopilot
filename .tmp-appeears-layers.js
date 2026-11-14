const fs = require('fs');

const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
}
const base = (env.NASA_APPEARS_BASE_URL || 'https://appeears.earthdatacloud.nasa.gov/api').replace(/\/$/, '');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getJson(url, token, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const text = await res.text();
      if (res.status === 200) return JSON.parse(text);
      console.log(`  ${url} -> ${res.status} ${text.slice(0, 200)}`);
      return null;
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(2000);
    }
  }
}

(async () => {
  const basic = Buffer.from(`${env.NASA_EARTHDATA_USERNAME}:${env.NASA_EARTHDATA_PASSWORD}`).toString('base64');
  const loginRes = await fetch(`${base}/login`, { method: 'POST', headers: { Authorization: `Basic ${basic}` } });
  const { token } = await loginRes.json();

  const products = await getJson(`${base}/product`, token);
  const wanted = Object.entries(products || {}).filter(([, p]) =>
    ['MOD13Q1', 'MOD13A2', 'MOD13A3', 'MYD13Q1', 'VNP13A1', 'VNP13A2', 'VJ113A1'].includes(p.Product)
  );

  for (const [pid, p] of wanted) {
    console.log(`\n== ${p.Product}.${p.Version} (id ${pid}) ${p.Description}`);
    const detail = await getJson(`${base}/product/${pid}`, token);
    if (!detail) continue;
    const dataLayers = detail?.DataProductLayers || [];
    console.log('  layers:', dataLayers.map(l => l.Layer).join(', ').slice(0, 600));
  }
})().catch(e => { console.error('ERROR', e); process.exit(1); });
