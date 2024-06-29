/**
 * @description       : 
 * @author            : Kuldeep Singh
 * @group             : 
 * @last modified on  : 06-29-2024
 * @last modified by  : Kuldeep Singh
**/
public with sharing class CaseController {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountOptions() {
        return [SELECT Id, Name FROM Account ORDER BY Name ASC];
    }
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactsForAccount(Id accountId) {
        return [SELECT Id, Name FROM Contact WHERE AccountId = :accountId ORDER BY Name ASC];
    }
    @AuraEnabled(cacheable=false)
    public static List<Contact> getContacts(Id accountId) {
        Set<String> contactId = new Set<String>();
        for(AccountContactRelation arc : [select Contact.Id,Contact.Name from AccountContactRelation WHERE Account.Id = :accountId And isActive = true]){
            contactId.add(arc.Contact.Id);
        }
        return [SELECT Id, Name FROM Contact WHERE Id = :contactId];
    }
}