import { UploadFile } from 'antd';
import { ZERO } from 'constants/misc';
export const NumberFormat = (val: string | number, precision: number = 0) => {
  return ZERO.plus(val).toFormat(precision);
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

export function getLocalStorage(key: string) {
  try {
    if (!key) return '';
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch (error) {
    return undefined;
  }
}
