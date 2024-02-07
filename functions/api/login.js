function jResp(status, message) {
  return Response.json(
    {
      status: status,
      message: message,
    },
    {
      status: 200,
      headers: {
        "Content-Security-Policy": "default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none';",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
        "Permissions-Policy": "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Resource-Policy": "same-origin",
      }
    }
  );
}

// Generate unique session ID which is also used as OTP
async function newSessionId(env) {
  let sessionId = "";
  let isUnique = false;
  while (!isUnique) {
		for (let i = 0; i < 12; i++) {
			let randomNumber = Math.floor(Math.random() * 10);
			sessionId += randomNumber.toString();
		}
    try {
      const existingSession = await env.SESSIONS.get(sessionId);
      if (!existingSession) {
        isUnique = true;
      }
    }
    catch (e)
    {
      isUnique = true;
    }
  }
  return sessionId;
}
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message); 
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');  
  return hashHex;
}

export async function onRequest(context) {
  const request = context.request;
  const env = context.env;
  const { searchParams } = new URL(request.url);
  const paramAction = searchParams.get('action');
  const paramEmail = searchParams.get('email');
  const paramToken = searchParams.get('token');
  if (paramAction != "create" && paramAction != "validate") {
    return jResp(1,'Action "' + paramAction + '" is not supported');
  }
  if (paramAction == "create" && paramEmail == null) {
    return jResp(1,'Action "create" requires parameter "email"');
  }
  if (paramAction == "validate" && (paramEmail == null || paramToken == null)) {
    return jResp(1,'Action "validate" requires parameters "email" and "token"');
  }


  // Validate Turnstile token if API KEY is defined
  const cfConnectingIP = request.headers.get("CF-Connecting-IP") || "Unknown";
  const paramTurnstile = searchParams.get('turnstile')
  if (env.TURNSTILE_API_KEY != null) {
    if (paramTurnstile == null) {
      return jResp(1,'Turnstile token required');
    }
    let formData = new FormData();
    formData.append('secret', env.TURNSTILE_API_KEY);
    formData.append('response', paramTurnstile);
    formData.append('remoteip', cfConnectingIP);
    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const result = await fetch(url, {
      body: formData,
      method: 'POST',
    });
    const outcome = await result.json();
    if (!outcome.success) {
      return jResp(1,'Invalid Turnstile token');
    }
  }


  // Handle session validation
  // Session ID, email address hash and client IP address needs to match.
  // Extend session validation period to two hours when called first time.
  const ipHash = await sha256(cfConnectingIP);
  const emailHash = await sha256(paramEmail);
  if (paramAction == "validate") {
    var { value, metadata } = await env.SESSIONS.getWithMetadata(paramToken);
    if (value == null) {
      return jResp(1,'Session ID "' + paramToken + '" is invalid');
    }
    if (emailHash == value) {
      if (ipHash != metadata.ipHash) {
        return jResp(1,'Session is not valid for IP address: "' + cfConnectingIP + '"');
      }
      if (metadata.loggedIn == false) {
        await env.SESSIONS.put(paramToken, emailHash, {
          metadata: {
            ipHash: ipHash,
            expirationTtl: 7200,
            loggedIn: true,
          },
        });
      }
      return jResp(0,'valid');
    }
    return jResp(1,'Hash "' + paramEmail + '" is invalid');
  }


  // Handle session creation
  const sessionId = await newSessionId(env);
  let serverToken = sessionId.substring(0, 6);
  let userToken = sessionId.substring(6, 12);
  try {
    await env.SESSIONS.put(sessionId, emailHash, {
      metadata: {
        ipHash: ipHash,
        expirationTtl: 330,
        loggedIn: false,
      },
    });
  }
  catch (e)
  {
    return jResp(1,e);
  }


  // Handle email sending for user
  var body = {
    "template_id": env.EMAIL_TEMPLATE_ID,
    "personalizations": [
      {
        "to": [
          {
            "email": paramEmail,
          }
        ],
        "dynamic_template_data": {
          "otp": userToken,
        }
      }
    ],
    "from": {
      "email": env.EMAIL_FROM_ADDRESS,
      "name": env.EMAIL_FROM_NAME,
    }
  };
  var init = {
    body: JSON.stringify(body),
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization":"Bearer " + env.SENDGRID_API_KEY,
    },
  };
  await fetch("https://api.sendgrid.com/v3/mail/send", init);
  return jResp(0,serverToken);

};
