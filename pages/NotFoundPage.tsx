import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="container mx-auto p-2 md:p-4">
        <div className="text-center py-20">
            <h1 className="text-6xl font-bold text-primary">404</h1>
            <h2 className="text-3xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
            <p className="text-gray-500 mt-2">Sorry, the page you are looking for does not exist.</p>
            <Link to="/" className="mt-8 inline-block bg-primary text-white font-bold py-3 px-6 rounded-full hover:opacity-90 transition-opacity">
                Go to Homepage
            </Link>
        </div>
    </div>
  );
};

export default NotFoundPage;