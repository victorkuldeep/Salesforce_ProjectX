import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';

import getEmailTemplateFolders from '@salesforce/apex/CTCEmailAuthorController.getEmailTemplateFolders';
import getEmailTemplates from '@salesforce/apex/CTCEmailAuthorController.getEmailTemplates';
import renderTemplate from '@salesforce/apex/CTCEmailAuthorController.renderTemplate';
import getCaseEmailAddress from '@salesforce/apex/CTCEmailAuthorController.getCaseEmailAddress';
import getOrgWideEmailAddress from '@salesforce/apex/CTCEmailAuthorController.getOrgWideEmailAddress';
import fileAttachment from '@salesforce/apex/CTCEmailAuthorController.fileAttachment';
import sendEmailToController from '@salesforce/apex/CTCEmailAuthorController.sendEmailToController';

export default class SendEmailModal extends LightningElement {
    @api recordId;

    @track toAddress = '';
    @track ccAddress = '';
    @track bccAddress = '';
    @track orgWideAddress = '';
    orgWideId;
    @track subject = '';
    @track body = '';
    @track getTempList = [];
    @track emailTempList = [];
    resultgetEmailTemplates = []; // full template objects
    @track uploadFile = []; // { contentVersionId, name }
    allFilesIds = []; // ContentDocumentIds to send to Apex

    get acceptedFormats() {
        return ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx', '.xls', '.xlsx', '.txt'];
    }

    connectedCallback() {
        
        // Load template folders
        getEmailTemplateFolders()
            .then(result => {
                this.getTempList = result.map(r => ({ label: r.Name, value: r.Name }));
            })
            .catch(err => this.toastError('Failed to load template folders', err));
    }

    // Populate "To/Cc/Bcc" from related EmailMessage records (wired)
    @wire(getCaseEmailAddress, { caseRecordId: '$recordId' })
    wiredToAddr({ error, data }) {
        if (data && data.length) {
            // choose the last/relevant; tweak as per your business logic
            this.toAddress = data[0].ToAddress || data[0].FromAddress || '';
            this.ccAddress = data[0].CcAddress || '';
            this.bccAddress = data[0].BccAddress || '';
        } else if (error) {
            // swallow or show minimal toast
            // this.toastError('Failed to fetch case addresses', error);
        }
    }

    @wire(getOrgWideEmailAddress)
    wiredFromAddr({ error, data }) {
        if (data) {
            this.orgWideAddress = data.Address;
            this.orgWideId = data.Id;
        } else if (error) {
            // this.toastError('Failed to fetch org-wide address', error);
        }
    }

    @wire(fileAttachment, { caseRecId: '$recordId' })
    wiredFileAttachment({ error, data }) {
        if (data && data.length) {
             // files are ContentVersion records (Id, ContentDocumentId, Title)
            this.uploadFile = data.map(f => ({ contentVersionId: f.Id, name: f.Title }));
            // store ContentDocumentIds (server expects document ids)
            this.allFilesIds = data.map(f => f.ContentDocumentId);
        } else if (error) {
            this.toastError('Failed to load case attachments', error)
        }
    }

    // When folder selected -> load templates in that folder
    selectedEmailTempFolder(event) {
        const folderName = event.detail.value;
        if (!folderName) return;
        getEmailTemplates({ folderName })
            .then(result => {
                this.resultgetEmailTemplates = result;
                this.emailTempList = result.map(r => ({ label: r.Name, value: r.Id }));
            })
            .catch(err => this.toastError('Failed to load templates', err));
    }

    // When a template is selected -> render (merge) template using Apex renderTemplate
    selectedEmailTemp(event) {
        const templateId = event.detail.value;
        if (!templateId) return;
        renderTemplate({ templateId, caseId: this.recordId })
            .then(res => {
                if (res) {
                    // merged subject/html
                    this.subject = res.subject || this.subject;
                    this.body = res.htmlBody || this.body;
                }
            })
            .catch(err => this.toastError('Failed to render template', err));
    }

