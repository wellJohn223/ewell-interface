import { FormInstance } from 'antd';
import { NamePath } from 'antd/lib/form/interface';
import { ZERO } from 'constants/misc';
import dayjs from 'dayjs';
import { isUrl } from 'utils/reg';
import { integerGtZEROValidator, integerValidator, numberGtZEROValidator } from 'utils/validate';
import { timesDecimals } from 'utils/calculate';
import { getLocalStorage } from 'utils/localstorage';
import { ltTip } from './utils';
import storages from './storages';
import { ITrandingParCard } from './components/TradingPairList';

type ValidatorFun = (form: FormInstance<any>, v: any) => any;

export const validateFields = async (form: FormInstance<any>, nameList?: NamePath[]) => {
  if (!nameList) return;
  const isValidating = !!nameList.map((name) => form.isFieldValidating(name)).filter((i) => i).length;
  const nameValues = form.getFieldsValue(nameList);
  const isNotEmpty = Object.keys(nameValues)
    .map((key) => nameValues[key])
    .every((val) => !!val);
  if (!isValidating && isNotEmpty) form.validateFields(nameList);
  return Promise.resolve();
};

export const circulationValidator = async (_: any, v: any) => {
  const bigV = ZERO.plus(v);
  const validator = await numberGtZEROValidator('', v);
  if (validator) return Promise.reject(validator);
  if (bigV.gt('500000000')) return Promise.reject('Must be less than or equal to 500,000,000');
  return Promise.resolve();
};

export const minSubscriptionValidator: ValidatorFun = async (form, v) => {
  const bigV = ZERO.plus(v);
  const validator = await integerGtZEROValidator('', v);
  if (validator) return Promise.reject('the number must greater than 0');
  const maxSubscription = form.getFieldValue('maxSubscription');
  console.log('maxSubscription', maxSubscription);

  if (!maxSubscription) {
    validateFields(form, ['maxSubscription']);
    return Promise.resolve();
  }
  if (maxSubscription && bigV.gt(maxSubscription))
    return Promise.reject('Minimum allocation should be less than maximum allocation.');

  return Promise.resolve();
};

export const maxSubscriptionValidator: ValidatorFun = async (form, v) => {
  const bigV = ZERO.plus(v);
  const validator = await integerGtZEROValidator('', v);
  if (validator) return Promise.reject('the number must greater than 0');
  const minSubscription = form.getFieldValue('minSubscription');

  if (!minSubscription) {
    validateFields(form, ['minSubscription']);
    return Promise.resolve();
  }

  if (minSubscription && bigV.lt(minSubscription)) {
    return Promise.reject('Maximum allocation should be greater than minimum allocation.');
  }

  const crowdFundingIssueAmount = form.getFieldValue('crowdFundingIssueAmount');
  const preSalePrice = form.getFieldValue('preSalePrice');
  if (crowdFundingIssueAmount && preSalePrice && ZERO.plus(crowdFundingIssueAmount).div(preSalePrice).lt(v))
    return Promise.reject('Purchase quantiy may not exceed supply.');

  return Promise.resolve();
};

export const startsAtValidator: ValidatorFun = async (form, v) => {
  if (!v) return Promise.reject('please select start time');
  const endTime: dayjs.Dayjs = form.getFieldValue('endTime');
  if (endTime && ZERO.plus(endTime.diff(v)).lte(0))
    return Promise.reject('The start date should be before the end date.');
  validateFields(form, ['endTime']);
  return Promise.resolve();
};

export const endsAtValidator: ValidatorFun = async (form, v) => {
  if (!v) return Promise.reject('please select end time');
  const startTime: dayjs.Dayjs = form.getFieldValue('startTime');
  if (startTime && ZERO.plus(startTime.diff(v)).gte(0))
    return Promise.reject('The end date should be later than start date.');
  validateFields(form, ['startTime']);
  return Promise.resolve();
};

export const publicSalePriceValidator: ValidatorFun = async (form, v) => {
  const bigV = ZERO.plus(v);
  const validator = await numberGtZEROValidator('', v);
  if (validator) return Promise.reject(validator);
  const preSalePrice = form.getFieldValue('preSalePrice');
  if (preSalePrice && bigV.times(1.05).gt(preSalePrice))
    return Promise.reject('The pre-sale price must be 5% or more higher than the crowdfunding price');
  return Promise.resolve();
};

export const lockScaleValidator = async (_: any, v: any) => {
  const bigV = ZERO.plus(v);
  const validator = await integerValidator('', v);
  if (validator) return Promise.reject(validator);
  if (bigV.lt(1) || bigV.gt(100)) return Promise.reject('1-100');
  return Promise.resolve();
};

export const lockUpTimeValidator = async (_: any, v: any) => {
  const bigV = ZERO.plus(v);
  const validator = await integerValidator('', v);
  if (validator) return Promise.reject(validator);
  if (bigV.lt(5)) return Promise.reject('> 5');
  return Promise.resolve();
};

