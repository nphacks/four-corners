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

export enum DrawingCorner {
    TOP_LEFT = '1',
    TOP_RIGHT = '2',
    BOTTOM_LEFT = '3',
    BOTTOM_RIGHT = '4'
}

export class AppService {
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
        testOpenWords: 'test-open-words',
        testNewWords: 'test-new-words',
        testClosedWords: 'test-closed-words',
        openWords: 'open-words',
        newWords: 'new-words',
        closedWords: 'closed-words',
        drawing: (word: string) => `drawing:${word}`,
        post: (post: Post) => `post:${post.id}`,
        postData: (postId: PostId) => `post:${postId}`,
        userData: (username: string) => `users:${username}`,
      };


    async addWordsToRedis(key: string, strings: string[]): Promise<void> {
        await this.redis.set(key, JSON.stringify(strings)); 
        this.testIfWordsWereAdded(key)
    }
    
    async testIfWordsWereAdded(key: string) {
        const exists = await this.redis.exists(key);
        if (!exists) return [];
        const data = await this.redis.get(key);
    }

    async getRandomWords(key: string, limit: number): Promise<string[]> {
        const exists = await this.redis.exists(key); 
        // console.log('Key exists:', exists);
        if (!exists) return []; 
        // console.log('Key used:', key);
        const data = await this.redis.get(key); 
        // console.log('data', data)
        if (!data) return []; 
        const strings: string[] = JSON.parse(data); 
        // console.log('strings', strings)
        const shuffled = strings.sort(() => 0.5 - Math.random()); 
        // console.log(shuffled)
        return shuffled.slice(0, limit); 
    }

    async shiftWordBetweenLists(word: string, fromKey: string, toKey: string) {
        const fromData = await this.redis.get(fromKey) || '[]';
        const fromList = JSON.parse(fromData);
        const toData = await this.redis.get(toKey) || '[]';
        const toList = JSON.parse(toData);
        
        if (fromList.includes(word)) {
            const updatedFrom = fromList.filter((w: any) => w !== word);
            await this.redis.set(fromKey, JSON.stringify(updatedFrom));
            
            if (!toList.includes(word)) {
                await this.redis.set(toKey, JSON.stringify([...toList, word]));
            }
        }
    }

    async getDrawingInformation(word: string): Promise<Record<string, string>> {
        const drawingKey = this.keys.drawing(word);
        const exists = await this.redis.exists(drawingKey);
        if (!exists) throw new Error('Drawing does not exist!');
        const data = await this.redis.hGetAll(drawingKey)
        // console.log(data)
        return data;
    }

    async updateDrawingInformation(word: string, corner: string, creator: string, image: string) {
        const drawingKey = this.keys.drawing(word);
        const exists = await this.redis.exists(drawingKey);

        // Determine suffix based on corner
        const suffix = {
            'top-left': '1',
            'top-right': '2',
            'bottom-left': '3',
            'bottom-right': '4'
        }[corner];
        
        if (!exists) {
            // Create new drawing and move word from new to open
            await this.redis.hSet(drawingKey, {
                'status': 'open',
                [`corner${suffix}`]: corner,
                [`creator${suffix}`]: creator,
                [`image${suffix}`]: image,
                'word': word
            });
            // await this.shiftWordBetweenLists(word, this.keys.newWords, this.keys.openWords);            <<<<<<<<<<<<<<<<<<<UPDATE THIS
            await this.shiftWordBetweenLists(word, this.keys.testNewWords, this.keys.testOpenWords);
            return 'success';
        } else {
            await this.redis.hSet(drawingKey, {
                'status': 'open',
                [`corner${suffix}`]: corner,
                [`creator${suffix}`]: creator,
                [`image${suffix}`]: image
            });
            await this.checkAndUpdateStatus(word);
        }
        return 'success';
    }

    async checkAndUpdateStatus(word: string) {
        const drawingKey = this.keys.drawing(word);
        const data = await this.redis.hGetAll(drawingKey);
        
        // Check if all 4 corners have creator and image data
        const isComplete = [1, 2, 3, 4].every(i => 
          data[`creator${i}`] && data[`image${i}`]
        );
        
        if (isComplete) {
          await this.redis.hSet(drawingKey, {
            'status': 'closed'
          });
        //   await this.shiftWordBetweenLists(word, this.keys.openWords, this.keys.closedWords);            <<<<<<<<<<<<<<<<<<<UPDATE THIS
            await this.shiftWordBetweenLists(word, this.keys.testOpenWords, this.keys.testClosedWords);
            return 'closed';
        }
        return 'open';
    }

    async getNextCornerToDraw(word: string): Promise<string | null> {
        const drawingKey = this.keys.drawing(word);
        const data = await this.redis.hGetAll(drawingKey);
    
        // Check if drawing is closed
        if (data.status === 'closed') {
            return null;
        }
    
        // Check corners in order
        if (!data.corner1 || !data.creator1 || !data.image1) {
            return 'top-left';
        }
        if (!data.corner2 || !data.creator2 || !data.image2) {
            return 'top-right';
        }
        if (!data.corner3 || !data.creator3 || !data.image3) {
            return 'bottom-left';
        }
        if (!data.corner4 || !data.creator4 || !data.image4) {
            return 'bottom-right';
        }
    
        // All corners are complete
        return 'all-corners';
    }

    async hasUserDrawn(word: string, username: string): Promise<boolean> {
        const drawingKey = this.keys.drawing(word);
        const data = await this.redis.hGetAll(drawingKey);
        
        // Safely check each creator field
        return [1, 2, 3, 4].some(i => 
            data[`creator${i}`] === username
        );
    }

    async addUserScore(username: string, addScore: number) {
        await this.redis.zIncrBy('leaderboard', username, addScore);
    }

    // Add/update user score in leaderboard
    async updateLeaderboard(username: string, score: number) {
        await this.redis.zAdd('leaderboard', { score, member: username });
    }

    // Get single user's score and rank
    async getUserStats(userId: string) {
        const score = await this.redis.zScore('leaderboard', userId);
        const allMembers = await this.redis.zRange('leaderboard', 0, -1, {
          by: 'rank',
          reverse: true
        });

        const userEntry = allMembers.find(item => {
            return item.member === userId
        });
        const rank = userEntry 
            ? allMembers.findIndex(item => item.score >= userEntry.score) + 1
            : null;

        return {
            score,
            rank
        };
    }
    
    // Get top 10 users from leaderboard
    async getTop10() {
        return await this.redis.zRange('leaderboard', 0, 9, { by: 'rank', reverse: true });
    }

    // --------------Helper Functions--------------

    async helperDeleteKeys(key: string) {
        await this.redis.del(key); 
    }

    // --------------Practice code--------------

    async addStringsToRedis(key: string, strings: string[]): Promise<void> {
        // console.log('Key stored to:', key);
        await this.redis.set(key, JSON.stringify(strings)); // Store array as a JSON string
    }

    async getRandomStrings(key: string): Promise<string[]> {
        const exists = await this.redis.exists(key); // Check if key exists
        // console.log('Key exists:', exists);
        if (!exists) return []; // Handle missing key
        // console.log('Key used:', key);
        const data = await this.redis.get(key); // Retrieve JSON string
        // console.log('data', data)
        if (!data) return []; // Handle empty case
        const strings: string[] = JSON.parse(data); // Parse JSON to array
        // console.log('strings', strings)
        const shuffled = strings.sort(() => 0.5 - Math.random()); // Shuffle array
        // console.log(shuffled)
        return shuffled.slice(0, 2); // Return 2 random strings
    }

    async updateStringsToRedis(key: string, newStrings: string[]): Promise<void> {
        const data = await this.redis.get(key); // Retrieve existing JSON string
        const existingStrings: string[] = data ? JSON.parse(data) : []; // Parse or initialize empty array
        const updatedStrings = [...existingStrings, ...newStrings]; // Merge arrays
        await this.redis.set(key, JSON.stringify(updatedStrings)); // Save updated array back to Redis
    }
}