    handleToEmailAddress(event) {
        this.toAddress = event.target.value;
    }

    handleCcEmailAddress(event) {
        this.ccAddress = event.target.value;
    }

    handleBccEmailAddress(event) {
        this.bccAddress = event.target.value;
    }

    handleSubject(event) {
        this.subject = event.detail.value;
    }

    handleBodyChange(event) {
        // lightning-input-rich-text usually provides event.detail.value
        this.body = event.detail && event.detail.value ? event.detail.value : event.target.value;
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        // event.detail.files contains name, documentId
        uploadedFiles.forEach(f => {
            this.uploadFile.push({ contentVersionId: f.documentId, name: f.name });
            this.allFilesIds.push(f.documentId);
        });
    }

    fileRemove(event) {
        // robust index retrieval: check dataset, then event.detail.name (pill may set name)
        const idx = event.target && event.target.dataset && event.target.dataset.index !== undefined
            ? parseInt(event.target.dataset.index, 10)
            : (event.detail && event.detail.name ? parseInt(event.detail.name, 10) : -1);

        if (idx >= 0) {
            this.uploadFile.splice(idx, 1);
            this.allFilesIds.splice(idx, 1);
        }
    }

    // Build toAddress list from a string or array. Returns array of strings.
    buildToAddressArray() {
        if (!this.toAddress) return [];
        // If toAddress is already an array (unlikely here) handle it:
        if (Array.isArray(this.toAddress)) {
            return this.toAddress.filter(Boolean);
        }
        // split by comma/semicolon/space
        return this.toAddress.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean);
    }

    buildCcAddressArray() {
        if (!this.ccAddress) return [];
        // If toAddress is already an array (unlikely here) handle it:
        if (Array.isArray(this.ccAddress)) {
            return this.ccAddress.filter(Boolean);
        }
        // split by comma/semicolon/space
        return this.ccAddress.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean);
    }

    buildBccAddressArray() {
        if (!this.bccAddress) return [];
        // If toAddress is already an array (unlikely here) handle it:
        if (Array.isArray(this.bccAddress)) {
            return this.bccAddress.filter(Boolean);
        }
        // split by comma/semicolon/space
        return this.bccAddress.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean);
    }

    sendEmail() {
        const toAddrs = this.buildToAddressArray();
        const ccAddrs = this.buildCcAddressArray();
        const bccAddrs = this.buildBccAddressArray();
        if (!toAddrs.length) {
            this.showToast('Validation', 'Please provide at least one recipient in To', 'warning');
            return;
        }
        // optional: validate basic email format(s) here
        console.log(JSON.stringify(toAddrs))
        console.log(JSON.stringify(ccAddrs))
        console.log(JSON.stringify(bccAddrs))
        console.log(this.body);
        console.log(this.subject);
        console.log(JSON.stringify(this.allFilesIds));
        
        sendEmailToController({
            toAddressEmail: toAddrs,
            ccAddressEmail: ccAddrs,
            bccAddressEmail: bccAddrs,
            orgWideEmailAddress: this.orgWideId,
            subjectEmail: this.subject,
            bodyEmail: this.body,
            caseRecordId: this.recordId,
            uploadedFiles: this.allFilesIds
        })
        .then(() => {
            this.showToast('Success', 'Email sent successfully', 'success');
            this.dispatchEvent(new CloseActionScreenEvent());
        })
        .catch(error => {
            const msg = (error && error.body && error.body.message) ? error.body.message : JSON.stringify(error);
            this.showToast('Error', 'Send failed: ' + msg, 'error');
        });
    }

    cancelPopup() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    showToast(title, message, variant='info') {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    toastError(title, error) {
        const msg = (error && error.body && error.body.message) ? error.body.message : JSON.stringify(error);
        this.showToast(title, msg, 'error');
    }
}