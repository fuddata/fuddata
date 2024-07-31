export function jResp(cors, status, message) {
    return Response.json(
        {
            status: status,
            message: message,
        },
        {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": cors,
                "Cache-Control": "no-store",
                "Content-Security-Policy": "frame-ancestors 'none'",
                "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "DENY",
            }
        }
    );
}

export async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export async function verifyTurnstile(context) {
    const request = context.request;
    const env = context.env;
    const cfConnectingIP = request.headers.get("CF-Connecting-IP") || "Unknown";
    const cfTurnstileResponse = request.headers.get("TurnstileResponse") || "Unknown";
    if (env.TURNSTILE_API_KEY != null) {
        if (cfTurnstileResponse == null) {
            return false;
        }
        let formData = new FormData();
        formData.append('secret', env.TURNSTILE_API_KEY);
        formData.append('response', cfTurnstileResponse);
        formData.append('remoteip', cfConnectingIP);
        const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
        const result = await fetch(url, {
            body: formData,
            method: 'POST',
        });
        const outcome = await result.json();
        if (!outcome.success) {
            return false;
        }
    }
    return true;
}

export async function saveStat(context) {
    const request = context.request;
    const env = context.env;
    const { searchParams } = new URL(request.url);
    let url = searchParams.get('url');
    let source = searchParams.get('source');
    let medium = searchParams.get('medium');
    let campaign = searchParams.get('campaign');
    let sessionId = searchParams.get('sessionId');
    if (url == null) {
        url = request.headers.get("Referer");
    };
    const now = new Date().getTime();
    const cfIPCountry = request.headers.get("CF-IPCountry");
    const cfIPCity = request.headers.get("CF-IPCity");
    const cfTimezone = request.headers.get("CF-Timezone");
    const userAgent = request.headers.get("User-Agent");
    const key = cfIPCountry + "|" + cfIPCity + "|" + sessionId + "|" + now
    await env.STATISTICS.put(key, url, {
        metadata: {
            userAgent: userAgent,
            timezone: cfTimezone,
            source: source,
            medium: medium,
            campaign: campaign,
        },
    });
}

export function getCors(context) {
    const env = context.env;
    const request = context.request;
    let cors = "";
    const corsArray = env.CORS.split(",");
    const referer = request.headers.get("Referer").replace(/\/$/, "");
    if (corsArray.includes(referer)) {
        cors = referer;
    }
    return cors;
}