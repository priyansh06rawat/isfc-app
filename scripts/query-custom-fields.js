/**
 * query-custom-fields.js
 * 
 * Lists all custom fields on the Lead object to see if there is any lookup to Connector__c.
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// Load .env
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();

const SF_LOGIN_URL    = process.env.EXPO_PUBLIC_SF_LOGIN_URL;
const SF_CLIENT_ID    = process.env.EXPO_PUBLIC_SF_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.EXPO_PUBLIC_SF_CLIENT_SECRET;
const SF_INSTANCE_URL = process.env.EXPO_PUBLIC_SF_INSTANCE_URL;

function request(url, opts, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
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
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function getToken() {
  const p = new URLSearchParams();
  p.append('grant_type', 'client_credentials');
  p.append('client_id', SF_CLIENT_ID);
  p.append('client_secret', SF_CLIENT_SECRET);
  const res = await request(
    `${SF_LOGIN_URL}/services/oauth2/token`,
    { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    p.toString()
  );
  if (res.status !== 200) throw new Error(`Auth failed: ${JSON.stringify(res.body)}`);
  return res.body.access_token;
}

async function main() {
  const token = await getToken();
  console.log('Describing Lead to check custom fields...');
  const res = await request(
    `${SF_INSTANCE_URL}/services/data/v59.0/sobjects/Lead/describe`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    }
  );
  
  if (res.status !== 200) {
    console.error('Describe failed:', res.body);
    return;
  }
  
  const fields = res.body.fields || [];
  const customFields = fields.filter(f => f.custom);
  
  console.log(`\nFound ${customFields.length} custom fields on Lead SObject:`);
  for (const f of customFields) {
    console.log(`- ${f.name} (Label: ${f.label}, Type: ${f.type}, ReferenceTo: ${JSON.stringify(f.referenceTo)})`);
  }
}

main().catch(console.error);
