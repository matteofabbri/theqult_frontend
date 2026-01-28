
export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'user' | 'admin';
  createdAt: string;
  iconUrl?: string;
  bannerUrl?: string;
  bio?: string;
  junkSenders?: string[];
  countryCode?: string;
  publicKey?: string;
  kopeki?: number;
  savedCards?: CreditCard[];
  savedIbans?: Iban[];
  isVerified?: boolean;
  isPendingVerification?: boolean;
  subscriptionFee?: number;
}

export interface CreditCard {
  id: string;
  last4: string;
  expiry: string;
  brand: string;
}

export interface Iban {
  id: string;
  iban: string;
  label: string;
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
  entryFee?: number;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  media?: MediaItem[];
  boardId: string;
  authorId: string | null;
  createdAt: string;
}

export interface ProfilePost {
  id: string;
  title: string;
  content: string;
  media?: MediaItem[];
  authorId: string;
  createdAt: string;
  price?: number;
  unlockedUserIds?: string[];
}

export interface Editorial {
  id: string;
  title: string;
  content: string;
  media?: MediaItem[];
  authorId: string;
  createdAt: string;
}

export interface Comment {
  id:string;
  content: string;
  postId: string;
  authorId: string | null;
  parentId: string | null;
  createdAt: string;
  media?: MediaItem[];
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  media?: MediaItem[];
  isEncrypted?: boolean;
  createdAt: string;
  readAt?: string;
  type?: 'text' | 'board_invite' | 'notification';
  metadata?: {
    boardId?: string;
    boardName?: string;
    inviteStatus?: 'pending' | 'accepted' | 'rejected';
  };
  kopekiAmount?: number;
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

export interface Advertisement {
  id: string;
  boardId: string;
  userId: string;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
  views: number;
  clicks: number;
  createdAt: string;
  budget: number;
  spent: number;
  model: 'CPC' | 'CPM';
  bidAmount: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'buy' | 'sell' | 'fee_payment' | 'fee_income' | 'post_unlock' | 'post_income' | 'p2p_transfer' | 'ad_payment' | 'ad_refund' | 'award_given' | 'award_received';
  amount: number;
  currencyAmount?: number;
  description: string;
  createdAt: string;
}

export interface UserSubscription {
  subscriberId: string;
  creatorId: string;
  startedAt: string;
}

// Added missing Award interface as required by Backend services
export interface Award {
  id: string;
  typeId: string;
  senderId: string;
  receiverId: string;
  entityId: string;
  entityType: 'post' | 'comment';
  createdAt: string;
}
