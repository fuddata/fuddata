import { getCors } from "../common.js";

// Generate session ID and instruct browser to cache it for 15 minutes
// so we are able to correlate statistics events correctly
// without knowing client IP or even it's hash
export async function onRequest(context) {
    let cors = getCors(context);
    let sessionId = "";
    for (let i = 0; i < 12; i++) {
        let randomNumber = Math.floor(Math.random() * 10);
        sessionId += randomNumber.toString();
    }
    return new Response('{"sessionId":"' + sessionId + '"}', {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": cors,
            "Cache-Control": "private, max-age=900",
        },
    });
}
