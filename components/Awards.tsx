import React from 'react';

type IconProps = { className?: string };

// --- ICON DEFINITIONS ---

const SilverCoin: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" opacity="0.3"/><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6a1 1 0 0 0-1 1v1.08A2.91 2.91 0 0 0 9 11a1 1 0 0 0 2 0 1 1 0 0 1 1-1h1a1 1 0 0 1 0 2h-1a3 3 0 0 0-3 3 2.91 2.91 0 0 0 2 2.92V17a1 1 0 0 0 2 0v-1.08A2.91 2.91 0 0 0 15 13a1 1 0 0 0-2 0 1 1 0 0 1-1 1h-1a1 1 0 0 1 0-2h1a3 3 0 0 0 3-3 2.91 2.91 0 0 0-2-2.92V7a1 1 0 0 0-1-1z"/></svg>
);

const Facepalm: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity="0.2"/><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M15 9h-2a1 1 0 0 0-1 1v1a1 1 0 0 1-2 0v-1a3 3 0 0 1 3-3h2a1 1 0 0 1 0 2z"/><circle cx="9" cy="10" r="1.5"/><path d="M14.5 15.5a3.5 3.5 0 0 1-5 0"/></svg>
);

const Heart: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
);

const Poop: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-2.5 0-4.5 2.5-4.5 5S9 10 10 11c-2 0-4.5 1.5-4.5 4s2 3.5 4 4c-1 1-1 2.5 0 3s2.5.5 3.5 0 2.5-1 3.5 0 1-2 0-3c2-.5 4-1.5 4-4s-2.5-4-4.5-4c1-1 2.5-1.5 2.5-4S14.5 2 12 2z"/></svg>
);

const Like: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"/></svg>
);

const Fire: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/></svg>
);

const Rocket: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5s-6 8.5-6 13.5c0 3.5 2.5 5.5 6 5.5s6-2 6-5.5S12 2.5 12 2.5zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" /><path d="M4 16s2-1 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M20 16s-2-1-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
);

const Brain: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 4a4 4 0 0 0-3.5 6A4 4 0 0 0 6 12a4 4 0 0 0 1.1 2.8A4 4 0 0 0 6 18a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2 4 4 0 0 0-1.1-3.2A4 4 0 0 0 18 12a4 4 0 0 0-2.5-2 4 4 0 0 0-3.5-6z"/></svg>
);

const Beer: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h12v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zm12-2H4a2 2 0 0 0-2 2v12a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V6a2 2 0 0 0-2-2zm2 4h2v8h-2V8zM6 2h2v2H6V2zm4 0h2v2h-2V2zm4 0h2v2h-2V2z"/></svg>
);

const Rose: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C9 2 7 4 7 6c0 1.5 1 2.5 2 3 0 2-2 3-2 3s3 2 5 2 5-2 5-2-2-1-2-3c1-.5 2-1.5 2-3 0-2-2-4-5-4zm0 10c-1 0-2 1-2 2 0 3 2 8 2 8s2-5 2-8c0-1-1-2-2-2z"/></svg>
);

const Gem: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 15 10-15L12 2zm0 2.8L18.5 8H5.5L12 4.8zM4.2 9h15.6l-7.8 11.7L4.2 9z"/></svg>
);

const Crown: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5v-2z"/></svg>
);

const Trophy: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>
);

const Muscle: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19.57 13.73A6 6 0 0 0 17.7 6.66c-1.3-1-3.28-.72-4.57.62-1.29-1.34-3.27-1.62-4.57-.62a6 6 0 0 0-1.87 7.07A5.5 5.5 0 0 0 2 19v1h20v-1a5.5 5.5 0 0 0-2.43-5.27z"/></svg>
);

const Stark: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4"/><path d="M12 2L9 8l-6 2 5 4-2 7 6-3 6 3-2-7 5-4-6-2-3-6z" opacity="0.2"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zm0-12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
);

const Diamond: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M6 2l-3.5 6L12 22l9.5-14L18 2H6zm.5 5.5L12 4l5.5 3.5-2.5 4.5h-6L6.5 7.5z"/></svg>
);

