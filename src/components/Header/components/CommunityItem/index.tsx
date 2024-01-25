import './styles.less';

export interface ICommunityItem {
  name: string;
  icon?: string;
  content?: string;
  onClick?: () => void;
}

export interface ICommunityItemProps {
  data: ICommunityItem;
}
export const CommunityItem = ({ data: { name, icon, content, onClick } }: ICommunityItemProps) => {
  return (
    <div className="menu-community-item-wrap" onClick={onClick}>
      <div className="menu-community-item-icon-wrap">
        <img className="menu-community-item-icon" src={icon} alt="" />
      </div>
      <div className="menu-community-item-body-wrap">
        <span className="menu-community-item-title">{name}</span>
        <span className="menu-community-item-content">{content}</span>
      </div>
    </div>
  );
};
