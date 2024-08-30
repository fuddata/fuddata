// This API is used to validate EU VAT numbers and fetch company name + address connected to them.
import { getCors, jResp } from "../common.js";

export async function onRequest(context) {
    const request = context.request;
    const env = context.env;
    let cors = getCors(context);

    const { searchParams } = new URL(request.url);
    const paramcountry = searchParams.get('country');
    const paramVATid = searchParams.get('id');

    let vatId = paramVATid.replace(/-/g, '');
    vatId = vatId.replace(/\s+/g, '');
    const nonDigitMatches = vatId.match(/[^0-9]/g);
    if (nonDigitMatches) {
        if (/^[A-Z]{2}/.test(vatId)) {
            vatId = vatId.substring(2);
        } else {
            return jResp(cors, 1, 'Invalid VAT ID');
        }
    }
    if (/[^0-9]/.test(vatId)) {
        return jResp(cors, 1, 'Invalid VAT ID');
    }
    var vResponseJson;
    if (paramcountry && vatId) {
        var vInit = {
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        };
        const vatUrl = "https://ec.europa.eu/taxation_customs/vies/rest-api/ms/" + paramcountry + "/vat/" + vatId;
        const vResponse = await fetch(vatUrl, vInit);
        vResponseJson = await vResponse.json();
        if (env.DEBUG_VAT) {
            console.log("VAT URL: " + vatUrl);
            console.log(JSON.stringify(vResponseJson, null, undefined));
        }
        if (vResponseJson.isValid != true) {
            return jResp(cors, 1, 'Invalid VAT ID');
        }
        return jResp(cors, 0, vResponseJson.name + "\n" + vResponseJson.address);
    }
    return jResp(cors, 1, 'Invalid request');
}
