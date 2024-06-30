({
    handleInit: function(component, event, helper) {
        
        var overlayLib = component.find("overlayLib");
        var recordId = component.get("v.recordId");
        if(recordId){
            var action = component.get("c.getCaseDetails");
            action.setParams({
                caseId: recordId
            });
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var caseRecord = response.getReturnValue();
                    var headerText = 'Edit Case - ' + caseRecord.CaseNumber + ' (' + caseRecord.Subject + ')';
                    component.set("v.headerText", headerText);
                    helper.createLWC(component, headerText);
                } else {
                    console.error("Failed to fetch Case details with state: " + state);
                }
            });
            $A.enqueueAction(action);
        }else{
            var headerText = 'New Case';
            component.set("v.headerText", headerText);
            helper.createLWC(component, headerText);
        }
    }
})