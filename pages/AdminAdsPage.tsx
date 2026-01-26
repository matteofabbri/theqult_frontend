
import React, { useEffect } from 'react';
import { useAuth, useData } from '../hooks/useStore';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, CloseIcon, WalletIcon } from '../components/Icons';

const AdminAdsPage: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { ads, approveAd, rejectAd, boards } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || !isAdmin(currentUser.id)) {
      navigate('/');
    }
  }, [currentUser, isAdmin, navigate]);

  const pendingAds = ads.filter(ad => ad.status === 'pending');
  const activeAds = ads.filter(ad => ad.status === 'active');

  const getBoardName = (boardId: string) => boards.find(b => b.id === boardId)?.name || 'Unknown';

  if (!currentUser || !isAdmin(currentUser.id)) return null;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ads Management</h1>

      <div className="space-y-8">
        
        {/* Pending Ads */}
        <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                Pending Requests ({pendingAds.length})
            </h2>
            
            {pendingAds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingAds.map(ad => (
                        <div key={ad.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">b/{getBoardName(ad.boardId)}</span>
                                <span className="font-bold text-gray-700 text-sm">{ad.model}</span>
                            </div>
                            <div className="flex gap-4 mb-4">
                                {ad.imageUrl && (
                                    <img src={ad.imageUrl} alt="preview" className="w-20 h-20 object-cover rounded bg-gray-50 border border-gray-100" />
                                )}
                                <div>
                                    <h3 className="font-bold text-gray-900">{ad.title}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">{ad.content}</p>
                                    <a href={ad.linkUrl} target="_blank" rel="noreferrer" className="text-xs text-primary underline mt-1 block">Link Preview</a>
                                </div>
                            </div>
                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded mb-4">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">Total Budget</p>
                                    <p className="font-bold text-gray-900">{ad.budget} K</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">Bid Amount</p>
                                    <p className="font-bold text-gray-900">{ad.bidAmount} K</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">Type</p>
                                    <p className="font-bold text-gray-900">{ad.model === 'CPM' ? 'Per 1k Views' : 'Per Click'}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => approveAd(ad.id)} className="flex-1 bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700 flex items-center justify-center gap-2">
                                    <CheckIcon className="w-4 h-4"/> Approve
                                </button>
                                <button onClick={() => rejectAd(ad.id)} className="flex-1 bg-red-100 text-red-600 py-2 rounded font-bold hover:bg-red-200 flex items-center justify-center gap-2">
                                    <CloseIcon className="w-4 h-4"/> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 border border-gray-200 rounded p-8 text-center text-gray-500">
                    No pending ad requests.
                </div>
            )}
        </div>

        {/* Active Ads */}
        <div>
             <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                Active Campaigns ({activeAds.length})
            </h2>
             {activeAds.length > 0 ? (
                 <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                     <table className="w-full text-left text-sm text-gray-600">
                         <thead className="bg-gray-50 text-gray-800 font-semibold border-b border-gray-200">
                             <tr>
                                 <th className="p-4">Title</th>
                                 <th className="p-4">Board</th>
                                 <th className="p-4">Spent / Budget</th>
                                 <th className="p-4">Perf.</th>
                                 <th className="p-4 text-right">Action</th>
                             </tr>
                         </thead>
                         <tbody>
                             {activeAds.map(ad => (
                                 <tr key={ad.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                     <td className="p-4 font-medium text-gray-900">{ad.title}</td>
                                     <td className="p-4">b/{getBoardName(ad.boardId)}</td>
                                     <td className="p-4">
                                         <span className="font-bold">{Math.floor(ad.spent)}</span> / {ad.budget} K
                                         <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1">
                                             <div className="h-1.5 bg-primary rounded-full" style={{ width: `${Math.min(100, (ad.spent/ad.budget)*100)}%` }}></div>
                                         </div>
                                     </td>
                                     <td className="p-4">
                                         <div className="flex flex-col text-xs">
                                             <span>👁 {ad.views.toLocaleString()}</span>
                                             <span>👆 {ad.clicks.toLocaleString()}</span>
                                         </div>
                                     </td>
                                     <td className="p-4 text-right">
                                        <button onClick={() => rejectAd(ad.id)} className="text-red-500 hover:text-red-700 text-xs font-bold border border-red-200 px-2 py-1 rounded hover:bg-red-50">
                                            Stop & Refund
                                        </button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             ) : (
                <div className="bg-gray-50 border border-gray-200 rounded p-8 text-center text-gray-500">
                    No active campaigns.
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default AdminAdsPage;
