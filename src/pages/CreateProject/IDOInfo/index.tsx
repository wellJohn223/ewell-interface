import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalStorage, useEffectOnce } from 'react-use';
import { Form } from 'antd';
import { FormItemProps, FormFields } from 'components/FormItem';
import CustomMark from '../components/CustomMark';
import storages from '../storages';
import { CreateStepProps } from '../types';
import ButtonGroup from '../components/ButtonGroup';
import { disabledDateBefore, disabledTimeBefore } from '../utils';
import dayjs from 'dayjs';
import { getIDOFormJson, formWhitelist } from '../constants';
import { ITradingParCard } from '../components/TradingPairList';
import BigNumber from 'bignumber.js';
import { formatInputNumberString, numberLteZERO } from 'utils/calculate';

const IDOInfo: React.FC<CreateStepProps> = ({ onNext, onPre }) => {
  const [form] = Form.useForm();
  const [tradingPair] = useLocalStorage<ITradingParCard>(storages.ConfirmTradingPair);
  const [idoInfo, setIDOInfo] = useLocalStorage(storages.IDOInfo, {});
  const [showWhitelist, setShowWhitelist] = useState(true);
  const [formList, setFormList] = useState<FormItemProps[]>(() => getIDOFormJson(tradingPair));

  const adapterIdoInfo = useMemo(() => {
    window['bigNum'] = BigNumber;
    const _idoInfo = { ...idoInfo };
    Object.keys(_idoInfo).map((key) => {
      if (key.includes('Time')) {
        const value = idoInfo?.[key];
        _idoInfo[key] = dayjs(value);
      }
    });
    return _idoInfo;
  }, [idoInfo]);

  const onFinish = useCallback(
    (values: any) => {
      console.log('values', values);
      setIDOInfo(values);
      onNext?.();
    },
    [onNext, setIDOInfo],
  );

  const onValuesChange = (changedValues: any, allValues: any) => {
    console.log('changeValues', changedValues);
    console.log('allValues', allValues);

    if (Object.hasOwn(changedValues, 'preSalePrice')) {
      const { preSalePrice = '' } = changedValues;
      if (numberLteZERO(preSalePrice)) {
        form.setFieldValue('preSalePrice', '');
        return;
      }
      form.setFieldValue('preSalePrice', formatInputNumberString(preSalePrice, 8));
      return;
    }

    if (Object.hasOwn(changedValues, 'isEnableWhitelist')) {
      return setShowWhitelist(changedValues.isEnableWhitelist);
    }

    if (Object.hasOwn(changedValues, 'startTime')) {
      const endTimeFrom = changedValues.startTime?.add('30', 'm');
      form.setFieldsValue({ endTime: null, tokenReleaseTime: null });
      formList.forEach((field) => {
        if (field.name === 'endTime') {
          field.childrenProps = {
            ...field.childrenProps,
            disabled: !endTimeFrom,
            disabledDate: (current) => disabledDateBefore(current, endTimeFrom),
            disabledTime: (current) => disabledTimeBefore(current, endTimeFrom),
          };
        }
        if (field.name === 'tokenReleaseTime') {
          field.childrenProps = {
            ...field.childrenProps,
            disabled: true,
          };
        }
      });
      console.log('formList', formList);
      return setFormList([...formList]);
    }

    if (Object.hasOwn(changedValues, 'endTime')) {
      const endTimeFrom = changedValues?.endTime;
      form.setFieldsValue({ tokenReleaseTime: null });
      formList.forEach((field) => {
        if (field.name === 'tokenReleaseTime') {
          field.childrenProps = {
            ...field.childrenProps,
            disabled: !endTimeFrom,
            disabledDate: (current) => disabledDateBefore(current, endTimeFrom),
            disabledTime: (current) => disabledTimeBefore(current, endTimeFrom),
          };
        }
      });
      return setFormList([...formList]);
    }
  };

  return (
    <div className="form-page">
      <Form
        form={form}
        layout="vertical"
        name="IDO"
        initialValues={adapterIdoInfo}
        scrollToFirstError
        onFinish={onFinish}
        onValuesChange={onValuesChange}
        requiredMark={CustomMark}>
        {FormFields(formList)}
        {showWhitelist && FormFields(formWhitelist)}
        <Form.Item>
          <ButtonGroup onPre={onPre} htmlType="submit" />
        </Form.Item>
      </Form>
    </div>
  );
};
export default IDOInfo;
