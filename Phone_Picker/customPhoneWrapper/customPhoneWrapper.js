import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const countryCodeToIsoMap = {
    "+93": "af",
    "+355": "al",
    "+213": "dz",
    "+1684": "as",
    "+376": "ad",
    "+244": "ao",
    "+1264": "ai",
    "+1268": "ag",
    "+54": "ar",
    "+374": "am",
    "+297": "aw",
    "+247": "ac",
    "+61": "au",
    "+43": "at",
    "+994": "az",
    "+1242": "bs",
    "+973": "bh",
    "+880": "bd",
    "+1246": "bb",
    "+375": "by",
    "+32": "be",
    "+501": "bz",
    "+229": "bj",
    "+1441": "bm",
    "+975": "bt",
    "+591": "bo",
    "+387": "ba",
    "+267": "bw",
    "+55": "br",
    "+246": "io",
    "+1284": "vg",
    "+673": "bn",
    "+359": "bg",
    "+226": "bf",
    "+257": "bi",
    "+855": "kh",
    "+237": "cm",
    "+1": "us", // shared by many NANP countries, defaulted to US
    "+238": "cv",
    "+599": "cw", // base code
    "+236": "cf",
    "+235": "td",
    "+56": "cl",
    "+86": "cn",
    "+57": "co",
    "+269": "km",
    "+243": "cd",
    "+242": "cg",
    "+682": "ck",
    "+506": "cr",
    "+225": "ci",
    "+385": "hr",
    "+53": "cu",
    "+357": "cy",
    "+420": "cz",
    "+45": "dk",
    "+253": "dj",
    "+1767": "dm",
    "+1809": "do",
    "+593": "ec",
    "+20": "eg",
    "+503": "sv",
    "+240": "gq",
    "+291": "er",
    "+372": "ee",
    "+268": "sz",
    "+251": "et",
    "+500": "fk",
    "+298": "fo",
    "+679": "fj",
    "+358": "fi",
    "+33": "fr",
    "+594": "gf",
    "+689": "pf",
    "+241": "ga",
    "+220": "gm",
    "+995": "ge",
    "+49": "de",
    "+233": "gh",
    "+350": "gi",
    "+30": "gr",
    "+299": "gl",
    "+1473": "gd",
    "+590": "gp",
    "+1671": "gu",
    "+502": "gt",
    "+44": "gb",
    "+224": "gn",
    "+245": "gw",
    "+592": "gy",
    "+509": "ht",
    "+504": "hn",
    "+852": "hk",
    "+36": "hu",
    "+354": "is",
    "+91": "in",
    "+62": "id",
    "+98": "ir",
    "+964": "iq",
    "+353": "ie",
    "+972": "il",
    "+39": "it",
    "+1876": "jm",
    "+81": "jp",
    "+962": "jo",
    "+7": "ru",
    "+254": "ke",
    "+686": "ki",
    "+383": "xk",
    "+965": "kw",
    "+996": "kg",
    "+856": "la",
    "+371": "lv",
    "+961": "lb",
    "+266": "ls",
    "+231": "lr",
    "+218": "ly",
    "+423": "li",
    "+370": "lt",
    "+352": "lu",
    "+853": "mo",
    "+261": "mg",
    "+265": "mw",
    "+60": "my",
    "+960": "mv",
    "+223": "ml",
    "+356": "mt",
    "+692": "mh",
    "+596": "mq",
    "+222": "mr",
    "+230": "mu",
    "+262": "re",
    "+52": "mx",
    "+691": "fm",
    "+373": "md",
    "+377": "mc",
    "+976": "mn",
    "+382": "me",
    "+1664": "ms",
    "+212": "ma",
    "+258": "mz",
    "+95": "mm",
    "+264": "na",
    "+674": "nr",
    "+977": "np",
    "+31": "nl",
    "+687": "nc",
    "+64": "nz",
    "+505": "ni",
    "+227": "ne",
    "+234": "ng",
    "+683": "nu",
    "+850": "kp",
    "+389": "mk",
    "+47": "no",
    "+968": "om",
    "+92": "pk",
    "+680": "pw",
    "+970": "ps",
    "+507": "pa",
    "+675": "pg",
    "+595": "py",
    "+51": "pe",
    "+63": "ph",
    "+48": "pl",
    "+351": "pt",
    "+974": "qa",
    "+40": "ro",
    "+250": "rw",
    "+290": "sh",
    "+1869": "kn",
    "+1758": "lc",
    "+508": "pm",
    "+1784": "vc",
    "+685": "ws",
    "+378": "sm",
    "+239": "st",
    "+966": "sa",
    "+221": "sn",
    "+381": "rs",
    "+248": "sc",
    "+232": "sl",
    "+65": "sg",
    "+421": "sk",
    "+386": "si",
    "+677": "sb",
    "+252": "so",
    "+27": "za",
    "+82": "kr",
    "+211": "ss",
    "+34": "es",
    "+94": "lk",
    "+249": "sd",
    "+597": "sr",
    "+46": "se",
    "+41": "ch",
    "+963": "sy",
    "+886": "tw",
    "+992": "tj",
    "+255": "tz",
    "+66": "th",
    "+670": "tl",
    "+228": "tg",
    "+676": "to",
    "+1868": "tt",
    "+216": "tn",
    "+90": "tr",
    "+993": "tm",
    "+688": "tv",
    "+256": "ug",
    "+380": "ua",
    "+971": "ae",
    "+598": "uy",
    "+998": "uz",
    "+678": "vu",
    "+58": "ve",
    "+84": "vn",
    "+681": "wf",
    "+967": "ye",
    "+260": "zm",
    "+263": "zw",
    "+35818": "ax"
};

