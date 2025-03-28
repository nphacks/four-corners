import { Context, Devvit, useInterval, useState } from '@devvit/public-api';
import { AppService } from '../../../services/AppService.tsx';

interface MainPage1Step1Props {
  words: { word: string, corner: string }[];
  onCancel: () => void;
  onNext: (data: { word: string, corner: string }) => void;
}

export const MainPage1Step1 = (
  props: MainPage1Step1Props,
  _context: Context
): JSX.Element => {

  let [isWordSelectValid, setWordSelectValid] = useState(true)
  const appService = new AppService(_context);

  async function handleWordSelect(word: string, corner: string) {
    let username = await _context.reddit.getCurrentUsername() || 'Anonymous'
    let hasDrawn = await appService.hasUserDrawn(word, username)
    if(username && !hasDrawn) {
      props.onNext({ word, corner })
    } else {
      setWordSelectValid(false)
    }
  }

  return (
    <vstack width="100%" height="100%" alignment="center top" padding="large">
      <hstack alignment='end'><button onPress={() => props.onCancel()}>×</button></hstack>
      <text size='xxlarge' color='global-black' weight='bold'>Choose The Word to Draw</text>
      {!isWordSelectValid && (
        <text color="red">Select again, you already drew for this word</text>
      )}
      <spacer size='medium' />
      {/* <text>Words: {props.words.join(', ')}</text> */}
      <hstack gap="medium" alignment="center middle" width="100%" height="60%" padding="medium">
        {props.words.map(({word, corner}) => (
          <vstack 
            gap="small" 
            alignment="center middle"
            backgroundColor="#f5f5f5"
            cornerRadius="medium"
            width="30%"  // Equal width for each item
            padding="small"
            grow={true}  // Allow items to expand
            onPress={() => handleWordSelect(word, corner)}
          >
            <image 
              url={`${corner}.png`}
              height={100}  // Increased size
              width="100%"  // Use full container width
              imageHeight={200}
              imageWidth={300}
              resizeMode="fit"  
            />
            <text size="large" weight="bold" color='global-black'>{word}</text>
          </vstack>
        ))}
      </hstack>
    </vstack>
  );
};
