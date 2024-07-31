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
                source: "ContactForm",
            },
        });
    }

    return jResp(cors, 0, 'Message sent');
}
