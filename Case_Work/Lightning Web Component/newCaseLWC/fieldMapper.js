/**
 * @description - This is field mapper to dynamically create New and Edit layout for case object.
 */

// default record type set while creating new contact record
const defaultContactRecordType = 'Contact'
// record Type Name to trigger custom LWC component rendering
const defaultCaseRecordType = 'Support'
// read only case status
const readOnlyCaseStatus = ['Closed-XXX']
// Defaut first Section name - statically mapped in LWC HTML
const acSection = 'Account and Contact Details'

/** This object mapping controls in which mode New Contact button will be visible on UI */
const newContactVisibility = {
    'New': true,
    'Edit': true
}

/** This will trigger required validation when Status is closed or any other value */
const customStatusRequiredValidation = {
    'Closed': 'Department__c,Category__c,Sub_Category__c,Internal_Resolution_Notes__c,External_Resolution_Notes__c'
}

/**
 * Descroiption: This is field mapping for Contact New custom layout having contact field api name, required and disabled properties
 */
const fieldMapperContact = {
    default: [
        { fieldName: 'FirstName', required: true, disabled: false }, //L1
        {},//{ fieldName: 'HomePhone', required: true, disabled: false }, //R1
        { fieldName: 'MiddleName', required: true, disabled: false }, //L2
        { fieldName: 'MobilePhone', required: false, disabled: false }, //R2
        { fieldName: 'LastName', required: false, disabled: false }, //L3
        {},//{ fieldName: 'OtherPhone', required: false, disabled: false }, //R3
        { fieldName: 'Home_Email_c', required: false, disabled: false }, //L4
        {},//{ fieldName: 'Preferred_Phone__c', required: false, disabled: false }, //R4
        { fieldName: 'Work_Email__c', required: false, disabled: false }, //L5
        {},//R5
        { fieldName: 'Preferred_Email__c', required: false, disabled: false } // L6
    ]
};

/** This is default field mapper for contact creation and can be extended to multiple fields
 * These fields are not visible on UI to user and values are directly saved on save.
 */
const fieldMapperContactDefault = {
    Action_Center_Flow__c: true
}

/** Description: New Case layout mapper configuration for New Case Layout.
 * @param sectionName: Name of the section followed by Key used to find in Java Scrpit.
 * @param columns: Columns of the section. Two dimensional array.
 * @param apiName: API Name of the field.
 * @param required: Boolean value to determine if field is required or not.
 * @param readOnly: Boolean value to determine if field is read only or not.
 */
const fieldConfig = [
    {
        sectionName: ['Case Overview', 'Case_Overview'],
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
        sectionName: ['Case Details', 'Case_Details'],
        columns: [
            [
                { apiName: 'Category__c', required: true, readOnly: false },
                { apiName: 'Sub_Category__c', required: true, readOnly: false },
                { apiName: 'Description', required: true, readOnly: false }
            ],
            [
                { apiName: 'Subject', required: true, readOnly: false },
                { apiName: 'ParentId', required: false, readOnly: false }

            ]
        ]
    }
];

/**
 * Description: This is on change field mapping for Case New custom layout having case field api name, required and disabled properties
 * Object: Keys are the API Name to be configured as on chnage and hold array of objects having key as field value configured as
 * on change and array of objects holding api names and properties.
 * Applicatable for NEW CASE
 */
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
    ],
    Department__c: [
        {
            "Computer Science": [
                {
                    apiName: 'Gift_Card_Service__c', required: false
                }
            ]
        }
    ]
};

/** Description: Edit Case layout mapper configuration for New Case Layout.
 * @param sectionName: Name of the section followed by Key used to find in Java Scrpit.
 * @param columns: Columns of the section. Two dimensional array.
 * @param apiName: API Name of the field.
 * @param required: Boolean value to determine if field is required or not.
 * @param readOnly: Boolean value to determine if field is read only or not.
 */
const fieldConfigEdit = [
    {
        sectionName: ['Case Overview', 'Case_Overview'], // 0: LABEL AND 1:BACKEND ELEMENT KEY without white spaces
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
        sectionName: ['Case Details', 'Case_Details'],
        columns: [
            [
                { apiName: 'Category__c', required: true, readOnly: false },
                { apiName: 'Sub_Category__c', required: true, readOnly: false },
                { apiName: 'Description', required: true, readOnly: false },
                { apiName: 'IsEscalated', required: false, readOnly: false }
            ],
            [
                { apiName: 'Subject', required: true, readOnly: false },
                { apiName: 'ParentId', required: false, readOnly: false }

            ]
        ]
    },
    {
        sectionName: ['Case Resolution', 'Case_Resolution'],
        columns: [
            [
                { apiName: 'Authentication_Override_Reason__c', required: false, readOnly: true }
            ],
            [
                // Placeholder - Second Column Fields IsEscalated

            ]
        ]
    },
    {
        sectionName: ['System Information', 'System_Information'],
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
/**
 * Description: This is on change field mapping for Case New custom layout having case field api name, required and disabled properties
 * Object: Keys are the API Name to be configured as on chnage and hold array of objects having key as field value configured as
 * on change and array of objects holding api names and properties.
 * Applicatable for EDIT CASE
 */
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
                { apiName: 'Product__c', required: true },
                { apiName: 'Target_Date__c', required: false },
                { apiName: 'Reason', required: true }
            ]
        }
    ],
    IsEscalated: [
        {
            true: [
                { apiName: 'External_Resolution_Notes__c', required: false }
            ]
        }
    ],
    Department__c: [
        {
            "Computer Science": [
                { apiName: 'Gift_Card_Service__c', required: false }
            ]
        }
    ]
};

/**
 * Description: This will decide index of section where the on Change fields will be pushed, this is very important mapping
 * Example: Status is API Name configured in value change mapper and 0 is the section name where fields
 * will be pushed from value change mapper
 * 
 * This is shared for NEW and EDIT - further customizaton required to make it separate
 */
const sectionIndexMapper = {
    Status: 0,
    Origin: 0,
    Department__c: 0,
    Category__c: 1, // On Change of Category will push dependent fields in Section index as 1 starting from 0
    IsEscalated: 1
};

/**
 * Description: This is the section visibility config for the fields, this is very important mapping
 * Example: Origin is API Name configured in section visibility config and Web is the value configured
 * If Origin is Web then System_Information key section will be shown and if not matched then same will be hidden for all other
 * This is shared for EDIT - further customizaton required to make it separate
 */
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
/** Exporting all constants */
export { customStatusRequiredValidation, newContactVisibility, fieldMapperContactDefault, readOnlyCaseStatus, sectionVisibilityConfig, defaultContactRecordType, fieldMapperContact, fieldConfig, valueChangeMapper, fieldConfigEdit, valueChangeMapperEdit, acSection, sectionIndexMapper, defaultCaseRecordType };