/**
 * @description - This is field mapper to dynamically create New and Edit layout for case object.
 */

// default record type set while creating new contact record
const defaultContactRecordType = 'Contact'
// read only case status
const readOnlyCaseStatus = ['xyz']
// Defaut first Section name - statically mapped in LWC HTML
const acSection = 'Account and Contact Details'

/** This object mapping controls in which mode New Contact button will be visible on UI */
const newContactVisibility = {
    'New': true,
    'Edit': false
}

/** This will trigger required validation when Status is closed or any other value */
const customStatusRequiredValidation = {
    'Closed': 'Origin,Department__c,Category__c,Sub_Category__c,Internal_Resolution_Notes__c'
}

/**
 * Description: This is field mapping for Contact New custom layout having contact field api name, required and disabled properties
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
        sectionName: ['Case Overview','Case_Overview'],
        columns: [
            [
                { apiName: 'Origin', required: true, readOnly: false },
                { apiName: 'Status', required: true, readOnly: false },
                { apiName: 'Priority', required: false, readOnly: false },
                { apiName: 'Department__c', required: false, readOnly: false },
            ],
            [
                
            ]
        ]
    },
    {
        sectionName: ['Case Details','Case_Details'],
        columns: [
            [
                { apiName: 'Subject', required: true, readOnly: false },
                { apiName: 'Description', required: true, readOnly: false },
                { apiName: 'Category__c', required: false, readOnly: false },
                { apiName: 'Sub_Category__c', required: false, readOnly: false },
                { apiName: 'ParentId', required: false, readOnly: false },
                
            ],
            [
                
                
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
        sectionName: ['Case Overview','Case_Overview'], // 0: LABEL AND 1:BACKEND ELEMENT KEY without white spaces
        columns: [
            [
                { apiName: 'Origin', required: true, readOnly: false },
                { apiName: 'Status', required: true, readOnly: false },
                { apiName: 'Priority', required: false, readOnly: false },
                { apiName: 'Department__c', required: false, readOnly: false },
                { apiName: 'Authentication_Override_Reason__c', required: false, readOnly: true }

            ],
            [
                { apiName: 'ContactEmail', required: false, readOnly: false },
                { apiName: 'ContactPhone', required: false, readOnly: false },
 
            ]
        ]
    },
    {
        sectionName: ['Case Details','Case_Details'],
        columns: [
            [
                { apiName: 'Subject', required: true, readOnly: false },
                { apiName: 'Description', required: true, readOnly: false },
                { apiName: 'Category__c', required: false, readOnly: false },
                { apiName: 'Sub_Category__c', required: false, readOnly: false },
                { apiName: 'ParentId', required: false, readOnly: false },
                
            ],
            [
               
                
            ]
        ]
    },
    {
        sectionName: ['Resolution Details','Case_Resolution'],
        columns: [
            
            [
                { apiName: 'Reason', required: false, readOnly: false },
                { apiName: 'Internal_Resolution_Notes__c', required: false, readOnly: false },
                { apiName: 'Include_External_Resolution_Notes__c', required: false, readOnly: false },
                
            ],
            [
                

            ]
            
           
        ]
    },
    {
        sectionName: ['Web to Case Details','Web_Case'],
        columns: [
            
            [
                { apiName: 'SuppliedCompany', required: false, readOnly: false },
                { apiName: 'SuppliedName', required: false, readOnly: false },
                { apiName: 'SuppliedPhone', required: false, readOnly: false },
                { apiName: 'SuppliedEmail', required: false, readOnly: false },
                { apiName: 'Web_Merchant_Id__c', required: false, readOnly: false },
                { apiName: 'Web_Gateway_Serial_Number__c', required: false, readOnly: false },
                { apiName: 'Web_Description__c', required: false, readOnly: false },
                
            ],
            [
               
                
            ]
        ]
    },

    {
        sectionName: ['System Information','System_Information'],
        columns: [
            [
                { apiName: 'CreatedById', required: false, readOnly: true },
                { apiName: 'CreatedDate', required: false, readOnly: true },
                { apiName: 'ClosedDate', required: false, readOnly: true },
                { apiName: 'LastModifiedById', required: false, readOnly: true },
                { apiName: 'Last_Reopened_Datetime__c', required: false, readOnly: true }
            ],
            [
                // Placeholder - Second Column Fields
                { apiName: 'RecordTypeId', required: false, readOnly: true },
                { apiName: 'Case_Age_Days__c', required: false, readOnly: true },
                { apiName: 'Case_Age_Minutes__c', required: false, readOnly: true }
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
                { apiName: 'SuppliedName', required: false },
                { apiName: 'SuppliedEmail', required: false }
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
    Include_External_Resolution_Notes__c: [
        {
        true:[        
             { apiName: 'External_Resolution_Notes__c', required: true}
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
    Category__c: 1,
    Include_External_Resolution_Notes__c: 2 // On Change of Category will push dependent fields in Section index as 1 starting from 0
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
            { section: 'Web_Case', action: 'Show' }
            ],
            default: [
                { section: 'Web_Case', action: 'Hide' }
            ]

        
    }
    // Add more fieldName: value mappings here as needed
};
/** Exporting all constants */
export { customStatusRequiredValidation, newContactVisibility, fieldMapperContactDefault, readOnlyCaseStatus, sectionVisibilityConfig, defaultContactRecordType, fieldMapperContact, fieldConfig, valueChangeMapper, fieldConfigEdit, valueChangeMapperEdit, acSection, sectionIndexMapper };