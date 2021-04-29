import { Button } from '@anticrm/sparkling-controls';

export default {
  title: 'Controls/Button',
  component: Button,
  argTypes: {
    label: { control: 'text' },
    primary: { control: 'boolean' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    width: { control: 'text' },
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

export const Secondary300px = Template.bind({});
Secondary300px.args = {
  label: 'Button',
  width: '300px'
};

export const SecondaryDisabled = Template.bind({});
SecondaryDisabled.args = {
  label: 'Button',
  disabled: true
};

export const Primary = Template.bind({});
Primary.args = {
  label: 'Button',
  primary: true
};

export const PrimaryFullWidth = Template.bind({});
PrimaryFullWidth.args = {
  label: 'Button',
  primary: true,
  width: '100%'
};

export const PrimaryLoading = Template.bind({});
PrimaryLoading.args = {
  loading: true
};
