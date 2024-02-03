import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Login");
  }

  async getHtml() {
    const queryParams = {};
    const params = new URLSearchParams(location.search);
    for (const [key, value] of params.entries()) {
      queryParams[key] = value;
    }
    const emailHash = queryParams.h;
    const sessionId = queryParams.s;

    if (emailHash != null && sessionId != null) {
      const url = "http://192.168.8.40:8792/?action=validate&hash=" + emailHash + "&session=" + sessionId;
      const response = await fetch(url);
      const results = await response.text();
      if (results == "true") {
        return `
        <h1>Login</h1>
        <div class="contact-form">
          <p>This is some secure content visible only after authentication.</p>
          <button onclick="logout()">Logout</button>
        </div>
      `;
      }
    }

    return `
      <h1>Login</h1>
      <div class="contact-form">
        <p>Welcome! You have accessed this page with a valid link.</p>
        <button onclick="createSession()">Login</button>
      </div>
    `;
  }
}
