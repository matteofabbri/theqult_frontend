
export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'user' | 'admin';
  createdAt: string;
  iconUrl?: string;
  bannerUrl?: string;
  bio?: string;
  countryCode?: string;
  isVerified?: boolean;
  isPendingVerification?: boolean;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  createdAt: string;
  moderatorIds: string[];
  adminIds: string[];
  allowAnonymousComments: boolean;
  allowAnonymousPosts?: boolean;
  iconUrl?: string;
  bannerUrl?: string;
  password?: string;
  isInviteOnly?: boolean;
  allowedUserIds?: string[];
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  name?: string;
}

export interface Editorial {
  id: string;
  title: string;
  content: string;
  media?: MediaItem[];
  authorId: string;
  createdAt: string;
  countryCode?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  media?: MediaItem[];
  boardId: string;
  authorId: string | null;
  createdAt: string;
  countryCode?: string;
}

export interface ProfilePost {
  id: string;
  title: string;
  content: string;
  media?: MediaItem[];
  authorId: string;
  createdAt: string;
  countryCode?: string;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string | null;
  parentId: string | null;
  createdAt: string;
  media?: MediaItem[];
  countryCode?: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  media?: MediaItem[];
  createdAt: string;
  readAt?: string;
  type?: 'text' | 'board_invite' | 'notification';
  metadata?: {
    boardId?: string;
    boardName?: string;
    inviteStatus?: 'pending' | 'accepted' | 'rejected';
  };
}

export type VoteType = 'up' | 'down';

export interface Vote {
  userId: string;
  entityId: string;
  type: VoteType;
}

export interface Subscription {
  userId: string;
  boardId: string;
}

export interface Follow {
  followerId: string;
  followingId: string;
}
