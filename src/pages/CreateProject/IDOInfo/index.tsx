import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalStorage, useEffectOnce } from 'react-use';
import { Form } from 'antd';
import { FormItemProps, FormFields } from 'components/FormItem';
import CustomMark from '../components/CustomMark';
import storages from '../storages';
import { minSubscriptionValidator, maxSubscriptionValidator, Validators, urlValidator } from '../validate';
import { CreateStepProps } from '../types';
import ButtonGroup from '../components/ButtonGroup';
import { disabledDateBefore, disabledTimeBefore } from '../utils';
import { integeNumberFormat, formatNumberParser } from 'components/FormItem/utils';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';

const formListConfig: FormItemProps[] = [
  {
    type: 'select',
    label: 'IDO Type:',
    name: 'crowdFundingType',
    initialValue: 'Sell at the set price',
    required: true,
    tooltip: 'IDO type is a fixed price sale.',
    childrenProps: {
      disabled: true,
      list: [{ title: 'Sell at the set price', value: 'Sell at the set price' }],
    },
  },
  {
    type: 'select',
    label: 'Token Unsold:',
    name: 'isBurnRestToken',
    tooltip: 'Unsold Token returned to the project owner.',
    initialValue: '0',
    required: true,
    childrenProps: {
      disabled: true,
      list: [
        { title: 'Return', value: '0' },
        { title: 'Burn', value: '1' },
      ],
    },
  },
  {
    type: 'inlineField',
    label: 'Sale Price:',
    tooltip: 'The Token you set corresponds to the price of the ELF . How many Token can be purchased for one ELF?',
    required: true,
    inlineFieldList: [
      {
        type: 'inputNumber',
        name: 'preSalePrice',
        rules: [{ validator: Validators.preSalePrice }],
        childrenProps: {
          min: 0.00000001,
          className: 'flex-grow',
          controls: false,
          formatter: (value) => {
            if (!value) return value;
            return new BigNumber(value).toFormat(8).replace(/\.0+$|(?<=\.\d+)0*$/, '');
          },
          parser: formatNumberParser,
        },
      },
      {
        type: 'pureText',
        childrenProps: {
          className: 'margin-left-8',
          text: 'PIGE = 1 ELF',
        },
      },
    ],
  },
  {
    type: 'inlineField',
    label: 'Supply:',
    tooltip: 'The number of Token(s) you provide that are available for sale.',
    required: true,
    inlineFieldList: [
      {
        type: 'inputNumber',
        name: 'crowdFundingIssueAmount',
        rules: [
          (form: any) => ({
            validator: (_, value) => Validators.crowdFundingIssueAmount(form, value),
          }),
        ],
        childrenProps: {
          formatter: integeNumberFormat,
          parser: formatNumberParser,
          precision: 0,
          min: 0,
          className: 'flex-grow',
          controls: false,
        },
      },
      {
        type: 'pureText',
        childrenProps: {
          className: 'margin-left-8',
          text: 'PIGE',
        },
      },
    ],
  },
  {
    type: 'inlineField',
    label: 'Purchase Quantity:',
    tooltip: 'Range of ELFs available for investors to spend.',
    required: true,
    inlineFieldList: [
      {
        type: 'inputNumber',
        name: 'minSubscription',
        rules: [
          (form: any) => ({
            validator: (_, value) => minSubscriptionValidator(form, value),
          }),
        ],
        childrenProps: {
          formatter: integeNumberFormat,
          parser: formatNumberParser,
          precision: 0,
          min: 1,
          controls: false,
          style: {
            flexGrow: 1,
          },
        },
      },
      {
        type: 'pureText',
        childrenProps: {
          text: 'ELF To ',
          style: {
            flex: 'none',
            margin: '0 8px',
          },
        },
      },
      {
        type: 'inputNumber',
        name: 'maxSubscription',
        rules: [
          (form: any) => ({
            validator: (_, value) => maxSubscriptionValidator(form, value),
          }),
        ],
        childrenProps: {
          formatter: integeNumberFormat,
          parser: formatNumberParser,
          precision: 0,
          min: 1,
          controls: false,
          style: {
            flexGrow: 1,
          },
        },
      },
      {
        type: 'pureText',
        childrenProps: {
          text: 'ELF',
          style: {
            flex: 'none',
            marginLeft: 8,
          },
        },
      },
    ],
  },
  {
    type: 'datePicker',
    label: 'IDO Starts At:',
    name: 'startTime',
    required: true,
    tooltip: 'IDO start time, users can start participating in the IDO.',
    childrenProps: {
      showTime: true,
      disabledDate: disabledDateBefore,
      disabledTime: (current) => disabledTimeBefore(current),
    },
  },
  {
    type: 'datePicker',
    label: 'IDO Ends At:',
    tooltip: 'DO end time, end of fundraising.',
    name: 'endTime',
    required: true,
    childrenProps: {
      disabled: true,
      showTime: true,
    },
  },
  {
    type: 'datePicker',
    label: 'Token Distribution Time:',
    name: 'tokenReleaseTime',
    required: true,
    tooltip:
      'Crowdfunded Token will be released to users after this time, and the project owner can also withdraw the fundraising proceeds and unsold Token after this time.',
    childrenProps: {
      disabled: true,
      showTime: true,
    },
  },
  {
    type: 'group',
    label: 'Enable Whitelist:',
    name: 'isEnableWhitelist',
    tooltip:
      'With whitelisting enabled, investors need to be within the whitelist you maintain to participate in crowdfunding.',
    initialValue: true,
    className: 'form-item-width-437',
    required: true,
    childrenProps: {
      radioList: [
        { value: true, children: 'Enable' },
        { value: false, children: 'Disable' },
      ],
    },
  },
];

const formWhitelist: FormItemProps[] = [
  {
    type: 'textArea',
    label: 'Whitelist Tasks:',
    name: 'whitelistUrl',
    tooltip:
      'Enter an accessible link that the user clicks on and is redirected to a third-party platform to view the whitelisted tasks. We recommend using the official Community.',
    rules: [{ validator: urlValidator }],
    childrenProps: {
      maxLength: 20,
    },
  },
];

const IDOInfo: React.FC<CreateStepProps> = ({ onNext, onPre }) => {
  const [form] = Form.useForm();
  const [formList, setFormList] = useState(formListConfig);
  const [showWhitelist, setShowWhitelist] = useState(true);
  const [idoInfo, setIDOInfo] = useLocalStorage(storages.IDOInfo, {});

  const adpterIdoInfo = useMemo(() => {
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
      console.log('formlist', formList);
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
        initialValues={adpterIdoInfo}
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
