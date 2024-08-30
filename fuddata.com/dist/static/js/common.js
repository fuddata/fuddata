export function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export function IsEuCountry(countryCode) {
    const countryCodes = [
        "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
        "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
        "PL", "PT", "RO", "SK", "SI", "ES", "SE"
    ];
    if (countryCodes.includes(countryCode)) {
        return true;
    }
    return false;
}

export function IsBannedCountry(countryCode) {
    const countryCodes = [
        "BY", "CU", "IR", "KP", "LY", "MM", "RU", "SY", "VE", "ZW"
    ];
    if (countryCodes.includes(countryCode)) {
        return true;
    }
    return false;
}
