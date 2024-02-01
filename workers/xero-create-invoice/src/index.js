// Generate product id => details map from environment variable like:
// helloId="26384",helloPrice=1000,helloDesc="Hello World"
function parseProducts(env) {
  const productMap = {};
  for (const key in env) {
      if (key.endsWith('Id')) {
          const prefix = key.slice(0, -2);
          const priceKey = prefix + 'Price';
          const descKey = prefix + 'Desc';
          const discountCode = prefix + 'Discount';
          if (env[priceKey] !== undefined && env[descKey] !== undefined) {
              productMap[env[key]] = {
                  price: env[priceKey],
                  description: env[descKey],
                  discountCode: env[discountCode],
              };
          }
      }
  }
  return productMap;
}
function getProductDetails(productId, env) {
  const products = parseProducts(env);
  return products[productId] || null;
}


// Verify that email domain provided by user matches to company name got from VAT service
// Example:
// * Email address "john.doe@contoso.com" is valid for company "Consoso Italy LLC"
// * Email address "tim.big@acme.it" is valid for company "Acme Limited"
// * Email address "fake.user@gmail.com" is NOT valid for company "Company Ab"
// * Email address "jim.carey@teliasonera.se" is valid for company "Telia Sonera Ab"
// * Email address "jim.carey@acme.it" is valid for company "Acme Italy Limited LLC"
function simplifyCompanyName(name) {
  return name.toLowerCase().replace(/(inc|llc|ltd|gmbh|ab|oy|oyj|limited|\s|\.)/g, '');
}
function getEmailDomain(email) {
  let domain = email.split('@')[1].split('.')[0];
  return domain.toLowerCase();
}
function compareCompanyAndEmail(companyName, email) {
  let simplifiedCompanyName = simplifyCompanyName(companyName);
  let emailDomain = getEmailDomain(email);
  console.log("Comparing company: '" + simplifiedCompanyName + "' to Email domain: '" + emailDomain + "'");
  return simplifiedCompanyName.includes(emailDomain) || emailDomain.includes(simplifiedCompanyName);
}


