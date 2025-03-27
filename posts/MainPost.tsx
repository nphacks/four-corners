import { Context, Devvit, useAsync, useState } from '@devvit/public-api';
import { PostService } from '../services/PostService.js';

import { MainPage1 } from './main/MainPage1.js';
import { MainPage2 } from './main/MainPage2.js';
import { AppService } from '../services/AppService.tsx';

interface MainPostProps {
}

export const MainPost = (props: MainPostProps, context: Context): JSX.Element => {
  const service = new PostService(context);
  const appService = new AppService(context);
  const [page, setPage] = useState('menu');
  const [words, setWords] = useState<{ word: string, corner: string }[]>([]);
  const [top10, setTop10] = useState<{ member: string, score: number }[]>([]);
  const [userStats, setUserStats] = useState<{ member: string, rank: number, score: number }>({member: '', rank: 0, score: 0});
  const buttonWidth = '256px';
  const buttonHeight = '48px';
  const logoWidth = '150px';
  const logoHeight = '200px';

  const Menu = (
    <vstack width="100%" height="100%" alignment="center middle">
      <image
        imageWidth={2}
        imageHeight={16}
        height="50%"
        width="35%"
        url="logo.png"
        description="Four corners logo"
        resizeMode="cover"
      />
      <spacer />
      <vstack alignment="center middle" gap="small">
        <button
          width={buttonWidth}
          // appearance="plain"
          // backgroundColor="#FC9FC3"
          height={buttonHeight}
          onPress={() => drawPage()}
        >Draw</button>
        <button
          width={buttonWidth}
          // appearance="plain"
          height={buttonHeight}
          onPress={goToLeaderboard}
        >Leaderboard</button>
        
        {/* <button 
            width={buttonWidth}
            appearance="primary"
            height={buttonHeight}
            onPress={onPostHandler}
        >New Post</button> */}
        {/* <button
          width={buttonWidth}
          appearance="primary"
          height={buttonHeight}
          onPress={() => { appService.testIfWordsWereAdded(appService.keys.testOpenWords)}}
        >Test Word</button> */}
      </vstack>
    </vstack>
  );

  const onClose = (): void => {
    setPage('menu');
  };

  const drawPage = async () => {
    const [openWords, newWords] = await Promise.all([
                                        appService.getRandomWords(appService.keys.testOpenWords, 2), 
                                        appService.getRandomWords(appService.keys.testNewWords, 1)]);
    // const [openWords, newWords] = await Promise.all([
    //   appService.getRandomWords(appService.keys.openWords, 2),             <<<<<<<<<<<<<<<<<<<UPDATE THIS
    //   appService.getRandomWords(appService.keys.newWords, 1)]);            <<<<<<<<<<<<<<<<<<<UPDATE THIS
    const wordsWithCorners = await Promise.all(
      [...openWords, ...newWords].map(async (word) => ({
          word,
          corner: await appService.getNextCornerToDraw(word) || 'top-left' // fallback
      }))
    );
  
    setWords(wordsWithCorners);
    setPage('page1')
  }
  
  async function goToLeaderboard() {
    const username = await context.reddit.getCurrentUsername() ?? 'anon' 
    const top10 = await appService.getTop10()
    setTop10(top10)
    const stats = await appService.getUserStats(username);
    const userStats = {
      member: username,  
      score: stats.score ?? 0,  
      rank: stats.rank ?? 0     
    };
    setUserStats(userStats);
    setPage('page2')
  }
  

  const pages: Record<string, JSX.Element> = {
    menu: Menu,
    page1: <MainPage1 {...props} words={words} onCancel={onClose} onNext={() => {}} />,
    page2: <MainPage2 {...props} top10={top10} userStats={userStats} onCancel={onClose} />
  };

  return pages[page] || Menu;
};
