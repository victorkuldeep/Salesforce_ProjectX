import { LightningElement, api, track, wire } from 'lwc'
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import { NavigationMixin } from 'lightning/navigation'
import { getRecord } from 'lightning/uiRecordApi'
import getContacts from '@salesforce/apex/CaseController.getContacts'
import getRecordTypeByName from '@salesforce/apex/ContactController.getRecordTypeByName'
import { getObjectInfo } from 'lightning/uiObjectInfoApi'
import { fieldMapperContactDefault, readOnlyCaseStatus, sectionVisibilityConfig, fieldMapperContact, valueChangeMapper, fieldConfig, valueChangeMapperEdit, fieldConfigEdit, acSection, sectionIndexMapper, defaultContactRecordType } from './fieldMapper'
import CONTACT_OBJECT from '@salesforce/schema/Contact'
import ProfileName from '@salesforce/schema/User.Profile.Name' //this scoped module imports the current user profile name
import Id from '@salesforce/user/Id';
import LightningAlert from 'lightning/alert';

export default class NewCaseLWC extends NavigationMixin(LightningElement) {

    @api recordId
    @api accountId
    @api isReadOnly
    @api objectApiName
    @track isLoading = false
    @track isContactLoading = false
    @track contactOptions = []
    @track previousPicklistValue = ''
    @track currentPicklistValue = ''
    @track recordsData
    @track sections
    @track userProfileName
    @track hiddenFieldsContact = []
    contactId
    isModalOpen = false // Ensure this property is defined
    selectedRecordTypeId
    selectedRecordTypeName
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
    userid = Id
    sectionVisibilityConfig = sectionVisibilityConfig
    readOnlyCaseStatus = readOnlyCaseStatus
    caseStatus
    triggerReadOnly = false
    true_val = true
    fieldMapperContactDefault = fieldMapperContactDefault
    delayTimeout
    overrideFlag = false

    /** Wire Adapter to pull logged in user Profile */

    @wire(getRecord, { recordId: Id, fields: [ProfileName] })
    userDetails({ error, data }) {
        if (data && data.fields.Profile.value != null) {
            this.userProfileName = data.fields.Profile.value.fields.Name.value
            console.log('User Profile is ' + this.userProfileName)
        }
    }

    /** Wire Adapter to pull Contact Object information */

    @wire(getObjectInfo, { objectApiName: CONTACT_OBJECT })
    objectInfo;

    /** Wire Adapter to pre-populate combo box once we have record id in case of Edit Mode */

    @wire(getRecord, { recordId: '$recordId', fields: ['Case.AccountId', 'Case.ContactId'] })
    wiredAccount({ error, data }) {
        if (data) {
            this.accountId = data.fields.AccountId.value;
            this.contactId = data.fields.ContactId.value;
            this.fetchContacts();
        } else if (error) {
            this.showErrorToast('Error fetching record details');
        }
    }

    /** Connected Callback Lifecycle hook
     * Initilize fields config based on NEW or EDIT mode
     * Initilize fieldChangeMappers based on NEW or EDIT mode
     * Fetches record types for contact
     * Case record type will direct to default as per user profile - not handled like contact
     * Re-initilizes form from field mapper to invalidate the cache once New is clicked again - BUGFIX
    */

