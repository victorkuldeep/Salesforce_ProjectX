/**
* @File Name : EmailPublisherForCase.cls
* @Description :
* @Author :
* @Last Modified By : Kuldeep Singh
* @Last Modified On : 09-27-2024
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
        
        OrgWideEmailAddress owea = [Select Id, Address, DisplayName  from OrgWideEmailAddress where DisplayName =: System.Label.Default_Reply_To_Display_Name LIMIT 1];
        
        // Replace with the actual email-to-case handler default email address if SuppliedEMail is not available
        String emailToCaseAddress = owea.Address;
        
        // Set the 'From' address to the Email-to-Case handler email address
        emailMessage.fromAddress = emailToCaseAddress;//c.SuppliedEmail != null ? c.SuppliedEmail : emailToCaseAddress;

        /** Any other pre-setup can be implemented here like templates and all */
    }
}