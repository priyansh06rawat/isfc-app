/**
 * create-fls-deploy-package.js
 * 
 * Generates a metadata deployment ZIP containing:
 *   1. Connector__c.object-meta.xml (object and fields definition)
 *   2. Admin.profile-meta.xml (grants Visible/Editable Field-Level Security to System Administrator)
 * 
 * Uploading this ZIP to Workbench (workbench.developerforce.com) will
 * instantly grant System Administrator access to all 47 custom fields,
 * making them visible to Apex, SOQL, and the REST API.
 */

const fs = require('fs');
const path = require('path');

// Minimal ZIP builder (no dependencies needed)
function createZip(files) {
  const entries = [];
  let offset = 0;
  const localHeaders = [];

  for (const [name, content] of files) {
    const nameBytes = Buffer.from(name, 'utf8');
    const dataBytes = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');

    // Local file header
    const local = Buffer.alloc(30 + nameBytes.length);
    local.writeUInt32LE(0x04034b50, 0); // signature
    local.writeUInt16LE(20, 4);          // version needed
    local.writeUInt16LE(0, 6);           // flags
    local.writeUInt16LE(0, 8);           // compression (none)
    local.writeUInt16LE(0, 10);          // mod time
    local.writeUInt16LE(0, 12);          // mod date
    local.writeUInt32LE(crc32(dataBytes), 14); // CRC-32
    local.writeUInt32LE(dataBytes.length, 18); // compressed size
    local.writeUInt32LE(dataBytes.length, 22); // uncompressed size
    local.writeUInt16LE(nameBytes.length, 26); // file name length
    local.writeUInt16LE(0, 28);          // extra field length
    nameBytes.copy(local, 30);

    localHeaders.push({ name, nameBytes, dataBytes, offset, crc: crc32(dataBytes) });
    entries.push(local, dataBytes);
    offset += local.length + dataBytes.length;
  }

  // Central directory
  const centralDir = [];
  let centralSize = 0;
  const centralOffset = offset;

  for (const h of localHeaders) {
    const cd = Buffer.alloc(46 + h.nameBytes.length);
    cd.writeUInt32LE(0x02014b50, 0); // signature
    cd.writeUInt16LE(20, 4);         // version made by
    cd.writeUInt16LE(20, 6);         // version needed
    cd.writeUInt16LE(0, 8);          // flags
    cd.writeUInt16LE(0, 10);         // compression
    cd.writeUInt16LE(0, 12);         // mod time
    cd.writeUInt16LE(0, 14);         // mod date
    cd.writeUInt32LE(h.crc, 16);     // CRC-32
    cd.writeUInt32LE(h.dataBytes.length, 20); // compressed size
    cd.writeUInt32LE(h.dataBytes.length, 24); // uncompressed size
    cd.writeUInt16LE(h.nameBytes.length, 28); // file name length
    cd.writeUInt16LE(0, 30);         // extra field length
    cd.writeUInt16LE(0, 32);         // comment length
    cd.writeUInt16LE(0, 34);         // disk number start
    cd.writeUInt16LE(0, 36);         // internal attributes
    cd.writeUInt32LE(0, 38);         // external attributes
    cd.writeUInt32LE(h.offset, 42);  // local header offset
    h.nameBytes.copy(cd, 46);
    centralDir.push(cd);
    centralSize += cd.length;
  }

  // End of central directory
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // signature
  eocd.writeUInt16LE(0, 4);           // disk number
  eocd.writeUInt16LE(0, 6);           // disk with central dir
  eocd.writeUInt16LE(localHeaders.length, 8);  // entries this disk
  eocd.writeUInt16LE(localHeaders.length, 10); // total entries
  eocd.writeUInt32LE(centralSize, 12);         // central dir size
  eocd.writeUInt32LE(centralOffset, 16);       // central dir offset
  eocd.writeUInt16LE(0, 20);                   // comment length

  return Buffer.concat([...entries, ...centralDir, eocd]);
}

// CRC-32 implementation
function crc32(buf) {
  const table = makeCrcTable();
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
let _crcTable = null;
function makeCrcTable() {
  if (_crcTable) return _crcTable;
  _crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    _crcTable[i] = c;
  }
  return _crcTable;
}

// Custom fields list to grant FLS to
const FIELDS = [
  'Mobile__c', 'OTP__c', 'OTPExpiredOn__c', 'OTPStatus__c', 'Status__c', 'Name__c', 'LeadStatus__c',
  'AddressProofDocument__c', 'AddressProofType__c', 'AddressProofNumber__c', 'Alternative_Mobile__c',
  'Bank__c', 'BankAccount__c', 'Branch__c', 'ChequeDocument__c', 'Company__c', 'CompanyGST__c', 'CompanyPAN__c',
  'ConnectorID__c', 'ConnectorType__c', 'DeviceID__c', 'Email__c', 'IDProofDocument__c', 'IDProofNumber__c',
  'IDProofType__c', 'IFSC__c', 'Landmark__c', 'LO_Id__c', 'LO_Mobile__c', 'MPIN__c', 'NameInBank__c',
  'NotificationEnable__c', 'NotificationId__c', 'Occupation__c', 'OccupationYear__c', 'OfficeAddress__c',
  'OfficeAddresLanmark__c', 'OfficeAddresPincode__c', 'PAN__c', 'Pincode__c', 'Profile__c', 'ResidentialAddress__c',
  'Tieup__c', 'verifiedLO__c', 'verifiedTermsCondition__c'
];

// Generate Admin Profile XML
let flsXml = `<?xml version="1.0" encoding="UTF-8"?>
<Profile xmlns="http://soap.sforce.com/2006/04/metadata">
    <classAccesses>
        <apexClass>ConnectorRestController</apexClass>
        <enabled>true</enabled>
    </classAccesses>
`;

for (const field of FIELDS) {
  flsXml += `    <fieldPermissions>
        <editable>true</editable>
        <field>Connector__c.${field}</field>
        <readable>true</readable>
    </fieldPermissions>\n`;
}
flsXml += `</Profile>`;

// Package manifest
const packageXml = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>Connector__c</members>
        <name>CustomObject</name>
    </types>
    <types>
        <members>Admin</members>
        <name>Profile</name>
    </types>
    <version>59.0</version>
</Package>`;

const objectXml = fs.readFileSync(
  path.join(__dirname, '..', 'salesforce', 'objects', 'Connector__c', 'Connector__c.object-meta.xml'),
  'utf8'
);

const files = [
  ['objects/Connector__c.object', objectXml],
  ['profiles/Admin.profile', flsXml],
  ['package.xml', packageXml],
];

const zip = createZip(files);
const outputPath = path.join(__dirname, '..', 'salesforce', 'connector-fls-deploy.zip');
fs.writeFileSync(outputPath, zip);

console.log('✅ Field-Level Security (FLS) deployment package created!');
console.log(`📦 File: salesforce/connector-fls-deploy.zip`);
console.log('');
console.log('📋 Next steps:');
console.log('   1. Go to: https://workbench.developerforce.com/login.php');
console.log('   2. Login to your Salesforce org');
console.log('   3. Go to: Migration → Deploy');
console.log('   4. Upload: salesforce/connector-fls-deploy.zip');
console.log('   5. Check "Allow Missing Files" and "Single Package"');
console.log('   6. Click "Next" → "Deploy"');
console.log('   7. Once succeeded, all custom fields will be instantly visible!');
