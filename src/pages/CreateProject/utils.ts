import { InstallmentDecimal, ZERO } from 'constants/misc';
import { getPriceDecimal, getProtobufTime } from 'utils';
import { timesDecimals } from 'utils/calculate';
import storages from './storages';
import dayjs, { Dayjs } from 'dayjs';
import { AELF_TOKEN_INFO } from 'constants/misc';

export function resetCreateProjectInfo() {
  localStorage.removeItem(storages.ConfirmTradingPair);
  localStorage.removeItem(storages.AdditionalInformation);
  localStorage.removeItem(storages.IDOInfo);
}

export function getInstallments(v: any) {
  if (v.isInstallment) return v;
  return {
    totalPeriod: 1,
    firstDistributeProportion: timesDecimals(100, InstallmentDecimal - 2).toFixed(0),
    restDistributeProportion: 0,
    periodDuration: 0,
  };
}

export function ltTip(n: string | number) {
  return `Please enter a number less than ${n}`;
}

export function gtTip(n: string | number) {
  return `Please enter a number greater than ${n}`;
}
export function intervalTip(l: string | number, r: string | number) {
  return `Please enter a number between ${l} and ${r}!`;
}

export function getInfo(confirmTradingPair: any, projectPanel: any, additionalInfo: any) {
  const toRaiseToken = AELF_TOKEN_INFO;
  const priceDecimal = getPriceDecimal(confirmTradingPair, toRaiseToken);
  const preSalePrice = timesDecimals(projectPanel.preSalePrice, priceDecimal.toFixed()).toFixed(0);
  const publicSalePrice = ZERO.plus(preSalePrice).div(1.05).toFixed(0);
  const crowdFundingIssueAmount = timesDecimals(
    projectPanel.crowdFundingIssueAmount,
    confirmTradingPair.decimals,
  ).toFixed(0);

  const minSubscription = timesDecimals(projectPanel.minSubscription, toRaiseToken.decimals).toFixed(0);
  const maxSubscription = timesDecimals(projectPanel.maxSubscription, toRaiseToken.decimals).toFixed(0);
  const _additionalInfo = {
    data: {
      ...additionalInfo,
      logoUrl: additionalInfo.logoUrl.map((item) => item.url).join(),
      projectImgs: additionalInfo.projectImgs.map((item) => item.url).join(),
    },
  };

  return {
    acceptedCurrency: AELF_TOKEN_INFO.symbol,
    // TODO: change project currency
    projectCurrency: confirmTradingPair.symbol,
    // projectCurrency: 'LINHONG',
    crowdFundingType: projectPanel.crowdFundingType,
    crowdFundingIssueAmount,
    preSalePrice,
    startTime: getProtobufTime(projectPanel.startTime),
    endTime: getProtobufTime(projectPanel.endTime),
    tokenReleaseTime: getProtobufTime(projectPanel.tokenReleaseTime),
    // TODO
    // minSubscription: '7',
    minSubscription,
    maxSubscription,
    publicSalePrice,
    listMarketInfo: [],
    liquidityLockProportion: 0, // fixed
    unlockTime: getProtobufTime(projectPanel.tokenReleaseTime), // fixed
    isEnableWhitelist: projectPanel.isEnableWhitelist,
    isBurnRestToken: projectPanel.isBurnRestToken === '1' ? true : false,
    totalPeriod: 1, // fixed
    additionalInfo: _additionalInfo,
    firstDistributeProportion: '100000000',
    restDistributeProportion: 0,
    periodDuration: 0,
  };
}

export function disabledDateBefore(current: Dayjs, target?: Dayjs) {
  const targetDate = target || dayjs();
  return current && current < targetDate.endOf('day').add(-1, 'd');
}

export function disabledTimeBefore(current: Dayjs, target?: Dayjs) {
  if (!current) return {};
  const targetDate = target || dayjs().add(1, 's');
  return {
    disabledHours: () => {
      return current.isAfter(targetDate, 'd') ? [] : new Array(targetDate.hour()).fill('').map((_, k) => k);
    },
    disabledMinutes: () => {
      return current.isAfter(targetDate, 'h') ? [] : new Array(targetDate.minute()).fill('').map((_, k) => k);
    },
    disabledSeconds: () => {
      return current.isAfter(targetDate, 'm') ? [] : new Array(targetDate.second()).fill('').map((_, k) => k);
    },
  };
}
