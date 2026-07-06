/**
 * get-apex-classes.js
 * 
 * Fetches the list and body of Apex classes matching "Lead" to see
 * how the /v1/leads REST class maps incoming payload fields.
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
  console.log('Querying ConnectorRegistrationAPI from Tooling API...');
  const q = encodeURIComponent("SELECT Id, Name, Body FROM ApexClass WHERE Name = 'ConnectorRegistrationAPI'");
  const res = await request(
    `${SF_INSTANCE_URL}/services/data/v59.0/tooling/query?q=${q}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    }
  );
  
  if (res.status !== 200) {
    console.error('Failed to query Apex classes:', res.body);
    return;
  }
  
  const records = res.body.records || [];
  if (records.length === 0) {
    console.error('ConnectorRegistrationAPI not found in org.');
    return;
  }

  const body = records[0].Body;
  const savePath = path.join(__dirname, '..', 'salesforce', 'ConnectorRegistrationAPI.cls');
  fs.writeFileSync(savePath, body, 'utf8');
  console.log(`Successfully saved class to ${savePath}`);
}

main().catch(console.error);
