import { email, sessionId } from './global.js';

let formSubmitted = false;
export const setupContactFormListener = () => {
  document.addEventListener('submit', function (event) {
    const cForm = event.target.closest('.contact-form #contact');
    if (!cForm) return;

    event.preventDefault();
    if (formSubmitted) return;
    formSubmitted = true;

    document.getElementById('contact_submit').classList.toggle('hidden');
    document.getElementById('contact_message').readOnly = true;

    const msg = document.getElementById('contact_message').value;
    const msgBytes = new TextEncoder().encode(msg);
    const binString = String.fromCodePoint(...msgBytes);
    const body = {
      message: btoa(binString),
      email: email,
    }
    const init = {
      body: JSON.stringify(body),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": sessionId,
      },
    };
    fetch("/api/contact/", init)
      .then(response => response.json())
      .then(data => {
        if (data.status == 0) {
          document.querySelector("#contact_info").innerHTML = "Message sent successfully. You will get email notification when we reply.";
        } else {
          document.querySelector("#otperror").innerHTML = "Sending of email failed";
        }
      })
      .catch((error) => {
        document.querySelector("#otperror").innerHTML = "Sending of email failed";
      })
      .finally(() => {
        formSubmitted = false;
      });
  });
};
