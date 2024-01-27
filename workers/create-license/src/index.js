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

    return arrayBufferToBase64(signature);
  } catch (err) {
    console.error("Error:", err);
    return '';
  }
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

    const dataToSign = await request.text();
    const signature = await signData(dataToSign, env.PRIVATE_KEY);
    return new Response(signature, { status: 200 });
  },
};
