import { LightningElement, api, track, wire } from 'lwc'
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import { NavigationMixin } from 'lightning/navigation'
import { getRecord } from 'lightning/uiRecordApi'
import getContacts from '@salesforce/apex/CaseController.getContacts'
import getRecordTypeByName from '@salesforce/apex/ContactController.getRecordTypeByName'
import { getObjectInfo } from 'lightning/uiObjectInfoApi'
import { fieldMapperContact, valueChangeMapper, fieldConfig, valueChangeMapperEdit, fieldConfigEdit, acSection, sectionIndexMapper, defaultContactRecordType }  from './fieldMapper'
import CONTACT_OBJECT from '@salesforce/schema/Contact'
import ProfileName from '@salesforce/schema/User.Profile.Name' //this scoped module imports the current user profile name
import Id from '@salesforce/user/Id';

export default class NewCaseLWC extends NavigationMixin(LightningElement) {
    
    @api recordId;
    @api isReadOnly
    @api objectApiName;
    @track isLoading = false;
    @track contactOptions = [];
    @track previousPicklistValue = '';
    @track currentPicklistValue = '';
    @track recordsData
    @track sections
    accountId;
    contactId;
    isModalOpen = false; // Ensure this property is defined
    selectedRecordTypeId;
    selectedRecordTypeName;
    fieldConfig = fieldConfig
    valueChangeMapper = valueChangeMapper
    fieldConfigEdit = fieldConfigEdit
    valueChangeMapperEdit = valueChangeMapperEdit
    sectionIndexMapper = sectionIndexMapper
    finalFieldConfig
    finalValueChangeMapper
    acSection = acSection
    initialLoadStatus = false
    sectionIndex = 0
    defaultContactRecordType = defaultContactRecordType
    elemKey
    userProfileName
    userid = Id
    
    @wire(getRecord, { recordId: Id, fields: [ProfileName] })
    userDetails({ error, data }) {
        if(data && data.fields.Profile.value != null){
            this.userProfileName = data.fields.Profile.value.fields.Name.value
            console.log('User Profile is ' + this.userProfileName)
        }

    }
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

        console.log('Connected Callback Lifecycle Hook ' + this.recordId)
        this.finalFieldConfig = this.recordId ? fieldConfigEdit : fieldConfig
        this.finalValueChangeMapper = this.recordId ? valueChangeMapperEdit : valueChangeMapper
        // Fetch record types
        this.fetchRecordTypes();

