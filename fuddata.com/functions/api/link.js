import { getCors, saveStat } from "../common.js";

// Save link click statistics and return target URL
export async function onRequest(context) {
    const request = context.request;
    let cors = getCors(context);
    await saveStat(context);
    const { searchParams } = new URL(request.url);
    let url = searchParams.get('url');
    return new Response('{"url":"' + url + '"}', {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": cors,
        },
    });
}
