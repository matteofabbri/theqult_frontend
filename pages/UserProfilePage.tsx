
import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth, useData, getBannerUrl } from '../hooks/useStore';
import NotFoundPage from './NotFoundPage';
import ProfilePostCard from '../components/ProfilePostCard';
import UserAvatar from '../components/UserAvatar';
import { HeartIcon, TrendingUpIcon, UsersIcon, MessageIcon, NewspaperIcon } from '../components/Icons';
import AuthModal from '../components/AuthModal';
import { AVAILABLE_AWARDS } from '../components/Awards';

const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { currentUser, getUserByUsername } = useAuth();
  // Fixed missing awards from useData
  const { posts, profilePosts, comments, votes, follows, followUser, unfollowUser, isFollowing, awards } = useData();
  const navigate = useNavigate();
  
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; view: 'login' | 'signup' }>({ isOpen: false, view: 'login' });
  
  const user = username ? getUserByUsername(username) : undefined;

  const { userContent, totalKarma, engagement, followersCount, userAwards } = useMemo(() => {
    if (!user) return { userContent: [], totalKarma: 0, engagement: 0, followersCount: 0, userAwards: [] };
    
    // Content for the user's profile feed is only their profile posts
    const userProfilePosts = profilePosts.filter(p => p.authorId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // For karma and engagement, we need all their contributions
    const userBoardPosts = posts.filter(p => p.authorId === user.id);
    const userComments = comments.filter(c => c.authorId === user.id);

    const calculateKarma = (entities: { id: string }[]) => {
      return entities.reduce((karma, entity) => {
        const score = votes
          .filter(v => v.entityId === entity.id)
          .reduce((entityScore, vote) => entityScore + (vote.type === 'up' ? 1 : -1), 0);
        return karma + score;
      }, 0);
    };

    const postKarma = calculateKarma([...userProfilePosts, ...userBoardPosts]);
    const commentKarma = calculateKarma(userComments);
    const totalKarma = postKarma + commentKarma;

    const engagement = userComments.length;
    const followersCount = follows.filter(f => f.followingId === user.id).length;

    // Calculate Awards
    const receivedAwards = awards.filter(a => a.receiverId === user.id);
    const groupedAwards = receivedAwards.reduce((acc, award) => {
        acc[award.typeId] = (acc[award.typeId] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const userAwards = AVAILABLE_AWARDS
        .filter(def => groupedAwards[def.id])
        .map(def => ({
            ...def,
            count: groupedAwards[def.id]
        }))
        .sort((a, b) => b.cost - a.cost); // Show most expensive/rare first

    return { userContent: userProfilePosts, totalKarma, engagement, followersCount, userAwards };
  }, [user, posts, profilePosts, comments, votes, follows, awards]);

  const isCurrentUserFollowing = user ? isFollowing(user.id) : false;
  const isOwnProfile = currentUser?.id === user?.id;

  if (!user) {
    return <NotFoundPage />;
  }

  const handleFollow = () => {
    if (!user || !currentUser || isOwnProfile) return;
    if (isCurrentUserFollowing) {
        unfollowUser(user.id);
    } else {
        followUser(user.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const downloadPublicKey = () => {
      if (!user.publicKey) return;
      const element = document.createElement("a");
      const file = new Blob([user.publicKey], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${user.username}_public_key.pub`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  };

  return (
    <div className="container mx-auto p-2 md:p-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* MAIN COLUMN (Left) */}
        <div className="lg:col-span-3 space-y-4">
            
            {/* User Header Card */}
            <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                <div 
                className="h-48 md:h-64 bg-gray-300 bg-cover bg-center" 
                style={{ backgroundImage: `url(${getBannerUrl(user)})` }}
                />
                <div className="px-4 pb-4 md:px-6 md:pb-6 relative">
                    <div className="flex flex-col sm:flex-row items-end sm:items-end -mt-12 sm:-mt-16 mb-4 gap-4 px-4">
                        <UserAvatar user={user} className="w-24 h-24 md:w-32 md:h-32 border-4 border-white bg-white rounded-full shadow-sm flex-shrink-0" />
                        <div className="mb-1 flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 break-words">{user.username}</h1>
                            <div className="text-sm text-gray-500">u/{user.username} • Joined {formatDate(user.createdAt)}</div>
                        </div>
                        <div className="mb-2">
                             {!isOwnProfile && currentUser && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleFollow}
                                        className={`px-6 py-2 text-sm font-bold rounded-full transition-colors shadow-sm ${
                                            isCurrentUserFollowing
                                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            : 'bg-primary text-white hover:opacity-90'
                                        }`}
                                    >
                                        {isCurrentUserFollowing ? 'Following' : 'Follow'}
                                    </button>
                                    <Link
                                        to={`/messages/${user.username}`}
                                        className="p-2 text-sm font-semibold rounded-full transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-primary border border-gray-200"
                                        title={`Message ${user.username}`}
                                        >
                                            <MessageIcon className="w-5 h-5" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="px-4 pb-6">
                        {user.bio && (
                            <p className="text-gray-700">{user.bio}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Post Action - Only for Owner */}
            {isOwnProfile && (
                <div className="">
                    <Link to={`/u/${user.username}/submit`} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-md hover:bg-gray-50 transition-colors shadow-sm hover:border-gray-400 hover:text-primary">
                    <NewspaperIcon className="w-5 h-5" />
                    Create Profile Post
                    </Link>
                </div>
            )}

            {/* Posts Feed */}
            <div className="space-y-4">
                {userContent.length > 0 ? (
                    userContent.map(item => <ProfilePostCard key={item.id} post={item} />)
                ) : (
                    <div className="text-center text-gray-500 p-12 bg-white rounded-md border border-gray-200">
                        <p className="text-lg font-medium">u/{user.username} hasn't posted anything to their profile yet.</p>
                    </div>
                )}
            </div>
        </div>

        {/* SIDEBAR (Right) */}
        <aside className="space-y-4">
            
            {/* Stats Widget */}
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Profile Stats</h3>
                </div>
                <div className="p-4 flex flex-col gap-4">
                    {/* Karma */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                            <HeartIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">Karma</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{totalKarma}</span>
                    </div>
                    <div className="h-px bg-gray-100" />

                    {/* Engagement */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                            <TrendingUpIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">Engagement</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{engagement}</span>
                    </div>
                    <div className="h-px bg-gray-100" />

                    {/* Followers */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                            <UsersIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">Followers</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{followersCount}</span>
                    </div>
                    <div className="h-px bg-gray-100" />

                    {/* Profile Posts */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                            <NewspaperIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">Profile Posts</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{userContent.length}</span>
                    </div>
                </div>
            </div>

            {/* Awards Trophy Case Widget */}
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Trophy Case</h3>
                </div>
                <div className="p-4">
                    {userAwards.length > 0 ? (
                        <div className="grid grid-cols-4 gap-3">
                            {userAwards.map(award => (
                                <div key={award.id} className="flex flex-col items-center group relative cursor-help" title={`${award.label}: ${award.description}`}>
                                    <div className={`w-8 h-8 ${award.color} mb-1 transition-transform group-hover:scale-110`}>
                                        <award.icon className="w-full h-full" />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-1.5 rounded-full">
                                        {award.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 py-2 text-sm italic">
                            No awards yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Cryptographic Identity Widget */}
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Cryptographic Identity</h3>
                </div>
                <div className="p-4 flex flex-col items-center">
                    {user.publicKey ? (
                        <>
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(user.publicKey)}`} 
                                alt="Public Key QR" 
                                className="w-32 h-32 border border-gray-200 rounded p-1 mb-4"
                            />
                            <div className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-xs font-mono text-gray-600 break-all mb-4 max-h-20 overflow-y-auto">
                                {user.publicKey}
                            </div>
                            <button 
                                onClick={downloadPublicKey}
                                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded text-xs flex items-center justify-center gap-2 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                Download Public Key
                            </button>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500 italic">No public key available for this user.</p>
                    )}
                </div>
            </div>

            {/* Info Widget */}
            <div className="bg-white border border-gray-200 rounded-md p-4">
                <h3 className="text-md font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">Information</h3>
                <ul className="space-y-2 text-sm">
                    <li><Link to="/privacy" className="text-gray-600 hover:text-primary hover:underline">Privacy Policy</Link></li>
                    <li><Link to="/cookies" className="text-gray-600 hover:text-primary hover:underline">Cookie Policy</Link></li>
                    <li><Link to="/contact" className="text-gray-600 hover:text-primary hover:underline">Contact Us</Link></li>
                </ul>
            </div>
        </aside>

      </div>
      {authModalState.isOpen && <AuthModal initialView={authModalState.view} onClose={() => setAuthModalState({ isOpen: false, view: 'login' })} />}
    </div>
  );
};

export default UserProfilePage;
