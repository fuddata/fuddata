import { jResp, sha256, validateSession } from "../../src/common.js";

export async function onRequest(context) {
  const request = context.request;
  const env = context.env;
  let cors = env.CORS;
  const valid = await validateSession(context);
  if (!valid) {
    return jResp(cors,1,'Invalid session');
  }

  const cfIPCountry = request.headers.get("CF-IPCountry");
  const cfConnectingIP = request.headers.get("CF-Connecting-IP");
  const ipHash = await sha256(cfConnectingIP); 
  const body = await request.json();
  const emailHash = await sha256(body.email);
  await env.CONTACT.put(emailHash, body.message, {
    metadata: {
      replyTo: body.email,
      ipHash: ipHash,
      country: cfIPCountry,
      expirationTtl: 2592000,
    },
  });

  return jResp(cors,0,'Message sent');
}
