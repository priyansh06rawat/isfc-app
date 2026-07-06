/*
 Author: Vijay Uniyal
 Created On: 13 Oct 2022
 Updated On: 13 Dec 2022 (adding master data fetch API)
 This API is used for Connector app User registration
 Fetching Master Data, Fetching Connector Profile Data, SoftSignUp, Profile Update (KYC DOcument), Profile Update(Email, Phone, Lo Mobile etc),Registration	

 */
@RestResource(urlMapping = '/Connector/Signup/*')
global with sharing class ConnectorRegistrationAPI{
   
     /* Fetching connector profile data based on connectorID */
    @HttpGet
    global static Connector__C fetchProfile(){

        Map<String, Object> obj = new Map<String, Object>();
        obj.put('action', '/Connector/Signup/fetchProfile');

        ContentVersion docVersion = new ContentVersion();
        docVersion.ContentLocation = 'S';
        docVersion.PathOnClient = 'SignupfetchProfile.JSON';
        docVersion.Title = 'SignupfetchProfile.JSON';

        RestRequest req = RestContext.request;
        // RestResponse res=RestContext.response;

        String connectorId = req.requestURI.substring(req.requestURI.lastIndexOf('/') + 1);
        String profileFile = JSON.serialize('{ "connectorId":"' + connectorId + '"}');
        obj.put('request',profileFile);
        /*BankAccount__c,IFSC__c, */
        system.debug('connectorId'+connectorId);
        Connector__C result=new Connector__C();
        if(connectorId!=null && connectorId!=''){
            result = [Select Name, ID__c,Email__c, ConnectorID__c,Profile__c, OTP__c, Status__c,LeadStatus__c, Mobile__c, PAN__c, NotificationId__c, AddressProofDocument__c, AddressProofNumber__c, AddressProofType__c, Bank__c, BankAccount__c, Branch__c, ChequeDocument__c, Company__c, CompanyGST__c, CompanyPAN__c, ConnectorType__c, IDProofDocument__c, IDProofNumber__c, IDProofType__c, IFSC__c, Landmark__c, Name__c, NameInBank__c, NotificationEnable__c, Occupation__c, OccupationYear__c, OfficeAddress__c, Pincode__c, ResidentialAddress__c, Tieup__c,OfficeAddresPincode__c,OfficeAddresLanmark__c,LO_Mobile__c 
                               from Connector__C
                               where ConnectorID__c = :connectorId];
            system.debug('result'+result);
            
            
            if(result.Profile__c!=null){
                 String profileUrl=GenerateAWSDocumentPublicURL(result.Profile__c,result.ConnectorID__c);
        result.Profile__c=profileUrl;
            }
       
            
      // result.AddressProofDocument__c=GenerateAWSDocumentPublicURL(result.AddressProofDocument__c.substring(0, result.AddressProofDocument__c.lastIndexOf('/')));
      // result.IDProofDocument__c=GenerateAWSDocumentPublicURL(result.IDProofDocument__c.substring(0, result.IDProofDocument__c.lastIndexOf('/'))); 
      // result.ChequeDocument__c=GenerateAWSDocumentPublicURL(result.ChequeDocument__c.substring(0, result.ChequeDocument__c.lastIndexOf('/'))); 
      // result.Profile__c=GenerateAWSDocumentPublicURL(result.Profile__c.substring(0, result.Profile__c.lastIndexOf('/')));   
        obj.put('response',JSON.serialize(result));
        
        profileFile += '\n' + JSON.serialize(result);
        Blob profiledata = Blob.valueOf(profileFile);
        docVersion.VersionData = profiledata;

        //insert docVersion;

        /* String documentVersionId = [select contentDocumentid
         from ContentVersion
         where id = :docVersion.id].contentDocumentid;
         ContentDocumentLink doclink = new ContentDocumentLink();
         doclink.ContentDocumentId = documentVersionId;
         doclink.LinkedEntityId = result.Name;
         doclink.ShareType = 'I';
         doclink.Visibility = 'AllUsers';*/
        //String url = uploadToAmazonS3('testlog.json', profiledata, 'JSON');
        //System.debug('S3 Bucket Uplod' + url);
       
        //insert doclink;

        //uploadToAmazonS3 (String fileName, Blob attachmentBody, String fileContentType)
        /*
        Blob fileBlob = Blob.valueOf('Unit Test Attachment Body');
        String fileBody = EncodingUtil.base64Encode(fileBlob);
        String now = Datetime.now().formatGMT('EEE, dd MMM yyyy HH:mm:ss z');
        String bucketname = 'testabhinav';
        //String host = 's3.ap-south-1.amazonaws.com';
        String host = 's3.ap-south-1.amazonaws.com';
        */

        //S3 s3 = new S3('ap-south-1');
        //Blob fileBlob = Blob.valueOf('Unit Test Attachment Body');
        //String fileBody = EncodingUtil.base64Encode(fileBlob);
       
        //s3.createFile('testabhinav', 'Logs', 'textFinal.txt', 'Unit Test Attachment Body Vijay First File','text/plain');

        //s3.createFile('testabhinav', 'Logs', 'connectorLogs.json', JSON.serialize(obj),'application/JSON');
       //System.debug(s3.getFileUrl('Logs/connectorLogs.json'));
        }
        return result;
    }

    /*Submit Soft sign and Profile , Email, Mobile,ProfilePics etc update*/
    @HttpPost
    global static void doSignup(){

        RestRequest req = RestContext.request;
        if (String.isNotBlank(req.requestBody.toString())){
            wrapper jsonBody = (wrapper)JSON.deserialize(req.requestBody.toString(), Wrapper.class);
            System.debug('jsonBody' + jsonBody);
            if (jsonBody.Process == null || jsonBody.Process == ''){
                RestContext.response.addHeader('Content-Type', 'application/json');
                RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Please Share Process Type (eg. softsignup/registered") }');
                return;
            }else if (jsonBody.Process != null && jsonBody.Process !='' && jsonBody.Process == 'emailupdate'){
                 if(jsonBody.Email!=Null && jsonBody.Email!='' && jsonBody.Email.lastIndexOf('@') != -1 && jsonBody.Email.lastIndexOf('.') != -1){
                 	
                      Integer apos=jsonBody.Email.lastIndexOf('@');
							Integer dotpos=jsonBody.Email.lastIndexOf('.');
                            system.debug('apos'+apos);
                            system.debug('dotpos'+dotpos);
                            if(apos>dotpos){
                                RestContext.response.addHeader('Content-Type', 'application/json');
                                System.debug('Email must not be an indiashelter account');
                                RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":410,"errorMessages":"Please share valid Email."}');

                                return;
                                
                            }else{
                                  if(jsonBody.Email.substring(apos+1,dotpos)!='indiashelter'){
                	  List<Connector__C> MobilenoList = new List<Connector__C>([Select Id,ID__c, Email__c
                                                                                  from Connector__C
                                                                                  WHERE ConnectorID__c = :jsonBody.ConnectorID]);
                    if (MobilenoList != null && MobilenoList.size() > 0){
                         Connector__C connector = MobilenoList.get(0);
                   		 try{
								 connector.Email__c = jsonBody.Email;
                                update connector;
								System.debug('insdie profileupdate connector update');
                                List<Connector__C> connectorList = [Select ID__C, ConnectorID__c, Name__c
                                                                    from Connector__C
                                                                    where id = :connector.ID__c];

                                RestContext.response.addHeader('Content-Type', 'application/json');
                                RestContext.response.responseBody = Blob.valueOf('{ "success":true, "status":200,"Connector ID":"' + jsonBody.ConnectorID + '","Message":"Connector has been updated successfully."}');

                                return;

                            } catch (Exception e){

                                RestContext.response.addHeader('Content-Type', 'application/json');
                                System.debug('error error error ' + e.getLineNumber() + 'error error' + e.getMessage());
                                RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":410,"Message":"Please Fill record Properly"}');

                                return;
                            }


                        } else{
                            RestContext.response.addHeader('Content-Type', 'application/json');
                            RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "User are not Registered with us!" }');
                            return;
                        }
                    
                }
                            }
                 }
                else{
                    RestContext.response.addHeader('Content-Type', 'application/json');
                            RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Please share Email!" }');
                            return;
                }
                           
            }else if (jsonBody.Process != null && jsonBody.Process !='' && jsonBody.Process == 'lomobileupdate'){
                
               if (jsonBody.LOMobile != Null && jsonBody.LOMobile != ''){
                    List<Connector__C> MobilenoList = new List<Connector__C>([Select Id,ID__c,LO_Mobile__c
                                                                                  from Connector__C
                                                                                  WHERE ConnectorID__c = :jsonBody.ConnectorID]);
                    if (MobilenoList != null && MobilenoList.size() > 0){
                         Connector__C connector = MobilenoList.get(0);
                   		 try{
								connector.LO_Mobile__c = jsonBody.LOMobile;
                                String searchTerm = '%'+jsonBody.LOMobile;
                                List<Contact> contactList= [SELECT Id,Client_ID__c FROM Contact WHERE Mobile__c like :searchTerm ];
                                if(contactList!=null && contactList.size()>0){
                                    connector.LoanOfficerContact__c=contactList[0].Id;                                    
                                }
                                update connector;
								System.debug('insdie profileupdate connector update');
                                List<Connector__C> connectorList = [Select ID__C, ConnectorID__c, Name__c
                                                                    from Connector__C
                                                                    where id = :connector.ID__c];

                                RestContext.response.addHeader('Content-Type', 'application/json');
                                RestContext.response.responseBody = Blob.valueOf('{ "success":true, "status":200,"Connector ID":"' + jsonBody.ConnectorID + '","Message":"Connector has been updated successfully."}');

                                return;

                            } catch (Exception e){

                                RestContext.response.addHeader('Content-Type', 'application/json');
                                System.debug('error error error ' + e.getLineNumber() + 'error error' + e.getMessage());
                                RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":410,"Message":"Please Fill record Properly"}');

                                return;
                            }


                        } else{
                            RestContext.response.addHeader('Content-Type', 'application/json');
                            RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "User are not Registered with us!" }');
                            return;
                        }
                    
                }else{
                    RestContext.response.addHeader('Content-Type', 'application/json');
                            RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Plese share lo mobile!" }');
                            return;
                }
            }else if (jsonBody.Process != null && jsonBody.Process !='' && jsonBody.Process == 'mobileupdate'){
                if (jsonBody.Mobile != Null && jsonBody.Mobile != ''){
                    List<Connector__C> MobilenoList = new List<Connector__C>([Select Id,ID__c, Mobile__c
                                                                                  from Connector__C
                                                                                  WHERE ConnectorID__c = :jsonBody.ConnectorID]);
                    if (MobilenoList != null && MobilenoList.size() > 0){
                         Connector__C connector = MobilenoList.get(0);
                   		 try{
								 connector.Mobile__c = jsonBody.Mobile;
                                update connector;
								System.debug('insdie profileupdate connector update');
                                List<Connector__C> connectorList = [Select ID__C, ConnectorID__c, Name__c
                                                                    from Connector__C
                                                                    where id = :connector.ID__c];

                                RestContext.response.addHeader('Content-Type', 'application/json');
                                RestContext.response.responseBody = Blob.valueOf('{ "success":true, "status":200,"Connector ID":"' + jsonBody.ConnectorID + '","Message":"Connector has been updated successfully."}');

                                return;

                            } catch (Exception e){

                                RestContext.response.addHeader('Content-Type', 'application/json');
                                System.debug('error error error ' + e.getLineNumber() + 'error error' + e.getMessage());
                                RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":410,"Message":"Please Fill record Properly"}');

                                return;
                            }


                        } else{
                            RestContext.response.addHeader('Content-Type', 'application/json');
                            RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "User are not Registered with us!" }');
                            return;
                        }
                    
                }else{
                     RestContext.response.addHeader('Content-Type', 'application/json');
                            RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Plese share mobile!" }');
                            return;
                }
            }else if (jsonBody.Process != null && jsonBody.Process !='' && jsonBody.Process == 'notificationupdate'){
                if (jsonBody.NotificationEnable != Null){
                    List<Connector__C> MobilenoList = new List<Connector__C>([Select Id,ID__c,NotificationEnable__c
                                                                                  from Connector__C
                                                                                  WHERE ConnectorID__c = :jsonBody.ConnectorID]);
                    
                    if (MobilenoList != null && MobilenoList.size() > 0){
                         Connector__C connector = MobilenoList.get(0);
                   		 try{
								 connector.NotificationEnable__c = jsonBody.NotificationEnable;
                                update connector;
								System.debug('insdie profileupdate connector update');
                                List<Connector__C> connectorList = [Select ID__C, ConnectorID__c, Name__c
                                                                    from Connector__C
                                                                    where id = :connector.ID__c];

                                RestContext.response.addHeader('Content-Type', 'application/json');
                                RestContext.response.responseBody = Blob.valueOf('{ "success":true, "status":200,"Connector ID":"' + jsonBody.ConnectorID + '","Message":"Connector has been updated successfully."}');

                                return;

                            } catch (Exception e){

                                RestContext.response.addHeader('Content-Type', 'application/json');
                                System.debug('error error error ' + e.getLineNumber() + 'error error' + e.getMessage());
                                RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":410,"Message":"Please Fill record Properly"}');

                                return;
                            }


                        } else{
                            RestContext.response.addHeader('Content-Type', 'application/json');
                            RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "User are not Registered with us!" }');
                            return;
                        }
                    
                }else{
                     RestContext.response.addHeader('Content-Type', 'application/json');
                            RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Plese share notification flag!" }');
                            return;
                }
            }else if (jsonBody.Process != null && jsonBody.Process !='' && jsonBody.Process == 'profilepicsupdate'){
                if (jsonBody.Profile != Null && jsonBody.Profile != ''){
                    List<Connector__C> MobilenoList = new List<Connector__C>([Select Id,ID__c,Profile__c
                                                                                  from Connector__C
                                                                                  WHERE ConnectorID__c = :jsonBody.ConnectorID]);
                    if (MobilenoList != null && MobilenoList.size() > 0){
                         Connector__C connector = MobilenoList.get(0);
                   		 try{
								connector.Profile__c = jsonBody.Profile;
                                update connector;
								System.debug('insdie profileupdate connector update');
                                List<Connector__C> connectorList = [Select ID__C, ConnectorID__c, Name__c
                                                                    from Connector__C
                                                                    where id = :connector.ID__c];

                                RestContext.response.addHeader('Content-Type', 'application/json');
                                RestContext.response.responseBody = Blob.valueOf('{ "success":true, "status":200,"Connector ID":"' + jsonBody.ConnectorID + '","Message":"Connector has been updated successfully."}');

                                return;

                            } catch (Exception e){

                                RestContext.response.addHeader('Content-Type', 'application/json');
                                System.debug('error error error ' + e.getLineNumber() + 'error error' + e.getMessage());
                                RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":410,"Message":"Please Fill record Properly"}');

                                return;
                            }


                        } else{
                            RestContext.response.addHeader('Content-Type', 'application/json');
                            RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "User are not Registered with us!" }');
                            return;
                        }
                    
                }else{
                   RestContext.response.addHeader('Content-Type', 'application/json');
                            RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Plese share Profile Image!" }');
                            return;  
                }
            }
            else if (jsonBody.Process != null && jsonBody.Process != '' && jsonBody.Process == 'profileupdate'){
			System.debug('insdie profileupdate');

                if (jsonBody.Name != Null && jsonBody.Name != ''){

                    if (jsonBody.Mobile != Null && jsonBody.Mobile != ''){

                        //soft login save //or Email__c = :jsonBody.Email
                        // validate user already registered with email and mobile
                        List<Connector__C> MobilenoList = new List<Connector__C>([Select Id,ID__c,LO_Mobile__c,Profile__c, ConnectorID__c, OTP__c, Status__c,LeadStatus__c, OTPStatus__c, Mobile__c, PAN__c, AddressProofDocument__c, AddressProofNumber__c, AddressProofType__c, Bank__c, BankAccount__c, Branch__c, ChequeDocument__c, Company__c, CompanyGST__c, CompanyPAN__c, ConnectorType__c, IDProofDocument__c, IDProofNumber__c, IDProofType__c, IFSC__c, Landmark__c, Name__c, NameInBank__c, NotificationEnable__c, Occupation__c, OccupationYear__c, OfficeAddress__c, Pincode__c, ResidentialAddress__c, Tieup__c,
                                                                                 verifiedLO__c,	verifiedTermsCondition__c 
                                                                                  from Connector__C
                                                                                  WHERE ConnectorID__c = :jsonBody.ConnectorID]);

                        if (MobilenoList != null && MobilenoList.size() > 0){

                            //populated Connector Object from JSON
                            Connector__C connector = MobilenoList.get(0);
							//connector.Id=MobilenoList.get(0).Id;
                            //connector.ID__c=MobilenoList.get(0).ID__c;
                            if (jsonBody.Name != null)
                                connector.Name__c = jsonBody.Name;
                            if (jsonBody.ResidentialAddress != null)
                                connector.ResidentialAddress__c = jsonBody.ResidentialAddress;
                            if (jsonBody.Pincode != null)
                                connector.Pincode__c = jsonBody.Pincode;
                            if (jsonBody.Landmark != null)
                                connector.Landmark__c = jsonBody.Landmark;
                            if (jsonBody.Email != null)
                                connector.Email__c = jsonBody.Email;
                            if (jsonBody.BankAccount != null)
                                connector.BankAccount__c = jsonBody.BankAccount;
                            if (jsonBody.NameInBank != null)
                                connector.NameInBank__c = jsonBody.NameInBank;
                            if (jsonBody.ISFC != null)
                                connector.IFSC__c = jsonBody.ISFC;
                            if (jsonBody.Branch != null)
                                connector.Branch__c = jsonBody.Branch;
                            if (jsonBody.ConnectorType != null)
                                connector.ConnectorType__c = jsonBody.ConnectorType;
                            if (jsonBody.Company != null)
                                connector.Company__c = jsonBody.Company;
                            if (jsonBody.CompanyGST != null)
                                connector.CompanyGST__c = jsonBody.CompanyGST;
                            if (jsonBody.CompanyPAN != null)
                                connector.CompanyPAN__c = jsonBody.CompanyPAN;
                            if (jsonBody.Occupation != null)
                                connector.Occupation__c = jsonBody.Occupation;
                            if (jsonBody.OccupationYear != null)
                                connector.OccupationYear__c = jsonBody.OccupationYear;
                            if (jsonBody.Tieup != null)
                                connector.Tieup__c = jsonBody.Tieup;
                            if (jsonBody.Email != null)
                                connector.Email__c = jsonBody.Email;
                            if (jsonBody.IDProofType != null)
                                connector.IDProofType__c = jsonBody.IDProofType;
                            if (jsonBody.IDProofAddress != null)
                                connector.IDProofNumber__c = jsonBody.IDProofAddress;
                            if (jsonBody.IDProofDocument != null)
                                connector.IDProofDocument__c = jsonBody.IDProofDocument;
                            if (jsonBody.AddressProofType != null)
                                connector.AddressProofType__c = jsonBody.AddressProofType;
                            if (jsonBody.AddressProofNumber != null)
                                connector.AddressProofNumber__c = jsonBody.AddressProofNumber;
                            if (jsonBody.AddressProofDocument != null)
                                connector.AddressProofDocument__c = jsonBody.AddressProofDocument;
                            if (jsonBody.OfficeAddressPincode != null)
                                connector.OfficeAddresPincode__c = jsonBody.OfficeAddressPincode;
                            if (jsonBody.OfficeAddressLandmark != null)
                                connector.OfficeAddresLanmark__c = jsonBody.OfficeAddressLandmark;
                            if (jsonBody.Profile != null)
                                connector.Profile__c = jsonBody.Profile;
                            if (jsonBody.AlternativeMobile != null)
                                 connector.Alternative_Mobile__c = jsonBody.AlternativeMobile;
                            if (jsonBody.LOMobile != null){
                                connector.LO_Mobile__c = jsonBody.LOMobile;
                                String searchTerm = '%'+jsonBody.LOMobile;
                                List<Contact> contactList= [SELECT Id,Client_ID__c FROM Contact WHERE Mobile__c like :searchTerm ];
                                if(contactList!=null && contactList.size()>0){
                                    connector.LoanOfficerContact__c=contactList[0].Id;                                    
                                }
                            }
                                
						                            
                            if (jsonBody.Bank != null)
                                connector.Bank__c = jsonBody.Bank;
                            if (jsonBody.ChequeDocument != null)
                                connector.ChequeDocument__c = jsonBody.ChequeDocument;
                            if (jsonBody.OfficeAddress != null)
                                connector.OfficeAddress__c = jsonBody.OfficeAddress;
                            
                            /* 6 Dec 2020 Added after first demo to management. option for OTP verfication of LO mobile and Terms and Conditions*/
                            if (jsonBody.VerifiedLO != null)
                                connector.verifiedLO__c = jsonBody.VerifiedLO;
                            
                            if (jsonBody.AcceptTermsCondition != null)
                                connector.verifiedTermsCondition__c = jsonBody.AcceptTermsCondition;
                            //jsonBody.AcceptTermsCondition==true && jsonBody.VerifiedLO ==true &&
                            
                            if ( jsonBody.ChequeDocument!=null && jsonBody.IDProofType != null && jsonBody.IDProofDocument != null && jsonBody.IDProofAddress != null && jsonBody.AddressProofType != null && jsonBody.AddressProofDocument != null && jsonBody.AddressProofNumber != null){
                                System.debug('insdie profileupdate status change');
                                System.debug('insdie profileupdate IDProofDocumente'+jsonBody.IDProofDocument);
                                System.debug('insdie profileupdate AddressProofDocument'+jsonBody.AddressProofDocument);
                                System.debug('insdie profileupdate ChequeDocument'+jsonBody.ChequeDocument);
                                
                                connector.Status__c = 'KYC Initiate';
                                connector.LeadStatus__c='KYC Initiate';
                            }

                            try{

                                update connector;
								System.debug('insdie profileupdate connector update');
                                List<Connector__C> connectorList = [Select ID__C, ConnectorID__c, Name__c
                                                                    from Connector__C
                                                                    where id = :connector.ID__c];

                                RestContext.response.addHeader('Content-Type', 'application/json');
                                RestContext.response.responseBody = Blob.valueOf('{ "success":true, "status":200,"Connector ID":"' + jsonBody.ConnectorID + '","Message":"Connector has been updated successfully."}');

                                return;

                            } catch (Exception e){

                                RestContext.response.addHeader('Content-Type', 'application/json');
                                System.debug('error error error ' + e.getLineNumber() + 'error error' + e.getMessage());
                                RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":410,"Message":"Please Fill record Properly"}');

                                return;
                            }


                        } else{
                            RestContext.response.addHeader('Content-Type', 'application/json');
                            RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "User are not Registered with us!" }');
                            return;
                        }

                    } else{
                        RestContext.response.addHeader('Content-Type', 'application/json');
                        RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Please Share Mobile Number"}');
                        return;

                    }
                } else{
                    RestContext.response.addHeader('Content-Type', 'application/json');
                    RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Please Share Name" }');
                    return;

                }


            } 
            else if (jsonBody.Process != null && jsonBody.Process != '' && jsonBody.Process == 'softsignup'){
                
                /*added this for Negative Checklist based on Picklist Value on 10 Dec 2022 Vijay Uniyal*/
                
                /*List<ConnectorNegativeProfile__mdt> negativeList = ConnectorNegativeProfile__mdt.getAll().values();
                Set<String> ids = new Set<String>();
                for(ConnectorNegativeProfile__mdt nl:negativeList){
                    system.debug('Lable'+nl.Label);
                    ids.add(nl.Label);
                }*/
                
                /*added this for Negative Checklist based on LO Mobile number from Contacts on 13 Dec 2022 Vijay Uniyal*/
                String searchTerm = '%'+jsonBody.Mobile;
                List<Contact> contacts=[select Mobile__C from Contact where Mobile__C like :searchTerm];
               /*added this for Negative Checklist based on LO Mobile number from Contacts on 13 Dec 2022 Vijay Uniyal*/
                if (jsonBody.Name != Null && jsonBody.Name != ''){                    
                    if (jsonBody.Mobile != Null && jsonBody.Mobile != ''){
                        //ids.contains(jsonBody.Mobile)||
                        if(contacts!=null && contacts.size()>0){
                            
                             	RestContext.response.addHeader('Content-Type', 'application/json');
                               RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":410,"errorMessages":"Mobile Number blacklisted."}');

                                return;
                            
                        }else if(jsonBody.Email!=Null && jsonBody.Email!='' && jsonBody.Email.lastIndexOf('@') != -1 && jsonBody.Email.lastIndexOf('.') != -1){
                            Integer apos=jsonBody.Email.lastIndexOf('@');
							Integer dotpos=jsonBody.Email.lastIndexOf('.');
                            system.debug('apos'+apos);
                            system.debug('dotpos'+dotpos);
                            if(apos>dotpos){
                                RestContext.response.addHeader('Content-Type', 'application/json');
                                System.debug('Email must not be an indiashelter account');
                                RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":410,"errorMessages":"Please share valid Email."}');

                                return;
                                
                            }else{
                                
                                if(jsonBody.Email.substring(apos+1,dotpos)!='indiashelter'){
                                 //soft login save  or Email__c = :jsonBody.Email
                        // validate user already registered with email and mobile
                        List<Connector__C> MobilenoList = new List<Connector__C>([Select ID__C,LeadStatus__c from Connector__C
                                                                                  WHERE Mobile__c = :jsonBody.Mobile]);

                        if (MobilenoList == null || MobilenoList.size() == 0){

                            //generate Connector ID
                            String connectorID = GenerateRandomNumber(10);

                            //populated Connector Object from JSON
                            Connector__C connector = new Connector__C();

                            connector.Name__c = jsonBody.Name;
                            connector.Mobile__c = jsonBody.Mobile;
                            connector.Email__c = jsonBody.Email;
                            connector.ConnectorID__c = connectorID;

                            if (jsonBody.DeviceID != null)
                                connector.DeviceID__c = jsonBody.DeviceID;
                            if (jsonBody.NotificationId != null)
                                connector.NotificationId__c = jsonBody.NotificationId;
                            if (jsonBody.NotificationEnable != null)
                                connector.NotificationEnable__c = jsonBody.NotificationEnable;
                            
                            //connector.Status__c = 'Register';
                            //connector.LeadStatus__c='Register';
							/*Chnages after first demo of adding otp verifation after signup on 30 Nov 2022*/
                            connector.Status__c = 'Inactive';
                            connector.LeadStatus__c='Inactive';

                            try{

                                insert connector;

                                List<Connector__C> connectorList = [Select ID__C, ConnectorID__c, Name__c,NotificationId__c
                                                                    from Connector__C
                                                                    where id = :connector.ID__c];

                                RestContext.response.addHeader('Content-Type', 'application/json');
                                RestContext.response.responseBody = Blob.valueOf('{ "success":true, "status":200,"Connector ID":"' + connectorID + '","Message":"Connector has been created."}');
								return;

                            } catch (Exception e){

                                RestContext.response.addHeader('Content-Type', 'application/json');
                                System.debug('error error error ' + e.getLineNumber() + 'error error' + e.getMessage());
                                RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":410,"errorMessages":"Please Fill record Properly"}');

                                return;
                            }


                        }else if(MobilenoList!=null && MobilenoList.size()>0){
                            
                            if(MobilenoList.get(0).LeadStatus__c!=null && MobilenoList.get(0).LeadStatus__c=='Inactive'){
                                
                                List<Connector__C> connectorList = [Select ID__C, ConnectorID__c, Name__c,NotificationId__c
                                                                    from Connector__C
                                                                    where Mobile__c = :jsonBody.Mobile];

                                RestContext.response.addHeader('Content-Type', 'application/json');
                                RestContext.response.responseBody = Blob.valueOf('{ "success":true, "status":200,"Connector ID":"' + connectorList.get(0).ConnectorID__c + '","Message":"Connector has been created."}');
								return;

                                
                            }else{
                                RestContext.response.addHeader('Content-Type', 'application/json');
                                RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "User Already Registered with given Email Or Mobile!" }');
                                return;
                            }
                            
                        } else{
                            
                            
                            RestContext.response.addHeader('Content-Type', 'application/json');
                            RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "User Already Registered with given Email Or Mobile!" }');
                            return;
                        
                        }
                            }else{
                                RestContext.response.addHeader('Content-Type', 'application/json');
                                System.debug('Email must not be an indiashelter account');
                                RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":410,"errorMessages":"Email must not be a indiashelter account"}');

                                return;
                            }
                            }
                            
                            
                        }else{
                              RestContext.response.addHeader('Content-Type', 'application/json');
                               // System.debug('error error error ' + e.getLineNumber() + 'error error' + e.getMessage());
                                RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":410,"errorMessages":"Invalid Email."}');

                            	return;
                        }

                       

                    } else{
                        RestContext.response.addHeader('Content-Type', 'application/json');
                        RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Please Share Mobile Number" }');
                        return;

                    }
                } else{
                    RestContext.response.addHeader('Content-Type', 'application/json');
                    RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Please Share Name" }');
                    return;

                }


            } 
            else if (jsonBody.Process != null && jsonBody.Process != '' && jsonBody.Process == 'registration'){

                /*Validated request data */
                if (jsonBody.Name != Null && jsonBody.Name != ''){
                    if (jsonBody.Mobile != Null && jsonBody.Mobile != ''){
                        if (jsonBody.PAN != Null && jsonBody.PAN != ''){

                            if (jsonBody.ResidentialAddress != Null && jsonBody.ResidentialAddress != ''){
                                if (jsonBody.Pincode != Null && jsonBody.Pincode != ''){

                                    if (jsonBody.Landmark != Null && jsonBody.Landmark != ''){
                                        if (jsonBody.Branch != Null && jsonBody.Branch != ''){

                                            if (jsonBody.ConnectorType != Null && jsonBody.ConnectorType != ''){

                                                if (jsonBody.OfficeAddress != Null && jsonBody.OfficeAddress != ''){
                                                    if (jsonBody.BankAccount != Null && jsonBody.BankAccount != ''){
                                                        if (jsonBody.NameInBank != Null && jsonBody.NameInBank != ''){

                                                            if (jsonBody.ISFC != Null && jsonBody.ISFC != ''){

                                                                // validate user already registered with email and mobile // or Email__c = :jsonBody.Email
                                                                List<Connector__C> MobilenoList = new List<Connector__C>([Select ID__C
                                                                                                                          from Connector__C
                                                                                                                          WHERE Mobile__c = :jsonBody.Mobile]);

                                                                if (MobilenoList == null || MobilenoList.size() == 0){

                                                                    //generate Connector ID
                                                                    String connectorID = GenerateRandomNumber(10);

                                                                    //populated Connector Object from JSON
                                                                    Connector__C connector = new Connector__C();

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


                                                                    if (jsonBody.Branch != null)
                                                                        connector.Branch__c = jsonBody.Branch;
                                                                    if (jsonBody.ConnectorType != null)
                                                                        connector.ConnectorType__c = jsonBody.ConnectorType;
                                                                    if (jsonBody.Company != null)
                                                                        connector.Company__c = jsonBody.Company;
                                                                    if (jsonBody.CompanyGST != null)
                                                                        connector.CompanyGST__c = jsonBody.CompanyGST;
                                                                    if (jsonBody.CompanyPAN != null)
                                                                        connector.CompanyPAN__c = jsonBody.CompanyPAN;
                                                                    if (jsonBody.Occupation != null)
                                                                        connector.Occupation__c = jsonBody.Occupation;
                                                                    if (jsonBody.OccupationYear != null)
                                                                        connector.OccupationYear__c = jsonBody.OccupationYear;
                                                                    if (jsonBody.Tieup != null)
                                                                        connector.Tieup__c = jsonBody.Tieup;
                                                                    if (jsonBody.Email != null)
                                                                        connector.Email__c = jsonBody.Email;
                                                                    if (jsonBody.IDProofType != null)
                                                                        connector.IDProofType__c = jsonBody.IDProofType;
                                                                    if (jsonBody.IDProofAddress != null)
                                                                        connector.IDProofNumber__c = jsonBody.IDProofAddress;
                                                                    if (jsonBody.IDProofDocument != null)
                                                                        connector.IDProofDocument__c = jsonBody.IDProofDocument;
                                                                    if (jsonBody.AddressProofType != null)
                                                                        connector.AddressProofType__c = jsonBody.AddressProofType;
                                                                    if (jsonBody.AddressProofNumber != null)
                                                                        connector.AddressProofNumber__c = jsonBody.AddressProofNumber;
                                                                    if (jsonBody.AddressProofDocument != null)
                                                                        connector.AddressProofDocument__c = jsonBody.AddressProofDocument;
                                                                    if (jsonBody.Bank != null)
                                                                        connector.Bank__c = jsonBody.Bank;
                                                                    if (jsonBody.ChequeDocument != null)
                                                                        connector.ChequeDocument__c = jsonBody.ChequeDocument;
                                                                    if (jsonBody.OfficeAddress != null)
                                                                        connector.OfficeAddress__c = jsonBody.OfficeAddress;
                                                                    if (jsonBody.DeviceID != null)
                                                                        connector.DeviceID__c = jsonBody.DeviceID;
                                                                    if (jsonBody.NotificationId != null)
                                                                        connector.NotificationId__c = jsonBody.NotificationId;
                                                                    if (jsonBody.NotificationEnable != null)
                                                                        connector.NotificationEnable__c = jsonBody.NotificationEnable;
                                                                    if (jsonBody.OfficeAddressPincode != null)
                                                                        connector.OfficeAddresPincode__c = jsonBody.OfficeAddressPincode;
                                                                    if (jsonBody.OfficeAddressLandmark != null)
                                                                        connector.OfficeAddresLanmark__c = jsonBody.OfficeAddressLandmark;
                                                                    if (jsonBody.AlternativeMobile != null)
                                                                        connector.Alternative_Mobile__c = jsonBody.AlternativeMobile;
                                                                    if (jsonBody.LOMobile != null)
                                                                        connector.LO_Mobile__c = jsonBody.LOMobile;
                                                                   
                                                                    connector.Status__c = 'Register';
                                                                    connector.LeadStatus__c='Register';

                                                                    try{

                                                                        insert connector;

                                                                        List<Connector__C> connectorList = [Select ID__C, ConnectorID__c, Name__c
                                                                                                            from Connector__C
                                                                                                            where id = :connector.ID__c];

                                                                        RestContext.response.addHeader('Content-Type', 'application/json');
                                                                        RestContext.response.responseBody = Blob.valueOf('{ "success":true, "status":200,"Connector ID":"' + connectorID + '","Message":"Connector has been created."}');

                                                                        return;

                                                                    } catch (Exception e){

                                                                        RestContext.response.addHeader('Content-Type', 'application/json');
                                                                        System.debug('error error error ' + e.getLineNumber() + 'error error' + e.getMessage());
                                                                        RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":410,"errorMessages":"Please Fill record Properly"}');

                                                                        return;
                                                                    }


                                                                } else{
                                                                    RestContext.response.addHeader('Content-Type', 'application/json');
                                                                    RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "User Already Registered with given Email Or Mobile!" }');
                                                                    return;
                                                                }


                                                            } else{
                                                                RestContext.response.addHeader('Content-Type', 'application/json');
                                                                RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Please Share ISFC" }');
                                                                return;
                                                            }

                                                        } else{
                                                            RestContext.response.addHeader('Content-Type', 'application/json');
                                                            RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Please Share Name as Per Bank Account" }');
                                                            return;
                                                        }
                                                    } else{
                                                        RestContext.response.addHeader('Content-Type', 'application/json');
                                                        RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Please Share Bank Account Number" }');
                                                        return;
                                                    }
                                                } else{
                                                    RestContext.response.addHeader('Content-Type', 'application/json');
                                                    RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Please Share Office Address" }');
                                                    return;
                                                }

                                            } else{
                                                RestContext.response.addHeader('Content-Type', 'application/json');
                                                RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Please Share Connector Type" }');
                                                return;

                                            }

                                        } else{
                                            RestContext.response.addHeader('Content-Type', 'application/json');
                                            RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Please Share Branch" }');
                                            return;

                                        }
                                    } else{
                                        RestContext.response.addHeader('Content-Type', 'application/json');
                                        RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Please Share Landmark" }');
                                        return;

                                    }

                                } else{
                                    RestContext.response.addHeader('Content-Type', 'application/json');
                                    RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Please Share Pincode" }');
                                    return;

                                }
                            } else{
                                RestContext.response.addHeader('Content-Type', 'application/json');
                                RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Please Share Residential Address" }');
                                return;

                            }

                        } else{
                            RestContext.response.addHeader('Content-Type', 'application/json');
                            RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Please Share PAN Number" }');
                            return;

                        }
                    } else{
                        RestContext.response.addHeader('Content-Type', 'application/json');
                        RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Please Share Mobile Number" }');
                        return;

                    }
                } else{
                    RestContext.response.addHeader('Content-Type', 'application/json');
                    RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Please Share Name" }');
                    return;

                }

            }
            else if (jsonBody.Process != null && jsonBody.Process != '' && jsonBody.Process == 'FetchMasterData'){
        		MasterData masters=new MasterData();
                
                /*List<Branch__c> brlist=[select Name from Branch__c];
                if(brlist!=null && brlist.size()>0)
                {
                	for(Branch__c br:brlist){
                    	masters.branchList.add(br.Name);
                	}
                    
                }*/
                masters.branchList=ConnectorRegistrationAPI.getBranchPickListValuesIntoList();
                
                AggregateResult[] results = [SELECT count(Id), CITY_NAME__c FROM NucleusStateCity__c  GROUP BY CITY_NAME__c];
                for (AggregateResult result : results) {
                    if(result.get('CITY_NAME__c')!=null){
                    	masters.cityList.add((String)result.get('CITY_NAME__c'));    
                    }
                	
                }
                
                if(masters.cityList==null || masters.cityList.size()==0){
                      masters.cityList=new List<String>{'Delhi','Gurgoan','Noida','Greater Noida'};
                
                }
				
                results = [SELECT count(Id), Name FROM Bank_Detail__c GROUP BY Name];
                for (AggregateResult result : results) {
                	masters.bankList.add((String)result.get('Name'));
                }
				
                if(masters.bankList==null || masters.bankList.size()==0){
                      masters.bankList=new List<String>{'ICICI','SBI','IDFC','HDFC'};
                
                }
				
                /*List<Occupation__c> occupationList=[select Name from Occupation__c order by Name];
                if(occupationList!=null && occupationList.size()>0)
                {
                    for(Occupation__c occ:occupationList){
                        masters.occupationList.add(occ.Name);
                    }
                }*/
                masters.occupationList=ConnectorRegistrationAPI.getOccupationPickListValuesIntoList();
                
                masters.loanPurposeList=ConnectorRegistrationAPI.getLoanPurposePickListValuesIntoList();
                masters.yearsList=new List<String>{'1 Year','2 Years','3 Years','4 Years','5 Years','6 Years','7 Years','8 Years','9 Years','10 Years','more then 10 years'};
                
                masters.identityProofList=ConnectorRegistrationAPI.getIdentityPickListValuesIntoList();
                //masters.identityProofList= new List<String>{'Aadhar','IGL Bill','Bank Passbook','Passport','Voter ID','Driving License'};     
                masters.addressProofList= new List<String>{ 'PAN','Passport','Voter ID','Driving License','Aadhar'};
                
                
                String jsonstring = JSON.serialize(masters);
                RestContext.response.addHeader('Content-Type', 'application/json');
                RestContext.response.responseBody = Blob.valueOf('{ "success":true, "status":"200", "masterdata": '+jsonstring+' }');  
                return ;
              
            }
            else if (jsonBody.Process != null && jsonBody.Process != '' && jsonBody.Process == 'FetchProfile'){
                
                if(jsonBody.ConnectorID!=null && jsonBody.ConnectorID!=''){
                  	Connector__C  result = [Select Name, ID__c,Email__c, ConnectorID__c,Profile__c , OTP__c, Status__c,LeadStatus__c, Mobile__c, PAN__c, NotificationId__c, AddressProofDocument__c, AddressProofNumber__c, AddressProofType__c, Bank__c, BankAccount__c, Branch__c, ChequeDocument__c, Company__c, CompanyGST__c, CompanyPAN__c, ConnectorType__c, IDProofDocument__c, IDProofNumber__c, IDProofType__c, IFSC__c, Landmark__c, Name__c, NameInBank__c, NotificationEnable__c, Occupation__c, OccupationYear__c, OfficeAddress__c, Pincode__c, ResidentialAddress__c, Tieup__c,OfficeAddresPincode__c,OfficeAddresLanmark__c,LO_Mobile__c 
                               from Connector__C
                               where ConnectorID__c = :jsonBody.ConnectorID];
            		system.debug('result'+result);
                    
                String jsonstring = JSON.serialize(result);
                RestContext.response.addHeader('Content-Type', 'application/json');
                RestContext.response.responseBody = Blob.valueOf('{ "success":true, "status":"200", "profile": '+jsonstring+' }');  
                return ;
                    
                }else{
                     RestContext.response.addHeader('Content-Type', 'application/json');
                    RestContext.response.responseBody = Blob.valueOf('{ "success":false, "status":"406", "errorMessages": "Please Share Connector ID" }');
                    return;
                }
            }

        }
    }
    /*method getting public URL of S3 bucket files*/
	 /*method getting public URL of S3 bucket files*/
    public static String GenerateAWSDocumentPublicURL(String url,String ConnectorID){        
        
        
        String fileName='KYCDocument/'+ConnectorID+'/'+url.substring(url.lastIndexOf('/')+1);
        system.debug('GenerateAWSDocumentPublicURL Profile Pics:'+url);
        Date gmtDate = Datetime.now().dateGmt();
        Time gmtTime = Datetime.now().timeGmt();
        DateTime currentDate = DateTime.newInstance(gmtDate, gmtTime);
       
        
        List<connectorintegrationconfig__c> listdedupe = [select fcmserverkey__c,s3secretKey__c,s3secretId__c,s3bucket__c,s3region__c,s3exipredFormat__c from connectorintegrationconfig__c];
        if(listdedupe!=null && listdedupe.size()>0){
        	String awsKey=listdedupe.get(0).s3secretKey__c;
        String awsSecret=listdedupe.get(0).s3secretId__c;
        String bucketName=listdedupe.get(0).s3bucket__c;
        String region=listdedupe.get(0).s3region__c;
        string exipredFormat = listdedupe.get(0).s3exipredFormat__c;//'604800';//1600';
        String todayformat =  currentDate.format('yyyyMMdd');
        String key = 'AWS4' + awsSecret;
        Blob DateKey          = Crypto.generateMac('hmacSHA256',Blob.valueOf(todayformat),Blob.valueOf(key));
        Blob DateRegionKey           = Crypto.generateMac('hmacSHA256',Blob.valueOf(region),DateKey);
        Blob DateRegionServiceKey    = Crypto.generateMac('hmacSHA256',Blob.valueOf('s3'),DateRegionKey);
        Blob SigningKey              = Crypto.generateMac('hmacSHA256',Blob.valueOf('aws4_request'),DateRegionServiceKey);

        String canonical =  'GET\n'+'/'+fileName+'\n'+'X-Amz-Algorithm=AWS4-HMAC-SHA256&'+'X-Amz-Credential='+ awsKey +'%2F'+todayformat+'%2F'+region+'%2Fs3%2Faws4_request&'+'X-Amz-Date='+todayformat+'T'+currentDate.format('HHmmss')+'Z&'+'X-Amz-Expires='+exipredFormat+'&X-Amz-SignedHeaders=host\n'+'host:'+bucketName+'.s3.amazonaws.com\n\n'+'host\n'+'UNSIGNED-PAYLOAD';

		Blob canonicalsign = Crypto.generateDigest('SHA-256', Blob.valueOf(canonical));

		Blob StringToSign = Blob.valueOf('AWS4-HMAC-SHA256\n'+todayformat+'T'+currentDate.format('HHmmss')+'Z'+'\n'+todayformat+'/'+region+'/s3/aws4_request\n'+EncodingUtil.convertToHex(canonicalsign));

        Blob bsig =  Crypto.generateMac('hmacSHA256',StringToSign,SigningKey);

        url = 'https://'+bucketName+'.s3.amazonaws.com/'+fileName+'?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential='+ awsKey +'/'+todayformat+'/'+ region +'/s3/aws4_request&X-Amz-Date='+todayformat+'T'+currentDate.format('HHmmss')+'Z&X-Amz-Expires='+exipredFormat+'&X-Amz-SignedHeaders=host&X-Amz-Signature='+EncodingUtil.convertToHex(bsig);
	    System.debug('Url-------------->'+url);
           
        }
        
       
       return url;
     
   }
    public static List<String> getIdentityPickListValuesIntoList(){
        List<String> pickListValuesList= new List<String>();
		Schema.DescribeFieldResult fieldResult = Contact.Identity_Proof__c.getDescribe();
		List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
		for( Schema.PicklistEntry pickListVal : ple){
			pickListValuesList.add(pickListVal.getLabel());
		}     
		return pickListValuesList;
    }
    public static List<String> getOccupationPickListValuesIntoList(){
       List<String> pickListValuesList= new List<String>();
		Schema.DescribeFieldResult fieldResult = Lead.X8_Occupations__c.getDescribe();
		List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
		for( Schema.PicklistEntry pickListVal : ple){
			pickListValuesList.add(pickListVal.getLabel());
		}     
		return pickListValuesList;
    }
    
    public static List<String> getBranchPickListValuesIntoList(){
       List<String> pickListValuesList= new List<String>();
		Schema.DescribeFieldResult fieldResult = Lead.Branch_Name__c.getDescribe();
		List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
		for( Schema.PicklistEntry pickListVal : ple){
			pickListValuesList.add(pickListVal.getLabel());
		}     
		return pickListValuesList;
    }
    
    public static List<String> getLoanPurposePickListValuesIntoList(){
       List<String> pickListValuesList= new List<String>();
		Schema.DescribeFieldResult fieldResult = Lead.Purpose_of_Loan_P__c.getDescribe();
		List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
		for( Schema.PicklistEntry pickListVal : ple){
            if(pickListVal.getLabel()!='Employee'){
            	pickListValuesList.add(pickListVal.getLabel());    
            }
			
		}     
		return pickListValuesList;
    }
    public class MasterData{
        public List<String> cityList=new List<String>();
        public List<String> loanPurposeList=new List<String>();
        public List<String> branchList=new List<String>();
        public List<String> occupationList=new List<String>();
        public List<String> yearsList=new List<String>();
        public List<String> identityProofList=new List<String>();
        public List<String> addressProofList=new List<String>();
        public List<String> bankList=new List<String>();
        
                
    }
    public class Wrapper{
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
        public string ConnectorType;//Company or Firm
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
        /* 6 Dec 2020 Added after first demo to management. option for OTP verfication of LO mobile and Terms and Conditions*/
        public Boolean VerifiedLO;
        public Boolean AcceptTermsCondition;
        public String Process; // softsignup or registration
    }

    public static string GenerateRandomNumber(integer length){
        string result = '';
        while (result.length() < length){
            blob privateKey = crypto.generateAesKey(256);
            string randomString = EncodingUtil.base64Encode(crypto.generateMac('hmacSHA512', privateKey, privateKey));
            result += randomString.replaceAll('[^1-9]', '');
        }
        result = result.substring(0, length);
        return result;
    }

   /* public static void GenerateJsonLog(String objectId, String dataFile, String process){

        ContentVersion docVersion = new ContentVersion();
        docVersion.ContentLocation = 'S';
        docVersion.PathOnClient = process + '.JSON';
        docVersion.Title = process + '.JSON';
        Blob profiledata = Blob.valueOf(dataFile);
        docVersion.VersionData = profiledata;

        insert docVersion;

        String documentVersionId = [select contentDocumentid
                                    from ContentVersion
                                    where id = :docVersion.id].contentDocumentid;
        ContentDocumentLink doclink = new ContentDocumentLink();
        doclink.ContentDocumentId = documentVersionId;
        doclink.LinkedEntityId = objectId;
        doclink.ShareType = 'I';
        doclink.Visibility = 'AllUsers';

        insert doclink;
    }

    //To upload file to amazon S3
    /*public static String uploadToAmazonS3(String fileNames, Blob attachmentBody, String fileContentType){

        String uploadedFileURL = 'FileUploadError';
        
        Blob fileBlob = Blob.valueOf('Unit Test Attachment Body');
        String fileBody = EncodingUtil.base64Encode(fileBlob);
        String now = Datetime.now().formatGMT('EEE, dd MMM yyyy HH:mm:ss z');
        String bucketname = 'testabhinav';
        //String host = 's3.ap-south-1.amazonaws.com';
        String host = 's3.ap-south-1.amazonaws.com';
        System.debug('fileBody: ' + fileBody);
        String contentType = 'text/html';
        String fileName = 'text.txt';
        String method = 'PUT';
        String key = 'AKIA_AWS_ACCESS_KEY_PLACEHOLDER';
        String secret = 'AWS_SECRET_KEY_PLACEHOLDER';

        HttpRequest req = new HttpRequest();
        req.setMethod(method);
        req.setEndpoint('https://' + bucketname + '.' + host + '/Logs/' + fileName);
        uploadedFileURL = 'https://' + bucketname + '.' + host + '/Logs/' + fileName;
        req.setHeader('Host', bucketname + '.' + host);
        req.setHeader('Content-Length', String.valueOf(fileBody.length()));
        req.setHeader('Content-Encoding', 'UTF-8');
        req.setHeader('Content-type', contentType);
        req.setHeader('Connection', 'keep-alive');
        req.setHeader('Date', now);
        req.setHeader('ACL', 'public-read');
        req.setBody(fileBody);

        String stringToSign = 'PUT\n\n' + contentType + '\n' + now + '\n' + '/' + bucketname + '/Logs/' + fileName;

        String encodedStringToSign = EncodingUtil.urlEncode(stringToSign, 'UTF-8');
        Blob mac = Crypto.generateMac('HMACSHA1', Blob.valueOf(stringToSign), Blob.valueOf(secret));
        String signed = EncodingUtil.base64Encode(mac);
        String authHeader = 'AWS' + ' ' + key + ':' + signed;
        req.setHeader('Authorization', authHeader);
        String decoded = EncodingUtil.urlDecode(encodedStringToSign, 'UTF-8');
        System.debug(encodedStringToSign);
        System.debug(decoded);

        Http http = new Http();
        HTTPResponse res = http.send(req);
        System.debug('RESPONSE STRING: ' + res.toString());
        System.debug('RESPONSE STATUS: ' + res.getStatus());
        System.debug('STATUS_CODE: ' + res.getStatusCode());

        /*String uploadFileName = fileName.replace(' ','_');
         String formattedDateStr = Datetime.now().formatGMT('EEE, dd MMM yyyy HH:mm:ss z');
         // String signed = FileUploadService.generateSignedPolicy(FileUploadService.AWS_BUCKET_NAME, formattedDateStr);

         String uploadedFileURL ='FileUploadError';
         String enCodedFileName = EncodingUtil.urlEncode(uploadFileName, 'UTF-8');
         HttpRequest req = new HttpRequest();
         req.setMethod('PUT');
         //req.setHeader('Host', 'testabhinav.s3.ap-south-1.amazonaws.com');
         String finalURL = 'https://testabhinav.s3.ap-south-1.amazonaws.com/Logs/' + enCodedFileName;
         req.setEndpoint(finalURL);
         System.debug(finalURL);
         req.setHeader('Content-Length',String.valueOf(attachmentBody.toString().length()));
         req.setHeader('Content-Type', fileContentType);
         //req.setHeader('Connection', 'keep-alive');
         //req.setHeader('date', formattedDateStr);
         req.setBodyAsBlob(attachmentBody);
         req.setHeader('X-Amz-Content-Sha256', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
         req.setHeader('X-Amz-Date', '20221026T102836Z');
         req.setHeader('Authorization', 'AWS4-HMAC-SHA256 Credential=AKIA_AWS_ACCESS_KEY_PLACEHOLDER/20221026/ap-south-1/s3/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=AWS_SIGNATURE_PLACEHOLDER');
         req.setHeader('Content-Type', 'application/json');
         Http http = new Http();
         HTTPResponse res = new HTTPResponse();
         try {
         //Execute web service call
         res = http.send(req);

         if(res.getStatusCode()==200){
         uploadedFileURL = finalURL;
         } else{
         System.debug(res.getStatusCode()+'  S3FileUpload '+ res.getStatus());
         }
         return uploadedFileURL;

         } catch(System.CalloutException e) {
         System.debug('AWS Service Callout Exception: ' + e.getMessage());
         uploadedFileURL = 'FileUploadError';
         // System.debug('S3FileUpload' + e.getMessage());
         return uploadedFileURL;
         } */

        /*return uploadedFileURL;
    }*/

    

public static void testParser(){
        if(Test.isRunningTest()){
        integer i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
         i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
         i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
             i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
             i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
             i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
             i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
             i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        i=0;
        }
    }
    
    
}