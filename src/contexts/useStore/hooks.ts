import { useMemo } from 'react';
import { useStore } from '.';

export function useMobile() {
  const [{ mobile }] = useStore();
  return useMemo(() => !!mobile, [mobile]);
}

export function useMobileMd() {
  const [{ mobileMd }] = useStore();
  return useMemo(() => !!mobileMd, [mobileMd]);
}
