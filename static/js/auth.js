import { email, setEmail, sessionId, setSessionId, serverToken, setServerToken, turnstileId, renderTurnstile } from './global.js';

let emailLocal = "";
let formSubmitted = false;
export const checkSession = () => {
  if (sessionId !== null) {
    document.getElementById('login_btn').classList.add('hidden');
    document.getElementById('logout_btn').classList.remove('hidden');
  }
};

export const setupAuthListeners = () => {
  document.getElementById("login_btn").addEventListener("click", login);
  document.getElementById("logout_btn").addEventListener("click", logout);

  const eForm = document.querySelector('#login_form_container_email .login_form_email');
  eForm.addEventListener('submit', handleLoginForm);

  const oform = document.querySelector('#login_form_container_otp .login_form');
  oform.addEventListener('submit', handleOTPForm);
};

export const login = () => {
  renderTurnstile();
  document.getElementById('login_form_container_email').classList.remove('hidden');
};

export const logout = () => {
  document.getElementById('logout_btn').classList.add('hidden');
  document.getElementById('login_btn').classList.remove('hidden');
  sessionStorage.removeItem('sessionId');
  sessionId = null;
  window.location.reload();
};

export const handleLoginForm = (event) => {
  event.preventDefault();
  if (formSubmitted) return;
  formSubmitted = true;

  emailLocal = document.getElementById('login_form_email').value;
  setEmail(emailLocal);
  const apiUrl = `/api/login/?action=create&email=${encodeURIComponent(emailLocal)}&turnstile=${turnstile.getResponse(turnstileId)}`;
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.status === 0) {
        setServerToken(data.message);
        document.getElementById('login_form_container_email').classList.add('hidden');
        document.getElementById('login_form_container_otp').classList.remove('hidden');
        turnstile.remove(turnstileId);
      } else {
        document.querySelector("#otperror").innerHTML = "Sending of email failed";
      }
    })
    .catch((error) => {
      document.querySelector("#otperror").innerHTML = "Sending of email failed";
    });
    formSubmitted = false;
};

export const handleOTPForm = (event) => {
  event.preventDefault();
  if (formSubmitted) return;
  formSubmitted = true;

  const userToken = document.getElementById('login_form_otp').value;
  const authToken = serverToken + userToken.replace(/\s/g, '');
  const apiUrl = `/api/login/?action=validate&email=${encodeURIComponent(emailLocal)}&token=${encodeURIComponent(authToken)}`;
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.status === 0) {
        document.getElementById('login_form_container_otp').classList.add('hidden');
        document.getElementById('login_btn').classList.add('hidden');
        document.getElementById('logout_btn').classList.remove('hidden');
        setSessionId(authToken);
        sessionStorage.setItem('sessionId', authToken);
        serverToken = "";
        window.location.reload();
      } else {
        document.querySelector("#otperror").innerHTML = "Invalid token";
      }
    })
    .catch((error) => {
      document.querySelector("#otperror").innerHTML = "Sending token failed";
    })
    .finally(() => {
      formSubmitted = false;
    });
};