export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const paramEmail = searchParams.get('email');
    const paramProductId = searchParams.get('productid');
    const paramCount = searchParams.get('count');
    const paramDiscountCode = searchParams.get('discountcode');
    const paramVATcountry = searchParams.get('vatcountry');
    const paramVATcode = searchParams.get('vatcode');
    const headersObject = Object.fromEntries(request.headers);
    const requestHeaders = JSON.stringify(headersObject, null, 2);
    const parsedHeaders = JSON.parse(requestHeaders);
    const cfIpCountry = parsedHeaders["cf-ipcountry"];

    const productDetails = getProductDetails(paramProductId, env.PRODUCTS);
    if (productDetails == null) {
      return new Response("", {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": env.ALLOW_ORIGIN
        }
      });
    }

    // Check VAT code if provided
    var vResponseJson;
    if (paramVATcountry && paramVATcode) {
      var vInit = {
        method: "GET",
        headers: {
          "Accept": "application/json",
        }
      };
      const vatUrl = "https://ec.europa.eu/taxation_customs/vies/rest-api/ms/" + paramVATcountry + "/vat/" + paramVATcode;
      const vResponse = await fetch(vatUrl, vInit);
      vResponseJson = await vResponse.json();
      if (env.DEBUG_VAT) {
        console.log("VAT URL: " + vatUrl);
        console.log(JSON.stringify(vResponseJson, null,  undefined));
      }
      if (vResponseJson.isValid != true) {
        return new Response("Invalid VAT code", {
          status: 200,
          headers: {
            "Content-Type": "text/plain",
            "Access-Control-Allow-Origin": env.ALLOW_ORIGIN
          }
        });
      }
      if (compareCompanyAndEmail(vResponseJson.name, paramEmail) != true) {
        return new Response("Invalid email address", {
          status: 200,
          headers: {
            "Content-Type": "text/plain",
            "Access-Control-Allow-Origin": env.ALLOW_ORIGIN
          }
        });
      }
    }

    const xeroHeaders = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization":"Bearer " + env.API_KEY,
      "xero-tenant-id": env.TENANT_ID,
    };

    // Create contact if does not exist
    var vatNumber;
    var cCountry = "";
    var cAddresses = [];
    var accountName = paramEmail;
    var acccountNumber = "WebStore|Private|" + paramEmail;
    var countries = require("i18n-iso-countries");
    var taxType = "Sales - Non EU/no VAT Number";
    countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
    if (paramVATcountry && paramVATcode) {
      if (paramVATcountry == "MT") {
        taxType = "Sales - Local";
      } else {
        taxType = "Sales - EU";
      }
      vatNumber = paramVATcountry + paramVATcode;
      accountName = vResponseJson.name;
      acccountNumber = "WebStore|Business|" + vatNumber;
      cCountry = countries.getName(paramVATcountry, "en", {select: "official"});
      cAddresses = [
        {
          "AddressType": "POBOX",
          "Country": cCountry,
        }
      ];
    } else {
      if (cfIpCountry) {
        cCountry = countries.getName(paramVATcountry, "en", {select: "official"});
        cAddresses = [
          {
            "AddressType": "POBOX",
            "Country": cCountry,
          }
        ];
      }
    }
    var body = {
      "Contacts": [
        {
          "Name": accountName,
          "AccountNumber": acccountNumber,
          "EmailAddress": paramEmail,
          "IsSupplier": false,
          "IsCustomer": true,
          "ContactStatus": "ACTIVE",
          "DefaultCurrency": "EUR",
          "Addresses":cAddresses,
          "TaxNumber": vatNumber,
          "AccountsReceivableTaxType": taxType,
        }
      ]
    };
    var init = {
      body: JSON.stringify(body),
      method: "POST",
      headers: xeroHeaders,
    };
    const cResponse = await fetch("https://api.xero.com/api.xro/2.0/Contacts", init);
    const cReponseJson = await cResponse.json();
    if (env.DEBUG_CONTACT) {
      console.log(JSON.stringify(init.body, null, undefined))
      console.log(JSON.stringify(cReponseJson, null, undefined))
    }

    // TODO: Can we run this on background to safe a little bit time?
    // Add contact to contact group
    body = {
      "Contacts": [
        {
          "ContactID": cReponseJson.Contacts[0].ContactID,
        }
      ]
    };
    init = {
      body: JSON.stringify(body),
      method: "PUT",
      headers: xeroHeaders,
    };
    const cgResponse = await fetch("https://api.xero.com/api.xro/2.0/ContactGroups/" + env.CONTACT_GROUP_ID + "/Contacts", init);
    await cgResponse.json();

    // TODO: Only call this is Country have not been already added
    // Create tracking value
    /*
    if (cfIpCountry != "unknown") {
      try {
        body = {
          "Name": cfIpCountry,
        };
        init = {
          body: JSON.stringify(body),
          method: "PUT",
          headers: xeroHeaders,
        };
        const tResponse = await fetch("https://api.xero.com/api.xro/2.0/TrackingCategories/685fb22e-3919-460d-a7d1-a23194f7e035/Options", init);
        await tResponse.json();
      } catch {}
    }
    */
    
    // Create invoice
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 90);
    const todayDateAsString = today.toISOString().split('T')[0];
    const dueDateAsString = dueDate.toISOString().split('T')[0];

    var discountRate = 0;
    if (paramDiscountCode == productDetails.discountCode) {
      discountRate = 50;
    }
  
    body = {
      "Invoices": [
        {
          "BrandingThemeID": env.BRANDING_THEME_ID,
          "Type": "ACCREC",
          "Contact": {
            "ContactID": cReponseJson.Contacts[0].ContactID,
          },
          "LineItems": [
            {
              "ItemCode": paramProductId,
              "Description": productDetails.description,
              "Quantity": paramCount || 1,
              "UnitAmount": 20,
              "DiscountRate": discountRate,
            }
          ],
          "Date": todayDateAsString,
          "DueDate": dueDateAsString,
          "Reference": "Website Design",
          "SentToContact": true,
          "Status": "AUTHORISED",
        }
      ]
    };
    /*
              "Tracking": [
                {
                  "Name": "Country",
                  "Option": cfIpCountry,
                }
              ],
    */
    init = {
      body: JSON.stringify(body),
      method: "PUT",
      headers: xeroHeaders,
    };
    const iResponse = await fetch("https://api.xero.com/api.xro/2.0/Invoices", init);
    const iResponseJson = await iResponse.json();
    if (env.DEBUG_INVOICE) {
      console.log(JSON.stringify(init.body, null,  undefined))
      console.log(JSON.stringify(iResponseJson, null,  undefined))
    }

    // Get online invoice link
    init = {
      method: "GET",
      headers: xeroHeaders,
    };
    const ioResponse = await fetch("https://api.xero.com/api.xro/2.0/Invoices/" + iResponseJson.Invoices[0].InvoiceID +  "/OnlineInvoice", init);
    const ioResponseJson = await ioResponse.json();
    return new Response(ioResponseJson.OnlineInvoices[0].OnlineInvoiceUrl, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": env.ALLOW_ORIGIN
      }
    });
  },
};
