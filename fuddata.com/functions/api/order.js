// Handle license orders
import { getCors, jResp, sha256 } from "../common.js";

export async function onRequest(context) {
  const request = context.request;
  const env = context.env;
  let cors = getCors(context);
  if (request.method != 'POST') {
    return jResp(cors, 1, 'Unsupported method');
  }

  var reqBody = "";
  try {
    reqBody = await request.json();
  } catch {
    return jResp(cors, 1, 'Cannot parse request');
  }
  if (reqBody.type != 2 && reqBody.type != 3 && reqBody.type != 4) {
    return jResp(cors, 1, 'Invalid request');
  }

  const cfIpCountry = request.headers.get("CF-IPCountry");
  const cfIPCity = request.headers.get("CF-IPCity");
  const cfTimezone = request.headers.get("CF-Timezone");
  const kvName = "LICENSE-" + reqBody.app.toUpperCase().replace(/ /g, "");

  try {
    var { value, metadata } = await env[kvName].getWithMetadata(reqBody.clientid);
    if (value === null) {
      return jResp(cors, 1, 'Invalid client');
    }
    if (value == 22 || value == 32 || value == 42) {
      return jResp(cors, 2, 'Already ordered');
    }
    if (value == 23 || value == 33 || value == 43) {
      return jResp(cors, 3, 'Already licensed');
    }
    if (value != 21 && value != 31 && value != 41) {
      return jResp(cors, 1, 'Invalid client');
    }
    const today = new Date();
    const todayDateAsString = today.toISOString().split('T')[0];
    const emailHash = await sha256(reqBody.email);
    await env[kvName].put(reqBody.clientid, reqBody.type + "2", {
      metadata: {
        countryCode: cfIpCountry || metadata.countryCode,
        city: cfIPCity || metadata.city,
        timezone: cfTimezone || metadata.timezone,
        firstStart: metadata.firstStart,
        activated: todayDateAsString,
        emailHash: emailHash,
      },
    });

    var body = {
      "template_id": "d-970bf07cd39f4366b2fe1629508a55cb",
      "personalizations": [
        {
          "to": [
            {
              "email": env.EMAIL_TO_ORDER,
            }
          ],
          "dynamic_template_data": {
            "app": reqBody.app,
            "type": reqBody.type,
            "clientid": reqBody.clientid,
            "country": reqBody.country,
            "company": reqBody.company,
            "reference": reqBody.reference,
            "email": reqBody.email,
            "message": reqBody.message,
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

    if (reqBody.joinMaillist) {
      await env.MAILLIST.put(emailHash, reqBody.email, {
        metadata: {
            country: cfIpCountry || metadata.countryCode,
            city: cfIPCity || metadata.city,
            timezone: cfTimezone || metadata.timezone,
            timestamp: new Date().getTime(),
            source: reqBody.app + " Order",
        },
      });
    }

    return jResp(cors, 0, 'Order was successful');
  }
  catch (e) {
    return jResp(cors, 1, e.message);
  }
};
