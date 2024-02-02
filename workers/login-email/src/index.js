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
    return 'unknown';
  }
}

export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const paramEmail = searchParams.get('email');
    const cfIpCountry = request.headers.get("CF-IPCountry") || "unknown";
    const cfConnectingIP = request.headers.get("CF-Connecting-IP") || "unknown";
    const userAgent = request.headers.get("User-Agent") || "unknown";
    var uBrowser = userAgent;
    if (userAgent != "unknown") {
      uBrowser = getBrowser(userAgent);
    }
    console.log("Country: " + cfIpCountry);
    console.log("User agent: " + userAgent);
    console.log("CF-Connecting-IP: " + cfConnectingIP);
    console.log("Browser: " + uBrowser);

    return new Response('""', {status: 200});

    if (userAgent.includes("bot")) {
      return new Response("Block User Agent containing bot", { status: 403 });
    }

    var cCountry = "unknown";
    if (cfIpCountry) {
      cCountry = countries.getName(paramVATcountry, "en", {select: "official"});
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
        "where": cCountry,
        "browser": getBrowser(),
        "ip": ip,
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
