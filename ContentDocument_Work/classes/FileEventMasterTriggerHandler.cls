/**
 * @description       : 
 * @author            : 
 * @group             : 
 * @last modified on  : 09-06-2024
 * @last modified by  : 
**/
public with sharing class FileEventMasterTriggerHandler {
    public FileEventMasterTriggerHandler() {
        System.debug('FileEventMasterTriggerHandler instantiated');
    }

    public static void handleAfterInsert(List<FileEvent__e> fileEvents) {
        
        List<ContentDocument> cdList = new List<ContentDocument>();
        
        for(FileEvent__e evt : fileEvents) {
        
            if(evt.Action__c == 'DELETE'){
                cdList.add(new ContentDocument(Id = evt.RecordId__c));
            }
        }
        
        if(cdList != null && !cdList.isEmpty()){
            Database.delete(cdList,false);
        }
    }
}