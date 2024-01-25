import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';
import { InputNumber, Flex, Form } from 'antd';
import { Typography, FontWeightEnum, Progress } from 'aelf-design';
import CommonCard from 'components/CommonCard';
import NewBaseCountdown from 'components/NewBaseCountdown';
import PurchaseButton from '../OperationComponents/PurchaseButton';
import RevokeInvestmentButton from '../OperationComponents/RevokeInvestmentButton';
import ClaimTokenButton from '../OperationComponents/ClaimTokenButton';
import RevokeFineButton from '../OperationComponents/RevokeFineButton';
import { IProjectInfo, ProjectStatus } from 'types/project';
import { PROJECT_STATUS_TEXT_MAP } from 'constants/project';
import { useWallet } from 'contexts/useWallet/hooks';
import { ZERO } from 'constants/misc';
import { divDecimals, divDecimalsStr, timesDecimals } from 'utils/calculate';
import { getPriceDecimal } from 'utils';
import { parseInputNumberChange } from 'utils/input';
import { useBalance } from 'hooks/useBalance';
import { useTxFee } from 'contexts/useAssets/hooks';
import './styles.less';

const { Title, Text } = Typography;

interface IJoinCardProps {
  projectInfo?: IProjectInfo;
  isPreview?: boolean;
  handleRefresh?: () => void;
}

