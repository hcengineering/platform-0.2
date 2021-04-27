import { Status } from '@anticrm/sparkling-controls';

export default {
  title: 'Controls/Status',
  component: Status,
  argTypes: {
    severity: {
      control: { type: 'select', options: ['OK', 'INFO', 'WARNING', 'ERROR'] }
    },
    message: { control: 'text' },
    width: { control: 'text' },
  },
};

const Template = ({ ...args }) => ({
  Component: Status,
  props: args,
});

export const DefaultEmpty = Template.bind({});
DefaultEmpty.args = {
  message: 'This is a little error message that tells more about the error'
};

export const OKWidth300px = Template.bind({});
OKWidth300px.args = {
  severity: 'OK',
  width: '300px',
  message: 'This is a little error message that tells more about the error'
};

export const Error = Template.bind({});
Error.args = {
  severity: 'ERROR',
  message: 'This is a little error message that tells more about the error'
};
