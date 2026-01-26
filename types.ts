
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

export interface Transaction {
  id: string;
  userId: string;
  type: 'buy' | 'sell' | 'fee_payment' | 'fee_income' | 'p2p_transfer' | 'award_given' | 'award_received' | 'post_unlock' | 'post_income' | 'ad_payment' | 'ad_refund';
  amount: number; // In Kopeki
  currencyAmount?: number; // In EUR (approximate)
  description: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  password?: string; // Should be hashed in a real app
  role: 'user' | 'admin';
  createdAt: string;
  iconUrl?: string;
  bannerUrl?: string;
  bio?: string; // User biography
  junkSenders?: string[];
  kopeki: number;
  savedCards?: CreditCard[];
  savedIbans?: Iban[];
  subscriptionFee?: number;
  countryCode?: string; // ISO 3166-1 alpha-2
  publicKey?: string; // Public Cryptographic Key
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
  password?: string; // Optional password protection
  isInviteOnly?: boolean; // Optional invite-only protection
  allowedUserIds?: string[]; // Users allowed to access if invite-only or paid
  entryFee?: number; // Optional entry fee in Kopeki
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string; // Base64 or URL
}

export interface Post {
  id: string;
  title: string;
  content: string; // Markdown content
  media?: MediaItem[];
  boardId: string;
  authorId: string | null;
  createdAt: string;
}

export interface ProfilePost {
  id: string;
  title: string;
  content: string; // Markdown content
  media?: MediaItem[];
  authorId: string;
  createdAt: string;
  isExclusive?: boolean; // If true, only subscribers can see content (Deprecated/Legacy logic, preferring price now)
  price?: number; // Cost in Kopeki to view
  unlockedUserIds?: string[]; // List of users who paid
}

export interface Editorial {
  id: string;
  title: string;
  content: string; // Markdown content
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
  kopekiAmount?: number; // For money transfers
  isEncrypted?: boolean; // If content is E2EE
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
  entityId: string; // Can be postId or commentId
  type: VoteType;
}

export interface Subscription {
  userId: string;
  boardId: string;
}

export interface UserSubscription {
    subscriberId: string;
    creatorId: string;
    startedAt: string;
}

export interface Follow {
  followerId: string;
  followingId: string;
}

export interface Award {
    id: string;
    typeId: string; // matches id in AVAILABLE_AWARDS
    senderId: string;
    receiverId: string;
    entityId: string;
    entityType: 'post' | 'comment';
    createdAt: string;
}

export interface Advertisement {
  id: string;
  boardId: string;
  userId: string;
  title: string;
  content: string; // Text content
  imageUrl?: string;
  linkUrl: string;
  budget: number; // Total Kopeki allocated
  spent: number; // Total Kopeki spent so far
  model: 'CPC' | 'CPM'; // Cost Per Click or Cost Per Mille
  bidAmount: number; // Cost per 1 Click or per 1000 Views
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
  views: number;
  clicks: number;
  createdAt: string;
}