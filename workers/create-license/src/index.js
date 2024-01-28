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
    if (request.method != 'POST') {
      return new Response('', { status: 405 });
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
            return new Response("Value not found", {status: 404});
        }
        return new Response(metadata.someMetadataKey);
    }
    catch (e)
    {
        return new Response(e.message, {status: 500});
    }

    const dataToSign = await request.text();
    const signature = await signData(dataToSign, env.PRIVATE_KEY);
    return new Response(signature, { status: 200 });
  },
};
