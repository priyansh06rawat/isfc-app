/**
 * test-standard-api.js
 * Tests creating a Lead using Salesforce Standard REST API (/services/data/v59.0/sobjects/Lead)
 * instead of the custom Apex endpoint (/services/apexrest/v1/leads)
 * This avoids the need to deploy/fix the LeadRestService Apex class.
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
  // Get token
  const p = new URLSearchParams();
  p.append('grant_type', 'client_credentials');
  p.append('client_id', SF_CLIENT_ID);
  p.append('client_secret', SF_CLIENT_SECRET);
  const auth = await req(SF_LOGIN_URL + '/services/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }, p.toString());
  const token = auth.body.access_token;
  console.log('✅ Token obtained\n');

  const headers = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };

  // Test 1: Create Lead using Standard Salesforce REST API (NO custom Apex)
  console.log('--- Test 1: Create Lead via Standard sObject API ---');
  const leadPayload = {
    FirstName:          'Demo',
    LastName:           'TestLead',
    // MobilePhone skipped — test if lead creates without it first
    Email:              'demolead@gmail.com',
    Company:            'Demo TestLead',
    City:               'Delhi',
    State:              'Delhi',
    PostalCode:         '110001',
    LeadSource:         'Online Business Partner',
    Status:             'New',
    Property_Type__c:   'Home Purchase',
    Loan_Amount__c:     2000000,
    Employment_Type__c: 'Salaried',
  };

  const r1 = await req(SF_INSTANCE_URL + '/services/data/v59.0/sobjects/Lead', { method: 'POST', headers }, JSON.stringify(leadPayload));
  console.log('Status:', r1.status, '| Body:', JSON.stringify(r1.body));
  if (r1.status === 201) {
    console.log('✅ Lead created! ID:', r1.body.id);
  } else {
    console.log('❌ Failed with standard API too');
  }
  console.log('');

  // Test 2: Try WITH MobilePhone
  console.log('--- Test 2: Create Lead WITH MobilePhone field ---');
  const leadPayload2 = { ...leadPayload, MobilePhone: '7777777701', LastName: 'TestLead2' };
  const r2 = await req(SF_INSTANCE_URL + '/services/data/v59.0/sobjects/Lead', { method: 'POST', headers }, JSON.stringify(leadPayload2));
  console.log('Status:', r2.status, '| Body:', JSON.stringify(r2.body));
  if (r2.status === 201) {
    console.log('✅ Lead with MobilePhone created! ID:', r2.body.id);
  }
  console.log('');

  // Test 3: Connector OTP (still uses Apex — works fine)
  console.log('--- Test 3: Connector OTP Request ---');
  const r3 = await req(SF_INSTANCE_URL + '/services/apexrest/v1/connector/otp/request', { method: 'POST', headers }, JSON.stringify({ mobile: '8888888801' }));
  console.log('Status:', r3.status, '| Body:', JSON.stringify(r3.body));
  console.log(r3.body && r3.body.success ? '✅ OTP sent OK' : '❌ OTP failed');
  console.log('');

  // Test 4: Create Connector__c directly via Standard sObject API as fallback
  console.log('--- Test 4: Create Connector__c via Standard sObject API ---');
  const connPayload = {
    Name:         'Demo Connector',
    Mobile__c:    '8888888801',
    Email__c:     'democonnector@gmail.com',
    Status__c:    'Pending',
    LeadStatus__c:'New',
  };
  const r4 = await req(SF_INSTANCE_URL + '/services/data/v59.0/sobjects/Connector__c', { method: 'POST', headers }, JSON.stringify(connPayload));
  console.log('Status:', r4.status, '| Body:', JSON.stringify(r4.body));
  if (r4.status === 201) {
    console.log('✅ Connector__c created directly! ID:', r4.body.id);
  }
}

main().catch(console.error);
