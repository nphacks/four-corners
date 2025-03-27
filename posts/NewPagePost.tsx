import { Context, Devvit, useAsync, useForm, useState, useWebView } from '@devvit/public-api';
import type { DevvitGuessMessage, WebViewGuessMessage } from '../src/message.js';

import { CommentService } from '../services/CommentService.js';
import { PostService } from '../services/PostService.tsx';
import { AppService } from '../services/AppService.tsx';

interface NewPagePostProps {
}
export type PostId = `t3_${string}`;
export type PostData = {
    postId: PostId;
    postType: string;
    word: string;
  };

export const NewPagePost = (props: NewPagePostProps, context: Context): JSX.Element => {
  const commentService = new CommentService(context);
  const postService = new PostService(context);
  const appService = new AppService(context);
    const [guessedRight, setGuessedRight] = useState(false);
    const [drawingsSeen, setDrawingSeen] = useState(false);

    const guessForm = useForm({
      title: 'Guess the word',
      description: "Your answer will be commented!",
      acceptLabel: 'Submit Guess',
      fields: [{
        type: 'string',
        name: 'guess',
        label: 'Word',
        required: true,
      }],
    },
    async (values) => {
      const guess = values.guess.trim().toLowerCase();
      const word = await postService.getPostWord(context.postId as PostId) ?? 'No word found';
      if(guess === word) {
        setGuessedRight(true)
        handleComment(word)
        appService.addUserScore(await context.reddit.getCurrentUsername() ?? 'anon', 3)
        const drawingInformation = await appService.getDrawingInformation(word)
        await appService.addUserScore(drawingInformation.creator1, 5)
        await appService.addUserScore(drawingInformation.creator2, 5)
        await appService.addUserScore(drawingInformation.creator3, 5)
        await appService.addUserScore(drawingInformation.creator4, 5)
      }
  });
    

  async function handleComment(word: string)  {
    const guess = word;
    const postID: PostId = context.postId as PostId;
    const postData: PostData =  { postId: postID, postType: 'newpage', word: word}
    const username = await context.reddit.getCurrentUsername() ?? 'anon'
    await commentService.commentSolved({
        postData,
        username,
        guess,
        createComment: true
    })
  }

  const webView = useWebView<WebViewGuessMessage, DevvitGuessMessage>({
    // URL of your web view content
    url: 'guess.html',
    // Handle messages sent from the web view
    async onMessage(message, webView) {
      switch (message.type) {
        case 'webViewReady':
          const fetchedWord = await postService.getPostWord(context.postId as PostId) ?? 'No word found';
          const wordInformation = await appService.getDrawingInformation(fetchedWord)
          webView.postMessage({
            type: 'initialData',
            data: {
              image1: wordInformation.image1,
              image2: wordInformation.image2,
              image3: wordInformation.image3,
              image4: wordInformation.image4  
            },
          });
          break;
        case 'setViewing':
          if (message.data.closeWebView) { 
            webView.unmount(); 
            setDrawingSeen(true)
          }
          break;
        default:
          throw new Error(`Unknown error ocurred`);
      }
    },
    onUnmount() {
      context.ui.showToast('Drawing seen!');
    },
  });

  const GuessScreen = (
    <vstack width="100%" height="100%" alignment="center middle">
      <text color='global-black' size='xxlarge' weight='bold'>Guess your answer</text>
      <spacer size='medium'/>
      <text color='global-black' size='small' weight='bold'>LOOK CAREFULLY! You will get only 15 seconds to see the drawings</text>
      <spacer size='medium'/>
      {/* <button onPress={handleComment}>Create correct comment</button> */}
      {!drawingsSeen ? <button onPress={() => {webView.mount()}}>See the drawings</button> : ''}
      {drawingsSeen ? <button onPress={() => context.ui.showForm(guessForm)}>Take a guess!</button> : ''}
      <spacer size='large'/>
      {guessedRight ? <text color='red' size='small' weight='bold'>You lost!</text> : ''}
      {guessedRight ? <text color='green' size='small' weight='bold'>You won!</text> : ''}
      {guessedRight ? <text color='global-black' size='small' weight='bold'>You will be recognized in the comments in 2 minutes.</text> : ''}
      <spacer size='medium'/>
    </vstack>
  );

  // const Result = (
  //     <vstack width="100%" height="100%" alignment="center middle">
  //         <text>Your result</text>
  //         <button onPress={handleComment}>Create correct comment</button>
  //     </vstack>
  // );

    // const onClose = (): void => {
    //     setPage('menu');
    // };

  // const pages: Record<string, JSX.Element> = {
  //   menu: Menu,
  //   result: Result
  // };

  return GuessScreen;
    // return Menu;
};