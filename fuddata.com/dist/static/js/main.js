document.addEventListener("DOMContentLoaded", () => {
    var newURL = window.location.protocol + "//" + window.location.host + window.location.pathname;
    if (window.location.pathname != "/order" && window.location.pathname != "/registration" && !window.location.search.indexOf("utm_source")) {
        console.log("Path name: " + window.location.pathname);
        window.history.replaceState({ path: newURL }, '', newURL);
    }
    const toggleMenu = () => {
        const navbarLinks = document.getElementById('navbar-links');
        if (navbarLinks) {
            navbarLinks.classList.toggle("hidden");
        }
    };
    const menuToggleBtn = document.getElementById('navbar-hamburger');
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', toggleMenu);
    }
    if (window.location.href.startsWith("https://www.")) {
        let linksArray = document.querySelectorAll("a.js-link");
        linksArray.forEach(function (elem) {
            elem.addEventListener('click', function (event) {
                event.preventDefault();
                let target = elem.getAttribute("target");
                if (target == null) {
                    target = "_self";
                }
                openLink(elem.getAttribute("href"), target)
            });
        });
    }
});
function openLink(url, target) {
    const sessionId = document.getElementById('session-id').innerText;
    fetch("https://www.fuddata.com/api/link?url=" + url + "&sessionId=" + sessionId)
        .then(response => response.json())
        .then(data => {
            if (data.url) {
                let url = data.url;
                if (url != "video") {
                    if (target == "_self") {
                        url += "?js=true"
                    }
                    window.location.assign(url)
                }
            }
        });
}
