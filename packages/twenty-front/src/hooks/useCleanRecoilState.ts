import { apiKeyTokenState } from '@/settings/developers/states/generatedApiKeyTokenState';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

import { isDefined } from '~/utils/isDefined';

export const useCleanRecoilState = () => {
  const isMatchingLocation = useIsMatchingLocation();
  const resetApiKeyToken = useResetRecoilState(apiKeyTokenState);
  const apiKeyToken = useRecoilValue(apiKeyTokenState);
  const cleanRecoilState = () => {
    if (
      !isMatchingLocation(
        `${AppPath.Settings}/${AppPath.Developers}/${SettingsPath.DevelopersApiKeyDetail}`,
      ) &&
      isDefined(apiKeyToken)
    ) {
      resetApiKeyToken();
    }
  };

  return {
    cleanRecoilState,
  };
};
