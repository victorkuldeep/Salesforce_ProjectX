/**
 * @description       : 
 * @author            : Kuldeep Singh
 * @group             : 
 * @last modified on  : 07-02-2024
 * @last modified by  : Kuldeep Singh
**/
public with sharing class ContactController {
    @AuraEnabled(cacheable=true)
    public static List<RecordType> getRecordTypes() {
        return [SELECT Id, Name FROM RecordType WHERE SObjectType = 'Contact' AND IsActive = true];
    }
    @AuraEnabled(cacheable=true)
    public static List<RecordType> getRecordTypeByName(String recordTypeName) {
        return [SELECT Id, Name FROM RecordType WHERE SObjectType = 'Contact' AND IsActive = true And Name =: recordTypeName];
    }
}