        if(this.isReadOnly == undefined){
            this.isReadOnly = true;
        }
        // Re-Initilize in Connected Callback lifecycle hook - BUGFIX: Cache rendering old state of array on UI
        this.sections = this.finalFieldConfig.map(section => ({
            sectionName: section.sectionName[0],
            sectionKey: section.sectionName[1],
            columns: section.columns.map((column, columnIndex) => ({
                key: `${section.sectionName[1]}-${columnIndex}`,
                fields: column
            }))
        }));
        // BUGFIX: To Trigger Reactivity on User Interface and clears previous object state
        this.sections = JSON.parse(JSON.stringify(this.sections))
        console.log(JSON.stringify(this.sections))
    }

    // BUGFIX: Rendering of auto - conditional fields in case of Edit mode
    handleOnLoad(event) {

        const fieldsData = this.recordId ? event.detail.records[this.recordId].fields : event.detail.record.fields

        if(!this.initialLoadStatus){  
        
            Object.keys(fieldsData).forEach(apiName => { 
        
                if(this.finalValueChangeMapper[apiName]){
                    this.sectionIndex = this.sectionIndexMapper[apiName]
                    this.recordsData = { ...this.recordsData, [apiName]: fieldsData[apiName].value }
                    if(fieldsData[apiName].value != null){
                        const fieldsDataToAdd = this.finalValueChangeMapper[apiName][0][fieldsData[apiName].value]
                        fieldsDataToAdd ? this.addFieldsToColumn(this.sections[this.sectionIndex].columns[1],fieldsDataToAdd) : console.log('No Mapping in onChangeMapper for Value') //BUGFIX: If no valid mapping in fieldMapper then handle error
                    }
                }
            });
            this.initialLoadStatus = true
            //console.log(JSON.stringify(this.recordsData))
            console.log('Field Value of Origin is ' + fieldsData['Origin'].value)
            //handleSectionVisibility(SECTION_NAME,MODE)
            fieldsData['Origin'].value == 'Web' ? this.handleSectionVisibility('System_Information','Show') : this.handleSectionVisibility('System_Information','Hide')
            /** This Method will override Required property for System Admin and make all fields on form as Editable */
            this.overrideAdminVisibility()
        }
    }

    // Dynamic Form JS Handlers Begin
    overrideAdminVisibility(){
        if(this.userProfileName == 'System Administrator'){
            console.log('Admin Profile Override begin')
            let allFields = this.template.querySelectorAll("lightning-input-field")
            allFields.forEach(fieldX => {
                fieldX.disabled=false
            })
        }
    }
    fieldChangeHandler(event){

        // Check if onChange is defined in value change mapper static data structure
        if(this.finalValueChangeMapper[event.target.fieldName]){
            if(this.recordsData == undefined || this.recordsData[event.target.fieldName] == undefined){
                this.recordsData = { ...this.recordsData, [event.target.fieldName]: event.target.value }
            }
            if(this.recordsData){
                // Deep copy the data
                this.previousPicklistValue = JSON.parse(JSON.stringify(this.recordsData[event.target.fieldName]))
                this.currentPicklistValue = event.detail.value
                
            }else{
                this.previousPicklistValue = this.currentPicklistValue
                this.currentPicklistValue = event.detail.value
            }

            console.log(`Current Value is ${this.currentPicklistValue} and Previous Value is ${this.previousPicklistValue}`)
            
            this.recordsData[event.target.fieldName] = event.detail.value
            // Fields to Add
            const fieldsData = this.finalValueChangeMapper[event.target.fieldName][0][this.currentPicklistValue]
            // Fields to Remove
            const fieldsDataToRemove = this.finalValueChangeMapper[event.target.fieldName][0][this.previousPicklistValue]
            
            // Add & Remove Fields Logic Begin
            this.sectionIndex = this.sectionIndexMapper[event.target.fieldName]
            this.previousPicklistValue != this.currentPicklistValue && fieldsDataToRemove != undefined && fieldsDataToRemove != null ? this.removeFields(this.sections[this.sectionIndex].columns[1], fieldsDataToRemove) : console.log('No Data to Remove')
            fieldsData != undefined && fieldsData != null ? this.addFieldsToColumn(this.sections[this.sectionIndex].columns[1],fieldsData) : console.log('No Data to Add')
            // Add & Remove Fields Logic End

            event.target.fieldName == 'Origin' && event.target.value == 'Web' ? this.handleSectionVisibility('System_Information','Show') : this.handleSectionVisibility('System_Information','Hide')
        }
    }

    handleSectionVisibility(key,mode){

        this.elemKey = '.exclusivity-hide[data-recid='+key+']'

        console.log(this.template.querySelector(this.elemKey))
        const section = this.template.querySelector(this.elemKey);
        console.log('Section - ' + section)
        if(section){
            mode == 'Hide' ? section.classList.add('slds-hide') : mode == 'Show' ? section.classList.remove('slds-hide') : console.log('Invalid Mode')
        }
    }

    // Method to remove fields from a column
    removeFields(column, fieldsToRemove) {
        
        column.fields = column.fields.filter(field => {
            // Check if the field should be kept (not in fieldsToRemove)
            return !fieldsToRemove.some(removeField => removeField.apiName === field.apiName)
        });
    }
    addFieldsToColumn(column, fields) {
        console.log('addFieldstoColumn -> ' + fields)
        fields.forEach(field => {
            // Check if the field already exists
            if (!column.fields.some(existingField => existingField.apiName === field.apiName)) {
                column.fields.push(field)
            }
        });
    }

    // Dynamic Form JS Handlers End

    editHandler(){
        this.isReadOnly = false
    }
    
    fetchRecordTypes() {
        
        getRecordTypeByName({recordTypeName:this.defaultContactRecordType})
            .then(result =>{
                this.selectedRecordTypeId = result[0] ? result[0].Id : null
                this.selectedRecordTypeName = result[0] ? result[0].Name : null
            })
    }

    get leftColumnFields() {
        return this.distributeFields().left
    }

    get rightColumnFields() {
        return this.distributeFields().right
    }

    distributeFields() {
        const fields = fieldMapperContact.default
        const left = []
        const right = []
        fields.forEach((field, index) => {
            if (index % 2 === 0) {
                left.push(field)
            } else {
                right.push(field)
            }
        });
        return { left, right }
    }

    handleFieldChange(event) {
        
        console.dir(event.target)
        
        if (event.target.fieldName === 'AccountId') {
            this.handleAccountChange(event);
        }
        if (event.target.label === 'Contact') {
            this.handleContactChange(event)
        }
        // Add other field-specific handlers if needed
    }

    handleAccountChange(event) {
        
        this.accountId = event.target.value
        this.contactId = null // Reset selected contact when changing account
        this.fetchContacts()
        const createContactHolder = this.template.querySelector('.exclusivity-show[data-recid="createContactHolder"]');
        if (createContactHolder) {
            // Bugfix: Keep it hidden in case of Edit Mode
            this.accountId && !this.recordId ? createContactHolder.classList.remove('slds-hide') : createContactHolder.classList.add('slds-hide')
        }
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
                    this.showErrorToast(error.body.message)
                });
        } else {
            this.contactOptions = [] // Clear contact options if no account selected
        }
    }

    handleContactChange(event) {
        this.contactId = event.detail.value
    }

    handleNewContactClick() {
        
        this.isModalOpen = true // Open the modal when clicking the "+" icon
    }

    closeModal() {
        this.isModalOpen = false
    }

    handleFormSubmit(event){
        event.preventDefault()
        this.isLoading = true
        const fields = event.detail.fields
        // Submit logic (e.g., saving the record)
        this.template.querySelector('lightning-record-edit-form').submit(fields)
    }
    handleSuccess(event) {
        
        const caseId = event.detail.id
        const successMessage = this.recordId ? 'Case updated successfully' : 'Case created successfully'
        
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: successMessage,
            variant: 'success'
        }));
        this.navigateToRecord(caseId)
    }

    handleFormError(event){
        this.isLoading = false // Stop loader if form has errors
    }

    handleContactSuccess(event) {
        
        this.showSuccessToast('Contact created successfully')
        this.closeModal()
        this.fetchContacts() // Refresh contacts after new contact creation
    }
    handleContactCancel(event){
        this.closeModal()
    }

    handleError(event) {
        this.showErrorToast(event.detail.message)
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