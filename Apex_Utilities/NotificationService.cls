/**
 * @ClassName    : NotificationService
 * @JIRATicket   :
 * @CreatedOn    : 26/07/2024
 * @CreatedBy    : Izzie
 * @ModifiedBy   :
 * Description	: This class will be invoked from flows to send emails
 */
public class NotificationService {
    public class InputWrapper {
        @InvocableVariable(label='Related Record Id' required=true) //Related Record Id
        public String recordID;
        @InvocableVariable(label='Email Template Id' required=true) //Email Template Id
        public String emailTemplateID;
        @InvocableVariable(label='Contact Id' required=true) //record to send email to.
        public String contactID;
        @InvocableVariable(label='Sender Email Address' required=false) //Sender Email Address
        public String sender;
        @InvocableVariable(label='listOfTo' required=false) //ToAddress
        public List<String> listOfTo;
        @InvocableVariable(label='listOfCC' required=false) //CC address
        public List<String> listOfCC;
        @InvocableVariable(label='listOfBCC' required=false) //BCC Address
        public List<String> listOfBCC;
        @InvocableVariable(label='treatTargetObjectAsRecipient' required=false) //this will help in bypassing the logic if no contact
        public Boolean treatTargetObjectAsRecipient = true;
    }
    public static List<String> adjustNullElements(List<String> aStringList) {
        if (aStringList.size() > 0) {
            set<string> aStringSet = new Set<string>(aStringList);
            aStringSet.remove('');
            aStringSet.remove(null);
            aStringList = new List<string>(aStringSet);
        }
        return aStringList;
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

    @invocableMethod(label='SendEmailViaApex')
    public static void sendMail(List<InputWrapper> passedData) {
        List<OrgWideEmailAddress> orgWideEmails = [SELECT Address FROM OrgWideEmailAddress];
        Set<String> orgWideEmailSet = new Set<String>();
        for (OrgWideEmailAddress owe : orgWideEmails) {
            orgWideEmailSet.add(owe.Address.toLowerCase()); // Convert to lowercase for case-insensitive comparison
        }
        InputWrapper dw = passedData[0]; //first record
        Messaging.SingleEmailMessage mailToSend = new Messaging.SingleEmailMessage(); // object SingleEmailMessage
        mailToSend.setTargetObjectId(dw.contactID);
        mailToSend.setWhatId(dw.recordID);
        mailToSend.setTemplateID(dw.emailTemplateID);
        if (dw.listOfTo != null) {
            dw.listOfTo = adjustNullElements(dw.listOfTo);
            dw.listOfTo = sanitizeAddresses(dw.listOfTo, orgWideEmailSet);

            if (dw.listOfTo.size() > 0) {
                mailToSend.setToAddresses(dw.listOfTo);
            }
        }
        if (dw.listOfCC != null) {
            dw.listOfCC = adjustNullElements(dw.listOfCC);
            dw.listOfCC = sanitizeAddresses(dw.listOfCC, orgWideEmailSet);
            if (dw.listOfCC.size() > 0) {
                mailToSend.setCcAddresses(dw.listOfCC);
            }
        }
        if (dw.listOfBCC != null) {
            dw.listOfBCC = adjustNullElements(dw.listOfBCC);
            dw.listOfBCC = sanitizeAddresses(dw.listOfBCC, orgWideEmailSet);
            if (dw.listOfBCC.size() > 0) {
                mailToSend.setBccAddresses(dw.listOfBCC);
            }
        }
        if (!dw.treatTargetObjectAsRecipient) {
            mailToSend.setTreatTargetObjectAsRecipient(dw.treatTargetObjectAsRecipient);
        }
        if (dw.sender != null) {
            OrgWideEmailAddress[] owea = [SELECT Id FROM OrgWideEmailAddress WHERE Address = :dw.sender];
            if (owea.size() > 0) {
                mailToSend.setOrgWideEmailAddressId(owea.get(0).Id);
            }
        }
        if (!Test.isRunningTest()) {
            List<Messaging.SendEmailResult> sendResults = Messaging.sendEmail(new List<Messaging.Email>{ mailToSend });
        }
    }
}
