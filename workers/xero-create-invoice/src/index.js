function parseProducts(env) {
  const productMap = {};

  // Iterate through each key in the environment variables
  for (const key in env) {
      // Check if the key ends with 'Id'
      if (key.endsWith('Id')) {
          // Extract the product name prefix (e.g., 'hello' from 'helloId')
          const prefix = key.slice(0, -2);

          // Find the corresponding price and description keys
          const priceKey = prefix + 'Price';
          const descKey = prefix + 'Desc';

          // Map the product ID to its price and description
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

// Function to get product details by ID
function getProductDetails(productId, env) {
  const products = parseProducts(env);
  return products[productId] || null;
}

export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url)
    const paramEmail = searchParams.get('email')
    let paramProductId = searchParams.get('productid')
    let paramCount = searchParams.get('count')

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
    var response = await fetch("https://api.xero.com/api.xro/2.0/Contacts", init);
    var jsonResponse = await response.json();

    // TODO: Can we run this on background to safe a little bit time?
    // Add contact to contact group
    body = {
      "Contacts": [
        {
          "ContactID": jsonResponse.Contacts[0].ContactID,
        }
      ]
    };
    init = {
      body: JSON.stringify(body),
      method: "PUT",
      headers: xeroHeaders,
    };
    response = await fetch("https://api.xero.com/api.xro/2.0/ContactGroups/" + env.XERO_CONTACT_GROUP_ID + "/Contacts", init);
    await response.json();

    // Create invoice
    body = {
      "Invoices": [
        {
          "Type": "ACCREC",
          "Contact": {
            "ContactID": jsonResponse.Contacts[0].ContactID,
          },
          "LineItems": [
            {
              "Description": "Acme Tires",
              "Quantity": 2,
              "UnitAmount": 20,
              "AccountCode": "200",
              "TaxType": "NONE",
              "LineAmount": 40,
            }
          ],
          "Date": "2019-03-11",
          "DueDate": "2018-12-10",
          "Reference": "Website Design",
          "Status": "AUTHORISED",
        }
      ]
    };
    init = {
      body: JSON.stringify(body),
      method: "PUT",
      headers: xeroHeaders,
    };
    response = await fetch("https://api.xero.com/api.xro/2.0/Invoices", init);
    jsonResponse = await response.json();

    // Get online invoice link
    init = {
      method: "GET",
      headers: xeroHeaders,
    };
    response = await fetch("https://api.xero.com/api.xro/2.0/Invoices/" + jsonResponse.Invoices[0].InvoiceID +  "/OnlineInvoice", init);
    jsonResponse = await response.json();


    return new Response(jsonResponse.OnlineInvoices[0].OnlineInvoiceUrl, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": env.ALLOW_ORIGIN
      }
    });
  },
};
