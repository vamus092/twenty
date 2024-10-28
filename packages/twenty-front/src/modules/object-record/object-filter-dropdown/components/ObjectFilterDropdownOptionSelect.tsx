import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { v4 } from 'uuid';

import { FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { useOptionsForSelect } from '@/object-record/object-filter-dropdown/hooks/useOptionsForSelect';
import { MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID } from '@/object-record/relation-picker/constants/MultiObjectRecordSelectSelectableListId';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableListStates } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListStates';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemMultiSelect } from '@/ui/navigation/menu-item/components/MenuItemMultiSelect';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isDefined } from '~/utils/isDefined';

export const EMPTY_FILTER_VALUE = '';
export const MAX_OPTIONS_TO_DISPLAY = 3;

type SelectOptionForFilter = FieldMetadataItemOption & {
  isSelected: boolean;
};

export const ObjectFilterDropdownOptionSelect = () => {
  const {
    filterDefinitionUsedInDropdownState,
    objectFilterDropdownSearchInputState,
    selectedOperandInDropdownState,
    objectFilterDropdownSelectedOptionValuesState,
    selectedFilterState,
    selectFilter,
  } = useFilterDropdown();

  const { closeDropdown } = useDropdown();

  const { selectedItemIdState } = useSelectableListStates({
    selectableListScopeId: MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID,
  });

  const { resetSelectedItem } = useSelectableList(
    MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID,
  );

  const selectedItemId = useRecoilValue(selectedItemIdState);
  const filterDefinitionUsedInDropdown = useRecoilValue(
    filterDefinitionUsedInDropdownState,
  );
  const selectedOperandInDropdown = useRecoilValue(
    selectedOperandInDropdownState,
  );
  const objectFilterDropdownSearchInput = useRecoilValue(
    objectFilterDropdownSearchInputState,
  );
  const objectFilterDropdownSelectedOptionValues = useRecoilValue(
    objectFilterDropdownSelectedOptionValuesState,
  );

  const selectedFilter = useRecoilValue(selectedFilterState);

  const fieldMetaDataId = filterDefinitionUsedInDropdown?.fieldMetadataId ?? '';

  const { selectOptions } = useOptionsForSelect(fieldMetaDataId);

  const [selectableOptions, setSelectableOptions] = useState<
    SelectOptionForFilter[]
  >([]);

  useEffect(() => {
    if (isDefined(selectOptions)) {
      const options = selectOptions.map((option) => {
        const isSelected =
          objectFilterDropdownSelectedOptionValues?.includes(option.value) ??
          false;

        return {
          ...option,
          isSelected,
        };
      });

      setSelectableOptions(options);
    }
  }, [objectFilterDropdownSelectedOptionValues, selectOptions]);

  useScopedHotkeys(
    [Key.Escape],
    () => {
      closeDropdown();
      resetSelectedItem();
    },
    RelationPickerHotkeyScope.RelationPicker,
    [closeDropdown, resetSelectedItem],
  );

  const handleMultipleOptionSelectChange = (
    optionChanged: SelectOptionForFilter,
    isSelected: boolean,
  ) => {
    if (!selectOptions) {
      return;
    }

    const newSelectableOptions = selectableOptions.map((option) =>
      option.id === optionChanged.id ? { ...option, isSelected } : option,
    );

    setSelectableOptions(newSelectableOptions);

    const selectedOptions = newSelectableOptions.filter(
      (option) => option.isSelected,
    );

    const filterDisplayValue =
      selectedOptions.length > MAX_OPTIONS_TO_DISPLAY
        ? `${selectedOptions.length} options`
        : selectedOptions.map((option) => option.label).join(', ');

    if (
      isDefined(filterDefinitionUsedInDropdown) &&
      isDefined(selectedOperandInDropdown)
    ) {
      const newFilterValue =
        selectedOptions.length > 0
          ? JSON.stringify(selectedOptions.map((option) => option.value))
          : EMPTY_FILTER_VALUE;

      selectFilter({
        id: selectedFilter?.id ? selectedFilter.id : v4(),
        definition: filterDefinitionUsedInDropdown,
        operand: selectedOperandInDropdown,
        displayValue: filterDisplayValue,
        fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
        value: newFilterValue,
        viewFilterGroupId: selectedFilter?.viewFilterGroupId,
      });
    }
    resetSelectedItem();
  };

  const optionsInDropdown = selectableOptions?.filter((option) =>
    option.label
      .toLowerCase()
      .includes(objectFilterDropdownSearchInput.toLowerCase()),
  );

  const showNoResult = optionsInDropdown?.length === 0;
  const objectRecordsIds = optionsInDropdown.map((option) => option.id);

  return (
    <SelectableList
      selectableListId={MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID}
      selectableItemIdArray={objectRecordsIds}
      hotkeyScope={RelationPickerHotkeyScope.RelationPicker}
      onEnter={(itemId) => {
        const option = optionsInDropdown.find((option) => option.id === itemId);
        if (isDefined(option)) {
          handleMultipleOptionSelectChange(option, !option.isSelected);
        }
      }}
    >
      <DropdownMenuItemsContainer hasMaxHeight>
        {optionsInDropdown?.map((option) => (
          <MenuItemMultiSelect
            key={option.id}
            selected={option.isSelected}
            isKeySelected={option.id === selectedItemId}
            onSelectChange={(selected) =>
              handleMultipleOptionSelectChange(option, selected)
            }
            text={option.label}
            color={option.color}
            className=""
          />
        ))}
      </DropdownMenuItemsContainer>
      {showNoResult && <MenuItem text="No result" />}
    </SelectableList>
  );
};
