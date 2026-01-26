
import React from 'react';

const CookiePolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="bg-white rounded-md border border-gray-200 p-6 md:p-8 prose max-w-none">
        <h1>Cookie Policy for The Qult</h1>
        <p><em>Last Updated: [Date]</em></p>

        <h2>What Are Cookies</h2>
        <p>As is common practice with almost all professional websites, this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from being stored however this may downgrade or 'break' certain elements of the sites functionality.</p>
        
        <h2>How We Use Cookies</h2>
        <p>This demo application, The Qult, <strong>does not use cookies</strong>. All data persistence, such as keeping you logged in and remembering your posts, is handled using your browser's <strong>Local Storage</strong> technology.</p>
        <p>We are explaining what cookies are for illustrative purposes, as a real-world application would typically have a policy like this.</p>

        <h2>Disabling Cookies</h2>
        <p>You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of this site. Therefore it is recommended that you do not disable cookies.</p>
        <p>Since we use Local Storage instead of cookies, to clear this site's data, you would need to clear your browser's Local Storage for this specific domain.</p>

        <h2>Third-Party Cookies</h2>
        <p>In a real application, you might use services that set their own cookies. For example:</p>
        <ul>
            <li>Google Analytics to understand how you use the site.</li>
            <li>Social media buttons/plugins that allow you to connect with your social network.</li>
            <li>Advertising networks to serve relevant ads.</li>
        </ul>
        <p>This demo application does not include any third-party services that would set cookies.</p>

        <h2>More Information</h2>
        <p>Hopefully, that has clarified things for you. As was previously mentioned, this site does not use cookies. This policy is a template. If you are still looking for more information, you can contact us through one of our preferred contact methods.</p>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
