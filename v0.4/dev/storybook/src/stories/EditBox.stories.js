import { EditBox } from '@anticrm/sparkling-controls';

export default {
  title: 'Controls/EditBox',
  component: EditBox,
  argTypes: {
    label: { control: 'text' },
    width: { control: 'text' },
    value: { control: 'text' },
    password: { control: 'boolean' },
    id: { control: 'text' },
  },
};

const Template = ({ ...args }) => ({
  Component: EditBox,
  props: args,
});

export const Default = Template.bind({});
Default.args = {
};

export const Labeled = Template.bind({});
Labeled.args = {
  label: 'Placeholder'
};

export const LabeledWidth300px = Template.bind({});
LabeledWidth300px.args = {
  label: 'Placeholder',
  width: '300px'
};

export const PasswordWithPlaceholder = Template.bind({});
PasswordWithPlaceholder.args = {
  password: true,
  label: 'Enter your password'
};
