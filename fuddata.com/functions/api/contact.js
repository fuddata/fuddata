import { jResp, sha256, verifyTurnstile } from "../common.js";

export async function onRequest(context) {
    const request = context.request;
    const env = context.env;
    let cors = env.CORS;

    const contentType = request.headers.get("content-type");
    if (request.method != 'POST' || contentType != 'application/json') {
        return jResp(cors, 1, 'Unsupported method');
    }

    if (!await verifyTurnstile(context)) {
        return jResp(cors, 1, 'Turnstile verification failed');
    }

    const cfIpCountry = request.headers.get("CF-IPCountry");
    const cfIPCity = request.headers.get("CF-IPCity");
    const cfTimezone = request.headers.get("CF-Timezone");
    const reqBody = await request.json();
    const emailHash = await sha256(reqBody.email);

    var emailBody = {
        "template_id": "d-d6931aacfb2149ef8a11c4e8b6afccf0",
        "personalizations": [
          {
            "to": [
              {
                "email": env.EMAIL_TO_CONTACT,
              }
            ],
            "dynamic_template_data": {
              "message": atob(reqBody.message),
              "email": reqBody.email,
              "country": cfIpCountry,
              "city": cfIPCity,
              "timezone": cfTimezone,
            }
          }
        ],
        "from": {
          "email": env.EMAIL_FROM_ADDRESS,
          "name": env.EMAIL_FROM_NAME,
        }
    };
    var init = {
    body: JSON.stringify(emailBody),
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
                countryCode: cfIpCountry || metadata.countryCode,
                city: cfIPCity || metadata.city,
                timezone: cfTimezone || metadata.timezone,
                timestamp: new Date().getTime(),
                source: "ContactForm",
            },
        });
    }

    return jResp(cors, 0, 'Message sent');
}
