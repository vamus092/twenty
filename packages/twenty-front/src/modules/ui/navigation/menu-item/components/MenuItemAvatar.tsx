import { useTheme } from '@emotion/react';
import { FunctionComponent, MouseEvent, ReactElement } from 'react';
import {
  Avatar,
  AvatarProps,
  IconChevronRight,
  IconComponent,
  LightIconButtonGroup,
  LightIconButtonProps,
  OverflowingTextWithTooltip,
  isDefined,
} from 'twenty-ui';

import {
  StyledHoverableMenuItemBase,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';
import { MenuItemAccent } from '../types/MenuItemAccent';

export type MenuItemIconButton = {
  Wrapper?: FunctionComponent<{ iconButton: ReactElement }>;
  Icon: IconComponent;
  accent?: LightIconButtonProps['accent'];
  onClick?: (event: MouseEvent<any>) => void;
};

export type MenuItemAvatarProps = {
  accent?: MenuItemAccent;
  className?: string;
  iconButtons?: MenuItemIconButton[];
  isIconDisplayedOnHoverOnly?: boolean;
  isTooltipOpen?: boolean;
  avatar?: Pick<
    AvatarProps,
    'avatarUrl' | 'placeholderColorSeed' | 'placeholder' | 'size' | 'type'
  > | null;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLDivElement>) => void;
  testId?: string;
  text: string;
  hasSubMenu?: boolean;
};

// TODO: merge with MenuItem
export const MenuItemAvatar = ({
  accent = 'default',
  className,
  iconButtons,
  isIconDisplayedOnHoverOnly = true,
  onClick,
  onMouseEnter,
  onMouseLeave,
  testId,
  avatar,
  hasSubMenu = false,
  text,
}: MenuItemAvatarProps) => {
  const theme = useTheme();
  const showIconButtons = Array.isArray(iconButtons) && iconButtons.length > 0;

  const handleMenuItemClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!onClick) return;
    event.preventDefault();
    event.stopPropagation();

    onClick?.(event);
  };

  return (
    <StyledHoverableMenuItemBase
      data-testid={testId ?? undefined}
      onClick={handleMenuItemClick}
      className={className}
      accent={accent}
      isIconDisplayedOnHoverOnly={isIconDisplayedOnHoverOnly}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <StyledMenuItemLeftContent>
        {isDefined(avatar) && (
          <Avatar
            placeholder={avatar.placeholder}
            avatarUrl={avatar.avatarUrl}
            placeholderColorSeed={avatar.placeholderColorSeed}
            size={avatar.size}
            type={avatar.type}
          />
        )}
        <OverflowingTextWithTooltip text={text ?? ''} />
      </StyledMenuItemLeftContent>
      <div className="hoverable-buttons">
        {showIconButtons && (
          <LightIconButtonGroup iconButtons={iconButtons} size="small" />
        )}
      </div>
      {hasSubMenu && (
        <IconChevronRight
          size={theme.icon.size.sm}
          color={theme.font.color.tertiary}
        />
      )}
    </StyledHoverableMenuItemBase>
  );
};
