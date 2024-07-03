// recordTypeFieldMap.js
const fieldMapperContact = {
    default: [
        { fieldName: 'FirstName', required: true, disabled: false },
        { fieldName: 'LastName', required: true, disabled: false },
        { fieldName: 'Email', required: false, disabled: false },
        { fieldName: 'Phone', required: false, disabled: false },
        { fieldName: 'Title', required: false, disabled: false },
        { fieldName: 'Department', required: false, disabled: false }
    ]
};

const lastSection = 'Account And Contact Details'
const fieldConfig = [
    {
        sectionName: 'Case Details',
        columns: [
            [
                { apiName: 'Subject', required: true },
                { apiName: 'Status', required: true },
                { apiName: 'Origin', required: false }
                
            ],
            [
                { apiName: 'Priority', required: true }
            ]
        ]
    },
    {
        sectionName: 'Address Details',
        columns: [
            [
                { apiName: 'EngineeringReqNumber__c', required: false },
                { apiName: 'IsEscalated', required: false }
            ],
            [
                { apiName: 'Comments', required: false }
                
            ]
        ]
    }
];

const valueChangeMapper = {
    Status: [
        { 
            New: [
                { apiName: 'EngineeringReqNumber__c', required: true }, 
                { apiName: 'Target_Date__c', required: false },
                { apiName: 'SuppliedPhone', required: true },
                { apiName: 'SuppliedName', required: false }
            ],
            Working: [
                { apiName: 'SuppliedPhone', required: true },
                { apiName: 'SuppliedName', required: false }
            ],
            Closed: [
                { apiName: 'SuppliedName', required: true },
                { apiName: 'Target_Date__c', required: false }
            ],
            Escalated: [
                { apiName: 'Target_Date__c', required: true },
                { apiName: 'SuppliedPhone', required: false }
            ]
        }
    ],
    Origin: [
        { 
            Phone: [
                { apiName: 'Target_Date__c', required: true }, 
                { apiName: 'SuppliedEmail', required: false }
            ],
            Email: [
                { apiName: 'SuppliedEmail', required: true },
                { apiName: 'SuppliedPhone', required: false }
            ],
            Web: [
                { apiName: 'SuppliedPhone', required: true },
                { apiName: 'EngineeringReqNumber__c', required: false }
            ]
        }
    ]
};



export {fieldMapperContact,fieldConfig,valueChangeMapper,lastSection};