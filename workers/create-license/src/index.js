async function signData(data, base64PrivKey) {
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
        hash: {name: 'SHA-256'},
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

export default {
  async fetch(request, env) {
    // Copy & paste from: https://developers.cloudflare.com/workers/examples/security-headers/
    const DEFAULT_SECURITY_HEADERS = {
      /*
    Secure your application with Content-Security-Policy headers.
    Enabling these headers will permit content from a trusted domain and all its subdomains.
    @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
    "Content-Security-Policy": "default-src 'self' example.com *.example.com",
    */
      /*
    You can also set Strict-Transport-Security headers.
    These are not automatically set because your website might get added to Chrome's HSTS preload list.
    Here's the code if you want to apply it:
    "Strict-Transport-Security" : "max-age=63072000; includeSubDomains; preload",
    */
      /*
    Permissions-Policy header provides the ability to allow or deny the use of browser features, such as opting out of FLoC - which you can use below:
    "Permissions-Policy": "interest-cohort=()",
    */
      /*
    X-XSS-Protection header prevents a page from loading if an XSS attack is detected.
    @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection
    */
      "X-XSS-Protection": "0",
      /*
    X-Frame-Options header prevents click-jacking attacks.
    @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
    */
      "X-Frame-Options": "DENY",
      /*
    X-Content-Type-Options header prevents MIME-sniffing.
    @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
    */
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Cross-Origin-Embedder-Policy": 'require-corp; report-to="default";',
      "Cross-Origin-Opener-Policy": 'same-site; report-to="default";',
      "Cross-Origin-Resource-Policy": "same-site",
    };

    const contentType = request.headers.get("content-type");
    if (request.method != 'POST' || contentType != 'application/json') {
      return new Response('', {
        status: 405,
        headers: DEFAULT_SECURITY_HEADERS,
      });
    }

    try {
      const reqBody = JSON.stringify(await request.json());
    } catch {
      return new Response('', {
        status: 400,
        headers: DEFAULT_SECURITY_HEADERS,
      });
    }

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
        return new Response("Value not found", {
          status: 404,
          headers: DEFAULT_SECURITY_HEADERS,
        });
      }
      return new Response(metadata.someMetadataKey, {
        status: 200,
        headers: DEFAULT_SECURITY_HEADERS,
      });
    }
    catch (e)
    {
      return new Response(e.message, {
        status: 500,
        headers: DEFAULT_SECURITY_HEADERS,
      });
    }

    const dataToSign = await request.text();
    const signature = await signData(dataToSign, env.PRIVATE_KEY);
    return new Response(signature, { status: 200 });
  },
};
