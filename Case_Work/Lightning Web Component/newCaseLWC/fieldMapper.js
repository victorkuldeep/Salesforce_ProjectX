/**
 * @description - This is field mapper to dynamically create New and Edit layout for case object.
 */

// default record type set while creating new contact record
const defaultContactRecordType = 'Contact'
// read only case status
const readOnlyCaseStatus = ['Closed-XXX']
// Defaut first Section name - statically mapped in LWC HTML
const acSection = 'Account and Contact Details'

/**
 * Descroiption: This is field mapping for Contact New custom layout having contact field api name, required and disabled properties
 */
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
                { apiName: 'ParentId', required: true, readOnly: false }

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
                { apiName: 'ParentId', required: true, readOnly: false }

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
                { apiName: 'Product__c', required: true }
            ]
        }
    ],
    IsEscalated: [
        {
            true: [
                { apiName: 'External_Resolution_Notes__c', required: true }
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
export { fieldMapperContactDefault, readOnlyCaseStatus, sectionVisibilityConfig, defaultContactRecordType, fieldMapperContact, fieldConfig, valueChangeMapper, fieldConfigEdit, valueChangeMapperEdit, acSection, sectionIndexMapper };