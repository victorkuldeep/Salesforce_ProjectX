/**
 * @description       : 
 * @author            : Kuldeep Singh
 * @group             : 
 * @last modified on  : 08-31-2024
 * @last modified by  : Kuldeep Singh
**/
public with sharing class ContentVersionTriggerHandler {

    public ContentVersionTriggerHandler() {
        System.debug('ContentVersionTriggerHandler instantiated');
    }

    public static void handleAfterInsert(List<ContentVersion> contentVersions) {
        
        ContentDocumentHelper.processContentVersions(contentVersions);
    }
}