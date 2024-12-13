import { LightningElement, track } from "lwc";
import getMyItems from "@salesforce/apex/UserOrchestrationWorkItemController.getMyItems";
export default class UserOrchestrationWorkItemComponent extends LightningElement {
    @track items = [];
    @track isLoading = true;
    title = "My Items";

    columns = [
        {
            label: "Name",
            fieldName: "Name", // URL field => RecordIdUrl
            type: "text",
            typeAttributes: {
                label: { fieldName: "Name" },
                target: "_blank"
            }
        },
        {
            label: "Assigned To",
            fieldName: "AssignedToUrl", // URL field
            type: "url",
            typeAttributes: {
                label: { fieldName: "AssignedTo" },
                target: "_blank"
            }
        },
        {
            label: "Context Record",
            fieldName: "ContextRecordUrl", // URL field
            type: "url",
            typeAttributes: {
                label: { fieldName: "ContextRecord" },
                target: "_blank"
            }
        },
        { label: "Step", fieldName: "Step", type: "text" },
        { label: "Status", fieldName: "Status", type: "text" },
        {
            label: "Created Date",
            fieldName: "CreatedDate",
            type: "date"
        }
    ];

    connectedCallback() {
        this.fetchItems();
    }

    fetchItems() {
        this.isLoading = true;
        getMyItems()
            .then((data) => {
                this.items = data.map((row) => {
                    const isQueue = row.Assignee?.Type === "Queue";
                    return {
                        ...row,
                        RecordIdUrl: row.Id
                            ? `/lightning/r/${row.Id}/view`
                            : null,
                        AssignedTo: row.Assignee?.Name || "N/A",
                        AssignedToUrl: row.AssigneeId
                            ? `/lightning/r/${row.AssigneeId}/view`
                            : null,
                        AssigneeType: row.Assignee?.Type || "N/A",
                        ContextRecord: row.RelatedRecord?.Name || "N/A",
                        ContextRecordUrl: row.RelatedRecordId
                            ? `/lightning/r/${row.RelatedRecordId}/view`
                            : null,
                        Step: row.StepInstance.Name,
                        StepUrl: row.StepInstanceId
                            ? `/lightning/r/${row.StepInstanceId}/view`
                            : null
                    };
                });
                //this.items = data;
                this.isLoading = false;
                this.title = this.title + " (" + this.items.length + ")";
            })
            .catch((error) => {
                console.error("Error fetching items:", error);
                this.isLoading = false;
            });
    }
}
