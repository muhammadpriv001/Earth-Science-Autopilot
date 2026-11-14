const fs = require('fs');

const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
}

const base = (env.NASA_APPEARS_BASE_URL || 'https://appeears.earthdatacloud.nasa.gov/api').replace(/\/$/, '');

async function login() {
  const basic = Buffer.from(`${env.NASA_EARTHDATA_USERNAME}:${env.NASA_EARTHDATA_PASSWORD}`).toString('base64');
  const res = await fetch(`${base}/login`, { method: 'POST', headers: { Authorization: `Basic ${basic}` } });
  if (!res.ok) throw new Error(`login failed ${res.status} ${await res.text()}`);
  return (await res.json()).token;
}

async function main() {
  const token = await login();
  const headers = { Authorization: `Bearer ${token}` };

  const prodRes = await fetch(`${base}/product`, { headers });
  const products = await prodRes.json();
  console.log('product list status', prodRes.status, 'count', Object.keys(products).length);

  const names = Object.keys(products).filter(n => /13|NDVI|EVI|VNP13|MOD13|MYD13/i.test(n));
  console.log('matches:', names.join(', '));

  for (const name of names.slice(0, 6)) {
    const versions = products[name];
    console.log(`\n### ${name}`, JSON.stringify(versions).slice(0, 300));
    for (const v of Object.keys(versions)) {
      const detailRes = await fetch(`${base}/product/${name}.${v}`, { headers });
      const detail = await detailRes.json();
      if (detailRes.status !== 200) {
        console.log(`  ${name}.${v} -> ${detailRes.status}`);
        continue;
      }
      const layers = Object.keys(detail).filter(k => !['ProductAndVersion', 'Platform', 'Description', 'DOI', 'Version', 'TemporalExtent', 'SpatialExtent', 'CoordinateSystems'].includes(k));
      const idxLayer = layers.find(k => k === '_250m_16_days_NDVI');
      console.log(`  ${name}.${v} keys sample:`, layers.slice(0, 14).join(', '));
      console.log(`  has _250m_16_days_NDVI: ${Boolean(idxLayer)}`);
    }
  }
}

main().catch(e => { console.error('ERROR', e); process.exit(1); });
