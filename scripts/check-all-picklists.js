/**
 * check-all-picklists.js
 * Check ALL restricted picklist fields on Lead to find which field rejects "Home Purchase"
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
  const auth = await req(SF_LOGIN_URL + '/services/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }, p.toString());
  const token = auth.body.access_token;

  const res = await req(SF_INSTANCE_URL + '/services/data/v59.0/sobjects/Lead/describe', { headers: { Authorization: 'Bearer ' + token } });
  const fields = res.body.fields || [];

  // Show ALL restricted picklist fields
  console.log('=== ALL Restricted Picklist Fields on Lead ===\n');
  fields
    .filter(f => f.restrictedPicklist && f.picklistValues && f.picklistValues.length > 0)
    .forEach(f => {
      console.log(`\n${f.name} (${f.label}):`);
      f.picklistValues.filter(v => v.active).forEach(v => console.log(`  - "${v.value}"`));
    });

  // Also check Product__c specifically
  const productField = fields.find(f => f.name === 'Product__c');
  if (productField) {
    console.log('\nProduct__c values:');
    (productField.picklistValues || []).filter(v => v.active).forEach(v => console.log(`  - "${v.value}"`));
  }
}

main().catch(console.error);
