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
      reqBody = JSON.stringify(await request.json());
    } catch {
      return cResponse('', 400);
    }

    /*
    const key = "foo";
    const value = "test2";

    // Write
    await env.KV_HELLO.put(key, value, {
      metadata: { someMetadataKey: "someMetadataValue" },
    });

    // Read
    try {
      const { value, metadata } = await env.KV_HELLO.getWithMetadata(key);

      if (value === null) {
        return cResponse('Value not found', 404);
      }
      return cResponse(metadata.someMetadataKey, 200);
    }
    catch (e)
    {
      return cResponse(e.message, 500);
    }
    */

    const signature = await writeLicense(reqBody.guid, env.PRIVATE_KEY);
    return cResponse(signature, 200);
  },
};
