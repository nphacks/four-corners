import { Devvit } from '@devvit/public-api';
import { AppService } from '../services/AppService.tsx';

// Adds a new menu item to the subreddit allowing to create a new post
Devvit.addMenuItem({
  label: '4 Corners',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const appService = new AppService(context)
    const testopenWords = ['skyscraper', 'helicopter', 'waterfall', 'windmill', 'volcano', 'jellyfish', 'submarine', 'pizza', 'robot', 'flower', 'crab', 'train', 'cake']
    const testnewWords = ['earth', 'pyramid', 'sailboat', 'sushi', 'eiffel tower', 'taj mahal', 'sphinx', 'statue of liberty', 'alarm clock', 'backpack', 'binoculars', 
                      'chandelier', 'bunk bed', 'toaster', 'umbrella', 'fire hydrant', 'mailbox', 'teapot', 'traffic light', 'bird house', 'wristwatch', 'frying pan', 
                      'ladder', 'hammock', 'street sign', 'guitar', 'wheelchair', 'shopping cart', 'telescope', 'vending machine', 'microphone']
    const openWords = []
    const newWords = []
    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: 'Draw and Guess',
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: (
        <vstack height="100%" width="100%" alignment="middle center" backgroundColor='white'>
          <image
            imageWidth={100}
            imageHeight={100}
            height="100%"
            width="100%"
            url="loading.gif"
            description="Four corners logo"
            resizeMode="cover"
          />
        </vstack>
      ),
    });
    post.sticky(),
    // appService.addWordsToRedis(appService.keys.openWords, openWords)            <<<<<<<<<<<<<<<<<<<UPDATE THIS
    // appService.addWordsToRedis(appService.keys.newWords, newWords)            <<<<<<<<<<<<<<<<<<<UPDATE THIS
    appService.addWordsToRedis(appService.keys.testOpenWords, testopenWords)
    appService.addWordsToRedis(appService.keys.testNewWords, testnewWords) 
    ui.showToast({ text: 'Created post!' });
    ui.navigateTo(post);
  },
});
