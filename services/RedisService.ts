import { RedisClient } from '@devvit/public-api';

export class RedisService {
  readonly redis: RedisClient;

  constructor(context: { redis: RedisClient }) {
    this.redis = context.redis;
  }

  async isDataLoaded(): Promise<boolean> {
    const loaded = await this.redis.get('data_loaded');
    return loaded === 'true';
  }

  async loadDataOnce(): Promise<void> {
    if (await this.isDataLoaded()) return;

    const array1 = ['item1', 'item2'];
    const array2 = ['item3', 'item4'];
    const array3 = ['item5', 'item6'];

    await this.redis.set('array1', JSON.stringify(array1));
    await this.redis.set('array2', JSON.stringify(array2));
    await this.redis.set('array3', JSON.stringify(array3));

    await this.redis.set('data_loaded', 'true');
  }

  async addToArray(arrayName: string, item: string): Promise<void> {
    const data = await this.redis.get(arrayName);
    const array = data ? JSON.parse(data) : [];
    array.push(item);
    await this.redis.set(arrayName, JSON.stringify(array));
  }

  async removeFromArray(arrayName: string, item: string): Promise<void> {
    const data = await this.redis.get(arrayName);
    if (!data) return;
    const array = JSON.parse(data).filter((i: string) => i !== item);
    await this.redis.set(arrayName, JSON.stringify(array));
  }
}