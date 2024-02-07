import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Fuddata | Privacy Statement");
  }

  async getHtml() {
    return `
    Last Updated: Feb 07, 2024

    <h1>Fuddata Privacy Policy</h1>
  
    <h2>1. Introduction</h2>
    <p>Welcome to Fuddate website. We are committed to protecting your personal information and privacy.
    This Privacy Policy describes our practices and procedures for the collection, use, disclosure and protection
    of your personal information when you use our Service.</p>
    <p>By using our Service, you consent to the collection and use of your information as described in this notice.</p>
    
    <h2>2. Information Collection and Use</h2>
    <p>We collect several different types of information for various purposes to provide and improve our Service to you.
    The types of data collected may include:</p>
    <ul>
      <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally
      identifiable information that can be used to contact or identify you. This may include, but is not limited to,
      your email address.</li>
    </ul>
    
    <h2>3. Log Data</h2>
    <p>We want to inform you that whenever you visit our Service, we collect information that your browser sends to us that
    is called Log Data. This Log Data may include information such as your computer's Internet Protocol ("IP") address,
    browser version, pages of our Service that you visit, the time and date of your visit, the time spent on those pages, and other statistics.</p>

    <h2>4. Service Providers</h2>
    <p>We may employ third-party companies and individuals due to the following reasons:</p>
    <ul>
      <li>To facilitate our Service;</li>
      <li>To provide the Service on our behalf;</li>
      <li>To perform Service-related services; or</li>
      <li>To assist us in analyzing how our Service is used.</li>
    </ul>
    <p>These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated
    not to disclose or use it for any other purpose.</p>

    <h2>5. Information security</h2>
    <p>The security of your information is important to us, but it is important to remember that no data transmission or
    electronic storage method over the Internet is completely secure. While we strive to use commercially reasonable means
    to protect your personal information, we cannot guarantee its absolute security.</p>
    
    <h2>6. Your Privacy Rights</h2>
    <p>As a user of our Service, you have certain rights regarding the use of your personal data. These include:</p>
    <ul>
      <li><strong>The right to access:</strong> You have the right to request copies of your personal data that we hold.</li>
      <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate. You also have the right to request us to complete information you believe is incomplete.</li>
      <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
      <li><strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
      <li><strong>The right to object to processing:</strong> You have the right to object to our processing of your personal data, under certain conditions.</li>
      <li><strong>The right to data portability:</strong> You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
    </ul>
    <p>If you would like to exercise any of these rights, please contact us using the contact details provided in the 'Contact Us' section of this policy.</p>

    <h2>7. Children's privacy</h2>
    <p>Our service is not directed to persons under the age of 18 ("Children").</p>
    <p>We do not knowingly collect personally identifiable information from persons under the age of 18. If you are a parent
    or guardian and are aware that your child has provided us with personal information, please contact us. If we become aware
    that we have collected personal information without parental consent, we will take steps to remove that information from our servers.</p>    
    
    <h2>8. Changes to This Privacy Policy</h2>
    <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
    <p>We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "Last updated" date at the top of this Privacy Policy.</p>
    <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
    
    <h2>9. Contact Us</h2>
    <p>If you have any questions or concerns about our Privacy Policy, or if you wish to exercise any of your privacy rights, please contact us on  <a href="/contact" data-link>here</a>.</p>
    <p>We are committed to addressing your concerns and will endeavor to resolve any privacy issues in a timely manner.</p>    
    `;
  }
}
