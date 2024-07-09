@isTest
public class ContactControllerTest {
    
    @testSetup
    static void setupTestData() {
        // Create Contact
    }

    @isTest
    static void testGetRecordTypes() {
        Test.startTest();
        List<RecordType> recordTypes = ContactController.getRecordTypes();
        Test.stopTest();
    }

    @isTest
    static void testGetRecordTypeByName() {
        Test.startTest();
        List<RecordType> recordTypes = ContactController.getRecordTypeByName('Contact');
        Test.stopTest();
    }
}