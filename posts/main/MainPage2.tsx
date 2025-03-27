import { Context, Devvit, useAsync, useState } from '@devvit/public-api';
import { AppService } from '../../services/AppService.tsx';

interface MainPage2Props {
  top10: {member:string, score: number}[];
  userStats: {member:string, rank: number, score: number}
  onCancel: () => void;
}

export const MainPage2 = (props: MainPage2Props, context: Context): JSX.Element => {
  const { top10, userStats, onCancel } = props;
  const userInTop10 = top10.some(user => user.member === userStats.member);

  return (
    <vstack width="100%" height="100%" alignment="center top" padding="large">
      <hstack alignment="end" width="100%">
        <button onPress={onCancel}>×</button>
      </hstack>
      
      <text size="xxlarge" weight="bold" color='global-black'>Leaderboard</text>
      <spacer size='medium'/>
      {/* Top 10 List */}
      <vstack width="100%" gap="small">
        {top10.map((user, index) => (
          <hstack 
            width="100%" 
            padding="small"
            backgroundColor={user.member === userStats.member ? "#ae09453b" : "transparent"}
            cornerRadius="medium"
          >
            <text width="20%" color='global-black'>{index + 1}.</text>
            <text width="60%" color='global-black'>{user.member}</text>
            <text width="20%" alignment="end" color='global-black'>{user.score}</text>
          </hstack>
        ))}
        
        {/* Show user stats if not in top10 */}
        {!userInTop10 && (
          <vstack width="100%" padding="medium" gap="small">
            <text color='global-black'>Your position:</text>
            <hstack width="100%" padding="small" backgroundColor="#ae09453b" cornerRadius="medium">
              <text width="20%" color='global-black'>{userStats.rank}.</text>
              <text width="60%" color='global-black'>{userStats.member}</text>
              <text width="20%" alignment="end" color='global-black'>{userStats.score}</text>
            </hstack>
          </vstack>
        )}
      </vstack>
    </vstack>
  );
};
