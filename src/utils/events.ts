import { eventBus } from 'aelf-web-login';
import { ILoadingInfo } from 'components/PageLoading';
import { SET_GLOBAL_LOADING, SET_GLOBAL_SYNC_TIPS_MODAL } from 'constants/events';

export const emitLoading = (isLoading: boolean, loadingInfo?: Omit<ILoadingInfo, 'isLoading'>) =>
  eventBus.emit(SET_GLOBAL_LOADING, {
    isLoading,
    ...loadingInfo,
  });

export const emitSyncTipsModal = (isOpen: boolean) => eventBus.emit(SET_GLOBAL_SYNC_TIPS_MODAL, isOpen);
