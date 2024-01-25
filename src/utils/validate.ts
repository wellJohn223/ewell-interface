import { ZERO } from 'constants/misc';
import { gtTip } from 'pages/CreateProject/utils';

export const numberValidator = async (_: any, v: any) => {
  const bigV = ZERO.plus(v);
  if (bigV.isNaN()) return Promise.reject('Please enter the correct value');
  return Promise.resolve(false);
};

export const numberGtZEROValidator = async (_: any, v: any) => {
  const bigV = ZERO.plus(v);
  const validator = await numberValidator('', v);
  if (validator) return Promise.reject(validator);
  if (bigV.lte(0)) return Promise.reject(gtTip(0));
  return Promise.resolve(false);
};

export const integerValidator = async (_: any, v: any) => {
  const bigV = ZERO.plus(v);
  const validator = await numberValidator('', v);
  if (validator) return Promise.reject(validator);
  if (!bigV.isInteger()) return Promise.reject('please enter an integer');
  return Promise.resolve(false);
};
export const integerGtZEROValidator = async (_: any, v: any) => {
  const bigV = ZERO.plus(v);
  const validator = await numberGtZEROValidator('', v);
  if (validator) return Promise.reject(validator);
  if (!bigV.isInteger()) return Promise.reject('please enter an integer');
  return Promise.resolve(false);
};
