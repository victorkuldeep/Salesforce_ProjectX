import { LightningElement, api } from "lwc";
import flagTelpicker from "@salesforce/resourceUrl/flagTelpicker";
import { loadScript, loadStyle } from "lightning/platformResourceLoader";
export default class CustomPhonePicker extends LightningElement {
    @api inputElem;
    @api mandatory = false;
    @api defaultCountry = "in";

    fieldLabel;
    isLoadScript = false;
    dialCode = "91"; // Initial Country default dial code
    phoneNumber = "";
    debounceTimer;

    connectedCallback() {
        this.fieldLabel = this.inputElem ?? "Enter Phone Number";
    }
    renderedCallback() {
        if (this.isLoadScript) {
            return;
        }

        this.isLoadScript = true;

        Promise.all([
            loadStyle(this, flagTelpicker + "/css/cmpglobal.css"),
            loadStyle(this, flagTelpicker + "/css/intlTelInput.css"),
            loadScript(this, flagTelpicker + "/js/utils.js"),
            loadScript(this, flagTelpicker + "/js/intlTelInput.js")
        ])
            .then(() => {
                console.log("Scipt Loaded Successfully");
                this.initFlagpicker();
            })
            .catch((error) => {
                console.log(error);
            });
    }

    initFlagpicker() {
        const input = this.template.querySelector("[data-id=phone]");
        window.intlTelInput(input, {
            separateDialCode: true,
            excludeCountries: ["il"],
            preferredCountries: ["us", "gb", "in"],
            initialCountry: this.defaultCountry
        });
        input.addEventListener("countrychange", this.handleCountryChange.bind(this));
    }

    handleInputChange(event) {
        this.phoneNumber = event.target.value;
        // Clear the previous timer if any
        clearTimeout(this.debounceTimer);
        // Set a new timer
        this.debounceTimer = setTimeout(() => {
            // Dispatch custom event to parent LWC
            const valueChangeEvent = new CustomEvent("valuechange", {
                detail: {
                    fullPhoneNumber: `+${this.dialCode} ${this.phoneNumber}`,
                    inputElement: this.inputElem,
                    dialcode: `+${this.dialCode}`,
                    phoneNumber: this.phoneNumber,
                    isValid: true
                }
            });
            this.dispatchEvent(valueChangeEvent);
        }, 500); // 500 ms delay
    }

    handleCountryChange(event) {
        const input = event.target;
        const intlTelInputInstance = window.intlTelInputGlobals.getInstance(input);
        const countryData = intlTelInputInstance.getSelectedCountryData();
        this.dialCode = countryData.dialCode;
    }
}
