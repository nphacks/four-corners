import type {
    Post,
    RedditAPIClient,
    RedisClient,
    Scheduler,
    ZRangeOptions,
} from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';
import {UserData} from '../src/types.js'

export type PostId = `t3_${string}`;
export enum PostType {
    MAIN = 'main',
    NEWPAGE = 'newpage'
}

export class UserDataService {
    readonly redis: RedisClient;
    readonly reddit?: RedditAPIClient;
    readonly scheduler?: Scheduler;

    constructor(context: { redis: RedisClient; reddit?: RedditAPIClient; scheduler?: Scheduler }) {
        this.redis = context.redis;
        this.reddit = context.reddit;
        this.scheduler = context.scheduler;
    }

    readonly keys = {
       
    };

    
}
