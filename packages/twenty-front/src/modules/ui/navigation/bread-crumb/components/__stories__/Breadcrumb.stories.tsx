import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator, Breadcrumb } from 'twenty-ui';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

const meta: Meta<typeof Breadcrumb> = {
  title: 'UI/Navigation/Breadcrumb/Breadcrumb',
  component: Breadcrumb,
  decorators: [ComponentDecorator, ComponentWithRouterDecorator],
  args: {
    links: [
      { children: 'Objects', href: '/link-1' },
      { children: 'Companies', href: '/link-2' },
      { children: 'New' },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {};
