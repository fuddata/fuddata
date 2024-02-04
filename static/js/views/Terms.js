import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Fuddata | Terms of Use");
  }

  async getHtml() {
    return `
    Last Updated: Feb 07, 2024

    <h1>Fuddata Terms of Use</h1>
    
    <h2>1. Introduction</h2>
    <p>Welcome to Fuddata website! These Terms of Service ("Terms") govern your use of our website located at https://fuddata.com (the "Service") operated by Fuddata Limited.</p>
    <p>By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you do not have permission to access the Service.</p>
    
    <h2>2. Use of Service</h2>
    <p>This Service is intended for users who are at least 18 years old. If you are under 18, you are not permitted to use this Service.</p>
    
    <h2>3. Accounts</h2>
    <p>When you create an account with us, you must provide accurate, complete, and current information at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
    
    <h2>4. Intellectual Property</h2>
    <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Fuddata Limited and its licensors.</p>
    
    <h2>5. Links to Other Websites</h2>
    <p>Our Service may contain links to third-party websites or services that are not owned or controlled by Fuddata Limited.</p>
    <p>Fuddata Limited has no control over, and assumes no responsibility for the content, privacy policies, or practices of any third-party websites or services. We strongly advise you to read the terms and conditions and privacy policies of any third-party websites or services that you visit.</p>
    
    <h2>6. Termination</h2>
    <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
    
    <h2>7. Limitation of Liability</h2>
    <p>In no event shall Fuddata Limited, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.</p>
    
    <h2>8. Changes</h2>
    <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
    
    <h2>9. Contact Us</h2>
    <p>If you have any questions about these Terms, please contact us at <a href="/contact" data-link>here</a>.</p>    
    `;
  }
}
