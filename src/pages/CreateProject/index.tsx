import React, { useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Breadcrumb } from 'antd';
import './styles.less';
import ConfirmTradingPair from './ConfirmTradingPair';
import ProjectInfo from './ProjectInfo';
import IDOInfo from './IDOInfo';
import Transfer from './Transfer';
import ESteps from './components/ESteps';
import { CreateStepProps, TSteps } from './types';
import { stepsItems, stepTitle } from './constants';
import ScrollToTop from 'components/ScrollToTop';
import './styles.less';
import { useEffectOnce } from 'react-use';
import { useWallet } from 'contexts/useWallet/hooks';

const CreateProject: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<TSteps>(TSteps.ONE);

  const breadTitles = useMemo(() => {
    return [
      {
        title: 'Launch with EWELL',
      },
      {
        title: stepTitle[currentStep],
      },
    ];
  }, [currentStep]);

  const onNext = useCallback(() => {
    console.log('onNext');
    setCurrentStep(currentStep + 1);
  }, [currentStep]);

  const onPre = useCallback(() => {
    setCurrentStep(currentStep - 1);
  }, [currentStep]);

  const renderStep = useMemo(() => {
    switch (currentStep) {
      case TSteps.ONE:
        return <ConfirmTradingPair onNext={onNext} />;
      case TSteps.TWO:
        return <ProjectInfo onNext={onNext} onPre={onPre} />;
      case TSteps.THREE:
        return <IDOInfo onNext={onNext} onPre={onPre} />;
      case TSteps.FOUR:
        return <Transfer onPre={onPre} />;
    }
  }, [currentStep, onNext, onPre]);

  return (
    <div className="common-page-1360 cre-project page-body">
      {currentStep <= TSteps.THREE && <Breadcrumb className="project-nav" separator="\" items={breadTitles} />}
      <div className={clsx('project-wrapper', currentStep === TSteps.FOUR && 'project-wrapper-full')}>
        {/* TODO: scroll top */}
        {/* <ScrollToTop /> */}
        <ESteps current={currentStep} items={stepsItems} />
        {renderStep}
      </div>
    </div>
  );
};

export default CreateProject;
