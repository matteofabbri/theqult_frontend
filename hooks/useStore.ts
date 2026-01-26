
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { User, Board, Post, Comment, Vote, VoteType, Subscription, Editorial, ProfilePost, Follow, Message, CreditCard, Iban, Transaction, MediaItem, UserSubscription, Award, Advertisement } from '../types';
import { DemoContent } from '../utils/DemoContent';
import { AVAILABLE_AWARDS } from '../components/Awards';

export const getServerUrl = () => "http://localhost:3000";

export const getFlagUrl = (cc: string) => cc ? `https://flagcdn.com/w40/${cc.toLowerCase()}.png` : '';


// Centralized Avatar & Banner Logic
export const getAvatarUrl = (user: User | null | undefined): string | undefined => {
    return user?.iconUrl || undefined;
};

export const getBannerUrl = (entity: { id: string; bannerUrl?: string } | null | undefined): string => {
    if (entity?.bannerUrl) return entity.bannerUrl;
    // Default fallback based on ID seed
    return `https://picsum.photos/seed/${entity?.id || 'default'}/1200/300`;
};

// Encryption Helpers
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

// IndexedDB Logic
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
  buyKopeki: (a: number) => { success: boolean; message: string; }; sellKopeki: (a: number) => { success: boolean; message: string; };
  addCreditCard: (c: any) => any; removeCreditCard: (id: string) => any; addIban: (i: any) => any; removeIban: (id: string) => any;
  getUserTransactions: (id: string) => Transaction[]; subscribeToUser: (id: string) => any; isSubscribedToUser: (id: string) => boolean;
}
interface DataContextType {
  boards: Board[]; posts: Post[]; profilePosts: ProfilePost[]; editorials: Editorial[]; comments: Comment[]; messages: Message[]; votes: Vote[]; subscriptions: Subscription[]; follows: Follow[]; awards: Award[]; ads: Advertisement[];
  createBoard: (n: string, d: string, ac: boolean, ap: boolean, pw?: string, inv?: boolean, fee?: number, i?: string, b?: string) => any;
  createPost: (t: string, c: string, b: string, m?: MediaItem[]) => Post | null; createProfilePost: (t: string, c: string, m?: MediaItem[], p?: number) => ProfilePost | null; createEditorial: (t: string, c: string, m?: MediaItem[]) => Editorial | null;
  updatePost: (id: string, t: string, c: string) => boolean; updateProfilePost: (id: string, t: string, c: string) => boolean; updateEditorial: (id: string, t: string, c: string) => boolean; updateBoard: (id: string, d: any) => any;
  addComment: (c: string, pid: string, paid?: string | null, m?: MediaItem[]) => Comment | null; castVote: (eid: string, t: VoteType) => void; getBoardByName: (n: string) => Board | undefined;
  deletePost: (id: string) => void; deleteProfilePost: (id: string) => void; deleteEditorial: (id: string) => void; deleteComment: (id: string) => void;
  appointModerator: (bid: string, u: string) => any; isModerator: (uid: string, bid: string) => boolean; appointAdmin: (bid: string, u: string) => any; isBoardAdmin: (uid: string, bid: string) => boolean;
  inviteUserToBoard: (bid: string, u: string) => any; removeUserFromBoard: (bid: string, uid: string) => any; subscribe: (bid: string) => void; unsubscribe: (bid: string) => void; isSubscribed: (bid: string) => boolean;
  followUser: (id: string) => void; unfollowUser: (id: string) => void; isFollowing: (id: string) => boolean; sendMessage: (rid: string, c: string, m?: MediaItem[], k?: number) => any; markConversationAsRead: (uid: string) => void;
  unlockBoard: (bid: string, pw: string) => boolean; isBoardUnlocked: (bid: string) => boolean; payBoardEntryFee: (bid: string) => any; giveAward: (eid: string, et: any, aid: string, rid: string) => any; unlockProfilePost: (pid: string) => any;
  createAd: (bid: string, t: string, c: string, l: string, i: string, b: number, m: any, ba: number) => any; approveAd: (id: string) => void; rejectAd: (id: string) => void; trackAdImpression: (id: string) => void; trackAdClick: (id: string) => void; getActiveAdsForBoard: (bid: string) => Advertisement[];
  respondToBoardInvite: (msgId: string, action: 'accept' | 'reject') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const DataContext = createContext<DataContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const usersS = usePersistentState<User[]>('r-users', []), boardsS = usePersistentState<Board[]>('r-boards', []), postsS = usePersistentState<Post[]>('r-posts', []), pPostsS = usePersistentState<ProfilePost[]>('r-profile-posts', []);
  const editsS = usePersistentState<Editorial[]>('r-editorials', []), commsS = usePersistentState<Comment[]>('r-comments', []), msgsS = usePersistentState<Message[]>('r-messages', []), votesS = usePersistentState<Vote[]>('r-votes', []);
  const subsS = usePersistentState<Subscription[]>('r-subscriptions', []), uSubsS = usePersistentState<UserSubscription[]>('r-user-subscriptions', []), followsS = usePersistentState<Follow[]>('r-follows', []);
  const txS = usePersistentState<Transaction[]>('r-transactions', []), awardS = usePersistentState<Award[]>('r-awards', []), adsS = usePersistentState<Advertisement[]>('r-ads', []), curUserS = usePersistentState<User | null>('r-currentUser', null);
  
