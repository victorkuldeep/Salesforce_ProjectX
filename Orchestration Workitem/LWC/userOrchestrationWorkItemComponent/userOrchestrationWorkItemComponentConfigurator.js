//UserOrchestrationWorkItemComponentConfigurator.js
export const titlePrefix = "My Work Items";
export const defaultPageSize = 5;
export const footerLeftLabel =
    "Click Refresh icon above to get latest assigned work items";
export const noRecordsMessage =
    "You have no assigned work items..!! Please refresh to check again.";

export const searchFields = [
    "Name",
    "Step",
    "Status",
    "ContextRecord",
    "AssignedTo",
    "CreatedDate"
];
export const delayTime = 1000; // Delay in Search
export const columns = [
    {
        label: "Name",
        fieldName: "Name", // URL field => RecordIdUrl
        type: "text",
        typeAttributes: {
            label: { fieldName: "Name" },
            target: "_blank"
        },
        sortable: "true"
    },
    {
        label: "Assigned To",
        fieldName: "AssignedToUrl", // URL field
        type: "url",
        typeAttributes: {
            label: { fieldName: "AssignedTo" },
            target: "_blank"
        },
        sortable: "true"
    },
    {
        label: "Context Record",
        fieldName: "ContextRecordUrl", // URL field
        type: "url",
        typeAttributes: {
            label: { fieldName: "ContextRecord" },
            target: "_blank"
        },
        sortable: "true"
    },
    { label: "Step", fieldName: "Step", type: "text", sortable: "true" },
    { label: "Status", fieldName: "Status", type: "text", sortable: "true" },
    {
        label: "Created Date",
        fieldName: "CreatedDate",
        type: "date",
        sortable: "true"
    }
];
export const sortCriteria = "Created Date";
export const filterCriteria = "Assigned orchestration work items";
export const lastUpdated = "Updated a few seconds ago";
export const lastUpdatedMinute = "Updated a minute ago";
