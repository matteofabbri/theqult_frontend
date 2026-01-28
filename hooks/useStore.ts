
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { User, Board, Post, Comment, Vote, VoteType, Subscription, Editorial, ProfilePost, Follow, Message, MediaItem, Advertisement, Transaction, Award, CreditCard, Iban, UserSubscription } from '../types';
import { DemoContent } from '../utils/DemoContent';
import { AVAILABLE_AWARDS } from '../components/Awards';

export const getServerUrl = () => "http://localhost:3000";
export const getFlagUrl = (cc: string) => cc ? `https://flagcdn.com/w40/${cc.toLowerCase()}.png` : '';

export const getAvatarUrl = (user: User | null | undefined): string | undefined => user?.iconUrl || undefined;
export const getBannerUrl = (entity: { id: string; bannerUrl?: string } | null | undefined): string => {
    if (entity?.bannerUrl) return entity.bannerUrl;
    return `https://picsum.photos/seed/${entity?.id || 'default'}/1200/300`;
};

export const mockEncrypt = (t: string) => `ENC::${btoa(t)}`;
export const mockDecrypt = (t: string) => t.startsWith('ENC::') ? atob(t.substring(5)) : t;

export const timeAgo = (d: string) => {
    const s = Math.floor((new Date().getTime() - new Date(d).getTime()) / 1000);
    const i: Record<string, number> = { year: 31536000, month: 2592000, day: 86400, hour: 3600, minute: 60 };
    for (const [u, v] of Object.entries(i)) {
        const c = s/v; if (c > 1) return `${Math.floor(c)} ${u}s ago`;
    }
    return `${Math.floor(s)} seconds ago`;
};

