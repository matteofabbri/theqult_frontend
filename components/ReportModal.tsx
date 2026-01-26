import React, { useState } from 'react';
import { CloseIcon } from './Icons';

interface ReportModalProps {
  entityId: string;
  entityType: 'post' | 'comment';
  onClose: () => void;
}

const reportReasons = [
  "Spam",
  "Harassment",
  "Hate Speech",
  "Illegal Content",
  "Misinformation",
  "Other"
];

const ReportModal: React.FC<ReportModalProps> = ({ entityId, entityType, onClose }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      alert("Please select a reason for your report.");
      return;
    }

    console.log({
      report: 'Content Report',
      entityType,
      entityId,
      reason: selectedReason,
      details,
      timestamp: new Date().toISOString()
    });

    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md relative border border-gray-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Report Content</h2>
        
        {isSubmitted ? (
            <div className="text-center">
                <p className="text-lg text-gray-700">Thank you for your report.</p>
                <p className="text-sm text-gray-500 mt-2">We will review it shortly. This window will close automatically.</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit}>
              <p className="text-sm text-gray-600 mb-4">Please select the reason for reporting this content. Your report is anonymous.</p>
              <div className="space-y-2 mb-4">
                {reportReasons.map(reason => (
                  <label key={reason} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <span className="ml-3 text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>
              <div className="mb-6">
                <label className="block text-gray-600 mb-2 text-sm" htmlFor="report-details">Additional Details (optional)</label>
                <textarea
                  id="report-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                  placeholder="Provide any additional information here."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 rounded-full hover:bg-gray-200">Cancel</button>
                <button type="submit" disabled={!selectedReason} className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                  Submit Report
                </button>
              </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;