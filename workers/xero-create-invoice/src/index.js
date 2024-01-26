// Generate product id => details map from environment variable like:
// helloId="26384",helloPrice=1000,helloDesc="Hello World"
function parseProducts(env) {
  const productMap = {};
  for (const key in env) {
      if (key.endsWith('Id')) {
          const prefix = key.slice(0, -2);
          const priceKey = prefix + 'Price';
          const descKey = prefix + 'Desc';
          if (env[priceKey] !== undefined && env[descKey] !== undefined) {
              productMap[env[key]] = {
                  price: env[priceKey],
                  description: env[descKey]
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

export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url)
    const paramEmail = searchParams.get('email')
    const paramProductId = searchParams.get('productid')
    const paramCount = searchParams.get('count')
    const headersObject = Object.fromEntries(request.headers);
    const requestHeaders = JSON.stringify(headersObject, null, 2);
    const parsedHeaders = JSON.parse(requestHeaders);
    const cfIpCountry = parsedHeaders["cf-ipcountry"] || "unknown";

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

    const xeroHeaders = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization":"Bearer " + env.API_KEY,
      "xero-tenant-id": env.XERO_TENANT_ID,
    };

    // Create contact if does not exist
    var body = {
      "Contacts": [
        {
          "Name": "WebStore|Private|" + paramEmail,
          "EmailAddress": paramEmail,
          "IsSupplier": false,
          "IsCustomer": true,
          "ContactStatus": "ACTIVE",
        }
      ]
    };
    var init = {
      body: JSON.stringify(body),
      method: "POST",
      headers: xeroHeaders,
    };
    const cReponse = await fetch("https://api.xero.com/api.xro/2.0/Contacts", init);
    const cReponseJson = await cReponse.json();
    if (env.DEBUG_CONTACT) {
      console.log(JSON.stringify(init.body, null,  undefined))
      console.log(JSON.stringify(cReponseJson, null,  undefined))
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
    const cgReponse = await fetch("https://api.xero.com/api.xro/2.0/ContactGroups/" + env.XERO_CONTACT_GROUP_ID + "/Contacts", init);
    await cgReponse.json();

    // TODO: Only call this is Country have not been already added
    // Create tracking value
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

    // Create invoice
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 90);
    const todayDateAsString = today.toISOString().split('T')[0];
    const dueDateAsString = dueDate.toISOString().split('T')[0];
    body = {
      "Invoices": [
        {
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
              "Tracking": [
                {
                  "Name": "Country",
                  "Option": cfIpCountry,
                }
              ],
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
