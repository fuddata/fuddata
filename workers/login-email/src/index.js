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
    const paramEmail = searchParams.get('email') || "Unknown";
    const cfIpCountry = request.headers.get("CF-IPCountry") || "Unknown";
    const cfConnectingIP = request.headers.get("CF-Connecting-IP") || "Unknown";
    const userAgent = request.headers.get("User-Agent") || "Unknown";
    if (paramEmail == "Unknown") {
      return new Response('', {status: 400});
    }
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

    /*
    console.log("Country: " + cfIpCountry);
    console.log("User agent: " + userAgent);
    console.log("CF-Connecting-IP: " + cfConnectingIP);
    console.log("Device: " + device);
    console.log("Browser: " + browser);
    console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)
    return new Response('', {status: 200});
    */

    // FixMe: Add logic to set correct value to this
    const link = "https://api.fuddata.com/login/a235rfsd";

    if (userAgent.includes("bot")) {
      return new Response("Block User Agent containing bot", { status: 403 });
    }

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
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", init);
    const results = await response.text();
    console.log("SendGrid response: " + results);

    const destinationURL = env.REDIRECT_URL;
    const statusCode = 301;
    return Response.redirect(destinationURL, statusCode);
  },
};
