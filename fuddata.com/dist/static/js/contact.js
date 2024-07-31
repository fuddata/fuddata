function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

document.addEventListener("DOMContentLoaded", () => {
    let turnstileId = "";
    let turnstileRendered = false;
    const toggleEmail = () => {
        const contactEmail = document.getElementById('contact-email');
        if (contactEmail) {
            contactEmail.classList.toggle("hidden");
        }
        const contactMaillist = document.getElementById('join-emaillist');
        if (contactMaillist) {
            contactMaillist.classList.toggle("hidden");
        }
        const contactLabel = document.getElementById('label-emaillist');
        if (contactLabel) {
            contactLabel.classList.toggle("hidden");
        }
    };
    const contactCheckbox = document.getElementById('request-reply');
    if (contactCheckbox) {
        contactCheckbox.addEventListener('change', toggleEmail);
    }
    const contactMsg = document.getElementById('contact_message');
    if (contactMsg.addEventListener) {
        if (window.location.href.startsWith("https://www.fuddata.com/")) {
            contactMsg.addEventListener('input', function (event) {
                if (turnstileId == "" && turnstileRendered == false) {
                    turnstileId = turnstile.render('#ttWidget', {
                        sitekey: '0x4AAAAAAARY-yrETZZ7W3HV',
                    });
                    turnstileRendered = true;
                }
            });
        }
    }


    let formSubmitted = false;
    document.addEventListener('submit', function (event) {
        const cForm = event.target.closest('#contact-form');
        if (!cForm) return;
        event.preventDefault();

        if (formSubmitted) return;
        const storeEmail = document.getElementById('request-reply').checked;
        const email = document.getElementById('contact-email').value;
        if (storeEmail) {
            if (!validateEmail(email)) {
                document.getElementById('contact_info').innerText = "Invalid email address";
                return;
            }
        }
        formSubmitted = true;

        document.getElementById('contact_submit').classList.toggle('hidden');
        document.getElementById('contact_message').readOnly = true;

        const msg = document.getElementById('contact_message').value;
        const msgBytes = new TextEncoder().encode(msg);
        const binString = String.fromCodePoint(...msgBytes);
        const joinMaillist = document.getElementById('join-emaillist').checked;
        const body = {
            message: btoa(binString),
            email: email,
            joinMaillist: joinMaillist,
        }
        let turnstileResponse = "";
        if (turnstileId != "") {
            turnstileResponse = turnstile.getResponse(turnstileId);
        }
        const init = {
            body: JSON.stringify(body),
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "TurnstileResponse": turnstileResponse,
            },
        };
        fetch("/api/contact/", init)
            .then(response => response.json())
            .then(data => {
                if (data.status == 0) {
                    document.getElementById('contact_info').innerText = "Message sent successfully.";
                } else {
                    document.getElementById('contact_info').innerText = "Sending of message failed";
                }
            })
            .catch((error) => {
                document.getElementById('contact_info').innerText = "Sending of message failed";
            })
            .finally(() => {
                formSubmitted = false;
            });
    });
});
