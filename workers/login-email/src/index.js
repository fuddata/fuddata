import { customAlphabet } from 'nanoid'

async function newSessionId(env) {
  const nanoid = customAlphabet('012345678789abcdefghijklmnopqrstuvwxyz', 20);
  let sessionId;
  let isUnique = false;

  while (!isUnique) {
    sessionId = nanoid();
    try {
      const existingSession = await env.KV_SESSIONS.get(sessionId);
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

function getDevice(userAgent) {
  if (userAgent.includes("Windows Phone")) {
    return 'Windows Phone';
  } else if (userAgent.includes("Windows")) {
    return 'Windows';
  } else if (userAgent.includes("Android")) {
    return 'Android';
  } else if (userAgent.includes("iPhone")) {
    return 'iPhone';
  } else if (userAgent.includes("iPad")) {
    return 'iPad';
  } else if (userAgent.includes("CrOS")) {
    return 'Chromebook';
  } else if (userAgent.includes("Macintosh")) {
    return 'Mac';
  } else if (userAgent.includes("Linux")) {
    return 'Linux';
  } else {
    return 'Unknown';
  }
}

function getBrowser(userAgent) {
  if (userAgent.includes("Opera") || userAgent.includes('OPR')) {
    return 'Opera';
  } else if (userAgent.includes("Edg")) {
    return 'Edge';
  } else if (userAgent.includes("Chrome")) {
    return 'Chrome';
  } else if (userAgent.includes("Safari")) {
    return 'Safari';
  } else if (userAgent.includes("Firefox")) {
    return 'Firefox';
  } else {
    return 'Unknown';
  }
}

export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const paramAction = searchParams.get('action');
    const paramEmail = searchParams.get('email');
    const paramHash = searchParams.get('hash');
    const paramSession = searchParams.get('session');
    if (paramAction != "create" && paramAction != "validate") {
      return new Response('Action "' + paramAction + '" is not supported', {status: 400, headers: {"Content-Type": "text/plain","Access-Control-Allow-Origin": env.ALLOW_ORIGIN}});
    }
    if (paramAction == "create" && paramEmail == null) {
      return new Response('Action "create" requires parameter "email"', {status: 400, headers: {"Content-Type": "text/plain","Access-Control-Allow-Origin": env.ALLOW_ORIGIN}});
    }
    if (paramAction == "validate" && (paramHash == null || paramSession == null)) {
      return new Response('Action "validate" requires parameters "hash" and "session"', {status: 400, headers: {"Content-Type": "text/plain","Access-Control-Allow-Origin": env.ALLOW_ORIGIN}});
    }


    // Handle session validation
    // Session ID, email address hash and client IP address needs to match.
    // Extend session validation period to two hours when called first time.
    const cfConnectingIP = request.headers.get("CF-Connecting-IP") || "Unknown";
    const ipHash = await sha256(cfConnectingIP);
    if (paramAction == "validate") {
      console.log("Validating session ID: " + paramSession);
      var { value, metadata } = await env.KV_SESSIONS.getWithMetadata(paramSession);
      if (value == null) {
        return new Response('Session ID "' + paramSession + '" is invalid', {status: 400, headers: {"Content-Type": "text/plain","Access-Control-Allow-Origin": env.ALLOW_ORIGIN}});
      }
      if (paramHash == value) {
        if (ipHash != metadata.ipHash) {
          return new Response('Session is not valid for IP address: "' + cfConnectingIP + '"', {status: 400, headers: {"Content-Type": "text/plain","Access-Control-Allow-Origin": env.ALLOW_ORIGIN}});
        }
        if (metadata.loggedIn == false) {
          await env.KV_SESSIONS.put(paramSession, paramHash, {
            metadata: {
              ipHash: ipHash,
              expirationTtl: 7200,
              loggedIn: true,
            },
          });
        }
        return new Response(true, {status: 200, headers: {"Content-Type": "text/plain","Access-Control-Allow-Origin": env.ALLOW_ORIGIN}});
      }
      return new Response('Hash "' + paramHash + '" is invalid', {status: 400, headers: {"Content-Type": "text/plain","Access-Control-Allow-Origin": env.ALLOW_ORIGIN}});
    }


    // Handle session creation
    // Store only SHA256 sum of user email address and IP so those
    // are not considered as GDPR personal data.
    // Make session valid 10 min 30 sec because we say for user that link
    // is valid 10 minutes and there is small delays on email delivery
    const sessionId = await newSessionId(env);
    const emailHash = await sha256(paramEmail);
    console.log("emailHash: " + emailHash);
    console.log("sessionId: " + sessionId);
    console.log("ipHash: " + ipHash);
    await env.KV_SESSIONS.put(sessionId, emailHash, {
      metadata: {
        ipHash: ipHash,
        expirationTtl: 630,
        loggedIn: false,
      },
    });


    // Handle email sending for user
    const link = env.EMAIL_BASE_URL + "?h=" + emailHash + "&s=" + sessionId;
    const cfIpCountry = request.headers.get("CF-IPCountry") || "Unknown";
    const userAgent = request.headers.get("User-Agent") || "Unknown";
    var device = userAgent;
    if (userAgent != "Unknown") {
      device = getDevice(userAgent);
    }
    var browser = userAgent;
    if (userAgent != "Unknown") {
      browser = getBrowser(userAgent);
    }
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short'
    });
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
            "when": formatter.format(now),
            "where": cfIpCountry,
            "device": device,
            "browser": browser,
            "ip": cfConnectingIP,
            "link": link,
            "company": env.COMPANY,
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
        "Authorization":"Bearer " + env.API_KEY,
      },
    };
    await fetch("https://api.sendgrid.com/v3/mail/send", init);
    const destinationURL = env.REDIRECT_URL;
    // const statusCode = 301;
    // return Response.redirect(destinationURL, statusCode);
    /*
    return new Response('',
      {
        status: 301,
        headers: {
          "Location": destinationURL,
          "Access-Control-Allow-Origin": env.ALLOW_ORIGIN
        }
      }
    );
    */
    return new Response('',
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": env.ALLOW_ORIGIN
        }
      }
    );
  },
};
