({
    handleInit: function (component, event, helper) {
        window.addEventListener("keydown", function (event) {
            var kcode = event.code;
            if (kcode == 'Escape') {
                console.log('escape id pess - Outer Component');
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        }, true);

        var recordId = component.get("v.recordId");
        var url = window.location.href;
        /** URL Parser Begin */
        var queryString = url.split('?')[1];

        if (queryString) {

            helper.extractAccountId(component, queryString);
        } else {

            /** Bugfix - Extract Accound ID from Direct URL */
            helper.extractAccountId(component, url);
        }

        console.log('accountId => ' + component.get("v.accountId"));
        /** URL Parser End */

        component.set("v.isReadOnly", false); // Example boolean value
        component.set("v.objectApiName", "Case"); // Example Text

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
                    //helper.createLWC(component, headerText);
                } else {
                    console.error("Failed to fetch Case details with state: " + state);
                }
            });

            $A.enqueueAction(action);

        } else {

            var headerText = 'New Case';
            component.set("v.headerText", headerText);
            //helper.createLWC(component, headerText);
        }
    },
    handleSubmitSuccess: function (component, event, helper) {

        console.log('Event has been caught from Controller ', JSON.stringify(event));

        var workspaceAPI = component.find("workspace");
        /** Aura Workspace API Navigation if required */
    },
    handleSubmitCancel: function (component, event, helper) {

        console.log('Event has been caught from >>>> ', JSON.stringify(event));

        var workspaceAPI = component.find("workspace");
        /** Aura Workspace API Navigation if required */
    }
})