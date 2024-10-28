import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  IconArchive,
  IconDotsVertical,
  IconPencil,
  LightIconButton,
  useIcons,
} from 'twenty-ui';

import { useLastVisitedObjectMetadataItem } from '@/navigation/hooks/useLastVisitedObjectMetadataItem';
import { useLastVisitedView } from '@/navigation/hooks/useLastVisitedView';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsSummaryCard } from '@/settings/components/SettingsSummaryCard';
import { SettingsDataModelObjectTypeTag } from '@/settings/data-model/objects/components/SettingsDataModelObjectTypeTag';
import { getObjectTypeLabel } from '@/settings/data-model/utils/getObjectTypeLabel';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

type SettingsObjectSummaryCardProps = {
  objectMetadataItem: ObjectMetadataItem;
  iconKey?: string;
  name: string;
  onDeactivate: () => void;
  onEdit: () => void;
};

const StyledObjectTypeTag = styled(SettingsDataModelObjectTypeTag)`
  box-sizing: border-box;
  height: ${({ theme }) => theme.spacing(6)};
`;

const dropdownId = 'settings-object-edit-about-menu-dropdown';

export const SettingsObjectSummaryCard = ({
  objectMetadataItem,
  iconKey = '',
  name,
  onDeactivate,
  onEdit,
}: SettingsObjectSummaryCardProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const Icon = getIcon(iconKey);
  const objectMetadataItemId = objectMetadataItem.id;

  const { closeDropdown } = useDropdown(dropdownId);
  const { setFallbackForLastVisitedView } = useLastVisitedView();
  const { setFallbackForLastVisitedObjectMetadataItem } =
    useLastVisitedObjectMetadataItem();

  const handleEdit = () => {
    onEdit();
    closeDropdown();
  };

  const handleDeactivate = () => {
    setFallbackForLastVisitedObjectMetadataItem(objectMetadataItemId);
    setFallbackForLastVisitedView(objectMetadataItemId);
    onDeactivate();
    closeDropdown();
  };

  const objectTypeLabel = getObjectTypeLabel(objectMetadataItem);

  return (
    <SettingsSummaryCard
      title={
        <>
          {!!Icon && <Icon size={theme.icon.size.md} />}
          {name}
        </>
      }
      rightComponent={
        <>
          <StyledObjectTypeTag objectTypeLabel={objectTypeLabel} />
          <Dropdown
            dropdownId={dropdownId}
            clickableComponent={
              <LightIconButton
                aria-label="Object Options"
                Icon={IconDotsVertical}
                accent="tertiary"
              />
            }
            dropdownComponents={
              <DropdownMenu width="160px">
                <DropdownMenuItemsContainer>
                  <MenuItem
                    text="Edit"
                    LeftIcon={IconPencil}
                    onClick={handleEdit}
                  />
                  <MenuItem
                    text="Deactivate"
                    LeftIcon={IconArchive}
                    onClick={handleDeactivate}
                  />
                </DropdownMenuItemsContainer>
              </DropdownMenu>
            }
            dropdownHotkeyScope={{
              scope: dropdownId,
            }}
          />
        </>
      }
    />
  );
};
