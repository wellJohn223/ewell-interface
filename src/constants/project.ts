import { ProjectStatus } from 'types/project';

export const PROJECT_STATUS_TEXT_MAP = {
  [ProjectStatus.UPCOMING]: 'Upcoming',
  [ProjectStatus.PARTICIPATORY]: 'Participatory',
  [ProjectStatus.UNLOCKED]: 'To be Unlocked',
  [ProjectStatus.ENDED]: 'Ended',
  [ProjectStatus.CANCELED]: 'Canceled',
};
