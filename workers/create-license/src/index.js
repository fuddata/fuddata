import { cResponse } from "../../shared.js"
import { writeLicense } from "./license.js"

export default {
  async fetch(request, env) {
    const contentType = request.headers.get("content-type");
    if (request.method != 'POST' || contentType != 'application/json') {
      return cResponse('', 405);
    }

    var reqBody = "";
    try {
      reqBody = await request.json();
    } catch {
      return cResponse('', 400);
    }

    const headersObject = Object.fromEntries(request.headers);
    const requestHeaders = JSON.stringify(headersObject, null, 2);
    const parsedHeaders = JSON.parse(requestHeaders);
    const cfIpCountry = parsedHeaders["cf-ipcountry"];

    console.log("Request type: " + reqBody.request);
    switch(reqBody.request) {
      case 11:
      case 21:
      case 31:
        const today = new Date();
        const todayDateAsString = today.toISOString().split('T')[0];
        await env.KV_HELLO.put(reqBody.guid, reqBody.request, {
          metadata: {
            countryCode: cfIpCountry || "unknown",
            firstStart: todayDateAsString,
          },
        });
        return cResponse('{"status":' + value + ',"firstStart":"' + todayDateAsString + '"}', 200);
      case 50:
        try {
          const { value, metadata } = await env.KV_HELLO.getWithMetadata(reqBody.guid);
          if (value === null) {
            return cResponse('Value not found', 404);
          }
          if (value == 13 || value == 23 || value == 33) {
            const license = await writeLicense(reqBody.guid, env.PRIVATE_KEY);
            return cResponse('{"status":' + value + ',"license":"'+ license + '"}', 200);
          }
          return cResponse('{"status":' + value + ',"firstStart":"' + metadata.firstStart + '"}', 200);
        }
        catch (e)
        {
          return cResponse(e.message, 500);
        }
      default:
        return cResponse('Request type not supported', 400);
    }
  },
};
