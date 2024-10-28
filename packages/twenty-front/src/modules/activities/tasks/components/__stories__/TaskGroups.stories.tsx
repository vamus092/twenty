import { Meta, StoryObj } from '@storybook/react';

import { TaskGroups } from '@/activities/tasks/components/TaskGroups';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { ObjectFilterDropdownScope } from '@/object-record/object-filter-dropdown/scopes/ObjectFilterDropdownScope';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedTasks } from '~/testing/mock-data/tasks';

const meta: Meta<typeof TaskGroups> = {
  title: 'Modules/Activity/TaskGroups',
  component: TaskGroups,
  decorators: [
    (Story) => (
      <ObjectFilterDropdownScope filterScopeId="entity-tasks-filter-scope">
        <Story />
      </ObjectFilterDropdownScope>
    ),
    ComponentWithRouterDecorator,
    ComponentWithRecoilScopeDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof TaskGroups>;

export const Empty: Story = {};

export const WithTasks: Story = {
  args: {
    targetableObjects: [
      {
        id: mockedTasks[0].taskTargets?.[0].personId,
        targetObjectNameSingular: 'person',
      },
    ] as ActivityTargetableObject[],
  },
  parameters: {
    msw: graphqlMocks,
    container: {
      width: '500px',
    },
  },
};
