import { StepProps } from 'antd';
import { getInputOptions, normFile } from 'components/FormItem/utils';
import { FormItemProps, FormFields } from 'components/FormItem';

import { TSteps } from './types';
import { urlValidator } from './validate';

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
      { required: true, message: 'required' },
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
      autoSize: { minRows: 3, maxRows: 5 },
    },
  },
  {
    type: 'fileUpload',
    label: 'LogoUrl:',
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
    rules: [{ required: true, message: '' }, { validator: urlValidator }],
  }),
  {
    type: 'fieldsGroup',
    label: 'Other Community',
    fieldsList: [
      getInputOptions({
        label: 'Medium:',
        name: 'medium',
        required: false,
        rules: [{ validator: urlValidator }],
      }),
      getInputOptions({
        label: 'X:',
        name: 'x',
        required: false,
        rules: [{ validator: urlValidator }],
      }),
      getInputOptions({
        label: 'Telegram:',
        name: 'telegram',
        required: false,
        rules: [{ validator: urlValidator }],
      }),
      getInputOptions({
        label: 'Github:',
        name: 'github',
        required: false,
        rules: [{ validator: urlValidator }],
      }),
      getInputOptions({
        label: 'Discord:',
        name: 'discord',
        required: false,
        rules: [{ validator: urlValidator }],
      }),
      getInputOptions({
        label: 'Reddit:',
        name: 'reddit',
        required: false,
        rules: [{ validator: urlValidator }],
      }),
      getInputOptions({
        label: 'Facebook:',
        name: 'facebook',
        required: false,
        rules: [{ validator: urlValidator }],
      }),
    ],
  },
];
