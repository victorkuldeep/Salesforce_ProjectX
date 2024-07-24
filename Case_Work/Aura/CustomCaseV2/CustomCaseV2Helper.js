({
    createLWC: function (component, headerText) {
        // Overlay lib is used to create pop up moadal and show LWC inside and act as a container
        var overlayLib = component.find("overlayLib");
        var accID = component.get("v.accountId");
        // Dynamically create the LWC component inside the modal
        $A.createComponent(
            "c:newCaseLWC",
            {
                recordId: component.get("v.recordId"),
                accountId: accID,
                objectApiName: "Case",
                isReadOnly: false,
                onsubmitsuccess: component.getReference("c.handleSubmitSuccess"),
                onsubmitcancel: component.getReference("c.handleSubmitCancel")
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
                            console.log('LWC Closed.')
                            component.destroy();
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
    extractAccountId: function (component, queryString) {

        var accountId = null;
        // Parse the URL to find the Account ID
        var urlParams = new URLSearchParams(queryString);
        var wsParam = urlParams.get('ws');

        if (wsParam) {
            // Decode the parameter to get the full URL
            var decodedWsParam = decodeURIComponent(wsParam);

            // Extract the Account ID from the decoded URL
            var accountIdMatch = decodedWsParam.match(/Account\/([a-zA-Z0-9]{18}|[a-zA-Z0-9]{15})/);

            if (accountIdMatch && accountIdMatch.length > 1) {
                accountId = accountIdMatch[1];
            }
        } else { // Bugfix - Component caching removed WS from URL and direct url received

            // Extract the Account ID from the decoded URL
            var accountIdMatch = queryString.match(/Account\/([a-zA-Z0-9]{18}|[a-zA-Z0-9]{15})/);

            if (accountIdMatch && accountIdMatch.length > 1) {
                accountId = accountIdMatch[1];
            }
        }

        // Set the Account ID to the component attribute
        component.set("v.accountId", accountId);
    }
})