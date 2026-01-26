
import { User, Board, Post, ProfilePost, Editorial, Comment, Message, Vote, Subscription, Follow, Transaction, Award, Advertisement, UserSubscription, VoteType } from '../types';

export class DemoContent {
    public static generateMockPublicKey(): string {
        let result = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        for (let i = 0; i < 392; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
        return `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA${result.substring(0, 100)}\n${result.substring(100, 200)}\n${result.substring(200, 300)}\n${result.substring(300)}IDAQAB`;
    }

    public static getInitialData() {
        const now = new Date().toISOString();
        const demo: User = {
            id: 'user-1',
            username: 'demo',
            password: 'password',
            role: 'user',
            createdAt: now,
            iconUrl: 'https://i.pravatar.cc/150?u=demo',
            bannerUrl: 'https://picsum.photos/seed/theqult-banner/1000/200',
            bio: 'Just a demo user.',
            junkSenders: [],
            kopeki: 1000,
            countryCode: 'IT',
            publicKey: this.generateMockPublicKey(),
            isVerified: false,
            isPendingVerification: false
        };

        const admin: User = {
            id: 'user-admin',
            username: 'theqult',
            password: 'theqult',
            role: 'admin',
            createdAt: now,
            iconUrl: 'https://i.pravatar.cc/150?u=theqult',
            bannerUrl: 'https://picsum.photos/seed/theqult-banner/1000/200',
            bio: 'Admin.',
            junkSenders: [],
            kopeki: 50000,
            countryCode: 'US',
            publicKey: this.generateMockPublicKey(),
            isVerified: true,
            isPendingVerification: false
        };

        const board: Board = {
            id: 'board-1',
            name: 'react',
            description: 'React.js',
            creatorId: 'user-1',
            createdAt: now,
            moderatorIds: [],
            adminIds: ['user-1'],
            allowAnonymousComments: true,
            allowAnonymousPosts: true,
            iconUrl: 'https://styles.redditmedia.com/t5_2zmdy/styles/communityIcon_512x512.png?width=256&s=8a6556e3325c3ac1f93f63901b0f1de23a233c06',
            bannerUrl: 'https://styles.redditmedia.com/t5_2zmdy/styles/bannerBackgroundImage_1920x384.png'
        };

        return {
            users: [demo, admin],
            boards: [board],
            posts: [{
                id: 'post-1',
                title: 'Welcome!',
                content: 'Demo post.',
                media: [{ id: 'media-1', type: 'image' as const, url: 'https://picsum.photos/600/400' }],
                boardId: 'board-1',
                authorId: 'user-1',
                createdAt: now
            }],
            profilePosts: [{
                id: 'profile-post-1',
                title: 'Profile Post!',
                content: 'On profile.',
                authorId: 'user-1',
                createdAt: now,
                media: [],
                price: 0
            }],
            editorials: [{
                id: 'editorial-1',
                title: 'Editorials!',
                content: 'Official.',
                authorId: 'user-admin',
                createdAt: now,
                media: []
            }],
            comments: [{
                id: 'comment-1',
                content: 'First comment.',
                postId: 'post-1',
                authorId: 'user-1',
                parentId: null,
                createdAt: now
            }],
            messages: [{
                id: 'msg-1',
                senderId: 'user-admin',
                recipientId: 'user-1',
                content: 'Welcome!',
                createdAt: now
            }],
            votes: [{ userId: 'user-1', entityId: 'post-1', type: 'up' as VoteType }],
            subscriptions: [{ userId: 'user-1', boardId: 'board-1' }],
            follows: [{ followerId: 'user-admin', followingId: 'user-1' }],
            transactions: [{
                id: 'tx-1',
                userId: 'user-1',
                type: 'buy' as const,
                amount: 1000,
                currencyAmount: 0.10,
                description: 'Bonus',
                createdAt: now
            }],
            awards: [] as Award[],
            ads: [] as Advertisement[],
            userSubscriptions: [] as UserSubscription[]
        };
    }
}
