import { StepProps, message } from 'antd';
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

export const stepTitle = ['Select Token', 'Describe Project', 'Customise Sale', 'Review & Transfer'];

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
    label: 'Description (20-500 character):',
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
    label: 'Project Details (300-20000 character):',
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
      tips: 'Fomats supported: JPG, JPEG, and PNG. Max size: 10 MB. Recommended ratio: 1:1.',
      maxFileCount: 1,
      fileLimit: '10M',
      accept: '.jpg,.jpeg.,.png',
    },
  },
  {
    type: 'fileUpload',
    label: 'Featured Images:',
    name: 'projectImgs',
    required: true,
    valuePropName: 'fileList',
    getValueFromEvent: normFile,
    childrenProps: {
      tips: 'Please upload 3-5 featured images. Fomats supported: JPG, JPEG, and PNG. Max size: 10 MB. Recommended ratio: 16:9.',
      maxFileCount: 5,
      fileLimit: '10M',
      accept: '.jpg,.jpeg.,.png',
    },
  },
  getInputOptions({
    label: 'Official Website:',
    name: 'website',
    tooltip: 'test',
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
    label: 'Socials',
    fieldsList: [
      getInputOptions({
        label: 'Medium:',
        name: 'medium',
        required: false,
        rules: [urlRule],
      }),
      getInputOptions({
        label: 'X:',
        name: 'x',
        required: false,
        rules: [urlRule],
      }),
      getInputOptions({
        label: 'Telegram:',
        name: 'telegram',
        required: false,
        rules: [urlRule],
      }),
      getInputOptions({
        label: 'Github:',
        name: 'github',
        required: false,
        rules: [urlRule],
      }),
      getInputOptions({
        label: 'Discord:',
        name: 'discord',
        required: false,
        rules: [urlRule],
      }),
      getInputOptions({
        label: 'Reddit:',
        name: 'reddit',
        required: false,
        rules: [urlRule],
      }),
      getInputOptions({
        label: 'Facebook:',
        name: 'facebook',
        required: false,
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
      'A list of tasks that users must complete in order to join the whitelist. Please provide a publicly accessible link that explains the associated tasks.',
    rules: [urlRule],
  },
];

export const getIDOFormJson = (tradingCard?: ITradingParCard, idoInfo?: TIdoInfo): FormItemProps[] => {
  return [
    {
      type: 'select',
      label: 'Sale type:',
      name: 'crowdFundingType',
      initialValue: 'Sell at the set price',
      required: true,
      tooltip: 'How the tokens will be sold. Currently the only type supported is the fixed price sale.',
      childrenProps: {
        disabled: true,
        list: [{ title: 'Fixed price', value: 'Sell at the set price' }],
      },
    },
    {
      type: 'select',
      label: 'Unsold Tokens:',
      name: 'isBurnRestToken',
      tooltip:
        'How unsold tokens will be handled. Currently the only means supported is to return unsold tokens to the project owner.',
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
      tooltip:
        'The token price relative to ELF. This defines the exchange rate, indicating the amount of ELF needed to buy a token.',
      required: true,
      inlineFieldList: [
        {
          type: 'inputNumber',
          name: 'preSalePrice',
          rules: [
            (form: any) => ({
              validator: (rule, value) => Validators.preSalePrice(form, value),
            }),
          ],
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
      label: 'Total Amount for Sale:',
      tooltip: 'The total amount of tokens available for this sale.',
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
      label: 'Min & Max Allocation:',
      tooltip: 'The minimum and maximum allocation for individual users. ',
      required: true,
      inlineFieldList: [
        {
          type: 'inputNumber',
          name: 'minSubscription',
          rules: [
            (form: any) => ({
              validator: (_, value) => Validators.minSubscription(form, value),
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
          rules: [
            (form: any) => ({
              validator: (_, value) => Validators.maxSubscription(form, value),
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
      label: 'Sale Start Time:',
      name: 'startTime',
      required: true,
      tooltip: 'The token sale will start at this time.',
      childrenProps: {
        pcProps: {
          showTime: true,
          showNow: false,
          disabledDate: disabledDateBefore,
          disabledTime: (current) => disabledTimeBefore(current),
        },
        mobileProps: {
          precision: 'second',
          min: () => new Date(),
        },
      },
    },
    {
      type: 'datePicker',
      label: 'Sale End Time:',
      tooltip: 'The token sale will end at this time.',
      name: 'endTime',
      required: true,
      childrenProps: {
        disabled: !idoInfo?.startTime,
        pcProps: {
          showTime: true,
          showNow: false,
          disabledDate: (current) => disabledDateBefore(current, idoInfo?.endTime),
          disabledTime: (current) => disabledTimeBefore(current, idoInfo?.endTime),
        },
        mobileProps: {
          precision: 'second',
          min: () => new Date(idoInfo?.endTime || ''),
        },
      },
    },
    {
      type: 'datePicker',
      label: 'Token Distribution Time:',
      name: 'tokenReleaseTime',
      required: true,
      tooltip:
        'The time when tokens will be released to users, and you can receive proceeds along with any unsold tokens.',
      childrenProps: {
        disabled: !idoInfo?.startTime || !idoInfo?.endTime,
        pcProps: {
          showTime: true,
          showNow: false,
          disabledDate: (current) => disabledDateBefore(current, idoInfo?.tokenReleaseTime),
          disabledTime: (current) => disabledTimeBefore(current, idoInfo?.tokenReleaseTime),
        },
        mobileProps: {
          precision: 'second',
          min: () => new Date(idoInfo?.tokenReleaseTime || ''),
        },
      },
    },
    {
      type: 'group',
      label: 'Whitelist:',
      name: 'isEnableWhitelist',
      tooltip:
        'If whitelist is enabled, only whitelisted users are eligible to participate in the token sale. You can manually add users to the list.',
      initialValue: true,
      className: 'form-item-width-437',
      required: true,
      childrenProps: {
        radioList: [
          { value: true, children: 'Enable' },
          { value: false, children: 'Not Enable' },
        ],
      },
    },
  ];
};
