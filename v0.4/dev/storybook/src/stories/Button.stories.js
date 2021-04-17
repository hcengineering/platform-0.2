
import { Button } from '@anticrm/sparkling-controls';

export default {
  title: 'Controls/Button',
  component: Button,
  argTypes: {
    label: { control: 'text' },
    primary: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    onClick: { action: 'onClick' },
  },
};

const Template = ({ onClick, ...args }) => ({
  Component: Button,
  props: args,
  on: {
    click: onClick,
  },
});

export const Secondary = Template.bind({});
Secondary.args = {
  label: 'Button'
};

export const Primary = Template.bind({});
Primary.args = {
  ...Secondary.args,
  primary: true
};

export const FullWidth = Template.bind({});
FullWidth.args = {
  ...Secondary.args,
  fullWidth: true
};

export const FullWidthAndPrimary = Template.bind({});
FullWidthAndPrimary.args = {
  ...Secondary.args,
  primary: true,
  fullWidth: true
};