export default class CustomPhoneWrapper extends LightningElement {
    @api label;
    @api recordId;
    @api obj;
    @api fieldapi;
    renderPhonePicker = false;
    enableSave = false;
    fullPhoneNumber;
    inputElement;
    countryCode;
    isoCode;
    phoneNumber;

    // --- COUNTRY CODE → ISO MAP ---
    countryCodeMap = countryCodeToIsoMap;

    // --- DYNAMIC FIELD WIRE ---
    @wire(getRecord, {
        recordId: '$recordId',
        fields: '$dynamicField'
    })
    recordHandler({ data, error }) {
        if (data) {
            // Get dynamic field value
            const fullPhone = data.fields[this.fieldapi]?.value;
            console.log('Full Phone Number from record: ' + fullPhone);
            if (fullPhone) {
                this.fullPhoneNumber = fullPhone;
                this.parsePhoneNumber(fullPhone);
                this.renderPhonePicker = true;
            }
        } else if (error) {
            console.error('Error loading record:', error);
            this.renderPhonePicker = true;
        }
    }
    // --- COMPUTED DYNAMIC FIELD PATH ---
    get dynamicField() {
        // example: "Account.Phone" or "Contact.MobilePhone"
        return [`${this.obj}.${this.fieldapi}`];
    }

    // --- SPLIT PHONE INTO COUNTRY + NUMBER + ISO ---
    parsePhoneNumber(fullPhone) {
        const parts = fullPhone.trim().split(/\s+/); // split by space(s)
        if (parts.length >= 2) {
            this.countryCode = parts[0];
            this.phoneNumber = parts.slice(1).join(' '); // handle multi-part numbers
            console.log('Phone Parsed Successfully');
        } else {
            // fallback: assume default country code
            this.countryCode = '+1';
            this.phoneNumber = fullPhone;
        }
        this.isoCode = this.countryCodeMap[this.countryCode] || 'us';
        console.log('Parsed Phone:', JSON.stringify({
            fullPhone: this.fullPhoneNumber,
            countryCode: this.countryCode,
            isoCode: this.isoCode,
            phoneNumber: this.phoneNumber
        }));
    }

    handleCustomPhone(event) {
        this.enableSave = true;
        this.fullPhoneNumber = event.detail.fullPhoneNumber;
        this.inputElement = event.detail.inputElement;
    }

    handleSave(event) {
        this.enableSave = false;
        // MAKE DML
        const fields = {};
        fields['Id'] = this.recordId;
        fields[this.fieldapi] = this.fullPhoneNumber;

        const recordInput = {
            fields
        };
        updateRecord(recordInput)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record saved successfully',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                console.error(error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error saving record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
                this.enableSave = true; // let user try again
            });
    }
}