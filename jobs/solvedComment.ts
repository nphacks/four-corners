import { Devvit } from '@devvit/public-api';

export const firstSolveComment = Devvit.addSchedulerJob({
  name: 'SOLVED_COMMENT',
  onRun: async (
    event: {
      data: {
        postId: string;
        username: string;
      };
    },
    context
  ) => {
    if (event.data) {
        // console.log('Event data => ', event.data, event.data.postId, event.data.username)
      try {
        await context.reddit.submitComment({
          id: event.data.postId,
          text: `u/${event.data.username} solved this!`,
        });
      } catch (error) {
        console.error('Failed to submit comment:', error);
      }
    }
  },
});