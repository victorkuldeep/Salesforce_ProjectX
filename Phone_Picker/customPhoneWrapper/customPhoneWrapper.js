import { LightningElement, api } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class CustomPhoneWrapper extends LightningElement {
    @api label;
    @api recordId;
    @api obj;
    @api fieldapi;
    enableSave = false;
    fullPhoneNumber;
    inputElement;

    handleCustomPhone(event) {
        this.enableSave = true;
        this.fullPhoneNumber = event.detail.fullPhoneNumber;
        this.inputElement = event.detail.inputElement;
    }

    handleSave(event) {
        this.enableSave = false;
        // MAKE DML
        const fields = {};
        fields['Id'] = this.recordId;
        fields[this.fieldapi] = this.fullPhoneNumber;

        const recordInput = {
            fields
        };
        updateRecord(recordInput)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record saved successfully',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                console.error(error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error saving record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
                this.enableSave = true; // let user try again
            });
    }
}