import CheckBox from './CheckBox.svelte'
import ThemeDecorator from '../ThemeDecorator.svelte'

export default {
  title: 'Platform/CheckBox',
  component: CheckBox,
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    toRight: { control: 'boolean' },
    editable: { control: 'boolean' },
    fullWidth: { control: 'boolean' }
  },
  parameters: {
    backgrounds: {
      values: [
        { name: 'light', value: '#fff' },
        { name: 'dark', value: '#1E1E1E' },
        { name: 'biege', value: '#FDF1E6' }
      ]
    }
  },
  decorators: [(storyFn) => {
    const story = storyFn()

    return {
      Component: ThemeDecorator,
      props: {
        child: story.Component,
        props: story.props
      }
    }
  }]
}

const Template = ({ ...args }) => ({
  Component: CheckBox,
  props: { ...args }
})

export const Default = Template.bind({})
Default.args = {
  label: 'Label for CheckBox'
}

export const Checked = Template.bind({})
Checked.args = {
  label: 'Label for CheckBox',
  checked: true
}

export const toRight = Template.bind({})
toRight.args = {
  label: 'Label for CheckBox',
  toRight: true,
  fullWidth: false
}

export const toRightFullWidth = Template.bind({})
toRightFullWidth.args = {
  label: 'Label for CheckBox',
  toRight: true,
  fullWidth: true
}
