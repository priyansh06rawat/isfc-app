const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
let SF_LOGIN_URL = 'https://isfc--partial.sandbox.my.salesforce.com';
let SF_CLIENT_ID = '';
let SF_CLIENT_SECRET = '';

if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  env.split('\n').forEach(line => {
    if (line.startsWith('EXPO_PUBLIC_SF_CLIENT_ID=')) SF_CLIENT_ID = line.split('=')[1].trim();
    if (line.startsWith('EXPO_PUBLIC_SF_CLIENT_SECRET=')) SF_CLIENT_SECRET = line.split('=')[1].trim();
  });
}

async function testSignup() {
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
  
  const payload = {
    Process:            'softsignup',
    Name:               'priyansh test',
    Mobile:             '9191919191',
    Email:              'priyansh.test@example.com',
    DeviceID:           '',
    NotificationId:     '',
    NotificationEnable: false,
  };

  const res = await fetch(`${authData.instance_url}/services/apexrest/v1/connector/signup`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authData.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log(`Status: ${res.status}`);
  console.log(`Response: ${text}`);
}
testSignup();
