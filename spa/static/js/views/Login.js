import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Login");
  }

  async getHtml() {
    return `
      <h1>Login</h1>
      <div class="contact-form">
        <div id="login" class="hidden">
          <p>Welcome! You have accessed this page with a valid link.</p>
          <button onclick="createSession()">Create Session</button>
        </div>
        <div id="content" class="hidden">
          <p>This is some secure content visible only after authentication.</p>
          <button onclick="logout()">Logout</button>
      </div>
    </div>
    `;
  }
}