export default function JoinCard({ projectInfo, isPreview, handleRefresh }: IJoinCardProps) {
  const { wallet } = useWallet();
  const isLogin = !!wallet;

  const { txFee } = useTxFee();
  const { balance } = useBalance(projectInfo?.toRaiseToken?.symbol);

  const [purchaseInputValue, setPurchaseInputValue] = useState('');
  const [purchaseInputErrorMessage, setPurchaseInputErrorMessage] = useState('');
  const [isPurchaseInputting, setIsPurchaseInputting] = useState(false);
  const [isPurchaseButtonDisabled, setIsPurchaseButtonDisabled] = useState(true);

  const txFeeAmount = useMemo(() => {
    return timesDecimals(txFee, projectInfo?.toRaiseToken?.decimals);
  }, [txFee, projectInfo?.toRaiseToken?.decimals]);

  const canPurchaseAmount = useMemo(() => {
    return ZERO.plus(balance).minus(txFeeAmount);
  }, [balance, txFeeAmount]);

  const maxCanInvestAmount = useMemo(() => {
    const remainingToRaisedAmount = ZERO.plus(projectInfo?.toRaisedAmount ?? 0).minus(
      projectInfo?.currentRaisedAmount ?? 0,
    );
    const currentMaxSubscription = ZERO.plus(projectInfo?.maxSubscription ?? 0).minus(projectInfo?.investAmount ?? 0);
    const arr = [remainingToRaisedAmount, currentMaxSubscription, canPurchaseAmount];
    return BigNumber.min.apply(null, arr);
  }, [
    canPurchaseAmount,
    projectInfo?.currentRaisedAmount,
    projectInfo?.investAmount,
    projectInfo?.maxSubscription,
    projectInfo?.toRaisedAmount,
  ]);

  const minCanInvestAmount = useMemo(() => {
    return new BigNumber(projectInfo?.minSubscription || '');
  }, [projectInfo?.minSubscription]);

  const notEnoughTokens = useMemo(() => {
    return canPurchaseAmount.lt(minCanInvestAmount);
  }, [canPurchaseAmount, minCanInvestAmount]);

  const progressPercent = useMemo(() => {
    const percent = ZERO.plus(projectInfo?.currentRaisedAmount ?? 0)
      .div(projectInfo?.toRaisedAmount ?? 0)
      .times(1e2);
    return percent.isNaN() ? ZERO : percent;
  }, [projectInfo?.currentRaisedAmount, projectInfo?.toRaisedAmount]);

  const showViewWhitelistTasks = useMemo(() => {
    return projectInfo?.isEnableWhitelist && projectInfo?.whitelistInfo?.url && !projectInfo?.isInWhitelist;
  }, [projectInfo?.isEnableWhitelist, projectInfo?.isInWhitelist, projectInfo?.whitelistInfo?.url]);

  const showWhitelistJoined = useMemo(() => {
    return projectInfo?.isEnableWhitelist && projectInfo?.isInWhitelist;
  }, [projectInfo?.isEnableWhitelist, projectInfo?.isInWhitelist]);

  const canOperate = useMemo(() => {
    return isLogin && (!projectInfo?.isEnableWhitelist || projectInfo?.isInWhitelist);
  }, [isLogin, projectInfo?.isEnableWhitelist, projectInfo?.isInWhitelist]);

  const showMyAmount = useMemo(() => {
    return (
      projectInfo?.status === ProjectStatus.PARTICIPATORY ||
      projectInfo?.status === ProjectStatus.UNLOCKED ||
      projectInfo?.status === ProjectStatus.ENDED
    );
  }, [projectInfo?.status]);

  const showPurchaseButton = useMemo(() => {
    return projectInfo?.status === ProjectStatus.PARTICIPATORY;
  }, [projectInfo?.status]);

  const showRevokeInvestmentButton = useMemo(() => {
    return projectInfo?.status === ProjectStatus.PARTICIPATORY && new BigNumber(projectInfo?.investAmount || '').gt(0);
  }, [projectInfo?.investAmount, projectInfo?.status]);

  const showUnlockTips = useMemo(() => {
    return projectInfo?.status === ProjectStatus.UNLOCKED && new BigNumber(projectInfo?.investAmount || '').gt(0);
  }, [projectInfo?.investAmount, projectInfo?.status]);

  const showClaimTokenButton = useMemo(() => {
    return (
      projectInfo?.status === ProjectStatus.ENDED &&
      new BigNumber(projectInfo?.investAmount || '').gt(0) &&
      !projectInfo?.isWithdraw
    );
  }, [projectInfo?.investAmount, projectInfo?.isWithdraw, projectInfo?.status]);

  const showRevokeFineButton = useMemo(() => {
    return projectInfo?.status === ProjectStatus.CANCELED && !projectInfo?.claimedLiquidatedDamage;
  }, [projectInfo?.claimedLiquidatedDamage, projectInfo?.status]);

  const showOperationArea = useMemo(() => {
    return (
      canOperate &&
      (showMyAmount ||
        showPurchaseButton ||
        showRevokeInvestmentButton ||
        showUnlockTips ||
        showClaimTokenButton ||
        showRevokeFineButton)
    );
  }, [
    canOperate,
    showClaimTokenButton,
    showMyAmount,
    showPurchaseButton,
    showRevokeFineButton,
    showRevokeInvestmentButton,
    showUnlockTips,
  ]);

  useEffect(() => {
    setIsPurchaseButtonDisabled((pre) => {
      if (isPreview) {
        return true;
      } else if (isPurchaseInputting) {
        return pre;
      } else {
        return !!purchaseInputErrorMessage || !purchaseInputValue || new BigNumber(purchaseInputValue).lte(0);
      }
    });
  }, [isPreview, isPurchaseInputting, purchaseInputErrorMessage, purchaseInputValue]);

  const renderRemainder = () => {
    if (isPreview) {
      return (
        <>
          <Text>Remainder</Text>
          <Text fontWeight={FontWeightEnum.Medium}>23:50:45</Text>
        </>
      );
    } else if (projectInfo?.status === ProjectStatus.UPCOMING) {
      return (
        <>
          <Text>Remainder</Text>
          <NewBaseCountdown
            className="countdown-wrapper"
            value={projectInfo?.startTime ? dayjs(projectInfo.startTime).valueOf() : 0}
            onFinish={handleRefresh}
          />
        </>
      );
    } else if (projectInfo?.status === ProjectStatus.PARTICIPATORY) {
      return (
        <>
          <Text>Remainder</Text>
          <NewBaseCountdown
            className="countdown-wrapper"
            value={projectInfo?.endTime ? dayjs(projectInfo.endTime).valueOf() : 0}
            onFinish={handleRefresh}
          />
        </>
      );
    } else if (projectInfo?.status === ProjectStatus.UNLOCKED) {
      return (
        <>
          <Text>Remainder</Text>
          <NewBaseCountdown
            className="countdown-wrapper"
            value={projectInfo?.tokenReleaseTime ? dayjs(projectInfo.tokenReleaseTime).valueOf() : 0}
            onFinish={handleRefresh}
          />
        </>
      );
    } else if (projectInfo?.status === ProjectStatus.CANCELED) {
      return (
        <>
          <Text>Canceled Time</Text>
          <Text fontWeight={FontWeightEnum.Medium}>
            {projectInfo?.cancelTime ? dayjs(projectInfo?.cancelTime).format('DD MMM YYYY') : '--'}
          </Text>
        </>
      );
    } else if (projectInfo?.status === ProjectStatus.ENDED) {
      return (
        <>
          <Text>Ended Time</Text>
          <Text fontWeight={FontWeightEnum.Medium}>
            {projectInfo?.tokenReleaseTime ? dayjs(projectInfo?.tokenReleaseTime).format('DD MMM YYYY') : '--'}
          </Text>
        </>
      );
    } else {
      return '--';
    }
  };

  return (
    <CommonCard className="join-card-wrapper">
      <Flex className="swap-progress-wrapper" vertical gap={8}>
        <Flex align="center" justify="space-between">
          <Title fontWeight={FontWeightEnum.Medium}>Swap Progress</Title>
          {!!projectInfo?.status && (
            <div
              className={clsx('status', {
                'purple-status':
                  projectInfo?.status === ProjectStatus.UPCOMING ||
                  projectInfo?.status === ProjectStatus.UNLOCKED ||
                  projectInfo?.status === ProjectStatus.PARTICIPATORY,
              })}>
              <Text size="small">{PROJECT_STATUS_TEXT_MAP[projectInfo?.status]}</Text>
            </div>
          )}
        </Flex>
        <Progress
          size={['100%', 12]}
          percent={progressPercent.toNumber()}
          strokeColor={projectInfo?.status === ProjectStatus.PARTICIPATORY ? '#131631' : '#C1C2C9'}
          trailColor="#F5F5F6"
        />
        <div className="flex-between-center">
          <Title fontWeight={FontWeightEnum.Medium}>{progressPercent.toFixed(0)}%</Title>
          <Title fontWeight={FontWeightEnum.Medium}>
            {divDecimalsStr(projectInfo?.currentRaisedAmount ?? 0, projectInfo?.toRaiseToken?.decimals, '0')}/
            {divDecimalsStr(projectInfo?.toRaisedAmount, projectInfo?.toRaiseToken?.decimals)}{' '}
            {projectInfo?.toRaiseToken?.symbol || '--'}
          </Title>
        </div>
      </Flex>
      <div className="divider" />
      <Flex vertical gap={12}>
        <div className="flex-between-center">{renderRemainder()}</div>
        <div className="flex-between-center">
          <Text>Sale Price</Text>
          <Text fontWeight={FontWeightEnum.Medium}>
            {projectInfo?.preSalePrice
              ? `1 ${projectInfo?.toRaiseToken?.symbol ?? '--'} = ${
                  divDecimals(
                    projectInfo?.preSalePrice ?? 0,
                    getPriceDecimal(projectInfo?.crowdFundingIssueToken, projectInfo?.toRaiseToken),
                  ).toFixed() ?? '--'
                } ${projectInfo?.crowdFundingIssueToken?.symbol ?? '--'}`
              : '--'}
          </Text>
        </div>
        <div className="flex-between-center">
          <Text>Purchase Quantity</Text>
          <Text fontWeight={FontWeightEnum.Medium}>{`${divDecimalsStr(
            projectInfo?.minSubscription,
            projectInfo?.toRaiseToken?.decimals ?? 8,
          )} ${projectInfo?.toRaiseToken?.symbol ?? '--'} - ${divDecimalsStr(
            projectInfo?.maxSubscription,
            projectInfo?.toRaiseToken?.decimals ?? 8,
          )} ${projectInfo?.toRaiseToken?.symbol ?? '--'}`}</Text>
        </div>
      </Flex>
      {(showViewWhitelistTasks || showWhitelistJoined || showOperationArea) && <div className="divider" />}
      <Flex vertical gap={12}>
        {showViewWhitelistTasks && (
          <>
            {(projectInfo?.status === ProjectStatus.UPCOMING ||
              projectInfo?.status === ProjectStatus.PARTICIPATORY) && (
              <Text>The project is whitelisted. Investment projects need to complete Whitelist Tasks first.</Text>
            )}
            <Flex justify="flex-end">
              <Text
                className="purple-text cursor-pointer"
                fontWeight={FontWeightEnum.Medium}
                onClick={() => {
                  window.open(projectInfo?.whitelistInfo?.url, '_blank');
                }}>
                View Whitelist Tasks
              </Text>
            </Flex>
          </>
        )}
        {showWhitelistJoined && (
          <div className="flex-between-center">
            <Text>Whitelist</Text>
            <Text className="purple-text" fontWeight={FontWeightEnum.Medium}>
              Joined
            </Text>
          </div>
        )}
        {canOperate && (
          <>
            {showMyAmount && (
              <div className="flex-between-center">
                <Text>My Allocation</Text>
                <Text fontWeight={FontWeightEnum.Medium}>
                  {divDecimalsStr(projectInfo?.investAmount, projectInfo?.toRaiseToken?.decimals ?? 8, '0')}{' '}
                  {projectInfo?.toRaiseToken?.symbol ?? '--'}
                </Text>
              </div>
            )}
            {showMyAmount && (
              <div className="flex-between-center">
                <Text>
                  {projectInfo?.status === ProjectStatus.ENDED && projectInfo?.isWithdraw ? 'Receive' : 'To Receive'}
                </Text>
                <Text fontWeight={FontWeightEnum.Medium}>
                  {divDecimalsStr(projectInfo?.toClaimAmount, projectInfo?.crowdFundingIssueToken?.decimals, '0')}{' '}
                  {projectInfo?.crowdFundingIssueToken?.symbol ?? '--'}
                </Text>
              </div>
            )}
            {showPurchaseButton && (
              <>
                <Form.Item
                  className="purchase-input-number-wrapper"
                  validateStatus={purchaseInputErrorMessage && 'error'}
                  help={purchaseInputErrorMessage}>
                  <InputNumber
                    className="purchase-input-number"
                    placeholder="placeholder"
                    controls={false}
                    stringMode
                    addonAfter={
                      <div className="max-operation-wrapper">
                        <Title
                          className="max-operation purple-text cursor-pointer"
                          fontWeight={FontWeightEnum.Medium}
                          onClick={() => {
                            setPurchaseInputValue(
                              divDecimals(maxCanInvestAmount, projectInfo?.toRaiseToken?.decimals).toString(),
                            );
                          }}
                          disabled={isPreview || notEnoughTokens}>
                          MAX
                        </Title>
                      </div>
                    }
                    disabled={isPreview}
                    min="0"
                    value={purchaseInputValue}
                    onChange={(value) => {
                      setPurchaseInputValue(parseInputNumberChange(value || '', projectInfo?.toRaiseToken?.decimals));
                    }}
                    onFocus={() => {
                      setIsPurchaseInputting(true);
                    }}
                    onBlur={() => {
                      const value = new BigNumber(purchaseInputValue);
                      if (value.gt(divDecimals(maxCanInvestAmount, projectInfo?.toRaiseToken?.decimals))) {
                        setPurchaseInputErrorMessage(
                          `Max Amount ${divDecimalsStr(maxCanInvestAmount, projectInfo?.toRaiseToken?.decimals)}`,
                        );
                      } else if (value.lt(divDecimals(minCanInvestAmount, projectInfo?.toRaiseToken?.decimals))) {
                        setPurchaseInputErrorMessage(
                          `Min Amount ${divDecimalsStr(minCanInvestAmount, projectInfo?.toRaiseToken?.decimals)}`,
                        );
                      } else {
                        setPurchaseInputErrorMessage('');
                      }
                      setIsPurchaseInputting(false);
                    }}
                  />
                </Form.Item>
                <PurchaseButton
                  buttonDisabled={isPurchaseButtonDisabled}
                  projectInfo={projectInfo}
                  purchaseAmount={purchaseInputValue}
                />
              </>
            )}
            {showRevokeInvestmentButton && <RevokeInvestmentButton projectInfo={projectInfo} />}
            {showUnlockTips && (
              <Text className="text-center" fontWeight={FontWeightEnum.Medium}>
                Claim Token when it's time to unlock!
              </Text>
            )}
            {showClaimTokenButton && <ClaimTokenButton projectInfo={projectInfo} />}
            {showRevokeFineButton && <RevokeFineButton projectInfo={projectInfo} />}
          </>
        )}
      </Flex>
    </CommonCard>
  );
}
