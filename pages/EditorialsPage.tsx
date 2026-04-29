
import React from 'react';
import { useData } from '../hooks/useStore';
import PostCard from '../components/PostCard';
import { NewspaperIcon } from '../components/Icons';

const EditorialsPage: React.FC = () => {
    const { editorials } = useData();

    return (
        <div className="container mx-auto p-2 md:p-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-4">
                    <div className="mb-8 flex items-center gap-4 border-b border-gray-200 pb-6 ml-1">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                            <NewspaperIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Editorials</h1>
                            <p className="text-gray-500 font-medium">Official announcements and manifestos from the core collective.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {editorials.length > 0 ? (
                            editorials.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(editorial => (
                                <PostCard key={editorial.id} post={editorial} isFullView={false} />
                            ))
                        ) : (
                            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                                <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
                                    <NewspaperIcon className="w-8 h-8 text-gray-300" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Silence is speaking...</h2>
                                <p className="text-gray-500 mt-2">No editorials have been issued yet. Check back soon for official updates.</p>
                            </div>
                        )}
                    </div>
                </div>
                <aside className="hidden lg:block space-y-4">
                    {/* Empty sidebar to match home layout spacing */}
                </aside>
            </div>
        </div>
    );
};

export default EditorialsPage;
