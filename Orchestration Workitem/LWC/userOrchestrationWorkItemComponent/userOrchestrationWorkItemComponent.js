import { LightningElement, track } from "lwc";
import getMyItems from "@salesforce/apex/UserOrchestrationWorkItemController.getMyItems";
import {
    titlePrefix,
    defaultPageSize,
    footerLeftLabel,
    noRecordsMessage,
    searchFields,
    delayTime,
    columns,
    sortCriteria,
    filterCriteria,
    lastUpdated,
    lastUpdatedMinute
} from "./userOrchestrationWorkItemComponentConfigurator.js";
export default class UserOrchestrationWorkItemComponent extends LightningElement {
    @track items = [];
    @track filteredItems = []; // Array for displaying filtered data
    @track displayedItems = [];
    searchTerm;
    loading;
    title;
    titlePrefix = titlePrefix;
    error;
    showTable;
    noRecordsMessage = noRecordsMessage;
    debounceTimeout;
    // Pagination properties
    pageSize = defaultPageSize; // Number of rows per page
    footerLeftLabel = footerLeftLabel;
    currentPage = 1;
    totalPages = 0;
    totalFiles = 0;
    counterString;
    first = true; // Disable first and previous button initially
    last = false; // Disable next and last button initially
    showBar = false; // Show the pagination bar conditionally
    columns = columns;
    sortCriteria = sortCriteria;
    filterCriteria = filterCriteria;
    lastUpdated = lastUpdated;
    lastUpdatedTime;
    intervalId;

    connectedCallback() {
        this.fetchItems();
        this.lastUpdatedTime = new Date();
        this.updateLastUpdatedMessage();
        // Start the interval to update the message every minute
        this.intervalId = setInterval(() => {
            this.updateLastUpdatedMessage();
        }, 60000); // 60,000 ms = 1 minute
    }
    disconnectedCallback() {
        // Clear the interval when the component is destroyed
        clearInterval(this.intervalId);
    }

    updateLastUpdatedMessage() {
        const now = new Date();
        const diffInMinutes = Math.floor((now - this.lastUpdatedTime) / 60000);

        if (diffInMinutes === 0) {
            this.lastUpdated = lastUpdated; // Default from Configurator JS
        } else if (diffInMinutes === 1) {
            this.lastUpdated = lastUpdatedMinute; // Default from Configurator JS
        } else {
            this.lastUpdated = `Updated ${diffInMinutes} minutes ago`;
        }
    }

    fetchItems() {
        this.loading = true;
        getMyItems()
            .then((data) => {
                this.restructureTableData(data);
                this.filteredItems = [...this.items]; // Initialize filtered files
                this.updateDisplayedItems(); // Update displayed files
                this.initPagination();
                this.loading = false;
            })
            .catch((error) => {
                console.error("Error fetching items:", error);
                this.loading = false;
            });
    }

    restructureTableData(data) {
        this.items = data.map((row) => {
            const isQueue = row.Assignee?.Type === "Queue";
            return {
                ...row,
                RecordIdUrl: row.Id ? `/lightning/r/${row.Id}/view` : null,
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
    }
    // Initialize pagination settings
    initPagination() {
        this.currentPage = 1; // Reset to the first page on search
        this.totalPages = Math.ceil(this.filteredItems.length / this.pageSize); // Update total pages
        this.totalFiles = this.filteredItems.length;
        this.title = this.titlePrefix;
        this.title = this.title + " (" + this.items.length + ")";
        this.showBar = this.items.length > 0;
        this.showTable = this.items.length > 0;
        this.counterString =
            this.filteredItems.length > this.pageSize
                ? this.pageSize + "+"
                : this.filteredItems.length;
    }

    handleRefresh(event) {
        console.log("Refresh Event Captured");
        this.searchTerm = ""; // Clear the input field
        this.loading = true; // Show the spinner
        event.target.blur();
        // Move focus to the search bar
        const searchBar = this.template.querySelector(".search-bar");
        console.log(searchBar);
        if (searchBar) {
            searchBar.focus();
        }
        this.fetchItems();
        this.lastUpdatedTime = new Date();
        this.updateLastUpdatedMessage();
        // Clear the interval when the component is destroyed
        clearInterval(this.intervalId);
        // Start the interval to update the message every minute
        this.intervalId = setInterval(() => {
            this.updateLastUpdatedMessage();
        }, 60000); // 60,000 ms = 1 minute
    }
    handleSearch(event) {
        // Clear the previous timeout if the user is still typing
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        this.searchTerm = event.target.value.toLowerCase(); // Get search term
        this.debounceTimeout = setTimeout(() => {
            this.filteredItems = this.items.filter((item) => {
                return searchFields.some((field) => {
                    return (
                        item[field] &&
                        item[field].toLowerCase().includes(this.searchTerm)
                    );
                });
            });
            this.initPagination();
            this.updateDisplayedItems();
        }, delayTime);
    }

    updateDisplayedItems() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.displayedItems = this.filteredItems.slice(start, end); // Get current page data
        // Update button states
        this.first = this.currentPage === 1;
        this.last = this.currentPage === this.totalPages;
    }

    // Handle the 'Next' button click
    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updateDisplayedItems();
        }
    }

    // Handle the 'Previous' button click
    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateDisplayedItems();
        }
    }

    // Handle the 'First' button click
    handleFirst() {
        this.currentPage = 1;
        this.updateDisplayedItems();
    }

    // Handle the 'Last' button click
    handleLast() {
        this.currentPage = this.totalPages;
        this.updateDisplayedItems();
    }
}