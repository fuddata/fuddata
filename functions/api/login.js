import { jResp, sha256 } from "../../src/common.js";

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

export async function onRequest(context) {
  const request = context.request;
  const env = context.env;
  let cors = env.CORS;
  const { searchParams } = new URL(request.url);
  const paramAction = searchParams.get('action');
  const paramEmail = searchParams.get('email');
  const paramToken = searchParams.get('token');
  if (paramAction != "create" && paramAction != "validate") {
    return jResp(cors,1,'Action "' + paramAction + '" is not supported');
  }
  if (paramAction == "create" && paramEmail == null) {
    return jResp(cors,1,'Action "create" requires parameter "email"');
  }
  if (paramAction == "validate" && (paramEmail == null || paramToken == null)) {
    return jResp(cors,1,'Action "validate" requires parameters "email" and "token"');
  }


  // Validate Turnstile token if API KEY is defined
  const cfConnectingIP = request.headers.get("CF-Connecting-IP") || "Unknown";
  const paramTurnstile = searchParams.get('turnstile')
  if (paramAction == "create" && env.TURNSTILE_API_KEY != null) {
    if (paramTurnstile == null) {
      return jResp(cors,1,'Turnstile token required');
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
      return jResp(cors,1,'Invalid Turnstile token');
    }
  }


  // Handle session validation
  // Session ID, email address hash and client IP address needs to match.
  // Extend session validation period to two hours when called first time.
  const ipHash = await sha256(cfConnectingIP);
  const emailHash = await sha256(paramEmail);
  const cfIPCountry = request.headers.get("CF-IPCountry");
  if (paramAction == "validate") {
    var { value, metadata } = await env.SESSIONS.getWithMetadata(paramToken);
    if (value == null) {
      return jResp(cors,1,'Session ID "' + paramToken + '" is invalid');
    }
    if (emailHash == value) {
      if (ipHash != metadata.ipHash) {
        return jResp(cors,1,'Session is not valid for IP address: "' + cfConnectingIP + '"');
      }
      if (metadata.loggedIn == false) {
        await env.SESSIONS.put(paramToken, emailHash, {
          metadata: {
            ipHash: ipHash,
            country: cfIPCountry,
            expirationTtl: 7200,
            loggedIn: true,
          },
        });
      }
      return jResp(cors,0,'valid');
    }
    return jResp(cors,1,'Hash "' + paramEmail + '" is invalid');
  }


  // Handle session creation
  const sessionId = await newSessionId(env);
  let serverToken = sessionId.substring(0, 6);
  let userToken = sessionId.substring(6, 12);
  try {
    await env.SESSIONS.put(sessionId, emailHash, {
      metadata: {
        ipHash: ipHash,
        country: cfIPCountry,
        expirationTtl: 330,
        loggedIn: false,
      },
    });
  }
  catch (e)
  {
    return jResp(cors,1,e);
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
  return jResp(cors,0,serverToken);

};
