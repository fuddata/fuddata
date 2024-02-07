import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Fuddata | Dashboard");
  }

  async getHtml() {
    return `
      <h1>Welcome to Fuddata webpage</h1>
      <p>For us security and user privacy are most important design priciples which why we
      built this from scratch <i>without</i> using UI frameworks, minimized usage of 3rd party
      libraries and we made whole codebase publicly available as open source so anyone can review it.</p>
      <p>
      <h2>Features worth of mentioning</h2>
      <h3>Security</h3>
      <li><i>Passwordless</i> authentication</li>
      <li><i>Very strict</i> security headers configuration</li>
      <li>Safe login emails with:</li>
      <ol>
        <li><i>Rich text formatting</i> meaning that they contain both HTML and plain text version of message and both are human readable</li>
        <li><i>No links</i></li>
        <li><i>No pictures</i></li>
      </ol>
      <li>Secure contact form</li>
      <h3>Privacy</h3>
      <li><i>No cookies</i> (none, zero)</li>
      <li><i>No user tracking</i></li>
      <li><i>Irreversible</i> hashing method used to store email addresses (except on contact form at the moment so we can reply).</li>
      <h3>Functionality</h3>
      <li>Simple, human readable code</li>
      </p>
      <p>You can find complete source code from <a href="https://github.com/fuddata/fuddata" alt="Source code link" target="_blank" rel="noopener noreferrer">here.</a></p>
    `;
  }
}
