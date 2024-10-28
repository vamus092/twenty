import { Logger } from '@nestjs/common/services/logger.service';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { buildCreatedByFromWorkspaceMember } from 'src/engine/core-modules/actor/utils/build-created-by-from-workspace-member.util';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import {
  ActorMetadata,
  FieldActorSource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

type CustomWorkspaceItem = Omit<
  CustomWorkspaceEntity,
  'createdAt' | 'updatedAt'
> & {
  createdAt: string;
  updatedAt: string;
};

@WorkspaceQueryHook(`*.createMany`)
export class CreatedByPreQueryHook implements WorkspaceQueryHookInstance {
  private readonly logger = new Logger(CreatedByPreQueryHook.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: CreateManyResolverArgs<CustomWorkspaceItem>,
  ): Promise<CreateManyResolverArgs<CustomWorkspaceItem>> {
    let createdBy: ActorMetadata | null = null;

    // TODO: Once all objects have it, we can remove this check
    const createdByFieldMetadata = await this.fieldMetadataRepository.findOne({
      where: {
        object: {
          nameSingular: objectName,
        },
        name: 'createdBy',
        workspaceId: authContext.workspace.id,
      },
    });

    if (!createdByFieldMetadata) {
      return payload;
    }

    // If user is logged in, we use the workspace member
    if (authContext.workspaceMemberId && authContext.user) {
      createdBy = buildCreatedByFromWorkspaceMember(
        authContext.workspaceMemberId,
        authContext.user,
      );
      // TODO: remove that code once we have the workspace member id in all tokens
    } else if (authContext.user) {
      this.logger.warn("User doesn't have a workspace member id in the token");
      const workspaceMemberRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
          authContext.workspace.id,
          'workspaceMember',
        );

      const workspaceMember = await workspaceMemberRepository.findOne({
        where: {
          userId: authContext.user?.id,
        },
      });

      if (!workspaceMember) {
        throw new Error(
          `Workspace member can't be found for user ${authContext.user.id}`,
        );
      }

      createdBy = {
        source: FieldActorSource.MANUAL,
        workspaceMemberId: workspaceMember.id,
        name: `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`,
      };
    }

    if (authContext.apiKey) {
      createdBy = {
        source: FieldActorSource.API,
        name: authContext.apiKey.name,
      };
    }

    for (const datum of payload.data) {
      // Front-end can fill the source field
      if (createdBy && (!datum.createdBy || !datum.createdBy?.name)) {
        datum.createdBy = {
          ...createdBy,
          source: datum.createdBy?.source ?? createdBy.source,
        };
      }
    }

    return payload;
  }
}
