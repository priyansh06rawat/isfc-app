/**
 * test-exact-endpoints.js
 * Tests the EXACT endpoint URLs used by the app to verify which ones work on Partial.
 */
const https = require('https');
const fs    = require('fs');
const path  = require('path');

// Load .env
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

  const auth = await req(
    SF_LOGIN_URL + '/services/oauth2/token',
    { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    p.toString()
  );

  if (auth.status !== 200) { console.error('AUTH FAILED:', JSON.stringify(auth.body)); return; }
  const token = auth.body.access_token;
  console.log('✅ Authenticated to:', auth.body.instance_url, '\n');

  const tests = [
    // App currently calls these:
    { label: 'APP: POST /v1/connector/otp/request (ConnectorRestController)', method: 'POST', url: SF_INSTANCE_URL + '/services/apexrest/v1/connector/otp/request', body: JSON.stringify({ mobile: '9999999998' }) },
    { label: 'APP: POST /v1/connector/signup (ConnectorRestController)', method: 'POST', url: SF_INSTANCE_URL + '/services/apexrest/v1/connector/signup', body: JSON.stringify({ Process: 'softsignup', Name: 'Test User', Mobile: '9999999998', Email: 'test@test.com' }) },
    { label: 'APP: POST /v1/leads (LeadRestService)', method: 'POST', url: SF_INSTANCE_URL + '/services/apexrest/v1/leads', body: JSON.stringify({ firstName: 'Test', lastName: 'Lead', mobileNumber: '9999999997', loanAmount: 500000, employmentType: 'Salaried', propertyType: 'Apartment', leadSource: 'Mobile App', status: 'Open - Not Contacted', currentStep: 'Personal Info', applicationStatus: 'Draft' }) },
    // Old API endpoints (ConnectorRegistrationAPI):
    { label: 'OLD: GET /Connector/Signup/ (ConnectorRegistrationAPI)', method: 'GET', url: SF_INSTANCE_URL + '/services/apexrest/Connector/Signup/' },
  ];

  for (const test of tests) {
    console.log(`--- ${test.label} ---`);
    const headers = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
    const r = await req(test.url, { method: test.method, headers }, test.body);
    console.log(`Status: ${r.status} | Body: ${JSON.stringify(r.body).substring(0, 200)}`);
    console.log('');
  }
}

main().catch(console.error);
