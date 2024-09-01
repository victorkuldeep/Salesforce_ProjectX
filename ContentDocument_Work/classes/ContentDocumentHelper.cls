/**
 * @description       : 
 * @author            : Kuldeep Singh
 * @group             : 
 * @last modified on  : 09-01-2024
 * @last modified by  : Kuldeep Singh
**/
public with sharing class ContentDocumentHelper {
    
    // Set of allowed file extensions.
    private static final Set<String> ALLOWED_EXTENSIONS = new Set<String>{
        'csv', 'doc', 'docx', 'excel', 'image', 'jpg', 'jpeg', 'mp4', 
        'pdf', 'png', 'ppt', 'pptx', 'word', 'xml', 'xls', 'xlsx', 'file'
    };

    // Default constructor
    public ContentDocumentHelper() {
        System.debug('ContentDocumentHelper instantized');
    }

    /**
    * Processes a list of ContentVersion records to identify and handle files with disallowed extensions.
    *
    * This method checks each ContentVersion's file extension to determine if it is allowed. 
    * If a file extension is not allowed, the associated ContentDocument ID is added to a set for further processing.
    * A platform event, `FileEvent__e`, is published for each disallowed ContentDocument ID to handle file deletion or other actions.
    *
    * @param contentVersions The list of ContentVersion records to be processed.
    */
    public static void processContentVersions(List<ContentVersion> contentVersions) {
        
        Set<String> contentDocumentIdsToDelete = new Set<String>();
        
        // Collect ContentDocument IDs associated with invalid ContentVersions
        for (ContentVersion version : contentVersions) {
            
            // Extract file extension from file name as File Extension field is not available in ContentVersion trigger
            String fileName = version.PathOnClient != null ? version.PathOnClient : '';
            String fileExtension = fileName.substringAfterLast('.').toLowerCase();
            
            if (fileExtension != null && !isAllowedExtension(fileExtension)) {
                contentDocumentIdsToDelete.add(version.ContentDocumentId);
            }
        }
        
        if (!contentDocumentIdsToDelete.isEmpty()) {
            // publish file event to further processing the files
            List<FileEvent__e> fileEvents = new List<FileEvent__e>();
            for(String var : contentDocumentIdsToDelete){

                FileEvent__e fileEvent = new FileEvent__e(
                    RecordId__c = var,
                    Action__c = 'DELETE'
                );

                fileEvents.add(fileEvent);
            }
            /** Publishing file event for further processing */
            EventBus.publish(fileEvents);
        }
    }

    /**
    * Checks if a given file extension is allowed.
    *
    * This method verifies if the provided file extension is included in the list of allowed extensions. 
    * The check is case-insensitive, ensuring consistency in validation.
    *
    * @param fileExtension The file extension to check (e.g., "jpg", "png", "pdf").
    * @return Boolean      Returns true if the file extension is allowed; false otherwise.
    */
    public static Boolean isAllowedExtension(String fileExtension) {
        return ALLOWED_EXTENSIONS.contains(fileExtension.toLowerCase());
    }
}