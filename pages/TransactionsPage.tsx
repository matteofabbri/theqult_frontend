
import React, { useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useStore';
import { useNavigate, Link } from 'react-router-dom';

const TransactionsPage: React.FC = () => {
  const { currentUser, getUserTransactions } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const transactions = useMemo(() => {
    if (!currentUser) return [];
    return getUserTransactions(currentUser.id);
  }, [currentUser, getUserTransactions]);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
  };

  const getTypeLabel = (type: string) => {
      switch (type) {
          case 'buy': return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Purchase</span>;
          case 'sell': return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">Withdrawal</span>;
          case 'fee_payment': return <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded">Fee Paid</span>;
          case 'fee_income': return <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">Income</span>;
          default: return <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">{type}</span>;
      }
  };

  if (!currentUser) return null;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
            <Link to="/settings" className="text-primary hover:underline text-sm mb-2 block">&larr; Back to Settings</Link>
            <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        </div>
        <div className="text-right">
            <p className="text-sm text-gray-500">Current Balance</p>
            <p className="text-xl font-bold text-primary">{currentUser.kopeki.toLocaleString()} K</p>
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
        {transactions.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Description</th>
                            <th className="px-6 py-3 text-right">Amount (Kopeki)</th>
                            <th className="px-6 py-3 text-right">Value (EUR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    {formatDate(tx.createdAt)}
                                </td>
                                <td className="px-6 py-4">
                                    {getTypeLabel(tx.type)}
                                </td>
                                <td className="px-6 py-4 text-gray-700">
                                    {tx.description}
                                </td>
                                <td className={`px-6 py-4 text-right font-bold ${tx.type === 'sell' || tx.type === 'fee_payment' ? 'text-red-600' : 'text-green-600'}`}>
                                    {tx.type === 'sell' || tx.type === 'fee_payment' ? '-' : '+'}{tx.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right text-gray-600">
                                    {tx.currencyAmount ? `€${tx.currencyAmount.toFixed(2)}` : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="p-8 text-center text-gray-500">
                No transactions found.
            </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
