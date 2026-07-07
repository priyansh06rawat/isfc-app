/**
 * find-working-picklist.js
 * Tries every Property_Type__c value one by one to find which ones the Integration User can actually set.
 */
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const envPath = path.join(__dirname, '..', '.env');
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i === -1) continue;
  process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

const SF_LOGIN_URL     = process.env.EXPO_PUBLIC_SF_LOGIN_URL;
const SF_CLIENT_ID     = process.env.EXPO_PUBLIC_SF_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.EXPO_PUBLIC_SF_CLIENT_SECRET;
const SF_INSTANCE_URL  = process.env.EXPO_PUBLIC_SF_INSTANCE_URL;

function req(url, opts, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const r = https.request({ hostname: u.hostname, path: u.pathname + u.search, method: opts.method || 'GET', headers: opts.headers || {} }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(d) }); } catch (e) { resolve({ status: res.statusCode, body: d }); } });
    });
    r.on('error', reject); if (body) r.write(body); r.end();
  });
}

async function main() {
  const p = new URLSearchParams();
  p.append('grant_type', 'client_credentials');
  p.append('client_id', SF_CLIENT_ID);
  p.append('client_secret', SF_CLIENT_SECRET);
  const auth = await req(SF_LOGIN_URL + '/services/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }, p.toString());
  const token = auth.body.access_token;
  const headers = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };

  const values = [
    'Commercial Building', 'Commercial Shop/Unit', 'Home Construction', 'Home Purchase',
    'Plot + Construction', 'Ready Built Flat', 'Residential House', 'Under Construction Property', 'Owned Plot',
    'Home Loan', 'LAP', 'MSME Loan', ''  // also try empty/null
  ];

  console.log('Testing each Property_Type__c value:\n');
  let counter = 9900;
  for (const val of values) {
    const payload = {
      FirstName: 'Test', LastName: 'Pick' + (counter++),
      Company: 'Test', LeadSource: 'Online Business Partner',
      Status: 'New',
    };
    if (val !== '') payload.Property_Type__c = val;
    const r = await req(SF_INSTANCE_URL + '/services/data/v59.0/sobjects/Lead', { method: 'POST', headers }, JSON.stringify(payload));
    const ok = r.status === 201;
    console.log(`  "${val || '(empty)'}": ${ok ? '✅ WORKS' : '❌ ' + (r.body[0] ? r.body[0].message : JSON.stringify(r.body))}`);
    // Delete the created lead to keep org clean
    if (ok && r.body.id) {
      await req(SF_INSTANCE_URL + '/services/data/v59.0/sobjects/Lead/' + r.body.id, { method: 'DELETE', headers });
    }
  }
}

main().catch(console.error);
