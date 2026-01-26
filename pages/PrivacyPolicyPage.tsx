
import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="bg-white rounded-md border border-gray-200 p-6 md:p-8 prose max-w-none">
        <h1>Privacy Policy for The Qult</h1>
        <p><em>Last Updated: [Date]</em></p>

        <h2>1. Introduction</h2>
        <p>Welcome to The Qult. This is a demo application and does not collect, store, or process any real personal data from its users beyond what is necessary for the demonstration's functionality within your browser's local storage. This privacy policy is for illustrative purposes only.</p>

        <h2>2. Information We "Collect"</h2>
        <p>All data entered into this application, including usernames, posts, and comments, is stored directly in your web browser's <strong>Local Storage</strong>. This data never leaves your computer and is not sent to any external server or database.</p>
        <ul>
            <li><strong>Account Information:</strong> When you register, we store your username and a (plaintext) password in local storage.</li>
            <li><strong>Content:</strong> All posts, comments, and votes you create are stored locally.</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>The information is used solely to simulate the functionality of a social media platform. It allows the application to remember your session, display your content, and maintain the state of the application between visits on the same browser.</p>

        <h2>4. Data Sharing and Disclosure</h2>
        <p>We do not share your data with anyone because we do not have access to it. It resides entirely on your local machine.</p>

        <h2>5. Data Security</h2>
        <p>While the data is "secure" in the sense that it isn't transmitted over the internet, please be aware that anyone with access to your computer and browser could potentially view the data stored in local storage. <strong>Do not use real passwords or sensitive personal information on this demo site.</strong></p>

        <h2>6. Cookies</h2>
        <p>This application does not use cookies for tracking or authentication. All session management is handled via local storage. For more details, please see our <Link to="/cookies">Cookie Policy</Link>.</p>

        <h2>7. Your Rights</h2>
        <p>You have complete control over your data. You can clear your browser's local storage for this site at any time to permanently delete all associated information.</p>

        <h2>8. Contact Us</h2>
        <p>This is a demo application and there is no one to contact. If you have questions about the source code, please refer to the project repository.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
