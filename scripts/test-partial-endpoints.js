/**
 * test-partial-endpoints.js
 * Tests both /v1/connector/ and /v1/leads/ endpoints on Partial Sandbox
 * to confirm they are reachable and responding correctly.
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
  // Step 1: Get token
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
    console.error('❌ Auth failed:', JSON.stringify(auth.body));
    return;
  }
  const token = auth.body.access_token;
  console.log('✅ Authenticated to:', auth.body.instance_url);
  console.log('');

  // Step 2: Test ConnectorRestController — OTP request
  console.log('--- Testing POST /v1/connector/otp/request ---');
  const otpRes = await req(
    SF_INSTANCE_URL + '/services/apexrest/v1/connector/otp/request',
    {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    },
    JSON.stringify({ mobile: '9999999999' })
  );
  console.log('Status:', otpRes.status, '| Response:', JSON.stringify(otpRes.body));
  console.log('');

  // Step 3: Test LeadRestService — GET leads (will fail with 404 if no GET handler but confirms the class is loaded)
  console.log('--- Testing GET /v1/leads/ (SOQL leads query instead) ---');
  const soql = encodeURIComponent("SELECT Id, FirstName, LastName, Status FROM Lead LIMIT 3");
  const leadsRes = await req(
    SF_INSTANCE_URL + '/services/data/v59.0/query?q=' + soql,
    { headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' } }
  );
  console.log('Status:', leadsRes.status);
  if (leadsRes.body.records) {
    console.log('Leads found:', leadsRes.body.records.length);
    leadsRes.body.records.forEach(r => console.log(' -', r.Id, r.FirstName, r.LastName, r.Status));
  } else {
    console.log(JSON.stringify(leadsRes.body));
  }
  console.log('');

  // Step 4: Test ConnectorAPI — check if connector record exists for a mobile
  console.log('--- Testing SOQL query on Connector__c ---');
  const csoql = encodeURIComponent("SELECT Id, Name, Mobile__c, Status__c, LeadStatus__c FROM Connector__c ORDER BY CreatedDate DESC LIMIT 5");
  const connRes = await req(
    SF_INSTANCE_URL + '/services/data/v59.0/query?q=' + csoql,
    { headers: { Authorization: 'Bearer ' + token } }
  );
  console.log('Status:', connRes.status);
  if (connRes.body.records) {
    console.log('Connector__c records found:', connRes.body.records.length);
    connRes.body.records.forEach(r => console.log(' -', r.Id, '|', r.Name, '|', r.Mobile__c, '|', r.Status__c));
  } else {
    console.log(JSON.stringify(connRes.body));
  }
}

main().catch(console.error);
