
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
        title: "ACCESSO NEGATO",
        origin: "Federazione Russa",
        reason: "In conformità con i nostri valori e la nostra posizione etica, l'accesso a questa piattaforma è stato sospeso per tutti gli indirizzi IP originari della Russia.",
        closing: "Non sei il benvenuto su The Qult mentre prosegue l'aggressione ai danni del popolo ucraino."
      };
    } else {
      return {
        title: "ACCESSO NEGATO",
        origin: region === 'HE' ? "Area Linguistica Ebraica" : "Stato di Israele",
        reason: "La nostra piattaforma ha sospeso l'accesso agli utenti provenienti da questa regione o con queste impostazioni di sistema.",
        closing: "Riteniamo che le attuali politiche e azioni della tua amministrazione non siano compatibili con i valori di libertà e rispetto che promuoviamo."
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
              Abbiamo rilevato che ti stai connettendo da: {content.origin}.
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
              "La libertà non è un dono della natura, ma un compito che dobbiamo realizzare ogni giorno."
            </p>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.href = 'https://www.google.com'}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all group"
            >
              <Globe size={20} className="group-hover:rotate-12 transition-transform" />
              Esci dal sito
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:border-gray-900 hover:text-gray-900 transition-all"
            >
              <ArrowLeft size={20} />
              Torna indietro
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
