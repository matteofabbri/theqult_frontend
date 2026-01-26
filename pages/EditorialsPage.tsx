import React from 'react';
import { Link } from 'react-router-dom';
import { useData, useAuth } from '../hooks/useStore';
import PostCard from '../components/PostCard';

const EditorialsPage: React.FC = () => {
  const { editorials } = useData();
  const { currentUser, isAdmin } = useAuth();

  const sortedEditorials = [...editorials]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="container mx-auto p-2 md:p-4">
        <div className="flex items-center gap-2 mb-4">
            {currentUser && isAdmin(currentUser.id) && (
              <Link to="/editorials/submit" className="block bg-primary text-white font-bold py-2 px-4 rounded-full hover:opacity-90 transition-opacity text-sm">
                  Create Editorial
              </Link>
            )}
        </div>

        <div className="space-y-4">
            {sortedEditorials.length > 0 ? (
                sortedEditorials.map(editorial => <PostCard key={editorial.id} post={editorial} isFullView={true} />)
            ) : (
                <div className="text-center text-gray-500 p-8 bg-white rounded-md border border-gray-200">
                    <h2 className="text-xl font-semibold">No editorials have been posted yet.</h2>
                </div>
            )}
        </div>
    </div>
  );
};

export default EditorialsPage;
