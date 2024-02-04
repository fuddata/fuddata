import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Roadmap");
  }

  async getHtml() {
    return `
      <h1>Roadmap</h1>
    `;
  }
}