// IndexedDB
const DB_NAME = 'TheQultDB', STORE_NAME = 'keyval';
const initDB = () => new Promise<IDBDatabase>((res, rej) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onerror = () => rej(r.error); r.onsuccess = () => res(r.result);
    r.onupgradeneeded = (e) => (e.target as IDBOpenDBRequest).result.createObjectStore(STORE_NAME);
});
const dbOp = async (mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest) => {
    const db = await initDB();
    return new Promise((res, rej) => {
        const r = fn(db.transaction(STORE_NAME, mode).objectStore(STORE_NAME));
        r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
};
const dbGet = <T,>(k: string) => dbOp('readonly', s => s.get(k)).catch(console.error) as Promise<T|undefined>;
const dbSet = (k: string, v: any) => dbOp('readwrite', s => s.put(v, k)).catch(console.error);

function usePersistentState<T>(key: string, initialValue: T) {
  const [val, setVal] = useState<T>(initialValue), [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let m = true; dbGet<T>(key).then(v => { if(m) { if(v !== undefined) setVal(v); setLoaded(true); }});
    return () => { m = false; };
  }, [key]);
  const setValue = useCallback((v: T | ((old: T) => T)) => {
    setVal(old => { const n = v instanceof Function ? v(old) : v; dbSet(key, n); return n; });
  }, [key]);
  return { value: val, setValue, isLoaded: loaded };
}

interface AuthContextType {
  currentUser: User | null; users: User[]; transactions: Transaction[];
  login: (u: string, p: string) => boolean; register: (u: string, p: string) => { success: boolean, message: string }; logout: () => void;
  getUserById: (id: string) => User | undefined; getUserByUsername: (u: string) => User | undefined; isAdmin: (id: string) => boolean;
  changePassword: (o: string, n: string) => { success: boolean, message: string }; updateProfile: (d: any) => { success: boolean; message: string; };
  moveConversationToJunk: (id: string) => void; moveConversationToInbox: (id: string) => void;
  // Added missing methods for AuthContextType
  buyKopeki: (a: number) => { success: boolean; message: string; }; sellKopeki: (a: number) => { success: boolean; message: string; };
  addCreditCard: (c: any) => any; removeCreditCard: (id: string) => any; addIban: (i: any) => any; removeIban: (id: string) => any;
  getUserTransactions: (id: string) => Transaction[];
}

interface DataContextType {
  boards: Board[]; posts: Post[]; profilePosts: ProfilePost[]; editorials: Editorial[]; comments: Comment[]; messages: Message[]; votes: Vote[]; subscriptions: Subscription[]; follows: Follow[]; ads: Advertisement[]; awards: Award[];
  createBoard: (n: string, d: string, ac: boolean, ap: boolean, pw?: string, inv?: boolean, iconUrl?: string, bannerUrl?: string, entryFee?: number) => any;
  createPost: (t: string, c: string, b: string, m?: MediaItem[]) => Post | null; createProfilePost: (t: string, c: string, m?: MediaItem[], p?: number) => ProfilePost | null; createEditorial: (t: string, c: string, m?: MediaItem[]) => Editorial | null;
  updatePost: (id: string, t: string, c: string) => boolean; updateProfilePost: (id: string, t: string, c: string) => boolean; updateEditorial: (id: string, t: string, c: string) => boolean; updateBoard: (id: string, d: any) => any;
  addComment: (c: string, pid: string, paid?: string | null, m?: MediaItem[]) => Comment | null; castVote: (eid: string, t: VoteType) => void; getBoardByName: (n: string) => Board | undefined;
  deletePost: (id: string) => void; deleteProfilePost: (id: string) => void; deleteEditorial: (id: string) => void; deleteComment: (id: string) => void;
  appointModerator: (bid: string, u: string) => any; isModerator: (uid: string, bid: string) => boolean; appointAdmin: (bid: string, u: string) => any; isBoardAdmin: (uid: string, bid: string) => boolean;
  inviteUserToBoard: (bid: string, u: string) => any; removeUserFromBoard: (bid: string, uid: string) => any; subscribe: (bid: string) => void; unsubscribe: (bid: string) => void; isSubscribed: (bid: string) => boolean;
  followUser: (id: string) => void; unfollowUser: (id: string) => void; isFollowing: (id: string) => boolean; sendMessage: (rid: string, c: string, m?: MediaItem[], k?: number) => any; markConversationAsRead: (uid: string) => void;
  unlockBoard: (bid: string, pw: string) => boolean; isBoardUnlocked: (bid: string) => boolean;
  // Added missing methods for DataContextType
  createAd: (bid: string, t: string, c: string, l: string, i: string, b: number, m: any, ba: number) => any; approveAd: (id: string) => void; rejectAd: (id: string) => void; trackAdImpression: (id: string) => void; trackAdClick: (id: string) => void; getActiveAdsForBoard: (bid: string) => Advertisement[];
  respondToBoardInvite: (msgId: string, action: 'accept' | 'reject') => void;
  giveAward: (eid: string, et: any, aid: string, rid: string) => any; unlockProfilePost: (pid: string) => any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const DataContext = createContext<DataContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const usersS = usePersistentState<User[]>('r-users', []), boardsS = usePersistentState<Board[]>('r-boards', []), postsS = usePersistentState<Post[]>('r-posts', []), pPostsS = usePersistentState<ProfilePost[]>('r-profile-posts', []);
  const editsS = usePersistentState<Editorial[]>('r-editorials', []), commsS = usePersistentState<Comment[]>('r-comments', []), msgsS = usePersistentState<Message[]>('r-messages', []), votesS = usePersistentState<Vote[]>('r-votes', []);
  const subsS = usePersistentState<Subscription[]>('r-subscriptions', []), followsS = usePersistentState<Follow[]>('r-follows', []);
  const adsS = usePersistentState<Advertisement[]>('r-ads', []), curUserS = usePersistentState<User | null>('r-currentUser', null);
  // Added missing state
  const txS = usePersistentState<Transaction[]>('r-transactions', []), awardS = usePersistentState<Award[]>('r-awards', []);
  
  const [users, setUsers] = [usersS.value, usersS.setValue], [boards, setBoards] = [boardsS.value, boardsS.setValue], [posts, setPosts] = [postsS.value, postsS.setValue];
  const [profilePosts, setProfilePosts] = [pPostsS.value, pPostsS.setValue], [editorials, setEditorials] = [editsS.value, editsS.setValue], [comments, setComments] = [commsS.value, commsS.setValue];
  const [messages, setMessages] = [msgsS.value, msgsS.setValue], [votes, setVotes] = [votesS.value, votesS.setValue], [subscriptions, setSubscriptions] = [subsS.value, subsS.setValue];
  const [follows, setFollows] = [followsS.value, followsS.setValue], [ads, setAds] = [adsS.value, adsS.setValue], [currentUser, setCurrentUser] = [curUserS.value, curUserS.setValue];
  const [transactions, setTransactions] = [txS.value, txS.setValue], [awards, setAwards] = [awardS.value, awardS.setValue];
  const [unlockedBoards, setUnlockedBoards] = useState<string[]>([]), [isInit, setIsInit] = useState(true);

  useEffect(() => {
    if (usersS.isLoaded && boardsS.isLoaded && postsS.isLoaded && curUserS.isLoaded) {
        if (users.length === 0) { 
            const d = DemoContent.getInitialData(); 
            setUsers(d.users); setBoards(d.boards); setPosts(d.posts); setProfilePosts(d.profilePosts); setEditorials(d.editorials); setComments(d.comments); setMessages(d.messages); setVotes(d.votes); setSubscriptions(d.subscriptions); setFollows(d.follows); setAds(d.ads); 
        }
        setIsInit(false);
    }
  }, [usersS.isLoaded, boardsS.isLoaded, postsS.isLoaded, curUserS.isLoaded, users.length]);

  const login = (u: string, p: string) => { 
      const user = users.find(x => x.username === u && x.password === p);
      if (user) setCurrentUser(user); 
      return !!user; 
  };
  
  const register = (u: string, p: string) => {
      if (users.some(x => x.username === u)) return { success: false, message: 'Username taken' };
      const nu: User = { 
        id: crypto.randomUUID(), username: u, password: p, role: 'user', createdAt: new Date().toISOString(), 
        publicKey: DemoContent.generateMockPublicKey(), kopeki: 1000, isVerified: false, isPendingVerification: false, 
        savedCards: [], savedIbans: [], junkSenders: [] 
      };
      setUsers(prev => [...prev, nu]);
      setCurrentUser(nu);
      return { success: true, message: 'OK' };
  };

  const logout = () => { setCurrentUser(null); setUnlockedBoards([]); };
  const getUserById = (id: string) => users.find(u => u.id === id);
  const getUserByUsername = (u: string) => users.find(x => x.username.toLowerCase() === u.toLowerCase());
  const isAdmin = (id: string) => users.find(u => u.id === id)?.role === 'admin';
  
  const changePassword = (o: string, n: string) => {
      if(!currentUser || currentUser.password !== o) return { success: false, message: 'Incorrect' };
      const updatedUser = { ...currentUser, password: n };
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
      setCurrentUser(updatedUser);
      return { success: true, message: 'OK' };
  };

  const updateProfile = (d: any) => {
      if(!currentUser) return { success: false, message: 'Login required' };
      const updatedUser = { ...currentUser, ...d };
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
      setCurrentUser(updatedUser);
      return { success: true, message: 'OK' };
  };

  const moveConversationToJunk = (id: string) => { 
      if(currentUser) {
          const newJunk = [...new Set([...(currentUser.junkSenders || []), id])];
          const updatedUser = { ...currentUser, junkSenders: newJunk };
          setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
          setCurrentUser(updatedUser);
      } 
  };
  const moveConversationToInbox = (id: string) => { 
      if(currentUser) { 
          const updatedUser = { ...currentUser, junkSenders: (currentUser.junkSenders || []).filter(jid => jid !== id) };
          setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
          setCurrentUser(updatedUser);
      } 
  };

  // Wallet Logic Implementation
  const buyKopeki = (a: number) => {
    if(!currentUser) return {success:false, message:'Login'};
    const updatedUser = { ...currentUser, kopeki: (currentUser.kopeki || 0) + a };
    const tx: Transaction = { id: crypto.randomUUID(), userId: currentUser.id, type: 'buy', amount: a, currencyAmount: parseFloat((a/10000).toFixed(2)), description: `Bought ${a.toLocaleString()} Kopeki`, createdAt: new Date().toISOString() };
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    setTransactions(prev => [tx, ...prev]);
    setCurrentUser(updatedUser);
    return { success: true, message: 'OK' };
  };

  const sellKopeki = (a: number) => {
    if(!currentUser) return {success:false, message:'Login'};
    if ((currentUser.kopeki || 0) < a) return { success: false, message: 'Insufficient funds' };
    const updatedUser = { ...currentUser, kopeki: (currentUser.kopeki || 0) - a };
    const tx: Transaction = { id: crypto.randomUUID(), userId: currentUser.id, type: 'sell', amount: a, currencyAmount: parseFloat((a/10000).toFixed(2)), description: `Sold ${a.toLocaleString()} Kopeki`, createdAt: new Date().toISOString() };
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    setTransactions(prev => [tx, ...prev]);
    setCurrentUser(updatedUser);
    return { success: true, message: 'OK' };
  };

  const addCreditCard = (c: any) => { if(!currentUser) return; const card = { ...c, id: crypto.randomUUID() }; const updatedUser = { ...currentUser, savedCards: [...(currentUser.savedCards || []), card] }; setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u)); setCurrentUser(updatedUser); return {success:true}; };
  const removeCreditCard = (id: string) => { if(!currentUser) return; const updatedUser = { ...currentUser, savedCards: (currentUser.savedCards || []).filter(c => c.id !== id) }; setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u)); setCurrentUser(updatedUser); return {success:true}; };
  const addIban = (i: any) => { if(!currentUser) return; const iban = { ...i, id: crypto.randomUUID() }; const updatedUser = { ...currentUser, savedIbans: [...(currentUser.savedIbans || []), iban] }; setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u)); setCurrentUser(updatedUser); return {success:true, message:'OK'}; };
  const removeIban = (id: string) => { if(!currentUser) return; const updatedUser = { ...currentUser, savedIbans: (currentUser.savedIbans || []).filter(i => i.id !== id) }; setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u)); setCurrentUser(updatedUser); return {success:true}; };
  const getUserTransactions = (id: string) => transactions.filter(t => t.userId === id);

  const createBoard = (name: string, description: string, allowAnonymousComments: boolean, allowAnonymousPosts: boolean, password?: string, isInviteOnly?: boolean, iconUrl?: string, bannerUrl?: string, entryFee?: number) => {
      if(!currentUser) return {success:false, message:'Login'};
      if (boards.some(b => b.name.toLowerCase() === name.toLowerCase())) return { success: false, message: 'Taken' };
      const b: Board = { id: crypto.randomUUID(), name, description, allowAnonymousComments, allowAnonymousPosts, password, isInviteOnly, entryFee: entryFee || 0, creatorId: currentUser.id, createdAt: new Date().toISOString(), moderatorIds: [], adminIds: [currentUser.id], allowedUserIds: (isInviteOnly || (entryFee || 0) > 0) ? [currentUser.id] : [] };
      setBoards(o => [...o, b]);
      setSubscriptions(o => [...o, { userId: currentUser.id, boardId: b.id }]);
      return { success: true, message: 'OK', board: b };
  };

  const updateBoard = (id: string, d: any) => {
      if(!currentUser) return {success:false, message:'Login'};
      setBoards(prev => prev.map(b => b.id === id ? { ...b, ...d } : b));
      return { success: true, message: 'OK' };
  };

  const createPost = (title: string, content: string, boardId: string, media?: MediaItem[]) => {
      const aid = currentUser?.id || null;
      if(!aid && !boards.find(b=>b.id===boardId)?.allowAnonymousPosts) return null;
      const p: Post = { id: crypto.randomUUID(), title, content, media: media||[], boardId, authorId: aid, createdAt: new Date().toISOString() };
      setPosts(o => [p, ...o]); return p;
  };

  const createProfilePost = (title: string, content: string, media?: MediaItem[], price?: number) => {
      if(!currentUser) return null;
      const p: ProfilePost = { id: crypto.randomUUID(), title, content, media: media||[], authorId: currentUser.id, createdAt: new Date().toISOString(), price: price || 0, unlockedUserIds: [] };
      setProfilePosts(o => [p, ...o]); return p;
  };

  const createEditorial = (title: string, content: string, media?: MediaItem[]) => {
      if(!currentUser || !isAdmin(currentUser.id)) return null;
      const e: Editorial = { id: crypto.randomUUID(), title, content, media: media||[], authorId: currentUser.id, createdAt: new Date().toISOString() };
      setEditorials(o => [e, ...o]); return e;
  };

  const updatePost = (id: string, t: string, c: string) => { setPosts(prev => prev.map(p => p.id === id ? { ...p, title: t, content: c } : p)); return true; };
  const updateProfilePost = (id: string, t: string, c: string) => { setProfilePosts(prev => prev.map(p => p.id === id ? { ...p, title: t, content: c } : p)); return true; };
  const updateEditorial = (id: string, t: string, c: string) => { setEditorials(prev => prev.map(p => p.id === id ? { ...p, title: t, content: c } : p)); return true; };

  const addComment = (content: string, postId: string, parentId: string|null = null, media?: MediaItem[]) => {
      const aid = currentUser?.id || null;
      const c: Comment = { id: crypto.randomUUID(), content, postId, authorId: aid, parentId, createdAt: new Date().toISOString(), media: media||[] };
      setComments(o => [...o, c]); return c;
  };

  const castVote = (eid: string, t: VoteType) => { 
      let uid = currentUser?.id || localStorage.getItem('qult_anon_id') || 'anon-' + crypto.randomUUID();
      if (!currentUser) localStorage.setItem('qult_anon_id', uid);
      setVotes(prev => {
          const idx = prev.findIndex(v => v.userId === uid && v.entityId === eid);
          if (idx > -1) {
              if (prev[idx].type === t) return prev.filter((_, i) => i !== idx); 
              const n = [...prev]; n[idx] = { ...n[idx], type: t }; return n; 
          }
          return [...prev, { userId: uid!, entityId: eid, type: t }];
      }); 
  };

  const getBoardByName = (n: string) => boards.find(b => b.name.toLowerCase() === n.toLowerCase());
  const deletePost = (id: string) => { setPosts(o => o.filter(p => p.id !== id)); setComments(o => o.filter(c => c.postId !== id)); };
  const deleteProfilePost = (id: string) => { setProfilePosts(o => o.filter(p => p.id !== id)); };
  const deleteEditorial = (id: string) => { setEditorials(o => o.filter(e => e.id !== id)); };
  const deleteComment = (id: string) => { setComments(o => o.filter(c => c.id !== id && c.parentId !== id)); };

  const appointModerator = (bid: string, u: string) => {
      const uid = getUserByUsername(u)?.id; if(!uid) return {success:false, message:'No user'}; 
      setBoards(o => o.map(b => b.id === bid ? {...b, moderatorIds: [...b.moderatorIds, uid]} : b)); return {success:true, message:'OK'};
  };
  const isModerator = (uid: string, bid: string) => boards.find(b => b.id === bid)?.moderatorIds.includes(uid) || false;
  const appointAdmin = (bid: string, u: string) => {
      const uid = getUserByUsername(u)?.id; if(!uid) return {success:false, message:'No user'}; 
      setBoards(o => o.map(b => b.id === bid ? {...b, adminIds: [...b.adminIds, uid]} : b)); return {success:true, message:'OK'};
  };
  const isBoardAdmin = (uid: string, bid: string) => boards.find(b => b.id === bid)?.adminIds.includes(uid) || false;
  
  const inviteUserToBoard = (bid: string, u: string) => { 
      if(!currentUser) return {success:false, message: 'Login'};
      const board = boards.find(b => b.id === bid);
      const userToInvite = users.find(x => x.username.toLowerCase() === u.toLowerCase());
      if (!board || !userToInvite) return { success: false, message: 'Not found' };
      const inviteMsg: Message = { id: crypto.randomUUID(), senderId: currentUser.id, recipientId: userToInvite.id, content: `Join b/${board.name}`, createdAt: new Date().toISOString(), type: 'board_invite', metadata: { boardId: board.id, boardName: board.name, inviteStatus: 'pending' } };
      setMessages(o => [...o, inviteMsg]);
      return { success: true, message: 'Sent' }; 
  };

  const respondToBoardInvite = (msgId: string, action: 'accept' | 'reject') => {
      const msg = messages.find(m => m.id === msgId);
      if (!msg || msg.type !== 'board_invite' || !msg.metadata?.boardId) return;
      if (action === 'accept') setBoards(prev => prev.map(b => b.id === msg.metadata!.boardId ? { ...b, allowedUserIds: [...(b.allowedUserIds || []), msg.recipientId] } : b));
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, metadata: { ...m.metadata, inviteStatus: action === 'accept' ? 'accepted' : 'rejected' } } : m));
  };

  const removeUserFromBoard = (bid: string, uid: string) => { 
      setBoards(o => o.map(b => b.id === bid ? {...b, allowedUserIds: (b.allowedUserIds||[]).filter(x => x!==uid)} : b)); return {success:true}; 
  };

  const subscribe = (bid: string) => { 
      if(currentUser) {
          const exists = subscriptions.some(s => s.userId === currentUser.id && s.boardId === bid);
          if (exists) setSubscriptions(o => o.filter(s => !(s.userId === currentUser.id && s.boardId === bid)));
          else setSubscriptions(o => [...o, { userId: currentUser.id, boardId: bid }]);
      }
  };
  const unsubscribe = (bid: string) => subscribe(bid); 
  const isSubscribed = (bid: string) => !!currentUser && subscriptions.some(s => s.userId === currentUser.id && s.boardId === bid);

  const followUser = (id: string) => { 
      if(currentUser) {
          const exists = follows.some(f => f.followerId === currentUser.id && f.followingId === id);
          if (exists) setFollows(o => o.filter(f => !(f.followerId === currentUser.id && f.followingId === id)));
          else setFollows(o => [...o, { followerId: currentUser.id, followingId: id }]);
      }
  };
  const unfollowUser = (id: string) => followUser(id); 
  const isFollowing = (id: string) => !!currentUser && follows.some(f => f.followerId === currentUser.id && f.followingId === id);

  const sendMessage = (rid: string, c: string, m?: MediaItem[], k?: number) => {
      if(!currentUser) return {success:false};
      const recipient = users.find(u => u.id === rid);
      if(!recipient) return {success:false};
      const msg: Message = { id: crypto.randomUUID(), senderId: currentUser.id, recipientId: rid, content: (recipient.publicKey && c) ? mockEncrypt(c) : c, media: m, isEncrypted: !!(recipient.publicKey && c), createdAt: new Date().toISOString(), type: 'text', kopekiAmount: k };
      setMessages(o => [...o, msg]);
      return { success: true, message: msg };
  };
  const markConversationAsRead = (uid: string) => { 
      if(currentUser) setMessages(o => o.map(m => (!m.readAt && m.recipientId === currentUser.id && m.senderId === uid) ? {...m, readAt: new Date().toISOString()} : m)); 
  };

  const unlockBoard = (bid: string, pw: string) => { const b = boards.find(x => x.id === bid); if(b && b.password === pw) { setUnlockedBoards(o => [...o, bid]); return true; } return false; };
  const isBoardUnlocked = (bid: string) => {
      const b = boards.find(x => x.id === bid); if(!b) return false;
      if(currentUser && (isAdmin(currentUser.id) || isBoardAdmin(currentUser.id, bid) || isModerator(currentUser.id, bid))) return true;
      if(b.isInviteOnly) return !!currentUser && (b.allowedUserIds||[]).includes(currentUser.id);
      return b.password ? unlockedBoards.includes(bid) : true;
  };

  const createAd = (bid: string, t: string, c: string, l: string, i: string, b: number, m: any, ba: number) => {
      if(!currentUser) return {success:false};
      const ad: Advertisement = { id: crypto.randomUUID(), userId: currentUser.id, boardId: bid, title: t, content: c, linkUrl: l, imageUrl: i, status: 'pending', views: 0, clicks: 0, createdAt: new Date().toISOString(), budget: b, model: m, bidAmount: ba, spent: 0 };
      setAds(o => [...o, ad]);
      return { success: true, message: 'Pending' };
  };

  const approveAd = (id: string) => setAds(o => o.map(a => a.id === id ? {...a, status: 'active'} : a)); 
  const rejectAd = (id: string) => setAds(prev => prev.map(a => a.id === id ? {...a, status: 'rejected'} : a));
  const trackAdImpression = (id: string) => setAds(o => o.map(a => (a.id === id && a.status === 'active') ? {...a, views: a.views + 1, spent: a.spent + (a.model === 'CPM' ? a.bidAmount / 1000 : 0)} : a));
  const trackAdClick = (id: string) => setAds(o => o.map(a => (a.id === id && a.status === 'active') ? {...a, clicks: a.clicks + 1, spent: a.spent + (a.model === 'CPC' ? a.bidAmount : 0)} : a));
  const getActiveAdsForBoard = (bid: string) => ads.filter(a => a.boardId === bid && a.status === 'active');

  const giveAward = (eid: string, et: any, aid: string, rid: string) => {
    if(!currentUser) return {success:false, message:'Login'};
    const awardDef = AVAILABLE_AWARDS.find(a => a.id === aid);
    if (!awardDef) return {success:false, message:'Invalid award'};
    if ((currentUser.kopeki || 0) < awardDef.cost) return {success:false, message:'Insufficient Kopeki'};

    const receiver = users.find(u => u.id === rid);
    if (!receiver) return {success:false, message:'Receiver not found'};

    const updatedSender = { ...currentUser, kopeki: (currentUser.kopeki || 0) - awardDef.cost };
    const updatedReceiver = { ...receiver, kopeki: (receiver.kopeki || 0) + awardDef.cost };

    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedSender : u.id === receiver.id ? updatedReceiver : u));
    setCurrentUser(updatedSender);

    const award: Award = { id: crypto.randomUUID(), typeId: aid, senderId: currentUser.id, receiverId: rid, entityId: eid, entityType: et, createdAt: new Date().toISOString() };
    setAwards(o => [...o, award]);

    setTransactions(prev => [
        { id: crypto.randomUUID(), userId: currentUser.id, type: 'award_given', amount: awardDef.cost, description: `Gave ${awardDef.label}`, createdAt: new Date().toISOString() },
        { id: crypto.randomUUID(), userId: receiver.id, type: 'award_received', amount: awardDef.cost, description: `Received ${awardDef.label}`, createdAt: new Date().toISOString() },
        ...prev
    ]);
    return { success: true, message: 'OK' };
  };

  const unlockProfilePost = (pid: string) => {
    if(!currentUser) return {success:false, message:'Login'};
    const post = profilePosts.find(p => p.id === pid);
    if(!post || !post.price) return {success:false};
    if((currentUser.kopeki || 0) < post.price) return {success:false, message:'Insufficient funds'};

    const author = users.find(u => u.id === post.authorId);
    if(!author) return {success:false, message:'Author error'};

    const updatedUser = { ...currentUser, kopeki: (currentUser.kopeki || 0) - post.price };
    const updatedAuthor = { ...author, kopeki: (author.kopeki || 0) + post.price };

    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u.id === author.id ? updatedAuthor : u));
    setCurrentUser(updatedUser);
    setProfilePosts(prev => prev.map(p => p.id === pid ? { ...p, unlockedUserIds: [...(p.unlockedUserIds||[]), currentUser.id] } : p));

    setTransactions(prev => [
        { id: crypto.randomUUID(), userId: currentUser.id, type: 'post_unlock', amount: post.price!, description: `Unlocked post`, createdAt: new Date().toISOString() },
        { id: crypto.randomUUID(), userId: author.id, type: 'post_income', amount: post.price!, description: `Post unlocked by ${currentUser.username}`, createdAt: new Date().toISOString() },
        ...prev
    ]);
    return { success: true, message: 'OK' };
  };

  const authCtx = useMemo(() => ({ currentUser, users, transactions, login, register, logout, getUserById, getUserByUsername, isAdmin, changePassword, updateProfile, moveConversationToJunk, moveConversationToInbox, buyKopeki, sellKopeki, addCreditCard, removeCreditCard, addIban, removeIban, getUserTransactions }), [currentUser, users, transactions]);
  const dataCtx = useMemo(() => ({ boards, posts, profilePosts, editorials, comments, messages, votes, subscriptions, follows, ads, awards, createBoard, createPost, createProfilePost, createEditorial, updatePost, updateProfilePost, updateEditorial, updateBoard, addComment, castVote, getBoardByName, deletePost, deleteProfilePost, deleteEditorial, deleteComment, appointModerator, isModerator, appointAdmin, isBoardAdmin, inviteUserToBoard, removeUserFromBoard, subscribe, unsubscribe, isSubscribed, followUser, unfollowUser, isFollowing, sendMessage, markConversationAsRead, unlockBoard, isBoardUnlocked, createAd, approveAd, rejectAd, trackAdImpression, trackAdClick, getActiveAdsForBoard, respondToBoardInvite, giveAward, unlockProfilePost }), [boards, posts, profilePosts, editorials, comments, messages, votes, subscriptions, follows, ads, awards, currentUser, users]);

  if (isInit) return React.createElement('div', { className: "h-screen flex items-center justify-center" }, "Loading...");
  return React.createElement(AuthContext.Provider, { value: authCtx }, React.createElement(DataContext.Provider, { value: dataCtx }, children));
};

export const useAuth = () => { const c = useContext(AuthContext); if(!c) throw new Error(); return c; };
export const useData = () => { const c = useContext(DataContext); if(!c) throw new Error(); return c; };
