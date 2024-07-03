import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord } from 'lightning/uiRecordApi';
import getContacts from '@salesforce/apex/CaseController.getContacts';
import getRecordTypeByName from '@salesforce/apex/ContactController.getRecordTypeByName';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import { fieldMapperContact, valueChangeMapper, fieldConfig, lastSection }  from './fieldMapper';

export default class NewCaseLWC extends NavigationMixin(LightningElement) {
    
    @api recordId;
    @api isReadOnly
    @api objectApiName;
    @track isLoading = false;
    @track contactOptions = [];
    @track previousPicklistValue = '';
    @track currentPicklistValue = '';

    @track sections = fieldConfig.map(section => ({
        ...section,
        columns: section.columns.map((column, columnIndex) => ({
            key: `${section.sectionName}-${columnIndex}`,
            fields: column
        }))
    }));

    accountId;
    contactId;
    isContactDisabled = true;
    isModalOpen = false; // Ensure this property is defined
    selectedRecordTypeId;
    selectedRecordTypeName;
    fieldConfig = fieldConfig
    valueChangeMapper = valueChangeMapper
    lastSection = lastSection
    
    @wire(getObjectInfo, { objectApiName: CONTACT_OBJECT })
    objectInfo;

    @wire(getRecord, { recordId: '$recordId', fields: ['Case.AccountId','Case.ContactId'] })
    wiredAccount({ error, data }) { 
        if (data) {
            this.accountId = data.fields.AccountId.value;
            this.contactId = data.fields.ContactId.value;
            this.fetchContacts();
        } else if (error) {
            this.showErrorToast('Error fetching record details');
        }
    }

    connectedCallback() {
        console.log('Connected Callback Lifecycle Hook fired')
        // Fetch record types
        this.fetchRecordTypes();

        if(this.isReadOnly == undefined){
            this.isReadOnly = true;
            this.isContactDisabled = true;
        }

        // Re-Initilize in Connected Callback lifecycle hook - BUGFIX: Cache rendering old state of array on UI
        this.sections = fieldConfig.map(section => ({
            ...section,
            columns: section.columns.map((column, columnIndex) => ({
                key: `${section.sectionName}-${columnIndex}`,
                fields: column
            }))
        }));
        // BUGFIX: To Trigger Reactivity on User Interface and clears previous object state
        this.sections = JSON.parse(JSON.stringify(this.sections))
    }

    // Dynamic Form JS Handlers Begin

    fieldChangeHandler(event){

        this.fieldName = event.target.fieldName;
        this.fieldValue = event.target.value;
        
        console.log(`Data is ${this.fieldName} and ${this.fieldValue} `);
        // Check if onChange is defined in value change mapper static data structure
        if(this.valueChangeMapper[event.target.fieldName]){
            
            this.previousPicklistValue = this.currentPicklistValue;
            this.currentPicklistValue = event.detail.value;

            console.log(`Current Value is ${this.currentPicklistValue} and Previous Value is ${this.previousPicklistValue}`)
            
            const fieldsData = this.valueChangeMapper[event.target.fieldName][0][this.currentPicklistValue]
            const fieldsDataToRemove = this.valueChangeMapper[event.target.fieldName][0][this.previousPicklistValue]
            
            this.previousPicklistValue != this.currentPicklistValue && fieldsDataToRemove != undefined && fieldsDataToRemove != null ? this.removeFields(this.sections[0].columns[1], fieldsDataToRemove) : console.log('No Data to Remove')
            fieldsData != undefined && fieldsData != null ? this.addFieldsToColumn(this.sections[0].columns[1],fieldsData) : console.log('No Data to Add')
            
        }
    }

    // Method to remove fields from a column
    removeFields(column, fieldsToRemove) {
        console.log('Fields Removal Process Initiated')
        column.fields = column.fields.filter(field => {
            // Check if the field should be kept (not in fieldsToRemove)
            return !fieldsToRemove.some(removeField => removeField.apiName === field.apiName);
        });
    }
    addFieldsToColumn(column, fields) {
        console.log('Fields Addition Process Initiated')
        fields.forEach(field => {
            // Check if the field already exists
            if (!column.fields.some(existingField => existingField.apiName === field.apiName)) {
                column.fields.push(field);
            }
        });
    }

    // Dynamic Form JS Handlers End

    editHandler(){
        this.isReadOnly = false;
    }
    
    fetchRecordTypes() {
        
        getRecordTypeByName({recordTypeName:'US'})
            .then(result =>{
                this.selectedRecordTypeId = result[0] ? result[0].Id : null;
                this.selectedRecordTypeName = result[0] ? result[0].Name : null;
            })
    }

    get leftColumnFields() {
        return this.distributeFields().left;
    }

    get rightColumnFields() {
        return this.distributeFields().right;
    }

    distributeFields() {
        const fields = fieldMapperContact.default;
        const left = [];
        const right = [];
        fields.forEach((field, index) => {
            if (index % 2 === 0) {
                left.push(field);
            } else {
                right.push(field);
            }
        });
        return { left, right };
    }

    handleFieldChange(event) {
        
        console.dir(event.target);
        
        if (event.target.fieldName === 'AccountId') {
            this.handleAccountChange(event);
        }
        if (event.target.label === 'Contact') {
            this.handleContactChange(event);
        }
        // Add other field-specific handlers if needed
    }

    handleAccountChange(event) {
        
        this.accountId = event.target.value;
        this.contactId = null; // Reset selected contact when changing account
        this.fetchContacts();
        this.isContactDisabled = this.accountId ? false : true;
    }

    fetchContacts() {
        
        this.contactOptions = []
        
        if (this.accountId) {
            getContacts({ accountId: this.accountId })
                .then(result => {
                    this.contactOptions = result.map(contact => ({
                        label: contact.Name,
                        value: contact.Id
                    }));
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
    }

    closeModal() {
        this.isModalOpen = false;
    }

    handleFormSubmit(event){
        event.preventDefault();
        this.isLoading = true;
        const fields = event.detail.fields; 
        // Submit logic (e.g., saving the record)
        this.template.querySelector('lightning-record-edit-form').submit(fields);
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
    handleContactCancel(event){
        this.closeModal();
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