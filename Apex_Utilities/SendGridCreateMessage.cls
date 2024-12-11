public with sharing class SendGridCreateMessage {
    public static boolean hasAcct;
    public static Void CreateEmailMessage(String fromEmail, String fromName, List<Map<String, String>> toAddress, List<Map<String, String>> ccAddress, List<Map<String, String>> bccAddress, String subject, String templateId, String body, String caseId) {
        //****************************************************************************/
        //              Function to create the email message                          /
        //              Created : 10/17/2024 - Lloy Sanders                           /
        //              https://shift4.atlassian.net/browse/PHX-11138                 /
        //              Modified :                                                    /
        //****************************************************************************/
        EmailMessage email = new EmailMessage();
        email.ValidatedFromAddress = fromEmail;
        email.FromAddress = fromEmail;
        if(toAddress != null){
            email.ToAddress = ParseEmailToString(toAddress);
        }
        if (ccAddress != null) {
            email.CcAddress = ParseEmailToString(ccAddress);
        }
        if (bccAddress != null) {
            email.BccAddress = ParseEmailToString(bccAddress);
        }
        email.subject = subject;
        email.EmailTemplateId = templateId;
        email.FromName = fromName;
        email.HTMLBody = body;
        email.Incoming = false;
        email.IsBounced = false;
        email.IsClientManaged = false;
        email.IsBounced = false;
        email.IsExternallyVisible = true;
        email.IsTracked = false;
        email.MessageDate = Datetime.Now();
        //these fields are read only
        //email.Name = subject;
        //email.Email_Template_Name__c = templateName;
        //email.IsOpened = false;
        //email.IsDeleted = false;
        email.RelatedToId = caseId;
        email.Email_Status__c = 'Queued';
        insert email;
        //return email;
    }

    public static String ParseEmailToString(List<Map<String, String>> listEmail) {
        //***********************************************************************************/
        //              Function to convert a list of emails to string for EmailMessage Class/
        //              Created : 10/23/2024 - Lloy Sanders                                  /
        //              https://shift4.atlassian.net/browse/PHX-11138                        /
        //              Modified :                                                           /
        //***********************************************************************************/
        String emailAddress = '';
        for (Map<String, String> mapEmail : listEmail) {
            system.debug(mapEmail.get('email'));
            emailAddress = emailAddress + mapEmail.get('email') + '\r';
            
        }
        System.debug('Email Address Final ---------> '+emailAddress);
        return emailAddress;
    }

    public Static String getMergeFields(String subject, String HTMLString) {
        //****************************************************************************/
        //              Method to find the merge fields needed for the template       /
        //              Created : 10/23/2024 - Lloy Sanders                           /
        //              https://shift4.atlassian.net/browse/PHX-11138                 /
        //              Modified :                                                    /
        //****************************************************************************/
        List<String> soqlFields = new List<String>();
        String SOQLString;
        Integer iLoc = subject.IndexOf('{!Case');
        Integer iLoc2;
        String fieldName;
        Boolean isDone = false;
        // Find Merge Fields in subject
        if (iLoc <> -1) {
            While (isDone == false) {
                iLoc2 = subject.IndexOf('}', iLoc);
                fieldName = subject.SubString(iLoc + 7, iLoc2);
                if (!soqlFields.contains(fieldName)) {
                    if (fieldName == 'Account'){
                        if (hasAcct == true) {
                            soqlFields.add('Account.Name');
                        }
                    } else if (fieldName == 'Owner' || fieldName == 'OwnerFullName') {
                        soqlFields.add('OwnerId');
                    } else if (fieldName == 'Thread_Token') {
                        // This is not accessable via SOQL
                    } else {
                        soqlFields.add(fieldName);
                    }
                }
                iLoc = subject.IndexOf('{!Case', iLoc2);
                if (iLoc == -1) {
                    isDone = true;
                }
            }
        }

        // Find Merge Fields in HTML
        iLoc = HTMLString.IndexOf('{!Case');
        isDone = false;
        While (isDone == false) {
            iLoc2 = HTMLString.IndexOf('}', iLoc);
            system.debug(iLoc2);
            fieldName = HTMLString.SubString(iLoc + 7, iLoc2);
            if (!soqlFields.contains(fieldName)) {
                if (fieldName == 'Account'){
                    if (!soqlFields.contains('Account.Name')) {
                        soqlFields.add('Account.Name');
                    }
                } else if (fieldName == 'Owner' || fieldName == 'OwnerFullName') {
                    if (!soqlFields.contains('Owner.Name')) {
                        soqlFields.add('Owner.Name');
                    }
                } else if (fieldName == 'Thread_Token') {
                    // This is not accessable via SOQL
                } else {
                    soqlFields.add(fieldName);
                }
            }
            iLoc = HTMLString.IndexOf('{!Case', iLoc2);
            if (iLoc == -1) {
                isDone = true;
            }
        }
        SOQLString = string.join(soqlFields, ',');
        system.debug(SOQLString);
        return SOQLString;
    }

    public static String ReplaceMergeFields(String body, Case cs, String threadId, String AccountName, String OwnerName) {
        //****************************************************************************/
        //              Method to replace the merge fields in the template            /
        //              Created : 10/23/2024 - Lloy Sanders                           /
        //              https://shift4.atlassian.net/browse/PHX-11138                 /
        //              Modified :                                                    /
        //****************************************************************************/
        if (threadId <> Null) {
            body = body.Replace('{!Case.Thread_Token}', threadId);
        }
        if (AccountName <> null) {
            body = body.Replace('{!Case.Account}', AccountName);
        } else {
            if (hasAcct = true) {
                body = body.Replace('{!Case.Account}', '');
            }
        }
        if (OwnerName <> null) {
            body = body.Replace('{!Case.Owner}', OwnerName);
            body = body.Replace('{!Case.OwnerFullName}', OwnerName);
        }
        
        Integer iLoc = body.IndexOf('{!Case');
        Integer iLoc2;
        String fieldName;
        Object replaceObject;
        String replaceValue;
        String replaceText;
        Boolean isDone = false;
        if (iLoc <> -1) {
            While (isDone == false) {
                iLoc2 = body.IndexOf('}', iLoc);
                fieldName = body.SubString(iLoc + 7, iLoc2);
                replaceObject = cs.get(fieldName);
                replaceValue = String.ValueOf(replaceObject);
                replaceText = '{!Case' + '.' + fieldName + '}';
                system.debug(fieldName);
                system.debug(replaceText);
                system.debug(replaceValue);
                if (replaceValue <> null) {
                    body = body.Replace(replaceText, replaceValue);
                } else {
                    body = body.Replace(replaceText, '');
                }
                
                iLoc = body.IndexOf('{!Case');
                if (iLoc == -1) {
                    isDone = true;
                }
            }
        }
        return body;
    }

    public class CaseNotificationClass {
        //****************************************************************************/
        //              Class to pass the information about the notification          /
        //              Created : 10/23/2024 - Lloy Sanders                           /
        //              https://shift4.atlassian.net/browse/PHX-11138                 /
        //              Modified :                                                    /
        //****************************************************************************/
        @InvocableVariable(label='CaseId' required=false)
        public String caseId;
        @InvocableVariable(label='fromName' required=true)
        public String fromName;
        @InvocableVariable(label='fromEmail' required=true)
        public String fromEmail;
        @InvocableVariable(label='templateId' required=true)
        public String templateId;
        @InvocableVariable(label='templateType' required=true)
        public String templateType;
        @InvocableVariable(label='toAddress' required=true)
        public List<String> toAddress;
        @InvocableVariable(label='ccAddress' required=false)
        public List<String> ccAddress;
        @InvocableVariable(label='bccAddress' required=false)
        public List<String> bccAddress;
    }

    public static EmailTemplate getTemplate(String templateId) {
        //****************************************************************************/
        //              Function to return the information from the email template    /
        //              Created : 10/17/2024 - Lloy Sanders                           /
        //              https://shift4.atlassian.net/browse/PHX-11138                 /
        //              Modified :                                                    /
        //****************************************************************************/
        EmailTemplate template = [SELECT Id, Subject, HtmlValue, DeveloperName From EmailTemplate WHERE Id = :templateId];
        system.debug(template.Subject);
        system.debug(template.DeveloperName);
        return template;
    }

    public Static List<Map<String, String>> convertListToRecipients(List<String> recipients) {
        //****************************************************************************/
        //              Function to create a list of recipients from a list of emails /
        //              Created : 10/17/2024 - Lloy Sanders                           /
        //              https://shift4.atlassian.net/browse/PHX-11138                 /
        //              Modified :                                                    /
        //****************************************************************************/
        
        List<Map<String, String>> recipientList = new List<Map<String, String>>();
        for (String rec : recipients) {
            Map<String, String> recip = new Map<String, String>(); // Bugfix - memory manipulation
            recip.put('email', rec);
            recipientList.add(recip);
        }
        return recipientList;
    }

    @InvocableMethod
    public static void CreateTheMessage(List<caseNotificationClass> csJSON) {
        //****************************************************************************/
        //              Invocable Method to create the EmailMessage                   /
        //              Created : 10/23/2024 - Lloy Sanders                           /
        //              https://shift4.atlassian.net/browse/PHX-11138                 /
        //              Modified :                                                    /
        //****************************************************************************/
        EmailTemplate template = new EmailTemplate();
        List<OrgWideEmailAddress> orgWideEmails = [SELECT Address FROM OrgWideEmailAddress];
        Set<String> orgWideEmailSet = new Set<String>();
        for (OrgWideEmailAddress owe : orgWideEmails) {
            orgWideEmailSet.add(owe.Address.toLowerCase()); // Convert to lowercase for case-insensitive comparison
        }
        for (caseNotificationClass caseNotification : csJSON) {
            Map<String, String> sendFrom = new Map<String, String>{
                'name' => caseNotification.fromName,
                'email' => caseNotification.fromEmail
            };
            system.debug('To');
            //List<Map<String, String>> sendTo = convertListToRecipients(caseNotification.toAddress);
            List<Map<String, String>> sendTo = new List<Map<String, String>>();
            List<Map<String, String>> sendCc = new List<Map<String, String>>();
            List<Map<String, String>> sendBcc = new List<Map<String, String>>();
            if(caseNotification.toAddress !=null){
                List<String> sanitizedTo = sanitizeAddresses(caseNotification.toAddress, orgWideEmailSet);
                if(sanitizedTo != null && sanitizedTo.size() > 0){
                    sendTo = convertListToRecipients(sanitizedTo);
                }
            }
            If (caseNotification.ccAddress !=null){
                List<String> sanitizedCC = sanitizeAddresses(caseNotification.ccAddress, orgWideEmailSet);
                if(sanitizedCC != null && sanitizedCC.size() > 0){
                    sendCc = convertListToRecipients(sanitizedCC);
                }
            }
            If (caseNotification.bccAddress !=null) {
                List<String> sanitizedBcc = sanitizeAddresses(caseNotification.bccAddress, orgWideEmailSet);
                if(sanitizedBcc != null && sanitizedBcc.size() > 0){
                    sendBcc = convertListToRecipients(sanitizedBcc);
                }
            }

            Case csAcct = [SELECT AccountId FROM Case WHERE Id = :caseNotification.caseId];
            If (csAcct.AccountId == null) {
                hasAcct = false;
            } else {
                hasAcct = true;
            }
            
            template = getTemplate(caseNotification.templateId);
            String SOQLFields = getMergeFields(template.Subject, template.HTMLValue);
            String caseId = caseNotification.caseId;
            String SOQLString = 'SELECT ' + SOQLFields + ' FROM Case WHERE Id = : caseNotification.caseId';
            Case cs = Database.query(SOQLString);
            String AccountName;
            If (SOQLFields.Contains('Account.Name')) {
                AccountName = cs.Account.Name;
            }
            String OwnerName;
            If (SOQLFields.Contains('Owner.Name')) {
                OwnerName = cs.Owner.Name;
            }
            String threadId = EmailMessages.getFormattedThreadingToken(caseNotification.caseId);
            String HTMLBody = ReplaceMergeFields(template.HtmlValue, cs, threadId, AccountName, OwnerName);
            String subject = ReplaceMergeFields(template.Subject, cs, threadId, AccountName, OwnerName);
            CreateEmailMessage(caseNotification.fromEmail, caseNotification.fromName, sendTo, sendCc, sendBcc, subject, caseNotification.templateId, HTMLBody, caseNotification.caseId);
        }
    }

    public static List<String> sanitizeAddresses(List<String> inputList, Set<String> orgWideEmailSet) {
        List<String> sanitizedListOfAddresses = new List<String>();
        for (String email : inputList) {
            if (!orgWideEmailSet.contains(email.toLowerCase())) {
                sanitizedListOfAddresses.add(email); // Add to the sanitized list if it's not an Org-Wide Email
            }
        }
        return sanitizedListOfAddresses;
    }
}