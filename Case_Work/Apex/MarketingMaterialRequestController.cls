/**
 * @description       : 
 * @author            : Kuldeep Singh
 * @group             : 
 * @last modified on  : 04-18-2025
 * @last modified by  : Kuldeep Singh
**/
public without sharing class MarketingMaterialRequestController {
    
    public Boolean showSuccessPopup { get; set; }
    public Boolean showErrorPopup { get; set; }
    public String caseRef { get; set; }
    public String firstName { get; set; }
    public String lastName { get; set; }
    public String email { get; set; }
    public String city { get; set; }
    public String state { get; set; }
    public String postalCode { get; set; }
    public String country { get; set; }
    public String partnerType { get; set; }
    public String officeCode { get; set; }
    public String comments { get; set; }
    public String shippingAddress1 { get; set; }
    public String shippingAddress2 { get; set; }
    public List<MaterialsWrapper> wrapperList { get; set; }
    public List<MaterialPairWrapper> pairList { get; set; }
    public List<ImageItem> imageList { get; set; }
    public List<String> errorMessages { get; set; }
    public List<String> getMaterials() {
        return new List<String>{
            'SkyTab Brochure',
            'SkyTab Glass Die Cut Sales Postcard',
            'SkyTab Brochure - Spanish',
            'SkyTab Sales Postcard',
            'SkyTab Mobile Slick',
            'SkyTab Referral Postcard',
            'SkyTab Mobile Slick - Spanish',
            'Shift4 Overview Brochure'
        };
    }
    public List<SelectOption> getCountryOptions() {
        List<SelectOption> options = new List<SelectOption>();
        options.add(new SelectOption('', '-- Select Country --')); // placeholder
        options.add(new SelectOption('USA', 'USA'));
        options.add(new SelectOption('Canada', 'Canada'));
        return options;
    }
    public List<SelectOption> getPartnerTypeOptions() {
        List<SelectOption> options = new List<SelectOption>();
        options.add(new SelectOption('', '-- Select Partner Type --')); // placeholder
        options.add(new SelectOption('ISV', 'ISV'));
        options.add(new SelectOption('VAR', 'VAR'));
        return options;
    }

    public MarketingMaterialRequestController(){   
        List<MaterialsWrapper> allMaterials = new List<MaterialsWrapper>();
        for (String m : getMaterials()) {
            allMaterials.add(new MaterialsWrapper(m, false));
        }
        pairList = new List<MaterialPairWrapper>();
        for (Integer i = 0; i < allMaterials.size(); i += 2) {
            MaterialsWrapper left = allMaterials[i];
            MaterialsWrapper right = (i + 1 < allMaterials.size()) ? allMaterials[i + 1] : null;
            pairList.add(new MaterialPairWrapper(left, right));
        }
        imageList = new List<ImageItem>{
            new ImageItem('SkyTab Brochure', 'https://example.com/1', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbbuZ7MvavzAv5HKfdKQ_lVmdqKY6DaBwmEw&s'),
            new ImageItem('SkyTab Brochure - Spanish', 'https://example.com/2', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbbuZ7MvavzAv5HKfdKQ_lVmdqKY6DaBwmEw&s'),
            new ImageItem('SkyTab Mobile Slick', 'https://example.com/3', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbbuZ7MvavzAv5HKfdKQ_lVmdqKY6DaBwmEw&s'),
            new ImageItem('SkyTab Mobile Slick - Spanish', 'https://example.com/4', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbbuZ7MvavzAv5HKfdKQ_lVmdqKY6DaBwmEw&s'),
            new ImageItem('SkyTab Glass Die Cut Sales Postcard', 'https://example.com/5', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbbuZ7MvavzAv5HKfdKQ_lVmdqKY6DaBwmEw&s'),
            new ImageItem('SkyTab Sales Postcard', 'https://example.com/6', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbbuZ7MvavzAv5HKfdKQ_lVmdqKY6DaBwmEw&s'),
            new ImageItem('SkyTab Referral Postcard', 'https://example.com/7', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbbuZ7MvavzAv5HKfdKQ_lVmdqKY6DaBwmEw&s'),
            new ImageItem('Shift4 Overview Brochure', 'https://example.com/8', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbbuZ7MvavzAv5HKfdKQ_lVmdqKY6DaBwmEw&s')
        };
    }

    public PageReference closeError() {
        showSuccessPopup = false; // Reset the flag to hide the popup
        showErrorPopup = false;
        return null;
    }

    public PageReference submitMarketingRequest() {
        errorMessages = new List<String>();
        if (String.isBlank(country)) {
            errorMessages.add('Please select Country.');
        }
        if (String.isBlank(partnerType)) {
            errorMessages.add('Please select a Partner Type.');
        }
        if (!errorMessages.isEmpty()) {
            showErrorPopup = true;
            return null;
        }  
        String address = 'Address: ' + shippingAddress1 + ', ' + shippingAddress2 + ', ' + 'City: ' + city + ', State: ' + state + ', Zip: ' + postalCode + ', Country: ' + country;
        String description = address +  + ' Description: ' + comments;
        List<String> selected = new List<String>();
        for (MaterialPairWrapper pair : pairList) {
            if (pair.left != null && pair.left.selected) selected.add(pair.left.name);
            if (pair.right != null && pair.right.selected) selected.add(pair.right.name);
        }
        String materialString = String.join(selected, ', ');
        try{
            /** Case Creation */
            Case c = new Case();
            c.SuppliedName = firstName + ' ' + lastName; // Web Name
            c.SuppliedEmail = email; // Web Email
            c.Subject = 'New Marketing Material Request';
            c.Origin = 'Web';
            c.Description = description;
            c.Priority = 'Medium';
            c.Status = 'New';
            c.Department__c = 'Partner Support';
            c.Category__c = 'Partner Support';
            c.Sub_Category__c = 'Marketing Material Request';
            c.Shipping_Address__c = address;
            c.Marketing_Materials_Requested__c = materialString;
            c.Web_Office_Code__c = officeCode;
            c.Web_Partner_Type__c = partnerType;
            system.debug(JSON.serialize(c));
            insert c;
            caseRef = [SELECT caseNumber FROM Case WHERE Id = :c.Id].caseNumber; // Fetch the case number
            showSuccessPopup = true; // Set flag to show popup on Successful Insert
            return null;
        }catch (Exception e) {
            errorMessages.add('Error while creating Case: ' + e.getMessage());
            showErrorPopup = true;
            return null;
        }
        
    }
    
    public class MaterialsWrapper {
        public String name { get; set; }
        public Boolean selected { get; set; }
        public MaterialsWrapper(String name, Boolean selected){
            this.name = name;
            this.selected = selected;
        }
	}

    public class MaterialPairWrapper {
        public MaterialsWrapper left { get; set; }
        public MaterialsWrapper right { get; set; }

        public MaterialPairWrapper(MaterialsWrapper left, MaterialsWrapper right) {
            this.left = left;
            this.right = right;
        }
    }

    public class ImageItem {
        public String title { get; set; }
        public String link { get; set; }
        public String imgUrl { get; set; }

        public ImageItem(String title, String link, String imgUrl) {
            this.title = title;
            this.link = link;
            this.imgUrl = imgUrl;
        }
    }
}