export const urlValidator = async (_: any, v: any) => {
  if (typeof v === 'string' && v.length > 255) return Promise.reject('Your input exceeds maximum length limit.');
  return Promise.resolve(false);
};
export const descriptionValidator = async (_: any, v: any) => {
  if (typeof v === 'string' && v.length > 300) return Promise.reject('Your input exceeds maximum length limit.');
  return Promise.resolve(false);
};
export const urlRequiredValidator = async (_: any, v: any) => {
  if (!v) return Promise.reject(`Please enter`);
  const validator = await urlValidator('', v);
  if (validator) return Promise.reject(validator);
  if (!isUrl(v)) return Promise.reject('Please enter the correct url');
  return Promise.resolve();
};

export const firstReleaseRateValidator: ValidatorFun = async (form, v) => {
  const bigV = ZERO.plus(v);
  const validator = await numberGtZEROValidator('', v);
  if (validator) return Promise.reject(validator);
  if (bigV.gte(100)) return Promise.reject(ltTip(100));
  const totalPeriod = form.getFieldValue('totalPeriod');
  if (totalPeriod) {
    const remaining = ZERO.plus(100).minus(v);
    const every = remaining.div(totalPeriod).dp(4, 1);
    if (!every.isNaN()) form.setFieldsValue({ restDistributeProportion: every.toFixed() });
    validateFields(form, ['restDistributeProportion', 'totalPeriod']);
  }
  return Promise.resolve();
};

export const restDistributeProportionValidator: ValidatorFun = async (form, v) => {
  const validator = await numberGtZEROValidator('', v);
  if (validator) return Promise.reject(validator);
  const bigV = ZERO.plus(v);
  if (bigV.gte(100)) return Promise.reject(ltTip(100));

  validateFields(form, ['firstDistributeProportion', 'totalPeriod']);
  return Promise.resolve();
};

export const totalPeriodValidator: ValidatorFun = async (form, v) => {
  const validator = await integerGtZEROValidator('', v);
  if (validator) return Promise.reject(validator);

  const first = form.getFieldValue('firstDistributeProportion');
  if (first) {
    const remaining = ZERO.plus(100).minus(first);
    const every = remaining.div(v).dp(4, 1);
    console.log(every.toFixed(), '=====every');
    if (!every.isNaN()) form.setFieldsValue({ restDistributeProportion: every.toFixed() });
  }

  validateFields(form, ['firstDistributeProportion', 'restDistributeProportion']);
  return Promise.resolve();
};

export const periodDurationValidator = async (_: any, v: any) => {
  const validator = await integerGtZEROValidator('', v);
  if (validator) return Promise.reject(validator);
  return Promise.resolve();
};

export const preSalePriceValidator = async (rule: any, v: any) => {
  console.log('preSalePriceValidator', v);
  const bigV = ZERO.plus(v);
  const validator = await numberGtZEROValidator('', v);
  console.log('validated-result', validator);
  if (validator) return Promise.reject('the number must greater than 0');
  const { decimals, balance }: ITrandingParCard = getLocalStorage(storages.ConfirmTradingPair);
  if (!decimals && decimals !== 0 && !balance) {
    return Promise.reject('please go to select trading pair');
  }
  if (timesDecimals(bigV, decimals).gt(balance))
    return Promise.reject('the maximum value does not exceed the total amount of Token in the wallet');
  return Promise.resolve();
};

// export const crowdFundingIssueAmountValidator: ValidatorFun = async (form) => {
//   // validateFields(form, ['maxSubscription']);
//   return Promise.resolve();
// };

export const crowdFundingIssueAmountValidator: ValidatorFun = async (form: any, v: any) => {
  const bigV = ZERO.plus(v);
  const validator = await numberGtZEROValidator('', v);
  if (validator) return Promise.reject('the number must greater than 0');
  const projectToken: ITrandingParCard = getLocalStorage(storages.ConfirmTradingPair);
  if (timesDecimals(bigV, projectToken.decimals).gt(projectToken.balance))
    return Promise.reject('the maximum value does not exceed the total amount of Token in the wallet');

  validateFields(form, ['maxSubscription']);
  return Promise.resolve();
};

export const Validators: any = {
  minSubscription: minSubscriptionValidator,
  maxSubscription: maxSubscriptionValidator,
  startTime: startsAtValidator,
  endTime: endsAtValidator,
  publicSalePrice: publicSalePriceValidator,
  firstDistributeProportion: firstReleaseRateValidator,
  restDistributeProportion: restDistributeProportionValidator,
  totalPeriod: totalPeriodValidator,
  preSalePrice: preSalePriceValidator,
  crowdFundingIssueAmount: crowdFundingIssueAmountValidator,
};