  const [users, setUsers] = [usersS.value, usersS.setValue], [boards, setBoards] = [boardsS.value, boardsS.setValue], [posts, setPosts] = [postsS.value, postsS.setValue];
  const [profilePosts, setProfilePosts] = [pPostsS.value, pPostsS.setValue], [editorials, setEditorials] = [editsS.value, editsS.setValue], [comments, setComments] = [commsS.value, commsS.setValue];
  const [messages, setMessages] = [msgsS.value, msgsS.setValue], [votes, setVotes] = [votesS.value, votesS.setValue], [subscriptions, setSubscriptions] = [subsS.value, subsS.setValue];
  const [userSubscriptions, setUserSubscriptions] = [uSubsS.value, uSubsS.setValue], [follows, setFollows] = [followsS.value, followsS.setValue], [transactions, setTransactions] = [txS.value, txS.setValue];
  const [awards, setAwards] = [awardS.value, awardS.setValue], [ads, setAds] = [adsS.value, adsS.setValue], [currentUser, setCurrentUser] = [curUserS.value, curUserS.setValue];
  const [unlockedBoards, setUnlockedBoards] = useState<string[]>([]), [isInit, setIsInit] = useState(true);

  // Helper for "Fire and Forget" API calls
  const api = (endpoint: string, method: 'GET'|'POST'|'PUT'|'DELETE', body?: any) => {
      const url = `${getServerUrl()}${endpoint}`;
      // console.log(`[API Invoke] ${method} ${url}`, body); 
      fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
          mode: 'cors', // Ensure CORS mode is explicitly set
          credentials: 'include' // Send cookies if backend requires them
      }).catch(err => console.warn(`[API Fail] ${method} ${url}`, err));
  };

  useEffect(() => {
    if (usersS.isLoaded && boardsS.isLoaded && postsS.isLoaded && curUserS.isLoaded) {
        if (users.length === 0) { 
            const d = DemoContent.getInitialData(); 
            setUsers(d.users); setBoards(d.boards); setPosts(d.posts); setProfilePosts(d.profilePosts); setEditorials(d.editorials); setComments(d.comments); setMessages(d.messages); setVotes(d.votes); setSubscriptions(d.subscriptions); setUserSubscriptions(d.userSubscriptions); setFollows(d.follows); setTransactions(d.transactions); setAwards(d.awards); setAds(d.ads); 
        }
        setIsInit(false);
    }
  }, [usersS.isLoaded, boardsS.isLoaded, postsS.isLoaded, curUserS.isLoaded, users.length]);

  // --- Auth & User Logic ---
  
  const login = (u: string, p: string) => { 
      api('/auth/login', 'POST', { username: u, password: p });
      const user = users.find(x => x.username === u && x.password === p);
      if (user) setCurrentUser(user); 
      return !!user; 
  };
  
  const register = (u: string, p: string) => {
      api('/auth/register', 'POST', { username: u, password: p });
      if (users.some(x => x.username === u)) return { success: false, message: 'Username taken' };
      const nu: User = { 
          id: crypto.randomUUID(), username: u, password: p, role: 'user', 
          createdAt: new Date().toISOString(), iconUrl: '', bannerUrl: '', bio: '', junkSenders: [], 
          kopeki: 1000, countryCode: ['IT','US','FR'][Math.floor(Math.random()*3)], 
          publicKey: DemoContent.generateMockPublicKey(), isVerified: false, isPendingVerification: false 
      };
      setUsers(prev => [...prev, nu]);
      setCurrentUser(nu);
      return { success: true, message: 'OK' };
  };

  const logout = () => { api('/auth/logout', 'POST'); setCurrentUser(null); setUnlockedBoards([]); };
  const getUserById = (id: string) => users.find(u => u.id === id);
  const getUserByUsername = (u: string) => users.find(x => x.username.toLowerCase() === u.toLowerCase());
  const isAdmin = (id: string) => users.find(u => u.id === id)?.role === 'admin';
  
  const changePassword = (o: string, n: string) => {
      if(!currentUser) return { success: false, message: 'Login required' };
      api(`/users/${currentUser.id}/password`, 'PUT', { oldPassword: o, newPassword: n });
      if(currentUser.password !== o) return { success: false, message: 'Incorrect password' };
      const updatedUser = { ...currentUser, password: n };
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
      setCurrentUser(updatedUser);
      return { success: true, message: 'OK' };
  };

  const updateProfile = (d: any) => {
      if(!currentUser) return { success: false, message: 'Login required' };
      api(`/users/${currentUser.id}`, 'PUT', d);
      const updatedUser = { ...currentUser, ...d };
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
      setCurrentUser(updatedUser);
      return { success: true, message: 'OK' };
  };

  const moveConversationToJunk = (id: string) => { 
      if(currentUser) {
          api(`/users/${currentUser.id}/junk`, 'POST', { senderId: id });
          const currentJunk = currentUser.junkSenders || [];
          const newJunk = [...new Set([...currentJunk, id])];
          const updatedUser = { ...currentUser, junkSenders: newJunk };
          setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
          setCurrentUser(updatedUser);
      } 
  };
  const moveConversationToInbox = (id: string) => { 
      if(currentUser) { 
          api(`/users/${currentUser.id}/junk/${id}`, 'DELETE');
          const updatedUser = { ...currentUser, junkSenders: (currentUser.junkSenders || []).filter(jid => jid !== id) };
          setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
          setCurrentUser(updatedUser);
      } 
  };

  // --- Wallet & Economy ---

  const buyKopeki = (a: number) => {
      if(!currentUser) return {success:false, message:'Login'};
      api(`/wallet/buy`, 'POST', { amount: a });
      const updatedUser = { ...currentUser, kopeki: currentUser.kopeki + a };
      const tx: Transaction = { 
          id: crypto.randomUUID(), userId: currentUser.id, type: 'buy', amount: a, 
          currencyAmount: parseFloat((a/10000).toFixed(2)), description: `Bought ${a.toLocaleString()}`, createdAt: new Date().toISOString() 
      };
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
      setTransactions(prev => [tx, ...prev]);
      setCurrentUser(updatedUser);
      return { success: true, message: 'OK' };
  };

  const sellKopeki = (a: number) => {
      if(!currentUser) return {success:false, message:'Login'};
      if (currentUser.kopeki < a) return { success: false, message: 'Insufficient funds' };
      api(`/wallet/sell`, 'POST', { amount: a });
      const updatedUser = { ...currentUser, kopeki: currentUser.kopeki - a };
      const tx: Transaction = { 
          id: crypto.randomUUID(), userId: currentUser.id, type: 'sell', amount: a, 
          currencyAmount: parseFloat((a/10000).toFixed(2)), description: `Sold ${a.toLocaleString()}`, createdAt: new Date().toISOString() 
      };
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
      setTransactions(prev => [tx, ...prev]);
      setCurrentUser(updatedUser);
      return { success: true, message: 'OK' };
  };

  const addCreditCard = (c: any) => { 
      if(!currentUser) return; 
      api(`/users/${currentUser.id}/cards`, 'POST', c);
      const card = { ...c, id: crypto.randomUUID() };
      const updatedUser = { ...currentUser, savedCards: [...(currentUser.savedCards || []), card] };
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
      setCurrentUser(updatedUser);
      return {success:true, message:'OK'}; 
  };
  const removeCreditCard = (id: string) => { 
      if(!currentUser) return; 
      api(`/users/${currentUser.id}/cards/${id}`, 'DELETE');
      const updatedUser = { ...currentUser, savedCards: (currentUser.savedCards || []).filter(c => c.id !== id) };
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
      setCurrentUser(updatedUser);
      return {success:true, message:'OK'}; 
  };
  const addIban = (i: any) => { 
      if(!currentUser) return; 
      api(`/users/${currentUser.id}/ibans`, 'POST', i);
      const iban = { ...i, id: crypto.randomUUID() };
      const updatedUser = { ...currentUser, savedIbans: [...(currentUser.savedIbans || []), iban] };
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
      setCurrentUser(updatedUser);
      return {success:true, message:'OK'}; 
  };
  const removeIban = (id: string) => { 
      if(!currentUser) return; 
      api(`/users/${currentUser.id}/ibans/${id}`, 'DELETE');
      const updatedUser = { ...currentUser, savedIbans: (currentUser.savedIbans || []).filter(i => i.id !== id) };
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
      setCurrentUser(updatedUser);
      return {success:true, message:'OK'}; 
  };
  
  const getUserTransactions = (id: string) => transactions.filter(t => t.userId === id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const subscribeToUser = (cid: string) => {
      if(!currentUser) return {success:false, message:'Login'};
      api(`/users/${cid}/subscribe`, 'POST', { subscriberId: currentUser.id });
      const creator = users.find(u => u.id === cid);
      if (!creator) return { success: false, message: 'User not found' };
      if (userSubscriptions.some(s => s.subscriberId === currentUser.id && s.creatorId === cid)) return { success: false, message: 'Already subscribed' };

      const fee = creator.subscriptionFee || 0;
      if (fee > 0) {
          if (currentUser.kopeki < fee) return { success: false, message: 'Insufficient funds' };
          
          // Deduct from current user
          const updatedSub = { ...currentUser, kopeki: currentUser.kopeki - fee };
          // Add to creator (find in users array, might not be current user)
          const updatedCreator = { ...creator, kopeki: creator.kopeki + fee };
          
          setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedSub : u.id === creator.id ? updatedCreator : u));
          setCurrentUser(updatedSub);
          
          setTransactions(prev => [
              { id: crypto.randomUUID(), userId: currentUser.id, type: 'fee_payment', amount: fee, description: `Sub to ${creator.username}`, createdAt: new Date().toISOString() },
              { id: crypto.randomUUID(), userId: creator.id, type: 'fee_income', amount: fee, description: `Sub from ${currentUser.username}`, createdAt: new Date().toISOString() },
              ...prev
          ]);
      }

      setUserSubscriptions(prev => [...prev, { subscriberId: currentUser.id, creatorId: cid, startedAt: new Date().toISOString() }]);
      return { success: true, message: 'OK' };
  };
  const isSubscribedToUser = (id: string) => !!currentUser && userSubscriptions.some(s => s.subscriberId === currentUser.id && s.creatorId === id);

  // --- Content (Boards, Posts, etc) ---

  const createBoard = (name: string, description: string, allowAnonymousComments: boolean, allowAnonymousPosts: boolean, password?: string, isInviteOnly?: boolean, entryFee?: number, iconUrl?: string, bannerUrl?: string) => {
      if(!currentUser) return {success:false, message:'Login'};
      api('/boards', 'POST', { name, description, allowAnonymousComments, allowAnonymousPosts, password, isInviteOnly, entryFee, iconUrl, bannerUrl });
      if (boards.some(b => b.name.toLowerCase() === name.toLowerCase())) return { success: false, message: 'Board name taken' };

      const b: Board = { 
          id: crypto.randomUUID(), name, description, allowAnonymousComments, allowAnonymousPosts, password, isInviteOnly, entryFee, iconUrl, bannerUrl,
          creatorId: currentUser.id, createdAt: new Date().toISOString(), 
          moderatorIds: [], adminIds: [currentUser.id], 
          allowedUserIds: (isInviteOnly || (entryFee || 0) > 0) ? [currentUser.id] : []
      };
      setBoards(o => [...o, b]);
      setSubscriptions(o => [...o, { userId: currentUser.id, boardId: b.id }]);
      return { success: true, message: 'OK', board: b };
  };

  const updateBoard = (id: string, d: any) => {
      if(!currentUser) return {success:false, message:'Login'};
      api(`/boards/${id}`, 'PUT', d);
      setBoards(prev => prev.map(b => b.id === id ? { ...b, ...d } : b));
      return { success: true, message: 'OK' };
  };

  const createPost = (title: string, content: string, boardId: string, media?: MediaItem[]) => {
      const aid = currentUser?.id || null;
      if(!aid && !boards.find(b=>b.id===boardId)?.allowAnonymousPosts) return null;
      const p: Post = { id: crypto.randomUUID(), title, content, media: media||[], boardId, authorId: aid, createdAt: new Date().toISOString() };
      api('/posts', 'POST', p);
      setPosts(o => [p, ...o]); return p;
  };

  const createProfilePost = (title: string, content: string, media?: MediaItem[], price?: number) => {
      if(!currentUser) return null;
      const p: ProfilePost = { id: crypto.randomUUID(), title, content, media: media||[], authorId: currentUser.id, createdAt: new Date().toISOString(), price: price||0, unlockedUserIds: [] };
      api('/profile-posts', 'POST', p);
      setProfilePosts(o => [p, ...o]); return p;
  };

  const createEditorial = (title: string, content: string, media?: MediaItem[]) => {
      if(!currentUser || !isAdmin(currentUser.id)) return null;
      const e: Editorial = { id: crypto.randomUUID(), title, content, media: media||[], authorId: currentUser.id, createdAt: new Date().toISOString() };
      api('/editorials', 'POST', e);
      setEditorials(o => [e, ...o]); return e;
  };

  const updatePost = (id: string, t: string, c: string) => { 
      api(`/posts/${id}`, 'PUT', { title: t, content: c });
      setPosts(prev => prev.map(p => p.id === id ? { ...p, title: t, content: c } : p)); return true; 
  };
  const updateProfilePost = (id: string, t: string, c: string) => { 
      api(`/profile-posts/${id}`, 'PUT', { title: t, content: c });
      setProfilePosts(prev => prev.map(p => p.id === id ? { ...p, title: t, content: c } : p)); return true; 
  };
  const updateEditorial = (id: string, t: string, c: string) => { 
      api(`/editorials/${id}`, 'PUT', { title: t, content: c });
      setEditorials(prev => prev.map(p => p.id === id ? { ...p, title: t, content: c } : p)); return true; 
  };

  const addComment = (content: string, postId: string, parentId: string|null = null, media?: MediaItem[]) => {
      const aid = currentUser?.id || null;
      const c: Comment = { id: crypto.randomUUID(), content, postId, authorId: aid, parentId, createdAt: new Date().toISOString(), media: media||[] };
      api('/comments', 'POST', c);
      setComments(o => [...o, c]); return c;
  };

  const castVote = (eid: string, t: VoteType) => { 
      let uid = currentUser?.id;
      if (!uid) {
          uid = localStorage.getItem('qult_anon_id') || '';
          if (!uid) { uid = 'anon-' + crypto.randomUUID(); localStorage.setItem('qult_anon_id', uid); }
      }
      api('/votes', 'POST', { entityId: eid, type: t, userId: uid });
      setVotes(prev => {
          const idx = prev.findIndex(v => v.userId === uid && v.entityId === eid);
          if (idx > -1) {
              if (prev[idx].type === t) return prev.filter((_, i) => i !== idx); // Toggle off
              const n = [...prev]; n[idx] = { ...n[idx], type: t }; return n; // Change type
          }
          return [...prev, { userId: uid!, entityId: eid, type: t }];
      }); 
  };

  const getBoardByName = (n: string) => boards.find(b => b.name.toLowerCase() === n.toLowerCase());
  
  const deletePost = (id: string) => { api(`/posts/${id}`, 'DELETE'); setPosts(o => o.filter(p => p.id !== id)); setComments(o => o.filter(c => c.postId !== id)); };
  const deleteProfilePost = (id: string) => { api(`/profile-posts/${id}`, 'DELETE'); setProfilePosts(o => o.filter(p => p.id !== id)); setComments(o => o.filter(c => c.postId !== id)); };
  const deleteEditorial = (id: string) => { api(`/editorials/${id}`, 'DELETE'); setEditorials(o => o.filter(e => e.id !== id)); };
  const deleteComment = (id: string) => { api(`/comments/${id}`, 'DELETE'); setComments(o => o.filter(c => c.id !== id && c.parentId !== id)); };

  // --- Moderation & Roles ---
  const appointModerator = (bid: string, u: string) => {
      const uid = getUserByUsername(u)?.id; if(!uid) return {success:false, message:'No user'}; 
      api(`/boards/${bid}/moderators`, 'POST', { userId: uid });
      setBoards(o => o.map(b => b.id === bid ? {...b, moderatorIds: [...b.moderatorIds, uid]} : b)); return {success:true, message:'OK'};
  };
  const isModerator = (uid: string, bid: string) => boards.find(b => b.id === bid)?.moderatorIds.includes(uid) || false;
  const appointAdmin = (bid: string, u: string) => {
      const uid = getUserByUsername(u)?.id; if(!uid) return {success:false, message:'No user'}; 
      api(`/boards/${bid}/admins`, 'POST', { userId: uid });
      setBoards(o => o.map(b => b.id === bid ? {...b, adminIds: [...b.adminIds, uid]} : b)); return {success:true, message:'OK'};
  };
  const isBoardAdmin = (uid: string, bid: string) => boards.find(b => b.id === bid)?.adminIds.includes(uid) || false;
  
  const inviteUserToBoard = (bid: string, u: string) => { 
      if(!currentUser) return {success:false, message: 'Login required'};
      const board = boards.find(b => b.id === bid);
      const userToInvite = users.find(x => x.username.toLowerCase() === u.toLowerCase());
      
      if (!board) return { success: false, message: 'Board not found' };
      if (!userToInvite) return { success: false, message: 'User not found' };
      if (board.allowedUserIds?.includes(userToInvite.id)) return { success: false, message: 'User already has access' };

      const inviteMsg: Message = {
          id: crypto.randomUUID(),
          senderId: currentUser.id,
          recipientId: userToInvite.id,
          content: `You have been invited to join b/${board.name}`,
          createdAt: new Date().toISOString(),
          type: 'board_invite',
          metadata: { boardId: board.id, boardName: board.name, inviteStatus: 'pending' }
      };
      
      api(`/messages`, 'POST', inviteMsg);
      setMessages(o => [...o, inviteMsg]);
      return { success: true, message: 'Invitation sent' }; 
  };

  const respondToBoardInvite = (msgId: string, action: 'accept' | 'reject') => {
      api(`/messages/${msgId}/invite`, 'POST', { action });
      const msg = messages.find(m => m.id === msgId);
      if (!msg || msg.type !== 'board_invite' || !msg.metadata?.boardId) return;
      if (msg.metadata.inviteStatus !== 'pending') return;

      const boardId = msg.metadata.boardId;
      const board = boards.find(b => b.id === boardId);
      const invitee = users.find(u => u.id === msg.recipientId);
      const inviter = users.find(u => u.id === msg.senderId);

      // Update Board if accepted
      if (action === 'accept' && board && invitee) {
          setBoards(prev => prev.map(b => b.id === boardId ? { ...b, allowedUserIds: [...(b.allowedUserIds || []), invitee.id] } : b));
      }

      // Update Message
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, metadata: { ...m.metadata, inviteStatus: action === 'accept' ? 'accepted' : 'rejected' } } : m));

      // Notify Admin
      if (inviter && invitee && board) {
          const notifMsg: Message = {
              id: crypto.randomUUID(),
              senderId: invitee.id,
              recipientId: inviter.id,
              content: `User ${invitee.username} has ${action}ed your invitation to b/${board.name}.`,
              createdAt: new Date().toISOString(),
              type: 'notification'
          };
          setMessages(prev => [...prev, notifMsg]);
      }
  };

  const removeUserFromBoard = (bid: string, uid: string) => { 
      api(`/boards/${bid}/users/${uid}`, 'DELETE');
      setBoards(o => o.map(b => b.id === bid ? {...b, allowedUserIds: (b.allowedUserIds||[]).filter(x => x!==uid)} : b)); return {success:true, message:'OK'}; 
  };

  const subscribe = (bid: string) => { 
      if(currentUser) {
          api(`/boards/${bid}/subscribe`, 'POST');
          const exists = subscriptions.some(s => s.userId === currentUser.id && s.boardId === bid);
          if (exists) setSubscriptions(o => o.filter(s => !(s.userId === currentUser.id && s.boardId === bid)));
          else setSubscriptions(o => [...o, { userId: currentUser.id, boardId: bid }]);
      }
  };
  const unsubscribe = (bid: string) => subscribe(bid); // Alias
  const isSubscribed = (bid: string) => !!currentUser && subscriptions.some(s => s.userId === currentUser.id && s.boardId === bid);

  const followUser = (id: string) => { 
      if(currentUser) {
          api(`/users/${id}/follow`, 'POST');
          const exists = follows.some(f => f.followerId === currentUser.id && f.followingId === id);
          if (exists) setFollows(o => o.filter(f => !(f.followerId === currentUser.id && f.followingId === id)));
          else setFollows(o => [...o, { followerId: currentUser.id, followingId: id }]);
      }
  };
  const unfollowUser = (id: string) => followUser(id); // Alias
  const isFollowing = (id: string) => !!currentUser && follows.some(f => f.followerId === currentUser.id && f.followingId === id);

  const sendMessage = (rid: string, c: string, m?: MediaItem[], k?: number) => {
      if(!currentUser) return {success:false, error: 'Login required'};
      const recipient = users.find(u => u.id === rid);
      if(!recipient) return {success:false, error: 'Recipient not found'};

      if (k && k > 0) {
          if (currentUser.kopeki < k) return { success: false, error: 'Insufficient funds' };
          
          const updatedSender = { ...currentUser, kopeki: currentUser.kopeki - k };
          const updatedRecipient = { ...recipient, kopeki: recipient.kopeki + k };
          
          setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedSender : u.id === recipient.id ? updatedRecipient : u));
          setCurrentUser(updatedSender);
          
          setTransactions(prev => [
              { id: crypto.randomUUID(), userId: currentUser.id, type: 'p2p_transfer', amount: k, description: `Sent to ${recipient.username}`, createdAt: new Date().toISOString() },
              { id: crypto.randomUUID(), userId: recipient.id, type: 'p2p_transfer', amount: k, description: `Received from ${currentUser.username}`, createdAt: new Date().toISOString() },
              ...prev
          ]);
      }

      const msgContent = (recipient.publicKey && c) ? mockEncrypt(c) : c;
      const msg: Message = { 
          id: crypto.randomUUID(), senderId: currentUser.id, recipientId: rid, 
          content: msgContent, media: m, kopekiAmount: k, isEncrypted: !!(recipient.publicKey && c), createdAt: new Date().toISOString(), type: 'text' 
      };
      
      api('/messages', 'POST', msg);
      setMessages(o => [...o, msg]);
      return { success: true, message: msg };
  };
  const markConversationAsRead = (uid: string) => { 
      if(currentUser) {
          api(`/messages/read/${uid}`, 'POST');
          setMessages(o => o.map(m => (!m.readAt && m.recipientId === currentUser.id && m.senderId === uid) ? {...m, readAt: new Date().toISOString()} : m)); 
      }
  };

  const unlockBoard = (bid: string, pw: string) => { const b = boards.find(x => x.id === bid); if(b && b.password === pw) { setUnlockedBoards(o => [...o, bid]); return true; } return false; };
  const isBoardUnlocked = (bid: string) => {
      const b = boards.find(x => x.id === bid); if(!b) return false;
      if(currentUser && (isAdmin(currentUser.id) || isBoardAdmin(currentUser.id, bid) || isModerator(currentUser.id, bid))) return true;
      if(b.isInviteOnly || (b.entryFee && b.entryFee > 0)) return !!currentUser && (b.allowedUserIds||[]).includes(currentUser.id);
      return b.password ? unlockedBoards.includes(bid) : true;
  };

  const payBoardEntryFee = (bid: string) => {
      if(!currentUser) return {success:false, message:'Login'};
      api(`/boards/${bid}/pay`, 'POST');
      const board = boards.find(b => b.id === bid);
      if(!board || !board.entryFee) return {success:false, message:'Invalid'};
      if(currentUser.kopeki < board.entryFee) return {success:false, message:'Insufficient funds'};

      const creator = users.find(u => u.id === board.creatorId);
      const updatedUser = { ...currentUser, kopeki: currentUser.kopeki - board.entryFee };
      let updatedCreator = creator ? { ...creator, kopeki: creator.kopeki + board.entryFee } : undefined;

      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : (updatedCreator && u.id === creator!.id) ? updatedCreator : u));
      setCurrentUser(updatedUser);
      
      setBoards(prev => prev.map(b => b.id === bid ? { ...b, allowedUserIds: [...(b.allowedUserIds||[]), currentUser.id] } : b));
      
      const newTxs: Transaction[] = [{ id: crypto.randomUUID(), userId: currentUser.id, type: 'fee_payment', amount: board.entryFee, description: `Entry ${board.name}`, createdAt: new Date().toISOString() }];
      if(updatedCreator) newTxs.push({ id: crypto.randomUUID(), userId: updatedCreator.id, type: 'fee_income', amount: board.entryFee, description: `Entry income ${board.name}`, createdAt: new Date().toISOString() });
      
      setTransactions(prev => [...newTxs, ...prev]);
      return { success: true, message: 'OK' };
  };

  const giveAward = (eid: string, et: any, aid: string, rid: string) => {
      if(!currentUser) return {success:false, message:'Login'};
      api('/awards', 'POST', { entityId: eid, entityType: et, awardId: aid, receiverId: rid });
      const awardDef = AVAILABLE_AWARDS.find(a => a.id === aid);
      if (!awardDef) return {success:false, message:'Invalid award'};
      if (currentUser.kopeki < awardDef.cost) return {success:false, message:'Insufficient Kopeki'};

      const receiver = users.find(u => u.id === rid);
      if (!receiver) return {success:false, message:'Receiver not found'};

      const updatedSender = { ...currentUser, kopeki: currentUser.kopeki - awardDef.cost };
      const updatedReceiver = { ...receiver, kopeki: receiver.kopeki + awardDef.cost };

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
      api(`/profile-posts/${pid}/unlock`, 'POST');
      const post = profilePosts.find(p => p.id === pid);
      if(!post || !post.price) return {success:false};
      if(currentUser.kopeki < post.price) return {success:false, message:'Insufficient funds'};

      const author = users.find(u => u.id === post.authorId);
      if(!author) return {success:false, message:'Author error'};

      const updatedUser = { ...currentUser, kopeki: currentUser.kopeki - post.price };
      const updatedAuthor = { ...author, kopeki: author.kopeki + post.price };

      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u.id === author.id ? updatedAuthor : u));
      setCurrentUser(updatedUser);
      setProfilePosts(prev => prev.map(p => p.id === pid ? { ...p, unlockedUserIds: [...(p.unlockedUserIds||[]), currentUser.id] } : p));

      setTransactions(prev => [
          { id: crypto.randomUUID(), userId: currentUser.id, type: 'post_unlock', amount: post.price, description: `Unlocked post`, createdAt: new Date().toISOString() },
          { id: crypto.randomUUID(), userId: author.id, type: 'post_income', amount: post.price, description: `Post unlocked by ${currentUser.username}`, createdAt: new Date().toISOString() },
          ...prev
      ]);
      return { success: true, message: 'OK' };
  };

  const createAd = (bid: string, t: string, c: string, l: string, i: string, b: number, m: any, ba: number) => {
      if(!currentUser) return {success:false, message:'Login'};
      if (currentUser.kopeki < b) return {success:false, message:'Insufficient funds'};

      const updatedUser = { ...currentUser, kopeki: currentUser.kopeki - b };
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
      setCurrentUser(updatedUser);

      const ad: Advertisement = { 
          id: crypto.randomUUID(), userId: currentUser.id, boardId: bid, title: t, content: c, linkUrl: l, imageUrl: i, 
          budget: b, spent: 0, model: m, bidAmount: ba, status: 'pending', views: 0, clicks: 0, createdAt: new Date().toISOString() 
      };
      
      api('/ads', 'POST', ad);
      setAds(o => [...o, ad]);
      setTransactions(prev => [{ id: crypto.randomUUID(), userId: currentUser.id, type: 'ad_payment', amount: b, description: `Ad ${t}`, createdAt: new Date().toISOString() }, ...prev]);
      return { success: true, message: 'OK' };
  };

  const approveAd = (id: string) => { 
      if(currentUser) {
          api(`/ads/${id}/approve`, 'POST');
          setAds(o => o.map(a => a.id === id ? {...a, status: 'active'} : a)); 
      }
  };
  const rejectAd = (id: string) => {
      if(!currentUser) return;
      api(`/ads/${id}/reject`, 'POST');
      const ad = ads.find(a => a.id === id);
      if(!ad) return;

      const refund = ad.budget - ad.spent;
      if (refund > 0) {
          const user = users.find(u => u.id === ad.userId);
          if (user) {
              const updatedUser = { ...user, kopeki: user.kopeki + refund };
              setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
              if (currentUser.id === user.id) setCurrentUser(updatedUser);
              setTransactions(prev => [{ id: crypto.randomUUID(), userId: user.id, type: 'ad_refund' as const, amount: refund, description: `Refund ${ad.title}`, createdAt: new Date().toISOString() }, ...prev]);
          }
      }
      setAds(prev => prev.map(a => a.id === id ? {...a, status: 'rejected'} : a));
  };

  const trackAdImpression = (id: string) => {
      api(`/ads/${id}/impression`, 'POST');
      setAds(o => o.map(a => (a.id === id && a.status === 'active') ? {...a, views: a.views + 1, spent: a.spent + (a.model === 'CPM' ? a.bidAmount/1000 : 0), status: (a.spent + (a.model === 'CPM' ? a.bidAmount/1000 : 0)) >= a.budget ? 'completed' : 'active'} : a));
  };
  const trackAdClick = (id: string) => {
      api(`/ads/${id}/click`, 'POST');
      setAds(o => o.map(a => (a.id === id && a.status === 'active') ? {...a, clicks: a.clicks + 1, spent: a.spent + (a.model === 'CPC' ? a.bidAmount : 0), status: (a.spent + (a.model === 'CPC' ? a.bidAmount : 0)) >= a.budget ? 'completed' : 'active'} : a));
  };
  const getActiveAdsForBoard = (bid: string) => ads.filter(a => a.boardId === bid && a.status === 'active');

  const authCtx = useMemo(() => ({ currentUser, users, transactions, login, register, logout, getUserById, getUserByUsername, isAdmin, changePassword, updateProfile, moveConversationToJunk, moveConversationToInbox, buyKopeki, sellKopeki, addCreditCard, removeCreditCard, addIban, removeIban, getUserTransactions, subscribeToUser, isSubscribedToUser }), [currentUser, users, transactions]);
  const dataCtx = useMemo(() => ({ boards, posts, profilePosts, editorials, comments, messages, votes, subscriptions, follows, awards, ads, createBoard, createPost, createProfilePost, createEditorial, updatePost, updateProfilePost, updateEditorial, updateBoard, addComment, castVote, getBoardByName, deletePost, deleteProfilePost, deleteEditorial, deleteComment, appointModerator, isModerator, appointAdmin, isBoardAdmin, inviteUserToBoard, removeUserFromBoard, subscribe, unsubscribe, isSubscribed, followUser, unfollowUser, isFollowing, sendMessage, markConversationAsRead, unlockBoard, isBoardUnlocked, payBoardEntryFee, giveAward, unlockProfilePost, createAd, approveAd, rejectAd, trackAdImpression, trackAdClick, getActiveAdsForBoard, respondToBoardInvite }), [boards, posts, profilePosts, editorials, comments, messages, votes, subscriptions, follows, awards, ads, currentUser, users]);

  if (isInit) return React.createElement('div', { className: "h-screen flex items-center justify-center" }, "Loading...");
  return React.createElement(AuthContext.Provider, { value: authCtx }, React.createElement(DataContext.Provider, { value: dataCtx }, children));
};

export const useAuth = () => { const c = useContext(AuthContext); if(!c) throw new Error(); return c; };
export const useData = () => { const c = useContext(DataContext); if(!c) throw new Error(); return c; };
