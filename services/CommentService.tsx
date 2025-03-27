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
export type PostData = {
    postId: PostId;
    postType: string;
    word: string;
  };

export class CommentService {
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
        guessComments: (postId: PostId) => `guess-comments:${postId}`,
        postUserGuessCounter: (postId: PostId) => `user-guess-counter:${postId}`,
    };

    async commentSolved(event: {
        postData: PostData;
        username: string;
        guess: string;
        createComment: boolean;
      }): Promise<number> {
        if (!this.reddit || !this.scheduler) {
          console.error('Reddit API client or Scheduler not available in Service');
          return 0;
        }
        const promises: Promise<unknown>[] = [];
        
        const in2Min = new Date(Date.now() + 2 * 60 * 1000);
        promises.push(
          this.scheduler.runJob({
            name: 'SOLVED_COMMENT',
            data: {
              postId: event.postData.postId,
              username: event.username,
            },
            runAt: in2Min,
          })
        );
    
        await Promise.all(promises);
        return 0;
    }

    async saveGuessComment(postId: PostId, guess: string, commentId: string): Promise<void> {
        await this.redis.hSet(this.keys.guessComments(postId), { [guess]: commentId });
    }
}