import { jResp, sha256 } from "../common.js";

export async function onRequest(context) {
    const request = context.request;
    const env = context.env;
    let cors = env.CORS;

    const contentType = request.headers.get("content-type");
    if (request.method != 'POST' || contentType != 'application/json') {
        return jResp(cors, 1, 'Unsupported method');
    }

    // Validate Turnstile token if API KEY is defined
    const cfConnectingIP = request.headers.get("CF-Connecting-IP") || "Unknown";
    const cfTurnstileId = request.headers.get("TurnstileId") || "Unknown";
    if (env.TURNSTILE_API_KEY != null) {
        if (cfTurnstileId == null) {
            return jResp(cors, 1, 'Turnstile token required');
        }
        let formData = new FormData();
        formData.append('secret', env.TURNSTILE_API_KEY);
        formData.append('response', cfTurnstileId);
        formData.append('remoteip', cfConnectingIP);
        const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
        const result = await fetch(url, {
            body: formData,
            method: 'POST',
        });
        const outcome = await result.json();
        if (!outcome.success) {
            return jResp(cors, 1, 'Invalid Turnstile token');
        }
    }

    const cfIPCountry = request.headers.get("CF-IPCountry");
    const body = await request.json();
    const emailHash = await sha256(body.email);
    await env.CONTACT.put(emailHash, body.message, {
        metadata: {
            replyTo: body.email,
            country: cfIPCountry,
            timestamp: new Date().getTime(),
            expirationTtl: 2592000,
        },
    });

    if (body.joinMaillist) {
        await env.MAILLIST.put(emailHash, body.email, {
            metadata: {
                country: cfIPCountry,
                timestamp: new Date().getTime(),
            },
        });
    }

    return jResp(cors, 0, 'Message sent');
}
