public with sharing class CTCEmailAuthorController {

    // Simple wrapper for template preview
    public class TemplateRenderResult {
        @AuraEnabled public String subject;
        @AuraEnabled public String htmlBody;
        public TemplateRenderResult(String s, String b){ subject = s; htmlBody = b; }
    }

    @AuraEnabled(cacheable=true)
    public static List<Folder> getEmailTemplateFolders() {
        return [SELECT Id, Name, Type FROM Folder WHERE Type = 'EmailTemplate' ORDER BY Name];
    }

    @AuraEnabled(cacheable=true)
    public static List<EmailTemplate> getEmailTemplates(String folderName) {
        if (String.isBlank(folderName)) return new List<EmailTemplate>();
        List<Folder> folders = [SELECT Id FROM Folder WHERE Name = :folderName AND Type = 'EmailTemplate' LIMIT 1];
        if (folders.isEmpty()) return new List<EmailTemplate>();
        return [
            SELECT Id, Name, Subject, Body, FolderId
            FROM EmailTemplate
            WHERE FolderId = :folders[0].Id
            ORDER BY Name
        ];
    }

    // Render a stored email template (this performs merge for merge fields)
    @AuraEnabled
    public static TemplateRenderResult renderTemplate(Id templateId, Id caseId) {
        if (templateId == null) return new TemplateRenderResult('', '');
        Id whoId = null;
        if (caseId != null) {
            Case c = [SELECT Id, ContactId FROM Case WHERE Id = :caseId LIMIT 1];
            if (c != null && c.ContactId != null) whoId = c.ContactId;
        }
        Messaging.SingleEmailMessage merged = Messaging.renderStoredEmailTemplate(templateId, whoId, caseId);
        String htmlBody = merged.getHtmlBody();
        String subj = merged.getSubject();
        return new TemplateRenderResult(subj == null ? '' : subj, htmlBody == null ? '' : htmlBody);
    }

    // Fetch EmailMessage addresses related to the case (returns sender & recipient text fields)
    @AuraEnabled(cacheable=true)
    public static List<EmailMessage> getCaseEmailAddress(Id caseRecordId) {
        if (caseRecordId == null) return new List<EmailMessage>();
        return [
            SELECT Id, ParentId, FromAddress, ToAddress, CcAddress, BccAddress
            FROM EmailMessage
            WHERE ParentId = :caseRecordId
            ORDER BY CreatedDate DESC
            LIMIT 5
        ];
    }

    @AuraEnabled(cacheable=true)
    public static OrgWideEmailAddress getOrgWideEmailAddress() {
        List<OrgWideEmailAddress> oa = [SELECT Id, Address FROM OrgWideEmailAddress LIMIT 1];
        return oa.isEmpty() ? null : oa[0];
    }

    // Send email, optionally attaching uploaded files (uploadedFiles = list of ContentDocumentIds)
    @AuraEnabled
    public static void sendEmailToController(
        List<String> toAddressEmail,
		List<String> ccAddressEmail,
		List<String> bccAddressEmail,
        Id orgWideEmailAddress,
        String subjectEmail,
        String bodyEmail,
        Id caseRecordId,
        List<Id> uploadedFiles
    ) {
        try {
            if (toAddressEmail == null || toAddressEmail.isEmpty()) {
                throw new AuraHandledException('No recipient provided.');
            }

            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
			if(caseRecordId != null && String.isNotBlank(caseRecordId)){
				mail.setWhatId(caseRecordId);
			}
			mail.setToAddresses(toAddressEmail);
			if (ccAddressEmail != null && !ccAddressEmail.isEmpty()) {
				mail.setCcAddresses(ccAddressEmail);
			}
			if (bccAddressEmail != null && !bccAddressEmail.isEmpty()) {
    			mail.setBccAddresses(bccAddressEmail);
			}
            if (orgWideEmailAddress != null) mail.setOrgWideEmailAddressId(orgWideEmailAddress);
            mail.setSubject(subjectEmail == null ? '' : subjectEmail);
            mail.setHtmlBody(bodyEmail == null ? '' : bodyEmail);
			// Attach files if provided (fetch latest versions)
            if (uploadedFiles != null && !uploadedFiles.isEmpty()) {
                List<ContentVersion> cvs = [
                    SELECT VersionData, Title, FileExtension
                    FROM ContentVersion
                    WHERE ContentDocumentId IN :uploadedFiles AND IsLatest = TRUE
                ];
                List<Messaging.EmailFileAttachment> attachments = new List<Messaging.EmailFileAttachment>();
                for (ContentVersion cv : cvs) {
                    Messaging.EmailFileAttachment efa = new Messaging.EmailFileAttachment();
                    String fileName = cv.Title;
                    if (!String.isBlank(cv.FileExtension)) fileName += '.' + cv.FileExtension;
                    efa.setFileName(fileName);
                    efa.setBody(cv.VersionData);
                    attachments.add(efa);
                }
                if (!attachments.isEmpty()) mail.setFileAttachments(attachments);
            }

            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
        } catch (Exception ex) {
            // Bubble friendly message back to client
            throw new AuraHandledException('Error sending email: ' + ex.getMessage());
        }
    }

    // Return latest ContentVersion records for files linked to the provided Case
    @AuraEnabled(cacheable=true)
    public static List<ContentVersion> fileAttachment(Id caseRecId) {
        if (caseRecId == null) return new List<ContentVersion>();
        List<ContentDocumentLink> cdLinks = [
            SELECT ContentDocumentId
            FROM ContentDocumentLink
            WHERE LinkedEntityId = :caseRecId
        ];
        if (cdLinks.isEmpty()) return new List<ContentVersion>();

        Set<Id> docIds = new Set<Id>();
        for (ContentDocumentLink l : cdLinks) docIds.add(l.ContentDocumentId);

        return [
            SELECT Id, ContentDocumentId, Title
            FROM ContentVersion
            WHERE ContentDocumentId IN :docIds AND IsLatest = TRUE
        ];
    }
}