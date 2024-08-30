import { validateEmail } from "./common.js";

document.addEventListener("DOMContentLoaded", () => {
    let formSubmitted = false;
    document.addEventListener('submit', function (event) {
        event.preventDefault();
    });
    if (formSubmitted) return;

    const url = new URL(window.location.href);
    var appName = "Hello World";
    if (window.location.href.startsWith("https://www.localadminotp.com/registration")) {
        appName = "Local Admin OTP";
    }
    const params = new URLSearchParams(url.search);
    const clientid = params.get('clientid');
    const registrationBtn = document.getElementById('registration-submit');
    const email = document.getElementById("registration-email");
    const agreeTerms = document.getElementById("agree-terms");
    const joinEmaillist = document.getElementById("join-emaillist");

    const sendRegistration = () => {
        if (email.value == "" || clientid == null || !agreeTerms.checked) {
            return;
        }
        const invalidEmail = document.getElementById('invalid-email');
        if (validateEmail(email.value)) {
            if (!invalidEmail.classList.contains('hidden')) {
                invalidEmail.classList.toggle('hidden');
            }
        } else {
            if (invalidEmail.classList.contains('hidden')) {
                invalidEmail.classList.toggle('hidden');
            }
            return;
        }
        if (!registrationBtn.classList.contains('hidden')) {
            registrationBtn.classList.toggle('hidden');
        }
        const body = {
            app: appName,
            guid: atob(clientid),
            type: 13,
            email: email.value,
            joinMaillist: joinEmaillist.checked,
        }
        const init = {
            body: JSON.stringify(body),
            method: "POST",
            headers: {
                "Referer": window.location.origin,
            },
        };
        fetch("https://www.fuddata.com/api/registration/", init)
            .then(response => response.json())
            .then(data => {
                const regSuccess = document.getElementById('registration-success');
                const regFailed = document.getElementById('registration-failed');
                const regInfo = document.getElementById('registration-info')
                const errMsg = "Registration failed. Please, try again later or contact us in contact page.";
                if (data.status == 0) {
                    regSuccess.innerText = "Registration was successful.";
                    regSuccess.classList.toggle("hidden");
                    regInfo.innerText = "Trial warning will disappear from " + appName + " when it connects to internet next time.";
                    regInfo.classList.toggle("hidden");
                } else if (data.status == 3) {
                    regFailed.innerText = "This client ID is already registered.";
                    regFailed.classList.toggle("hidden");
                    regInfo.innerText = "Please, try restart your computer with internet connectivity and contact us if that does not help.";
                    regInfo.classList.toggle("hidden");
                } else {
                    regFailed.innerText = errMsg;
                    regFailed.classList.toggle("hidden");
                }
            })
            .catch((error) => {
                regInfo.innerText = errMsg;
                regInfo.classList.toggle("hidden");
            })
            .finally(() => {
                formSubmitted = false;
            });
    };
    if (registrationBtn) {
        registrationBtn.addEventListener('click', sendRegistration);
    }
});
