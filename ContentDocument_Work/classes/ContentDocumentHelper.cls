/**
 * @description       : 
 * @author            : Kuldeep Singh
 * @group             : 
 * @last modified on  : 08-31-2024
 * @last modified by  : Kuldeep Singh
**/
public with sharing class ContentDocumentHelper {
    
    private static final Set<String> ALLOWED_EXTENSIONS = new Set<String>{
        'csv', 'doc', 'docx', 'excel', 'image', 'jpg', 'jpeg', 'mp4', 
        'pdf', 'png', 'ppt', 'pptx', 'word', 'xml', 'xls', 'xlsx'
    };

    public ContentDocumentHelper() {
        System.debug('ContentDocumentHelper instantized');
    }

    public static void processContentVersions(List<ContentVersion> contentVersions) {
        
        Set<String> contentDocumentIdsToDelete = new Set<String>();
        // Collect ContentDocument IDs associated with invalid ContentVersions
        for (ContentVersion version : contentVersions) {
            
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

    public static Boolean isAllowedExtension(String fileExtension) {
        return ALLOWED_EXTENSIONS.contains(fileExtension.toLowerCase());
    }
}