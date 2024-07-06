// recordTypeFieldMap.js
const defaultContactRecordType = 'Contact'
const readOnlyCaseStatus = ['Closed','Closed - Duplicate','Closed - New Bug Logged','Closed - Resolved With Internal Tools']
const fieldMapperContact = {
    default: [
        { fieldName: 'FirstName', required: true, disabled: false },
        { fieldName: 'MiddleName', required: true, disabled: false },
        { fieldName: 'LastName', required: true, disabled: false },
        { fieldName: 'MobilePhone', required: false, disabled: false },
        { fieldName: 'HomePhone', required: false, disabled: false },
        { fieldName: 'OtherPhone', required: false, disabled: false },
        { fieldName: 'Email', required: false, disabled: false },
        { fieldName: 'Work_Email__c', required: false, disabled: false },
        { fieldName: 'Preferred_Phone__c', required: false, disabled: false },
        { fieldName: 'Preferred_Email__c', required: false, disabled: false }
    ]
};

const acSection = 'Account and Contact Details'

const fieldConfig = [
    {
        sectionName: ['Case Overview','Case_Overview'],
        columns: [
            [
                { apiName: 'Origin', required: true, readOnly: false },
                { apiName: 'Status', required: true, readOnly: false },
                { apiName: 'Priority', required: false, readOnly: false }
            ],
            [
                { apiName: 'Department__c', required: false, readOnly: false },
            ]
        ]
    },
    {
        sectionName: ['Case Details','Case_Details'],
        columns: [
            [
                { apiName: 'Category__c', required: true, readOnly: false },
                { apiName: 'Sub_Category__c', required: true, readOnly: false },
                { apiName: 'Description', required: true, readOnly: false }
            ],
            [
                { apiName: 'Subject', required: true, readOnly: false },
                { apiName: 'ParentId', required: true, readOnly: false }
                
            ]
        ]
    }
];

const valueChangeMapper = {
    Status: [
        { 
            New: [ // If there are no whitespaces can be written without quotes
                { apiName: 'SuppliedPhone', required: true, readOnly: false },
                { apiName: 'SuppliedName', required: false, readOnly: false }
            ],
            "Awaiting External": [ // fields having white spaces need to be wrapped in double quotes
                { apiName: 'Information_Requested__c', required: true, readOnly: false }
            ]
        }
    ],
    Category__c: [
        { 
            "Technical Support": [
                { apiName: 'Product__c', required: true, readOnly: false }
            ]
        }
    ]
};

const fieldConfigEdit = [
    {
        sectionName: ['Case Overview','Case_Overview'], // 0: LABEL AND 1:BACKEND ELEMENT KEY without white spaces
        columns: [
            [
                { apiName: 'Origin', required: true, readOnly: false },
                { apiName: 'Status', required: true, readOnly: false },
                { apiName: 'Priority', required: false, readOnly: false }
                
            ],
            [
                { apiName: 'Department__c', required: false, readOnly: false },
            ]
        ]
    },
    {
        sectionName: ['Case Details','Case_Details'],
        columns: [
            [
                { apiName: 'Category__c', required: true, readOnly: false },
                { apiName: 'Sub_Category__c', required: true, readOnly: false },
                { apiName: 'Description', required: true, readOnly: false }
            ],
            [
                { apiName: 'Subject', required: true, readOnly: false },
                { apiName: 'ParentId', required: true, readOnly: false }
                
            ]
        ]
    },
    {
        sectionName: ['Case Resolution','Case_Resolution'],
        columns: [
            [
                { apiName: 'Authentication_Override_Reason__c', required: false, readOnly: true }
            ],
            [
                // Placeholder - Second Column Fields
            ]
        ]
    },
    {
        sectionName: ['System Information','System_Information'],
        columns: [
            [
                { apiName: 'SuppliedCompany', required: false, readOnly: true },
                { apiName: 'SuppliedName', required: false, readOnly: true }
            ],
            [
                // Placeholder - Second Column Fields
                { apiName: 'SuppliedEmail', required: false, readOnly: true },
                { apiName: 'SuppliedPhone', required: false, readOnly: true }
            ]
        ]
    }
];

const valueChangeMapperEdit = {
    Status: [
        { 
            "Awaiting External": [
                { apiName: 'Information_Requested__c', required: true }
            ]
        }
    ],
    Origin: [
        { 
            Email: [
                { apiName: 'SuppliedName', required: true },
                { apiName: 'SuppliedEmail', required: true }
            ]
        }
    ],
    Category__c: [
        { 
            "Technical Support": [
                { apiName: 'Product__c', required: true }
            ]
        }
    ]
};
// This will decide index of section where the on Change fields will be pushed, this is very important mapping
const sectionIndexMapper = {
    Status: 0,
    Origin: 0,
    Category__c: 1 // On Change of Category will push dependent fields in Section index as 1 starting from 0
};

const sectionVisibilityConfig = {
    Origin: {
        Web: [
            { section: 'System_Information', action: 'Show' }
        ],
        default: [
            { section: 'System_Information', action: 'Hide' }
        ]
    }
    // Add more fieldName: value mappings here as needed
};


export {readOnlyCaseStatus,sectionVisibilityConfig, defaultContactRecordType,fieldMapperContact,fieldConfig,valueChangeMapper,fieldConfigEdit,valueChangeMapperEdit,acSection,sectionIndexMapper};