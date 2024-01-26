import clsx from 'clsx';
import { Flex, FlexProps } from 'antd';
import communityLogo from 'assets/images/communityLogo';
import { getHref } from 'utils';

enum CommunityLogoType {
  WEBSITE = 'website',
  FACEBOOK = 'facebook',
  TELEGRAM = 'telegram',
  X = 'x',
  GITHUB = 'github',
  DISCORD = 'discord',
  REDDIT = 'reddit',
  MEDIUM = 'medium',
}

interface ICommonCommunityLogoListProps {
  flexProps?: FlexProps;
  imgClassName?: string;
  communityLink: { [key in CommunityLogoType]?: string };
}

export const COMMUNITY_LOGO_LIST = [
  CommunityLogoType.WEBSITE,
  CommunityLogoType.X,
  CommunityLogoType.TELEGRAM,
  CommunityLogoType.MEDIUM,
  CommunityLogoType.FACEBOOK,
  CommunityLogoType.GITHUB,
  CommunityLogoType.DISCORD,
  CommunityLogoType.REDDIT,
];

export default function CommonCommunityLogoList({
  flexProps,
  imgClassName,
  communityLink,
}: ICommonCommunityLogoListProps) {
  const communityLogoList = COMMUNITY_LOGO_LIST.map((type) => ({
    type,
    logo: communityLogo[type],
    link: communityLink[type],
  }));
  return (
    <Flex gap={12} align="center" {...flexProps}>
      {communityLogoList
        .filter((item) => !!item.link)
        .map((item, index) => {
          return (
            <img
              key={index}
              className={clsx('cursor-pointer', imgClassName)}
              src={item.logo}
              alt="community"
              onClick={() => {
                if (item.link) {
                  window.open(getHref(item.link), '_blank');
                }
              }}
            />
          );
        })}
    </Flex>
  );
}
