
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { User, Board, Post, Comment, Vote, VoteType, Subscription, ProfilePost, Follow, Message, MediaItem, TerritoryAssignment } from '../types';
import { DemoContent } from '../Fixtures/DemoContent';

export const getFlagUrl = (cc: string) => cc ? `https://flagcdn.com/w40/${cc.toLowerCase()}.png` : '';
export const getCountryCodeForId = (id: string) => {
    const countries = ['IT', 'US', 'GB', 'FR', 'DE', 'ES', 'JP', 'BR', 'CA', 'AU', 'CH', 'NL', 'SE'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return countries[Math.abs(hash) % countries.length];
};
export const getCountryEmoji = (cc: string | undefined): string => {
    if (!cc || cc.length !== 2) return '';
    const codePoints = cc
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};
export const getAvatarUrl = (user: User | null | undefined): string | undefined => user?.iconUrl || undefined;
export const getBannerUrl = (obj: { id: string, bannerUrl?: string } | null | undefined): string | undefined => obj?.bannerUrl || undefined;

export const timeAgo = (d: string) => {
    const s = Math.floor((new Date().getTime() - new Date(d).getTime()) / 1000);
    const i: Record<string, number> = { year: 31536000, month: 2592000, day: 86400, hour: 3600, minute: 60 };
    for (const [u, v] of Object.entries(i)) {
        const c = s/v; if (c > 1) return `${Math.floor(c)} ${u}s ago`;
    }
    return `${Math.floor(s)} seconds ago`;
};

// IndexedDB - simplified
const DB_NAME = 'TheQultDB', STORE_NAME = 'keyval';
const dbOp = async (mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest) => {
    const db = await new Promise<IDBDatabase>((res, rej) => {
        const r = indexedDB.open(DB_NAME, 1);
        r.onerror = () => rej(r.error); r.onsuccess = () => res(r.result);
        r.onupgradeneeded = (e) => (e.target as IDBOpenDBRequest).result.createObjectStore(STORE_NAME);
    });
    return new Promise((res, rej) => {
        const r = fn(db.transaction(STORE_NAME, mode).objectStore(STORE_NAME));
        r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
};
const dbGet = <T,>(k: string) => dbOp('readonly', s => s.get(k)).catch(() => undefined) as Promise<T|undefined>;
const dbSet = (k: string, v: any) => dbOp('readwrite', s => s.put(v, k)).catch(() => undefined);

function usePersistentState<T>(key: string, initialValue: T) {
  const [val, setVal] = useState<T>(initialValue), [loaded, setLoaded] = useState(false);
  useEffect(() => {
    dbGet<T>(key).then(v => { if(v !== undefined) setVal(v); setLoaded(true); });
  }, [key]);
  const setValue = useCallback((v: T | ((old: T) => T)) => {
    setVal(old => { const n = v instanceof Function ? v(old) : v; dbSet(key, n); return n; });
  }, [key]);
  return { value: val, setValue, isLoaded: loaded };
}

const generateJWT = (user: User) => `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ id: user.id, username: user.username, role: user.role, iat: Date.now() }))}.mock_sig`;

const verifyJWT = (token: string | null): any => {
    if (!token) return null;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        return JSON.parse(atob(parts[1]));
    } catch { return null; }
};

interface AuthContextType {
  currentUser: User | null; 
  token: string | null;
  users: User[];
  login: (u: string, p: string) => boolean; 
  register: (u: string, p: string) => { success: boolean, message: string }; 
  logout: () => void;
  getUserById: (id: string) => User | undefined; 
  getUserByUsername: (u: string) => User | undefined; 
  isAdmin: (id: string) => boolean;
  updateProfile: (d: any) => { success: boolean; message: string; };
}

interface DataContextType {
  boards: Board[]; posts: Post[]; profilePosts: ProfilePost[]; editorials: Editorial[]; comments: Comment[]; messages: Message[]; votes: Vote[]; subscriptions: Subscription[]; follows: Follow[];
  createBoard: (n: string, d: string, ac: boolean, ap: boolean) => any;
  createPost: (t: string, c: string, b: string, m?: MediaItem[]) => Post | null; 
  createProfilePost: (t: string, c: string, m?: MediaItem[]) => ProfilePost | null; 
  createEditorial: (t: string, c: string, m?: MediaItem[]) => Editorial | null;
  updatePost: (id: string, t: string, c: string) => boolean; 
  updateProfilePost: (id: string, t: string, c: string) => boolean; 
  updateEditorial: (id: string, t: string, c: string) => boolean;
  addComment: (c: string, pid: string, paid?: string | null, m?: MediaItem[]) => Comment | null; 
  castVote: (eid: string, t: VoteType) => void; 
  getBoardByName: (n: string) => Board | undefined;
  deletePost: (id: string) => void; 
  deleteProfilePost: (id: string) => void; 
  deleteEditorial: (id: string) => void;
  deleteComment: (id: string) => void;
  subscribe: (bid: string) => void; 
  isSubscribed: (bid: string) => boolean;
  followUser: (id: string) => void; 
  isFollowing: (id: string) => boolean; 
  sendMessage: (rid: string, c: string, m?: MediaItem[]) => any; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const DataContext = createContext<DataContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const usersS = usePersistentState<User[]>('r-users', []), 
        boardsS = usePersistentState<Board[]>('r-boards', []), 
        postsS = usePersistentState<Post[]>('r-posts', []), 
        pPostsS = usePersistentState<ProfilePost[]>('r-profile-posts', []),
        editorialsS = usePersistentState<Editorial[]>('r-editorials', []),
        commsS = usePersistentState<Comment[]>('r-comments', []), 
        msgsS = usePersistentState<Message[]>('r-messages', []), 
        votesS = usePersistentState<Vote[]>('r-votes', []),
        subsS = usePersistentState<Subscription[]>('r-subscriptions', []), 
        followsS = usePersistentState<Follow[]>('r-follows', []),
        curUserS = usePersistentState<User | null>('r-currentUser', null),
        tokenS = usePersistentState<string | null>('r-token', null);
  
  const [users, setUsers] = [usersS.value, usersS.setValue], 
        [boards, setBoards] = [boardsS.value, boardsS.setValue], 
        [posts, setPosts] = [postsS.value, postsS.setValue],
        [profilePosts, setProfilePosts] = [pPostsS.value, pPostsS.setValue], 
        [editorials, setEditorials] = [editorialsS.value, editorialsS.setValue],
        [comments, setComments] = [commsS.value, commsS.setValue],
        [messages, setMessages] = [msgsS.value, msgsS.setValue], 
        [votes, setVotes] = [votesS.value, votesS.setValue], 
        [subscriptions, setSubscriptions] = [subsS.value, subsS.setValue],
        [follows, setFollows] = [followsS.value, followsS.setValue], 
        [currentUser, setCurrentUser] = [curUserS.value, curUserS.setValue],
        [token, setToken] = [tokenS.value, tokenS.setValue];

  const [isInit, setIsInit] = useState(true);

  useEffect(() => {
    if (usersS.isLoaded && boardsS.isLoaded && postsS.isLoaded && curUserS.isLoaded) {
        if (users.length === 0) { 
            const d = DemoContent.getInitialData(); 
            setUsers(d.users); setBoards(d.boards); setPosts(d.posts); setProfilePosts(d.profilePosts); setEditorials((d as any).editorials || []); setComments(d.comments); setMessages(d.messages); setVotes(d.votes); setSubscriptions(d.subscriptions); setFollows(d.follows); 
        }
        setIsInit(false);
    }
  }, [usersS.isLoaded, boardsS.isLoaded, postsS.isLoaded, curUserS.isLoaded, users.length]);

  const login = (u: string, p: string) => { 
      const user = users.find(x => x.username === u && x.password === p);
      if (user) {
          setCurrentUser(user);
          setToken(generateJWT(user));
      }
      return !!user; 
  };
  
  const register = (u: string, p: string) => {
      if (users.some(x => x.username === u)) return { success: false, message: 'Username taken' };
      const nu: User = { id: crypto.randomUUID(), username: u, password: p, role: 'user', createdAt: new Date().toISOString(), isVerified: false };
      setUsers(prev => [...prev, nu]);
      setCurrentUser(nu);
      setToken(generateJWT(nu));
      return { success: true, message: 'OK' };
  };

  const logout = () => { setCurrentUser(null); setToken(null); };
  const getUserById = (id: string) => users.find(u => u.id === id);
  const getUserByUsername = (u: string) => users.find(x => x.username.toLowerCase() === u.toLowerCase());
  const isAdmin = (id: string) => users.find(u => u.id === id)?.role === 'admin';
  
  const updateProfile = (d: any) => {
      if(!currentUser || !token) return { success: false, message: 'Login required' };
      const updatedUser = { ...currentUser, ...d };
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
      setCurrentUser(updatedUser);
      return { success: true, message: 'OK' };
  };

  const createBoard = (name: string, description: string, allowAnonymousComments: boolean, allowAnonymousPosts: boolean) => {
      if(!currentUser || !token) return {success:false, message:'Login'};
      if (boards.some(b => b.name.toLowerCase() === name.toLowerCase())) return { success: false, message: 'Taken' };
      const b: Board = { id: crypto.randomUUID(), name, description, allowAnonymousComments, allowAnonymousPosts, creatorId: currentUser.id, createdAt: new Date().toISOString(), moderatorIds: [], adminIds: [currentUser.id] };
      setBoards(o => [...o, b]);
      setSubscriptions(o => [...o, { userId: currentUser.id, boardId: b.id }]);
      return { success: true, message: 'OK', board: b };
  };

  const getCurrentCountryCode = () => {
    const countries = ['IT', 'US', 'GB', 'FR', 'DE', 'ES', 'JP', 'BR', 'CA', 'AU'];
    return countries[Math.floor(Math.random() * countries.length)];
  };

  const createPost = (title: string, content: string, boardId: string, media?: MediaItem[]) => {
      const aid = (currentUser && token) ? currentUser.id : null;
      if(!aid && !boards.find(b=>b.id===boardId)?.allowAnonymousPosts) return null;
      const p: Post = { 
          id: crypto.randomUUID(), 
          title, 
          content, 
          media: media||[], 
          boardId, 
          authorId: aid, 
          createdAt: new Date().toISOString(),
          countryCode: getCurrentCountryCode()
      };
      setPosts(o => [p, ...o]); return p;
  };

  const createProfilePost = (title: string, content: string, media?: MediaItem[]) => {
      if(!currentUser || !token) return null;
      const p: ProfilePost = { 
          id: crypto.randomUUID(), 
          title, 
          content, 
          media: media||[], 
          authorId: currentUser.id, 
          createdAt: new Date().toISOString(),
          countryCode: getCurrentCountryCode()
      };
      setProfilePosts(o => [p, ...o]); return p;
  };

  const createEditorial = (title: string, content: string, media?: MediaItem[]) => {
      if(!currentUser || !isAdmin(currentUser.id)) return null;
      const e: Editorial = { 
          id: crypto.randomUUID(), 
          title, 
          content, 
          media: media||[], 
          authorId: currentUser.id, 
          createdAt: new Date().toISOString(),
          countryCode: getCurrentCountryCode()
      };
      setEditorials(o => [e, ...o]); return e;
  };

  const updatePost = (id: string, t: string, c: string) => { setPosts(prev => prev.map(p => p.id === id ? { ...p, title: t, content: c } : p)); return true; };
  const updateProfilePost = (id: string, t: string, c: string) => { setProfilePosts(prev => prev.map(p => p.id === id ? { ...p, title: t, content: c } : p)); return true; };
  const updateEditorial = (id: string, t: string, c: string) => { setEditorials(prev => prev.map(e => e.id === id ? { ...e, title: t, content: c } : e)); return true; };

  const addComment = (content: string, postId: string, parentId: string|null = null, media?: MediaItem[]) => {
      const aid = (currentUser && token) ? currentUser.id : null;
      const c: Comment = { 
          id: crypto.randomUUID(), 
          content, 
          postId, 
          authorId: aid, 
          parentId, 
          createdAt: new Date().toISOString(), 
          media: media||[],
          countryCode: getCurrentCountryCode()
      };
      setComments(o => [...o, c]); return c;
  };

  const castVote = (eid: string, t: VoteType) => { 
      let uid = (currentUser && token) ? currentUser.id : localStorage.getItem('qult_anon_id') || 'anon-' + crypto.randomUUID();
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

  const subscribe = (bid: string) => { 
      if(currentUser && token) {
          const exists = subscriptions.some(s => s.userId === currentUser.id && s.boardId === bid);
          if (exists) setSubscriptions(o => o.filter(s => !(s.userId === currentUser.id && s.boardId === bid)));
          else setSubscriptions(o => [...o, { userId: currentUser.id, boardId: bid }]);
      }
  };
  const isSubscribed = (bid: string) => !!currentUser && !!token && subscriptions.some(s => s.userId === currentUser.id && s.boardId === bid);

  const followUser = (id: string) => { 
      if(currentUser && token) {
          const exists = follows.some(f => f.followerId === currentUser.id && f.followingId === id);
          if (exists) setFollows(o => o.filter(f => !(f.followerId === currentUser.id && f.followingId === id)));
          else setFollows(o => [...o, { followerId: currentUser.id, followingId: id }]);
      }
  };
  const isFollowing = (id: string) => !!currentUser && !!token && follows.some(f => f.followerId === currentUser.id && f.followingId === id);

  const sendMessage = (rid: string, c: string, m?: MediaItem[]) => {
      if(!currentUser || !token) return {success:false};
      const msg: Message = { id: crypto.randomUUID(), senderId: currentUser.id, recipientId: rid, content: c, media: m, createdAt: new Date().toISOString(), type: 'text' };
      setMessages(o => [...o, msg]);
      return { success: true, message: msg };
  };

  const authCtx = useMemo(() => ({ currentUser, token, users, login, register, logout, getUserById, getUserByUsername, isAdmin, updateProfile }), [currentUser, token, users]);
  const dataCtx = useMemo(() => ({ 
    boards, posts, profilePosts, editorials, comments, messages, votes, subscriptions, follows, 
    createBoard, createPost, createProfilePost, createEditorial, updatePost, updateProfilePost, updateEditorial, addComment, castVote, getBoardByName, deletePost, deleteProfilePost, deleteEditorial, deleteComment, subscribe, isSubscribed, followUser, isFollowing, sendMessage 
  }), [boards, posts, profilePosts, editorials, comments, messages, votes, subscriptions, follows, currentUser, token]);

  if (isInit) return null;
  return React.createElement(AuthContext.Provider, { value: authCtx }, React.createElement(DataContext.Provider, { value: dataCtx }, children));
};

export const useAuth = () => { const c = useContext(AuthContext); if(!c) throw new Error(); return c; };
export const useData = () => { const c = useContext(DataContext); if(!c) throw new Error(); return c; };
