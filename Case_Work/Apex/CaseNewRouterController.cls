/**
 * @description       : 
 * @author            : Kuldeep Singh
 * @group             : 
 * @last modified on  : 03-15-2025
 * @last modified by  : Kuldeep Singh
**/
public with sharing class CaseNewRouterController {
    public class RecordTypeOption {
        @AuraEnabled public String value;
        @AuraEnabled public String label;
        
        public RecordTypeOption(String value, String label) {
            this.value = value;
            this.label = label;
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<RecordTypeOption> getRecordTypes() {
        List<RecordTypeOption> options = new List<RecordTypeOption>();
        try {
            for (RecordType rt : [
                SELECT Id, Name 
                FROM RecordType 
                WHERE SObjectType = 'Case' 
                AND IsActive = true
                ORDER BY Name
            ]) {
                options.add(new RecordTypeOption(rt.Id, rt.Name));
            }
            return options;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static String getRecordTypeName(Id recordTypeId) {
        try {
            RecordType rt = [SELECT Name 
                           FROM RecordType 
                           WHERE Id = :recordTypeId 
                           AND SObjectType = 'Case' 
                           LIMIT 1];
            return rt.Name;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}