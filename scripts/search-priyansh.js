const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
let SF_LOGIN_URL = 'https://isfc.my.salesforce.com';
let SF_CLIENT_ID = '';
let SF_CLIENT_SECRET = '';

if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  env.split('\n').forEach(line => {
    if (line.startsWith('EXPO_PUBLIC_SF_CLIENT_ID=')) SF_CLIENT_ID = line.split('=')[1].trim();
    if (line.startsWith('EXPO_PUBLIC_SF_CLIENT_SECRET=')) SF_CLIENT_SECRET = line.split('=')[1].trim();
  });
}

async function search() {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', SF_CLIENT_ID);
  params.append('client_secret', SF_CLIENT_SECRET);

  const authRes = await fetch(`${SF_LOGIN_URL}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const authData = await authRes.json();
  if (!authData.access_token) return console.error('Auth failed', authData);

  const query = encodeURIComponent("SELECT Id, Name, Name__c, Mobile__c, CreatedDate FROM Connector__c WHERE CreatedDate = TODAY ORDER BY CreatedDate DESC");
  const res = await fetch(`${authData.instance_url}/services/data/v59.0/query?q=${query}`, {
    headers: { 'Authorization': `Bearer ${authData.access_token}` }
  });
  
  const data = await res.json();
  console.log('\n--- ALL CONNECTORS CREATED TODAY IN PARTIAL SANDBOX ---');
  data.records.forEach(r => {
    console.log(`Name: ${r.Name__c || r.Name} | Mobile: ${r.Mobile__c} | Created: ${r.CreatedDate} | ID: ${r.Id}`);
  });
}
search();
