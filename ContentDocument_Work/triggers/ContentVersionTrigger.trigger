/**
 * @description       : 
 * @author            : Kuldeep Singh
 * @group             : 
 * @last modified on  : 08-31-2024
 * @last modified by  : Kuldeep Singh
**/
trigger ContentVersionTrigger on ContentVersion (after insert) {
    
    if (Trigger.isAfter && Trigger.isInsert) {

        ContentVersionTriggerHandler.handleAfterInsert(Trigger.new);
    }
}