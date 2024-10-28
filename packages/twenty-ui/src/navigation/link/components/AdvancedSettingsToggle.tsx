import styled from '@emotion/styled';
import { IconTool } from '@ui/display';
import { Toggle } from '@ui/input';
import { MAIN_COLORS } from '@ui/theme';
import { useId } from 'react';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  width: 100%;
  gap: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledIconContainer = styled.div`
  border-right: 1px solid ${MAIN_COLORS.yellow};
  height: 16px;
  position: absolute;
  left: ${({ theme }) => theme.spacing(-5)};
`;

const StyledToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const StyledIconTool = styled(IconTool)`
  margin-right: ${({ theme }) => theme.spacing(0.5)};
`;

type AdvancedSettingsToggleProps = {
  isAdvancedModeEnabled: boolean;
  setIsAdvancedModeEnabled: (enabled: boolean) => void;
};

export const AdvancedSettingsToggle = ({
  isAdvancedModeEnabled,
  setIsAdvancedModeEnabled,
}: AdvancedSettingsToggleProps) => {
  const onChange = (newValue: boolean) => {
    setIsAdvancedModeEnabled(newValue);
  };
  const inputId = useId();

  return (
    <StyledContainer>
      <StyledIconContainer>
        <StyledIconTool size={12} color={MAIN_COLORS.yellow} />
      </StyledIconContainer>
      <StyledToggleContainer>
        <StyledLabel htmlFor={inputId}>Advanced:</StyledLabel>

        <Toggle
          id={inputId}
          onChange={onChange}
          color={MAIN_COLORS.yellow}
          value={isAdvancedModeEnabled}
        />
      </StyledToggleContainer>
    </StyledContainer>
  );
};
