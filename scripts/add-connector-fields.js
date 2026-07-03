/**
 * add-connector-fields.js
 * 
 * Creates all 47 custom fields on the existing Connector__c object
 * using the Salesforce Tooling API.
 *
 * Run: node scripts/add-connector-fields.js
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
  console.log('✅ Token obtained');
  return res.body.access_token;
}

// All 47 custom fields for Connector__c
const FIELDS = [
  { name: 'Mobile__c',                  label: 'Mobile',                      type: 'Text',     length: 10  },
  { name: 'OTP__c',                     label: 'OTP',                         type: 'Text',     length: 6   },
  { name: 'OTPExpiredOn__c',            label: 'OTP Expired On',              type: 'DateTime'              },
  { name: 'OTPStatus__c',               label: 'OTP Status',                  type: 'Text',     length: 20  },
  { name: 'Status__c',                  label: 'Status',                      type: 'Text',     length: 100 },
  { name: 'Name__c',                    label: 'Name',                        type: 'Text',     length: 200 },
  { name: 'LeadStatus__c',              label: 'LeadStatus',                  type: 'Text',     length: 100 },
  { name: 'AddressProofDocument__c',    label: 'Address Proof Document',      type: 'Text',     length: 200 },
  { name: 'AddressProofType__c',        label: 'Address Proof Type',          type: 'Text',     length: 200 },
  { name: 'AddressProofNumber__c',      label: 'AddressProof Number',         type: 'Text',     length: 200 },
  { name: 'Alternative_Mobile__c',      label: 'Alternative Mobile',          type: 'Text',     length: 12  },
  { name: 'Bank__c',                    label: 'Bank',                        type: 'Text',     length: 200 },
  { name: 'BankAccount__c',             label: 'Bank Account',                type: 'Text',     length: 200 },
  { name: 'Branch__c',                  label: 'Branch',                      type: 'Text',     length: 100 },
  { name: 'ChequeDocument__c',          label: 'Cheque Document',             type: 'Text',     length: 200 },
  { name: 'Company__c',                 label: 'Company',                     type: 'Text',     length: 200 },
  { name: 'CompanyGST__c',              label: 'Company GST',                 type: 'Text',     length: 200 },
  { name: 'CompanyPAN__c',              label: 'Company PAN',                 type: 'Text',     length: 200 },
  { name: 'ConnectorID__c',             label: 'Connector ID',                type: 'Text',     length: 10  },
  { name: 'ConnectorType__c',           label: 'ConnectorType',               type: 'Text',     length: 100 },
  { name: 'DeviceID__c',                label: 'Device ID',                   type: 'Text',     length: 50  },
  { name: 'Email__c',                   label: 'Email',                       type: 'Email'                 },
  { name: 'IDProofDocument__c',         label: 'IDProof Document',            type: 'Text',     length: 200 },
  { name: 'IDProofNumber__c',           label: 'IDProof Number',              type: 'Text',     length: 200 },
  { name: 'IDProofType__c',             label: 'IDProof Type',                type: 'Text',     length: 200 },
  { name: 'IFSC__c',                    label: 'IFSC Code',                   type: 'Text',     length: 200 },
  { name: 'Landmark__c',                label: 'Landmark',                    type: 'Text',     length: 200 },
  { name: 'LO_Id__c',                   label: 'LO Id',                       type: 'Text',     length: 40  },
  { name: 'LO_Mobile__c',               label: 'LO Mobile',                   type: 'Text',     length: 12  },
  { name: 'MPIN__c',                    label: 'MPIN',                        type: 'Text',     length: 4   },
  { name: 'NameInBank__c',              label: 'Name In Bank Account',        type: 'Text',     length: 200 },
  { name: 'NotificationEnable__c',      label: 'Notification Enable',         type: 'Checkbox', defaultValue: false },
  { name: 'NotificationId__c',          label: 'Notification ID',             type: 'Text',     length: 200 },
  { name: 'Occupation__c',              label: 'Occupation',                  type: 'Text',     length: 100 },
  { name: 'OccupationYear__c',          label: 'OccupationYear',              type: 'Text',     length: 100 },
  { name: 'OfficeAddress__c',           label: 'Office Address',              type: 'Text',     length: 200 },
  { name: 'OfficeAddresLanmark__c',     label: 'OfficeAddresLanmark',         type: 'Text',     length: 200 },
  { name: 'OfficeAddresPincode__c',     label: 'OfficeAddresPincode',         type: 'Text',     length: 6   },
  { name: 'PAN__c',                     label: 'PAN',                         type: 'Text',     length: 10  },
  { name: 'Pincode__c',                 label: 'Pincode',                     type: 'Text',     length: 6   },
  { name: 'Profile__c',                 label: 'Profile',                     type: 'Text',     length: 200 },
  { name: 'ResidentialAddress__c',      label: 'Residential Address',         type: 'Text',     length: 200 },
  { name: 'Tieup__c',                   label: 'Tie Up',                      type: 'Text',     length: 9   },
  { name: 'verifiedLO__c',              label: 'verifiedLO',                  type: 'Checkbox', defaultValue: false },
  { name: 'verifiedTermsCondition__c',  label: 'verifiedTermsCondition',      type: 'Checkbox', defaultValue: false },
];

async function createField(token, field) {
  const metadata = {
    label:    field.label,
    type:     field.type,
    required: false,
    ...(field.length      && { length: field.length }),
    ...(field.type === 'Checkbox' && { defaultValue: field.defaultValue ?? false }),
  };

  const body = JSON.stringify({
    FullName: `Connector__c.${field.name}`,
    Metadata: metadata,
  });

  const res = await request(
    `${SF_INSTANCE_URL}/services/data/v59.0/tooling/sobjects/CustomField`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
    body
  );

  const bodyStr = JSON.stringify(res.body);

  if (res.status === 201 || res.status === 200) {
    console.log(`  ✅ ${field.name}`);
    return true;
  } else if (bodyStr.includes('already exists') || bodyStr.includes('duplicate')) {
    console.log(`  ⏭  ${field.name} (already exists)`);
    return true;
  } else {
    console.log(`  ❌ ${field.name}: ${bodyStr.substring(0, 120)}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Adding custom fields to Connector__c\n');
  console.log(`🌐 Org: ${SF_INSTANCE_URL}\n`);

  const token = await getToken();

  console.log(`\n🏗️  Creating ${FIELDS.length} fields...\n`);
  let ok = 0, fail = 0;
  for (const field of FIELDS) {
    const success = await createField(token, field);
    if (success) ok++; else fail++;
    await new Promise(r => setTimeout(r, 400)); // avoid rate limit
  }

  console.log(`\n✅ Done — ${ok} created/skipped, ${fail} failed`);
  if (fail > 0) {
    console.log('⚠️  For failed fields, add them manually in Setup → Object Manager → Connector → Fields & Relationships → New');
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
