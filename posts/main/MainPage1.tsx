import { Context, Devvit, useAsync, useState } from '@devvit/public-api';
import { MainPage1Step1 } from './main-steps/MainPage1Step1.js'
import { MainPage1Step2 } from './main-steps/MainPage1Step2.js'
import { MainPage1Step3 } from './main-steps/MainPage1Step3.js'

interface MainPage1PageProps {
  words: { word: string, corner: string }[];
  onCancel: () => void;
  onNext: (data: { word: string, corner: string }) => void;
}

export const MainPage1 = (props: MainPage1PageProps, context: Context): JSX.Element => {
  const defaultStep = 'Step1';
  const [currentStep, setCurrentStep] = useState<string>(defaultStep);
  const [selectedWordData, setSelectedWordData] = useState<{word: string, corner: string} | null>(null);


  const steps: Record<string, JSX.Element> = {
    Step1: (
      <MainPage1Step1
        words={props.words}
        onNext={(data) => { 
          setSelectedWordData(data);
          setCurrentStep('Step2');
        }}
        onCancel={() => {
          props.onCancel();
        }}
      />
    ),
    Step2: (
      <MainPage1Step2
        {...props}
        wordData={selectedWordData!}
        // onNext={() => {
        //   setCurrentStep('Step3');
        // }}
        onCancel={() => {
          props.onCancel();
        }}
      />
    ),
    Step3: (
      <MainPage1Step3
        {...props}
        onCancel={() => {
          props.onCancel();
        }}
      />
    )
  };

  return (
    <vstack width="100%" height="100%">
      {steps[currentStep] || <text>Error: Step not found</text>}
    </vstack>
  );
};
