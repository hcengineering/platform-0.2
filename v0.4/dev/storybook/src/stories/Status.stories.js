import { StatusComponent } from '@anticrm/sparkling-controls';
import { Severity } from '@anticrm/status';

export default {
  title: 'Controls/StatusComponent',
  component: StatusComponent,
  argTypes: {
    severity: {
      control: { type: 'select', options: [Severity.OK, Severity.INFO, Severity.WARNING, Severity.ERROR] }
    },
    message: { control: 'text' },
    width: { control: 'text' },
  },
};

const Template = ({ ...args }) => ({
  Component: StatusComponent,
  props: {
    status: { severity: args.severity, code: 0, message: args.message},
    width: args.width,
  }
});

export const DefaultEmpty = Template.bind({});
DefaultEmpty.args = {
  message: 'This is a little error message that tells more about the error'
};

export const OKWidth300px = Template.bind({});
OKWidth300px.args = {
  severity: Severity.OK,
  width: '300px',
  message: 'This is a little error message that tells more about the error'
};

export const Error = Template.bind({});
Error.args = {
  severity: Severity.ERROR,
  message: 'This is a little error message that tells more about the error'
};
