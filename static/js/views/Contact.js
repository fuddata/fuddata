import { sessionId } from '../global.js';
import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Contact");
  }

  async getHtml() {
    if (sessionId != null ) {
      return `
        <h1>Contact</h1>
        <div class="contact-form">
          <form id="contact" autocomplete="off">
            <label for="message">Message:</label>
            <textarea id="contact_message" name="message" required></textarea>
            <button id="contact_submit" type="submit">Send Message</button>
            <label id="contact_info"></label>
          </form>
        </div>
        <br />
      `;
    }
    return `
    <h1>Contact</h1>
    <div class="contact-form">
      Please, login first by clicking "Login" button on right top corner.
    </div>
    <br />
  `;
  }
}

