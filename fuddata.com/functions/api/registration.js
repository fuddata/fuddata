// Register free versions of our application
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
  if (reqBody.type != 13) {
    return jResp(cors, 1, 'Invalid request');
  }

  const cfIpCountry = request.headers.get("CF-IPCountry");
  const cfIPCity = request.headers.get("CF-IPCity");
  const cfTimezone = request.headers.get("CF-Timezone");
  const kvName = "LICENSE-" + reqBody.app.toUpperCase().replace(/ /g, "");

  try {
    var { value, metadata } = await env[kvName].getWithMetadata(reqBody.guid);
    if (value === null) {
      return jResp(cors, 1, 'Invalid client');
    }
    if (value == 13) {
      return jResp(cors, 3, 'Already registered');
    }
    if (value != 11) {
      return jResp(cors, 1, 'Invalid client');
    }
    const today = new Date();
    const todayDateAsString = today.toISOString().split('T')[0];
    const emailHash = await sha256(reqBody.email);
    await env[kvName].put(reqBody.guid, reqBody.type, {
      metadata: {
        countryCode: cfIpCountry || metadata.countryCode,
        city: cfIPCity || metadata.city,
        timezone: cfTimezone || metadata.timezone,
        firstStart: metadata.firstStart,
        activated: todayDateAsString,
        emailHash: emailHash,
      },
    });

    if (reqBody.joinMaillist) {
      await env.MAILLIST.put(emailHash, reqBody.email, {
        metadata: {
            country: cfIpCountry || metadata.countryCode,
            city: cfIPCity || metadata.city,
            timezone: cfTimezone || metadata.timezone,
            timestamp: new Date().getTime(),
            source: reqBody.app + " Registration",
        },
      });
    }

    return jResp(cors, 0, 'Registration was successful');
  }
  catch (e) {
    return jResp(cors, 1, e.message);
  }
};
