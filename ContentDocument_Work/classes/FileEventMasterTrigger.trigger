/**
 * @description       : 
 * @author            : 
 * @group             : 
 * @last modified on  : 09-06-2024
 * @last modified by  : 
**/
trigger FileEventMasterTrigger on FileEvent__e (after insert) {
    FileEventMasterTriggerHandler.handleAfterInsert(trigger.new);
}