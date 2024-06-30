// recordTypeFieldMap.js
const leftColumnFields = [
    { fieldName: 'Subject', required: true },
    { fieldName: 'Origin', required: true },
    { fieldName: 'Priority', required: false },
    { fieldName: 'Reason', required: true },
    { fieldName: 'OwnerId', required: false, outputField: true }
];

const rightColumnFields = [
    { fieldName: 'ParentId', required: false },
    { fieldName: 'Status', required: true },
    { fieldName: 'Description', required: false },
    { fieldName: 'AccountId', required: true, hasOnchange: true },
    { isCombobox: true, label: 'Contact', hasOnchange: true }
];

export {leftColumnFields,rightColumnFields};