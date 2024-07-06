({
    createLWC: function(component, headerText) {
        // Overlay lib is used to create pop up moadal and show LWC inside and act as a container
        var overlayLib = component.find("overlayLib");
        // Dynamically create the LWC component inside the modal
        $A.createComponent(
            "c:newCaseLWC",
            {   recordId: component.get("v.recordId"),
                objectApiName: "Case",
                isReadOnly: false
            },
            
            function(newCaseLWC, status, errorMessage){
            
                if (status === "SUCCESS") {
                    var body = component.get("v.body") || [];
                    body.push(newCaseLWC);
                    component.set("v.body", body);
                    
                    overlayLib.showCustomModal({
                        
                        header: headerText,
                        body: newCaseLWC,
                        showCloseButton: true,
                        cssClass: "slds-modal_large",
                        
                        closeCallback: function() {
                            // Callback function when modal is closed
                            component.set("v.isModalOpen", false);
                            // Navigate back to the Case tab list view
                            var navService = component.find("navService");
                            
                            var pageReference = {
                                type: 'standard__objectPage',
                                attributes: {
                                    objectApiName: 'Case',
                                    actionName: 'list'
                                },
                                state: {}
                            };
                            
                            // Navigate using the navigation service
                            navService.navigate(pageReference).then(function(response) {
                                console.log('Navigation Done');
                            }).catch(function(error) {
                                console.error('Navigation error: ' + JSON.stringify(error));
                            });
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
    }
})