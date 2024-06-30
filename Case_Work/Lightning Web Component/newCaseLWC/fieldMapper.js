// recordTypeFieldMap.js

const recordTypeContactFieldMap = {
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
        { fieldName: 'Birthdate'},
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

export {recordTypeContactFieldMap,leftColumnFields,rightColumnFields};