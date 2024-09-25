/**
* @description       : 
* @author            : 
* @group             : 
* @last modified on  : 09-25-2024
* @last modified by  : Kuldeep Singh
**/
@isTest
public class EmailPublisherForCaseTest {
    
    @testSetup
    static void setupData() {
        // Create a case for testing
        Case testCase = new Case(
            Priority = 'High', 
            SuppliedEmail = 'test@example.com'
        );
        insert testCase;
    }
    
    @isTest
    static void testOnInitDefaultsWithSuppliedEmail() {
        //Create test data here
        Exception failureDuringExecution = null;
        // Query the case created in testSetup
        Case testCase = [SELECT Id, SuppliedEmail FROM Case LIMIT 1];
        String defaultsAsJSON = '[{"targetSObject":{"attributes":{"type":"EmailMessage"},'
            + '"TextBody":"","FromName":"Test","FromAddress":"test@example.com","HtmlBody":"<html><body></body></html>",'
            + '"BccAddress":"test@example.com","CcAddress":"","ToAddress":"test@example.com","Subject":"Testing"},'
            + '"contextId":"'+ String.valueOf(testCase.Id) +'",'
            + '"actionType":"Email","actionName":"Case.Email","fromAddressList":["salesforce@test.com"]}]';
        List<QuickAction.SendEmailQuickActionDefaults> defaultsSettings = 
            (List<QuickAction.SendEmailQuickActionDefaults>)JSON.deserialize(defaultsAsJSON, List<QuickAction.SendEmailQuickActionDefaults>.class);
        Test.startTest();
        try { (new EmailPublisherForCase()).onInitDefaults(defaultsSettings); }
        catch(Exception failure) { failureDuringExecution = failure; }
        Test.stopTest();
    }
}