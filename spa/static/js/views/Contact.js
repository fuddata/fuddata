import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Contact");
    }

    async getHtml() {
        return `
            <h1>Contact</h1>
            <p>You are viewing the contacts!</p>
        `;
    }
}