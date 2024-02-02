# About

# Architecture
Design principles:
* No cookies
* No tracking of users
* No usage leaking for 3rd parties
* Secure by design.
  * TLS 1.3 only, warning on TLS 1.2

## Email
* DNSSEC
* Rich text only
* DMARC, DKIM, and SPF
* TLS only
* Digital Signing

## User data collection
* https://developers.cloudflare.com/fundamentals/reference/http-request-headers/

## 3rd party APIs
* [EU VIES (VAT Information Exchange System)](https://ec.europa.eu/taxation_customs/vies/)
  * Supported country codes: https://ec.europa.eu/taxation_customs/vies/rest-api/configurations
  * Cross-border VAT e-commerce in EU rules: https://taxation-customs.ec.europa.eu/vat-e-commerce_en and https://vat-one-stop-shop.ec.europa.eu/one-stop-shop_en
* [Revolut](https://developer.revolut.com)
* [Xero](https://developer.xero.com)

# UI
Fast fonts with privacy:
* https://blog.cloudflare.com/cloudflare-fonts-enhancing-website-privacy-speed/
* https://developers.cloudflare.com/speed/optimization/content/fonts/
Dark mode: https://css-tricks.com/a-complete-guide-to-dark-mode-on-the-web/

# KV
Each application has its own namespace (`KV_<app name>`)
Key value is always machine/AD domain/Azure AD GUID.

## Values
Possible values are described below:
| Value | Description                |
| ----- | -------------------------- |
| 11    | Computer: Unlicensed       |
| 12    | Computer: License ordered  |
| 13    | Computer: License paid     |
| 21    | AD domain: Unlicensed      |
| 22    | AD domain: License ordered |
| 23    | AD domain: License paid    |
| 31    | Azure AD: Unlicensed       |
| 32    | Azure AD: License ordered  |
| 33    | Azure AD: License paid     |

## Metadata
Following metadata values are used:
| Key value            | Metadata name | Metadata value            |
| -------------------- | ------------- | ------------------------- |
| all                  | countryCode   | CF-IPCountry value        |
| unlicensed           | firstStart    | Date in format yyyy-MM-dd |
| license ordered/paid | invoiceId     | Xero invoice ID           |