const Illuminati: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 3.5L19.5 19H4.5L12 5.5z"/><circle cx="12" cy="14" r="2"/><path d="M12 10a4 4 0 0 0-4 4h8a4 4 0 0 0-4-4z"/></svg>
);

const Time: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0 2A10 10 0 1 1 12 2a10 10 0 0 1 0 20z"/><path d="M12 6v6l4 2"/></svg>
);

const Galaxy: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/><circle cx="4" cy="4" r="1"/><circle cx="20" cy="20" r="1"/><circle cx="20" cy="4" r="1"/><circle cx="4" cy="20" r="1"/></svg>
);

const TheQult: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M12 2a10 10 0 0 1 10 10h-2a8 8 0 0 0-8-8V2z"/><path d="M12 12L2 2"/><circle cx="12" cy="12" r="4"/></svg>
);

// --- EXPORTED DATA STRUCTURE ---

export interface AwardDef {
    id: string;
    label: string;
    cost: number;
    icon: React.FC<IconProps>;
    color: string;
    description?: string;
}

export const AVAILABLE_AWARDS: AwardDef[] = [
    // Tier 1: Reactions (100 - 500 K)
    { id: 'silver', label: 'Silver', cost: 100, icon: SilverCoin, color: 'text-gray-400', description: 'A small token of appreciation.' },
    { id: 'facepalm', label: 'Facepalm', cost: 150, icon: Facepalm, color: 'text-orange-400', description: 'Seriously?' },
    { id: 'like', label: 'Solid', cost: 250, icon: Like, color: 'text-blue-500', description: 'I agree with this.' },
    { id: 'heart', label: 'Love', cost: 300, icon: Heart, color: 'text-red-500', description: 'Much love.' },
    { id: 'poop', label: 'Shitpost', cost: 500, icon: Poop, color: 'text-amber-800', description: 'Quality 💩.' },

    // Tier 2: Appreciation (1000 - 5000 K)
    { id: 'beer', label: 'Cheers', cost: 1000, icon: Beer, color: 'text-yellow-500', description: 'Have a drink on me.' },
    { id: 'brain', label: 'Big Brain', cost: 1500, icon: Brain, color: 'text-pink-400', description: 'High IQ moment.' },
    { id: 'rose', label: 'Rose', cost: 2000, icon: Rose, color: 'text-red-600', description: 'Romantic or classy.' },
    { id: 'rocket', label: 'To The Moon', cost: 2500, icon: Rocket, color: 'text-purple-600', description: 'This is going places.' },
    { id: 'fire', label: 'Lit', cost: 5000, icon: Fire, color: 'text-orange-600', description: 'Absolutely fire.' },

    // Tier 3: Prestige (10k - 50k K)
    { id: 'muscle', label: 'Strong', cost: 10000, icon: Muscle, color: 'text-amber-600', description: 'A powerful statement.' },
    { id: 'gem', label: 'Gem', cost: 15000, icon: Gem, color: 'text-cyan-400', description: 'A rare find.' },
    { id: 'stark', label: 'Tech Mogul', cost: 25000, icon: Stark, color: 'text-blue-400', description: 'Futuristic genius.' },
    { id: 'crown', label: 'King', cost: 35000, icon: Crown, color: 'text-yellow-400', description: 'You dropped this 👑.' },
    { id: 'trophy', label: 'Champion', cost: 50000, icon: Trophy, color: 'text-yellow-600', description: 'The best of the best.' },

    // Tier 4: Elite (100k+ K)
    { id: 'time', label: 'Timeless', cost: 100000, icon: Time, color: 'text-teal-500', description: 'This will go down in history.' },
    { id: 'diamond', label: 'Unbreakable', cost: 150000, icon: Diamond, color: 'text-indigo-300', description: 'Forever valuable.' },
    { id: 'galaxy', label: 'Universal', cost: 250000, icon: Galaxy, color: 'text-purple-900', description: 'Your reach is infinite.' },
    { id: 'illuminati', label: 'All Seeing', cost: 500000, icon: Illuminati, color: 'text-green-500', description: 'You know the truth.' },
    { id: 'qult', label: 'The Qult', cost: 1000000, icon: TheQult, color: 'text-primary', description: 'The ultimate honor.' },
];
