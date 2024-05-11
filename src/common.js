export function jResp(cors, status, message) {
  return Response.json(
    {
      status: status,
      message: message,
    },
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": cors,
        "Cache-Control": "no-store",
        "Content-Security-Policy": "frame-ancestors 'none'",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      }
    }
  );
}

export async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function validateSession(context) {
  const request = context.request;
  const env = context.env;

  if (request.method != "POST") {
    return false;
  }

  const authToken = request.headers.get("Authorization");
  if (authToken == null) {
    return false;
  }
  var { value, metadata } = await env.SESSIONS.getWithMetadata(authToken);
  if (value == null) {
    return false;
  }

  // CF-Connecting-IP header does not exist on local development
  const cfConnectingIP = request.headers.get("CF-Connecting-IP");
  if (cfConnectingIP != null) {
    const ipHash = await sha256(cfConnectingIP);
    if (ipHash != metadata.ipHash) {
      return false;
    }
  }

  return true;
}
