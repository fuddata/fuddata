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

    try {
      var { value, metadata } = await env.KV_HELLO.getWithMetadata(reqBody.guid);
      if (value === null) {
        switch(reqBody.type) {
          case 1:
            value = 11;
            break;
          case 2:
            value = 21;
            break;
          case 3:
            value = 31;
            break;
          default:
            return cResponse('{"status":0,"message":"Unsupported type defined"}', 200);
        }
        const today = new Date();
        const todayDateAsString = today.toISOString().split('T')[0];
        await env.KV_HELLO.put(reqBody.guid, value, {
          metadata: {
            countryCode: cfIpCountry || "",
            firstStart: todayDateAsString,
          },
        });
        return cResponse('{"status":11,"message":"' + todayDateAsString + '"}', 200);    
      }
      // FixMe: Add 12, 22 and 32 handling to here
      if (value == 13 || value == 23 || value == 33) {
        const license = await writeLicense(reqBody.guid, env.PRIVATE_KEY);
        return cResponse('{"status":' + value + ',"message":"'+ license + '"}', 200);
      }
      return cResponse('{"status":' + value + ',"message":"' + metadata.firstStart + '"}', 200);
    }
    catch (e)
    {
      return cResponse('{"status":0,"message":"' + e.message + '"}', 200);
    }
  },
};
