
import React from 'react';

const ContactPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="bg-white rounded-md border border-gray-200 p-6 md:p-8 prose max-w-none">
        <h1>Contact Us</h1>
        <p>This is a demonstration application, and as such, there is no official support channel or contact person. The information below is for illustrative purposes only.</p>
        
        <h2>General Inquiries</h2>
        <p>For general questions about this demo, please refer to the documentation provided with the source code.</p>
        
        <h2>Technical Support</h2>
        <p>There is no technical support for this application. If you encounter a bug, you are encouraged to examine the code and propose a fix.</p>
        
        <h2>Mailing Address</h2>
        <p>
          The Qult Demo Project<br />
          123 Fictional Avenue<br />
          React City, TS 54321<br />
          The Internet
        </p>

        <h2>Feedback</h2>
        <p>Feedback is appreciated! Please provide it through the appropriate channels where you accessed this demo.</p>
      </div>
    </div>
  );
};

export default ContactPage;
