import { IsEuCountry } from "./common.js";

document.addEventListener("DOMContentLoaded", () => {
    fetch("https://www.fuddata.com/api/country/")
        .then(response => response.json())
        .then(data => {
            let priceWithoutTax = 499;
            let currency = "USD";
            if (IsEuCountry(data.countryCode)) {
                currency = "EUR";
            }
            document.getElementById("price").innerText = currency + " " + priceWithoutTax;
        });
});
