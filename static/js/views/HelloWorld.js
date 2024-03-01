import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Hello World");
  }

  async getHtml() {
    return `
      <h1>Fuddata Hello World</h1>
      <p><b>Hello World</b> programs are commonly used as starting point when learning new programming language(s).
      Those programs simply just print text <i>Hello World</i> which is enough to verifty that software development environment is correctly installed and configured.</p>

      <p>We use <b>Fuddata Hello World</b> as starting point for our paid softwares.
      It is freely available for everyone and allow you test it 3 days without license and when you acquire license for it through this webstore, it finds that automatically.</p>
      <img id="hello_demo" alt="Hello World Demo" />
      <p>You can also find its source code from <a href="https://github.com/fuddata/hello" target="_blank" rel="noopener noreferrer">here</a>.
    `;
  }
}
