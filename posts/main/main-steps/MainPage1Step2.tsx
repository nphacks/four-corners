import { Context, Devvit, useInterval, useState, useWebView } from '@devvit/public-api';
 import type { DevvitMessage, WebViewMessage } from '../../../src/message.js';
 import { AppService } from '../../../services/AppService.tsx';
import { PostService } from '../../../services/PostService.tsx';
 
 interface MainPage1Step2Props {
     wordData: { word: string, corner: string };
     onCancel: () => void;
 }
 
 export const MainPage1Step2 = (
   props: MainPage1Step2Props,
   _context: Context
 ): JSX.Element => {
 
  const [username] = useState(async () => {
      return (await _context.reddit.getCurrentUsername()) ?? 'anon';
  });
  const [counter, setCounter] = useState(async () => {
    const redisCount = await _context.redis.get(`counter_${_context.postId}`);
    return Number(redisCount ?? 0);
  });
  const [imageUrl, setImageUrl] = useState(false);
  const [isExampleViewing, setExampleViewing] = useState(false);

  const appService = new AppService(_context)
  const postService = new PostService(_context);

  const webView = useWebView<WebViewMessage, DevvitMessage>({
    // URL of your web view content
    url: 'page.html',

    // Handle messages sent from the web view
    async onMessage(message, webView) {
      switch (message.type) {
        case 'webViewReady':
          webView.postMessage({
            type: 'initialData',
            data: {
              word: props.wordData.word,
              quarter: props.wordData.corner,
              imageUrl: ''
            },
          });
          break;
        case 'setImageUrl':
          
          let response = await appService.updateDrawingInformation(props.wordData.word, props.wordData.corner, username, message.data.newImageUrl)
          // console.log(response)
          if(response === 'success') {
            setImageUrl(true);
            if (message.data.closeWebView) { 
              webView.unmount(); 
              createGuessItPost()
            }
          }
          webView.postMessage({
            type: 'updateImageUrl',
            data: {
              currentImageUrl: message.data.newImageUrl,
            },
          });
          break;
        default:
          throw new Error(`Unknown error ocurred`);
      }
    },
    onUnmount() {
      _context.ui.showToast('Drawing submitted!');
    },
  });

  async function createGuessItPost(): Promise<void> {
    const { reddit, ui } = _context;
    const subreddit = await reddit.getCurrentSubreddit();
    const post = await _context.reddit.submitPost({
      title: 'Guess it!',
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" backgroundColor='white'>
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
    postService.createNewPost({
        postId: post.id,
        word: props.wordData.word
    });
    _context.ui.navigateTo(post);
  }

  return (
    <vstack width="100%" height="100%" alignment="center top" padding="large">
        <hstack alignment='end'><button onPress={() => props.onCancel()}>×</button></hstack>
        
        <vstack grow alignment="middle center">
        {!isExampleViewing ? (
            <vstack grow alignment="middle center">
              <text size='large' color="global-black">Time to Draw!</text>
              <spacer size="large" />
              <text color="#ae0945">Remember you have to draw only a part of the word,</text>
              <text color="#ae0945">NOT the entire word.</text>
              <spacer size="medium" />
              <hstack gap="small" alignment="center">
                <text color="global-black">Your word is</text>
                {props.wordData && (
                  <text color="global-black" weight="bold">{props.wordData.word}</text>
                )}
                <text color="global-black">and you will draw the</text>
                {props.wordData && (
                  <text color="global-black" weight="bold">{props.wordData.corner}</text>
                )}
                <text color="global-black">section</text>
              </hstack>
              <spacer size="medium" />
            </vstack>
           ) : (
            <vstack width="100%" height="80%" gap="small">
              <hstack width="100%" height="10%" alignment='center'>
                <text color="global-black">Word is: </text><text weight='bold' color="global-black"> Earth </text>
              </hstack>
              {/* Top row */}
              <hstack gap="small" width="100%" height="45%">
                {/* Top-left */}
                <vstack width="50%" height="100%" alignment="center middle" gap="small">
                  <image 
                    url="earth-top-left.png"
                    imageWidth={50}  // Internal dimensions
                    imageHeight={50}
                    width="100%"     // Relative to container
                    height="90%"    // Leaves space for text
                    resizeMode="fit"
                  />
                  <text color="global-black" alignment="end" size="small">top-left</text>
                </vstack>
                
                {/* Top-right */}
                <vstack width="50%" height="100%" alignment="center middle" gap="small">
                  <image 
                    url="earth-top-right.png"
                    imageWidth={50}
                    imageHeight={50}
                    width="100%"
                    height="90%"
                    resizeMode="fit"
                  />
                  <text color="global-black" alignment="end" size="small">top-right</text>
                </vstack>
              </hstack>
            
              {/* Bottom row */}
              <hstack gap="small" width="100%" height="45%">
                {/* Bottom-left */}
                <vstack width="50%" height="100%" alignment="center middle" gap="small">
                  <image 
                    url="earth-bottom-left.png"
                    imageWidth={50}
                    imageHeight={50}
                    width="100%"
                    height="90%"
                    resizeMode="fit"
                  />
                  <text color="global-black" alignment="end" size="small">bottom-left</text>
                </vstack>
                
                {/* Bottom-right */}
                <vstack width="50%" height="100%" alignment="center middle" gap="small">
                  <image 
                    url="earth-bottom-right.png"
                    imageWidth={50}
                    imageHeight={50}
                    width="100%"
                    height="90%"
                    resizeMode="fit"
                  />
                  <text color="global-black" alignment="end" size="small">bottom-right</text>
                </vstack>
              </hstack>
          </vstack>
           )}
        {/* <button onPress={() => props.onNext('Step2')}>Next</button> */}
        <spacer />
        {!imageUrl && (
          <hstack gap='large'>
            <button onPress={() => setExampleViewing(!isExampleViewing)}>{isExampleViewing ? 'Close example' : 'See an example'}</button>
            <button onPress={() => webView.mount()}>Ready To Draw?</button>
          </hstack>
        )}
        {imageUrl && <text color="green">Thank you! Your drawing is submitted!</text>}
        </vstack>
    </vstack>
  );
};
