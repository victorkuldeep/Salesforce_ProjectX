/**
* @File Name : EmailPublisherForCase.cls
* @Description :
* @Author :
* @Last Modified By : Kuldeep Singh
* @Last Modified On : 09-25-2024
* @Modification Log :
*==============================================================================
* Ver | Date | Author | Modification
*==============================================================================
* 1.0 | September 23, 2024 |   | Initial Version
**/

global class EmailPublisherForCase implements QuickAction.QuickActionDefaultsHandler {

	// Default Empty constructor - Required for the Quick Action to invoke this Apex
    global EmailPublisherForCase() {
    }
    
    /** Interface Method Custom Implementation */
    global void onInitDefaults(QuickAction.QuickActionDefaults[] defaults) {
        
        QuickAction.SendEmailQuickActionDefaults sendEmailDefaults = (QuickAction.SendEmailQuickActionDefaults)defaults.get(0);
        
        // Get the email message object
        EmailMessage emailMessage = (EmailMessage) sendEmailDefaults.getTargetSObject();

        // Fetch the case associated with the email context
        Case c = [SELECT CaseNumber, Priority, SuppliedEmail FROM Case WHERE Id = :sendEmailDefaults.getContextId()];
        
        // Replace with the actual email-to-case handler default email address if SuppliedEMail is not available
        String emailToCaseAddress = 'xxx@yyy.com';
        
        // Set the 'From' address to the Email-to-Case handler email address
        emailMessage.fromAddress = c.SuppliedEmail != null ? c.SuppliedEmail : emailToCaseAddress;

        /** Any other pre-setup can be implemented here like templates and all */
    }
}