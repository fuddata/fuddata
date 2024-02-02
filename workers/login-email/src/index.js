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
    const paramEmail = searchParams.get('email');
    const cfIpCountry = request.headers.get("CF-IPCountry") || "unknown";
    const cfConnectingIP = request.headers.get("CF-Connecting-IP") || "unknown";
    const userAgent = request.headers.get("User-Agent") || "unknown";
    if (paramEmail === undefined) {
      return new Response('', {status: 400});
    }
    var device = userAgent;
    if (userAgent != "unknown") {
      device = getDevice(userAgent);
    }
    var browser = userAgent;
    if (userAgent != "unknown") {
      browser = getBrowser(userAgent);
    }

    console.log("Country: " + cfIpCountry);
    console.log("User agent: " + userAgent);
    console.log("CF-Connecting-IP: " + cfConnectingIP);
    console.log("Device: " + device);
    console.log("Browser: " + browser);

    // FixMe: Add logic to set correct value to this
    const link = "https://api.fuddata.com/login/a235rfsd";

    // return new Response('""', {status: 200});

    if (userAgent.includes("bot")) {
      return new Response("Block User Agent containing bot", { status: 403 });
    }

    const now = new Date();
    var body = {
      "personalizations": [
        {
          "to": [
            {
              "email": paramEmail,
            }
          ]
        }
      ],
      "from": {
        "email": env.EMAIL_FROM_ADDRESS,
        "name": env.EMAIL_FROM_NAME,
      },
      "dynamic_template_data": {
        "when": now.toString(),
        "where": cfIpCountry,
        "device": device,
        "browser": browser,
        "ip": cfConnectingIP,
        "link": link,
        "company": env.COMPANY,
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
    const statusCode = 301;
    return Response.redirect(destinationURL, statusCode);
  },
};
