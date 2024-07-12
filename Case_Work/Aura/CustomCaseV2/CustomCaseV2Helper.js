({
    createLWC: function (component, headerText) {
        // Overlay lib is used to create pop up moadal and show LWC inside and act as a container
        var overlayLib = component.find("overlayLib");
        // Dynamically create the LWC component inside the modal
        $A.createComponent(
            "c:newCaseLWC",
            {
                recordId: component.get("v.recordId"),
                objectApiName: "Case",
                isReadOnly: false,
                onsubmitsuccess: component.getReference("c.handleSubmitSuccess")
            },

            function (newCaseLWC, status, errorMessage) {

                if (status === "SUCCESS") {
                    var body = component.get("v.body") || [];
                    body.push(newCaseLWC);
                    component.set("v.body", body);

                    overlayLib.showCustomModal({

                        header: headerText,
                        body: newCaseLWC,
                        showCloseButton: false,
                        cssClass: "slds-modal_large",

                        closeCallback: function () {
                            // Callback function when modal is closed
                            component.set("v.isModalOpen", false);
                            // Navigate back to the Case tab list view
                            var navService = component.find("navService");
                            var recordId = component.get("v.recordId");
                            var pageReference;
                            if (recordId) {
                                    var workspaceAPI = component.find("workspace");
                                    workspaceAPI.getFocusedTabInfo().then(function(response) {
                                        var focusedTabId = response.tabId;
                                        console.log('Tab Name '+JSON.stringify(response));
                                        var parentTitle = response.title;
                                        if(response.title.includes('Edit')){
                                            workspaceAPI.closeTab({tabId: focusedTabId});
                                        }else{
                                            response.subtabs.forEach(function(subtab) {
                                                var matchTitle = 'Edit '+parentTitle;
                                                console.log(matchTitle , "  -- ",subtab.title );
                                                console.log(matchTitle.includes(subtab.title));
                                                if(matchTitle.includes(subtab.title)){
                                                    console.log('--->Elements--> '+JSON.stringify(subtab));
                                                    workspaceAPI.closeTab({tabId: subtab.tabId});
                                                }
                                               
                                              });
                                             
                                        }
                                        
                                    })
                                    .catch(function(error) {
                                        console.log(error);
                                    });

                                //}
                                
                            } else {
                                // Navigate to the Case tab list view
                                pageReference = {
                                    type: 'standard__objectPage',
                                    attributes: {
                                        objectApiName: 'Case',
                                        actionName: 'list'
                                    }, state: {}
                                };
                                var workspaceAPI = component.find("workspace");
                                    workspaceAPI.getFocusedTabInfo().then(function(response) {
                                        var focusedTabId = response.tabId;
                                        console.log('New Tab Name '+JSON.stringify(response));
                                        if(response.title.includes('New')){
                                            workspaceAPI.closeTab({tabId: focusedTabId});
                                            console.log('response Satte '+response.pageReference.state.ws);
                                            if(response.pageReference.state.ws){
                                                window.location.href = window.location.origin+''+response.pageReference.state.ws;
                                            }else{
                                                window.location.href = window.location.origin+'/lightning/o/Case/list';
                                            }
                                            
                                        }
                                    });
                            }

                            // Navigate using the navigation service
                           /* navService.navigate(pageReference).then(function (response) {
                                console.log('Navigation Done');
                            }).catch(function (error) {
                                console.error('Navigation error: ' + JSON.stringify(error));
                            });*/
                        }
                    });
                    component.set("v.isModalOpen", true);
                } else if (status === "INCOMPLETE") {
                    console.log("No response from server or client is offline.");
                } else if (status === "ERROR") {
                    console.log("Error: " + errorMessage);
                }
            }
        );
    },
    handleSubmitSuccess : function(component, event, helper) {
        console.log('11111Event has been caught');
        //if you are passing data in detail of event
        //console.log(event.getParam("--data--"));
    }
})