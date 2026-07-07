const fs = require('fs');
let code = fs.readFileSync('src/services/api.ts', 'utf8');

const oldGetLeads = `getLeads: async (): Promise<any[]> => {
    try {
      const token = await getSalesforceToken();
      const query = encodeURIComponent(
        \`SELECT Id, FirstName, LastName, MobilePhone, Email, Status, City, State, PostalCode, CreatedDate,
         Loan_Amount__c, Property_Type__c, Employment_Type__c, Tenure__c,
         Property_City__c, Current_Step__c, Application_Status__c, Connector__c
         FROM Lead ORDER BY CreatedDate DESC\`
      );
      const res = await fetch(\`\${getInstanceUrl()}/services/data/v59.0/query?q=\${query}\`, {`;

const newGetLeads = `getLeads: async (connectorId?: string): Promise<any[]> => {
    try {
      const token = await getSalesforceToken();
      const whereClause = connectorId ? \`WHERE Connector__c = '\${connectorId}'\` : '';
      const query = encodeURIComponent(
        \`SELECT Id, FirstName, LastName, MobilePhone, Email, Status, City, State, PostalCode, CreatedDate,
         Loan_Amount__c, Property_Type__c, Employment_Type__c, Tenure__c,
         Property_City__c, Current_Step__c, Application_Status__c, Connector__c
         FROM Lead \${whereClause} ORDER BY CreatedDate DESC\`
      );
      const res = await fetch(\`\${getInstanceUrl()}/services/data/v59.0/query?q=\${query}\`, {`;

code = code.replace(oldGetLeads, newGetLeads);
fs.writeFileSync('src/services/api.ts', code);
console.log('Fixed getLeads!');
