const fs = require('fs');

const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
}

const base = (env.NASA_APPEARS_BASE_URL || 'https://appeears.earthdatacloud.nasa.gov/api').replace(/\/$/, '');
const user = env.NASA_EARTHDATA_USERNAME;
const pass = env.NASA_EARTHDATA_PASSWORD;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function login() {
  const basic = Buffer.from(`${user}:${pass}`).toString('base64');
  const res = await fetch(`${base}/login`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}` },
  });
  console.log('login', res.status);
  if (!res.ok) throw new Error(`login failed ${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  const { token } = await login();
  console.log('token length', token.length);

  const payload = {
    task_type: 'point',
    task_name: `esa-ndvi-test-${Date.now()}`,
    params: {
      coordinates: [
        { latitude: 31.5204, longitude: 74.3587, id: 'Lahore', category: 'city' },
      ],
      dates: [{ startDate: '01-01-2024', endDate: '06-01-2024' }],
      layers: [{ product: 'MOD13Q1.061', layer: '250m_16_days_NDVI' }],
      output: { format: { type: 'csv' } },
    },
  };

  const create = await fetch(`${base}/task`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const createText = await create.text();
  console.log('create', create.status, createText.slice(0, 500));
  if (!create.ok) return;
  const task = JSON.parse(createText);
  const taskId = task.task_id;
  console.log('taskId', taskId);

  let status = '';
  for (let i = 0; i < 60; i++) {
    await sleep(5000);
    const res = await fetch(`${base}/task/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    status = data.status;
    console.log('poll', i, res.status, status, data.progress ?? '');
    if (status === 'done' || status === 'error') break;
  }

  if (status !== 'done') return;

  const bundleRes = await fetch(`${base}/bundle/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const bundle = await bundleRes.json();
  console.log('bundle', JSON.stringify(bundle).slice(0, 1200));
  const file = (bundle.files || []).find(f => (f.file_name || '').toLowerCase().endsWith('.csv'));
  if (!file) return;
  const csvRes = await fetch(`${base}/bundle/${taskId}/${file.file_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const csv = await csvRes.text();
  console.log('csv bytes', csv.length);
  console.log(csv.split(/\r?\n/).slice(0, 12).join('\n'));
}

main().catch(err => {
  console.error('ERROR', err);
  process.exit(1);
});
