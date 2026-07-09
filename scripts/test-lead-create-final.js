/**
 * test-lead-create-final.js
 * Tests exact same payload that api.ts now uses for lead creation.
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
  console.log('✅ Token OK\n');
  const headers = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };

  // Exact same payload as api.ts createLead now uses
  const payload = {
    FirstName:            'Demo',
    LastName:             'FinalTest',
    Company:              'Demo FinalTest',
    MobilePhone:          '6666666600',
    Email:                'finaltest@gmail.com',
    City:                 'Delhi',
    State:                'Delhi',
    PostalCode:           '110001',
    LeadSource:           'Online Business Partner',
    Status:               'New',
    Description:          'Test lead from app',
    Loan_Amount__c:       2000000,
    Employment_Type__c:   'Salaried',
    Property_City__c:     'Delhi',
    Current_Step__c:      'Personal Info',
    Application_Status__c:'Draft',
  };

  console.log('--- Creating Lead with full payload ---');
  const r = await req(SF_INSTANCE_URL + '/services/data/v59.0/sobjects/Lead', { method: 'POST', headers }, JSON.stringify(payload));
  console.log('Status:', r.status);

  if (r.status === 201) {
    console.log('✅ LEAD CREATED SUCCESSFULLY! ID:', r.body.id);
    console.log('   Check in Production Salesforce: https://isfc.my.salesforce.com');
    return;
  }

  // If MobilePhone blocked, retry without it
  const errArr = Array.isArray(r.body) ? r.body : [];
  const mobileBlocked = errArr.some(e => (e.fields||[]).includes('MobilePhone') || (e.message||'').toLowerCase().includes('mobilephone'));
  
  if (mobileBlocked) {
    console.log('⚠️  MobilePhone blocked — retrying without it (will still save other fields)');
    delete payload.MobilePhone;
    const r2 = await req(SF_INSTANCE_URL + '/services/data/v59.0/sobjects/Lead', { method: 'POST', headers }, JSON.stringify(payload));
    console.log('Retry Status:', r2.status, '| Body:', JSON.stringify(r2.body));
    if (r2.status === 201) {
      console.log('✅ LEAD CREATED (without MobilePhone)! ID:', r2.body.id);
    } else {
      console.log('❌ Still failing:', JSON.stringify(r2.body));
    }
  } else {
    console.log('❌ Failed:', JSON.stringify(r.body));
  }
}

main().catch(console.error);
