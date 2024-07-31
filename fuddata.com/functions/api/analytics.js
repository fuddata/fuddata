import { getCors, saveStat } from "../common.js";

export async function onRequest(context) {
    let cors = getCors(context);

    const request = context.request;
    const { searchParams } = new URL(request.url);

    // Store landing page statistics
    let landing = searchParams.get('landing');
    if (landing == "true") {
        await saveStat(context);
    }

    // Check if user browser has set Do Not Track or Global Privacy Control header
    let DoNotTrack = false;
    const DNT = request.headers.get("DNT");
    const SecGPC = request.headers.get("Sec-GPC");
    if (DNT != null || SecGPC != null) {
        DoNotTrack = true;
    }

    const cfIPCountry = request.headers.get("CF-IPCountry");
    let euCountry = false;
    const nonCookieCountryCodes = [
        // EU countries
        "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
        "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
        "PL", "PT", "RO", "SK", "SI", "ES", "SE",

        // EEA countries
        "NO", "IS", "LI",

        // Quebec (Canada)
        "CA",

        // UK territories
        "GB", "GI",

        // Clients without country code
        "XX"
    ];
    if (nonCookieCountryCodes.includes(cfIPCountry)) {
        euCountry = true;
    }

    return new Response('{"EU":' + euCountry + ',"DoNotTrack":' + DoNotTrack + '} ', {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": cors,
            "Cache-Control": "private, max-age=900",
        },
    });
}
