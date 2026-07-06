@RestResource(urlMapping='/v1/leads/*')
global with sharing class LeadRestService {

    // ─── Response wrapper ────────────────────────────────────────────────────
    global class LeadApiResponse {
        global Boolean  success;
        global String   leadId;
        global String   message;
        global LeadData data;

        global LeadApiResponse(Boolean success, String leadId, String message, LeadData data) {
            this.success = success;
            this.leadId  = leadId;
            this.message = message;
            this.data    = data;
        }
    }

    // ─── Request body (all Lead + Onboarding fields combined) ────────────────
    global class CreateLeadRequest {
        // Core identity
        global String  firstName;
        global String  lastName;
        global String  mobileNumber;
        global String  email;

        // Location
        global String  city;
        global String  state;
        global String  pincode;

        // Loan details
        global String  employmentType;
        global Decimal annualIncome;
        global Decimal loanAmount;
        global Decimal propertyValue;
        global String  propertyType;
        global Integer loanTenure;

        // Property location (from onboarding)
        global String  propertyCity;
        global String  propertyPincode;

        // Application tracking (from onboarding)
        global String  currentStep;
        global String  applicationStatus;
        global String  remarks;

        // Connector/Partner link
        global String  connectorId;   // Salesforce ID of Connector__c record

        // Lead metadata
        global String  leadSource;
        global String  status;
    }

    // ─── Read data (all fields returned to app) ───────────────────────────────
    global class LeadData {
        global String  leadId;
        global String  firstName;
        global String  lastName;
        global String  mobileNumber;
        global String  email;

        // Location
        global String  city;
        global String  state;
        global String  pincode;

        // Loan details
        global String  employmentType;
        global Decimal annualIncome;
        global Decimal loanAmount;
        global Decimal propertyValue;
        global String  propertyType;
        global Integer loanTenure;

        // Property location
        global String  propertyCity;
        global String  propertyPincode;

        // Application tracking
        global String  currentStep;
        global String  applicationStatus;
        global String  remarks;
        global String  submittedDate;

        // Connector/Partner
        global String  connectorId;

        global String  leadSource;
        global String  status;
        global String  createdDate;
        global String  lastModifiedDate;
    }

    // ─── POST /services/apexrest/v1/leads  →  Create Lead ───────────────────
    @HttpPost
    global static LeadApiResponse createLead() {
        RestRequest  req = RestContext.request;
        RestResponse res = RestContext.response;

        try {
            CreateLeadRequest body =
                (CreateLeadRequest) JSON.deserialize(req.requestBody.toString(), CreateLeadRequest.class);

            // Validation
            if (String.isBlank(body.firstName) || String.isBlank(body.lastName)) {
                res.statusCode = 400;
                return new LeadApiResponse(false, null, 'First name and last name are required', null);
            }
            if (String.isBlank(body.mobileNumber)) {
                res.statusCode = 400;
                return new LeadApiResponse(false, null, 'Mobile number is required', null);
            }
            if (body.loanAmount == null || body.loanAmount <= 0) {
                res.statusCode = 400;
                return new LeadApiResponse(false, null, 'Loan amount must be greater than 0', null);
            }

            // Map to standard Lead object
            Lead lead = new Lead();
            lead.FirstName       = body.firstName;
            lead.LastName        = body.lastName;
            lead.MobilePhone     = body.mobileNumber;
            lead.Email           = body.email;

            // Location — use propertyCity if city is blank
            lead.City            = String.isBlank(body.city) ? body.propertyCity : body.city;
            lead.State           = body.state;
            lead.PostalCode      = String.isBlank(body.pincode) ? body.propertyPincode : body.pincode;

            lead.Company         = body.firstName + ' ' + body.lastName;
            lead.AnnualRevenue   = body.annualIncome;
            lead.LeadSource      = String.isBlank(body.leadSource) ? 'Mobile App' : body.leadSource;
            lead.Status          = String.isBlank(body.status) ? 'Open - Not Contacted' : body.status;
            lead.Description     = body.remarks;

            // Custom loan fields
            lead.Product__c         = body.propertyType;
            lead.Loan_Amount__c     = body.loanAmount;
            lead.Property_Value__c  = body.propertyValue;
            lead.Property_Type__c   = body.propertyType;
            lead.Tenure__c          = body.loanTenure;
            lead.Employment_Type__c = body.employmentType;

            // Custom onboarding/tracking fields (add these as custom fields in Salesforce)
            lead.Property_City__c        = body.propertyCity;
            lead.Property_Pincode__c     = body.propertyPincode;
            lead.Current_Step__c         = String.isBlank(body.currentStep) ? 'Personal Info' : body.currentStep;
            lead.Application_Status__c   = String.isBlank(body.applicationStatus) ? 'Draft' : body.applicationStatus;

            // Link to Connector__c (partner who submitted this lead)
            if (!String.isBlank(body.connectorId)) {
                lead.Connector__c = body.connectorId;
            }

            insert lead;

            res.statusCode = 201;
            return new LeadApiResponse(true, lead.Id, 'Lead created successfully', null);

        } catch (DmlException dex) {
            res.statusCode = 422;
            return new LeadApiResponse(false, null, 'Validation error: ' + dex.getDmlMessage(0), null);
        } catch (Exception ex) {
            res.statusCode = 500;
            return new LeadApiResponse(false, null, 'Error creating lead: ' + ex.getMessage(), null);
        }
    }

    // ─── GET /services/apexrest/v1/leads/{leadId}  →  Get Lead ──────────────
    @HttpGet
    global static LeadApiResponse getLead() {
        RestRequest  req = RestContext.request;
        RestResponse res = RestContext.response;

        try {
            String leadId = req.requestURI.substringAfterLast('/');
            if (String.isBlank(leadId) || leadId == 'leads') {
                res.statusCode = 400;
                return new LeadApiResponse(false, null, 'Lead ID is required', null);
            }

            List<Lead> leads = [
                SELECT Id, FirstName, LastName, MobilePhone, Email,
                       City, State, PostalCode, AnnualRevenue,
                       LeadSource, Status, Description, CreatedDate, LastModifiedDate,
                       Product__c, Loan_Amount__c, Property_Value__c,
                       Property_Type__c, Tenure__c, Employment_Type__c,
                       Property_City__c, Property_Pincode__c,
                       Current_Step__c, Application_Status__c,
                       Submitted_Date__c, Connector__c
                FROM Lead
                WHERE Id = :leadId
                LIMIT 1
            ];

            if (leads.isEmpty()) {
                res.statusCode = 404;
                return new LeadApiResponse(false, null, 'Lead not found', null);
            }

            return new LeadApiResponse(true, leads[0].Id, 'OK', mapToData(leads[0]));

        } catch (Exception ex) {
            res.statusCode = 500;
            return new LeadApiResponse(false, null, 'Error fetching lead: ' + ex.getMessage(), null);
        }
    }

    // ─── PATCH /services/apexrest/v1/leads/{leadId}  →  Update Lead ─────────
    @HttpPatch
    global static LeadApiResponse updateLead() {
        RestRequest  req = RestContext.request;
        RestResponse res = RestContext.response;

        try {
            String leadId = req.requestURI.substringAfterLast('/');
            if (String.isBlank(leadId)) {
                res.statusCode = 400;
                return new LeadApiResponse(false, null, 'Lead ID is required', null);
            }

            CreateLeadRequest body =
                (CreateLeadRequest) JSON.deserialize(req.requestBody.toString(), CreateLeadRequest.class);

            Lead lead = new Lead(Id = leadId);

            // Standard fields
            if (!String.isBlank(body.city))          lead.City          = body.city;
            if (!String.isBlank(body.state))         lead.State         = body.state;
            if (!String.isBlank(body.pincode))       lead.PostalCode    = body.pincode;
            if (!String.isBlank(body.status))        lead.Status        = body.status;
            if (!String.isBlank(body.email))         lead.Email         = body.email;
            if (!String.isBlank(body.mobileNumber))  lead.MobilePhone   = body.mobileNumber;
            if (!String.isBlank(body.remarks))       lead.Description   = body.remarks;
            if (body.annualIncome != null)           lead.AnnualRevenue = body.annualIncome;

            // Custom loan fields
            if (body.loanAmount != null)             lead.Loan_Amount__c     = body.loanAmount;
            if (body.propertyValue != null)          lead.Property_Value__c  = body.propertyValue;
            if (!String.isBlank(body.propertyType))  lead.Property_Type__c   = body.propertyType;
            if (body.loanTenure != null)             lead.Tenure__c          = body.loanTenure;
            if (!String.isBlank(body.employmentType)) lead.Employment_Type__c = body.employmentType;

            // Custom onboarding/tracking fields
            if (!String.isBlank(body.propertyCity))    lead.Property_City__c      = body.propertyCity;
            if (!String.isBlank(body.propertyPincode)) lead.Property_Pincode__c   = body.propertyPincode;
            if (!String.isBlank(body.currentStep))     lead.Current_Step__c       = body.currentStep;
            if (!String.isBlank(body.applicationStatus)) {
                lead.Application_Status__c = body.applicationStatus;
                // Auto-set submitted date when application is submitted
                if (body.applicationStatus == 'Submitted') {
                    lead.Submitted_Date__c = Date.today();
                }
            }

            update lead;

            return new LeadApiResponse(true, leadId, 'Lead updated successfully', null);

        } catch (DmlException dex) {
            res.statusCode = 422;
            return new LeadApiResponse(false, null, 'Validation error: ' + dex.getDmlMessage(0), null);
        } catch (Exception ex) {
            res.statusCode = 500;
            return new LeadApiResponse(false, null, 'Error updating lead: ' + ex.getMessage(), null);
        }
    }

    // ─── Helper: map Lead record → LeadData response ──────────────────────────
    private static LeadData mapToData(Lead l) {
        LeadData d          = new LeadData();
        d.leadId            = l.Id;
        d.firstName         = l.FirstName;
        d.lastName          = l.LastName;
        d.mobileNumber      = l.MobilePhone;
        d.email             = l.Email;
        d.city              = l.City;
        d.state             = l.State;
        d.pincode           = l.PostalCode;
        d.annualIncome      = l.AnnualRevenue;
        d.leadSource        = l.LeadSource;
        d.status            = l.Status;
        d.remarks           = l.Description;
        d.createdDate       = String.valueOf(l.CreatedDate);
        d.lastModifiedDate  = String.valueOf(l.LastModifiedDate);
        // Custom loan fields
        d.loanAmount        = l.Loan_Amount__c;
        d.propertyValue     = l.Property_Value__c;
        d.propertyType      = l.Product__c;
        d.employmentType    = l.Employment_Type__c;
        d.loanTenure        = l.Tenure__c != null ? Integer.valueOf(l.Tenure__c) : null;
        // Custom onboarding/tracking fields
        d.propertyCity      = l.Property_City__c;
        d.propertyPincode   = l.Property_Pincode__c;
        d.currentStep       = l.Current_Step__c;
        d.applicationStatus = l.Application_Status__c;
        d.submittedDate     = l.Submitted_Date__c != null ? String.valueOf(l.Submitted_Date__c) : null;
        d.connectorId       = l.Connector__c;
        return d;
    }
}