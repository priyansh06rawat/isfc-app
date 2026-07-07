const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i === -1) continue;
  process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

const SF_LOGIN_URL    = process.env.EXPO_PUBLIC_SF_LOGIN_URL;
const SF_CLIENT_ID    = process.env.EXPO_PUBLIC_SF_CLIENT_ID;
const SF_CLIENT_SECRET= process.env.EXPO_PUBLIC_SF_CLIENT_SECRET;
const SF_INSTANCE_URL = process.env.EXPO_PUBLIC_SF_INSTANCE_URL;

function req(url, opts, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const r = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: opts.method || 'GET',
      headers: opts.headers || {},
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function main() {
  const p = new URLSearchParams();
  p.append('grant_type', 'client_credentials');
  p.append('client_id', SF_CLIENT_ID);
  p.append('client_secret', SF_CLIENT_SECRET);

  const auth = await req(
    SF_LOGIN_URL + '/services/oauth2/token',
    { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    p.toString()
  );

  if (auth.status !== 200) {
    console.error('AUTH FAILED:', JSON.stringify(auth.body));
    return;
  }
  const token = auth.body.access_token;
  console.log('Authenticated to:', auth.body.instance_url);

  const soql = "SELECT Name FROM ApexClass WHERE Name LIKE '%Connector%' OR Name LIKE '%Lead%' ORDER BY Name";
  const q = encodeURIComponent(soql);
  const res = await req(
    SF_INSTANCE_URL + '/services/data/v59.0/tooling/query?q=' + q,
    { headers: { Authorization: 'Bearer ' + token } }
  );

  console.log('Status:', res.status);
  if (res.body && res.body.records) {
    console.log('Apex classes on Partial Sandbox:');
    res.body.records.forEach(r => console.log(' -', r.Name));
  } else {
    console.log(JSON.stringify(res.body));
  }
}

main().catch(console.error);
