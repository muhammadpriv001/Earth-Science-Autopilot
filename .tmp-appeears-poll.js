const fs = require('fs');

const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
}
const base = (env.NASA_APPEARS_BASE_URL || 'https://appeears.earthdatacloud.nasa.gov/api').replace(/\/$/, '');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function req(url, token, tries = 6) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      return res;
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(3000);
    }
  }
}

(async () => {
  const basic = Buffer.from(`${env.NASA_EARTHDATA_USERNAME}:${env.NASA_EARTHDATA_PASSWORD}`).toString('base64');
  const loginRes = await fetch(`${base}/login`, { method: 'POST', headers: { Authorization: `Basic ${basic}` } });
  const { token } = await loginRes.json();
  const taskId = process.argv[2];

  let status = '';
  for (let i = 0; i < 80; i++) {
    const res = await req(`${base}/task/${taskId}`, token);
    const data = await res.json();
    status = data.status;
    console.log(new Date().toISOString().slice(11, 19), 'status', status, data.progress ?? '');
    if (status === 'done' || status === 'error') break;
    await sleep(6000);
  }
  if (status !== 'done') return;

  const bundle = await (await req(`${base}/bundle/${taskId}`, token)).json();
  console.log('files:', (bundle.files || []).map(f => f.file_name).join(' | '));
  const file = (bundle.files || []).find(f => (f.file_name || '').toLowerCase().endsWith('.csv'));
  if (!file) return;
  const csv = await (await req(`${base}/bundle/${taskId}/${file.file_id}`, token)).text();
  fs.writeFileSync('.tmp-appeears-sample.csv', csv);
  console.log('csv bytes', csv.length);
  console.log(csv.split(/\r?\n/).slice(0, 6).join('\n'));
})().catch(e => { console.error('ERROR', e); process.exit(1); });
