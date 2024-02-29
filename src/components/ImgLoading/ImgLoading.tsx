import clsx from 'clsx';
import { ReactNode, useMemo, useState } from 'react';
import './styles.less';
import loadingImage from './loading.png';
import failImage from './picFail.png';

export type ImgLoadingProps = {
  src: string;
  loading?: ReactNode;
  className?: string;
  key?: string;
};

export default function ImgLoading({ src, className, loading }: ImgLoadingProps) {
  const [err, setErr] = useState<boolean>();
  const [isLoad, setLoad] = useState<boolean>();
  const defaultLoadingWrapper = useMemo(() => {
    return <img src={err ? failImage : loadingImage} className={clsx('loading-image-default', err && 'error-image')} />;
  }, [err]);
  return (
    <div className={clsx('img-loading-wrapper', className)}>
      <img
        className={clsx('hide-image', isLoad && !err && 'show-image')}
        src={src}
        onLoad={() => {
          setErr(false);
          setLoad(true);
        }}
        onError={() => setErr(true)}
      />
      {!isLoad && (
        <div className="flex-center loading-image-default-wrapper">{loading ? loading : defaultLoadingWrapper}</div>
      )}
    </div>
  );
}
