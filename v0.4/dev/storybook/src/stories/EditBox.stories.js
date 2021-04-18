import { EditBox } from '@anticrm/sparkling-controls';

export default {
  title: 'Controls/EditBox',
  component: EditBox,
  argTypes: {
    label: { control: 'text' },
    width: { control: 'text' },
    value: { control: 'text' },
    placeholder: { control: 'text' },
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
  label: 'Label'
};

export const LabeledWithPlaceholder = Template.bind({});
LabeledWithPlaceholder.args = {
  label: 'Label',
  placeholder: 'Placeholder'
};

export const LabeledWithValue = Template.bind({});
LabeledWithValue.args = {
  label: 'Label',
  value: 'Text'
};

export const LabeledWithValueWidth300px = Template.bind({});
LabeledWithValueWidth300px.args = {
  label: 'Label',
  value: 'Text',
  width: '300px'
};

export const PasswordWithPlaceholder = Template.bind({});
PasswordWithPlaceholder.args = {
  password: true,
  placeholder: 'Password'
};
