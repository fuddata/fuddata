// Enable analytics tools but only for users coming outside of "EU, EEA, Quebec, and UK territories"
// and only if their browser do not send either Do Not Track or Global Privacy Control header.
if (window.location.href.startsWith("https://www.")) {
    let sessionId = "";
    await fetch("https://www.fuddata.com/api/session", { cache: "force-cache" })
        .then(response => response.json())
        .then(data => {
            if (data.sessionId) {
                sessionId = data.sessionId;
            }
        });
    document.getElementById('session-id').innerText = sessionId;

    const urlStr = window.location.href;
    const url = new URL(urlStr);
    let params = new URLSearchParams(url.search);
    let apiUrl = "https://www.fuddata.com/api/analytics?landing="
    let javascript = params.get('js');
    if (javascript == "true") {
        apiUrl += "false"
    } else {
        const source = params.get('utm_source');
        const medium = params.get('utm_medium');
        const campaign = params.get('utm_campaign');
        apiUrl += "true&source=" + source + "&medium=" + medium + "&campaign=" + campaign;
        apiUrl += "&sessionId=" + sessionId;
    }
    await fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.EU == false && data.DoNotTrack == false) {
                window._linkedin_partner_id = "5876764";
                window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
                window._linkedin_data_partner_ids.push(_linkedin_partner_id);

                (function (l) {
                    if (!l) {
                        window.lintrk = function (a, b) { window.lintrk.q.push([a, b]) };
                        window.lintrk.q = [];
                    }

                    function loadScript(src, attributes = {}) {
                        var s = document.getElementsByTagName("script")[0];
                        var b = document.createElement("script");
                        b.type = "text/javascript";
                        b.async = true;
                        b.src = src;

                        // Set any additional attributes passed in the 'attributes' object
                        for (var key in attributes) {
                            if (attributes.hasOwnProperty(key)) {
                                b.setAttribute(key, attributes[key]);
                            }
                        }

                        s.parentNode.insertBefore(b, s);
                    }

                    // Cloudflare Web Analytics
                    loadScript("https://static.cloudflareinsights.com/beacon.min.js", {
                        'data-cf-beacon': '{"token": "6fad5d8ccddd454382a4dd199f9737ea"}',
                        'defer': 'true'
                    });

                    // LinkedIn Insight Tag
                    loadScript("https://snap.licdn.com/li.lms-analytics/insight.min.js", {
                        'async': 'true'
                    });

                    // PostHog
                    !function (t, e) { var o, n, p, r; e.__SV || (window.posthog = e, e._i = [], e.init = function (i, s, a) { function g(t, e) { var o = e.split("."); 2 == o.length && (t = t[o[0]], e = o[1]), t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } } (p = t.createElement("script")).type = "text/javascript", p.async = !0, p.src = s.api_host + "/static/array.js", (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, r); var u = e; for (void 0 !== a ? u = e[a] = [] : a = "posthog", u.people = u.people || [], u.toString = function (t) { var e = "posthog"; return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e }, u.people.toString = function () { return u.toString(1) + ".people (stub)" }, o = "capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId".split(" "), n = 0; n < o.length; n++)g(u, o[n]); e._i.push([i, s, a]) }, e.__SV = 1) }(document, window.posthog || []);
                    posthog.init('phc_McrJk2OdxO9vJsCCOnfs7zv8Pr2JJCVTBIa6tM4cXgB', {
                        api_host: 'https://posthog.fuddata.com',
                        ui_host: 'https://eu.posthog.com)',
                        persistence: 'sessionStorage'
                    })
                })(window.lintrk);
            }
        });
}
