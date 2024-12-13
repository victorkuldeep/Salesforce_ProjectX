/**
 * @description       : 
 * @author            : 
 * @group             : 
 * @last modified on  : 12-13-2024
 * @last modified by  : 
**/
public with sharing class UserOrchestrationWorkItemController {
    private static final String ASSIGNED = 'Assigned';
    public UserOrchestrationWorkItemController() {
        System.debug('UserOrchestrationWorkItemController Initilized');
    }
    @AuraEnabled(cacheable=true)
    public static List<FlowOrchestrationWorkItem> getMyItems() {
        
        Id currentUserId = UserInfo.getUserId();
        Id currentUserRoleId = UserInfo.getUserRoleId();
        
        // Fetch groups the current user belongs to
        Set<Id> groupIds = new Set<Id>();
        Set<Id> userOrgroupIds = new Set<Id>();
        
        userOrgroupIds.add(currentUserId);
        // Fetch Groups where Roleid is associated
        for(Group gr : [Select id from Group where RelatedId = : currentUserRoleId]){
            userOrgroupIds.add(gr.Id);
        }
        for (GroupMember gm : [
            SELECT GroupId FROM GroupMember WHERE UserOrGroupId IN :userOrgroupIds
        ]) {
            groupIds.add(gm.GroupId);
        }

        System.debug(JSON.serialize(groupIds));
        // Fetch FlowOrchestrationWorkItems assigned to the user or their groups
        return [
            SELECT Id, Name, Status, CreatedDate,Lastmodifieddate, AssigneeId,Assignee.Name,Assignee.Type,RelatedRecordId,RelatedRecord.Name,StepInstanceId,StepInstance.Name 
            FROM FlowOrchestrationWorkItem
            WHERE Status =: ASSIGNED AND ( AssigneeId IN :groupIds OR AssigneeId = :currentUserId)
            ORDER BY CreatedDate DESC
        ];
    }
}