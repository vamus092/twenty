/* @license Enterprise */

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsRadioCardContainer } from '@/settings/components/SettingsRadioCardContainer';
import { SettingsSSOOIDCForm } from '@/settings/security/components/SettingsSSOOIDCForm';
import { SettingsSSOSAMLForm } from '@/settings/security/components/SettingsSSOSAMLForm';
import { SettingSecurityNewSSOIdentityFormValues } from '@/settings/security/types/SSOIdentityProvider';
import { TextInput } from '@/ui/input/components/TextInput';
import { Section } from '@/ui/layout/section/components/Section';
import styled from '@emotion/styled';
import { ReactElement } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { H2Title, IconComponent, IconKey } from 'twenty-ui';
import { IdpType } from '~/generated/graphql';

const StyledInputsContainer = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2, 4)};
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    'input-1 input-1'
    'input-2 input-3'
    'input-4 input-5';

  & :first-of-type {
    grid-area: input-1;
  }
`;

export const SettingsSSOIdentitiesProvidersForm = () => {
  const { control, getValues } =
    useFormContext<SettingSecurityNewSSOIdentityFormValues>();

  const IdpMap: Record<
    IdpType,
    {
      form: ReactElement;
      option: {
        Icon: IconComponent;
        title: string;
        value: string;
        description: string;
      };
    }
  > = {
    OIDC: {
      option: {
        Icon: IconKey,
        title: 'OIDC',
        value: 'OIDC',
        description: '',
      },
      form: <SettingsSSOOIDCForm />,
    },
    SAML: {
      option: {
        Icon: IconKey,
        title: 'SAML',
        value: 'SAML',
        description: '',
      },
      form: <SettingsSSOSAMLForm />,
    },
  };

  const getFormByType = (type: Uppercase<IdpType> | undefined) => {
    switch (type) {
      case IdpType.Oidc:
        return IdpMap.OIDC.form;
      case IdpType.Saml:
        return IdpMap.SAML.form;
      default:
        return null;
    }
  };

  return (
    <SettingsPageContainer>
      <Section>
        <H2Title title="Name" description="The name of your connection" />
        <StyledInputsContainer>
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                autoComplete="off"
                label="Name"
                value={value}
                onChange={onChange}
                fullWidth
                placeholder="Google OIDC"
              />
            )}
          />
        </StyledInputsContainer>
      </Section>
      <Section>
        <H2Title
          title="Type"
          description="Choose between OIDC and SAML protocols"
        />
        <StyledInputsContainer>
          <Controller
            name="type"
            control={control}
            render={({ field: { onChange, value } }) => (
              <SettingsRadioCardContainer
                value={value}
                options={Object.values(IdpMap).map(
                  (identityProviderType) => identityProviderType.option,
                )}
                onChange={onChange}
              />
            )}
          />
        </StyledInputsContainer>
      </Section>
      {getFormByType(getValues().type)}
    </SettingsPageContainer>
  );
};

export default SettingsSSOIdentitiesProvidersForm;
