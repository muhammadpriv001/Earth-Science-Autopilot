const fs = require('fs');

const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
}
const base = (env.NASA_APPEARS_BASE_URL || 'https://appeears.earthdatacloud.nasa.gov/api').replace(/\/$/, '');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const basic = Buffer.from(`${env.NASA_EARTHDATA_USERNAME}:${env.NASA_EARTHDATA_PASSWORD}`).toString('base64');
  const loginRes = await fetch(`${base}/login`, { method: 'POST', headers: { Authorization: `Basic ${basic}` } });
  const { token } = await loginRes.json();
  const auth = { Authorization: `Bearer ${token}` };

  const detail = await (await fetch(`${base}/product/MOD13Q1.061`, { headers: auth })).json();
  const keys = Object.keys(detail);
  console.log('layer count', keys.length);
  console.log('ndvi/evi layers:', keys.filter(k => /NDVI|EVI/i.test(k)).join(', '));

  const payload = {
    task_type: 'point',
    task_name: `esa-veg-probe-${Date.now()}`,
    params: {
      coordinates: [{ latitude: 31.5204, longitude: 74.3587, id: 'Lahore', category: 'city' }],
      dates: [{ startDate: '01-01-2024', endDate: '12-31-2025' }],
      layers: [
        { product: 'MOD13Q1.061', layer: '_250m_16_days_NDVI' },
        { product: 'MOD13Q1.061', layer: '_250m_16_days_EVI' },
      ],
      output: { format: { type: 'csv' } },
    },
  };

  const createRes = await fetch(`${base}/task`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const createText = await createRes.text();
  console.log('create', createRes.status, createText.slice(0, 300));
  if (!createRes.ok) return;
  const taskId = JSON.parse(createText).task_id;

  let status = '';
  for (let i = 0; i < 90; i++) {
    await sleep(5000);
    const res = await fetch(`${base}/task/${taskId}`, { headers: auth });
    const data = await res.json();
    status = data.status;
    if (i % 3 === 0 || status === 'done' || status === 'error') {
      console.log('poll', i, status, data.progress ?? '');
    }
    if (status === 'done' || status === 'error') break;
  }
  console.log('final status', status, 'task', taskId);
  if (status !== 'done') return;

  const bundle = await (await fetch(`${base}/bundle/${taskId}`, { headers: auth })).json();
  console.log('bundle files:', (bundle.files || []).map(f => `${f.file_name} (${f.file_id})`).join(' | ').slice(0, 500));
  const file = (bundle.files || []).find(f => (f.file_name || '').toLowerCase().endsWith('.csv'));
  if (!file) return;
  const csv = await (await fetch(`${base}/bundle/${taskId}/${file.file_id}`, { headers: auth })).text();
  fs.writeFileSync('.tmp-appeears-sample.csv', csv);
  console.log('csv bytes', csv.length);
  console.log(csv.split(/\r?\n/).slice(0, 8).join('\n'));
})().catch(e => { console.error('ERROR', e); process.exit(1); });
