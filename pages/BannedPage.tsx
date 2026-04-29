
import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Globe, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BannedPage: React.FC = () => {
  const navigate = useNavigate();
  const region = sessionStorage.getItem('detected_banned_region') || 'RU';

  const getMessage = () => {
    if (region === 'RU') {
      return {
        title: "ACCESS DENIED",
        origin: "Russian Federation",
        reason: "In accordance with our values and ethical stance, access to this platform has been suspended for all IP addresses originating from Russia.",
        closing: "You are not welcome on The Qult while the aggression against the Ukrainian people continues."
      };
    } else {
      return {
        title: "ACCESS DENIED",
        origin: region === 'HE' ? "Hebrew Language Area" : "State of Israel",
        reason: "Our platform has suspended access for users from this region or with these system settings.",
        closing: "We believe that the current policies and actions in your region are not compatible with the values of freedom and respect that we promote."
      };
    }
  };

  const content = getMessage();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gray-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-red-100"
      >
        <div className="bg-red-600 p-8 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ShieldAlert size={80} className="text-white" />
          </motion.div>
        </div>
        
        <div className="p-10 text-center">
          <h1 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">
            {content.title}
          </h1>
          
          <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
            <p className="font-semibold text-red-600">
              We detected that you are connecting from: {content.origin}.
            </p>
            
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-sm text-left font-mono">
              <p>
                {content.reason}
              </p>
              <p className="mt-4">
                {content.closing}
              </p>
            </div>

            <p className="text-sm italic">
              "Freedom is not a gift of nature, but a task that we must realize every day."
            </p>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.href = 'https://www.google.com'}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all group"
            >
              <Globe size={20} className="group-hover:rotate-12 transition-transform" />
              Leave website
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:border-gray-900 hover:text-gray-900 transition-all"
            >
              <ArrowLeft size={20} />
              Go back
            </button>
          </div>
        </div>
        
        <div className="bg-gray-900 py-3 px-8 text-[10px] text-gray-500 font-mono flex justify-between uppercase tracking-widest">
          <span>IP_RESTRICTION_ID: RU_OFF_77</span>
          <span>Status: Connection Rejected</span>
        </div>
      </motion.div>
    </div>
  );
};

export default BannedPage;
