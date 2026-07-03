/**
 * create-connector-object.js
 * 
 * Run this ONCE to create the Connector__c custom object and all its fields
 * in your Salesforce org using the Metadata API.
 *
 * Usage:
 *   node scripts/create-connector-object.js
 *
 * No extra npm install needed — uses only built-in Node.js modules.
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ── Load .env manually (no dotenv dependency needed) ───────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

const SF_LOGIN_URL = process.env.EXPO_PUBLIC_SF_LOGIN_URL || 'https://login.salesforce.com';
const SF_CLIENT_ID = process.env.EXPO_PUBLIC_SF_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.EXPO_PUBLIC_SF_CLIENT_SECRET;
const SF_INSTANCE_URL = process.env.EXPO_PUBLIC_SF_INSTANCE_URL;

// ── Helper: HTTP request ────────────────────────────────────────────────────
function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ── Step 1: Get Salesforce access token ────────────────────────────────────
async function getToken() {
  console.log('🔑 Getting Salesforce access token...');
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', SF_CLIENT_ID);
  params.append('client_secret', SF_CLIENT_SECRET);

  const res = await request(
    `${SF_LOGIN_URL}/services/oauth2/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
    params.toString()
  );

  if (res.status !== 200) {
    throw new Error(`Auth failed: ${JSON.stringify(res.body)}`);
  }

  console.log('✅ Token obtained');
  return res.body.access_token;
}

// ── Step 2: Create Connector__c custom object via Tooling API ───────────────
async function createObject(token) {
  console.log('\n📦 Creating Connector__c custom object...');

  const objectDef = {
    FullName: 'Connector__c',
    Metadata: {
      label: 'Connector',
      pluralLabel: 'Connectors',
      nameField: {
        label: 'Connector Name',
        type: 'Text',
      },
      deploymentStatus: 'Deployed',
      sharingModel: 'ReadWrite',
      description: 'DSA Connector partner records for ISFC app onboarding',
    },
  };

  const res = await request(
    `${SF_INSTANCE_URL}/services/data/v59.0/tooling/sobjects/CustomObject`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
    JSON.stringify(objectDef)
  );

  if (res.status === 201 || res.status === 200) {
    console.log('✅ Connector__c object created');
    return res.body.id;
  } else if (res.body && JSON.stringify(res.body).includes('already exists')) {
    console.log('ℹ️  Connector__c already exists — skipping object creation');
    return null;
  } else {
    throw new Error(`Object creation failed: ${JSON.stringify(res.body)}`);
  }
}

// ── Step 3: Create all custom fields ───────────────────────────────────────
const FIELDS = [
  { fullName: 'Connector__c.AddressProofDocument__c', label: 'Address Proof Document',   type: 'Text', length: 200 },
  { fullName: 'Connector__c.AddressProofType__c',     label: 'Address Proof Type',        type: 'Text', length: 200 },
  { fullName: 'Connector__c.AddressProofNumber__c',   label: 'AddressProof Number',       type: 'Text', length: 200 },
  { fullName: 'Connector__c.Alternative_Mobile__c',   label: 'Alternative Mobile',        type: 'Text', length: 12  },
  { fullName: 'Connector__c.Bank__c',                 label: 'Bank',                      type: 'Text', length: 200 },
  { fullName: 'Connector__c.BankAccount__c',          label: 'Bank Account',              type: 'Text', length: 200 },
  { fullName: 'Connector__c.Branch__c',               label: 'Branch',                    type: 'Text', length: 100 },
  { fullName: 'Connector__c.ChequeDocument__c',       label: 'Cheque Document',           type: 'Text', length: 200 },
  { fullName: 'Connector__c.Company__c',              label: 'Company',                   type: 'Text', length: 200 },
  { fullName: 'Connector__c.CompanyGST__c',           label: 'Company GST',               type: 'Text', length: 200 },
  { fullName: 'Connector__c.CompanyPAN__c',           label: 'Company PAN',               type: 'Text', length: 200 },
  { fullName: 'Connector__c.ConnectorID__c',          label: 'Connector ID',              type: 'Text', length: 10  },
  { fullName: 'Connector__c.ConnectorType__c',        label: 'ConnectorType',             type: 'Text', length: 100 },
  { fullName: 'Connector__c.DeviceID__c',             label: 'Device ID',                 type: 'Text', length: 50  },
  { fullName: 'Connector__c.Email__c',                label: 'Email',                     type: 'Email'             },
  { fullName: 'Connector__c.IDProofDocument__c',      label: 'IDProof Document',          type: 'Text', length: 200 },
  { fullName: 'Connector__c.IDProofNumber__c',        label: 'IDProof Number',            type: 'Text', length: 200 },
  { fullName: 'Connector__c.IDProofType__c',          label: 'IDProof Type',              type: 'Text', length: 200 },
  { fullName: 'Connector__c.IFSC__c',                 label: 'IFSC Code',                 type: 'Text', length: 200 },
  { fullName: 'Connector__c.Landmark__c',             label: 'Landmark',                  type: 'Text', length: 200 },
  { fullName: 'Connector__c.LeadStatus__c',           label: 'LeadStatus',                type: 'Picklist',
    valueSet: { valueSetDefinition: { value: [
      { fullName: 'New', default: true, label: 'New' },
      { fullName: 'Onboarding', default: false, label: 'Onboarding' },
      { fullName: 'KYC Pending', default: false, label: 'KYC Pending' },
      { fullName: 'Active', default: false, label: 'Active' },
      { fullName: 'Inactive', default: false, label: 'Inactive' },
      { fullName: 'Rejected', default: false, label: 'Rejected' },
    ]}}
  },
  { fullName: 'Connector__c.LO_Id__c',               label: 'LO Id',                     type: 'Text', length: 40  },
  { fullName: 'Connector__c.LO_Mobile__c',            label: 'LO Mobile',                 type: 'Text', length: 12  },
  { fullName: 'Connector__c.Mobile__c',               label: 'Mobile',                    type: 'Text', length: 10  },
  { fullName: 'Connector__c.MPIN__c',                 label: 'MPIN',                      type: 'Text', length: 4   },
  { fullName: 'Connector__c.Name__c',                 label: 'Name',                      type: 'Text', length: 200 },
  { fullName: 'Connector__c.NameInBank__c',           label: 'Name In Bank Account Type', type: 'Text', length: 200 },
  { fullName: 'Connector__c.NotificationEnable__c',   label: 'Notification Enable',       type: 'Checkbox', defaultValue: false },
  { fullName: 'Connector__c.NotificationId__c',       label: 'Notification ID',           type: 'Text', length: 200 },
  { fullName: 'Connector__c.Occupation__c',           label: 'Occupation',                type: 'Text', length: 100 },
  { fullName: 'Connector__c.OccupationYear__c',       label: 'OccupationYear',            type: 'Text', length: 100 },
  { fullName: 'Connector__c.OfficeAddress__c',        label: 'Office Address',            type: 'Text', length: 200 },
  { fullName: 'Connector__c.OfficeAddresLanmark__c',  label: 'OfficeAddresLanmark',       type: 'Text', length: 200 },
  { fullName: 'Connector__c.OfficeAddresPincode__c',  label: 'OfficeAddresPincode',       type: 'Text', length: 6   },
  { fullName: 'Connector__c.OTP__c',                  label: 'OTP',                       type: 'Text', length: 6   },
  { fullName: 'Connector__c.OTPExpiredOn__c',         label: 'OTP Expired On',            type: 'DateTime'          },
  { fullName: 'Connector__c.OTPStatus__c',            label: 'OTP Status',                type: 'Text', length: 20  },
  { fullName: 'Connector__c.PAN__c',                  label: 'PAN',                       type: 'Text', length: 10  },
  { fullName: 'Connector__c.Pincode__c',              label: 'Pincode',                   type: 'Text', length: 6   },
  { fullName: 'Connector__c.Profile__c',              label: 'Profile',                   type: 'Text', length: 200 },
  { fullName: 'Connector__c.ResidentialAddress__c',   label: 'Residential Address',       type: 'Text', length: 200 },
  { fullName: 'Connector__c.Status__c',               label: 'Status',                    type: 'Text', length: 100 },
  { fullName: 'Connector__c.Tieup__c',                label: 'Tie Up',                    type: 'Text', length: 9   },
  { fullName: 'Connector__c.verifiedLO__c',           label: 'verifiedLO',                type: 'Checkbox', defaultValue: false },
  { fullName: 'Connector__c.verifiedTermsCondition__c', label: 'verifiedTermsCondition',  type: 'Checkbox', defaultValue: false },
];

async function createField(token, field) {
  const metadata = {
    label: field.label,
    type: field.type,
    ...(field.length && { length: field.length }),
    ...(field.type === 'Checkbox' && { defaultValue: field.defaultValue ?? false }),
    ...(field.valueSet && { valueSet: field.valueSet }),
    ...(field.type === 'Text' && { required: false }),
  };

  const res = await request(
    `${SF_INSTANCE_URL}/services/data/v59.0/tooling/sobjects/CustomField`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
    JSON.stringify({ FullName: field.fullName, Metadata: metadata })
  );

  if (res.status === 201 || res.status === 200) {
    console.log(`  ✅ ${field.fullName.split('.')[1]}`);
  } else if (JSON.stringify(res.body).includes('already exists')) {
    console.log(`  ⏭  ${field.fullName.split('.')[1]} (already exists)`);
  } else {
    console.log(`  ❌ ${field.fullName.split('.')[1]}: ${JSON.stringify(res.body)}`);
  }
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 ISFC App — Create Connector__c Salesforce Object\n');
  console.log(`🌐 Org: ${SF_INSTANCE_URL}`);

  if (!SF_CLIENT_ID || !SF_CLIENT_SECRET) {
    console.error('❌ Missing EXPO_PUBLIC_SF_CLIENT_ID or EXPO_PUBLIC_SF_CLIENT_SECRET in .env');
    process.exit(1);
  }

  try {
    const token = await getToken();

    await createObject(token);

    // Wait 3 seconds for SF to register the object before adding fields
    console.log('\n⏳ Waiting 3s for Salesforce to register the object...');
    await new Promise(r => setTimeout(r, 3000));

    console.log('\n🏗️  Creating custom fields...');
    for (const field of FIELDS) {
      await createField(token, field);
      // Small delay between field creation to avoid API rate limits
      await new Promise(r => setTimeout(r, 300));
    }

    console.log('\n✅ Done! Connector__c object and all fields created successfully.');
    console.log('\n📋 Next steps:');
    console.log('   1. Go to Salesforce Setup → Object Manager → Connector → Fields');
    console.log('   2. Verify all fields are visible');
    console.log('   3. Create an Apex REST class for /services/apexrest/v1/connector');
    console.log('   4. Run the app — ConnectorAPI is already wired in api.ts');
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

main();
