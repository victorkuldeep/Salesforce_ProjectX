import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord } from 'lightning/uiRecordApi';
import getContacts from '@salesforce/apex/CaseController.getContacts';
import getRecordTypes from '@salesforce/apex/ContactController.getRecordTypes';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import CONTACT_OBJECT from '@salesforce/schema/Contact';

export default class NewCaseLWC extends NavigationMixin(LightningElement) {
    @api recordId;
    @api isReadOnly
    @api objectApiName;
    @track contactOptions = [];
    @track fieldList = [];
    @track recordTypeOptions = [];
    accountId;
    contactId;
    isModalOpen = false; // Ensure this property is defined
    selectedRecordTypeId;
    selectedRecordTypeName;
    showRecordTypeSelection = true;
    showContactForm = false;
    // Static map to maintain record type names and their corresponding fields
    recordTypeFieldMap = {
        'EMEA': [
            { fieldName: 'FirstName' },
            { fieldName: 'LastName' },
            { fieldName: 'Email' },
            { fieldName: 'Phone' },
            // Add more fields specific to RecordTypeName1
        ],
        'US': [
            { fieldName: 'FirstName' },
            { fieldName: 'LastName' },
            { fieldName: 'Title' },
            { fieldName: 'Department' },
            // Add more fields specific to RecordTypeName2
        ],
        'Default': [
            { fieldName: 'FirstName' },
            { fieldName: 'LastName' },
            { fieldName: 'Title' },
            { fieldName: 'Department' },
            // Add more fields specific to RecordTypeName2
        ]
        // Add more record types and their fields as needed
    };

    @wire(getObjectInfo, { objectApiName: CONTACT_OBJECT })
    objectInfo;

    @wire(getRecord, { recordId: '$recordId', fields: ['Case.AccountId','Case.ContactId'] })
    wiredAccount({ error, data }) {
        if (data) {
            console.log('dta' + data.fields.AccountId.value);
            console.log('dta' + data.fields.ContactId.value);
            this.accountId = data.fields.AccountId.value;
            this.contactId = data.fields.ContactId.value;
            this.fetchContacts();
        } else if (error) {
            this.showErrorToast('Error fetching record details');
        }
    }

    connectedCallback() {
        // Fetch record types
        this.fetchRecordTypes();
        if(this.isReadOnly == undefined){
            this.isReadOnly = true;
        }
    }

    editHandler(){
        this.isReadOnly = false;
    }

    fetchRecordTypes() {
        getRecordTypes()
            .then(result => {
                this.recordTypeOptions = result.map(rt => {
                    return { label: rt.Name, value: rt.Id };
                });
            })
            .catch(error => {
                console.error('Error fetching record types:', error);
            });
    }

    get isNextButtonDisabled() {
        return !this.selectedRecordTypeId;
    }

    handleRecordTypeChange(event) {
        this.selectedRecordTypeId = event.detail.value;
        const selectedRecordType = this.recordTypeOptions.find((rt) => rt.value == this.selectedRecordTypeId);
        console.log(JSON.stringify(selectedRecordType))
        this.selectedRecordTypeName = selectedRecordType.label;
        console.log(this.selectedRecordTypeName);
        this.fieldList = this.recordTypeFieldMap[selectedRecordType.label] || [];
        console.log('this.fieldList => ' + this.fieldList);
    }

    handleAccountChange(event) {
        this.accountId = event.target.value;
        this.contactId = null; // Reset selected contact when changing account
        this.selectedRecordTypeId = null;
        this.selectedRecordTypeName = null;
        this.fetchContacts();
    }

    fetchContacts() {
        console.log('this.contactOptions before clear' + this.contactOptions)
        this.contactOptions = []
        console.log(this.accountId)
        if (this.accountId) {
            getContacts({ accountId: this.accountId })
                .then(result => {
                    this.contactOptions = result.map(contact => ({
                        label: contact.Name,
                        value: contact.Id
                    }));
                    console.log('this.contactOptions after re-fetch' + this.contactOptions)
                })
                .catch(error => {
                    this.showErrorToast(error.body.message);
                });
        } else {
            this.contactOptions = []; // Clear contact options if no account selected
        }
    }

    handleContactChange(event) {
        this.contactId = event.detail.value;
    }

    handleNewContactClick() {
        this.isModalOpen = true; // Open the modal when clicking the "+" icon
        this.selectedRecordTypeId = null;
        this.selectedRecordTypeName = null;
        if (!this.recordTypeOptions || this.recordTypeOptions.length === 0) {
            this.showRecordTypeSelection = false;
            this.showContactForm = true;
        }
    }

    closeModal() {
        this.isModalOpen = false;
        this.showRecordTypeSelection = true;
        this.showContactForm = false;
    }

    handleSuccess(event) {
        const caseId = event.detail.id;
        const successMessage = this.recordId ? 'Case updated successfully' : 'Case created successfully';
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: successMessage,
            variant: 'success'
        }));
        this.navigateToRecord(caseId);
    }

    handleContactSuccess(event) {
        this.showSuccessToast('Contact created successfully');
        this.closeModal();
        this.fetchContacts(); // Refresh contacts after new contact creation
    }

    handleNext() {
        console.log('Record Type Id - ' + this.selectedRecordTypeId);
        if (this.selectedRecordTypeId) {
            this.showRecordTypeSelection = false;
            this.showContactForm = true;
        }
    }

    handleError(event) {
        this.showErrorToast(event.detail.message);
    }

    showSuccessToast(message) {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: message,
            variant: 'success'
        }));
    }

    showErrorToast(message) {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Error',
            message: message,
            variant: 'error'
        }));
    }

    navigateToRecord(recordId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Case',
                actionName: 'view'
            }
        });
    }
}