// This API is used to keep track of ongoing trial periods and provide license key for valid clients.

import { jResp } from "../common.js";

export async function onRequest(context) {
  const request = context.request;
  const env = context.env;
  let cors = env.CORS;
  const contentType = request.headers.get("content-type");
  if (request.method != 'POST' || contentType != 'application/json') {
    return jResp(cors, 1, 'Unsupported method');
  }

  var reqBody = "";
  try {
    reqBody = await request.json();
  } catch {
    return jResp(cors, 1, 'Cannot parse request');
  }

  const now = new Date().getTime();
  const cfIpCountry = request.headers.get("CF-IPCountry");
  const cfIPCity = request.headers.get("CF-IPCity");
  const cfTimezone = request.headers.get("CF-Timezone");
  const kvName = "LICENSE-" + reqBody.app.toUpperCase().replace(/ /g, "");

  try {
    var { value, metadata } = await env[kvName].getWithMetadata(reqBody.guid);
    if (value === null) {
      switch (reqBody.type) {
        case 1:
          value = 11;
          break;
        case 2:
          value = 21;
          break;
        case 3:
          value = 31;
          break;
        case 4:
          value = 41;
          break;
        default:
          return jResp(cors, 1, 'Unsupported type defined');
      }
      const today = new Date();
      const todayDateAsString = today.toISOString().split('T')[0];
      await env[kvName].put(reqBody.guid, value, {
        metadata: {
          countryCode: cfIpCountry || "",
          city: cfIPCity || "",
          timezone: cfTimezone,
          firstStart: todayDateAsString,
          timestamp: now,
        },
      });
      return jResp(cors, value, todayDateAsString);
    }
    if (value == 13 || value == 23 || value == 33 || value == 43) {
      const license = await writeLicense(reqBody.guid, env.LICENSE_PRIVATE_KEY);
      return jResp(cors, Number(value), license);
    }
    return jResp(cors, Number(value), metadata.firstStart);
  }
  catch (e) {
    return jResp(cors, 1, e.message);
  }
};

export async function writeLicense(data, base64PrivKey) {
  try {
    // Extract the base64 encoded key body from the PEM format
    const pemKey = atob(base64PrivKey);
    const keyBody = pemKey.match(/-----BEGIN EC PRIVATE KEY-----\s*([\s\S]+?)\s*-----END EC PRIVATE KEY-----/)[1];
    const privKeyBytes = Uint8Array.from(atob(keyBody), c => c.charCodeAt(0));

    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      privKeyBytes.buffer,
      {
        name: 'ECDSA',
        namedCurve: 'P-256'
      },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      {
        name: 'ECDSA',
        hash: { name: 'SHA-256' },
      },
      privateKey,
      new TextEncoder().encode(data)
    );

    // Convert the signature from raw format to ASN.1 DER format
    const signatureArray = new Uint8Array(signature);
    const r = signatureArray.slice(0, signatureArray.length / 2);
    const s = signatureArray.slice(signatureArray.length / 2);
    const derSig = encodeDER(r, s);

    return arrayBufferToBase64(derSig);
  } catch (err) {
    console.error("Error:", err);
    return '';
  }
}

function encodeDER(r, s) {
  // Ensure each integer has a leading zero if its first byte is >= 128
  r = addLeadingZeroIfNeeded(r);
  s = addLeadingZeroIfNeeded(s);

  // DER sequence
  const derSequence = [0x30, r.length + s.length + 4, 0x02, r.length, ...r, 0x02, s.length, ...s];
  return new Uint8Array(derSequence);
}

function addLeadingZeroIfNeeded(value) {
  if (value[0] >= 128) {
    return [0, ...value];
  }
  return value;
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
