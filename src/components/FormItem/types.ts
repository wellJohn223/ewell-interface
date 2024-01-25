import React from 'react';
import type {
  CascaderProps,
  DatePickerProps,
  // InputProps,
  // RadioProps,
  RowProps,
  SelectProps,
  // UploadProps,
  InputNumberProps,
  FlexProps,
} from 'antd';
import type { IInputProps, InputTextAreaProps, InputPasswordProps, IRadioProps } from 'aelf-design';
// import type { PasswordProps, TextAreaProps } from 'antd/lib/input';
import type { FormTreeProps } from './components/FormTree';
import type { CommonSelectItem } from 'components/CommonSelect';
import { FormItemProps } from './index';
import { IFUploadProps } from '../AWSUpload';
import { ReactHTML, ReactHTMLElement } from 'react';

export type inputProps = {
  type: 'input';
  childrenProps?: IInputProps;
};
export type passwordProps = {
  type: 'password';
  childrenProps?: InputPasswordProps;
};
export type textAreaProps = {
  type: 'textArea';
  childrenProps?: InputTextAreaProps;
};

export type groupProps = {
  type: 'group';
  childrenProps: {
    disabled?: boolean;
    radioList: IRadioProps[];
  };
};

export type treeProps = {
  type: 'tree';
  childrenProps?: FormTreeProps;
};

export type selectProps = {
  type: 'select';
  childrenProps: {
    list: CommonSelectItem[];
  } & SelectProps<any>;
};

export type datePickerProps = {
  type: 'datePicker';
  childrenProps?: DatePickerProps;
};
export type timePickerProps = {
  type: 'timePicker';
  childrenProps?: timePickerProps;
};
export type fileUploadProps = {
  type: 'fileUpload';
  childrenProps?: IFUploadProps;
};

export type idCardUploadProps = {
  type: 'idCardUpload';
  childrenProps?: IFUploadProps;
};

export type rowProps = {
  type: 'row';
  childrenProps: RowProps;
};

export type searchSelectProps = {
  type: 'searchSelect';
  childrenProps: {
    list: CommonSelectItem[];
  } & SelectProps<any>;
};

export type customizeProps = {
  type: 'customize';
  children?: React.JSX.Element;
  childrenProps?: any;
};

export type inputNumberProps = {
  type: 'inputNumber';
  childrenProps?: InputNumberProps;
};
export type FieldsGroupProps = {
  type: 'fieldsGroup';
  label: string;
  name?: string;
  fieldsList: FormItemProps[];
  childrenProps?: any;
};

export type inlineFieldProps = {
  type: 'inlineField';
  inlineFieldList: Omit<FormItemProps, 'inlineFieldProps'>[];
  flexProps?: FlexProps;
  childrenProps?: any;
};
export type pureTextProps = {
  type: 'pureText';
  text?: string;
  childrenProps?: any;
};
