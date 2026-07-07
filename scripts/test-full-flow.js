/**
 * test-full-flow.js
 * Tests the exact same API calls that the app makes — connector OTP, signup, and lead creation.
 * Run this BEFORE deploying the Apex fix to confirm the fix is needed,
 * then run again AFTER deploying to confirm it works.
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

console.log('Using SF_INSTANCE_URL:', SF_INSTANCE_URL);

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

  if (auth.status !== 200) { console.error('❌ Auth failed:', JSON.stringify(auth.body)); return; }
  const token = auth.body.access_token;
  console.log('✅ Token obtained. Instance:', auth.body.instance_url, '\n');

  const headers = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };

  // Step 2: Test OTP request for a new test mobile
  const testMobile = '8888888800';
  console.log(`--- Step 2: OTP Request for mobile ${testMobile} ---`);
  const otpRes = await req(
    SF_INSTANCE_URL + '/services/apexrest/v1/connector/otp/request',
    { method: 'POST', headers },
    JSON.stringify({ mobile: testMobile })
  );
  console.log(`Status: ${otpRes.status} | ${JSON.stringify(otpRes.body)}`);
  const otpOk = otpRes.status === 200 && otpRes.body.success;
  console.log(otpOk ? '✅ OTP sent OK' : '❌ OTP request failed');
  console.log('');

  // Step 3: Connector Signup (softsignup) — same payload as app createConnector
  console.log('--- Step 3: Connector Signup (softsignup) ---');
  const signupRes = await req(
    SF_INSTANCE_URL + '/services/apexrest/v1/connector/signup',
    { method: 'POST', headers },
    JSON.stringify({
      Process:            'softsignup',
      Name:               'Demo Test User',
      Mobile:             testMobile,
      Email:              'demotest99@gmail.com',
      DeviceID:           'demo-device-001',
      NotificationId:     '',
      NotificationEnable: false,
    })
  );
  console.log(`Status: ${signupRes.status} | ${JSON.stringify(signupRes.body)}`);
  const signupOk = signupRes.status === 200 && signupRes.body.success;
  console.log(signupOk ? '✅ Connector created OK' : '⚠️  Signup response (check message above)');
  const connectorId = signupRes.body['Connector ID'] || signupRes.body.connectorId || '';
  if (connectorId) console.log('   Connector ID:', connectorId);
  console.log('');

  // Step 4: Create Lead — same payload as app createLead
  console.log('--- Step 4: Create Lead via Standard REST API ---');
  const leadRes = await req(
    SF_INSTANCE_URL + '/services/data/v59.0/sobjects/Lead',
    { method: 'POST', headers },
    JSON.stringify({
      FirstName:          'Demo',
      LastName:           'TestLead',
      Company:            'Demo TestLead',
      MobilePhone:        '7777777700',
      Email:              'demolead@gmail.com',
      City:               'Delhi',
      State:              'Delhi',
      PostalCode:         '110001',
      LeadSource:         'Online Business Partner',
      Status:             'New',
      Description:        'Demo test lead',
      Loan_Amount__c:     2000000,
      Employment_Type__c: 'Salaried',
      Property_City__c:   'Delhi',
      Current_Step__c:    'Personal Info',
      Application_Status__c: 'Draft',
      Connector__c:       connectorId || null
    })
  );
  console.log(`Status: ${leadRes.status} | ${JSON.stringify(leadRes.body)}`);
  const leadOk = leadRes.status === 201;
  console.log(leadOk ? '✅ Lead created OK! Lead ID: ' + leadRes.body.id : '❌ Lead creation FAILED');
  console.log('');

  // Summary
  console.log('=== SUMMARY ===');
  console.log('OTP Request:      ', otpOk   ? '✅ PASS' : '❌ FAIL');
  console.log('Connector Signup: ', signupOk ? '✅ PASS' : '⚠️  CHECK');
  console.log('Lead Creation:    ', leadOk   ? '✅ PASS' : '❌ FAIL');
}

main().catch(console.error);
