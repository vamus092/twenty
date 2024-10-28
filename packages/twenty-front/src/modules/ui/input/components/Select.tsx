import styled from '@emotion/styled';
import { MouseEvent, useMemo, useRef, useState } from 'react';
import { IconComponent } from 'twenty-ui';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

import { SelectControl } from '@/ui/input/components/SelectControl';
import { isDefined } from '~/utils/isDefined';
import { SelectHotkeyScope } from '../types/SelectHotkeyScope';

export type SelectOption<Value extends string | number | null> = {
  value: Value;
  label: string;
  Icon?: IconComponent;
};

type CallToActionButton = {
  text: string;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  Icon?: IconComponent;
};

export type SelectProps<Value extends string | number | null> = {
  className?: string;
  disabled?: boolean;
  disableBlur?: boolean;
  dropdownId: string;
  dropdownWidth?: `${string}px` | 'auto' | number;
  emptyOption?: SelectOption<Value>;
  fullWidth?: boolean;
  label?: string;
  onChange?: (value: Value) => void;
  onBlur?: () => void;
  options: SelectOption<Value>[];
  value?: Value;
  withSearchInput?: boolean;
  callToActionButton?: CallToActionButton;
};

const StyledContainer = styled.div<{ fullWidth?: boolean }>`
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  display: block;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

export const Select = <Value extends string | number | null>({
  className,
  disabled: disabledFromProps,
  disableBlur = false,
  dropdownId,
  dropdownWidth = 176,
  emptyOption,
  fullWidth,
  label,
  onChange,
  onBlur,
  options,
  value,
  withSearchInput,
  callToActionButton,
}: SelectProps<Value>) => {
  const selectContainerRef = useRef<HTMLDivElement>(null);

  const [searchInputValue, setSearchInputValue] = useState('');

  const selectedOption =
    options.find(({ value: key }) => key === value) ||
    emptyOption ||
    options[0];
  const filteredOptions = useMemo(
    () =>
      searchInputValue
        ? options.filter(({ label }) =>
            label.toLowerCase().includes(searchInputValue.toLowerCase()),
          )
        : options,
    [options, searchInputValue],
  );

  const isDisabled =
    disabledFromProps ||
    (options.length <= 1 && !isDefined(callToActionButton));

  const { closeDropdown } = useDropdown(dropdownId);

  return (
    <StyledContainer
      className={className}
      fullWidth={fullWidth}
      tabIndex={0}
      onBlur={onBlur}
      ref={selectContainerRef}
    >
      {!!label && <StyledLabel>{label}</StyledLabel>}
      {isDisabled ? (
        <SelectControl
          selectedOption={selectedOption}
          isDisabled={isDisabled}
        />
      ) : (
        <Dropdown
          dropdownId={dropdownId}
          dropdownMenuWidth={dropdownWidth}
          dropdownPlacement="bottom-start"
          clickableComponent={
            <SelectControl
              selectedOption={selectedOption}
              isDisabled={isDisabled}
            />
          }
          disableBlur={disableBlur}
          dropdownComponents={
            <>
              {!!withSearchInput && (
                <DropdownMenuSearchInput
                  autoFocus
                  value={searchInputValue}
                  onChange={(event) => setSearchInputValue(event.target.value)}
                />
              )}
              {!!withSearchInput && !!filteredOptions.length && (
                <DropdownMenuSeparator />
              )}
              {!!filteredOptions.length && (
                <DropdownMenuItemsContainer hasMaxHeight>
                  {filteredOptions.map((option) => (
                    <MenuItem
                      key={option.value}
                      LeftIcon={option.Icon}
                      text={option.label}
                      onClick={() => {
                        onChange?.(option.value);
                        onBlur?.();
                        closeDropdown();
                      }}
                    />
                  ))}
                </DropdownMenuItemsContainer>
              )}
              {!!callToActionButton && !!filteredOptions.length && (
                <DropdownMenuSeparator />
              )}
              {!!callToActionButton && (
                <DropdownMenuItemsContainer hasMaxHeight>
                  <MenuItem
                    onClick={callToActionButton.onClick}
                    LeftIcon={callToActionButton.Icon}
                    text={callToActionButton.text}
                  />
                </DropdownMenuItemsContainer>
              )}
            </>
          }
          dropdownHotkeyScope={{ scope: SelectHotkeyScope.Select }}
        />
      )}
    </StyledContainer>
  );
};
