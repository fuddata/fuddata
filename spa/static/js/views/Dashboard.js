import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Dashboard");
  }

  async getHtml() {
    return `
      <h1>Fuddata Hello World</h1>
      <p><b>Hello World</b> programs are commonly used as starting point when learning new programming language(s).
      Those programs simply just print text <i>Hello World</i> which is enough to proof that software development environment is correctly installed.</p>

      <p>We use <b>Fuddata Hello World</b> as starting point for our paid softwares.</p>
      <img id="hello_demo" alt="Hello World Demo" />
      <p>You can also find its source code from <a href="https://github.com/fuddata/hello" target="_blank" rel="noopener noreferrer">here</a>.
    `;
  }
}