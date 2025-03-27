import type { Context } from '@devvit/public-api';
import { Devvit, useState } from '@devvit/public-api';
import { MainPost } from '../posts/MainPost.js';
import { NewPagePost } from '../posts/NewPagePost.js';
import { PostService } from '../services/PostService.js';

export type PostId = `t3_${string}`;

export const Router: Devvit.CustomPostComponent = (context: Context) => {
    const postId = context.postId as PostId;
    const postService = new PostService(context)

    const [data] = useState<{
        postType: string;
    }>(async () => {
        // First batch
        const [postType, username] = await Promise.all([postService.getPostType(postId), await context.reddit.getCurrentUsername() ?? 'anon']);
    
        return {
          postType,
          username,
        };
    });

  const postTypes: Record<string, JSX.Element> = {
    main: (
        <MainPost/>
    ),
    newpage: (
        <NewPagePost />
    ),
    
    // Add more post types here
  };

  /*
   * Return the custom post unit
   */
  // console.log('Post type => ', data)

  return (
    <zstack width="100%" height="100%" alignment="top start">
      <image
        imageHeight={1024}
        imageWidth={2048}
        height="100%"
        width="100%"
        url="4corners-background.png"
        description="Background"
        resizeMode="cover"
      />
      {data.postType}
      {postTypes[data.postType] || (
        <vstack alignment="center middle" grow>
          <text>Error: Unknown post type</text>
        </vstack>
      )}
    </zstack>
  );
};
