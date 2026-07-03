/**
 * create-lead-fields-package.js
 * 
 * Generates a Salesforce metadata deployment ZIP containing:
 *   1. Lead.object (custom fields definition for standard Lead object)
 *   2. Admin.profile (visible/editable FLS permissions for System Administrator)
 *   3. package.xml (manifest file)
 * 
 * Uploading this to Workbench (workbench.developerforce.com) will create
 * all 6 loan-related fields on Lead and make them visible to APIs and Apex.
 */

const fs = require('fs');
const path = require('path');

function createZip(files) {
  const entries = [];
  let offset = 0;
  const localHeaders = [];

  for (const [name, content] of files) {
    const nameBytes = Buffer.from(name, 'utf8');
    const dataBytes = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');

    const local = Buffer.alloc(30 + nameBytes.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc32(dataBytes), 14);
    local.writeUInt32LE(dataBytes.length, 18);
    local.writeUInt32LE(dataBytes.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    local.writeUInt16LE(0, 28);
    nameBytes.copy(local, 30);

    localHeaders.push({ name, nameBytes, dataBytes, offset, crc: crc32(dataBytes) });
    entries.push(local, dataBytes);
    offset += local.length + dataBytes.length;
  }

  const centralDir = [];
  let centralSize = 0;
  const centralOffset = offset;

  for (const h of localHeaders) {
    const cd = Buffer.alloc(46 + h.nameBytes.length);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8);
    cd.writeUInt16LE(0, 10);
    cd.writeUInt16LE(0, 12);
    cd.writeUInt16LE(0, 14);
    cd.writeUInt32LE(h.crc, 16);
    cd.writeUInt32LE(h.dataBytes.length, 20);
    cd.writeUInt32LE(h.dataBytes.length, 24);
    cd.writeUInt16LE(h.nameBytes.length, 28);
    cd.writeUInt16LE(0, 30);
    cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34);
    cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(0, 38);
    cd.writeUInt32LE(h.offset, 42);
    h.nameBytes.copy(cd, 46);
    centralDir.push(cd);
    centralSize += cd.length;
  }

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(localHeaders.length, 8);
  eocd.writeUInt16LE(localHeaders.length, 10);
  eocd.writeUInt32LE(centralSize, 12);
  eocd.writeUInt32LE(centralOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...entries, ...centralDir, eocd]);
}

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

// ── 1. Lead Object custom fields definition ─────────────────────────────────
const leadObjectXml = `<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <fields>
        <fullName>Product__c</fullName>
        <label>Product</label>
        <type>Text</type>
        <length>100</length>
        <required>false</required>
    </fields>
    <fields>
        <fullName>Loan_Amount__c</fullName>
        <label>Loan Amount</label>
        <type>Currency</type>
        <precision>18</precision>
        <scale>0</scale>
        <required>false</required>
    </fields>
    <fields>
        <fullName>Property_Value__c</fullName>
        <label>Property Value</label>
        <type>Currency</type>
        <precision>18</precision>
        <scale>0</scale>
        <required>false</required>
    </fields>
    <fields>
        <fullName>Property_Type__c</fullName>
        <label>Property Type</label>
        <type>Text</type>
        <length>100</length>
        <required>false</required>
    </fields>
    <fields>
        <fullName>Tenure__c</fullName>
        <label>Tenure</label>
        <type>Number</type>
        <precision>3</precision>
        <scale>0</scale>
        <required>false</required>
    </fields>
    <fields>
        <fullName>Employment_Type__c</fullName>
        <label>Employment Type</label>
        <type>Text</type>
        <length>100</length>
        <required>false</required>
    </fields>
</CustomObject>`;

// ── 2. Profile permissions for System Administrator ─────────────────────────
const fieldsList = ['Product__c', 'Loan_Amount__c', 'Property_Value__c', 'Property_Type__c', 'Tenure__c', 'Employment_Type__c'];
let profileXml = `<?xml version="1.0" encoding="UTF-8"?>
<Profile xmlns="http://soap.sforce.com/2006/04/metadata">
`;
for (const f of fieldsList) {
  profileXml += `    <fieldPermissions>
        <editable>true</editable>
        <field>Lead.${f}</field>
        <readable>true</readable>
    </fieldPermissions>\n`;
}
profileXml += `</Profile>`;

// ── 3. Package manifest ──────────────────────────────────────────────────────
const packageXml = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>Lead</members>
        <name>CustomObject</name>
    </types>
    <types>
        <members>Admin</members>
        <name>Profile</name>
    </types>
    <version>59.0</version>
</Package>`;

const files = [
  ['objects/Lead.object', leadObjectXml],
  ['profiles/Admin.profile', profileXml],
  ['package.xml', packageXml],
];

const zip = createZip(files);
const outputPath = path.join(__dirname, '..', 'salesforce', 'lead-fields-deploy.zip');
if (!fs.existsSync(path.dirname(outputPath))) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}
fs.writeFileSync(outputPath, zip);

console.log('✅ Lead custom fields deployment package created successfully!');
console.log(`📦 Output ZIP: salesforce/lead-fields-deploy.zip`);
console.log('');
console.log('📋 Next steps:');
console.log('   1. Upload salesforce/lead-fields-deploy.zip to Salesforce Workbench Deploy (Migration -> Deploy)');
console.log('   2. Select "Allow Missing Files" and "Single Package"');
console.log('   3. Deploy!');
