import { StepProps } from 'antd';
import { getInputOptions, normFile } from 'components/FormItem/utils';
import { FormItemProps } from 'components/FormItem';
import {
  minSubscriptionValidator,
  maxSubscriptionValidator,
  Validators,
  urlValidator,
  preSalePriceValidator,
} from './validate';
import { disabledDateBefore, disabledTimeBefore, integerNumberFormat, formatNumberParser } from './utils';
import { TSteps } from './types';
import { ITradingParCard } from './components/TradingPairList';
import { formatInputNumberString } from 'utils/calculate';
import { TIdoInfo } from './IDOInfo';
import { Rule } from 'antd/es/form';

export const stepTitle = ['Trading Pair', 'Project Information', 'IDO Information', 'Preview & Transfer'];

export const stepsItems: StepProps[] = [
  {
    title: stepTitle[TSteps.ONE],
  },
  {
    title: stepTitle[TSteps.TWO],
  },
  {
    title: stepTitle[TSteps.THREE],
  },
  {
    title: stepTitle[TSteps.FOUR],
  },
];

const urlRule: Rule = { type: 'url', message: 'please input the correct url' };

export const ProjectInfoFromJson: FormItemProps[] = [
  getInputOptions({
    label: 'Project Name:',
    name: 'projectName',
    tooltip: 'test',
    childrenProps: {
      maxLength: 40,
      showCount: true,
    },
  }),
  {
    type: 'textArea',
    label: 'Summary Project Description (20-500 character):',
    name: 'projectSummary',
    rules: [
      { required: true, message: 'Please enter the necessary information' },
      { min: 20, message: 'Please enter the necessary information' },
    ],
    childrenProps: {
      maxLength: 500,
      autoSize: { minRows: 3, maxRows: 5 },
    },
  },
  {
    type: 'textArea',
    label: 'Project Description (300-20000 character):',
    name: 'projectDescription',
    rules: [
      { required: true, message: 'Please enter the necessary information' },
      { min: 300, max: 20000, message: '300-20000' },
    ],
    childrenProps: {
      maxLength: 20000,
      autoSize: { minRows: 3, maxRows: 5 },
    },
  },
  {
    type: 'fileUpload',
    label: 'Logo:',
    name: 'logoUrl',
    required: true,
    valuePropName: 'fileList',
    getValueFromEvent: normFile,
    childrenProps: {
      maxFileCount: 1,
      fileLimit: '10M',
      accept: '.jpg,.jpeg.,.png',
    },
  },
  {
    type: 'fileUpload',
    label: 'Project Images:',
    name: 'projectImgs',
    required: true,
    valuePropName: 'fileList',
    getValueFromEvent: normFile,
    childrenProps: {
      maxFileCount: 5,
      fileLimit: '10M',
      accept: '.jpg,.jpeg.,.png',
    },
  },
  getInputOptions({
    label: 'Official Website:',
    name: 'website',
    tooltip: 'test',
    validateTrigger: 'onBlur',
    rules: [
      {
        required: true,
        message: 'Please enter the necessary information',
      },
      urlRule,
    ],
  }),
  {
    type: 'fieldsGroup',
    label: 'Other Community',
    fieldsList: [
      getInputOptions({
        label: 'Medium:',
        name: 'medium',
        required: false,
        validateTrigger: 'onBlur',
        rules: [urlRule],
      }),
      getInputOptions({
        label: 'X:',
        name: 'x',
        required: false,
        validateTrigger: 'onBlur',
        rules: [urlRule],
      }),
      getInputOptions({
        label: 'Telegram:',
        name: 'telegram',
        required: false,
        validateTrigger: 'onBlur',
        rules: [urlRule],
      }),
      getInputOptions({
        label: 'Github:',
        name: 'github',
        required: false,
        validateTrigger: 'onBlur',
        rules: [urlRule],
      }),
      getInputOptions({
        label: 'Discord:',
        name: 'discord',
        required: false,
        validateTrigger: 'onBlur',
        rules: [urlRule],
      }),
      getInputOptions({
        label: 'Reddit:',
        name: 'reddit',
        required: false,
        validateTrigger: 'onBlur',
        rules: [urlRule],
      }),
      getInputOptions({
        label: 'Facebook:',
        name: 'facebook',
        required: false,
        validateTrigger: 'onBlur',
        rules: [urlRule],
      }),
    ],
  },
];

export const formWhitelist: FormItemProps[] = [
  {
    type: 'textArea',
    label: 'Whitelist Tasks:',
    name: 'whitelistUrl',
    tooltip:
      'Enter an accessible link that the user clicks on and is redirected to a third-party platform to view the whitelisted tasks. We recommend using the official Community.',
    rules: [urlRule],
  },
];

export const getIDOFormJson = (tradingCard?: ITradingParCard, idoInfo?: TIdoInfo): FormItemProps[] => {
  return [
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
          rules: [
            (form: any) => ({
              validator: (rule, value) => preSalePriceValidator(form, value),
            }),
          ],
          validateTrigger: 'onBlur',
          childrenProps: {
            className: 'flex-grow',
            formatter: (value) => formatInputNumberString(value, 8),
            stringMode: true,
            controls: false,
          },
        },
        {
          type: 'pureText',
          childrenProps: {
            className: 'margin-left-8',
            text: tradingCard?.symbol ? `${tradingCard?.symbol} = 1 ELF` : '',
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
          validateTrigger: 'onBlur',
          rules: [
            (form: any) => ({
              validator: (_, value) => Validators.crowdFundingIssueAmount(form, value),
            }),
          ],
          childrenProps: {
            formatter: integerNumberFormat,
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
            text: tradingCard?.symbol ?? '',
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
          validateTrigger: 'onBlur',
          rules: [
            (form: any) => ({
              validator: (_, value) => minSubscriptionValidator(form, value),
            }),
          ],
          childrenProps: {
            formatter: integerNumberFormat,
            parser: formatNumberParser,
            precision: 0,
            min: 0,
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
          validateTrigger: 'onBlur',
          rules: [
            (form: any) => ({
              validator: (_, value) => maxSubscriptionValidator(form, value),
            }),
          ],
          childrenProps: {
            formatter: integerNumberFormat,
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
        showNow: false,
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
        disabled: !idoInfo?.startTime,
        showTime: true,
        showNow: false,
        disabledDate: (current) => disabledDateBefore(current, idoInfo?.endTime),
        disabledTime: (current) => disabledTimeBefore(current, idoInfo?.endTime),
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
        disabled: !idoInfo?.startTime || !idoInfo?.endTime,
        showTime: true,
        showNow: false,
        disabledDate: (current) => disabledDateBefore(current, idoInfo?.tokenReleaseTime),
        disabledTime: (current) => disabledTimeBefore(current, idoInfo?.tokenReleaseTime),
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
};
