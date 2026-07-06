@RestResource(urlMapping='/v1/connector/*')
global class ConnectorRestController {

    @HttpPost
    global static void doPost() {
        RestRequest req  = RestContext.request;
        RestResponse res = RestContext.response;
        res.addHeader('Content-Type', 'application/json');
        String uri  = req.requestURI;
        String body = req.requestBody != null ? req.requestBody.toString() : '{}';
        Map<String,Object> data = (Map<String,Object>) JSON.deserializeUntyped(body);
        if (uri.endsWith('/otp/request')) {
            handleOtpRequest(data, res);
        } else if (uri.endsWith('/otp/verify')) {
            handleOtpVerify(data, res);
        } else {
            res.statusCode = 404;
            res.responseBody = Blob.valueOf('{"success":false,"message":"Not found"}');
        }
    }

    private static void handleOtpRequest(Map<String,Object> data, RestResponse res) {
        String mobile = (String) data.get('mobile');
        if (String.isBlank(mobile)) {
            res.statusCode = 400;
            res.responseBody = Blob.valueOf('{"success":false,"message":"Mobile required"}');
            return;
        }
        Integer rand = Math.abs(Math.mod(Crypto.getRandomInteger(), 900000)) + 100000;
        String otp = String.valueOf(rand);
        DateTime exp = DateTime.now().addMinutes(5);
        String soql = 'SELECT Id FROM Connector__c WHERE Mobile__c = \'' + String.escapeSingleQuotes(mobile) + '\' LIMIT 1';
        SObject[] existing = Database.query(soql);
        if (existing.size() == 0) {
            SObject rec = Schema.getGlobalDescribe().get('Connector__c').newSObject();
            rec.put('Name', 'Connector-' + mobile);
            rec.put('Mobile__c', mobile);
            rec.put('OTP__c', otp);
            rec.put('OTPExpiredOn__c', exp);
            rec.put('OTPStatus__c', 'Sent');
            rec.put('LeadStatus__c', 'New');
            rec.put('Status__c', 'Pending');
            insert rec;
        } else {
            SObject upd = Schema.getGlobalDescribe().get('Connector__c').newSObject();
            upd.put('Id', existing[0].Id);
            upd.put('OTP__c', otp);
            upd.put('OTPExpiredOn__c', exp);
            upd.put('OTPStatus__c', 'Sent');
            update upd;
        }
        res.statusCode = 200;
        res.responseBody = Blob.valueOf('{"success":true,"message":"OTP sent"}');
    }

    private static void handleOtpVerify(Map<String,Object> data, RestResponse res) {
        String mobile = (String) data.get('mobile');
        String otp    = (String) data.get('otp');
        if (String.isBlank(mobile) || String.isBlank(otp)) {
            res.statusCode = 400;
            res.responseBody = Blob.valueOf('{"success":false,"message":"Mobile and OTP required"}');
            return;
        }
        String soql = 'SELECT Id, Name__c, Mobile__c, Email__c, PAN__c, ConnectorID__c, ConnectorType__c, LeadStatus__c, Status__c, OTP__c, OTPExpiredOn__c, verifiedLO__c, verifiedTermsCondition__c, LO_Id__c, LO_Mobile__c FROM Connector__c WHERE Mobile__c = \'' + String.escapeSingleQuotes(mobile) + '\' LIMIT 1';
        SObject[] records = Database.query(soql);
        if (records.size() == 0) {
            res.statusCode = 404;
            res.responseBody = Blob.valueOf('{"success":false,"message":"Mobile not registered"}');
            return;
        }
        SObject c = records[0];
        String storedOtp = (String) c.get('OTP__c');
        DateTime expiry  = (DateTime) c.get('OTPExpiredOn__c');
        if (storedOtp != otp) {
            res.statusCode = 400;
            res.responseBody = Blob.valueOf('{"success":false,"message":"Invalid OTP"}');
            return;
        }
        if (expiry == null || DateTime.now() > expiry) {
            res.statusCode = 400;
            res.responseBody = Blob.valueOf('{"success":false,"message":"OTP expired"}');
            return;
        }
        SObject upd = Schema.getGlobalDescribe().get('Connector__c').newSObject();
        upd.put('Id', c.Id);
        upd.put('OTP__c', null);
        upd.put('OTPStatus__c', 'Verified');
        update upd;
        Boolean isNew = String.isBlank((String) c.get('Name__c'));
        Map<String,Object> connMap = new Map<String,Object>();
        connMap.put('id',            c.Id);
        connMap.put('connectorId',   c.get('ConnectorID__c'));
        connMap.put('fullName',      c.get('Name__c'));
        connMap.put('mobile',        c.get('Mobile__c'));
        connMap.put('email',         c.get('Email__c'));
        connMap.put('pan',           c.get('PAN__c'));
        connMap.put('connectorType', c.get('ConnectorType__c'));
        connMap.put('leadStatus',    c.get('LeadStatus__c'));
        connMap.put('status',        c.get('Status__c'));
        Map<String,Object> result = new Map<String,Object>();
        result.put('success', true);
        result.put('isNewConnector', isNew);
        result.put('message', 'OTP verified');
        result.put('connector', connMap);
        res.statusCode = 200;
        res.responseBody = Blob.valueOf(JSON.serialize(result));
    }
}
