import { IsEuCountry, IsBannedCountry, validateEmail } from "./common.js";

document.addEventListener("DOMContentLoaded", () => {
    let formSubmitted = false;
    document.addEventListener('submit', function (event) {
        event.preventDefault();
    });
    if (formSubmitted) return;

    const urlStr = window.location.href;
    const url = new URL(urlStr);
    var appName = "Hello World";
    if (window.location.href.startsWith("https://www.localadminotp.com/order")) {
        appName = "Local Admin OTP";
    }
    const params = new URLSearchParams(url.search);
    const paramLicensetype = params.get('licensetype');
    const paramClientid = params.get('clientid');

    // Handle old versions
    if (paramLicensetype === '1') {
        const newUrl = `${url.origin}/registration?clientid=${paramClientid}`;
        window.location.href = newUrl;
    }

    const licensetype = document.getElementById("license-type");
    switch (paramLicensetype) {
    case "2":
        licensetype.value = "Microsoft Entra ID";
        break;
    case "3":
        licensetype.value = "Active Directory";
        break;
    case "4":
        licensetype.value = "Google Credential Provider";
        break;
    default:
        licensetype.value = "Unknown";
    }
    const clientid = document.getElementById("client-id");
    clientid.value = atob(paramClientid);

    // Populate country selection and show/hide VAT part based on that
    const vefifyVatBtn = document.getElementById('vat-verify');
    const orderBtn = document.getElementById('order-submit');
    const countrySelect = document.getElementById("order-country");
    const address = document.getElementById("address");
    const reference = document.getElementById("order-reference");
    const email = document.getElementById("order-email");
    const company = document.getElementById("order-company");
    const vatID = document.getElementById('vat-id');
    const agreeTerms = document.getElementById("agree-terms");
    const message = document.getElementById("order-message");
    const joinEmaillist = document.getElementById("join-emaillist");
    let companyName = "";
    var isEU = true;
    const vatSectionToggle = () => {
        isEU = IsEuCountry(countrySelect.value);
        const vatSection = document.getElementById("vat-section");
        const companySection = document.getElementById("company-section");
        const addressSection = document.getElementById("address-section");
        const referenceSection = document.getElementById("reference-section");
        if (isEU) {
            vatID.disabled = false;
            if (vatSection.classList.contains('hidden')) {
                vatSection.classList.toggle('hidden');
            }
            company.disabled = true;
            if (!companySection.classList.contains('hidden')) {
                companySection.classList.toggle('hidden');
            }
            if (addressSection.classList.contains('hidden')) {
                addressSection.classList.toggle('hidden');
            }
            reference.disabled = true;
            email.disabled = true;
            vatIdVerified = false;
        }
        if (!IsEuCountry(countrySelect.value)) {
            vatID.disabled = true;
            if (!vatSection.classList.contains('hidden')) {
                vatSection.classList.toggle('hidden');
            }
            company.disabled = false;
            if (companySection.classList.contains('hidden')) {
                companySection.classList.toggle('hidden');
            }
            if (!addressSection.classList.contains('hidden')) {
                addressSection.classList.toggle('hidden');
            }
            reference.disabled = false;
            email.disabled = false;
            vatIdVerified = true;
        }
        if (IsBannedCountry(countrySelect.value)) {
            countrySelect.disabled = true;
            const countryWarning = document.getElementById("country-warning");
            if (countryWarning.classList.contains('hidden')) {
                countryWarning.classList.toggle('hidden');
            }
            if (!companySection.classList.contains('hidden')) {
                companySection.classList.toggle('hidden');
            }
            if (!address.classList.contains('hidden')) {
                address.classList.toggle('hidden');
            }
            if (!referenceSection.classList.contains('hidden')) {
                referenceSection.classList.toggle('hidden');
            }
            const emailSection = document.getElementById("email-section");
            if (!emailSection.classList.contains('hidden')) {
                emailSection.classList.toggle('hidden');
            }
            if (!orderBtn.classList.contains('hidden')) {
                orderBtn.classList.toggle('hidden');
            }
            vatIdVerified = true;
        }
        updatePrice(isEU, appName);
    };
    countrySelect.addEventListener('change', vatSectionToggle);
    fetch("https://www.fuddata.com/api/country/")
        .then(response => response.json())
        .then(data => {
            for (let code in data.countries) {
                if (data.countries.hasOwnProperty(code)) {
                    const option = document.createElement("option");
                    option.value = code;
                    option.textContent = data.countries[code];
                    countrySelect.appendChild(option);
                }
            }
            countrySelect.value = data.countryCode;
            vatSectionToggle();
        });


    const updatePrice = (isEU, appName) => {
        const nFormat = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2 });
        let priceWithoutTax = 499;
        let vatRate = 0;
        let currency = "USD";
        if (isEU) {
            currency = "EUR";
        }
        if (countrySelect.value == "MT") {
            vatRate = 18;
        }
        let tax = priceWithoutTax * vatRate / 100;
        let priceWithTax = priceWithoutTax + tax;

        document.getElementById("price").innerText = currency + " " + nFormat.format(priceWithoutTax);
        document.getElementById("app-price").innerText = appName + ": " + currency + " " + nFormat.format(priceWithoutTax);
        document.getElementById("sub-total").innerText = "Subtotal: " + currency + " " + nFormat.format(priceWithoutTax);
        document.getElementById("tax-rate").innerText = "Total sales tax: " + vatRate + " % " + currency + " " + tax;
        document.getElementById("total-due").innerText = "Total due: " + currency + " " + nFormat.format(priceWithTax);
    };

    let vatIdVerified = false;
    const verifyVatID = () => {
        if (vatIdVerified || vatID.value == "") {
            return;
        }
        const varError = document.getElementById('var-error');
        fetch("https://www.fuddata.com/api/vat?country=" + countrySelect.value + "&id=" + vatID.value)
            .then(response => response.json())
            .then(data => {
                if (data.status == 0) {
                    vefifyVatBtn.classList.toggle('hidden');
                    if (!varError.classList.contains('hidden')) {
                        varError.classList.toggle('hidden');
                    }
                    vatID.disabled = true;
                    countrySelect.disabled = true;
                    const messageSplit1 = data.message.split('\n');
                    companyName = messageSplit1[0];
                    address.value = data.message;
                    reference.disabled = false;
                    email.disabled = false;
                    vatIdVerified = true;
                } else {
                    if (varError.classList.contains('hidden')) {
                        varError.classList.toggle('hidden');
                    }
                }
            });
    };

    const sendOrder = () => {
        if (address.value == "" || email.value == "" || paramClientid == null || paramLicensetype == null || !agreeTerms.checked) {
            return;
        }
        const invalidEmail = document.getElementById('invalid-email');
        if (validateEmail(email.value)) {
            if (!invalidEmail.classList.contains('hidden')) {
                invalidEmail.classList.toggle('hidden');
            }
        } else {
            if (invalidEmail.classList.contains('hidden')) {
                invalidEmail.classList.toggle('hidden');
            }
            return;
        }
        if (!orderBtn.classList.contains('hidden')) {
            orderBtn.classList.toggle('hidden');
        }

        if (!isEU) {
            companyName = company.value;
        }

        const body = {
            app: appName,
            type: paramLicensetype,
            clientid: atob(paramClientid),
            country: countrySelect.value,
            company: companyName,
            reference: reference.value,
            email: email.value,
            message: message.value,
            joinMaillist: joinEmaillist.checked,
        }
        const init = {
            body: JSON.stringify(body),
            method: "POST",
            headers: {
                "Referer": window.location.origin,
            },
        };
        fetch("https://www.fuddata.com/api/order/", init)
            .then(response => response.json())
            .then(data => {
                const regSuccess = document.getElementById('order-success');
                const regFailed = document.getElementById('order-failed');
                const regInfo = document.getElementById('order-info')
                const errMsg = "Order failed. Please, try again later or contact us in contact page.";
                if (data.status == 0) {
                    regSuccess.innerText = "Thank you for your order.";
                    regSuccess.classList.toggle("hidden");
                    regInfo.innerText = "We will email your invoice for you shortly.";
                    regInfo.classList.toggle("hidden");
                } else if (data.status == 2) {
                    regFailed.innerText = "License for this client ID have been ordered already earlier.";
                    regFailed.classList.toggle("hidden");
                    regInfo.innerText = "We will contact you with email shortly.";
                    regInfo.classList.toggle("hidden");
                } else if (data.status == 3) {
                    regFailed.innerText = "This client ID is already licensed.";
                    regFailed.classList.toggle("hidden");
                    regInfo.innerText = "Please, try restart your computer with internet connectivity and contact us if that does not help.";
                    regInfo.classList.toggle("hidden");
                } else {
                    regFailed.innerText = errMsg;
                    regFailed.classList.toggle("hidden");
                }
            })
            .catch((error) => {
                regInfo.innerText = errMsg;
                regInfo.classList.toggle("hidden");
            })
            .finally(() => {
                formSubmitted = false;
            });
    };
    if (vefifyVatBtn) {
        vefifyVatBtn.addEventListener('click', verifyVatID);
    }
    if (orderBtn) {
        orderBtn.addEventListener('click', sendOrder);
    }
});
