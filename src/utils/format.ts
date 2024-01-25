import BigNumber from 'bignumber.js';
import { UploadFile } from 'antd';
export const NumberFormat = (val: string | number, precision: number = 0) => {
  return new BigNumber(val).toFormat(precision).replace(/\.0+$|(?<=\.\d+)0*$/, '');
};

export const urlString2FileList = (urlString: string) => {
  const fileList: UploadFile[] = [];
  if (!urlString) return fileList;

  urlString.split(',').forEach((url, index) => {
    if (url) {
      fileList.push({
        uid: '' + index,
        name: url.match(/[^/]*$/)?.[0] || '',
        status: 'done',
        url,
      });
    }
  });

  return fileList;
};
