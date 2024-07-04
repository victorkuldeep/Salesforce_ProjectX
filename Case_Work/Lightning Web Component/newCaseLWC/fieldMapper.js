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
                { apiName: 'Target_Date__c', required: false }
            ],
            Working: [
                { apiName: 'SuppliedPhone', required: true }
            ],
            Closed: [
                { apiName: 'SuppliedName', required: true }
            ],
            Escalated: [
                { apiName: 'EngineeringReqNumber__c', required: true }
            ]
        }
    ],
    Origin: [
        { 
            Phone: [
                { apiName: 'Reason', required: true }
            ],
            Email: [
                { apiName: 'ContactEmail', required: true }
            ],
            Web: [
                { apiName: 'Description', required: false }
            ]
        }
    ]
};



export {fieldMapperContact,fieldConfig,valueChangeMapper,lastSection};