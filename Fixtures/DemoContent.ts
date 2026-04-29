
import { User, Board, Post, ProfilePost, Editorial, Comment, Message, Vote, Subscription, Follow } from '../types';

export class DemoContent {
    public static getInitialData() {
        const now = new Date().toISOString();
        const demo: User = { id: 'user-1', username: 'demo', password: 'password', role: 'user', createdAt: now, iconUrl: 'https://i.pravatar.cc/150?u=demo', bio: 'I am a demo user exploring the platform.', isVerified: true };
        const admin: User = { id: 'user-admin', username: 'theqult', password: 'theqult', role: 'admin', createdAt: now, iconUrl: 'https://i.pravatar.cc/150?u=theqult', bio: 'Platform administrator and curator.', isVerified: true };
        const board: Board = { id: 'board-1', name: 'general', description: 'General discussion and announcements.', creatorId: 'user-admin', createdAt: now, moderatorIds: [], adminIds: ['user-admin'], allowAnonymousComments: true, allowAnonymousPosts: true };
        const board2: Board = { id: 'board-2', name: 'tech', description: 'Everything about technology and gadgets.', creatorId: 'user-1', createdAt: now, moderatorIds: [], adminIds: ['user-1'], allowAnonymousComments: false, allowAnonymousPosts: false };

        return {
            users: [demo, admin],
            boards: [board, board2],
            posts: [
                { id: 'post-1', title: 'Welcome to The Qult!', content: 'We are excited to have you here. Explore the boards and start participating!', boardId: 'board-1', authorId: 'user-admin', createdAt: now, media: [], countryCode: 'IT' },
                { id: 'post-2', title: 'The new map feature is live', content: 'Check out the world map to see our global presence.', boardId: 'board-1', authorId: 'user-admin', createdAt: now, media: [], countryCode: 'US' }
            ],
            profilePosts: [
                { id: 'profile-post-1', title: 'My first profile update', content: 'Just setting up my profile.', authorId: 'user-1', createdAt: now, media: [], countryCode: 'GB' }
            ],
            editorials: [
                { id: 'editorial-1', title: 'Manifesto: The Future of Digital Privacy', content: 'In an era of mass surveillance, The Qult stands as a bastion of free expression and anonymous interaction. Our commitment to privacy is absolute.', authorId: 'user-admin', createdAt: now, media: [], countryCode: 'CH' }
            ],
            comments: [
                { id: 'comment-1', content: 'Great to be here!', postId: 'post-1', authorId: 'user-1', parentId: null, createdAt: now, media: [], countryCode: 'IT' }
            ],
            messages: [],
            votes: [],
            subscriptions: [
                { userId: 'user-1', boardId: 'board-1' },
                { userId: 'user-1', boardId: 'board-2' }
            ],
            follows: []
        };
    }
}
