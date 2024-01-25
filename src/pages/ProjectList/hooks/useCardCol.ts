import { useWindowSize } from 'react-use';

export const useCardCol = () => {
  const { width } = useWindowSize();
  return [width > 640 ? (width > 768 ? (width > 1024 ? 4 : 3) : 2) : 1];
};
