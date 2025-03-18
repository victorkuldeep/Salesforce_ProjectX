({
    navigateBasedOnRecordType: function (component, recordTypeId, recordTypeName) {
        var workspaceAPI = component.find("workspace");

        workspaceAPI.isConsoleNavigation()
            .then(function (isConsole) {
                if (!isConsole) {
                    console.error('This component must be used in a Console App');
                    this.showToast('Error', 'This feature is only available in a Console App', 'error');
                    component.set("v.isLoading", false);
                    return;
                }

                // Get current tab info
                workspaceAPI.getFocusedTabInfo()
                    .then(function (tabInfo) {
                        var currentTabId = tabInfo.tabId;
                        console.log('Current Tab ID: ', currentTabId);
                        var pageReference;
                        if (recordTypeName === 'Support') {
                            pageReference = {
                                type: "standard__component",
                                attributes: {
                                    componentName: "c__CustomCaseV2"
                                },
                                state: {
                                    c__recordTypeId: recordTypeId
                                }
                            };
                        } else {
                            pageReference = {
                                type: "standard__objectPage",
                                attributes: {
                                    objectApiName: "Case",
                                    actionName: "new"
                                },
                                state: {
                                    recordTypeId: recordTypeId,
                                    nooverride: "1",
                                    defaultFieldValues: `retURL=%2Flightning%2Fo%2FCase%2Flist%3FfilterName%3DRecent`,
                                    retURL: '/lightning/o/Case/list?filterName=Recent'
                                }
                            };
                        }

                        // Open the new tab
                        workspaceAPI.openTab({
                            pageReference: pageReference,
                            focus: true
                        })
                            .then(function (newTabId) {
                                console.log('Opened New Tab ID: ', newTabId);
                                // ✅ Set the tab label to "New"
                                workspaceAPI.setTabLabel({
                                    tabId: newTabId,
                                    label: "New"
                                }).then(function () {
                                    console.log('Tab label set to New');
                                }).catch(function (error) {
                                    console.error('Failed to set tab label:', error);
                                });

                                // ✅ Optionally set a tab icon (e.g., for Case object)
                                workspaceAPI.setTabIcon({
                                    tabId: newTabId,
                                    icon: 'standard:case', // Use an appropriate icon name
                                    iconAlt: 'New Case'
                                }).then(function () {
                                    console.log('Tab icon set');
                                }).catch(function (error) {
                                    console.error('Failed to set tab icon:', error);
                                });

                                // Close the current tab
                                workspaceAPI.closeTab({ tabId: currentTabId })
                                    .then(function () {
                                        console.log('Closed Current Tab ID: ', currentTabId);
                                    });
                            });
                    })
                    .catch(function (error) {
                        console.error('Navigation error: ', error);
                        this.showToast('Error', 'Navigation failed: ' + error.message, 'error');
                        component.set("v.isLoading", false);
                    });
            }.bind(this))
            .catch(function (error) {
                console.error('Console check error: ', error);
                this.showToast('Error', 'Failed to verify console context', 'error');
                component.set("v.isLoading", false);
            });
    },

    closeCurrentTabAndReturn: function (component) {
        var workspaceAPI = component.find("workspace");
        workspaceAPI.isConsoleNavigation()
            .then(function (isConsole) {
                if (!isConsole) {
                    console.error('Not in Console App');
                    this.navigateToListViewFallback(component);
                    return;
                }

                workspaceAPI.getFocusedTabInfo()
                    .then(function (response) {
                        var currentTabId = response.tabId;
                        console.log('Closing tab: ', currentTabId);
                        console.log(workspaceAPI);
                        return workspaceAPI.closeTab({ tabId: currentTabId });
                    })
                    .then(function () {
                        console.log('Tab closed successfully');
                        // Open the list view in a new tab
                        console.log(workspaceAPI);
                        window.location.href = '/lightning/o/Case/list?filterName=__Recent';
                    })
                    .catch(function (error) {
                        console.error('Error closing tab or opening list view: ', error);
                    });
            }.bind(this))
            .catch(function (error) {
                console.error('Console check error: ', error);
                this.navigateToListViewFallback(component);
            });
    },

    navigateToListViewFallback: function (component) {
        console.log('Using fallback navigation to list view');
        var navEvent = $A.get("e.force:navigateToURL");
        navEvent.setParams({
            "url": "/lightning/o/Case/list?filterName=__Recent"
        });
        navEvent.fire();
    },

    showToast: function (title, message, variant) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "variant": variant
        });
        toastEvent.fire();
    }
})