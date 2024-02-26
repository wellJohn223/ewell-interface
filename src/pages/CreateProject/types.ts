export interface CreateStepProps {
  onNext?: () => void;
  onPre?: () => void;
}

export enum TSteps {
  ONE,
  TWO,
  THREE,
  FOUR,
}

export enum TCurrencyType {
  ELF = 'ELF',
  USDT = 'USDT',
}
