
import React from 'react';

type P = { className?: string };
const I = ({ c, d, children, ...r }: P & { c?: string, d?: string, children?: React.ReactNode }) => (
  <svg className={c} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...r}>
    {d ? <path d={d}/> : children}
  </svg>
);

export const UpvoteIcon: React.FC<P> = ({ className }) => <I c={className} d="M12 5l-7 7h4v6h6v-6h4z"/>;
export const DownvoteIcon: React.FC<P> = ({ className }) => <I c={className} d="M12 19l7-7h-4v-6h-6v6H5z"/>;
export const ThumbsDownIcon: React.FC<P> = ({ className }) => <I c={className} d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.13a2 2 0 0 0-1.79 1.11L2 8v9a2 2 0 0 0 2 2h3z"/>;
export const HeartIcon: React.FC<P> = ({ className }) => <I c={className} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>;
export const CommentIcon: React.FC<P> = ({ className }) => <I c={className} d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>;
export const CreatePostIcon: React.FC<P> = ({ className }) => <I c={className}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></I>;
export const ImageFileIcon: React.FC<P> = ({ className }) => <I c={className}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></I>;
export const VideoFileIcon: React.FC<P> = ({ className }) => <I c={className}><path d="M22 10.29c.18.9.18 3.52 0 4.42-1.01 4.93-6.14 8.29-11 8.29-4.86 0-9.99-3.36-11-8.29-.18-.9-.18-3.52 0-4.42C2.01 5.36 7.14 2 12 2s9.99 3.36 11 8.29z" /><polygon points="10 15 15 12 10 9 10 15" /></I>;
export const AudioFileIcon: React.FC<P> = ({ className }) => <I c={className}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></I>;
export const CloseIcon: React.FC<P> = ({ className }) => <I c={className}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></I>;
export const SettingsIcon: React.FC<P> = ({ className }) => <I c={className}><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.5.5 0 0 0 .12-.61l-1.92-3.32a.5.5 0 0 0-.58-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.5.5 0 0 0-.5-.44h-3.84a.5.5 0 0 0-.5.44l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.5.5 0 0 0-.58.22l-1.92 3.32a.5.5 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.5.5 0 0 0-.12.61l1.92 3.32a.5.5 0 0 0 .58.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54a.5.5 0 0 0 .5.44h3.84a.5.5 0 0 0 .5-.44l.36-2.54c.59-.24 1.13-.57-1.62-.94l2.39.96a.5.5 0 0 0 .58-.22l1.92-3.32a.5.5 0 0 0-.12-.61l-2.03-1.58z"></path><circle cx="12" cy="12" r="3"></circle></I>;
export const SearchIcon: React.FC<P> = ({ className }) => <I c={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></I>;
export const CheckIcon: React.FC<P> = ({ className }) => <I c={className}><polyline points="20 6 9 17 4 12"></polyline></I>;
export const NewspaperIcon: React.FC<P> = ({ className }) => <I c={className}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12"/><path d="M8 6h8"/><path d="M8 10h8"/><path d="M8 14h4"/></I>;
export const TrendingUpIcon: React.FC<P> = ({ className }) => <I c={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></I>;
export const UsersIcon: React.FC<P> = ({ className }) => <I c={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></I>;
export const ReportIcon: React.FC<P> = ({ className }) => <I c={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></I>;
export const MessageIcon: React.FC<P> = ({ className }) => <I c={className}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></I>;
export const TrashIcon: React.FC<P> = ({ className }) => <I c={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></I>;
export const ChevronLeftIcon: React.FC<P> = ({ className }) => <I c={className}><polyline points="15 18 9 12 15 6"></polyline></I>;
export const ChevronRightIcon: React.FC<P> = ({ className }) => <I c={className}><polyline points="9 18 15 12 9 6"></polyline></I>;
export const WalletIcon: React.FC<P> = ({ className }) => <I c={className}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2z"/></I>;
export const MastercardIcon: React.FC<P> = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="12" r="7" fill="#EB001B" fillOpacity="0.8" stroke="none"/><circle cx="15" cy="12" r="7" fill="#F79E1B" fillOpacity="0.8" stroke="none"/></svg>;
export const BankIcon: React.FC<P> = ({ className }) => <I c={className}><line x1="3" y1="21" x2="21" y2="21"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M5 6l7-3 7 3"></path><path d="M4 10v11"></path><path d="M20 10v11"></path><path d="M8 14v3"></path><path d="M12 14v3"></path><path d="M16 14v3"></path></I>;
export const GiftIcon: React.FC<P> = ({ className }) => <I c={className}><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></I>;
export const LockIcon: React.FC<P> = ({ className }) => <I c={className}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></I>;
export const PlusIcon: React.FC<P> = ({ className }) => <I c={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></I>;
export const VerifiedIcon: React.FC<P> = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>;
export const PendingIcon: React.FC<P> = ({ className }) => <I c={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></I>;
export const UserPlusIcon: React.FC<P> = ({ className }) => <I c={className}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></I>;
