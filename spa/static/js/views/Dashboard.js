import AbstractView from "./AbstractView.js";
import Header from "../components/Header.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Dashboard");
  }

  async getHtml() {
    return `
      <h1>Welcome back, Dom</h1>
      <p>
        Fugiat voluptate et nisi Lorem cillum anim sit do eiusmod occaecat irure do. Reprehenderit anim fugiat sint exercitation consequat. Sit anim laborum sit amet Lorem adipisicing ullamco duis. Anim in do magna ea pariatur et.
      </p>
      <p>
        <a href="/posts" data-link>View recent posts</a>.
      </p>
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      A lot of later
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      And even more later
    `;
  }
}