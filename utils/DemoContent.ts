
import { User, Board, Post, ProfilePost, Editorial, Comment, Message, Vote, Subscription, Follow, Advertisement, VoteType } from '../types';

export class DemoContent {
    public static generateMockPublicKey(): string {
        let result = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        for (let i = 0; i < 392; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
        return `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA${result.substring(0, 100)}\n${result.substring(100, 200)}\n${result.substring(200, 300)}\n${result.substring(300)}IDAQAB`;
    }

    public static getInitialData() {
        const now = new Date().toISOString();
        const demo: User = { id: 'user-1', username: 'demo', password: 'password', role: 'user', createdAt: now, iconUrl: 'https://i.pravatar.cc/150?u=demo', bio: 'Demo user.', publicKey: this.generateMockPublicKey() };
        const admin: User = { id: 'user-admin', username: 'theqult', password: 'theqult', role: 'admin', createdAt: now, iconUrl: 'https://i.pravatar.cc/150?u=theqult', bio: 'Admin.', publicKey: this.generateMockPublicKey() };
        const board: Board = { id: 'board-1', name: 'react', description: 'React.js community', creatorId: 'user-1', createdAt: now, moderatorIds: [], adminIds: ['user-1'], allowAnonymousComments: true, allowAnonymousPosts: true };

        return {
            users: [demo, admin],
            boards: [board],
            posts: [{ id: 'post-1', title: 'Welcome!', content: 'Welcome to the platform.', boardId: 'board-1', authorId: 'user-1', createdAt: now }],
            profilePosts: [{ id: 'profile-post-1', title: 'Hello!', content: 'Check my profile.', authorId: 'user-1', createdAt: now }],
            editorials: [{ id: 'editorial-1', title: 'Official News', content: 'New updates.', authorId: 'user-admin', createdAt: now }],
            comments: [],
            messages: [],
            votes: [],
            subscriptions: [{ userId: 'user-1', boardId: 'board-1' }],
            follows: [],
            ads: []
        };
    }
}
