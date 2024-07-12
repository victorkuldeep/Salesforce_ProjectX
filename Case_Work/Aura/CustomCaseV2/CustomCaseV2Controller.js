({
    handleInit: function (component, event, helper) {

        var recordId = component.get("v.recordId");
        if (recordId) {
            var action = component.get("c.getCaseDetails");
            action.setParams({
                caseId: recordId
            });
            action.setCallback(this, function (response) {
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
        } else {
            var headerText = 'New Case';
            component.set("v.headerText", headerText);
            helper.createLWC(component, headerText);
        }
    },
    handleSubmitSuccess : function(component, event, helper) {
        console.log('Event has been caught from Controller ',JSON.stringify(event));
        var workspaceAPI = component.find("workspace");
        workspaceAPI.getFocusedTabInfo().then(function(response) {
            var focusedTabId = response.tabId;
            console.log('Tab Name '+JSON.stringify(response));
            var parentTitle = response.title;
            if(response.title.includes('Edit')){
                workspaceAPI.closeTab({tabId: focusedTabId});
            }else if(response.title.includes('New Case')){
                //workspaceAPI.closeTab({tabId: focusedTabId});
                if(response.pageReference.state.ws){
                    //window.location.href = window.location.origin+''+response.pageReference.state.ws;
                }else{
                    //window.location.href = window.location.origin+'/lightning/o/Case/list';
                }

            }
            else{
                response.subtabs.forEach(function(subtab) {
                    var matchTitle = 'Edit '+parentTitle;
                    console.log(matchTitle , "  -- ",subtab.title );
                    console.log(matchTitle.includes(subtab.title));
                    if(matchTitle.includes(subtab.title) || subtab.title.includes('New Case')){
                        console.log('--->Elements--> '+JSON.stringify(subtab));
                        workspaceAPI.closeTab({tabId: subtab.tabId});
                    }
                   
                  });
                 
            }
            
        })
        .catch(function(error) {
            console.log(error);
        });
    }
})