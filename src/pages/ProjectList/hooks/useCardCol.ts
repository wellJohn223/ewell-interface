import { useWindowSize } from 'react-use';

export const useCardCol = () => {
  const { width } = useWindowSize();
  return [width > 640 ? (width > 900 ? (width > 1350 ? 4 : 3) : 2) : 1];
};
