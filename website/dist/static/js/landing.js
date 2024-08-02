document.addEventListener("DOMContentLoaded", () => {
    if (window.location.href.endsWith("/useless-app")) {
        const navbar = document.getElementById('navbar-hide');
        if (navbar) {
            navbar.classList.toggle("hidden");
        }
        const copyright = document.getElementById('landing-copyright');
        if (copyright) {
            copyright.classList.toggle("hidden");
        }
        const footer = document.getElementById('footer-hide');
        if (footer) {
            footer.classList.toggle("hidden");
        }
    }
});
