@isTest
public class CaseControllerTest {
    
    @testSetup
    static void setupTestData() {
        // Create test account
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;
        
        // Create test contacts
        Contact testContact1 = new Contact(FirstName = 'Test', LastName = 'Contact1', Email = 'testcontact1@example.com', AccountId = testAccount.Id);
        Contact testContact2 = new Contact(FirstName = 'Test', LastName = 'Contact2', Email = 'testcontact2@example.com', AccountId = testAccount.Id);
        insert testContact1;
        insert testContact2;
        
        // Create test case
        Case testCase = new Case(Subject = 'Test Case', AccountId = testAccount.Id);
        insert testCase;

    }
    
    @isTest
    static void testGetAccountOptions() {
        Test.startTest();
        List<Account> accounts = CaseController.getAccountOptions();
        Test.stopTest();
    }
    
    @isTest
    static void testGetContactsForAccount() {
        // Get test account
        Account testAccount = [SELECT Id FROM Account WHERE Name = 'Test Account' LIMIT 1];
        
        Test.startTest();
        List<Contact> contacts = CaseController.getContactsForAccount(testAccount.Id);
        Test.stopTest();
    }
    
    @isTest
    static void testGetContacts() {
        // Get test account
        Account testAccount = [SELECT Id FROM Account WHERE Name = 'Test Account' LIMIT 1];
        
        Test.startTest();
        List<Contact> contacts = CaseController.getContacts(testAccount.Id);
        Test.stopTest();
    }
    
    @isTest
    static void testGetCaseDetails() {
        // Get test case
        Case testCase = [SELECT Id FROM Case WHERE Subject = 'Test Case' LIMIT 1];
        
        Test.startTest();
        Case caseDetails = CaseController.getCaseDetails(testCase.Id);
        Test.stopTest();
    }
}