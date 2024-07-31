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
