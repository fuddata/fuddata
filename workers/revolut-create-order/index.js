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
    let paramProductId = searchParams.get('productid')
    const paramEmail = searchParams.get('email')

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

    const url = env.API_URL;
    const body = {
      amount: productDetails.price,
      currency: "EUR",
      description: productDetails.description,
      customer: {
        email: paramEmail,
      },
    };

    const init = {
      body: JSON.stringify(body),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Revolut-Api-Version": "2023-09-01",
        "Authorization":"Bearer " + env.API_KEY
      },
    };

    const response = await fetch(url, init);
    const jsonResponse = await response.json();
    const token = jsonResponse.token;

    return new Response(token, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": env.ALLOW_ORIGIN
      }
    });
  },
};
