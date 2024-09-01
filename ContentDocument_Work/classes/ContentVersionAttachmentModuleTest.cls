/**
 * @description       : 
 * @author            : Kuldeep Singh
 * @group             : 
 * @last modified on  : 08-31-2024
 * @last modified by  : Kuldeep Singh
**/
@isTest
public with sharing class ContentVersionAttachmentModuleTest {
    @isTest
    static void testContentVersionDeletion() {
        // Step 1: Set up a disallowed file extension and create ContentVersion
        String disallowedFileExtension = 'exe'; // Example of a disallowed file extension
        ContentDocumentHelper refx1 = new ContentDocumentHelper();
        ContentVersionTriggerHandler refx2 = new ContentVersionTriggerHandler();
        // Step 2: Insert ContentVersion with a disallowed extension
        ContentVersion contentVersion = new ContentVersion();
        contentVersion.Title = 'Test File';
        contentVersion.PathOnClient = 'TestFile.' + disallowedFileExtension; // Using disallowed extension
        contentVersion.VersionData = Blob.valueOf('Test Content'); // Example file content
        
        // Step 3: Start Test Context
        Test.startTest();
        insert contentVersion; // This insert should trigger deletion logic in the trigger
        Test.stopTest(); // End Test Context
        
        // Step 4: Assert that the ContentDocument was deleted
        List<ContentVersion> contentVersions = [SELECT Id FROM ContentVersion WHERE Id = :contentVersion.Id];
        
        // Assert that ContentVersion is deleted
        System.assertEquals(0, contentVersions.size(), 'ContentVersion should be deleted because of the disallowed extension.');
    }
}