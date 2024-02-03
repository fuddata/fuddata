import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Login");
  }

  async getHtml() {
    alert("URL: " + location);


    return `
      <h1>Login</h1>
      <div class="contact-form">
        <div id="content__unsecure" class="hidden">
          <p>Welcome! You have accessed this page with a valid link.</p>
          <button onclick="createSession()">Login</button>
        </div>
        <div id="content__secure" class="hidden ">
          <p>This is some secure content visible only after authentication.</p>
          <button onclick="logout()">Logout</button>
        </div>
      </div>
    `;
  }
}
