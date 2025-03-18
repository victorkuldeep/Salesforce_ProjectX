({
    doInit: function (component, event, helper) {
        component.set("v.isLoading", true);
        var action = component.get("c.getRecordTypes");

        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.recordTypes", response.getReturnValue());
            } else {
                console.error('Error fetching record types: ', response.getError());
                helper.showToast('Error', 'Failed to load record types', 'error');
            }
            component.set("v.isLoading", false);
        });

        $A.enqueueAction(action);

        // ✅ Set the tab label immediately after the component is loaded
        var workspaceAPI = component.find("workspace");
        workspaceAPI.getFocusedTabInfo()
            .then(function (tabInfo) {
                if (tabInfo) {
                    workspaceAPI.setTabLabel({
                        tabId: tabInfo.tabId,
                        label: "New Case"
                    }).catch(function (error) {
                        console.error('Failed to set initial tab label:', error);
                    });

                    // ✅ Optionally set a relevant tab icon
                    workspaceAPI.setTabIcon({
                        tabId: tabInfo.tabId,
                        icon: 'standard:case',
                        iconAlt: 'New Case'
                    }).catch(function (error) {
                        console.error('Failed to set initial tab icon:', error);
                    });
                }
            })
            .catch(function (error) {
                console.error('Failed to get focused tab info:', error);
            });

    },

    handleRecordTypeChange: function (component, event, helper) {
        var selectedValue = event.getSource().get("v.value");
        component.set("v.selectedRecordType", selectedValue);
    },

    handleContinue: function (component, event, helper) {
        component.set("v.isLoading", true);
        var recordTypeId = component.get("v.selectedRecordType");

        if (!recordTypeId) {
            helper.showToast('Error', 'Please select a record type', 'error');
            component.set("v.isLoading", false);
            return;
        }

        var action = component.get("c.getRecordTypeName");
        action.setParams({ "recordTypeId": recordTypeId });

        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var recordTypeName = response.getReturnValue();
                console.log('Selected Record Type Name: ', recordTypeName);
                helper.navigateBasedOnRecordType(component, recordTypeId, recordTypeName);
            } else {
                console.error('Error fetching record type name: ', response.getError());
                helper.showToast('Error', 'Failed to determine record type', 'error');
                component.set("v.isLoading", false);
            }
        });

        $A.enqueueAction(action);
    },

    handleCancel: function (component, event, helper) {
        helper.closeCurrentTabAndReturn(component);
    }
})