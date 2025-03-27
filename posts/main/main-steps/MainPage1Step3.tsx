import { Context, Devvit, useInterval, useState } from '@devvit/public-api';

interface MainPage1Step3Props {
  onCancel: () => void;
}

export const MainPage1Step3 = (
  props: MainPage1Step3Props,
  _context: Context
): JSX.Element => {
  
  return (
    <vstack width="100%" height="100%" alignment="center top" padding="large">
      <text>Step 3 of Main Page</text>
      <button onPress={() => props.onCancel()}>Cancel</button>
    </vstack>
  );
};