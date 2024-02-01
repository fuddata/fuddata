import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("BugBounty");
    }

    async getHtml() {
        return `
            <h1>Bug Bounty</h1>
        `;
    }
}