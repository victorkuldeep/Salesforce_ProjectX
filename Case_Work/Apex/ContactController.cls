/**
 * @description       : 
 * @author            : Kuldeep Singh
 * @group             : 
 * @last modified on  : 06-29-2024
 * @last modified by  : Kuldeep Singh
**/
public with sharing class ContactController {
    @AuraEnabled(cacheable=true)
    public static List<RecordType> getRecordTypes() {
        return [SELECT Id, Name FROM RecordType WHERE SObjectType = 'Contact' AND IsActive = true];
    }
}
