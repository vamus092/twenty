/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Issuer } from 'openid-client';
import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FindAvailableSSOIDPOutput } from 'src/engine/core-modules/sso/dtos/find-available-SSO-IDP.output';
import {
  SSOException,
  SSOExceptionCode,
} from 'src/engine/core-modules/sso/sso.exception';
import {
  OIDCConfiguration,
  SAMLConfiguration,
  SSOConfiguration,
} from 'src/engine/core-modules/sso/types/SSOConfigurations.type';
import {
  IdentityProviderType,
  OIDCResponseType,
  WorkspaceSSOIdentityProvider,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { User } from 'src/engine/core-modules/user/user.entity';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class SSOService {
  constructor(
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    @InjectRepository(WorkspaceSSOIdentityProvider, 'core')
    private readonly workspaceSSOIdentityProviderRepository: Repository<WorkspaceSSOIdentityProvider>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    private readonly environmentService: EnvironmentService,
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  private async isSSOEnabled(workspaceId: string) {
    const isSSOEnabledFeatureFlag = await this.featureFlagRepository.findOneBy({
      workspaceId,
      key: FeatureFlagKey.IsSSOEnabled,
      value: true,
    });

    if (!isSSOEnabledFeatureFlag?.value) {
      throw new SSOException(
        `${FeatureFlagKey.IsSSOEnabled} feature flag is disabled`,
        SSOExceptionCode.SSO_DISABLE,
      );
    }
  }

  async createOIDCIdentityProvider(
    data: Pick<
      WorkspaceSSOIdentityProvider,
      'issuer' | 'clientID' | 'clientSecret' | 'name'
    >,
    workspaceId: string,
  ) {
    try {
      await this.isSSOEnabled(workspaceId);

      if (!data.issuer) {
        throw new SSOException(
          'Invalid issuer URL',
          SSOExceptionCode.INVALID_ISSUER_URL,
        );
      }

      const issuer = await Issuer.discover(data.issuer);

      if (!issuer.metadata.issuer) {
        throw new SSOException(
          'Invalid issuer URL from discovery',
          SSOExceptionCode.INVALID_ISSUER_URL,
        );
      }

      const identityProvider =
        await this.workspaceSSOIdentityProviderRepository.save({
          type: IdentityProviderType.OIDC,
          clientID: data.clientID,
          clientSecret: data.clientSecret,
          issuer: issuer.metadata.issuer,
          name: data.name,
          workspaceId,
        });

      return {
        id: identityProvider.id,
        type: identityProvider.type,
        name: identityProvider.name,
        status: identityProvider.status,
        issuer: identityProvider.issuer,
      };
    } catch (err) {
      if (err instanceof SSOException) {
        return err;
      }

      return new SSOException(
        'Unknown SSO configuration error',
        SSOExceptionCode.UNKNOWN_SSO_CONFIGURATION_ERROR,
      );
    }
  }

  async createSAMLIdentityProvider(
    data: Pick<
      WorkspaceSSOIdentityProvider,
      'ssoURL' | 'certificate' | 'fingerprint' | 'id'
    >,
    workspaceId: string,
  ) {
    await this.isSSOEnabled(workspaceId);

    const identityProvider =
      await this.workspaceSSOIdentityProviderRepository.save({
        ...data,
        type: IdentityProviderType.SAML,
        workspaceId,
      });

    return {
      id: identityProvider.id,
      type: identityProvider.type,
      name: identityProvider.name,
      issuer: this.buildIssuerURL(identityProvider),
      status: identityProvider.status,
    };
  }

  async findAvailableSSOIdentityProviders(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: [
        'workspaces',
        'workspaces.workspace',
        'workspaces.workspace.workspaceSSOIdentityProviders',
      ],
    });

    if (!user) {
      throw new SSOException('User not found', SSOExceptionCode.USER_NOT_FOUND);
    }

    return user.workspaces.flatMap((userWorkspace) =>
      (
        userWorkspace.workspace
          .workspaceSSOIdentityProviders as Array<SSOConfiguration>
      ).reduce((acc, identityProvider) => {
        if (identityProvider.status === 'Inactive') return acc;

        acc.push({
          id: identityProvider.id,
          name: identityProvider.name ?? 'Unknown',
          issuer: identityProvider.issuer,
          type: identityProvider.type,
          status: identityProvider.status,
          workspace: {
            id: userWorkspace.workspaceId,
            displayName: userWorkspace.workspace.displayName,
          },
        });

        return acc;
      }, [] as Array<FindAvailableSSOIDPOutput>),
    );
  }

  async findSSOIdentityProviderById(identityProviderId?: string) {
    // if identityProviderId is not provide, typeorm return a random idp instead of undefined
    if (!identityProviderId) return undefined;

    return (await this.workspaceSSOIdentityProviderRepository.findOne({
      where: { id: identityProviderId },
    })) as (SSOConfiguration & WorkspaceSSOIdentityProvider) | undefined;
  }

  buildCallbackUrl(
    identityProvider: Pick<WorkspaceSSOIdentityProvider, 'type'>,
  ) {
    const callbackURL = new URL(this.environmentService.get('SERVER_URL'));

    callbackURL.pathname = `/auth/${identityProvider.type.toLowerCase()}/callback`;

    return callbackURL.toString();
  }

  buildIssuerURL(
    identityProvider: Pick<WorkspaceSSOIdentityProvider, 'id' | 'type'>,
  ) {
    return `${this.environmentService.get('SERVER_URL')}/auth/${identityProvider.type.toLowerCase()}/login/${identityProvider.id}`;
  }

  private isOIDCIdentityProvider(
    identityProvider: WorkspaceSSOIdentityProvider,
  ): identityProvider is OIDCConfiguration & WorkspaceSSOIdentityProvider {
    return identityProvider.type === IdentityProviderType.OIDC;
  }

  isSAMLIdentityProvider(
    identityProvider: WorkspaceSSOIdentityProvider,
  ): identityProvider is SAMLConfiguration & WorkspaceSSOIdentityProvider {
    return identityProvider.type === IdentityProviderType.SAML;
  }

  getOIDCClient(
    identityProvider: WorkspaceSSOIdentityProvider,
    issuer: Issuer,
  ) {
    if (!this.isOIDCIdentityProvider(identityProvider)) {
      throw new SSOException(
        'Invalid Identity Provider type',
        SSOExceptionCode.INVALID_IDP_TYPE,
      );
    }

    return new issuer.Client({
      client_id: identityProvider.clientID,
      client_secret: identityProvider.clientSecret,
      redirect_uris: [this.buildCallbackUrl(identityProvider)],
      response_types: [OIDCResponseType.CODE],
    });
  }

  async getAuthorizationUrl(identityProviderId: string) {
    const identityProvider =
      (await this.workspaceSSOIdentityProviderRepository.findOne({
        where: {
          id: identityProviderId,
        },
      })) as WorkspaceSSOIdentityProvider & SSOConfiguration;

    if (!identityProvider) {
      throw new SSOException(
        'Identity Provider not found',
        SSOExceptionCode.USER_NOT_FOUND,
      );
    }

    return {
      id: identityProvider.id,
      authorizationURL: this.buildIssuerURL(identityProvider),
      type: identityProvider.type,
    };
  }

  async listSSOIdentityProvidersByWorkspaceId(workspaceId: string) {
    return (await this.workspaceSSOIdentityProviderRepository.find({
      where: { workspaceId },
      select: ['id', 'name', 'type', 'issuer', 'status'],
    })) as Array<
      Pick<
        WorkspaceSSOIdentityProvider,
        'id' | 'name' | 'type' | 'issuer' | 'status'
      >
    >;
  }

  async deleteSSOIdentityProvider(
    identityProviderId: string,
    workspaceId: string,
  ) {
    const identityProvider =
      await this.workspaceSSOIdentityProviderRepository.findOne({
        where: {
          id: identityProviderId,
          workspaceId,
        },
      });

    if (!identityProvider) {
      throw new SSOException(
        'Identity Provider not found',
        SSOExceptionCode.IDENTITY_PROVIDER_NOT_FOUND,
      );
    }

    await this.workspaceSSOIdentityProviderRepository.delete({
      id: identityProvider.id,
    });

    return { identityProviderId: identityProvider.id };
  }

  async editSSOIdentityProvider(
    payload: Partial<WorkspaceSSOIdentityProvider>,
    workspaceId: string,
  ) {
    const ssoIdp = await this.workspaceSSOIdentityProviderRepository.findOne({
      where: {
        id: payload.id,
        workspaceId,
      },
    });

    if (!ssoIdp) {
      throw new SSOException(
        'Identity Provider not found',
        SSOExceptionCode.IDENTITY_PROVIDER_NOT_FOUND,
      );
    }

    const result = await this.workspaceSSOIdentityProviderRepository.save({
      ...ssoIdp,
      ...payload,
    });

    return {
      id: result.id,
      type: result.type,
      issuer: result.issuer,
      name: result.name,
      status: result.status,
    };
  }
}
