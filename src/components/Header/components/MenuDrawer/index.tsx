import { CommonDrawer, ICommonDrawerInterface } from 'components/CommonDrawer';
import './styles.less';
import { TMenuItem } from '../../index';
import { MutableRefObject, useState } from 'react';
import arrowSvg from 'assets/images/arrow.svg';
import clsx from 'clsx';
import { CommunityItem } from '../CommunityItem';

export interface IMenuDrawerProps {
  drawerRef?: MutableRefObject<ICommonDrawerInterface | undefined>;
  list: TMenuItem[];
}
export const MenuDrawer = ({ drawerRef, list }: IMenuDrawerProps) => {
  const [activeMenuIndex, setActiveMenuIndex] = useState<number>();

  return (
    <CommonDrawer ref={drawerRef} className="mobile-menu-drawer">
      {list.map((menu, menuIdx) => (
        <div key={menuIdx} className="mobile-menu-item-wrap">
          <div
            className="mobile-menu-item"
            onClick={() => {
              if (!menu.children) return;
              setActiveMenuIndex((v) => (v === menuIdx ? undefined : menuIdx));
            }}>
            <span className="mobile-menu-item-title">{menu.name}</span>
            <img
              src={arrowSvg}
              className={clsx([
                'mobile-menu-item-arrow',
                menu.children && 'mobile-menu-item-arrow-down',
                activeMenuIndex === menuIdx && 'mobile-menu-item-arrow-up',
              ])}
            />
          </div>
          {menu.children && (
            <div
              className={clsx([
                'mobile-menu-children-wrap',
                activeMenuIndex === menuIdx && 'mobile-menu-children-wrap-active',
              ])}>
              <div className="mobile-menu-children">
                {menu.children.map((childMenu, childMenuIdx) => (
                  <CommunityItem key={childMenuIdx} data={childMenu} />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </CommonDrawer>
  );
};
