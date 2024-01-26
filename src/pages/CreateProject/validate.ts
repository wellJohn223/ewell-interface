import { FormInstance } from 'antd';
import { NamePath } from 'antd/lib/form/interface';
import { ZERO } from 'constants/misc';
import dayjs from 'dayjs';
import { isUrl } from 'utils/reg';
import {
  integerGtZEROValidator,
  integerValidator,
  numberGtZEROValidator,
  numberGteZEROValidator,
} from 'utils/validate';
import { timesDecimals } from 'utils/calculate';
import { getLocalStorage } from 'utils/localstorage';
import { formatNumberParser } from './utils';
import storages from './storages';
import { ITradingParCard } from './components/TradingPairList';
import { formatInputNumberString, numberLteZERO } from 'utils/calculate';
import BigNumber from 'bignumber.js';

type ValidatorFun = (form: FormInstance<any>, v: any) => any;

export const validateFields = async (form: FormInstance<any>, nameList?: NamePath[]) => {
  if (!nameList) return;
  const isValidating = !!nameList.map((name) => form.isFieldValidating(name)).filter((i) => i).length;
  const nameValues = form.getFieldsValue(nameList);
  const isNotEmpty = Object.keys(nameValues)
    .map((key) => nameValues[key])
    .every((val) => !!val);
  console.log('isValidating, isNotEmpty', isValidating, isNotEmpty);
  if (!isValidating && isNotEmpty) form.validateFields(nameList);
  return Promise.resolve();
};

export const tokenGtTokenBalance = async (value: BigNumber) => {
  await numberGteZEROValidator('', value);
  const { decimals, balance }: ITradingParCard = getLocalStorage(storages.ConfirmTradingPair);
  if (!decimals && decimals !== 0 && !balance) {
    return Promise.reject('please go to select trading pair');
  }
  if (timesDecimals(value, decimals).gt(balance))
    return Promise.reject('the maximum value does not exceed the total amount of Token in the wallet');

  return Promise.resolve();
};

export const subscriptionGteTotal = async (form: FormInstance, value: BigNumber) => {
  const { crowdFundingIssueAmount, preSalePrice } = form.getFieldsValue(['crowdFundingIssueAmount', 'preSalePrice']);
  if (crowdFundingIssueAmount && preSalePrice && ZERO.plus(crowdFundingIssueAmount).div(preSalePrice).lt(value))
    return Promise.reject('Purchase quantify may not exceed supply.');

  return Promise.resolve();
};

export const preSalePriceValidator: ValidatorFun = async (form, v) => {
  console.log('preSalePriceValidator', v);
  const bigV = ZERO.plus(v);
  if (numberLteZERO(bigV)) {
    form.setFieldValue('preSalePrice', '');
    return;
  }
  await tokenGtTokenBalance(bigV);
  await validateFields(form, ['maxSubscription']);
  return Promise.resolve();
};

export const crowdFundingIssueAmountValidator: ValidatorFun = async (form: any, v: any) => {
  const bigV = ZERO.plus(v);
  await numberGtZEROValidator('', v);
  await tokenGtTokenBalance(bigV);
  await validateFields(form, ['maxSubscription']);
  return Promise.resolve();
};

export const minSubscriptionValidator: ValidatorFun = async (form, v) => {
  console.log('validate min');
  const bigV = ZERO.plus(v);

  await subscriptionGteTotal(form, bigV);
  const maxSubscription = form.getFieldValue('maxSubscription');
  if (maxSubscription && bigV.gt(maxSubscription))
    return Promise.reject('Minimum allocation should be less than maximum allocation.');

  return Promise.resolve();
};

export const maxSubscriptionValidator: ValidatorFun = async (form, v) => {
  console.log('validate max');
  const bigV = ZERO.plus(v);

  await subscriptionGteTotal(form, bigV);
  const minSubscription = form.getFieldValue('minSubscription');
  if (minSubscription && bigV.lt(minSubscription)) {
    return Promise.reject('Maximum allocation should be greater than minimum allocation.');
  }

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

export const purchaseValidate = (value) => {
  console.log('purchaseValidate');
};

export const Validators: any = {
  minSubscription: minSubscriptionValidator,
  maxSubscription: maxSubscriptionValidator,
  startTime: startsAtValidator,
  endTime: endsAtValidator,
  preSalePrice: preSalePriceValidator,
  crowdFundingIssueAmount: crowdFundingIssueAmountValidator,
};
