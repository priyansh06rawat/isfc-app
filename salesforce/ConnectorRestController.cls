@RestResource(urlMapping='/v1/connector/*')
global class ConnectorRestController {

    @HttpPost
    global static void doPost() {
        RestRequest req  = RestContext.request;
        RestResponse res = RestContext.response;
        res.addHeader('Content-Type', 'application/json');
        String uri  = req.requestURI;
        String body = req.requestBody != null ? req.requestBody.toString() : '{}';
        
        if (uri.endsWith('/otp/request')) {
            Map<String,Object> data = (Map<String,Object>) JSON.deserializeUntyped(body);
            handleOtpRequest(data, res);
        } else if (uri.endsWith('/otp/verify')) {
            Map<String,Object> data = (Map<String,Object>) JSON.deserializeUntyped(body);
            handleOtpVerify(data, res);
        } else if (uri.endsWith('/signup')) {
            handleSignup(body, res);
        } else {
            res.statusCode = 404;
            res.responseBody = Blob.valueOf('{"success":false,"message":"Not found"}');
        }
    }

    @HttpGet
    global static void doGet() {
        RestRequest req  = RestContext.request;
        RestResponse res = RestContext.response;
        res.addHeader('Content-Type', 'application/json');
        String uri = req.requestURI;
        
        if (uri.contains('/profile/')) {
            String connectorId = uri.substring(uri.lastIndexOf('/') + 1);
            handleFetchProfile(connectorId, res);
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

    private static void handleSignup(String bodyStr, RestResponse res) {
        if (String.isBlank(bodyStr)) {
            res.statusCode = 400;
            res.responseBody = Blob.valueOf('{"success":false,"message":"Body required"}');
            return;
        }
        Wrapper jsonBody = (Wrapper) JSON.deserialize(bodyStr, Wrapper.class);
        if (jsonBody.Process == null || jsonBody.Process == '') {
            res.statusCode = 406;
            res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Please Share Process Type (eg. softsignup/registered)"}');
            return;
        }
        
        if (jsonBody.Process == 'emailupdate') {
            handleEmailUpdate(jsonBody, res);
        } else if (jsonBody.Process == 'lomobileupdate') {
            handleLoMobileUpdate(jsonBody, res);
        } else if (jsonBody.Process == 'mobileupdate') {
            handleMobileUpdate(jsonBody, res);
        } else if (jsonBody.Process == 'notificationupdate') {
            handleNotificationUpdate(jsonBody, res);
        } else if (jsonBody.Process == 'profilepicsupdate') {
            handleProfilePicsUpdate(jsonBody, res);
        } else if (jsonBody.Process == 'profileupdate') {
            handleProfileUpdate(jsonBody, res);
        } else if (jsonBody.Process == 'softsignup') {
            handleSoftSignup(jsonBody, res);
        } else if (jsonBody.Process == 'registration') {
            handleRegistration(jsonBody, res);
        } else if (jsonBody.Process == 'FetchMasterData') {
            handleFetchMasterData(res);
        } else if (jsonBody.Process == 'FetchProfile') {
            handleFetchProfile(jsonBody.ConnectorID, res);
        } else {
            res.statusCode = 400;
            res.responseBody = Blob.valueOf('{"success":false,"message":"Invalid Process"}');
        }
    }

    private static void handleEmailUpdate(Wrapper jsonBody, RestResponse res) {
        if (jsonBody.Email != null && jsonBody.Email != '' && jsonBody.Email.lastIndexOf('@') != -1 && jsonBody.Email.lastIndexOf('.') != -1) {
            Integer apos = jsonBody.Email.lastIndexOf('@');
            Integer dotpos = jsonBody.Email.lastIndexOf('.');
            if (apos > dotpos) {
                res.statusCode = 410;
                res.responseBody = Blob.valueOf('{"success":false, "status":410,"errorMessages":"Please share valid Email."}');
                return;
            }
            if (jsonBody.Email.substring(apos+1, dotpos) != 'indiashelter') {
                Connector__c[] recordList = [Select Id, Email__c from Connector__c WHERE ConnectorID__c = :jsonBody.ConnectorID LIMIT 1];
                if (recordList.size() > 0) {
                    Connector__c connector = recordList[0];
                    try {
                        connector.Email__c = jsonBody.Email;
                        update connector;
                        res.statusCode = 200;
                        res.responseBody = Blob.valueOf('{"success":true, "status":200,"Connector ID":"' + jsonBody.ConnectorID + '","Message":"Connector has been updated successfully."}');
                    } catch (Exception e) {
                        res.statusCode = 410;
                        res.responseBody = Blob.valueOf('{"success":false, "status":410,"Message":"Please Fill record Properly"}');
                    }
                } else {
                    res.statusCode = 406;
                    res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "User are not Registered with us!"}');
                }
            } else {
                res.statusCode = 410;
                res.responseBody = Blob.valueOf('{"success":false, "status":410,"errorMessages":"Email must not be an indiashelter account"}');
            }
        } else {
            res.statusCode = 406;
            res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Please share Email!"}');
        }
    }

    private static void handleLoMobileUpdate(Wrapper jsonBody, RestResponse res) {
        if (jsonBody.LOMobile != Null && jsonBody.LOMobile != '') {
            Connector__c[] recordList = [Select Id, LO_Mobile__c from Connector__c WHERE ConnectorID__c = :jsonBody.ConnectorID LIMIT 1];
            if (recordList.size() > 0) {
                Connector__c connector = recordList[0];
                try {
                    connector.LO_Mobile__c = jsonBody.LOMobile;
                    String searchTerm = '%' + jsonBody.LOMobile;
                    Contact[] contactList = [SELECT Id FROM Contact WHERE Mobile__c like :searchTerm LIMIT 1];
                    if (contactList.size() > 0) {
                        connector.LoanOfficerContact__c = contactList[0].Id;
                    }
                    update connector;
                    res.statusCode = 200;
                    res.responseBody = Blob.valueOf('{"success":true, "status":200,"Connector ID":"' + jsonBody.ConnectorID + '","Message":"Connector has been updated successfully."}');
                } catch (Exception e) {
                    res.statusCode = 410;
                    res.responseBody = Blob.valueOf('{"success":false, "status":410,"Message":"Please Fill record Properly"}');
                }
            } else {
                res.statusCode = 406;
                res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "User are not Registered with us!"}');
            }
        } else {
            res.statusCode = 406;
            res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Plese share lo mobile!"}');
        }
    }

    private static void handleMobileUpdate(Wrapper jsonBody, RestResponse res) {
        if (jsonBody.Mobile != Null && jsonBody.Mobile != '') {
            Connector__c[] recordList = [Select Id, Mobile__c from Connector__c WHERE ConnectorID__c = :jsonBody.ConnectorID LIMIT 1];
            if (recordList.size() > 0) {
                Connector__c connector = recordList[0];
                try {
                    connector.Mobile__c = jsonBody.Mobile;
                    update connector;
                    res.statusCode = 200;
                    res.responseBody = Blob.valueOf('{"success":true, "status":200,"Connector ID":"' + jsonBody.ConnectorID + '","Message":"Connector has been updated successfully."}');
                } catch (Exception e) {
                    res.statusCode = 410;
                    res.responseBody = Blob.valueOf('{"success":false, "status":410,"Message":"Please Fill record Properly"}');
                }
            } else {
                res.statusCode = 406;
                res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "User are not Registered with us!"}');
            }
        } else {
            res.statusCode = 406;
            res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Plese share mobile!"}');
        }
    }

    private static void handleNotificationUpdate(Wrapper jsonBody, RestResponse res) {
        if (jsonBody.NotificationEnable != Null) {
            Connector__c[] recordList = [Select Id, NotificationEnable__c from Connector__c WHERE ConnectorID__c = :jsonBody.ConnectorID LIMIT 1];
            if (recordList.size() > 0) {
                Connector__c connector = recordList[0];
                try {
                    connector.NotificationEnable__c = jsonBody.NotificationEnable;
                    update connector;
                    res.statusCode = 200;
                    res.responseBody = Blob.valueOf('{"success":true, "status":200,"Connector ID":"' + jsonBody.ConnectorID + '","Message":"Connector has been updated successfully."}');
                } catch (Exception e) {
                    res.statusCode = 410;
                    res.responseBody = Blob.valueOf('{"success":false, "status":410,"Message":"Please Fill record Properly"}');
                }
            } else {
                res.statusCode = 406;
                res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "User are not Registered with us!"}');
            }
        } else {
            res.statusCode = 406;
            res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Plese share notification flag!"}');
        }
    }

    private static void handleProfilePicsUpdate(Wrapper jsonBody, RestResponse res) {
        if (jsonBody.Profile != Null && jsonBody.Profile != '') {
            Connector__c[] recordList = [Select Id, Profile__c from Connector__c WHERE ConnectorID__c = :jsonBody.ConnectorID LIMIT 1];
            if (recordList.size() > 0) {
                Connector__c connector = recordList[0];
                try {
                    connector.Profile__c = jsonBody.Profile;
                    update connector;
                    res.statusCode = 200;
                    res.responseBody = Blob.valueOf('{"success":true, "status":200,"Connector ID":"' + jsonBody.ConnectorID + '","Message":"Connector has been updated successfully."}');
                } catch (Exception e) {
                    res.statusCode = 410;
                    res.responseBody = Blob.valueOf('{"success":false, "status":410,"Message":"Please Fill record Properly"}');
                }
            } else {
                res.statusCode = 406;
                res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "User are not Registered with us!"}');
            }
        } else {
            res.statusCode = 406;
            res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Plese share Profile Image!"}');
        }
    }

    private static void handleProfileUpdate(Wrapper jsonBody, RestResponse res) {
        if (jsonBody.Name != Null && jsonBody.Name != '') {
            if (jsonBody.Mobile != Null && jsonBody.Mobile != '') {
                Connector__c[] recordList = [Select Id, ID__c, LO_Mobile__c, Profile__c, ConnectorID__c, OTP__c, Status__c, LeadStatus__c, OTPStatus__c, Mobile__c, PAN__c, AddressProofDocument__c, AddressProofNumber__c, AddressProofType__c, Bank__c, BankAccount__c, Branch__c, ChequeDocument__c, Company__c, CompanyGST__c, CompanyPAN__c, ConnectorType__c, IDProofDocument__c, IDProofNumber__c, IDProofType__c, IFSC__c, Landmark__c, Name__c, NameInBank__c, NotificationEnable__c, Occupation__c, OccupationYear__c, OfficeAddress__c, Pincode__c, ResidentialAddress__c, Tieup__c, verifiedLO__c, verifiedTermsCondition__c 
                                             from Connector__c WHERE ConnectorID__c = :jsonBody.ConnectorID LIMIT 1];
                if (recordList.size() > 0) {
                    Connector__c connector = recordList[0];
                    if (jsonBody.Name != null) connector.Name__c = jsonBody.Name;
                    if (jsonBody.ResidentialAddress != null) connector.ResidentialAddress__c = jsonBody.ResidentialAddress;
                    if (jsonBody.Pincode != null) connector.Pincode__c = jsonBody.Pincode;
                    if (jsonBody.Landmark != null) connector.Landmark__c = jsonBody.Landmark;
                    if (jsonBody.Email != null) connector.Email__c = jsonBody.Email;
                    if (jsonBody.BankAccount != null) connector.BankAccount__c = jsonBody.BankAccount;
                    if (jsonBody.NameInBank != null) connector.NameInBank__c = jsonBody.NameInBank;
                    if (jsonBody.ISFC != null) connector.IFSC__c = jsonBody.ISFC;
                    if (jsonBody.Branch != null) connector.Branch__c = jsonBody.Branch;
                    if (jsonBody.ConnectorType != null) connector.ConnectorType__c = jsonBody.ConnectorType;
                    if (jsonBody.Company != null) connector.Company__c = jsonBody.Company;
                    if (jsonBody.CompanyGST != null) connector.CompanyGST__c = jsonBody.CompanyGST;
                    if (jsonBody.CompanyPAN != null) connector.CompanyPAN__c = jsonBody.CompanyPAN;
                    if (jsonBody.Occupation != null) connector.Occupation__c = jsonBody.Occupation;
                    if (jsonBody.OccupationYear != null) connector.OccupationYear__c = jsonBody.OccupationYear;
                    if (jsonBody.Tieup != null) connector.Tieup__c = jsonBody.Tieup;
                    if (jsonBody.IDProofType != null) connector.IDProofType__c = jsonBody.IDProofType;
                    if (jsonBody.IDProofAddress != null) connector.IDProofNumber__c = jsonBody.IDProofAddress;
                    if (jsonBody.IDProofDocument != null) connector.IDProofDocument__c = jsonBody.IDProofDocument;
                    if (jsonBody.AddressProofType != null) connector.AddressProofType__c = jsonBody.AddressProofType;
                    if (jsonBody.AddressProofNumber != null) connector.AddressProofNumber__c = jsonBody.AddressProofNumber;
                    if (jsonBody.AddressProofDocument != null) connector.AddressProofDocument__c = jsonBody.AddressProofDocument;
                    if (jsonBody.OfficeAddressPincode != null) connector.OfficeAddresPincode__c = jsonBody.OfficeAddressPincode;
                    if (jsonBody.OfficeAddressLandmark != null) connector.OfficeAddresLanmark__c = jsonBody.OfficeAddressLandmark;
                    if (jsonBody.Profile != null) connector.Profile__c = jsonBody.Profile;
                    if (jsonBody.AlternativeMobile != null) connector.Alternative_Mobile__c = jsonBody.AlternativeMobile;
                    if (jsonBody.LOMobile != null) {
                        connector.LO_Mobile__c = jsonBody.LOMobile;
                        String searchTerm = '%' + jsonBody.LOMobile;
                        Contact[] contactList = [SELECT Id FROM Contact WHERE Mobile__c like :searchTerm LIMIT 1];
                        if (contactList.size() > 0) {
                            connector.LoanOfficerContact__c = contactList[0].Id;
                        }
                    }
                    if (jsonBody.Bank != null) connector.Bank__c = jsonBody.Bank;
                    if (jsonBody.ChequeDocument != null) connector.ChequeDocument__c = jsonBody.ChequeDocument;
                    if (jsonBody.OfficeAddress != null) connector.OfficeAddress__c = jsonBody.OfficeAddress;
                    if (jsonBody.VerifiedLO != null) connector.verifiedLO__c = jsonBody.VerifiedLO;
                    if (jsonBody.AcceptTermsCondition != null) connector.verifiedTermsCondition__c = jsonBody.AcceptTermsCondition;
                    
                    if (jsonBody.ChequeDocument != null && jsonBody.IDProofType != null && jsonBody.IDProofDocument != null && jsonBody.IDProofAddress != null && jsonBody.AddressProofType != null && jsonBody.AddressProofDocument != null && jsonBody.AddressProofNumber != null) {
                        connector.Status__c = 'KYC Initiate';
                        connector.LeadStatus__c = 'KYC Initiate';
                    }
                    try {
                        update connector;
                        res.statusCode = 200;
                        res.responseBody = Blob.valueOf('{"success":true, "status":200,"Connector ID":"' + jsonBody.ConnectorID + '","Message":"Connector has been updated successfully."}');
                    } catch (Exception e) {
                        res.statusCode = 410;
                        res.responseBody = Blob.valueOf('{"success":false, "status":410,"Message":"Please Fill record Properly"}');
                    }
                } else {
                    res.statusCode = 406;
                    res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "User are not Registered with us!"}');
                }
            } else {
                res.statusCode = 406;
                res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Please Share Mobile Number"}');
            }
        } else {
            res.statusCode = 406;
            res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Please Share Name"}');
        }
    }

    private static void handleSoftSignup(Wrapper jsonBody, RestResponse res) {
        if (jsonBody.Name != Null && jsonBody.Name != '') {
            if (jsonBody.Mobile != Null && jsonBody.Mobile != '') {
                String searchTerm = '%' + jsonBody.Mobile;
                Contact[] contacts = [select Mobile__C from Contact where Mobile__C like :searchTerm];
                if (contacts.size() > 0) {
                    res.statusCode = 410;
                    res.responseBody = Blob.valueOf('{"success":false, "status":410,"errorMessages":"Mobile Number blacklisted."}');
                    return;
                }
                if (jsonBody.Email != Null && jsonBody.Email != '' && jsonBody.Email.lastIndexOf('@') != -1 && jsonBody.Email.lastIndexOf('.') != -1) {
                    Integer apos = jsonBody.Email.lastIndexOf('@');
                    Integer dotpos = jsonBody.Email.lastIndexOf('.');
                    if (apos > dotpos) {
                        res.statusCode = 410;
                        res.responseBody = Blob.valueOf('{"success":false, "status":410,"errorMessages":"Please share valid Email."}');
                        return;
                    }
                    if (jsonBody.Email.substring(apos+1, dotpos) == 'indiashelter') {
                        res.statusCode = 410;
                        res.responseBody = Blob.valueOf('{"success":false, "status":410,"errorMessages":"Email must not be a indiashelter account"}');
                        return;
                    }
                    Connector__c[] recordList = [Select ID__C, LeadStatus__c, ConnectorID__c from Connector__c WHERE Mobile__c = :jsonBody.Mobile LIMIT 1];
                    if (recordList.size() == 0) {
                        String connectorID = GenerateRandomNumber(10);
                        Connector__c connector = new Connector__c();
                        connector.Name__c = jsonBody.Name;
                        connector.Mobile__c = jsonBody.Mobile;
                        connector.Email__c = jsonBody.Email;
                        connector.ConnectorID__c = connectorID;
                        if (jsonBody.DeviceID != null) connector.DeviceID__c = jsonBody.DeviceID;
                        if (jsonBody.NotificationId != null) connector.NotificationId__c = jsonBody.NotificationId;
                        if (jsonBody.NotificationEnable != null) connector.NotificationEnable__c = jsonBody.NotificationEnable;
                        connector.Status__c = 'Inactive';
                        connector.LeadStatus__c = 'Inactive';
                        try {
                            insert connector;
                            res.statusCode = 200;
                            res.responseBody = Blob.valueOf('{"success":true, "status":200,"Connector ID":"' + connectorID + '","Message":"Connector has been created."}');
                        } catch (Exception e) {
                            res.statusCode = 410;
                            res.responseBody = Blob.valueOf('{"success":false, "status":410,"errorMessages":"Please Fill record Properly"}');
                        }
                    } else {
                        Connector__c existing = recordList[0];
                        if (existing.LeadStatus__c == 'Inactive') {
                            res.statusCode = 200;
                            res.responseBody = Blob.valueOf('{"success":true, "status":200,"Connector ID":"' + existing.ConnectorID__c + '","Message":"Connector has been created."}');
                        } else {
                            res.statusCode = 406;
                            res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "User Already Registered with given Email Or Mobile!"}');
                        }
                    }
                } else {
                    res.statusCode = 410;
                    res.responseBody = Blob.valueOf('{"success":false, "status":410,"errorMessages":"Invalid Email."}');
                }
            } else {
                res.statusCode = 406;
                res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Please Share Mobile Number"}');
            }
        } else {
            res.statusCode = 406;
            res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Please Share Name"}');
        }
    }

    private static void handleRegistration(Wrapper jsonBody, RestResponse res) {
        if (jsonBody.Name == Null || jsonBody.Name == '') {
            res.statusCode = 406; res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Please Share Name"}'); return;
        }
        if (jsonBody.Mobile == Null || jsonBody.Mobile == '') {
            res.statusCode = 406; res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Please Share Mobile Number"}'); return;
        }
        if (jsonBody.PAN == Null || jsonBody.PAN == '') {
            res.statusCode = 406; res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Please Share PAN Number"}'); return;
        }
        if (jsonBody.ResidentialAddress == Null || jsonBody.ResidentialAddress == '') {
            res.statusCode = 406; res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Please Share Residential Address"}'); return;
        }
        if (jsonBody.Pincode == Null || jsonBody.Pincode == '') {
            res.statusCode = 406; res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Please Share Pincode"}'); return;
        }
        if (jsonBody.Landmark == Null || jsonBody.Landmark == '') {
            res.statusCode = 406; res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Please Share Landmark"}'); return;
        }
        if (jsonBody.Branch == Null || jsonBody.Branch == '') {
            res.statusCode = 406; res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Please Share Branch"}'); return;
        }
        if (jsonBody.ConnectorType == Null || jsonBody.ConnectorType == '') {
            res.statusCode = 406; res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Please Share Connector Type"}'); return;
        }
        if (jsonBody.OfficeAddress == Null || jsonBody.OfficeAddress == '') {
            res.statusCode = 406; res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Please Share Office Address"}'); return;
        }
        if (jsonBody.BankAccount == Null || jsonBody.BankAccount == '') {
            res.statusCode = 406; res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Please Share Bank Account Number"}'); return;
        }
        if (jsonBody.NameInBank == Null || jsonBody.NameInBank == '') {
            res.statusCode = 406; res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Please Share Name as Per Bank Account"}'); return;
        }
        if (jsonBody.ISFC == Null || jsonBody.ISFC == '') {
            res.statusCode = 406; res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "Please Share ISFC"}'); return;
        }
        
        Connector__c[] recordList = [Select ID__C from Connector__c WHERE Mobile__c = :jsonBody.Mobile LIMIT 1];
        if (recordList.size() == 0) {
            String connectorID = GenerateRandomNumber(10);
            Connector__c connector = new Connector__c();
            connector.Name__c = jsonBody.Name;
            connector.PAN__c = jsonBody.PAN;
            connector.Mobile__c = jsonBody.Mobile;
            connector.ResidentialAddress__c = jsonBody.ResidentialAddress;
            connector.Pincode__c = jsonBody.Pincode;
            connector.Landmark__c = jsonBody.Landmark;
            connector.Email__c = jsonBody.Email;
            connector.BankAccount__c = jsonBody.BankAccount;
            connector.NameInBank__c = jsonBody.NameInBank;
            connector.IFSC__c = jsonBody.ISFC;
            connector.ConnectorID__c = connectorID;
            if (jsonBody.Branch != null) connector.Branch__c = jsonBody.Branch;
            if (jsonBody.ConnectorType != null) connector.ConnectorType__c = jsonBody.ConnectorType;
            if (jsonBody.Company != null) connector.Company__c = jsonBody.Company;
            if (jsonBody.CompanyGST != null) connector.CompanyGST__c = jsonBody.CompanyGST;
            if (jsonBody.CompanyPAN != null) connector.CompanyPAN__c = jsonBody.CompanyPAN;
            if (jsonBody.Occupation != null) connector.Occupation__c = jsonBody.Occupation;
            if (jsonBody.OccupationYear != null) connector.OccupationYear__c = jsonBody.OccupationYear;
            if (jsonBody.Tieup != null) connector.Tieup__c = jsonBody.Tieup;
            if (jsonBody.IDProofType != null) connector.IDProofType__c = jsonBody.IDProofType;
            if (jsonBody.IDProofAddress != null) connector.IDProofNumber__c = jsonBody.IDProofAddress;
            if (jsonBody.IDProofDocument != null) connector.IDProofDocument__c = jsonBody.IDProofDocument;
            if (jsonBody.AddressProofType != null) connector.AddressProofType__c = jsonBody.AddressProofType;
            if (jsonBody.AddressProofNumber != null) connector.AddressProofNumber__c = jsonBody.AddressProofNumber;
            if (jsonBody.AddressProofDocument != null) connector.AddressProofDocument__c = jsonBody.AddressProofDocument;
            if (jsonBody.Bank != null) connector.Bank__c = jsonBody.Bank;
            if (jsonBody.ChequeDocument != null) connector.ChequeDocument__c = jsonBody.ChequeDocument;
            if (jsonBody.OfficeAddress != null) connector.OfficeAddress__c = jsonBody.OfficeAddress;
            if (jsonBody.DeviceID != null) connector.DeviceID__c = jsonBody.DeviceID;
            if (jsonBody.NotificationId != null) connector.NotificationId__c = jsonBody.NotificationId;
            if (jsonBody.NotificationEnable != null) connector.NotificationEnable__c = jsonBody.NotificationEnable;
            if (jsonBody.OfficeAddressPincode != null) connector.OfficeAddresPincode__c = jsonBody.OfficeAddressPincode;
            if (jsonBody.OfficeAddressLandmark != null) connector.OfficeAddresLanmark__c = jsonBody.OfficeAddressLandmark;
            if (jsonBody.AlternativeMobile != null) connector.Alternative_Mobile__c = jsonBody.AlternativeMobile;
            if (jsonBody.LOMobile != null) connector.LO_Mobile__c = jsonBody.LOMobile;
            
            connector.Status__c = 'Register';
            connector.LeadStatus__c = 'Register';
            try {
                insert connector;
                res.statusCode = 200;
                res.responseBody = Blob.valueOf('{"success":true, "status":200,"Connector ID":"' + connectorID + '","Message":"Connector has been created."}');
            } catch (Exception e) {
                res.statusCode = 410;
                res.responseBody = Blob.valueOf('{"success":false, "status":410,"errorMessages":"Please Fill record Properly"}');
            }
        } else {
            res.statusCode = 406;
            res.responseBody = Blob.valueOf('{"success":false, "status":"406", "errorMessages": "User Already Registered with given Email Or Mobile!"}');
        }
    }

    private static void handleFetchMasterData(RestResponse res) {
        MasterData masters = new MasterData();
        masters.branchList = getBranchPickListValuesIntoList();
        
        AggregateResult[] results = [SELECT count(Id), CITY_NAME__c FROM NucleusStateCity__c GROUP BY CITY_NAME__c];
        for (AggregateResult result : results) {
            if (result.get('CITY_NAME__c') != null) {
                masters.cityList.add((String) result.get('CITY_NAME__c'));    
            }
        }
        if (masters.cityList.size() == 0) {
            masters.cityList = new List<String>{'Delhi','Gurgoan','Noida','Greater Noida'};
        }
        
        results = [SELECT count(Id), Name FROM Bank_Detail__c GROUP BY Name];
        for (AggregateResult result : results) {
            masters.bankList.add((String) result.get('Name'));
        }
        if (masters.bankList.size() == 0) {
            masters.bankList = new List<String>{'ICICI','SBI','IDFC','HDFC'};
        }
        
        masters.occupationList = getOccupationPickListValuesIntoList();
        masters.loanPurposeList = getLoanPurposePickListValuesIntoList();
        masters.yearsList = new List<String>{'1 Year','2 Years','3 Years','4 Years','5 Years','6 Years','7 Years','8 Years','9 Years','10 Years','more then 10 years'};
        masters.identityProofList = getIdentityPickListValuesIntoList();
        masters.addressProofList = new List<String>{'PAN','Passport','Voter ID','Driving License','Aadhar'};
        
        res.statusCode = 200;
        res.responseBody = Blob.valueOf('{"success":true, "status":"200", "masterdata": ' + JSON.serialize(masters) + '}');
    }

    private static void handleFetchProfile(String connectorId, RestResponse res) {
        if (String.isBlank(connectorId)) {
            res.statusCode = 400;
            res.responseBody = Blob.valueOf('{"success":false,"message":"Connector ID is required"}');
            return;
        }
        Connector__c[] records = [Select Name, ID__c,Email__c, ConnectorID__c,Profile__c, OTP__c, Status__c,LeadStatus__c, Mobile__c, PAN__c, NotificationId__c, AddressProofDocument__c, AddressProofNumber__c, AddressProofType__c, Bank__c, BankAccount__c, Branch__c, ChequeDocument__c, Company__c, CompanyGST__c, CompanyPAN__c, ConnectorType__c, IDProofDocument__c, IDProofNumber__c, IDProofType__c, IFSC__c, Landmark__c, Name__c, NameInBank__c, NotificationEnable__c, Occupation__c, OccupationYear__c, OfficeAddress__c, Pincode__c, ResidentialAddress__c, Tieup__c,OfficeAddresPincode__c,OfficeAddresLanmark__c,LO_Mobile__c 
                                   from Connector__C
                                   where ConnectorID__c = :connectorId LIMIT 1];
        if (records.size() == 0) {
            res.statusCode = 404;
            res.responseBody = Blob.valueOf('{"success":false,"message":"Profile not found"}');
            return;
        }
        Connector__c result = records[0];
        if (result.Profile__c != null) {
            String profileUrl = GenerateAWSDocumentPublicURL(result.Profile__c, result.ConnectorID__c);
            result.Profile__c = profileUrl;
        }
        res.statusCode = 200;
        res.responseBody = Blob.valueOf(JSON.serialize(result));
    }

    public static String GenerateAWSDocumentPublicURL(String url, String ConnectorID){        
        String fileName = 'KYCDocument/' + ConnectorID + '/' + url.substring(url.lastIndexOf('/') + 1);
        Date gmtDate = Datetime.now().dateGmt();
        Time gmtTime = Datetime.now().timeGmt();
        DateTime currentDate = DateTime.newInstance(gmtDate, gmtTime);
        
        List<connectorintegrationconfig__c> listdedupe = [select fcmserverkey__c,s3secretKey__c,s3secretId__c,s3bucket__c,s3region__c,s3exipredFormat__c from connectorintegrationconfig__c];
        if (listdedupe != null && listdedupe.size() > 0) {
            String awsKey = listdedupe.get(0).s3secretKey__c;
            String awsSecret = listdedupe.get(0).s3secretId__c;
            String bucketName = listdedupe.get(0).s3bucket__c;
            String region = listdedupe.get(0).s3region__c;
            string exipredFormat = listdedupe.get(0).s3exipredFormat__c;
            String todayformat = currentDate.format('yyyyMMdd');
            String key = 'AWS4' + awsSecret;
            Blob DateKey = Crypto.generateMac('hmacSHA256', Blob.valueOf(todayformat), Blob.valueOf(key));
            Blob DateRegionKey = Crypto.generateMac('hmacSHA256', Blob.valueOf(region), DateKey);
            Blob DateRegionServiceKey = Crypto.generateMac('hmacSHA256', Blob.valueOf('s3'), DateRegionKey);
            Blob SigningKey = Crypto.generateMac('hmacSHA256', Blob.valueOf('aws4_request'), DateRegionServiceKey);
            
            String canonical = 'GET\n' + '/' + fileName + '\n' + 'X-Amz-Algorithm=AWS4-HMAC-SHA256&' + 'X-Amz-Credential=' + awsKey + '%2F' + todayformat + '%2F' + region + '%2Fs3%2Faws4_request&' + 'X-Amz-Date=' + todayformat + 'T' + currentDate.format('HHmmss') + 'Z&' + 'X-Amz-Expires=' + exipredFormat + '&X-Amz-SignedHeaders=host\n' + 'host:' + bucketName + '.s3.amazonaws.com\n\n' + 'host\n' + 'UNSIGNED-PAYLOAD';
            Blob canonicalsign = Crypto.generateDigest('SHA-256', Blob.valueOf(canonical));
            Blob StringToSign = Blob.valueOf('AWS4-HMAC-SHA256\n' + todayformat + 'T' + currentDate.format('HHmmss') + 'Z' + '\n' + todayformat + '/' + region + '/s3/aws4_request\n' + EncodingUtil.convertToHex(canonicalsign));
            Blob bsig = Crypto.generateMac('hmacSHA256', StringToSign, SigningKey);
            url = 'https://' + bucketName + '.s3.amazonaws.com/' + fileName + '?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=' + awsKey + '/' + todayformat + '/' + region + '/s3/aws4_request&X-Amz-Date=' + todayformat + 'T' + currentDate.format('HHmmss') + 'Z&X-Amz-Expires=' + exipredFormat + '&X-Amz-SignedHeaders=host&X-Amz-Signature=' + EncodingUtil.convertToHex(bsig);
        }
        return url;
    }

    public static List<String> getIdentityPickListValuesIntoList(){
        List<String> pickListValuesList = new List<String>();
        Schema.DescribeFieldResult fieldResult = Contact.Identity_Proof__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        for (Schema.PicklistEntry pickListVal : ple) {
            pickListValuesList.add(pickListVal.getLabel());
        }     
        return pickListValuesList;
    }

    public static List<String> getOccupationPickListValuesIntoList(){
        List<String> pickListValuesList = new List<String>();
        Schema.DescribeFieldResult fieldResult = Lead.X8_Occupations__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        for (Schema.PicklistEntry pickListVal : ple) {
            pickListValuesList.add(pickListVal.getLabel());
        }     
        return pickListValuesList;
    }

    public static List<String> getBranchPickListValuesIntoList(){
        List<String> pickListValuesList = new List<String>();
        Schema.DescribeFieldResult fieldResult = Lead.Branch_Name__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        for (Schema.PicklistEntry pickListVal : ple) {
            pickListValuesList.add(pickListVal.getLabel());
        }     
        return pickListValuesList;
    }

    public static List<String> getLoanPurposePickListValuesIntoList(){
        List<String> pickListValuesList = new List<String>();
        Schema.DescribeFieldResult fieldResult = Lead.Purpose_of_Loan_P__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        for (Schema.PicklistEntry pickListVal : ple) {
            if (pickListVal.getLabel() != 'Employee') {
                pickListValuesList.add(pickListVal.getLabel());    
            }
        }     
        return pickListValuesList;
    }

    public static string GenerateRandomNumber(integer length){
        string result = '';
        while (result.length() < length) {
            blob privateKey = crypto.generateAesKey(256);
            string randomString = EncodingUtil.base64Encode(crypto.generateMac('hmacSHA512', privateKey, privateKey));
            result += randomString.replaceAll('[^1-9]', '');
        }
        result = result.substring(0, length);
        return result;
    }

    public class MasterData {
        public List<String> cityList = new List<String>();
        public List<String> loanPurposeList = new List<String>();
        public List<String> branchList = new List<String>();
        public List<String> occupationList = new List<String>();
        public List<String> yearsList = new List<String>();
        public List<String> identityProofList = new List<String>();
        public List<String> addressProofList = new List<String>();
        public List<String> bankList = new List<String>();
    }

    public class Wrapper {
        public String ConnectorID;
        public String Name;
        public String PAN;
        public String Mobile;
        public String AlternativeMobile;
        public String LOMobile;
        public string ResidentialAddress;
        public string Pincode;
        public string Landmark;
        public string Branch;
        public string ConnectorType;
        public string Company;
        public string CompanyPAN;
        public string CompanyGST;
        public string Occupation;
        public String OccupationYear;
        public String Tieup;
        public String Email;
        public String OfficeAddress;
        public string OfficeAddressPincode;
        public string OfficeAddressLandmark;
        public String Profile;
        public String IDProofType;
        public String IDProofAddress;
        public String IDProofDocument;
        public String AddressProofDocument;
        public String AddressProofNumber;
        public String AddressProofType;
        public String Bank;
        public String BankAccount;
        public String NameInBank;
        public String ISFC;
        public String ChequeDocument;
        public String DeviceID;
        public String NotificationId;
        public Boolean NotificationEnable;
        public Boolean VerifiedLO;
        public Boolean AcceptTermsCondition;
        public String Process;
    }
}
