public class SendGridEmailService {
    public static void sendEmail(Map<String, String> fromAddress, List<Map<String, String>> toAddress, List<Map<String, String>> ccAddress, List<Map<String, String>> bccAddress, String subject, String body, String contentType, String msgId) {
        //****************************************************************************/
        //              Function to send an email through Sendgrid                    /
        //              Created : 10/17/2024 - Lloy Sanders                           /
        //              https://shift4.atlassian.net/browse/PHX-11138                 /
        //              Modified :                                                    /
        //****************************************************************************/
        // Create addresses of email message.  CC and BCC cannot be used if the list does not have elements
        system.debug('Entering Send Email - Twillio MailSend API');
        List<Map<String, Object>> personalizations = new List<Map<String, Object>>();
        /** Bugfix - To/CC/BCC in various combinations */
        Map<String,Object> finalRecipentMap = new Map<String,Object>();
        if(toAddress != null && toAddress.size() > 0) {
            finalRecipentMap.put('to',toAddress);
        }
        if(ccAddress != null && ccAddress.size() > 0) {
            finalRecipentMap.put('cc',ccAddress);
        }
        if(bccAddress != null && bccAddress.size() > 0) {
            finalRecipentMap.put('bcc',bccAddress);
        }
        personalizations.add(finalRecipentMap);
        // Prepare the email payload
        String payload = JSON.serializePretty(new Map<String, Object>{
            'personalizations' => personalizations,
            'from' => fromAddress,
            'subject' => subject,
            'content' => new List<Map<String, String>>{
                new Map<String, String>{
                    'type' => contentType,
                    'value' => body
                }
            }
        });

        // Create HttpRequest using sendgrid Named Credential (related to sendgrid External Service)
        system.debug('send request');
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:sendgrid/mail/send');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json;charset=UTF-8');
        req.setBody(payload);
        Http http = new Http();
        system.debug(payload);
        
        HttpResponse res;
        EmailMessage msg = [SELECT Id, Email_Status__c FROM EmailMessage WHERE Id = :msgId LIMIT 1];
        
        try {
            res = http.send(req);
            if (res != null && res.getStatusCode() != 202) {
                System.debug('Failed to send email: ' + res.getBody());
                msg.Email_Status__c = 'Failed To Send';
            }else {
                msg.Email_Status__c = 'Sent';
            }
        } catch (Exception e) {
            System.debug('Error Sending Email to API - ' + e);
            msg.Email_Status__c = 'Fatally Failed';
        }
        Database.update(msg,false);
    }

    public Static List<Map<String, String>> convertListToRecipients(String recipients) {
        //****************************************************************************/
        //              Function to create a list of recipients from a list of emails /
        //              Created : 10/17/2024 - Lloy Sanders                           /
        //              https://shift4.atlassian.net/browse/PHX-11138                 /
        //              Modified :                                                    /
        //****************************************************************************/
        
        // Bugfix - memory manipulation
        List<String> recipList = recipients.replaceAll('\r',',').replaceAll(',',';').split(';');
        List<Map<String, String>> recipientList = new List<Map<String, String>>();
        for (String rec : recipList) {
            Map<String, String> recip = new Map<String, String>(); // Bugfix - memory manipulation fix
            recip.put('email', rec);
            recipientList.add(recip);
        }
        System.debug(JSON.serializePretty(recipientList));
        return recipientList;
    }

    @InvocableMethod
    public static void SendTheEmail(List<EmailMessage> msgs) {
        //****************************************************************************/
        //              Invocable Method to send the notification                     /
        //              Created : 10/23/2024 - Lloy Sanders                           /
        //              https://shift4.atlassian.net/browse/PHX-11138                 /
        //              Modified :                                                    /
        //****************************************************************************/
        EmailTemplate template = new EmailTemplate();
        
        for (EmailMessage msg : msgs) {
            Map<String, String> sendFrom = new Map<String, String>{
                'name' => msg.FromName,
                'email' => msg.FromAddress
            };
            List<Map<String, String>> sendTo = new List<Map<String, String>>();
            List<Map<String, String>> sendCc = new List<Map<String, String>>();
            List<Map<String, String>> sendBcc = new List<Map<String, String>>();
            if(msg.toAddress != null){
                sendTo = convertListToRecipients(msg.toAddress);
            }
            If (msg.ccAddress !=null){
                sendCc = convertListToRecipients(msg.ccAddress);
            }
            If (msg.bccAddress !=null) {
                sendBcc = convertListToRecipients(msg.bccAddress);
            }
            String HTMLVal = msg.HtmlBody;
            sendEmail(sendFrom, sendTo, sendCc, sendBcc, msg.Subject, HTMLVal, 'text/html', msg.Id);
        }
    }
}