import EventEmitter from 'events';
import { PriceDecimal, ZERO } from 'constants/misc';

export const eventBus = new EventEmitter();

export const sleep = (time: number) => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve('sleep');
    }, time);
  });
};

export function shortenString(address: string | null, chars = 10): string {
  const parsed = address;
  if (!parsed) {
    return '';
  }
  return `${parsed.substring(0, chars)}...${parsed.substring(parsed.length - chars)}`;
}

export const getProtobufTime = (t?: string | number | Date) => {
  const time = t ? new Date(t) : new Date();
  return {
    seconds: Math.ceil(time.getTime() / 1000),
    nanos: 0,
  };
};

export function getPriceDecimal(crowdFundingIssueToken?: { decimals: number }, toRaiseToken?: { decimals: number }) {
  if (!crowdFundingIssueToken || !toRaiseToken) return PriceDecimal;
  const diff = ZERO.plus(crowdFundingIssueToken.decimals).minus(toRaiseToken.decimals);
  return diff.plus(PriceDecimal).toNumber();
}

export function getHref(href: string) {
  if (!(href.includes('https://') || href.includes('http://'))) return 'https://' + href;
  return href;
}

export const handleLoopFetch = async <T>({
  fetch,
  times = 0,
  interval = 1000,
  checkIsContinue,
  checkIsInvalid,
}: {
  fetch: () => Promise<T>;
  times?: number;
  interval?: number;
  checkIsContinue?: (param: T) => boolean;
  checkIsInvalid?: () => boolean;
}): Promise<T> => {
  try {
    const result = await fetch();
    if (checkIsContinue) {
      const isContinue = checkIsContinue(result);
      if (!isContinue) return result;
    } else {
      return result;
    }
  } catch (error) {
    const isInvalid = checkIsInvalid ? checkIsInvalid() : true;
    if (!isInvalid) throw new Error('fetch invalid');
    console.log('handleLoopFetch: error', times, error);
  }
  if (times === 1) {
    throw new Error('fetch exceed limit');
  }
  await sleep(interval);
  return handleLoopFetch({
    fetch,
    times: times - 1,
    interval,
    checkIsContinue,
    checkIsInvalid,
  });
};

export const pick = <T extends Record<string, any>, K extends string>(obj: T, keys: K[]) => {
  const result = {} as Record<string, any>;
  keys.forEach((key) => {
    result[key] = obj[key];
  });
  return result;
};
