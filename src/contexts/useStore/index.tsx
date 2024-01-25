import { ZERO } from 'constants/misc';
import { createContext, ReactNode, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { useEffectOnce } from 'react-use';
import isMobile from 'utils/isMobile';

const INITIAL_STATE = {};
const StoreContext = createContext<any>(INITIAL_STATE);

const body = window.document.getElementsByTagName('body')[0];
body.className = 'pc-site';

const mobileWidth = ZERO.plus(640);
declare type StoreState = { mobile?: boolean };
export function useStore(): [StoreState] {
  return useContext(StoreContext);
}

//reducer payload
function reducer(state: any, { type, payload }: any) {
  switch (type) {
    default:
      return Object.assign({}, state, payload);
  }
}

export default function Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [mobile, setMobile] = useState<boolean>();

  // isMobile
  useEffectOnce(() => {
    const resize = () => {
      const isM = isMobile();
      setMobile(
        mobileWidth.gt(window.innerWidth) ||
          isM.apple.phone ||
          isM.android.phone ||
          isM.apple.tablet ||
          isM.android.tablet,
      );
    };
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  });

  // className
  useEffect(() => {
    if (!body) return;
    const addClassName = [mobile ? 'mobile-site' : 'pc-site'];
    body.className = '';
    addClassName.forEach((i) => {
      if (!body.className.includes(i)) body.className = (body.className.trim() + ' ' + i).trim();
    });
  }, [mobile]);

  return (
    <StoreContext.Provider value={useMemo(() => [{ ...state, mobile }, { dispatch }], [state, mobile])}>
      {children}
    </StoreContext.Provider>
  );
}