    connectedCallback() {

        console.log('Connected Callback Lifecycle Hook ' + this.recordId)
        console.log('Account Id Received: ' + this.accountId);

        this.finalFieldConfig = this.recordId ? fieldConfigEdit : fieldConfig
        this.finalValueChangeMapper = this.recordId ? valueChangeMapperEdit : valueChangeMapper
        // Fetch record types
        this.fetchRecordTypes();

        if (this.isReadOnly == undefined) {
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
        console.log(this.hiddenFieldsContact)
        this.setHiddenFields()
        console.log('Connected Callback Lifecycle Hook END ')
    }

    /** LWC Lifecycle hook to run everytime once rendering is done on UI */
    renderedCallback() {

        /** Bugfix: Closed status not triggering readonly for DOM manipulated in between
         * This will refer updated DOM
         */
        if (this.triggerReadOnly) {
            this.makeCaseReadOnly()
            this.triggerReadOnly = false
        }
    }

    disconnectedCallback() {
        // Clear the timeout if the component is destroyed before the delay
        clearTimeout(this.delayTimeout);
        console.log('Timer Off ' + this.userProfileName)
    }

    setHiddenFields() {
        this.hiddenFieldsContact = Object.entries(fieldMapperContactDefault).map(([fieldName, value]) => {
            return { fieldName, value };
        });
    }

    /** Lightning Record Edit form on Load Handler
     * This will trigger conditional fields load based on Data Structure defined in field mapper
     * Default values will trigger auto rendering of conditional fields
     * BUGFIX: Rendering of auto - conditional fields in case of Edit mode
     */

    handleOnLoad(event) {
        if (!this.userProfileName) {
            this.delayTimeout = setTimeout(() => {
                console.log('Timer Set ')
                if (!this.overrideFlag) {
                    this.overrideAdminVisibility()
                }
            }, 3000);
        }
        console.log('Event - onload')
        const fieldsData = this.recordId ? event.detail.records[this.recordId].fields : event.detail.record.fields
        console.log(JSON.stringify(Object.keys(fieldsData)))
        // Execute logic once and avoid re-run on multiple on laods
        if (!this.initialLoadStatus) {
            // loop over all fields coming from field mapper and load additional fields as per conditional mapping during initial on load
            Object.keys(fieldsData).forEach(apiName => {
                if (apiName == 'Status') {
                    this.caseStatus = fieldsData[apiName].value
                }
                if (this.finalValueChangeMapper[apiName]) {
                    this.sectionIndex = this.sectionIndexMapper[apiName]
                    this.recordsData = { ...this.recordsData, [apiName]: fieldsData[apiName].value }
                    if (fieldsData[apiName].value != null) {
                        const fieldsDataToAdd = this.finalValueChangeMapper[apiName][0][fieldsData[apiName].value]
                        fieldsDataToAdd ? this.addFieldsToColumn(this.sections[this.sectionIndex].columns[1], fieldsDataToAdd) : console.log(`No Mapping in onChangeMapper for Value ${fieldsData[apiName].value}`) //BUGFIX: If no valid mapping in fieldMapper then handle error
                    }
                }
            });
            this.initialLoadStatus = false // Bugfix - Auto Rendering for some fields stopped as form loads multiple times

            /** Below logic is conditional and need to be implemented as per requirements 
             * <<API>> Name Value on UI == <<Required Value>> ? Show : Hide [Required Section Key] 
             * 
             * Example: Origin is API Name and Web is Value
             *
            */

            Object.keys(fieldsData).forEach(apiName => {
                const fieldName = apiName;
                const fieldValue = fieldsData[fieldName].value
                if (sectionVisibilityConfig[fieldName]) {
                    const configs = sectionVisibilityConfig[fieldName][fieldValue] || sectionVisibilityConfig[fieldName].default;
                    if (configs) {
                        configs.forEach(config => {
                            this.handleSectionVisibility(config.section, config.action);
                        });
                    } else {
                        console.log(`No config found for ${fieldName} with value ${fieldValue}`);
                    }
                }
            })

            // Depreciated: fieldsData['Origin'].value == 'Web' ? this.handleSectionVisibility('System_Information','Show') : this.handleSectionVisibility('System_Information','Hide')

            /** This Method will override Required property for System Admin and make all fields on form as Editable */

            this.overrideAdminVisibility()
            console.log('Override Done')
            this.caseStatus && this.readOnlyCaseStatus.includes(this.caseStatus) && this.recordId ? (this.triggerReadOnly = true) : console.log('No Match')

            /** Auto populate Account Id */
            if (this.accountId) {
                this.fetchContacts()
                const createContactHolder = this.template.querySelector('.exclusivity-show[data-recid="createContactHolder"]');
                console.log(createContactHolder)
                if (createContactHolder) {
                    // Bugfix: Keep it hidden in case of Edit Mode
                    this.accountId && !this.recordId ? createContactHolder.classList.remove('slds-hide') : createContactHolder.classList.add('slds-hide')
                }
            }
        }
    }

    /** This method overides disabled/readonly for System Administrators to make changes */

    overrideAdminVisibility() {
        console.log(`Overriding visibility for user with profile ${this.userProfileName}`)
        if (this.userProfileName == 'System Administrator') {
            let allFields = this.template.querySelectorAll("lightning-input-field")
            allFields.forEach(fieldX => {
                fieldX.disabled = false
            })
            this.overrideFlag = true
        }
    }

    /** Method implemented to make all fields read only */
    makeCaseReadOnly() {
        let allFields = this.template.querySelectorAll("lightning-input-field")
        allFields.forEach(fieldX => {
            fieldX.disabled = true
        })
        this.isReadOnly = true;
    }

    // Dynamic Form JS Handlers Begin

    /** Method triggered on all fields change and refer field mapper to trigger reactivity on UI
     * Capture previous value and current value
     * Remove fields based on previous value
     * Add new fields on UI
     * Trigger UI Reactivity
     */

    fieldChangeHandler(event) {

        // Check if onChange is defined in value change mapper static data structure
        if (this.finalValueChangeMapper[event.target.fieldName]) {
            this.initialLoadStatus = true // Bugfix - Auto Rendering for some fields stopped as form loads multiple times
            if (this.recordsData == undefined || this.recordsData[event.target.fieldName] == undefined) {
                this.recordsData = { ...this.recordsData, [event.target.fieldName]: event.target.value }
            }
            if (this.recordsData) {
                // Deep copy the data
                this.previousPicklistValue = JSON.parse(JSON.stringify(this.recordsData[event.target.fieldName]))
                this.currentPicklistValue = event.target.value // Bugfix: Added checkbox support detail -> target

            } else {
                this.previousPicklistValue = this.currentPicklistValue
                this.currentPicklistValue = event.target.value // Bugfix: Added checkbox support detail -> target 
            }

            console.log(`Current Value is ${this.currentPicklistValue} and Previous Value is ${this.previousPicklistValue}`)

            this.recordsData[event.target.fieldName] = event.target.value // Bugfix: Added checkbox support detail -> target
            // Fields to Add
            const fieldsData = this.finalValueChangeMapper[event.target.fieldName][0][this.currentPicklistValue]
            // Fields to Remove
            const fieldsDataToRemove = this.finalValueChangeMapper[event.target.fieldName][0][this.previousPicklistValue]

            // Add & Remove Fields Logic Begin
            this.sectionIndex = this.sectionIndexMapper[event.target.fieldName]
            this.previousPicklistValue != this.currentPicklistValue && fieldsDataToRemove != undefined && fieldsDataToRemove != null ? this.removeFields(this.sections[this.sectionIndex].columns[1], fieldsDataToRemove) : console.log('No Data to Remove')
            fieldsData != undefined && fieldsData != null ? this.addFieldsToColumn(this.sections[this.sectionIndex].columns[1], fieldsData) : console.log('No Data to Add')
            // Add & Remove Fields Logic End

            /** Below logic is conditional and need to be implemented as per requirements 
             * API Name == <<Required API Name>> && Its Field Value on UI == <<Required Value>> ? Show : Hide [Required Section Key] 
             * 
             * Example: Origin is API Name and Web is Value
             * 
            */
            const fieldName = event.target.fieldName;
            const fieldValue = event.target.value;
            if (sectionVisibilityConfig[fieldName]) {
                const configs = sectionVisibilityConfig[fieldName][fieldValue] || sectionVisibilityConfig[fieldName].default;
                if (configs) {
                    configs.forEach(config => {
                        this.handleSectionVisibility(config.section, config.action);
                    });
                } else {
                    console.log(`No config found for ${fieldName} with value ${fieldValue}`);
                }
            }
            //Deprecated: event.target.fieldName == 'Origin' && event.target.value == 'Web' ? this.handleSectionVisibility('System_Information','Show') : event.target.fieldName == 'Origin' && event.target.value != 'Web' ? this.handleSectionVisibility('System_Information','Hide') : console.log('No Origin Changed')

            /** This Method will override Required property for System Admin and make all fields on form as Editable even if onchange handler brings read only */
            this.overrideAdminVisibility()
        }
    }

    /** This method finds the Section from UI via Class Selector and appends and removes slds-hide class */

    handleSectionVisibility(key, mode) {
        this.elemKey = '.exclusivity-hide[data-recid=' + key + ']'
        const section = this.template.querySelector(this.elemKey);
        console.log('Section - ' + section)
        if (section) {
            mode == 'Hide' ? section.classList.add('slds-hide') : mode == 'Show' ? section.classList.remove('slds-hide') : console.log('Invalid Mode')
        }
    }

    // Method to remove fields from a column
    removeFields(column, fieldsToRemove) {

        console.log(`Removing fields ${JSON.stringify(fieldsToRemove)}`)
        column.fields = column.fields.filter(field => {
            // Check if the field should be kept (not in fieldsToRemove)
            return !fieldsToRemove.some(removeField => removeField.apiName === field.apiName)
        });
    }

    /** This method is used to push conditional fields on UI based on On Change field handler */

    addFieldsToColumn(column, fields) {
        console.log(`Adding fields ${JSON.stringify(fields)}`)
        fields.forEach(field => {
            // Check if the field already exists
            if (!column.fields.some(existingField => existingField.apiName === field.apiName)) {
                column.fields.push(field)
            }
        });
    }

    // Dynamic Form JS Handlers End

    /** Edit Icon button to provide support for flexi pages - can be deprecated */

    async editHandler() {
        if (this.userProfileName == 'System Administrator') {
            this.isReadOnly = false
            this.overrideAdminVisibility()
        } else {
            await LightningAlert.open({
                message: 'You don\'t have permission to edit closed cases. Please contact System Administrator',
                theme: 'error', // a red theme intended for error states
                label: 'Error!', // this is the header text
            });
            //Alert has been closed
        }

    }

    /** This is used to fetch the contact record type id and name defined in field mapper */

    fetchRecordTypes() {

        getRecordTypeByName({ recordTypeName: this.defaultContactRecordType })
            .then(result => {
                this.selectedRecordTypeId = result[0] ? result[0].Id : null
                this.selectedRecordTypeName = result[0] ? result[0].Name : null
            })
    }

    /** Distribute fields in Contact creation left columns */

    get leftColumnFields() {
        return this.distributeFields().left
    }

    /** Distribute fields in Contact creation right columns */

    get rightColumnFields() {
        return this.distributeFields().right
    }

    /** Method implemented to evenly distribute fields in left and right 2 col layout for contact */

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

    /** this method is implemented to handle Account and Contact change
     * Account chnage -> Trigger latest contacts fetch
     * Contact change -> Maps id to hidden element on UI to save contact in Case record
     */

    handleFieldChange(event) {

        if (event.target.fieldName === 'AccountId') {
            this.handleAccountChange(event);
        }
        if (event.target.label === 'Contact') {
            this.handleContactChange(event)
        }
        // Add other field-specific handlers if needed
    }

    /** Account Chnage Handler */

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

    /** this will fetch contacts by making a server call on Account Contact Relationship with Active true */

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

    /** contact change handler */

    handleContactChange(event) {
        this.contactId = event.detail.value
    }

    /** method implemented to open contact creation modal - reactivity on UI */

    handleNewContactClick() {
        this.isModalOpen = true // Open the modal when clicking the "+" icon
    }

    /** method implemented to close the modal opened on UI for contact success */

    closeModal() {
        this.isModalOpen = false
    }

    /** Lightning record edit form submit handler to show laoders and submits the form */
    @api
    handleFormSubmit(event) {
        console.log('submitting form');
        event.preventDefault()
        this.isLoading = true
        const fields = event.detail.fields
        // Submit logic (e.g., saving the record)
        this.template.querySelector('lightning-record-edit-form').submit(fields)
    }

    /** Method called when contact is submitted and enable loader and form will be submitted automatically */
    handleContactFormSubmit(event) {
        this.isContactLoading = true
    }

    /** success form submit handler */
    @api
    handleSuccess(event) {

        this.isLoading = false // Stop loader if form has errors
        this.isContactLoading = false
        const caseId = event.detail.id
        const successMessage = this.recordId ? 'Case updated successfully' : 'Case created successfully'
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: successMessage,
            variant: 'success'
        }));
        this.isModalOpen = false;
        const successEvent = new CustomEvent('submitsuccess', {
            bubbles: true,
            composed: true,
            detail: caseId
        });
        this.dispatchEvent(successEvent);
        const closeEvent = new CustomEvent('hideModal', { detail: true });
        this.dispatchEvent(closeEvent);
        this.navigateToRecord(caseId)
    }

    @api
    handleCaseCancel(event) {
        /** For Edit Mode Cancel button will behave exactly same as Success Button in Navigation */
        if (this.recordId) {
            const caseId = this.recordId
            this.isModalOpen = false;
            const successEvent = new CustomEvent('submitsuccess', {
                bubbles: true,
                composed: true,
                detail: caseId
            });
            this.dispatchEvent(successEvent);
            const closeEvent = new CustomEvent('hideModal', { detail: true });
            this.dispatchEvent(closeEvent);
            this.navigateToRecord(caseId)
        } else {
            /** This is for New Mode */
            const cancelEvent = new CustomEvent('submitcancel', {
                bubbles: true,
                composed: true,
                detail: this.recordId // undefined
            });
            this.dispatchEvent(cancelEvent);
            const closeEvent = new CustomEvent('hideModal', { detail: true });
            this.dispatchEvent(closeEvent);
        }

    }

    /** error form submit handler */

    async handleFormError(event) {

        this.isLoading = false // Stop loader if form has errors
        this.isContactLoading = false

        let message = 'An error occurred while saving the record. Please try again later.';
        console.log(JSON.stringify(event.detail))
        if (event.detail && event.detail.output && event.detail.output.errors && event.detail.output.errors.length > 0) {
            message = event.detail.output.errors.map(error => error.message).join(', ');
        } else if (event.detail && event.detail.output && event.detail.output.fieldErrors) {

            message = Object.values(event.detail.output.fieldErrors).map(fieldErrorArray => {
                return fieldErrorArray.map(error => error.message).join(', ');
            }).join(', ');
        }

        await LightningAlert.open({
            message: message,
            theme: 'error', // a red theme intended for error states
            label: 'An Error Occurred! Please try again.', // this is the header text
        });
        //Alert has been closed
    }

    /** comtact creation success handler */

    async handleContactSuccess(event) {

        let contactRecordCreated = event.detail.id
        this.isContactLoading = false
        this.showSuccessToast('Contact created successfully')
        this.closeModal()
        await this.fetchContacts() // Refresh contacts after new contact creation
        // New Change to Auto Populate the newly inserted contact field here
        this.contactId = contactRecordCreated
    }

    /** Cancel button handler for contact modal */

    handleContactCancel(event) {
        this.isContactLoading = false
        this.closeModal()
    }

    /** Error toast method */

    handleError(event) {
        this.showErrorToast(event.detail.message)
    }

    /** Success Toast message */

    showSuccessToast(message) {

        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: message,
            variant: 'success'
        }));
    }

    /** Eror Toast method */

    showErrorToast(message) {

        this.dispatchEvent(new ShowToastEvent({
            title: 'Error',
            message: message,
            variant: 'error'
        }));
    }

    /** Navigation handler */

    navigateToRecord(recordId) {

        window.location.href = window.location.origin + '/lightning/r/' + recordId + '/view'

        /*this[NavigationMixin.Navigate]({

            type: 'standard__recordPage',

            attributes: {
                recordId: recordId,
                objectApiName: 'Case',
                actionName: 'view'
            }
        });*/
    }
}