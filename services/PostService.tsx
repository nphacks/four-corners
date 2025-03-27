import type {
    Post,
    RedditAPIClient,
    RedisClient,
    Scheduler,
    ZRangeOptions,
} from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';

export type PostId = `t3_${string}`;
export enum PostType {
    MAIN = 'main',
    NEWPAGE = 'newpage'
}

export class PostService {
    readonly redis: RedisClient;
    readonly reddit?: RedditAPIClient;
    readonly scheduler?: Scheduler;

    constructor(context: { redis: RedisClient; reddit?: RedditAPIClient; scheduler?: Scheduler }) {
        this.redis = context.redis;
        this.reddit = context.reddit;
        this.scheduler = context.scheduler;
    }

    readonly keys = {
        gameSettings: 'game-settings',
        postData: (postId: PostId) => `post:${postId}`,
        userData: (username: string) => `users:${username}`,
      };

    /*
     * Post data
     */

    async getPostType(postId: PostId) {
        const key = this.keys.postData(postId);
        const postType = await this.redis.hGet(key, 'postType');
        const defaultPostType = 'main';
        return (postType ?? defaultPostType) as PostType;
    }

    /*
     * Handle drawing submissions
     */

    async createNewPost(data: {
        postId: PostId;
        word: string;
    }): Promise<void> {
        if (!this.scheduler || !this.reddit) {
            console.error('Unknown Error: New post could not be create.');
            return;
        }
        const key = this.keys.postData(data.postId);
        await Promise.all([
            // Save post object
            this.redis.hSet(key, {
                postId: data.postId,
                date: Date.now().toString(),
                postType: 'newpage',
                word: data.word
            })
        ]);
    }

    async getPostWord(postId: PostId): Promise<string | undefined> {
        const key = this.keys.postData(postId);
        return await this.redis.hGet(key, 'word') ;
    }
    
    /*
     * Pinned Post
     */

    async savePinnedPost(postId: PostId): Promise<void> {
        const key = this.keys.postData(postId);
        await this.redis.hSet(key, {
        postId,
        postType: 'pinned',
        });
    }

    async getPinnedPost(postId: PostId): Promise<any> {
        const key = this.keys.postData(postId);
        const postType = await this.redis.hGet(key, 'postType');
        return {
            postId,
            postType: postType ?? 'pinned',
        };
    }
}
