import { EditBox } from '@anticrm/sparkling-controls';

export default {
  title: 'Controls/EditBox',
  component: EditBox,
  argTypes: {
    label: { control: 'text' },
    width: { control: 'text' },
    value: { control: 'text' },
    password: { control: 'boolean' },
    error: { control: 'text' },
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

export const Labeled300px = Template.bind({});
Labeled300px.args = {
  label: 'Placeholder',
  width: '300px'
};

export const LabeledError = Template.bind({});
LabeledError.args = {
  label: 'Placeholder',
  error: 'Error text goes here'
};

export const LabeledPassword = Template.bind({});
LabeledPassword.args = {
  password: true,
  label: 'Enter your password'
};
